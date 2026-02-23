"""
ai_engine.py
------------
Gemini AI integration for AI of Memories.
Two modes:
  1. Journaling Assistant  — empathetic reflective partner
  2. Past Self Mode        — simulates the user's past voice
Also extracts structured knowledge graph tags from each entry.
"""

import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# ── Model setup ───────────────────────────────────────────────────────────────

def _get_model(api_key: str):
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-2.0-flash")


# ── Onboarding Q&A ────────────────────────────────────────────────────────────

ONBOARDING_QUESTIONS = [
    {
        "key": "q1",
        "prompt": (
            "📖 *Welcome to your AI of Memories.*\n\n"
            "This diary will help you preserve your current self — your thoughts, feelings, "
            "and memories — so your future self can one day look back and even have a conversation "
            "with who you are *right now*.\n\n"
            "**Everything you share stays on your device. You are always in control.**\n\n"
            "---\n"
            "Let's start gently. **What is your name, and what chapter of life do you feel you're in right now?** "
            "(For example: finishing university, starting a new job, raising a family, searching for direction…)"
        ),
        "store_key": "name_and_life_stage"
    },
    {
        "key": "q2",
        "prompt": (
            "✨ Thank you for sharing that.\n\n"
            "**What's a memory or experience that you feel has shaped the person you are today?** "
            "It could be a triumph, a loss, a person, or a quiet moment that changed something inside you."
        ),
        "store_key": "foundational_memory"
    },
    {
        "key": "q3",
        "prompt": (
            "💬 One last question to calibrate your voice.\n\n"
            "**How would you describe the way you talk or write to people you're close to?** "
            "Are you funny and sarcastic? Warm and earnest? Philosophical? Do you use any phrases or words "
            "that are *very you*?"
        ),
        "store_key": "linguistic_style"
    },
]


# ── Journaling Assistant ──────────────────────────────────────────────────────

JOURNALING_SYSTEM_PROMPT = """
You are the reflective partner inside a personal digital time capsule diary called "AI of Memories."
The user knows exactly what you are: a journaling AI that helps them document their life with depth and care.
Your role is to read their entries, reflect back insights, and gently gather context about new people, places, or emotions they mention — always being transparent that it's to enrich *their own* future memories.

Tone: warm, empathetic, thoughtful, unobtrusive. Never preachy or clinical.
Format: write as a "margin note" — brief, intimate, focused.
If the user mentions a new person or place, ask ONE gentle follow-up question to get context.
Never ask more than one follow-up at a time.
Do not give unsolicited advice. Mirror and reflect; don't prescribe.
Respond in the same language the user writes in.
"""

def get_journaling_response(
    api_key: str,
    user_entry: str,
    profile: dict,
    conversation_history: list[dict],
    knowledge_summary: str,
) -> str:
    model = _get_model(api_key)

    profile_context = ""
    if profile:
        profile_context = f"""
The user's profile baseline:
- Name / Life stage: {profile.get('name_and_life_stage', 'Unknown')}
- Foundational memory: {profile.get('foundational_memory', 'Unknown')}
- Linguistic style: {profile.get('linguistic_style', 'Unknown')}
"""

    knowledge_context = f"\nKnowledge graph (accumulated memories):\n{knowledge_summary}" if knowledge_summary else ""

    system = JOURNALING_SYSTEM_PROMPT + profile_context + knowledge_context

    # Build history for multi-turn conversation
    history = []
    for msg in conversation_history[-10:]:  # Keep last 10 turns for context
        history.append({
            "role": msg["role"],
            "parts": [{"text": msg["content"]}]
        })

    chat = model.start_chat(history=history)
    response = chat.send_message(
        [{"text": f"{system}\n\n---\nUser's journal entry:\n{user_entry}"}]
    )
    return response.text


# ── Past Self Mode ────────────────────────────────────────────────────────────

PAST_SELF_SYSTEM_PROMPT = """
You are now simulating the "Past Self" of the user — based strictly on what they have written in their diary.
You speak as them: their voice, their quirks, their references, their memories.
You do NOT have knowledge of anything beyond what is recorded in the knowledge graph and journal entries provided.
You speak in first person as the past self.
You should feel warm, familiar, and sometimes surprisingly insightful — as if the user is meeting a recorded version of themselves.
If asked something you don't have data for, say so honestly: "I don't think I wrote about that…"
Respond in the same language the user writes in.
"""

def get_past_self_response(
    api_key: str,
    user_message: str,
    profile: dict,
    knowledge_summary: str,
    all_entries: list[dict],
    conversation_history: list[dict],
) -> str:
    model = _get_model(api_key)

    # Compile recent journal entries for context
    recent_entries = "\n\n".join(
        [f"[{e['created_at'][:10]}]: {e['content']}" for e in all_entries[-20:]]
    )

    profile_str = (
        f"Name/Life stage: {profile.get('name_and_life_stage', '?')}\n"
        f"Foundational memory: {profile.get('foundational_memory', '?')}\n"
        f"Linguistic style: {profile.get('linguistic_style', '?')}"
    )

    system = (
        PAST_SELF_SYSTEM_PROMPT
        + f"\n\nProfile baseline:\n{profile_str}"
        + f"\n\nKnowledge graph:\n{knowledge_summary}"
        + f"\n\nJournal entries (most recent 20):\n{recent_entries}"
    )

    history = []
    for msg in conversation_history[-10:]:
        history.append({
            "role": msg["role"],
            "parts": [{"text": msg["content"]}]
        })

    chat = model.start_chat(history=history)
    response = chat.send_message(
        [{"text": f"{system}\n\n---\nUser says: {user_message}"}]
    )
    return response.text


# ── Knowledge Graph Extraction ────────────────────────────────────────────────

EXTRACTION_PROMPT = """
You are a silent data structuring engine. Analyze the journal entry below and extract structured tags.
Return ONLY a valid JSON array. No markdown, no explanation.

Tag types to use:
- "Event": A specific occurrence (with or without explicit date)
- "Entity": A person, pet, place, or organization mentioned
- "Sentiment/Trigger": An emotion expressed and what triggered it
- "Core Belief": A value, opinion, or life philosophy stated or implied
- "Syntax": A distinctive phrase, word, or tone pattern used by the writer

Format:
[
  {"type": "Event", "value": "..."},
  {"type": "Entity", "value": "..."}
]

Journal entry:
"""

def extract_knowledge_tags(api_key: str, entry: str) -> list[dict]:
    """Extract structured knowledge graph tags from a journal entry."""
    try:
        model = _get_model(api_key)
        response = model.generate_content(EXTRACTION_PROMPT + entry)
        raw = response.text.strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        tags = json.loads(raw)
        return tags if isinstance(tags, list) else []
    except Exception:
        return []
