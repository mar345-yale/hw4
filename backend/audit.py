"""Append-only audit trail of agent-loop activity.

Every chat run appends one entry to output/audit_trail.json: the time, the tool calls the
agent made (name + short args + short result), which products it surfaced, and the stop
reason. Existing entries are never wiped — prior runs are loaded and preserved on each
append, so the file grows across runs and restarts.
"""

import json
import threading
from datetime import datetime, timezone
from pathlib import Path

from pydantic_ai.messages import ModelResponse, ToolCallPart, ToolReturnPart

AUDIT_PATH = Path(__file__).resolve().parents[1] / "output" / "audit_trail.json"
_lock = threading.Lock()


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _short(value, limit: int = 200) -> str:
    text = value if isinstance(value, str) else json.dumps(value, default=str)
    text = " ".join(text.split())
    return text if len(text) <= limit else text[: limit - 1] + "…"


def tool_activity_from_result(result) -> list[dict]:
    """Pull each tool call (name, short args, short result) out of a PydanticAI run."""
    returns: dict[str, object] = {}
    for message in result.all_messages():
        for part in message.parts:
            if isinstance(part, ToolReturnPart):
                returns[part.tool_call_id] = part.content

    activity: list[dict] = []
    for message in result.all_messages():
        if not isinstance(message, ModelResponse):
            continue
        for part in message.parts:
            if isinstance(part, ToolCallPart):
                activity.append(
                    {
                        "time": _now(),
                        "tool": part.tool_name,
                        "args": _short(part.args),
                        "result": _short(returns.get(part.tool_call_id, "")),
                    }
                )
    return activity


def _model_requests(result) -> int:
    try:
        return sum(1 for m in result.all_messages() if isinstance(m, ModelResponse))
    except Exception:
        return 0


def _append(entry: dict) -> None:
    AUDIT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with _lock:
        existing: list = []
        if AUDIT_PATH.exists():
            try:
                existing = json.loads(AUDIT_PATH.read_text() or "[]")
                if not isinstance(existing, list):
                    existing = []
            except (ValueError, OSError):
                existing = []  # never wipe on a parse glitch; start a fresh tail
        existing.append(entry)
        AUDIT_PATH.write_text(json.dumps(existing, indent=2))


def log_run(user: str, message: str, product_id: str | None, result, stop_reason: str) -> None:
    """Record a successful agent run."""
    _append(
        {
            "time": _now(),
            "user": user,
            "message": _short(message),
            "page_product_id": product_id,
            "activity": tool_activity_from_result(result),
            "product_ids": list(getattr(result.output, "product_ids", []) or []),
            "model_requests": _model_requests(result),
            "stop_reason": stop_reason,
        }
    )


def log_error(user: str, message: str, product_id: str | None, reason: str) -> None:
    """Record a run that failed before producing output."""
    _append(
        {
            "time": _now(),
            "user": user,
            "message": _short(message),
            "page_product_id": product_id,
            "activity": [],
            "product_ids": [],
            "model_requests": 0,
            "stop_reason": reason,
        }
    )
