"""Small filesystem safeguards shared by local job and style storage."""

from __future__ import annotations

import os
from pathlib import Path
from tempfile import NamedTemporaryFile


def data_child(root: Path, identifier: str) -> Path:
    """Resolve a single portable directory name without escaping its data root."""
    if (
        not identifier
        or identifier in {".", ".."}
        or identifier.endswith((".", " "))
        or any(character in identifier for character in '/\\:<>"|?*\x00')
    ):
        raise ValueError("Invalid data identifier.")
    path = root / identifier
    if path.resolve().parent != root.resolve():
        raise ValueError("Data path escapes its root.")
    return path


def atomic_write_text(path: Path, content: str) -> None:
    """Publish UTF-8 text only after a complete write, keeping old data on failure."""
    staged_path: Path | None = None
    try:
        with NamedTemporaryFile(
            mode="w", encoding="utf-8", dir=path.parent,
            prefix=".write-", suffix=".tmp", delete=False,
        ) as staged:
            staged_path = Path(staged.name)
            staged.write(content)
            staged.flush()
            os.fsync(staged.fileno())
        staged_path.replace(path)
    finally:
        if staged_path is not None:
            staged_path.unlink(missing_ok=True)
