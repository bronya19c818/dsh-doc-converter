"""Structure pass for PaddleOCR Markdown, before the shared normalization layer."""

from __future__ import annotations

import re

import yaml

_HEADING = re.compile(r"^(#{1,6})\s+(\S.*?)\s*$")
_CN_ORDINAL = re.compile(r"^[一二三四五六七八九十百千]+、")
_PAREN_ORDINAL = re.compile(r"^[（(][^）)]+[）)]")
_ORDERED_ITEM = re.compile(r"^(\s*)(\d+)[.、)]\s*(.*)$")
_IMAGE_LINE = re.compile(r"^\s*!\[([^\]]*)\]\(([^)\s]+)\)\s*$")
_HEADER_ATTACHMENT = re.compile(r"^附件\s*(\d+)$")
_MATH_SUPERSCRIPT = re.compile(r"\s*\$\s*\^\s*\{?\s*(\d+)\s*\}?\s*\$\s*")


def structure_ocr_markdown(markdown: str, header: str | None = None) -> str:
    """Turn OCR's flat headings and loose blocks into a Markdown heading outline."""

    metadata_text, body_text = _split_front_matter(markdown)
    try:
        metadata = yaml.safe_load(metadata_text) if metadata_text else {}
    except yaml.YAMLError:
        metadata = {}
    if not isinstance(metadata, dict):
        metadata = {}
    existing = metadata.get("title")
    existing_title = existing.strip() if isinstance(existing, str) and existing.strip() else None
    lines = body_text.split("\n")
    title, title_index = _take_title(lines)
    if title:
        title = _plain_superscripts(title)
    if title_index is not None:
        del lines[title_index]
    lines = _demote_figure_titles(lines)
    lines = _relevel_headings(lines)
    lines = _tighten_lists(lines)
    lines = [_clean_line(line, in_code) for line, in_code in _with_code_state(lines)]
    body = "\n".join(lines).strip()
    attach = _header_line(header)
    if attach:
        body = f"{attach}\n\n{body}" if body else attach
    if title:
        body = f"# {title}\n\n{body}" if body else f"# {title}"
    elif existing_title:
        # A source front matter with only a title keeps it as the first heading.
        body = f"# {existing_title}\n\n{body}" if body else f"# {existing_title}"
    if existing_title and existing_title != title:
        # The shared normalization reads a front-matter title when deciding the
        # document title role; it is removed again for the delivered Markdown.
        front = yaml.safe_dump({"title": existing_title}, allow_unicode=True, sort_keys=False).strip()
        return f"---\n{front}\n---\n\n{body}\n"
    return f"{body}\n" if body else ""


def _split_front_matter(markdown: str) -> tuple[str, str]:
    lines = markdown.replace("\r\n", "\n").split("\n")
    if not lines or lines[0].strip() != "---":
        return "", markdown
    closing = next((index for index, line in enumerate(lines[1:], start=1)
                    if line.strip() == "---"), None)
    if closing is None:
        return "", markdown
    return "\n".join(lines[1:closing]), "\n".join(lines[closing + 1:])


def delivery_markdown(markdown: str) -> str:
    """Remove the plugin's schema marker, keeping the title as the first heading."""

    lines = markdown.replace("\r\n", "\n").split("\n")
    if not lines or lines[0].strip() != "---":
        return markdown
    closing = next((index for index, line in enumerate(lines[1:], start=1)
                    if line.strip() == "---"), None)
    if closing is None:
        return markdown
    try:
        front = yaml.safe_load("\n".join(lines[1:closing])) or {}
    except yaml.YAMLError:
        front = {}
    title = front.get("title") if isinstance(front, dict) else None
    title = title.strip() if isinstance(title, str) and title.strip() else None
    metadata = [line for line in lines[1:closing]
                if not line.lstrip().startswith(("schema:", "title:"))]
    body = "\n".join(lines[closing + 1:]).lstrip("\n")
    if title:
        first_heading = next((line for line in body.split("\n") if line.strip()), "")
        if first_heading.strip() != f"# {title}":
            existing = any(
                (match := _HEADING.match(line)) and match.group(1) == "#"
                and match.group(2).strip() == title
                for line in body.split("\n")
            )
            if not existing:
                body = f"# {title}\n\n{body}" if body else f"# {title}"
    if not any(line.strip() for line in metadata):
        return body
    return "\n".join(["---", *metadata, "---", body])


def _plain_superscripts(text: str) -> str:
    """Render OCR's ``$ ^{1} $`` title marker as the printed ``¹``."""

    return _MATH_SUPERSCRIPT.sub(
        lambda match: match.group(1).translate(str.maketrans("0123456789", "⁰¹²³⁴⁵⁶⁷⁸⁹")),
        text,
    )


def _take_title(lines: list[str]) -> tuple[str | None, int | None]:
    index = _next_content(lines, 0)
    if index is None:
        return None, None
    attachment = _HEADER_ATTACHMENT.match(lines[index].strip())
    if attachment:
        # The attachment label sits above the title; the first heading is the title.
        index = _next_content(lines, index + 1)
        if index is None:
            return None, None
    heading = _HEADING.match(lines[index])
    if not heading:
        return None, None
    title = heading.group(2).strip()
    if not title or _CN_ORDINAL.match(title) or _PAREN_ORDINAL.match(title) or _ORDERED_ITEM.match(title):
        return None, None
    after = _next_content(lines, index + 1)
    if after is not None and _IMAGE_LINE.match(lines[after]):
        return None, None
    return title, index


def _demote_figure_titles(lines: list[str]) -> list[str]:
    result = list(lines)
    for index, line in enumerate(result):
        heading = _HEADING.match(line)
        if not heading:
            continue
        after = _next_content(result, index + 1)
        if after is None:
            continue
        image = _IMAGE_LINE.match(result[after])
        if not image:
            continue
        caption = heading.group(2).strip()
        result[index] = caption
        alt = image.group(1).strip()
        if alt in {"", "Image", "image"}:
            result[after] = result[after].replace(f"![{image.group(1)}]", f"![{caption}]", 1)
    return result


def _relevel_headings(lines: list[str]) -> list[str]:
    result = []
    for line in lines:
        heading = _HEADING.match(line)
        if not heading:
            result.append(line)
            continue
        text = heading.group(2)
        if _CN_ORDINAL.match(text):
            level = 1
        elif _PAREN_ORDINAL.match(text):
            level = 2
        else:
            result.append(line)
            continue
        text = _strip_ordinal_space(text)
        result.append(f"{'#' * level} {text}")
    return result


def _tighten_lists(lines: list[str]) -> list[str]:
    result: list[str] = []
    for index, line in enumerate(lines):
        item = _ORDERED_ITEM.match(line)
        if item:
            result.append(f"{item.group(1)}{item.group(2)}. {item.group(3).strip()}")
            continue
        if line.strip() == "" and result and index + 1 < len(lines):
            previous = next((candidate for candidate in reversed(result) if candidate.strip()), "")
            following = _next_nonempty(lines, index + 1)
            if _ORDERED_ITEM.match(previous) and following and _ORDERED_ITEM.match(following):
                continue
        result.append(line)
    return result


def _clean_line(line: str, in_code: bool) -> str:
    if in_code:
        return line
    line = re.sub(r"(?<=[\u4e00-\u9fff])[ \t]+(?=[“”])", "", line)
    line = re.sub(r"(?<=[“”])[ \t]+(?=[\u4e00-\u9fff])", "", line)
    heading = _HEADING.match(line)
    if heading:
        text = _strip_ordinal_space(heading.group(2))
        return f"{heading.group(1)} {text}"
    return line


def _strip_ordinal_space(text: str) -> str:
    text = re.sub(r"^([一二三四五六七八九十百千]+、)\s+", r"\1", text)
    return re.sub(r"^([（(][^）)]+[）)])\s+", r"\1", text)


def _with_code_state(lines: list[str]):
    in_code = False
    for line in lines:
        if line.lstrip().startswith("```"):
            yield line, True
            in_code = not in_code
            continue
        yield line, in_code


def _header_line(header: str | None) -> str:
    text = (header or "").strip()
    if not text:
        return ""
    attachment = _HEADER_ATTACHMENT.match(text)
    return f"附件 {attachment.group(1)}" if attachment else text


def _next_content(lines: list[str], start: int) -> int | None:
    for index in range(start, len(lines)):
        if lines[index].strip():
            return index
    return None


def _next_nonempty(lines: list[str], start: int) -> str | None:
    index = _next_content(lines, start)
    return lines[index] if index is not None else None