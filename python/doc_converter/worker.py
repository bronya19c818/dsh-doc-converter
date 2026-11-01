"""Serial JSONL transport for the HTTP-independent document application."""

from __future__ import annotations

import argparse
import contextlib
import json
import logging
import sys
from collections.abc import Sequence
from pathlib import Path
from typing import Any

from doc_converter.application import Application

_LOG = logging.getLogger(__name__)


def _error_code(error: Exception) -> str:
    if isinstance(error, FileNotFoundError):
        return "not_found"
    if isinstance(error, PermissionError):
        return "permission_denied"
    if isinstance(error, (ValueError, TypeError, KeyError)):
        return "invalid_request"
    if isinstance(error, RuntimeError):
        return "conversion_error"
    return "internal_error"


def main(argv: Sequence[str] | None = None) -> int:
    """Read one request at a time; reserve stdout exclusively for JSON replies."""
    parser = argparse.ArgumentParser(description="Doc Converter 插件业务工作进程")
    parser.add_argument("--data-root", required=True, type=Path)
    arguments = parser.parse_args(argv)
    if not arguments.data_root.is_absolute():
        parser.error("--data-root 必须是绝对路径。")
    for stream in (sys.stdin, sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8")
    logging.basicConfig(stream=sys.stderr, level=logging.INFO)
    with contextlib.redirect_stdout(sys.stderr):
        application = Application(arguments.data_root)
    for line in sys.stdin:
        if not line.strip():
            continue
        request_id: Any = None
        try:
            request = json.loads(line)
            if not isinstance(request, dict):
                raise ValueError("请求必须是 JSON 对象。")
            request_id = request.get("id")
            action = request.get("action")
            if not isinstance(action, str):
                raise ValueError("action 必须是字符串。")
            params = request.get("params", {})
            if not isinstance(params, dict):
                raise ValueError("params 必须是 JSON 对象。")
            with contextlib.redirect_stdout(sys.stderr):
                result = application.dispatch(action, params)
            response = {"id": request_id, "ok": True, "result": result}
        except Exception as error:
            if _error_code(error) == "internal_error":
                _LOG.exception("业务请求未预期失败")
            response = {"id": request_id, "ok": False,
                        "error": {"code": _error_code(error), "message": str(error)}}
        sys.stdout.write(json.dumps(response, ensure_ascii=False) + "\n")
        sys.stdout.flush()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
