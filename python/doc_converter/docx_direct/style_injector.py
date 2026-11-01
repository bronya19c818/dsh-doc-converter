"""Incremental insertion of the direct-normalizer style pack into DOCX."""

from __future__ import annotations

from copy import deepcopy
from io import BytesIO
from pathlib import Path
from typing import Any

from docx import Document
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn
from lxml import etree  # type: ignore[import-untyped]

from doc_converter.docx_direct.formatting import protected_field_runs
from doc_converter.docx_direct.ooxml_patch import read_zip_member, write_zip_copy
from doc_converter.docx_direct.protected_format import guarded_style_updates
from doc_converter.docx_direct.role_capabilities import role_capabilities
from doc_converter.docx_styles import (
    NOTE_REFERENCE_STYLE_IDS,
    NOTE_TEXT_STYLE_IDS,
    ROLE_TO_STYLE_ID,
    _add_note_styles,
    compile_styles,
)
from doc_converter.style_library import StylePack

NOTE_STYLE_IDS = tuple(NOTE_TEXT_STYLE_IDS) + tuple(NOTE_REFERENCE_STYLE_IDS)
_NOTE_REFERENCES = (qn("w:footnoteReference"), qn("w:endnoteReference"))


def inject_styles_into_docx(
    source_path: Path,
    style_pack: StylePack,
    output_path: Path,
) -> dict[str, Any]:
    """Upsert supported application-owned styles; preserve other definitions."""

    source_styles = parse_xml(read_zip_member(source_path, "word/styles.xml"))
    original_styles = deepcopy(source_styles)
    compiled_styles = _compiled_style_elements(style_pack)
    existing_ids = _style_ids(source_styles)
    target_ids = set(ROLE_TO_STYLE_ID.values())
    missing_ids = [style_id for style_id in target_ids if style_id not in existing_ids]
    document_root = parse_xml(read_zip_member(source_path, "word/document.xml"))

    inserted_elements = [
        deepcopy(compiled_styles[style_id])
        for style_id in sorted(missing_ids)
        if style_id in compiled_styles
    ]
    # 源包缺少脚注/尾注内置样式时，脚注编号会退回正文样式并丢失上标。
    note_styles = _missing_note_styles(source_styles, document_root)
    inserted_elements.extend(note_styles)
    _insert_styles(source_styles, inserted_elements)
    owned = {ROLE_TO_STYLE_ID[r] for r, c in role_capabilities().items()
             if c["status"] != "out-of-scope" and r in ROLE_TO_STYLE_ID}
    replaced_ids = []
    for existing in list(source_styles.findall(qn("w:style"))):
        sid = existing.get(qn("w:styleId"))
        if sid not in existing_ids or sid not in owned or sid not in compiled_styles:
            continue
        wanted = compiled_styles[sid]
        if etree.tostring(existing, method="c14n") != etree.tostring(wanted, method="c14n"):
            source_styles.replace(existing, deepcopy(wanted))
            replaced_ids.append(sid)
    blocked = guarded_style_updates(document_root, original_styles, source_styles, set(replaced_ids), protected_field_runs(document_root)) if replaced_ids else set()
    original_by_id = {s.get(qn("w:styleId")): s for s in original_styles.findall(qn("w:style"))}
    for style in list(source_styles.findall(qn("w:style"))):
        sid = style.get(qn("w:styleId"))
        if sid in blocked:
            source_styles.replace(style, deepcopy(original_by_id[sid]))
    replaced_ids = [sid for sid in replaced_ids if sid not in blocked]

    replacements: dict[str, bytes] = {}
    if inserted_elements or replaced_ids:
        replacements["word/styles.xml"] = etree.tostring(
            source_styles,
            encoding="UTF-8",
            xml_declaration=True,
        )
    write_zip_copy(source_path, output_path, replacements)

    inserted_ids = [
        style_id
        for style_id in sorted(missing_ids)
        if style_id in compiled_styles
    ]
    note_style_ids = [style.get(qn("w:styleId")) for style in note_styles]
    return {
        "source_path": str(source_path),
        "output_path": str(output_path),
        "inserted_count": len(inserted_ids),
        "inserted_style_ids": inserted_ids,
        "inserted_note_style_ids": note_style_ids,
        "replaced_count": len(replaced_ids),
        "replaced_style_ids": replaced_ids,
        "guarded_style_ids": sorted(blocked),
        "existing_style_count": len(existing_ids),
    }


def _missing_note_styles(source_styles: Any, document_root: Any) -> list[Any]:
    """Compile note styles only when the document actually has footnotes or endnotes."""

    referenced = {node.tag for node in document_root.iter(*_NOTE_REFERENCES)}
    if not referenced:
        return []
    required: list[str] = []
    if qn("w:footnoteReference") in referenced:
        required.extend(("FootnoteText", "FootnoteReference"))
    if qn("w:endnoteReference") in referenced:
        required.extend(("EndnoteText", "EndnoteReference"))
    existing = _style_ids(source_styles)
    missing = [style_id for style_id in required if style_id not in existing]
    if not missing:
        return []
    document = Document()
    _add_note_styles(document)
    buffer = BytesIO()
    document.save(buffer)
    root = parse_xml(_read_buffer_member(buffer.getvalue(), "word/styles.xml"))
    by_id = {style.get(qn("w:styleId")): style for style in root.findall(qn("w:style"))}
    return [deepcopy(by_id[style_id]) for style_id in missing if style_id in by_id]


def _compiled_style_elements(style_pack: StylePack) -> dict[str, Any]:
    document = Document()
    compile_styles(document, style_pack)
    buffer = BytesIO()
    document.save(buffer)
    root = parse_xml(_read_buffer_member(buffer.getvalue(), "word/styles.xml"))
    styles = {
        style_id: style
        for style in root.findall(qn("w:style"))
        if (style_id := style.get(qn("w:styleId"))) in set(ROLE_TO_STYLE_ID.values())
    }
    # Explicit body outline prevents inherited/default heading outlines. These
    # adjustments belong to Direct, not the shared Markdown renderer compiler.
    for role, sid in ROLE_TO_STYLE_ID.items():
        style = styles.get(sid)
        if style is None:
            continue
        if style.get(qn("w:type")) == "paragraph" and not role.startswith("heading-"):
            ppr = style.find(qn("w:pPr"))
            if ppr is None:
                ppr = OxmlElement("w:pPr")
                style.append(ppr)
            outline = OxmlElement("w:outlineLvl")
            outline.set(qn("w:val"), "9")
            ppr.append(outline)
        rpr = style.find(qn("w:rPr"))
        if rpr is not None:
            for ordinary, cs in (("sz", "szCs"), ("b", "bCs"), ("i", "iCs")):
                value = rpr.find(qn("w:" + ordinary))
                if value is not None and rpr.find(qn("w:" + cs)) is None:
                    mirror = deepcopy(value)
                    mirror.tag = qn("w:" + cs)
                    rpr.append(mirror)
    # Character-role toggles are relative to the associated label paragraph.
    # Writing b=0 alone would leave a bold label baseline unchanged in Word.
    for prefix in ("abstract", "keywords"):
        content = styles[ROLE_TO_STYLE_ID[prefix + "-content"]]
        label = styles[ROLE_TO_STYLE_ID[prefix + "-label"]]
        for prop in ("b", "bCs", "i", "iCs"):
            value = content.find("w:rPr/w:" + prop, content.nsmap)
            label_value = label.find("w:rPr/w:" + prop, label.nsmap)
            if value is not None and label_value is not None:
                enabled = value.get(qn("w:val"), "1") not in {"0", "false", "off"}
                baseline = label_value.get(qn("w:val"), "1") not in {"0", "false", "off"}
                value.set(qn("w:val"), "1" if enabled ^ baseline else "0")
    return styles


def _read_buffer_member(payload: bytes, member: str) -> bytes:
    from zipfile import ZipFile

    with ZipFile(BytesIO(payload)) as archive:
        return archive.read(member)


def _style_ids(root: Any) -> set[str]:
    return {
        style_id
        for style in root.findall(qn("w:style"))
        if (style_id := style.get(qn("w:styleId"))) is not None
    }


def _insert_styles(root: Any, styles: list[Any]) -> None:
    if not styles:
        return
    existing = root.findall(qn("w:style"))
    if existing:
        insertion_index = max(root.index(style) for style in existing) + 1
    else:
        insertion_index = len(root)
    for offset, style in enumerate(styles):
        root.insert(insertion_index + offset, style)
