"""Conservative table-level header decisions, independent of paragraph scoring.

Only a complete logical grid and a demonstrable label/data boundary may infer
headers. Repetition markers are evidence of headers, never negative evidence.
"""

from __future__ import annotations

import re
from collections import defaultdict
from statistics import median
from typing import Any

from doc_converter.docx_direct.model import (
    ClassificationDecision,
    DocumentAnalysis,
    ElementAnalysis,
)

_LABEL = re.compile(
    r"(?:名称|编号|序号|数量|单位|金额|日期|时间|类型|类别|状态|比例|代码|规格|型号|单价"
    r"|字段|参数|属性|指标|关系|规则|重点|范围|对象|项目|内容|方法|结果|用途|来源|等级|位置|条件)$"
    r"|^(?:name|item|id|code|type|category|quantity|qty|unit|price|amount|date|time|status|description"
    r"|field|parameter|property|metric|relation|rule|scope|object|content|method|result|source|level|location)$",
    re.IGNORECASE,
)
_NOTE = re.compile(r"^(?:注(?:意|释)?|说明|备注)\s*(?:[:：]|如下|以下|详见|$)|^(?:note|remark)\b", re.IGNORECASE)
_NUMBER = re.compile(r"^[+-]?\d+(?:[.,]\d+)*(?:%|％|元|万元|件|台|个|年|月|日)?$")
_DATE = re.compile(r"^\d{4}[-/.年]\d{1,2}(?:[-/.月]\d{1,2}日?)?$")
_CODE = re.compile(r"^[A-Za-z]*\d+[A-Za-z\d_-]*$")


def _kind(text: str) -> str:
    if _DATE.fullmatch(text):
        return "date"
    if _NUMBER.fullmatch(text):
        return "number"
    if _CODE.fullmatch(text):
        return "code"
    return "text"


def _short_label(cell: dict[str, Any], *, group: bool = False) -> bool:
    text = cell["text"]
    return bool(text and len(text) <= 32 and (group or _kind(text) == "text")
                and not _NOTE.match(text) and not re.search(r"[。；;!?！？]|[:：]", text)
                and not cell["drawing"] and not cell["nested"])


def _covers_grid(cells: list[dict[str, Any]], width: int) -> bool:
    return [col for c in cells for col in range(c["start"], c["end"])] == list(range(width))


def _boundary_evidence(labels: list[dict[str, Any]], data: list[list[dict[str, Any]]]) -> list[str]:
    """Require independent data/length/format evidence or multiple generic labels."""
    if len(labels) < 2 or not all(_short_label(c) for c in labels) or not data:
        return []
    type_changes = length_changes = format_changes = named = 0
    for cell in labels:
        values = [c for row in data for c in row
                  if c["start"] == cell["start"] and c["end"] == cell["end"] and c["text"]]
        if not values:
            continue
        named += bool(_LABEL.search(cell["text"]))
        type_changes += all(_kind(c["text"]) != "text" for c in values)
        typical_length = median(len(c["text"]) for c in values)
        length_changes += typical_length >= max(8, len(cell["text"]) * 1.7)
        format_changes += bool(cell["format"] and all(c["format"] != cell["format"] for c in values))
    evidence = []
    if named >= 2:
        evidence.append(f"multiple generic column labels: {named}")
    if type_changes and (named or type_changes >= 2):
        evidence.append(f"label-to-data type boundary: {type_changes} columns")
    if length_changes >= 2 and (named or type_changes or format_changes >= 2):
        evidence.append(f"short labels above longer records: {length_changes} columns")
    if format_changes >= 2 and (named or type_changes or length_changes):
        evidence.append(f"label/data visual boundary: {format_changes} columns")
    return evidence


def _merged_region(rows: dict[int, list[dict[str, Any]]], start: int, end: int) -> bool:
    """Every lower interval must fit one upper group; singleton parents continue."""
    if start == end:
        return True
    for index in range(start, end):
        upper, lower = rows[index], rows[index + 1]
        if not any(c["end"] - c["start"] > 1 for c in upper):
            return False
        for child in lower:
            parents = [c for c in upper if c["start"] <= child["start"] and child["end"] <= c["end"]]
            if len(parents) != 1:
                return False
            parent = parents[0]
            if parent["end"] - parent["start"] == 1 and (
                child["merge"] != "continue" or child["anchor"] != parent["anchor"]
            ):
                return False
    return True


def resolve_table_headers(analysis: DocumentAnalysis) -> list[dict[str, Any]]:
    grouped: dict[str, list[ElementAnalysis]] = defaultdict(list)
    for element in analysis.elements:
        if element.table_context and element.table_context.get("table_id"):
            grouped[element.table_context["table_id"]].append(element)
    results = []
    for table_id, elements in grouped.items():
        cells: dict[tuple[int, int], dict[str, Any]] = {}
        for element in elements:
            context = element.table_context
            assert context is not None
            position = (context["row"], context["column"])
            cell = cells.setdefault(position, {
                "row": position[0], "column": position[1], "start": context["logical_column"],
                "end": context["logical_column"] + context["grid_span"],
                "merge": context["vertical_merge"], "anchor": tuple(context["merge_anchor"] or position),
                "explicit": context["explicit_header"], "nested": context["cell_has_nested_table"],
                "drawing": False, "texts": [], "format": [],
            })
            cell["drawing"] |= element.has_drawing or element.has_embedded_object
            if element.text.strip():
                cell["texts"].append(element.text.strip())
                cell["format"].append(tuple(element.effective_format.get(k) for k in
                                            ("font_size_pt", "bold", "italic", "alignment")))
        rows: dict[int, list[dict[str, Any]]] = defaultdict(list)
        for cell in cells.values():
            cell["text"] = " ".join(cell["texts"])
            cell["format"] = tuple(cell["format"])
            rows[cell["row"]].append(cell)
        for row in rows.values():
            row.sort(key=lambda c: c["start"])
        first = elements[0].table_context
        assert first is not None
        explicit = sorted({c["row"] for c in cells.values() if c["explicit"]})
        result: dict[str, Any] = {
            "table_id": table_id, "table_path": first["table_path"],
            "header_rows": explicit, "header_row_range": None,
            "source": "explicit" if explicit else "preserve", "confidence": 1.0 if explicit else 0.0,
            "evidence": ["w:tblHeader enabled"] if explicit else [], "preserve_reason": None,
        }

        def infer() -> tuple[list[int], list[str], str | None]:
            if not first["grid_valid"] or len(rows) != first["row_count"]:
                return [], [], "logical grid or merge relationship is conflicting/incomplete"
            width = first["grid_columns"]
            if sum(c["drawing"] for c in cells.values()) >= len(cells) / 2:
                return [], [], "image layout table"
            if len(rows) < 2 or width < 2:
                return [], [], "single-row display or single-column table"
            if any(not _covers_grid(row, width) for row in rows.values()):
                return [], [], "row does not cover the complete logical grid"
            start = 0
            skipped = []
            while start < len(rows):
                row = rows[start]
                if any(_NOTE.match(c["text"]) for c in row):
                    return [], [], "explanatory row is not a column-name boundary"
                if not any(c["text"] or c["drawing"] or c["nested"] or c["merge"] for c in row):
                    skipped.append(f"skipped empty top row {start}")
                elif len(row) == 1 and row[0]["start"] == 0 and row[0]["end"] == width and not row[0]["merge"]:
                    skipped.append(f"skipped full-table title row {start}")
                else:
                    break
                start += 1
            if start >= len(rows) - 1:
                return [], [], "no column-name row followed by data"
            if width == 2:
                keys = [rows[i][0] for i in range(start, len(rows)) if len(rows[i]) == 2]
                # Judge the real first candidate after empty/title rows, so a
                # normal label pair wins over key-like values in data records.
                header_pair = (len(rows[start]) == 2 and all(_LABEL.search(c["text"]) for c in rows[start])
                               and bool(_boundary_evidence(rows[start], [rows[i] for i in range(start + 1, min(len(rows), start + 4))])))
                if not header_pair and len(keys) >= 2 and sum(bool(_LABEL.search(c["text"])) for c in keys) >= len(keys) * .6:
                    return [], [], "vertical key-value table"
            for end in range(start, len(rows) - 1):
                region = [c for i in range(start, end + 1) for c in rows[i] if c["merge"] != "continue"]
                if not region or not all(_short_label(c, group=c["end"] - c["start"] > 1) for c in region):
                    break
                if not _merged_region(rows, start, end):
                    break
                leaf = rows[end]
                if any(c["end"] - c["start"] > 1 for c in leaf):
                    continue
                labels = [cells[c["anchor"]] if c["merge"] == "continue" else c for c in leaf]
                following = [rows[i] for i in range(end + 1, min(len(rows), end + 4))]
                if any(c["merge"] == "continue" for c in rows[end + 1]):
                    return [], [], "vertical merge crosses the prospective header/data boundary"
                evidence = _boundary_evidence(labels, following)
                if evidence:
                    if end > start:
                        evidence.append("continuous merged groups align with leaf columns")
                    return list(range(start, end + 1)), skipped + evidence, None
                # A complete unmerged row is ambiguous, not a grouping row to skip.
                break
            return [], [], "no unambiguous column-label/data boundary"

        inferred, evidence, reason = infer()
        result["header_rows"] = sorted(set(explicit) | set(inferred))
        if inferred:
            result["source"] = "explicit+inferred" if explicit else "inferred"
            result["confidence"] = 1.0 if explicit else .95
            result["evidence"].extend(evidence)
        result["preserve_reason"] = reason
        if result["header_rows"]:
            result["header_row_range"] = [min(result["header_rows"]), max(result["header_rows"])]
        results.append(result)
    return results


def select_table_header(element: ElementAnalysis) -> None:
    context = element.table_context
    inference = element.signals.get("table_header_inference")
    if context and context.get("vertical_merge") == "continue":
        element.selected_decision = ClassificationDecision(
            role="unknown", confidence=1, action="preserved",
            reasons=["vertical merge continuation; only the anchor cell is processed"],
        )
        element.selection_source = "table"
        element.selection_reason = "vertical merge continuation preserved"
        return
    if (not context or not inference or not element.text.strip()
            or context["row"] not in inference["header_rows"]):
        return
    # Drawing-only/numbered paragraphs are not ordinary cell text.
    if element.has_drawing or element.has_embedded_object or element.numbering_properties:
        return
    explicit = context["explicit_header"]
    element.selected_decision = ClassificationDecision(
        role="table-column-header", confidence=1.0 if explicit else inference["confidence"],
        action="mapped", reasons=inference["evidence"],
    )
    element.selection_source = "table"
    element.selection_reason = "explicit table row" if explicit else "table-grid header inference"
