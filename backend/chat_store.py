"""Save and reload chat history in the `chat_messages` table.

Only logged-in shoppers are persisted (the table's `user_id` ties each message to an
account). Guests chat fine; their messages just aren't written. Assistant turns store the
recommended product_ids; on reload we re-hydrate those into fresh cards so prices and stock
are current, not frozen snapshots.
"""

import json

from db import connect_ro, connect_rw
from models import ChatHistoryMessage
from tools import fetch_product_cards


def save_message(user_id: int, role: str, content: str, product_ids: list[str] | None = None) -> None:
    products_json = json.dumps(product_ids) if product_ids else None
    with connect_rw() as conn:
        conn.execute(
            "INSERT INTO chat_messages (user_id, role, content, products_json) VALUES (?, ?, ?, ?)",
            (user_id, role, content, products_json),
        )
        conn.commit()


def _extract_ids(products_json: str | None) -> list[str]:
    """Pull product_ids out of a stored products_json, tolerating both our format
    (list of id strings) and the seed format (list of card objects)."""
    if not products_json:
        return []
    try:
        data = json.loads(products_json)
    except (ValueError, TypeError):
        return []
    ids: list[str] = []
    for item in data:
        if isinstance(item, str):
            ids.append(item)
        elif isinstance(item, dict) and item.get("product_id"):
            ids.append(item["product_id"])
    return ids


def load_history(user_id: int, limit: int = 100) -> list[ChatHistoryMessage]:
    with connect_ro() as conn:
        rows = conn.execute(
            """
            SELECT role, content, products_json, created_at
            FROM chat_messages WHERE user_id = ? ORDER BY id LIMIT ?
            """,
            (user_id, limit),
        ).fetchall()
    return [
        ChatHistoryMessage(
            role=r["role"],
            content=r["content"],
            products=fetch_product_cards(_extract_ids(r["products_json"])),
            created_at=r["created_at"],
        )
        for r in rows
    ]
