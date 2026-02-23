"""
memories_db.py
--------------
SQLite persistence layer for AI of Memories.
Stores: user profile, journal entries, and structured knowledge graph tags.
All data belongs to the user and stays on their local machine.
"""

import sqlite3
import json
from datetime import datetime
from pathlib import Path

DB_PATH = Path(__file__).parent / "memories.db"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create all tables if they don't exist."""
    with get_connection() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS profile (
                id INTEGER PRIMARY KEY,
                key TEXT UNIQUE NOT NULL,
                value TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS journal_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT NOT NULL,
                ai_response TEXT,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS knowledge_graph (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entry_id INTEGER,
                tag_type TEXT NOT NULL,
                tag_value TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (entry_id) REFERENCES journal_entries(id)
            );
        """)


# ── Profile ──────────────────────────────────────────────────────────────────

def set_profile(key: str, value: str):
    now = datetime.now().isoformat()
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO profile (key, value, updated_at) VALUES (?, ?, ?) "
            "ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at",
            (key, value, now)
        )


def get_profile() -> dict:
    with get_connection() as conn:
        rows = conn.execute("SELECT key, value FROM profile").fetchall()
    return {row["key"]: row["value"] for row in rows}


def profile_is_complete() -> bool:
    """Returns True if the user has completed onboarding."""
    p = get_profile()
    return p.get("onboarding_complete") == "true"


# ── Journal Entries ───────────────────────────────────────────────────────────

def save_entry(content: str, ai_response: str = "") -> int:
    now = datetime.now().isoformat()
    with get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO journal_entries (content, ai_response, created_at) VALUES (?, ?, ?)",
            (content, ai_response, now)
        )
        return cursor.lastrowid


def get_all_entries() -> list[dict]:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM journal_entries ORDER BY created_at ASC"
        ).fetchall()
    return [dict(row) for row in rows]


def get_entry_count() -> int:
    with get_connection() as conn:
        row = conn.execute("SELECT COUNT(*) as cnt FROM journal_entries").fetchone()
    return row["cnt"]


# ── Knowledge Graph ───────────────────────────────────────────────────────────

def save_tags(entry_id: int, tags: list[dict]):
    """
    Save structured tags extracted from a journal entry.
    Each tag: {"type": "Event"|"Entity"|..., "value": "..."}
    """
    now = datetime.now().isoformat()
    with get_connection() as conn:
        conn.executemany(
            "INSERT INTO knowledge_graph (entry_id, tag_type, tag_value, created_at) VALUES (?, ?, ?, ?)",
            [(entry_id, t.get("type", "Unknown"), t.get("value", ""), now) for t in tags]
        )


def get_all_tags() -> list[dict]:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT tag_type, tag_value, created_at FROM knowledge_graph ORDER BY created_at ASC"
        ).fetchall()
    return [dict(row) for row in rows]


def get_knowledge_summary() -> str:
    """Returns a formatted summary of all knowledge graph tags for AI context."""
    tags = get_all_tags()
    if not tags:
        return "No memories recorded yet."

    grouped: dict[str, list] = {}
    for t in tags:
        grouped.setdefault(t["tag_type"], []).append(t["tag_value"])

    lines = []
    for tag_type, values in grouped.items():
        # Deduplicate while preserving order
        seen = []
        for v in values:
            if v not in seen:
                seen.append(v)
        lines.append(f"[{tag_type}]: {' | '.join(seen)}")

    return "\n".join(lines)
