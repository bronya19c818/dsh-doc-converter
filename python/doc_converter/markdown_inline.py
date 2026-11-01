"""Additive, evidence-scored inline Markdown decisions.

The DOCX-direct path classifies text by summing independent evidence and only
acting above a confidence threshold. This module applies the same idea to
Markdown's inline markers: ``*``/``_`` emphasis, ``^`` superscript and ``~``
superscript are ambiguous because the same characters are ordinary symbols in
arithmetic, file paths, version ranges and underscores in identifiers. A single
prefix rule cannot separate them, so every candidate span competes for its
literal-sign, emphasis or superscript interpretation and the best score wins.

Only the resolved spans are rewritten; every other character, including the
original words, numbers and spacing, is left untouched.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

# Below this many net points a span is treated as an ordinary symbol.
LITERAL_THRESHOLD = 3.0
# Below this many net points a span is kept as written instead of converted.
CONVERSION_THRESHOLD = 4.0

_CJK = re.compile(r"[\u3400-\u9fff\uf900-\ufaff]")
_ASCII_WORD = re.compile(r"[A-Za-z][A-Za-z0-9_]*")
_MATH_IDENTIFIER = re.compile(r"^[A-Za-z][A-Za-z0-9_]{0,2}$")
_SUPERSCRIPT_BODY = re.compile(r"^(?:[0-9]+|[A-Za-z]|[+\-−]?[0-9.]+|[0-9]*[°'" + "\u2032\u2033" + r"]+)$")
_EMPHASIS_BODY = re.compile(r"^[^，。；！？、：,:;!?\n]{1,40}$")
_PLAIN_TERMINATORS = ("。", "，", "、", "；", "：", "！", "？", "）", "」", "』", "”")


class InlineScoringConfig(BaseModel):
    """Tunable weights kept separate from the rule code, like the DOCX scorer."""

    model_config = ConfigDict(frozen=True, extra="forbid")
    literal_threshold: float = Field(default=LITERAL_THRESHOLD, ge=0)
    conversion_threshold: float = Field(default=CONVERSION_THRESHOLD, ge=0)
    weights: dict[str, float] = Field(default_factory=dict)


@dataclass(frozen=True)
class InlineSpan:
    """One scored candidate, kept for the normalization audit report."""

    kind: str  # emphasis | superscript | literal
    marker: str
    text: str
    score: float
    runner_up: str
    runner_up_score: float
    evidence: tuple[tuple[str, float, str], ...] = field(default=())


@dataclass(frozen=True)
class InlineResolution:
    """The converted Markdown plus every decision that changed something."""

    markdown: str
    spans: tuple[InlineSpan, ...]

    @property
    def report(self) -> list[dict[str, Any]]:
        return [
            {
                "kind": span.kind, "marker": span.marker, "text": span.text[:60],
                "score": round(span.score, 1),
                "runner_up": span.runner_up, "runner_up_score": round(span.runner_up_score, 1),
                "evidence": [{"feature": name, "points": points, "reason": reason}
                             for name, points, reason in span.evidence],
            }
            for span in self.spans
        ]


# --------------------------------------------------------------------------- #
# Span discovery
# --------------------------------------------------------------------------- #

def _fenced_mask(lines: list[str]) -> list[bool]:
    mask: list[bool] = []
    fence: str | None = None
    for line in lines:
        stripped = line.lstrip()
        if stripped.startswith(("```", "~~~")):
            marker = stripped[:3]
            if fence is None:
                fence = marker
                mask.append(True)
                continue
            if marker == fence:
                fence = None
            mask.append(True)
            continue
        mask.append(fence is not None)
    return mask


_INLINE_CODE = re.compile(r"(`+)[\s\S]*?\1")


def _code_spans(line: str) -> list[tuple[int, int]]:
    return [match.span() for match in _INLINE_CODE.finditer(line)]


def _inside(spans: list[tuple[int, int]], start: int, end: int) -> bool:
    return any(left <= start and end <= right for left, right in spans)


def _image_link_spans(line: str) -> list[tuple[int, int]]:
    spans = [match.span() for match in re.finditer(r"!?\[[^\]]*\]\([^)]*\)", line)]
    return spans


def _superscript_candidates(line: str) -> list[tuple[int, int, int]]:
    """Return ``(start, body_start, body_end)`` for every caret occurrence.

    A caret can only be converted when it has a partner, so a stray caret such
    as a Windows path separator yields no span. Both ``a^2^`` and the common
    ``4^2`` form are accepted and scored; the scorer decides which is real.
    """

    found: list[tuple[int, int, int]] = []
    index = 0
    while index < len(line):
        if line[index] != "^" or (index and line[index - 1] == "\\"):
            index += 1
            continue
        close = line.find("^", index + 1)
        if close > index + 1:
            found.append((index, index + 1, close))
            index = close + 1
            continue
        # Unpaired caret: take the conventional exponent run as its body.
        match = re.match(r"[^\s\^，。；、：,;:=＝]{1,6}", line[index + 1:])
        if match is not None:
            body = match.group(0)
            end = index + 1 + len(body)
            found.append((index, index + 1, end))
            index = end
            continue
        index += 1
    return found


def _emphasis_candidates(line: str) -> list[tuple[int, int, int, str]]:
    """Return ``(start, body_start, body_end, marker)`` for each ``**x**``/``*x*``."""

    found: list[tuple[int, int, int, str]] = []
    index = 0
    while index < len(line):
        char = line[index]
        if char != "*" or (index and line[index - 1] == "\\"):
            index += 1
            continue
        marker = "**" if line.startswith("**", index) else "*"
        body_start = index + len(marker)
        close = line.find(marker, body_start)
        if close <= body_start:
            if marker == "**":
                index += 2
            else:
                index += 1
            continue
        # A single ``*`` must not swallow the opening of a ``**`` run.
        if marker == "*" and line.startswith("**", close):
            index = close
            continue
        found.append((index, body_start, close, marker))
        index = close + len(marker)
    return found


# --------------------------------------------------------------------------- #
# Evidence
# --------------------------------------------------------------------------- #

class _Scored:
    def __init__(self, config: InlineScoringConfig) -> None:
        self._config = config
        self._totals: dict[str, float] = {}
        self._runner = 0.0
        self._evidence: list[tuple[str, float, str]] = []

    def add(self, feature: str, points: float, reason: str) -> None:
        value = self._config.weights.get(feature, points)
        self._totals[feature] = self._totals.get(feature, 0.0) + value
        self._evidence.append((feature, value, reason))

    def totals(self) -> dict[str, float]:
        grouped: dict[str, float] = {}
        for feature, value in self._totals.items():
            family = feature.split(".")[0]
            grouped[family] = grouped.get(family, 0.0) + value
        return grouped

    def evidence(self) -> tuple[tuple[str, float, str], ...]:
        return tuple(self._evidence)


def _word_context(line: str, start: int, end: int) -> tuple[bool, bool]:
    before = line[start - 1] if start > 0 else ""
    after = line[end] if end < len(line) else ""
    word_before = bool(before) and (before.isalnum() or before in "_\\/:")
    word_after = bool(after) and (after.isalnum() or after in "_")
    return word_before, word_after


def _superscript_score(line: str, start: int, body_start: int, body_end: int,
                       config: InlineScoringConfig) -> _Scored:
    body = line[body_start:body_end]
    scored = _Scored(config)
    before = line[start - 1] if start > 0 else ""
    after = line[body_end + 1] if body_end + 1 < len(line) else ""
    left_attached = bool(before) and (before.isalnum() or before in ")]}）】")
    right_boundary = (not after) or after in " \t，。；、：,;:!?）)】=＝+＋-−×*/×" or after in "="
    if left_attached:
        scored.add("superscript.left_attached", 5, "上标左侧紧贴底数")
    if right_boundary:
        scored.add("superscript.right_boundary", 3, "上标右侧为边界或运算符")
    if _SUPERSCRIPT_BODY.fullmatch(body):
        scored.add("superscript.simple_body", 3, "指数为数字或单个字母")
    if body.isdigit():
        scored.add("superscript.numeric_body", 2, "指数为纯数字")
    # 4^2=16: a caret between numbers is the exponent operator in a formula, so
    # it is promoted rather than left as a literal caret the reader cannot use.
    if body.isdigit() and before.isdigit():
        scored.add("superscript.base_digit", 6, "数字底数加数字指数，形成乘方")
    if after in "=＝":
        scored.add("superscript.equation_follows", 3, "上标后接等号，像是算式")
    # Rivals: a symbol inside a word, a path, or spanning to a later caret.
    word_before, _ = _word_context(line, start, body_end + 1)
    if word_before and not body.isdigit():
        scored.add("literal.word_embedded", 6, "符号嵌在单词或路径中间")
    if not left_attached:
        scored.add("literal.left_detached", 9, "左侧无底数，符号更像普通字符")
    if body.isalpha() and before.isalpha():
        scored.add("literal.letter_chain", 10, "字母之间的脱字符更像原样字符")
    if before in "\\/.~-_" or after in "\\/._-":
        scored.add("literal.path_context", 8, "位于路径或文件名中")
    if line.count("^") > 2:
        scored.add("literal.many_carets", 4, "同一行出现多个脱字符")
    if after and after.isalpha() and not body.isdigit():
        scored.add("literal.multiplication_context", 5, "脱字符处于字母乘积表达")
    if not body.isdigit() and not body.isalpha() and not _SUPERSCRIPT_BODY.fullmatch(body):
        scored.add("literal.not_exponent", 10, "内容不是指数形式")
    return scored


def _emphasis_score(line: str, start: int, body_start: int, body_end: int,
                    marker: str, config: InlineScoringConfig) -> _Scored:
    body = line[body_start:body_end]
    scored = _Scored(config)
    before = line[start - 1] if start > 0 else ""
    after = line[body_end + len(marker)] if body_end + len(marker) < len(line) else ""
    has_cjk = bool(_CJK.search(body))
    if has_cjk:
        scored.add("emphasis.cjk_body", 6, "强调内容含中文，普通乘号不会包住整段中文")
    if len(body) >= 2 and not body.isdigit():
        scored.add("emphasis.content_length", 3, "强调内容长度足以构成词句")
    if body and body[-1] in _PLAIN_TERMINATORS:
        scored.add("emphasis.cjk_terminator", 4, "强调内容以中文标点收尾")
    if body and (body[0].isalnum() or _CJK.match(body[0])):
        scored.add("emphasis.alnum_start", 2, "强调内容以文字或数字开头")
    if body and (body[-1].isalnum() or _CJK.match(body[-1])):
        scored.add("emphasis.alnum_end", 1, "强调内容以文字或数字结尾")
    if body.isdigit() or (body and all(part.strip().isdigit() for part in body.split("*"))):
        scored.add("literal.digits_only", 12, "星号之间只有数字，更像乘式")
    if _MATH_IDENTIFIER.match(body) or (len(body) == 1 and not _CJK.match(body)):
        scored.add("literal.single_symbol", 9, "单个符号更像乘数")
    left_word, right_word = _word_context(line, start, body_end + len(marker))
    if left_word and any(char.isdigit() for char in line[max(0, start - 2):start]):
        scored.add("literal.digit_neighbour", 8, "星号紧邻数字")
    if re.search(r"[0-9]\*[0-9]|\*\*[0-9]", body) or (left_word and right_word and "*" in body):
        scored.add("literal.arith_chain", 7, "星号处于连续算式")
    if start >= 2 and re.search(r"[0-9A-Za-z)）]\*[0-9(（]", line[start - 1:start + len(marker) + 1]):
        scored.add("literal.operator_position", 6, "星号位于两个运算对象之间")
    if line.count("*") >= 4 and len(body) <= 4:
        scored.add("literal.many_stars", 5, "同一行星号过多且跨度很短")
    if right_word and not has_cjk:
        scored.add("literal.word_suffix", 3, "星号后直接连接字母")
    if not body.strip():
        scored.add("literal.empty_body", 20, "强调内容为空")
    return scored


def _decide(grouped: dict[str, float]) -> tuple[str, float, str, float]:
    ranked = sorted(grouped.items(), key=lambda item: (-item[1], item[0]))
    top_kind, top_score = ranked[0]
    runner_kind, runner_score = ranked[1] if len(ranked) > 1 else ("", 0.0)
    return top_kind, top_score, runner_kind, runner_score


# --------------------------------------------------------------------------- #
# Public entry
# --------------------------------------------------------------------------- #

def resolve_inline_markdown(
    markdown: str,
    *,
    config: InlineScoringConfig | None = None,
) -> InlineResolution:
    """Score every ambiguous inline span and rewrite only the accepted ones."""

    config = config or InlineScoringConfig()
    lines = markdown.splitlines()
    mask = _fenced_mask(lines)
    decisions: list[InlineSpan] = []
    output: list[str] = []

    for line, fenced in zip(lines, mask, strict=True):
        if fenced or not line.strip():
            output.append(line)
            continue
        protected = _code_spans(line) + _image_link_spans(line)
        output.append(_resolve_line(line, protected, config, decisions))

    markdown_out = "\n".join(output)
    if markdown.endswith("\n"):
        markdown_out += "\n"
    return InlineResolution(markdown=markdown_out, spans=tuple(decisions))


def _resolve_line(
    line: str, protected: list[tuple[int, int]],
    config: InlineScoringConfig, decisions: list[InlineSpan],
) -> str:
    replacements: list[tuple[int, int, str]] = []

    for start, body_start, body_end in _superscript_candidates(line):
        if _inside(protected, start, body_end + 1):
            continue
        if line[body_end:body_end + 1] == "^":
            replacement_end = body_end + 1
        else:
            replacement_end = body_end
        scored = _superscript_score(line, start, body_start, body_end, config)
        kind, score, runner, runner_score = _decide(scored.totals())
        body = line[body_start:body_end]
        decisions.append(InlineSpan(
            kind=kind, marker="^", text=body, score=score,
            runner_up=runner, runner_up_score=runner_score,
            evidence=scored.evidence(),
        ))
        if kind == "superscript" and score >= config.conversion_threshold:
            replacements.append((start, replacement_end, f"^{body}^"))

    for start, body_start, body_end, marker in _emphasis_candidates(line):
        if _inside(protected, start, body_end + len(marker)):
            continue
        if any(left <= start < right for left, right, _ in replacements):
            continue
        scored = _emphasis_score(line, start, body_start, body_end, marker, config)
        kind, score, runner, runner_score = _decide(scored.totals())
        body = line[body_start:body_end]
        decisions.append(InlineSpan(
            kind=kind, marker=marker, text=body, score=score,
            runner_up=runner, runner_up_score=runner_score,
            evidence=scored.evidence(),
        ))
        if kind == "emphasis" and score >= config.conversion_threshold:
            replacements.append((start, body_end + len(marker), f"**{body}**"))

    if not replacements:
        return line
    result = line
    for start, end, text in sorted(replacements, key=lambda item: item[0], reverse=True):
        result = result[:start] + text + result[end:]
    return result


def resolve_file(path: Path, *, config: InlineScoringConfig | None = None) -> InlineResolution:
    """Convenience wrapper for one file on disk."""

    return resolve_inline_markdown(path.read_text(encoding="utf-8-sig"), config=config)
