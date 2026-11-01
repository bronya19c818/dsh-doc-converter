"""HTTP-independent application operations shared by plugin UI and agent tools."""

from __future__ import annotations

import json
import mimetypes
import os
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from tempfile import NamedTemporaryFile
from threading import RLock
from typing import Any
from uuid import uuid4

from doc_converter.docx_direct import analyze_docx, normalize_docx_direct
from doc_converter.docx_direct.audit import AUDIT_FILENAMES
from doc_converter.filename import safe_docx_filename
from doc_converter.importers import import_document
from doc_converter.importers.libreoffice import resolve_libreoffice
from doc_converter.markdown_pipeline import normalize_plugin_markdown
from doc_converter.renderer import RendererError, render_docx
from doc_converter.storage import atomic_write_text, data_child
from doc_converter.style_library import StyleLibrary, StylePack, create_style_pack
from doc_converter.style_schema import migrate_roles


class Application:
    """One data-root owner; dispatch serializes all application mutations."""

    def __init__(self, data_root: Path) -> None:
        self.data_root = Path(data_root).expanduser().resolve()
        self.data_root.mkdir(parents=True, exist_ok=True)
        self._jobs_root = data_child(self.data_root, "jobs")
        data_child(self.data_root, "style-packs")
        self._styles = StyleLibrary(self.data_root)
        self._lock = RLock()

    def dispatch(self, action: str, params: dict[str, Any]) -> Any:
        """Execute one public operation and return JSON-serializable data."""
        if not isinstance(params, dict):
            raise ValueError("params 必须是 JSON 对象。")
        handlers = {
            "dependencies": self._dependencies,
            "list_styles": self._list_styles,
            "create_style": self._create_style,
            "revise_style": self._revise_style,
            "migrate_styles": self._migrate_styles,
            "delete_style": self._delete_style,
            "import_file": self._import_file,
            "convert": self._convert,
            "get_job": self._get_job,
            "artifact": self._artifact,
        }
        if action not in handlers:
            raise ValueError(f"不支持的操作：{action}")
        with self._lock:
            return handlers[action](params)

    def _dependencies(self, params: dict[str, Any]) -> dict[str, Any]:
        pandoc = self._probe_tool(self._system_pandoc)
        libreoffice = self._probe_tool(resolve_libreoffice)
        return {
            "python": {"available": True, "version": sys.version.split()[0],
                       "executable": sys.executable},
            "pandoc": pandoc, "libreoffice": libreoffice,
            "capabilities": {"docx": True, "markdown": pandoc["available"],
                             "doc": pandoc["available"] and libreoffice["available"]},
        }

    @staticmethod
    def _probe_tool(resolver: Any) -> dict[str, Any]:
        try:
            path = resolver()
            result = subprocess.run(
                [str(path), "--version"], capture_output=True, text=True,
                encoding="utf-8", errors="replace", timeout=8, check=False,
            )
            if result.returncode:
                raise RuntimeError(result.stderr.strip() or "程序版本检查失败。")
            return {"available": True, "path": str(path),
                    "version": (result.stdout.strip() or result.stderr.strip()).splitlines()[0]}
        except (OSError, ValueError, RuntimeError, subprocess.TimeoutExpired, IndexError) as error:
            return {"available": False, "error": str(error)}

    @staticmethod
    def _system_pandoc() -> Path:
        configured = os.environ.get("DOC_CONVERTER_PANDOC", "").strip().strip('"')
        if configured:
            candidate = Path(configured).expanduser()
            found = str(candidate) if candidate.is_file() else shutil.which(configured)
            if not found:
                raise RendererError("DOC_CONVERTER_PANDOC 指向的 Pandoc 不存在。")
            return Path(found).resolve()
        found = shutil.which("pandoc")
        if found:
            return Path(found).resolve()
        if os.name == "nt":
            for variable in ("ProgramFiles", "LOCALAPPDATA"):
                base = os.environ.get(variable)
                if base:
                    for suffix in (("Pandoc", "pandoc.exe"), ("Programs", "Pandoc", "pandoc.exe")):
                        candidate = Path(base).joinpath(*suffix)
                        if candidate.is_file():
                            return candidate.resolve()
        raise RendererError("未找到系统 Pandoc，无法生成 DOCX。")

    def _list_styles(self, params: dict[str, Any]) -> list[dict[str, Any]]:
        return [pack.model_dump(mode="json") for pack in self._styles.list_packs()]

    def _create_style(self, params: dict[str, Any]) -> dict[str, Any]:
        name = self._name(params.get("name"))
        pack = create_style_pack(name=name, format_id="docx")
        if params.get("roles") is not None:
            if not isinstance(params["roles"], dict):
                raise ValueError("roles 必须是对象。")
            pack = pack.model_copy(update={"roles": migrate_roles(params["roles"])})
        return self._styles.save(pack).model_dump(mode="json")

    def _revise_style(self, params: dict[str, Any]) -> dict[str, Any]:
        version = self._version(params.get("base_version"))
        pack = self._styles.get(str(params.get("id", "")), version)
        roles = params.get("roles")
        if not isinstance(roles, dict):
            raise ValueError("roles 必须是对象。")
        revised = pack.model_copy(update={
            "name": self._name(params.get("name", pack.name)),
            "roles": migrate_roles(roles),
        })
        return self._styles.save(revised, expected_version=version).model_dump(mode="json")

    def _delete_style(self, params: dict[str, Any]) -> dict[str, Any]:
        pack_id = str(params.get("id", "")).strip()
        if not pack_id:
            raise ValueError("缺少要删除的样式预设 ID。")
        removed = self._styles.delete_pack(pack_id)
        if not removed:
            raise FileNotFoundError("未找到要删除的样式预设。")
        return {"deleted": pack_id}

    def _migrate_styles(self, params: dict[str, Any]) -> dict[str, Any]:
        source_root = Path(str(params.get("source_root", ""))).expanduser()
        if not source_root.is_absolute():
            raise ValueError("source_root 必须是绝对路径。")
        source_root = source_root.resolve()
        source = source_root if source_root.name == "style-packs" else source_root / "style-packs"
        if not source.is_dir():
            raise FileNotFoundError("未找到来源 style-packs 目录。")
        selected: list[tuple[Path, bytes]] = []
        invalid = 0
        skipped = 0
        for directory in sorted(source.iterdir()):
            if not directory.is_dir():
                continue
            safe_source = data_child(source, directory.name)
            versions = sorted(
                (path for path in safe_source.glob("*.json")
                 if path.stem.isdigit() and int(path.stem) >= 1),
                key=lambda path: int(path.stem), reverse=True,
            )
            if not versions:
                continue
            chosen: tuple[Path, bytes] | None = None
            for candidate in versions:
                try:
                    if candidate.resolve().parent != safe_source.resolve():
                        raise ValueError("样式版本路径越界。")
                    raw_bytes = candidate.read_bytes()
                    raw = json.loads(raw_bytes.decode("utf-8-sig"))
                    if not isinstance(raw, dict):
                        raise ValueError("样式配置必须是对象。")
                    version = self._version(raw.get("version"))
                    if raw.get("id") != directory.name or version != int(candidate.stem):
                        raise ValueError("样式身份或版本与文件位置不一致。")
                    schema = raw.get("schema_version")
                    if schema not in {None, "docx-style/v1", "docx-style/v2", "docx-style/v3"}:
                        raise ValueError("不支持的样式 schema。")
                    validated = StylePack.model_validate(raw)
                    if validated.format_id != "docx":
                        raise ValueError("只迁移 DOCX 样式配置。")
                    target_directory = data_child(self.data_root / "style-packs", directory.name)
                    target = data_child(target_directory, candidate.name)
                    chosen = (target, raw_bytes)
                    break
                except (OSError, ValueError, TypeError):
                    invalid += 1
            if chosen is None:
                raise ValueError(f"样式包 {directory.name} 没有有效配置。")
            target, raw_bytes = chosen
            if target.exists():
                if target.read_bytes() != raw_bytes:
                    raise ValueError(f"目标样式版本内容冲突：{directory.name}/{target.name}")
                skipped += 1
                continue
            if target.parent.exists() and any(
                path.stem.isdigit() for path in target.parent.glob("*.json")
            ):
                raise ValueError(f"目标已有其他样式版本：{directory.name}")
            selected.append(chosen)
        # Validate every source and conflict before publishing any new revision.
        for target, raw_bytes in selected:
            target.parent.mkdir(parents=True, exist_ok=True)
            staged: Path | None = None
            try:
                with NamedTemporaryFile(dir=target.parent, prefix=".migrate-", delete=False) as handle:
                    staged = Path(handle.name)
                    handle.write(raw_bytes)
                    handle.flush()
                    os.fsync(handle.fileno())
                staged.replace(target)
            finally:
                if staged is not None:
                    staged.unlink(missing_ok=True)
        return {"migrated": len(selected), "skipped": skipped, "invalid": invalid}

    def _import_file(self, params: dict[str, Any]) -> dict[str, Any]:
        source = Path(str(params.get("source_path", ""))).expanduser()
        if not source.is_absolute() or not source.is_file():
            raise ValueError("source_path 必须指向已存在文件的绝对路径。")
        source = source.resolve()
        suffix = source.suffix.lower()
        if suffix not in {".docx", ".md", ".markdown", ".doc"}:
            raise ValueError("当前支持 .md、.markdown、.docx 和 .doc 文件。")
        style = self._selected_style(params)
        if suffix == ".docx":
            analyze_docx(source)
        job_id = str(uuid4())
        directory = self._job_directory(job_id)
        (directory / "source").mkdir(parents=True, exist_ok=False)
        (directory / "work").mkdir()
        snapshot = directory / "source" / source.name
        shutil.copyfile(source, snapshot)
        warnings: list[str] = []
        if suffix != ".docx":
            imported = import_document(snapshot, job_directory=directory)
            markdown = imported.markdown.replace("\r\n", "\n").replace("\r", "\n")
            atomic_write_text(directory / "work" / "source.md", markdown)
            warnings = imported.warnings
        job = {
            "id": job_id, "status": "ready", "source_name": source.name,
            "source_format": "markdown" if suffix in {".md", ".markdown"} else suffix[1:],
            "conversion_mode": "docx-direct" if suffix == ".docx" else "round-trip",
            "style_pack_id": style.id, "style_pack_version": style.version,
            "artifacts": [], "output_name": None, "error": None,
            "import_warnings": warnings,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self._save_job(job)
        return job

    def _convert(self, params: dict[str, Any]) -> dict[str, Any]:
        job = self._get_job(params)
        selected = {
            "style_pack_id": params.get("style_pack_id", job["style_pack_id"]),
            "style_pack_version": params.get("style_pack_version", job["style_pack_version"]),
        }
        style = self._selected_style(selected)
        directory = self._job_directory(job["id"])
        output_name = safe_docx_filename(None, job["source_name"])
        try:
            if job["conversion_mode"] == "docx-direct":
                normalize_docx_direct(
                    directory / "source" / job["source_name"], style,
                    directory / output_name, audit_dir=directory,
                )
                artifacts = [output_name, *AUDIT_FILENAMES]
            else:
                source = (directory / "work" / "source.md").read_text(encoding="utf-8")
                normalized = normalize_plugin_markdown(source, filename=job["source_name"])
                if not normalized.report["integrity"]["passed"]:
                    raise ValueError("内容完整性校验失败，已阻止 DOCX 生成。")
                output_name = safe_docx_filename(normalized.metadata.get("title"), job["source_name"])
                render_docx(
                    markdown=normalized.markdown, style_pack=style,
                    output_path=directory / output_name, work_dir=directory / "work",
                    pandoc_path=self._system_pandoc(), metadata_final=True,
                )
                atomic_write_text(directory / "document.normalized.md", normalized.markdown)
                atomic_write_text(directory / "normalization-report.json", json.dumps(
                    normalized.report, ensure_ascii=False, indent=2,
                ))
                atomic_write_text(directory / "style-pack.snapshot.json", style.model_dump_json(indent=2))
                artifacts = [output_name, "document.normalized.md", "normalization-report.json",
                             "style-pack.snapshot.json"]
            job.update({
                "status": "completed", "style_pack_id": style.id,
                "style_pack_version": style.version,
                "output_name": output_name, "error": None,
                "artifacts": artifacts,
            })
        except Exception as error:
            job.update({"status": "failed", "error": str(error)})
        self._save_job(job)
        return job

    def _get_job(self, params: dict[str, Any]) -> dict[str, Any]:
        directory = self._job_directory(str(params.get("job_id", "")))
        job = json.loads((directory / "job.json").read_text(encoding="utf-8"))
        if job.get("id") != directory.name:
            raise ValueError("任务身份与目录不一致。")
        return job

    def _artifact(self, params: dict[str, Any]) -> dict[str, str]:
        job = self._get_job(params)
        name = str(params.get("name", ""))
        allowed = {job.get("output_name"), *AUDIT_FILENAMES,
                   "normalization-report.json", "document.normalized.md"}
        if name not in allowed or name not in job["artifacts"]:
            raise ValueError("该文件不是已登记的正式产物。")
        path = data_child(self._job_directory(job["id"]), name)
        if not path.is_file():
            raise FileNotFoundError("正式产物不存在。")
        return {"path": str(path.resolve()), "name": name,
                "mime": mimetypes.guess_type(name)[0] or "application/octet-stream"}

    def _job_directory(self, job_id: str) -> Path:
        return data_child(self._jobs_root, job_id)

    def _save_job(self, job: dict[str, Any]) -> None:
        atomic_write_text(
            self._job_directory(job["id"]) / "job.json",
            json.dumps(job, ensure_ascii=False, indent=2),
        )

    def _selected_style(self, params: dict[str, Any]) -> StylePack:
        return self._styles.get(
            str(params.get("style_pack_id", "")), self._version(params.get("style_pack_version")),
        )

    @staticmethod
    def _version(value: Any) -> int:
        if isinstance(value, bool) or not isinstance(value, int) or value < 1:
            raise ValueError("样式版本必须为正整数。")
        return value

    @staticmethod
    def _name(value: Any) -> str:
        if not isinstance(value, str) or not 1 <= len(value.strip()) <= 80:
            raise ValueError("样式名称需要 1–80 个字符。")
        return value.strip()
