"""DOCX rendering through local Pandoc and a self-contained style pack."""

from __future__ import annotations

import os
import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path
from tempfile import TemporaryDirectory
from zipfile import BadZipFile

from docx import Document
from docx.opc.exceptions import PackageNotFoundError
from lxml.etree import XMLSyntaxError  # type: ignore[import-untyped]

from doc_converter.docx_extensions import (
    extract_complex_tables,
    extract_page_breaks,
    restore_complex_tables,
    restore_endnotes,
    restore_page_breaks,
)
from doc_converter.docx_postprocess import (
    apply_postprocess,
    protect_ordered_list_literals,
    split_metadata,
)
from doc_converter.docx_styles import compile_styles
from doc_converter.markdown_inline import resolve_inline_markdown
from doc_converter.markdown_metadata import write_metadata_filter
from doc_converter.style_library import StylePack


class RendererError(RuntimeError):
    """Raised when a local rendering dependency cannot create the requested DOCX."""


@dataclass(frozen=True)
class RenderResult:
    """The successful DOCX output and deterministic renderer details."""

    output_path: Path
    reference_docx_path: Path
    pandoc_path: Path


def render_docx(
    *,
    markdown: str,
    style_pack: StylePack,
    output_path: Path,
    work_dir: Path,
    pandoc_path: Path | None = None,
    metadata_final: bool = False,
) -> RenderResult:
    """Publish a valid DOCX; ``metadata_final`` disables fresh role inference."""

    if style_pack.format_id != "docx":
        raise ValueError("DOCX 渲染器只能使用 format_id 为 docx 的样式包。")

    try:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with TemporaryDirectory(prefix=".render-", dir=output_path.parent) as scratch:
            staged_output = Path(scratch) / "document.docx"
            result = _render_docx(
                markdown=markdown, style_pack=style_pack, output_path=staged_output,
                work_dir=work_dir, pandoc_path=pandoc_path, metadata_final=metadata_final,
            )
            Document(str(staged_output))
            staged_output.replace(output_path)
        return RenderResult(
            output_path=output_path, reference_docx_path=result.reference_docx_path,
            pandoc_path=result.pandoc_path,
        )
    except (OSError, BadZipFile, PackageNotFoundError, XMLSyntaxError, KeyError, ValueError) as error:
        raise RendererError(f"DOCX 渲染或后处理失败：{error}") from error


def _render_docx(
    *, markdown: str, style_pack: StylePack, output_path: Path,
    work_dir: Path, pandoc_path: Path | None, metadata_final: bool = False,
) -> RenderResult:
    """Build the staged document, retaining the task's resource directory."""
    resolved_pandoc = pandoc_path or resolve_pandoc()
    work_dir.mkdir(parents=True, exist_ok=True)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    metadata, body = split_metadata(markdown, infer_metadata=not metadata_final)
    # Ambiguous inline markers (``*`` arithmetic, ``^`` exponents, ``_`` in
    # identifiers) are scored before Pandoc sees them, so a marker is only
    # converted when the evidence supports emphasis or a superscript.
    body = resolve_inline_markdown(body).markdown
    body = extract_page_breaks(body)
    body, complex_tables = extract_complex_tables(body)
    source_path = work_dir / "document.body.md"
    reference_path = work_dir / "reference.docx"
    # Write LF explicitly: on Windows the default newline would be CRLF, and
    # Pandoc then drops backslash escapes such as ``\*`` in the same paragraph.
    source_path.write_text(
        protect_ordered_list_literals(body), encoding="utf-8", newline="\n",
    )
    compile_reference_docx(style_pack, reference_path)

    command = [
        str(resolved_pandoc),
        str(source_path),
        "--from=gfm+footnotes+tex_math_dollars+raw_html+subscript+superscript",
        "--to=docx",
        "--standalone",
        f"--reference-doc={reference_path}",
        f"--output={output_path}",
    ]
    if metadata_final:
        metadata_filter = write_metadata_filter(metadata, work_dir)
        if metadata_filter is not None:
            command.append(f"--lua-filter={metadata_filter}")
    try:
        completed = subprocess.run(
            command,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            check=False,
            cwd=work_dir.parent,
            timeout=180,
        )
    except subprocess.TimeoutExpired as error:
        raise RendererError("DOCX 渲染超时，请检查文件是否过大或包含不可用的资源。") from error
    except OSError as error:
        raise RendererError(f"无法启动 Pandoc 生成 DOCX：{error}") from error
    if completed.returncode != 0 or not output_path.exists():
        detail = completed.stderr.strip() or completed.stdout.strip() or "Pandoc 未生成 DOCX。"
        raise RendererError(f"DOCX 渲染失败：{detail}")

    document = Document(str(output_path))
    restore_complex_tables(document, complex_tables, resource_root=work_dir.parent)
    restore_page_breaks(document)
    image_role = style_pack.roles.get("image", {})
    image_settings = image_role.get("image", {})
    max_image_width = image_settings.get("max_width_cm") if isinstance(image_settings, dict) else None
    apply_postprocess(
        document,
        metadata,
        max_image_width_cm=max_image_width if isinstance(max_image_width, (int, float)) else None,
        metadata_rendered=metadata_final,
    )
    document.save(str(output_path))
    restore_endnotes(output_path, markdown)
    return RenderResult(output_path=output_path, reference_docx_path=reference_path, pandoc_path=resolved_pandoc)


def compile_reference_docx(style_pack: StylePack, output_path: Path) -> None:
    """Compile structured roles into a Pandoc reference DOCX."""

    document = Document()
    compile_styles(document, style_pack)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    document.save(str(output_path))


def resolve_pandoc(*, bundled_root: Path | None = None) -> Path:
    """Resolve a bundled Pandoc first, then an explicitly configured system copy."""

    executable_name = "pandoc.exe" if os.name == "nt" else "pandoc"
    bundled_directory = bundled_root or Path(__file__).resolve().parent / "vendor" / "pandoc"
    bundled_executable = bundled_directory / executable_name
    if bundled_executable.exists():
        return bundled_executable

    configured_path = os.environ.get("DOC_CONVERTER_PANDOC")
    if configured_path:
        configured_executable = Path(configured_path)
        if configured_executable.exists():
            return configured_executable
        raise RendererError("DOC_CONVERTER_PANDOC 指向的 Pandoc 文件不存在。")

    executable = shutil.which("pandoc")
    if executable is None:
        raise RendererError("未找到内置或系统 Pandoc，无法生成 DOCX。")
    return Path(executable)
