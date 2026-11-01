"""Versioned, local DOCX style-pack storage."""

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from threading import Lock
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, Field

from doc_converter.storage import atomic_write_text, data_child
from doc_converter.style_schema import migrate_roles

_REVISION_LOCK = Lock()


class StylePack(BaseModel):
    """A portable versioned style configuration for one output format."""

    id: str
    name: str
    format_id: str
    version: int = 0
    created_at: datetime
    roles: dict[str, dict[str, Any]] = Field(default_factory=dict)
    schema_version: str = "docx-style/v3"

    @classmethod
    def model_validate(cls, obj: Any, *args: Any, **kwargs: Any) -> "StylePack":
        if isinstance(obj, dict):
            obj = dict(obj)
            # The loader always returns the current normalized schema.  Older
            # JSON files are upgraded by ``migrate_roles`` without rewriting
            # the original revision on disk.
            obj["schema_version"] = "docx-style/v3"
            obj["roles"] = migrate_roles(obj.get("roles"))
        return super().model_validate(obj, *args, **kwargs)

    @classmethod
    def model_validate_json(cls, json_data: str | bytes | bytearray, *args: Any, **kwargs: Any) -> "StylePack":
        import json

        return cls.model_validate(json.loads(json_data), *args, **kwargs)


def create_style_pack(*, name: str, format_id: str) -> StylePack:
    """Create an unsaved style pack with the common DOCX semantic roles."""

    return StylePack(
        id=str(uuid4()),
        name=name,
        format_id=format_id,
        created_at=datetime.now(timezone.utc),
        roles=migrate_roles({}),
    )


class StyleLibrary:
    """Stores immutable style-pack revisions in an application-owned folder."""

    def __init__(self, data_root: Path) -> None:
        self._root = data_root / "style-packs"

    def save(self, pack: StylePack, *, expected_version: int | None = None) -> StylePack:
        """Persist a new revision without changing older revisions."""

        pack_directory = data_child(self._root, pack.id)
        # ponytail: one process serializes revision publication; shared roots
        # across multiple workers require a separate cross-process design.
        with _REVISION_LOCK:
            existing_versions = [int(path.stem) for path in pack_directory.glob("*.json") if path.stem.isdigit()]
            latest_version = max(existing_versions, default=0)
            if expected_version is not None and latest_version != expected_version:
                raise ValueError("Style revision has changed.")
            next_version = latest_version + 1
            saved = pack.model_copy(update={"version": next_version})
            pack_directory.mkdir(parents=True, exist_ok=True)
            atomic_write_text(pack_directory / f"{next_version}.json", saved.model_dump_json(indent=2))
        return saved

    def get(self, pack_id: str, version: int) -> StylePack:
        """Load one exact immutable style-pack revision."""

        try:
            pack_directory = data_child(self._root, pack_id)
        except ValueError as error:
            raise FileNotFoundError("Invalid style-pack identifier.") from error
        path = pack_directory / f"{version}.json"
        return StylePack.model_validate_json(path.read_text(encoding="utf-8"))

    def list_packs(self) -> list[StylePack]:
        """List the newest revision of each available style pack."""

        if not self._root.exists():
            return []

        packs: list[StylePack] = []
        for directory in self._root.iterdir():
            if not directory.is_dir():
                continue
            versions = sorted((int(path.stem) for path in directory.glob("*.json") if path.stem.isdigit()))
            if versions:
                packs.append(self.get(directory.name, versions[-1]))
        return sorted(packs, key=lambda pack: (pack.name, pack.id))

    def delete_pack(self, pack_id: str) -> bool:
        """Remove one style pack and all of its immutable revisions."""

        try:
            pack_directory = data_child(self._root, pack_id)
        except ValueError as error:
            raise FileNotFoundError("Invalid style-pack identifier.") from error
        if not pack_directory.is_dir():
            return False
        with _REVISION_LOCK:
            for path in sorted(pack_directory.glob("*.json")):
                path.unlink()
            pack_directory.rmdir()
        return True
