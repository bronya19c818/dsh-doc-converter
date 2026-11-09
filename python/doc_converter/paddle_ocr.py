"""PaddleOCR cloud jobs: submit, poll, and collect page Markdown with local images."""

from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import unquote
from urllib.request import Request, urlopen
from uuid import uuid4

from doc_converter.storage import atomic_write_text

MODEL = "PaddleOCR-VL-1.6"
DEFAULT_BASE_URL = "https://paddleocr.aistudio-app.com"
OCR_SUFFIXES = {".png", ".jpg", ".jpeg", ".bmp", ".tif", ".tiff", ".webp", ".pdf"}
MAX_UPLOAD_BYTES = 50 * 1024 * 1024
MAX_PAGES = 1000
MAX_IMAGE_BYTES = 10 * 1024 * 1024

_MESSAGES = {
    401: "访问令牌无效或已过期，请在「转换环境」重新填写。",
    403: "今日 OCR 页数额度已用完，或访问令牌没有权限。",
    413: "文件超过服务允许的大小。",
    429: "请求过于频繁或今日页数额度已用完，请稍后重试。",
    10001: "文件为空。",
    10003: "文件超过 50 MB 上限。",
    10004: "服务不支持该文件格式。",
    10005: "文件内容无法解析。",
    10006: "PDF 页数超过 1000 页上限。",
    10007: "OCR 模型参数无效。",
    10008: "OCR 请求参数无效。",
    10010: "云端任务排队已满，请稍后重试。",
    11001: "云端任务不存在。",
    11002: "云端任务已过期，请重新转换。",
    12001: "今日 OCR 页数额度已用完（每模型每天 20000 页）。",
    12002: "请求过于频繁，请稍后重试。",
}
_IMG_BLOCK = re.compile(r"<div[^>]*>\s*<img\b[^>]*>\s*</div>", re.IGNORECASE | re.DOTALL)
_IMG_TAG = re.compile(r"<img\b[^>]*>", re.IGNORECASE | re.DOTALL)
_SRC = re.compile(r"""\bsrc\s*=\s*["']([^"']*)["']""", re.IGNORECASE)
_ALT = re.compile(r"""\balt\s*=\s*["']([^"']*)["']""", re.IGNORECASE)
_UNSAFE = re.compile(r"[^0-9A-Za-z._\-\u4e00-\u9fff]+")
_BLOCK_START = re.compile(r"^(?:#{1,6}\s|[-*+]\s|\d+[.)]\s|\||!\[|<|```)")
_BLOCK_LAST = re.compile(r"^(?:#{1,6}\s|\||!\[|<|```)")
_TERMINAL = re.compile(r"[。！？；：.!?;:”\"』】）)]$")


class OcrError(RuntimeError):
    """A cloud OCR failure with a message already suitable for the page."""


@dataclass(frozen=True)
class OcrState:
    """One polled cloud state, with the values the page needs."""

    state: str
    total_pages: int | None
    extracted_pages: int | None
    error: str | None
    json_url: str | None


@dataclass(frozen=True)
class OcrResult:
    """Collected page Markdown, its local images, and the page header if any."""

    markdown: str
    pages: int
    images: list[str]
    header: str | None = None


def is_ocr_source(suffix: str) -> bool:
    return suffix.lower() in OCR_SUFFIXES


class PaddleOcr:
    """One data-root owner for the OCR token and its cloud job calls."""

    def __init__(self, data_root: Path, base_url: str | None = None) -> None:
        self.data_root = Path(data_root)
        self.base_url = (base_url or os.environ.get("DOC_CONVERTER_OCR_BASE")
                         or DEFAULT_BASE_URL).rstrip("/")
        self._config_path = self.data_root / "paddle-ocr.json"

    def token_status(self) -> dict[str, Any]:
        """Report whether a token exists without returning its value."""

        environment = os.environ.get("DOC_CONVERTER_PADDLE_TOKEN", "").strip()
        if environment:
            return {"configured": True, "source": "environment", "hint": _hint(environment)}
        token = self._saved_token()
        if token:
            return {"configured": True, "source": "file", "hint": _hint(token)}
        return {"configured": False, "source": None, "hint": None}

    def set_token(self, token: str) -> dict[str, Any]:
        value = str(token or "").strip()
        if not 8 <= len(value) <= 4096 or any(character.isspace() for character in value):
            raise ValueError("访问令牌格式不正确，请粘贴完整的令牌。")
        atomic_write_text(self._config_path, json.dumps({"token": value}, ensure_ascii=False, indent=2))
        return self.token_status()

    def clear_token(self) -> dict[str, Any]:
        self._config_path.unlink(missing_ok=True)
        return self.token_status()

    def token(self) -> str:
        environment = os.environ.get("DOC_CONVERTER_PADDLE_TOKEN", "").strip()
        token = environment or self._saved_token()
        if not token:
            raise OcrError("尚未配置 PaddleOCR 访问令牌，请在「转换环境」填写。")
        return token

    def _saved_token(self) -> str:
        try:
            value = json.loads(self._config_path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            return ""
        token = value.get("token") if isinstance(value, dict) else None
        return token.strip() if isinstance(token, str) else ""

    def submit(self, source: Path) -> str:
        """Upload one local file and return the cloud job identity."""

        source = Path(source)
        size = source.stat().st_size
        if size <= 0:
            raise OcrError("文件为空。")
        if size > MAX_UPLOAD_BYTES:
            raise OcrError("文件超过 50 MB 上限，无法提交 OCR。")
        boundary = f"----dshocr{uuid4().hex}"
        fields = {
            "model": MODEL,
            "optionalPayload": json.dumps({
                "useDocOrientationClassify": False,
                "useDocUnwarping": False,
                "useChartRecognition": False,
            }),
        }
        parts: list[bytes] = []
        for name, value in fields.items():
            parts.append(
                f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n'
                f"{value}\r\n".encode("utf-8")
            )
        filename = f"upload{source.suffix.lower()}"
        parts.append(
            f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{filename}"\r\n'
            f"Content-Type: application/octet-stream\r\n\r\n".encode("utf-8")
        )
        parts.append(source.read_bytes())
        parts.append(f"\r\n--{boundary}--\r\n".encode("utf-8"))
        status, body = _http(
            "POST", f"{self.base_url}/api/v2/ocr/jobs",
            headers={"Authorization": f"Bearer {self.token()}",
                     "Content-Type": f"multipart/form-data; boundary={boundary}"},
            data=b"".join(parts), timeout=120,
        )
        payload = _payload(status, body, "提交 OCR 任务")
        job_id = (payload.get("data") or {}).get("jobId")
        if not isinstance(job_id, str) or not job_id:
            raise OcrError("OCR 服务没有返回任务编号。")
        return job_id

    def poll(self, job_id: str) -> OcrState:
        status, body = _http(
            "GET", f"{self.base_url}/api/v2/ocr/jobs/{job_id}",
            headers={"Authorization": f"Bearer {self.token()}"}, timeout=60,
        )
        payload = _payload(status, body, "查询 OCR 任务")
        data = payload.get("data") or {}
        progress = data.get("extractProgress") or {}
        result_url = data.get("resultUrl") or {}
        return OcrState(
            state=str(data.get("state") or "unknown"),
            total_pages=_number(progress.get("totalPages")),
            extracted_pages=_number(progress.get("extractedPages")),
            error=_failure_message(data.get("errorMsg")),
            json_url=result_url.get("jsonUrl") if isinstance(result_url, dict) else None,
        )

    def collect(self, state: OcrState, job_directory: Path) -> OcrResult:
        """Download every page image, then rewrite page Markdown to local images."""

        if not state.json_url:
            raise OcrError("OCR 任务已完成，但没有返回结果地址。")
        job_directory = Path(job_directory)
        status, body = _http("GET", state.json_url, timeout=180)
        if status != 200:
            raise OcrError(f"下载 OCR 结果失败（HTTP {status}）。")
        text = body.decode("utf-8", "replace")
        items: list[tuple[str, dict[str, Any], list[dict[str, Any]]]] = []
        for line in text.splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                result = (json.loads(line) or {}).get("result") or {}
            except ValueError as error:
                raise OcrError("OCR 结果不是有效的 JSONL。") from error
            for item in result.get("layoutParsingResults") or []:
                markdown = (item or {}).get("markdown") or {}
                blocks = ((item or {}).get("prunedResult") or {}).get("parsing_res_list") or []
                items.append((str(markdown.get("text") or ""), markdown.get("images") or {}, blocks))
        if not items:
            raise OcrError("OCR 没有返回任何页面内容。")
        if len(items) > MAX_PAGES:
            raise OcrError("OCR 结果超过 1000 页上限。")
        pages: list[str] = []
        images: list[str] = []
        header: str | None = None
        for page_number, (page_text, page_images, blocks) in enumerate(items, start=1):
            if header is None:
                header = _block_text(blocks, "header")
            mapping = self._download_images(page_images, job_directory, page_number)
            images.extend(mapping.values())
            page = _rewrite_images(page_text, mapping).strip()
            pages.append(_with_footnotes(page, blocks))
        return OcrResult(markdown=_join_pages(pages), pages=len(pages), images=images, header=header)

    def _download_images(self, images: dict[str, Any], job_directory: Path,
                         page_number: int) -> dict[str, str]:
        mapping: dict[str, str] = {}
        used: set[str] = set()
        for index, (key, url) in enumerate(sorted(images.items())):
            if not isinstance(url, str) or not url:
                continue
            name = _safe_image_name(key, index)
            if name in used:
                name = f"{Path(name).stem}-{index}{Path(name).suffix}"
            used.add(name)
            relative = f"images/page-{page_number:04d}/{name}"
            target = job_directory / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            status, body = _http("GET", url, timeout=120)
            if status != 200 or not body:
                raise OcrError(f"下载 OCR 图片失败（HTTP {status}）：{key}")
            if len(body) > MAX_IMAGE_BYTES:
                raise OcrError(f"OCR 图片超过 10 MB：{key}")
            target.write_bytes(body)
            mapping[str(key)] = relative
        return mapping


def _hint(token: str) -> str:
    return f"…{token[-4:]}" if len(token) >= 4 else "…"


def _block_text(blocks: list[dict[str, Any]], label: str) -> str | None:
    for block in blocks:
        if block.get("block_label") == label:
            text = str(block.get("block_content") or "").strip()
            if text:
                return text
    return None


def _with_footnotes(page: str, blocks: list[dict[str, Any]]) -> str:
    """Restore footnote bodies that the provider's Markdown rendering drops."""

    notes = [str(block.get("block_content") or "").strip() for block in blocks
             if block.get("block_label") == "footnote"]
    notes = [note for note in notes if note]
    if not notes:
        return page
    appended: list[str] = []
    for index, note in enumerate(notes, start=1):
        marker = _superscript(index)
        pattern = re.compile(r"\s*\$\s*\^\s*\{?" + str(index) + r"\}?\s*\$")
        page = pattern.sub(marker, page)
        if note not in page:
            appended.append(f"{marker} {note}")
    if appended:
        page = page.rstrip() + "\n\n" + "\n\n".join(appended)
    return page


def _superscript(number: int) -> str:
    digits = str(number).translate(str.maketrans("0123456789", "⁰¹²³⁴⁵⁶⁷⁸⁹"))
    return digits


def _join_pages(pages: list[str]) -> str:
    """Join pages without turning a sentence split by a page break into paragraphs."""

    joined = pages[0].rstrip()
    for page in pages[1:]:
        following = page.lstrip()
        last_line = joined.rsplit("\n", 1)[-1]
        block_last = bool(_BLOCK_LAST.match(last_line))
        block_next = bool(_BLOCK_START.match(following))
        terminal = bool(_TERMINAL.search(last_line))
        joined = f"{joined}\n\n{following}" if block_last or block_next or terminal else joined + following
    return joined + "\n"


def _number(value: Any) -> int | None:
    return value if isinstance(value, int) and value >= 0 else None


def _failure_message(value: Any) -> str | None:
    return str(value).strip() if value else None


def _safe_image_name(key: str, index: int) -> str:
    name = unquote(str(key).split("?")[0]).replace("\\", "/").rsplit("/", 1)[-1]
    name = _UNSAFE.sub("_", name).strip(" .")
    if not name or name in {".", ".."}:
        name = f"image-{index}.jpg"
    return name[:120]


def _rewrite_images(markdown: str, mapping: dict[str, str]) -> str:
    """Turn OCR's raw HTML image blocks into portable Markdown images."""

    def replace(match: re.Match[str]) -> str:
        src = _src_of(match.group(0))
        return _image_markdown(src, mapping, match.group(0)) if src else ""

    return _IMG_TAG.sub(replace, _IMG_BLOCK.sub(replace, markdown))


def _src_of(tag: str) -> str:
    match = _SRC.search(tag)
    return match.group(1).strip() if match else ""


def _image_markdown(src: str, mapping: dict[str, str], tag: str) -> str:
    relative = mapping.get(src) or mapping.get(unquote(src))
    if not relative:
        raise OcrError(f"OCR 图片地址与结果清单不一致，已停止以避免丢图：{src}")
    alt = _ALT.search(tag)
    label = (alt.group(1).strip() if alt else "") or "图片"
    return f"![{label}]({relative})"


def _http(method: str, url: str, *, headers: dict[str, str] | None = None,
          data: bytes | None = None, timeout: int = 60) -> tuple[int, bytes]:
    request = Request(url, data=data, headers=headers or {}, method=method)
    try:
        with urlopen(request, timeout=timeout) as response:
            return response.status, response.read()
    except HTTPError as error:
        return error.code, error.read()
    except URLError as error:
        raise OcrError(f"无法连接 OCR 服务：{error.reason}") from error


def _payload(status: int, body: bytes, action: str) -> dict[str, Any]:
    try:
        payload = json.loads(body.decode("utf-8"))
    except (UnicodeDecodeError, ValueError):
        payload = None
    if not isinstance(payload, dict):
        if status == 200:
            raise OcrError(f"{action}失败：服务返回了无法读取的响应。")
        raise OcrError(_lookup(status, None) or f"{action}失败（HTTP {status}）。")
    if status != 200:
        code = payload.get("code")
        message = _lookup(code, status) or payload.get("msg")
        raise OcrError(str(message) or f"{action}失败（HTTP {status}）。")
    code = payload.get("code")
    if code not in (None, 0):
        raise OcrError(_lookup(code, status) or f"{action}失败：{payload.get('msg')}")
    return payload


def _lookup(code: Any, status: int | None) -> str | None:
    return _MESSAGES.get(code) or (_MESSAGES.get(status) if status else None)