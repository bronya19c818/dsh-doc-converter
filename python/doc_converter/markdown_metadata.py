"""Render final metadata with Pandoc's native Markdown and DOCX custom styles."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from doc_converter.docx_postprocess import _keyword_text, _strip_metadata_label
from doc_converter.docx_styles import ROLE_TO_STYLE_ID

_READER = "gfm+footnotes+tex_math_dollars+raw_html+subscript+superscript"


def write_metadata_filter(metadata: dict[str, Any], work_dir: Path) -> Path | None:
    """Build one native Pandoc filter; role selection has already finished."""
    entries: list[tuple[str, str, str, str]] = []
    for key, role in (
        ("title", "document-title"), ("subtitle", "document-subtitle"),
        ("organization", "organization-department"), ("department", "organization-department"),
        ("authors", "author"), ("date", "date"),
    ):
        value = metadata.get(key)
        if key == "authors" and isinstance(value, list):
            value = "、".join(str(author) for author in value)
        if isinstance(value, str) and value.strip():
            entries.append((ROLE_TO_STYLE_ID[role], value, "", ""))
    for key, label in (("abstract", "摘要："), ("keywords", "关键词：")):
        value = (_keyword_text(metadata.get(key)) if key == "keywords"
                 else _strip_metadata_label(metadata.get(key), "摘要"))
        if value:
            entries.append((ROLE_TO_STYLE_ID[f"{key}-label"], value, label,
                            ROLE_TO_STYLE_ID[f"{key}-content"]))
    if not entries:
        return None
    rows = ",\n".join(
        "  {" + ", ".join(_lua_literal(value) for value in entry) + "}"
        for entry in entries
    )
    script = "local entries = {\n" + rows + "\n}\nlocal reader = " + _lua_literal(_READER) + "\n"
    script += """
function Pandoc(doc)
  local result = {}
  for _, entry in ipairs(entries) do
    local blocks = pandoc.read(entry[2], reader).blocks
    if entry[4] ~= '' then
      for index, block in ipairs(blocks) do
        if block.t == 'Para' or block.t == 'Plain' then
          block.content = {
            pandoc.Span(block.content, pandoc.Attr('', {}, {{'custom-style', entry[4]}}))
          }
          blocks[index] = block
        end
      end
    end
    if entry[3] ~= '' then
      local first = blocks[1]
      if first and (first.t == 'Para' or first.t == 'Plain') then
        table.insert(first.content, 1, pandoc.Str(entry[3]))
        blocks[1] = first
      else
        table.insert(blocks, 1, pandoc.Para({pandoc.Str(entry[3])}))
      end
    end
    table.insert(result, pandoc.Div(
      blocks, pandoc.Attr('', {}, {{'custom-style', entry[1]}})
    ))
  end
  for _, block in ipairs(doc.blocks) do
    table.insert(result, block)
  end
  return pandoc.Pandoc(result, doc.meta)
end
"""
    path = work_dir / "metadata.lua"
    path.write_text(script, encoding="utf-8")
    return path


def _lua_literal(value: str) -> str:
    equals = ""
    while "]" + equals + "]" in value:
        equals += "="
    return "[" + equals + "[" + value + "]" + equals + "]"
