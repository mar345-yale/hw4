"""Campus Customs API — product catalogue, images, accounts, and the shop chat agent.

Run from the backend/ folder:
    uvicorn main:app --reload --port 8000
"""

import json
import sqlite3

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import audit
from agent import Deps, run_chat
from auth import PublicUser, current_user, router as auth_router
from chat_store import load_history, save_message
from db import DATA_DIR, SIZE_ORDER, category_for, connect_ro
from models import ChatHistoryMessage, ChatRequest, ChatResponse
from security import verify_token
from tools import fetch_product_cards

app = FastAPI(title="Campus Customs API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
app.include_router(auth_router)
# image_file_path values look like "products/x.jpg", relative to data/. Mount only the
# products folder so the database file in data/ is never reachable over HTTP.
app.mount("/images/products", StaticFiles(directory=DATA_DIR / "products"), name="images")


def connect() -> sqlite3.Connection:
    # Product reads are read-only so the shop can never modify the catalogue by accident.
    return connect_ro()


def product_summary(row: sqlite3.Row, total_stock: int) -> dict:
    return {
        "product_id": row["product_id"],
        "name": row["name"],
        "garment_type": row["garment_type"],
        "category": category_for(row["garment_type"]),
        "description": row["description"],
        "colors": json.loads(row["colors"]),
        "price": row["price"],
        "image_url": f"/images/{row['image_file_path']}",
        "in_stock": total_stock > 0,
    }


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/api/products")
def list_products() -> list[dict]:
    with connect() as conn:
        rows = conn.execute(
            """
            SELECT c.*, COALESCE(SUM(i.quantity), 0) AS total_stock
            FROM catalogue c LEFT JOIN inventory i USING (product_id)
            GROUP BY c.product_id
            ORDER BY c.name
            """
        ).fetchall()
    return [product_summary(r, r["total_stock"]) for r in rows]


@app.get("/api/products/{product_id}")
def get_product(product_id: str) -> dict:
    with connect() as conn:
        row = conn.execute(
            "SELECT * FROM catalogue WHERE product_id = ?", (product_id,)
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Product not found")
        stock = conn.execute(
            "SELECT size, quantity FROM inventory WHERE product_id = ?", (product_id,)
        ).fetchall()

    sizes = sorted(
        ({"size": s["size"], "quantity": s["quantity"]} for s in stock),
        key=lambda s: SIZE_ORDER.index(s["size"]) if s["size"] in SIZE_ORDER else 99,
    )
    product = product_summary(row, sum(s["quantity"] for s in sizes))
    product["search_tags"] = json.loads(row["search_tags"])
    product["sizes"] = sizes
    return product


def _shopper_from_auth(authorization: str | None) -> sqlite3.Row | None:
    """If a valid session token is present, return the shopper's user row so the agent can
    greet them and we can persist their history. Chat works for signed-out visitors too."""
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    user_id = verify_token(authorization.split(" ", 1)[1].strip())
    if user_id is None:
        return None
    with connect_ro() as conn:
        return conn.execute(
            "SELECT id, first_name, name, email FROM users WHERE id = ?", (user_id,)
        ).fetchone()


def _product_name(product_id: str | None) -> str | None:
    if not product_id:
        return None
    with connect_ro() as conn:
        row = conn.execute(
            "SELECT name FROM catalogue WHERE product_id = ?", (product_id,)
        ).fetchone()
    return row["name"] if row else None


@app.post("/api/chat", response_model=ChatResponse)
async def chat(body: ChatRequest, authorization: str | None = Header(default=None)) -> ChatResponse:
    shopper = _shopper_from_auth(authorization)
    deps = Deps(
        first_name=shopper["first_name"] if shopper else None,
        full_name=shopper["name"] if shopper else None,
        email=shopper["email"] if shopper else None,
        current_product_id=body.product_id,
        current_product_name=_product_name(body.product_id),
    )
    who = shopper["email"] if shopper else "guest"
    try:
        result = await run_chat(body.message, body.history, deps)
    except Exception as exc:
        # The model provider's own content filter can reject adversarial/unsafe prompts
        # upstream. Treat that as a safe refusal (in character) rather than a server error.
        if "content_filter" in str(exc).lower() or "content management policy" in str(exc).lower():
            audit.log_error(who, body.message, body.product_id, "content_filter")
            return ChatResponse(
                reply=(
                    "I can’t help with that one — I’m just the Campus Customs shop helper. "
                    "But I’d love to help you find some Yale gear! Ask me about hoodies, sizes, "
                    "prices, or a gift for the Yale family in your life."
                ),
                products=[],
            )
        audit.log_error(who, body.message, body.product_id, "error")
        raise HTTPException(
            status_code=502,
            detail="The shop assistant is having trouble right now. Please try again in a moment.",
        )
    reply = result.output
    # Record the agent-loop activity (tool calls, products, stop reason) to the audit trail.
    audit.log_run(who, body.message, body.product_id, result, "completed")
    # Rebuild cards from the database so prices and stock are authoritative, not model-authored.
    products = fetch_product_cards(reply.product_ids)
    # Persist the turn only for logged-in shoppers (guests chat without being saved).
    if shopper:
        save_message(shopper["id"], "user", body.message)
        save_message(shopper["id"], "assistant", reply.reply, reply.product_ids)
    return ChatResponse(reply=reply.reply, products=products)


@app.get("/api/chat/history", response_model=list[ChatHistoryMessage])
def chat_history(user: PublicUser = Depends(current_user)) -> list[ChatHistoryMessage]:
    """The signed-in shopper's saved conversation, replayed when they return."""
    return load_history(user.id)
