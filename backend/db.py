"""SQLite access for Campus Customs.

Product reads use a read-only connection. User writes (sign-up) use a read-write
connection, with foreign keys enforced.
"""

import sqlite3
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
DB_PATH = DATA_DIR / "campus_customs.db"


def connect_ro() -> sqlite3.Connection:
    conn = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)
    conn.row_factory = sqlite3.Row
    return conn


def connect_rw() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"]


def category_for(garment_type: str) -> str:
    """Collapse the 22 raw garment_type spellings into shop-friendly categories."""
    g = garment_type.lower()
    if "quarter-zip" in g:
        return "Quarter-Zips"
    if "hood" in g:
        return "Hoodies"
    if "fleece" in g or "jacket" in g:
        return "Fleece & Jackets"
    if "crew" in g or "mockneck" in g:
        return "Crewnecks"
    return "T-Shirts"
