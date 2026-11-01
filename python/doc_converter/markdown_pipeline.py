"""One-pass plugin Markdown role decisions, independent of HTTP and browser state."""

from __future__ import annotations

import re
from typing import Any

from doc_converter.markdown_preprocess import (
    _close_unterminated_comments,
    _separate_table_blocks,
)
from doc_converter.normalizer import (
    NormalizedDocument,
    _extract_front_matter,
    _infer_title_area_role,
    _integrity_inventory,
    _is_date_candidate,
    _is_subtitle_candidate,
    _leading_metadata_barrier,
    _normalize_metadata,
    _serialize_front_matter,
    normalize_markdown,
)

AUTO_APPLY_THRESHOLD = 0.80
_HEADING = re.compile(r"^(#{1,6})\s+(.+?)\s*$")
_NUMBERED = re.compile(r"^(?:#{1,6}\s+)?(?:[一二三四五六七八九十百千万]+[、.．)]|[（(][^）)]+[）)]|\d+[.、)])")
_LABEL = re.compile(
    r"^\s*(文档标题|标题|副标题|摘要|关键词|作者单位|作者|单位|机构|组织|部门|所属部门|日期|时间|发布时间)\s*[:：]\s*(.*)$"
)
_LABEL_KEYS = {
    "文档标题": "title", "标题": "title", "副标题": "subtitle",
    "摘要": "abstract", "关键词": "keywords", "作者": "authors",
    "作者单位": "organization", "单位": "organization", "机构": "organization",
    "组织": "organization", "部门": "department", "所属部门": "department",
    "日期": "date", "时间": "date", "发布时间": "date",
}
_ROLES = {"title": "document-title", "subtitle": "document-subtitle", "authors": "author"}


def normalize_plugin_markdown(source: str, *, filename: str) -> NormalizedDocument:
    """Decide title-area roles once; later normalization and rendering only execute."""
    raw_metadata, lines, first_line = _extract_front_matter(source)
    # Close a dangling HTML comment before deciding roles. Pandoc would treat
    # everything after it as commented out and drop the rest of the document.
    closed_lines, _, closed_count = _close_unterminated_comments(
        lines, list(range(first_line, first_line + len(lines)))
    )
    comment_changes: list[dict[str, Any]] = (
        [{"to": "close-html-comment", "count": closed_count}] if closed_count else []
    )
    lines = closed_lines
    # Separate a caption line from the table header it sits above, so GFM can
    # still read the table as a table after role decisions are made.
    lines, _, table_breaks = _separate_table_blocks(
        lines, list(range(first_line, first_line + len(lines)))
    )
    table_changes: list[dict[str, Any]] = (
        [{"to": "separate-table-block", "count": table_breaks}] if table_breaks else []
    )
    metadata = _normalize_metadata(raw_metadata)
    explicit_keys = set(metadata)
    consumed: set[int] = set()
    decisions: list[dict[str, Any]] = [
        {"line": 0, "role": _ROLES.get(key, key), "score": 1.0,
         "action": "explicit", "reason": "输入 Front Matter 优先", "value": value}
        for key, value in metadata.items()
    ]
    barrier = _leading_metadata_barrier(lines)
    title_seen = bool(metadata.get("title"))
    index = 0
    while index < barrier:
        text = lines[index].strip()
        if not text:
            index += 1
            continue
        if _NUMBERED.match(text):
            break
        heading = _HEADING.match(text)
        if heading and len(heading.group(1)) > 1:
            break
        plain = heading.group(2).strip() if heading else text
        label = _LABEL.match(plain)
        key: str | None = None
        value = plain
        score = 0.0
        reason = ""
        end = index + 1
        if label and _LABEL_KEYS[label.group(1)] != "title":
            # Labelled non-title blocks (摘要/关键词/作者/单位/日期) can be lifted
            # into the metadata area without misplacing a heading. A
            # hand-written "标题：…" stays in the body: moving it would delete
            # the line from its position and drop any formatting on it.
            key = _LABEL_KEYS[label.group(1)]
            value = label.group(2).strip()
            score = 0.98
            reason = f"明确的{label.group(1)}标签"
            if key in {"abstract", "keywords"}:
                while end < barrier and lines[end].strip():
                    following = lines[end].strip()
                    if _HEADING.match(following) or _LABEL.match(following):
                        break
                    value += "\n" + following
                    end += 1
        elif label and _LABEL_KEYS[label.group(1)] == "title":
            # A "标题：" label marks the start of the title area, but the line
            # itself is preserved so the reader sees the label where it was.
            if not title_seen and not metadata.get("title"):
                metadata["title"] = label.group(2).strip()
                title_seen = True
                decisions.append({
                    "line": first_line + index, "end_line": first_line + index,
                    "role": "document-title", "score": 0.96, "action": "applied",
                    "reason": "标题标签用于确定文档标题，同时保留正文原行",
                    "value": label.group(2).strip(),
                })
            index = end
            continue
        elif heading and not title_seen:
            key, score, reason = "title", 0.90, "首个无编号标题"
        elif title_seen:
            key = _infer_title_area_role(plain)
            if key is None and _is_date_candidate(plain):
                key = "date"
            if key:
                score = 0.92 if heading and key == "authors" else 0.90
                reason = "标题区署名、单位、部门或日期证据"
            elif _is_subtitle_candidate([plain]):
                key = "subtitle"
                if _followed_by_attribution(lines, index + 1, barrier):
                    score, reason = 0.80, "标题后短行，后续有明确署名上下文"
                else:
                    score, reason = 0.75, "孤立短行，副标题证据不足"
        elif _is_subtitle_candidate([plain]) and _followed_by_attribution(lines, index + 1, barrier):
            key, score, reason = "title", 0.80, "首个短行与后续署名共同支持文档标题"
        if key is None or not value:
            break
        selected = score >= AUTO_APPLY_THRESHOLD and key not in metadata
        action = "applied" if selected else "preserved"
        if key in explicit_keys:
            reason = "输入 Front Matter 已给出该角色，保留输入值和原文"
        elif key in metadata:
            reason = "该角色已有最终决策，保留后续原文"
        decisions.append({
            "line": first_line + index, "end_line": first_line + end - 1,
            "role": _ROLES.get(key, key), "score": score, "action": action,
            "reason": reason, "value": value,
        })
        if selected:
            metadata[key] = _metadata_value(key, value)
            consumed.update(range(index, end))
        if key == "title":
            title_seen = True
        index = end

    body = "\n".join(line for offset, line in enumerate(lines) if offset not in consumed)
    finalized = _serialize_front_matter(metadata, body).rstrip("\n") + "\n"
    # A hand-written ATX outline already names the structure. A bare numbered
    # line inside it competes between "numbered list item" and "numbered
    # sub-heading", so it is scored instead of promoted by a single pattern;
    # documents without ATX headings keep the deterministic outline rules.
    has_atx_outline = any(_HEADING.match(line.strip()) for line in body.splitlines())
    # The body above was already preprocessed line by line; running the
    # preprocessor again on the serialized document would re-merge the code
    # blocks and paragraph breaks the first pass just resolved.
    normalized = normalize_markdown(
        finalized, filename=filename, confirmed_roles={}, infer_metadata=False,
        promote_bare_headings=not has_atx_outline, preprocess=False,
    )
    inventory = _integrity_inventory(source, normalized.markdown)
    normalized_images = inventory.pop("normalized_images")
    normalized_links = inventory.pop("normalized_links")
    inventory["passed"] = (inventory["images"] == normalized_images
                           and inventory["links"] == normalized_links)
    report = dict(normalized.report)
    report.update({
        "decisions": decisions, "auto_apply_threshold": AUTO_APPLY_THRESHOLD,
        "metadata_final": True, "integrity": inventory,
    })
    report["changes"] = comment_changes + table_changes + [
        {"line": item["line"], "to": item["role"], "score": item["score"]}
        for item in decisions if item["action"] == "applied"
    ] + report["changes"]
    return NormalizedDocument(normalized.markdown, report, normalized.metadata)


def _followed_by_attribution(lines: list[str], start: int, barrier: int) -> bool:
    for line in lines[start:barrier]:
        text = line.strip()
        if not text:
            continue
        label = _LABEL.match(text)
        if label and _LABEL_KEYS[label.group(1)] in {"authors", "organization", "department", "date"}:
            return True
        return bool(_infer_title_area_role(text) or _is_date_candidate(text))
    return False


def _metadata_value(key: str, value: str) -> Any:
    if key in {"authors", "keywords"}:
        return [part.strip() for part in re.split(r"[、，,;；\n]+", value) if part.strip()]
    return value
