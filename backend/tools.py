"""Tools the shop agent can call, plus helpers to build trustworthy product cards.

Every function reads the live database (read-only), so prices and stock are always real.
The agent uses the search/detail tools to decide what to recommend; the backend then
rebuilds the final cards from the database so the model can never invent a price.
"""

import json
import re

from db import SIZE_ORDER, category_for, connect_ro
from models import (
    ProductCard,
    ProductDetails,
    ProductSearchResult,
    SizeStock,
    StockCheck,
)


def _card_from_row(row) -> ProductCard:
    return ProductCard(
        product_id=row["product_id"],
        name=row["name"],
        category=category_for(row["garment_type"]),
        description=row["description"],
        price=row["price"],
        image_url=f"/images/{row['image_file_path']}",
        product_url=f"/products/{row['product_id']}",
        in_stock=row["total_stock"] > 0,
    )


def all_product_ids() -> set[str]:
    """Every valid product_id in the catalogue, for validating agent output."""
    with connect_ro() as conn:
        rows = conn.execute("SELECT product_id FROM catalogue").fetchall()
    return {r["product_id"] for r in rows}


def fetch_product_cards(product_ids: list[str]) -> list[ProductCard]:
    """Hydrate a list of product_ids into ProductCards, preserving the given order."""
    if not product_ids:
        return []
    placeholders = ",".join("?" for _ in product_ids)
    with connect_ro() as conn:
        rows = conn.execute(
            f"""
            SELECT c.*, COALESCE(SUM(i.quantity), 0) AS total_stock
            FROM catalogue c LEFT JOIN inventory i USING (product_id)
            WHERE c.product_id IN ({placeholders})
            GROUP BY c.product_id
            """,
            product_ids,
        ).fetchall()
    by_id = {r["product_id"]: _card_from_row(r) for r in rows}
    return [by_id[pid] for pid in product_ids if pid in by_id]


# ----- Agent-callable tools ------------------------------------------------------------

# Words that name a shop category, so "hoodies" or "quarter-zips" narrows by category
# instead of being matched literally (product names say "hoodie", not "hoodies").
_CATEGORY_TOKENS = {
    "hoodie": "Hoodies", "hoodies": "Hoodies", "hooded": "Hoodies",
    "crewneck": "Crewnecks", "crewnecks": "Crewnecks", "crew": "Crewnecks",
    "tee": "T-Shirts", "tees": "T-Shirts", "tshirt": "T-Shirts", "tshirts": "T-Shirts",
    "shirt": "T-Shirts", "shirts": "T-Shirts",
    "quarterzip": "Quarter-Zips", "quarter": "Quarter-Zips", "zip": "Quarter-Zips", "zips": "Quarter-Zips",
    "fleece": "Fleece & Jackets", "jacket": "Fleece & Jackets", "jackets": "Fleece & Jackets",
}

# Conversational filler to ignore, so "what hoodies do you have" searches for "hoodies".
_STOPWORDS = {
    "what", "which", "do", "you", "have", "got", "show", "me", "i", "a", "an", "the", "is",
    "are", "any", "some", "for", "of", "your", "can", "to", "in", "on", "with", "and", "or",
    "please", "get", "want", "need", "looking", "look", "my", "that", "this", "under", "below",
    "over", "above", "less", "than", "cheap", "cheaper", "price", "priced", "dollar", "dollars",
    "buck", "bucks", "something", "anything", "about", "like", "would", "could",
}


def _tokenize(query: str) -> list[str]:
    return [w for w in re.findall(r"[a-z0-9]+", query.lower()) if len(w) > 1 and w not in _STOPWORDS]


def _hay_has(hay: str, word: str) -> bool:
    """Substring match with light singular/plural tolerance."""
    if word in hay:
        return True
    if word.endswith("s") and word[:-1] in hay:
        return True
    return (word + "s") in hay


def search_products(
    query: str, category: str | None = None, limit: int = 6
) -> list[ProductSearchResult]:
    """Search the catalogue for merch matching what the shopper described.

    Handles plurals ("hoodies"), category words, and natural phrases ("what hoodies do you
    have"). Returns lightweight records (id, name, category, price, colors, in_stock,
    description), best match first.
    `category` optionally narrows to one of: Hoodies, Crewnecks, T-Shirts, Quarter-Zips,
    Fleece & Jackets.
    """
    tokens = _tokenize(query)
    # A category can come from the explicit arg or from a category word in the query.
    derived_category = category
    if not derived_category:
        for t in tokens:
            if t in _CATEGORY_TOKENS:
                derived_category = _CATEGORY_TOKENS[t]
                break
    # The remaining words are real search terms (drop the category labels themselves).
    content_words = [t for t in tokens if t not in _CATEGORY_TOKENS]

    with connect_ro() as conn:
        rows = conn.execute(
            """
            SELECT c.*, COALESCE(SUM(i.quantity), 0) AS total_stock
            FROM catalogue c LEFT JOIN inventory i USING (product_id)
            GROUP BY c.product_id
            ORDER BY c.name
            """
        ).fetchall()

    scored = []  # tuples of (match score, in-stock rank, row)
    for r in rows:
        rcat = category_for(r["garment_type"])
        if derived_category and rcat != derived_category:
            continue
        haystack = " ".join(
            [r["name"], r["description"], r["colors"], r["search_tags"], rcat]
        ).lower()
        if content_words:
            score = sum(1 for w in content_words if _hay_has(haystack, w))
            if score == 0:
                continue  # none of the real search terms matched
        elif derived_category:
            score = 0  # category-only query: everything in the category qualifies
        else:
            continue  # nothing to search on
        # Prefer in-stock items when scores tie.
        scored.append((score, 1 if r["total_stock"] > 0 else 0, r))

    scored.sort(key=lambda x: (-x[0], -x[1], x[2]["name"]))
    return [
        ProductSearchResult(
            product_id=r["product_id"],
            name=r["name"],
            category=category_for(r["garment_type"]),
            price=r["price"],
            colors=json.loads(r["colors"]),
            description=r["description"],
            in_stock=r["total_stock"] > 0,
        )
        for _, _, r in scored[:limit]
    ]


def get_product_details(product_id: str) -> ProductDetails | None:
    """Full detail for one product, including price and per-size stock. Use before making
    claims about a specific item's price, colors, or availability."""
    with connect_ro() as conn:
        row = conn.execute(
            "SELECT * FROM catalogue WHERE product_id = ?", (product_id,)
        ).fetchone()
        if row is None:
            return None
        stock = conn.execute(
            "SELECT size, quantity FROM inventory WHERE product_id = ?", (product_id,)
        ).fetchall()
    sizes = sorted(
        (SizeStock(size=s["size"], quantity=s["quantity"]) for s in stock),
        key=lambda s: SIZE_ORDER.index(s.size) if s.size in SIZE_ORDER else 99,
    )
    return ProductDetails(
        product_id=row["product_id"],
        name=row["name"],
        category=category_for(row["garment_type"]),
        garment_type=row["garment_type"],
        description=row["description"],
        colors=json.loads(row["colors"]),
        price=row["price"],
        sizes=sizes,
        in_stock=any(s.quantity > 0 for s in sizes),
    )


def check_size_stock(product_id: str, size: str) -> StockCheck:
    """Check whether a specific size of a product is in stock, and how many are left.
    `size` is one of XS, S, M, L, XL, XXL."""
    with connect_ro() as conn:
        row = conn.execute(
            "SELECT quantity FROM inventory WHERE product_id = ? AND size = ? COLLATE NOCASE",
            (product_id, size),
        ).fetchone()
    if row is None:
        return StockCheck(
            product_id=product_id,
            size=size.upper(),
            available=False,
            quantity=0,
            note="That size isn't listed for this product.",
        )
    qty = row["quantity"]
    return StockCheck(
        product_id=product_id, size=size.upper(), available=qty > 0, quantity=qty
    )
