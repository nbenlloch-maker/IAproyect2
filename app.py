"""
app.py
------
AI of Memories — Digital Time Capsule
A transparent, consent-first personal journaling app powered by Gemini.

Run with:  streamlit run app.py
"""

import streamlit as st
import os
from datetime import datetime
from dotenv import load_dotenv

import memories_db as db
import ai_engine as ai

load_dotenv()

# ── Page config ───────────────────────────────────────────────────────────────

st.set_page_config(
    page_title="AI of Memories",
    page_icon="📖",
    layout="centered",
    initial_sidebar_state="expanded",
)

# ── Custom CSS ────────────────────────────────────────────────────────────────

st.markdown("""
<style>
  @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;1,300;1,400&family=Inter:wght@300;400;500&display=swap');

  html, body, [class*="css"] {
    font-family: 'Crimson Pro', Georgia, serif;
    background-color: #1a1610;
    color: #e8dfc6;
  }
  .stApp { background-color: #1a1610; }

  /* Notebook paper texture */
  .main .block-container {
    background: linear-gradient(135deg, #1e1a12 0%, #221e14 50%, #1e1a12 100%);
    border: 1px solid #3d3420;
    border-radius: 4px;
    padding: 2rem 3rem;
    box-shadow: 4px 4px 20px rgba(0,0,0,0.6), inset 0 0 60px rgba(255,200,100,0.03);
    max-width: 780px;
  }

  h1, h2, h3 { font-family: 'Crimson Pro', serif; color: #f0e2b0; letter-spacing: 0.5px; }

  /* Chat bubbles */
  .user-bubble {
    background: #2a2416;
    border-left: 3px solid #8b6914;
    border-radius: 0 8px 8px 0;
    padding: 0.8rem 1.2rem;
    margin: 0.5rem 0;
    font-size: 1.05rem;
    color: #e8dfc6;
    font-style: italic;
  }
  .ai-bubble {
    background: #1a1e14;
    border-left: 3px solid #4a6e3a;
    border-radius: 0 8px 8px 0;
    padding: 0.8rem 1.2rem;
    margin: 0.5rem 0;
    font-size: 0.97rem;
    color: #b8d4a0;
  }
  .past-self-bubble {
    background: #141a24;
    border-left: 3px solid #4a6a9e;
    border-radius: 0 8px 8px 0;
    padding: 0.8rem 1.2rem;
    margin: 0.5rem 0;
    font-size: 0.97rem;
    color: #a0b8d4;
  }

  /* Past self mode banner */
  .past-self-banner {
    background: linear-gradient(90deg, #141a24, #1a2030);
    border: 1px solid #4a6a9e;
    border-radius: 8px;
    padding: 0.9rem 1.2rem;
    text-align: center;
    color: #7ab0d8;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  /* Sidebar */
  [data-testid="stSidebar"] {
    background: #120f0a;
    border-right: 1px solid #3d3420;
  }
  [data-testid="stSidebar"] * { color: #c8b888 !important; }

  /* Input */
  [data-testid="stTextArea"] textarea {
    background: #16130d !important;
    color: #e8dfc6 !important;
    border: 1px solid #3d3420 !important;
    border-radius: 4px !important;
    font-family: 'Crimson Pro', serif !important;
    font-size: 1.05rem !important;
  }
  [data-testid="stTextArea"] textarea:focus {
    border-color: #8b6914 !important;
    box-shadow: 0 0 8px rgba(139,105,20,0.3) !important;
  }

  /* Buttons */
  .stButton > button {
    background: #2a200a;
    color: #c8a84a;
    border: 1px solid #6b5010;
    border-radius: 4px;
    font-family: 'Crimson Pro', serif;
    font-size: 1rem;
    transition: all 0.2s;
  }
  .stButton > button:hover {
    background: #3a2c0e;
    border-color: #c8a84a;
    color: #f0d878;
  }

  .stButton.past-self-btn > button {
    background: #0e1520;
    color: #7ab0d8;
    border: 1px solid #3a5a88;
  }

  /* Divider */
  hr { border-color: #3d3420; }

  /* Tag pills in sidebar */
  .tag-pill {
    display: inline-block;
    background: #2a2416;
    border: 1px solid #4a3a18;
    border-radius: 12px;
    padding: 0.1rem 0.6rem;
    font-size: 0.78rem;
    margin: 2px;
    color: #b89858;
  }
</style>
""", unsafe_allow_html=True)

# ── Init ──────────────────────────────────────────────────────────────────────

db.init_db()

# Session state defaults
if "phase" not in st.session_state:
    st.session_state.phase = "onboarding" if not db.profile_is_complete() else "journaling"
if "onboarding_step" not in st.session_state:
    st.session_state.onboarding_step = 0
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []      # journaling chat
if "past_self_history" not in st.session_state:
    st.session_state.past_self_history = [] # past self chat
if "consent_given" not in st.session_state:
    st.session_state.consent_given = db.profile_is_complete()


# ── Sidebar ───────────────────────────────────────────────────────────────────

with st.sidebar:
    st.markdown("## 📖 AI of Memories")
    st.markdown("---")

    # API Key
    api_key = st.text_input(
        "Gemini API Key",
        value=os.getenv("GEMINI_API_KEY", ""),
        type="password",
        help="Your key stays local and is never shared.",
        key="api_key_input"
    )

    st.markdown("---")

    entry_count = db.get_entry_count()
    st.markdown(f"**📝 Entries recorded:** {entry_count}")

    if st.session_state.phase != "onboarding":
        profile = db.get_profile()
        name = profile.get("name_and_life_stage", "")
        if name:
            st.markdown(f"**👤 {name[:40]}**")

        st.markdown("---")

        # Mode toggle
        if st.session_state.phase == "journaling":
            if st.button("🕰️ Activate Past Self Mode", use_container_width=True):
                if entry_count == 0:
                    st.warning("Write at least one entry first.")
                else:
                    st.session_state.phase = "past_self"
                    st.session_state.past_self_history = []
                    st.rerun()

        elif st.session_state.phase == "past_self":
            if st.button("📖 Return to Journal", use_container_width=True):
                st.session_state.phase = "journaling"
                st.rerun()

        # Knowledge graph summary
        if entry_count > 0:
            st.markdown("---")
            st.markdown("**🧠 Memory Snapshot**")
            tags = db.get_all_tags()
            tag_types = list(set(t["tag_type"] for t in tags))
            for tt in tag_types:
                vals = [t["tag_value"] for t in tags if t["tag_type"] == tt][:3]
                preview = ", ".join(vals)
                st.markdown(
                    f'<span class="tag-pill">{tt}</span> <small style="color:#8a7a58">{preview[:50]}</small>',
                    unsafe_allow_html=True
                )

    st.markdown("---")
    st.markdown(
        '<small style="color:#5a4a2a">All data is stored locally on your device.<br>'
        'You own your memories.</small>',
        unsafe_allow_html=True
    )


# ── PHASE 1: Onboarding ───────────────────────────────────────────────────────

def render_onboarding():
    st.markdown("# 📖 AI of Memories")
    st.markdown("*Your personal digital time capsule.*")
    st.markdown("---")

    if not st.session_state.consent_given:
        st.markdown("""
        ### Welcome.

        This is a private diary that does something special: it remembers you.

        Every entry you write will be gently categorised — people you mention, emotions you feel,
        beliefs you hold — so that one day, your **future self** can look back and even have a
        conversation with who you are *right now*.

        **This is all transparent. Here is exactly what happens:**
        - 📝 Your entries are saved locally on this machine.
        - 🏷️ An AI reads each entry to extract structured memory tags (events, people, feelings).
        - 🕰️ You can activate "Past Self Mode" to speak with a simulation of your past self.
        - 🔒 No data ever leaves your device unless you explicitly choose to share it.
        """)

        consent = st.checkbox(
            "I understand how my entries will be used and I consent to building my Past Self profile."
        )
        if consent:
            st.session_state.consent_given = True
            db.set_profile("consent", "true")
            st.rerun()
        return

    # Multi-step onboarding Q&A
    questions = ai.ONBOARDING_QUESTIONS
    step = st.session_state.onboarding_step

    if step >= len(questions):
        # Onboarding complete
        db.set_profile("onboarding_complete", "true")
        st.session_state.phase = "journaling"
        st.session_state.chat_history = []
        st.rerun()
        return

    q = questions[step]

    # Show all previous answers as read-only
    for i in range(step):
        prev_q = questions[i]
        st.markdown(f'<div class="ai-bubble">{prev_q["prompt"]}</div>', unsafe_allow_html=True)
        stored = db.get_profile().get(prev_q["store_key"], "")
        if stored:
            st.markdown(f'<div class="user-bubble">{stored}</div>', unsafe_allow_html=True)

    # Current question
    st.markdown(f'<div class="ai-bubble">{q["prompt"]}</div>', unsafe_allow_html=True)

    with st.form(key=f"onboarding_form_{step}"):
        answer = st.text_area("Your answer:", height=120, placeholder="Write freely…", key=f"ob_input_{step}")
        submitted = st.form_submit_button("Continue →")

    if submitted and answer.strip():
        db.set_profile(q["store_key"], answer.strip())
        st.session_state.onboarding_step += 1
        st.rerun()


# ── PHASE 2: Daily Journaling ─────────────────────────────────────────────────

def render_journaling():
    st.markdown("# 📖 Today's Entry")

    api_key = st.session_state.get("api_key_input", "")
    if not api_key:
        st.warning("⚠️ Please enter your Gemini API key in the sidebar to continue.", icon="🔑")
        return

    st.markdown("---")

    # Render existing chat history
    for msg in st.session_state.chat_history:
        css_class = "user-bubble" if msg["role"] == "user" else "ai-bubble"
        st.markdown(f'<div class="{css_class}">{msg["content"]}</div>', unsafe_allow_html=True)

    st.markdown("")

    # Entry form
    with st.form(key="journal_form", clear_on_submit=True):
        entry = st.text_area(
            "Write your entry…",
            height=160,
            placeholder="What happened today? What are you feeling? Don't hold back.",
            label_visibility="collapsed"
        )
        submitted = st.form_submit_button("✍️ Add to Diary")

    if submitted and entry.strip():
        profile = db.get_profile()
        knowledge_summary = db.get_knowledge_summary()

        # Build history for AI context
        history_for_ai = [
            {"role": "user" if m["role"] == "user" else "model", "content": m["content"]}
            for m in st.session_state.chat_history
        ]

        with st.spinner("📝 Writing margin note…"):
            try:
                response = ai.get_journaling_response(
                    api_key=api_key,
                    user_entry=entry,
                    profile=profile,
                    conversation_history=history_for_ai,
                    knowledge_summary=knowledge_summary,
                )
            except Exception as e:
                response = f"*(Something went wrong: {e})*"

        # Save entry & response
        entry_id = db.save_entry(content=entry, ai_response=response)

        # Extract tags silently
        try:
            tags = ai.extract_knowledge_tags(api_key=api_key, entry=entry)
            if tags:
                db.save_tags(entry_id=entry_id, tags=tags)
        except Exception:
            pass

        # Update chat history
        st.session_state.chat_history.append({"role": "user", "content": entry})
        st.session_state.chat_history.append({"role": "assistant", "content": response})

        st.rerun()


# ── PHASE 3: Past Self Mode ───────────────────────────────────────────────────

def render_past_self():
    profile = db.get_profile()
    all_entries = db.get_all_entries()
    knowledge_summary = db.get_knowledge_summary()

    # Date range of entries
    if all_entries:
        first_date = all_entries[0]["created_at"][:10]
        last_date = all_entries[-1]["created_at"][:10]
        date_range = f"{first_date} – {last_date}"
    else:
        date_range = "no entries yet"

    st.markdown(
        f'<div class="past-self-banner">'
        f'🕰️ <strong>Past Self Mode Active</strong><br>'
        f'<small>You are speaking with your past self from <em>{date_range}</em>. '
        f'Responses are based strictly on what you wrote in your diary.</small>'
        f'</div>',
        unsafe_allow_html=True
    )

    api_key = st.session_state.get("api_key_input", "")
    if not api_key:
        st.warning("⚠️ Please enter your Gemini API key in the sidebar.", icon="🔑")
        return

    # Render past self chat history
    for msg in st.session_state.past_self_history:
        if msg["role"] == "user":
            st.markdown(f'<div class="user-bubble">{msg["content"]}</div>', unsafe_allow_html=True)
        else:
            st.markdown(f'<div class="past-self-bubble">{msg["content"]}</div>', unsafe_allow_html=True)

    st.markdown("")

    with st.form(key="past_self_form", clear_on_submit=True):
        message = st.text_area(
            "Ask your past self…",
            height=120,
            placeholder="What were you worried about? What made you happy then?",
            label_visibility="collapsed"
        )
        submitted = st.form_submit_button("💬 Send")

    if submitted and message.strip():
        history_for_ai = [
            {"role": "user" if m["role"] == "user" else "model", "content": m["content"]}
            for m in st.session_state.past_self_history
        ]

        with st.spinner("🕰️ Reaching into the past…"):
            try:
                response = ai.get_past_self_response(
                    api_key=api_key,
                    user_message=message,
                    profile=profile,
                    knowledge_summary=knowledge_summary,
                    all_entries=all_entries,
                    conversation_history=history_for_ai,
                )
            except Exception as e:
                response = f"*(Something went wrong: {e})*"

        st.session_state.past_self_history.append({"role": "user", "content": message})
        st.session_state.past_self_history.append({"role": "assistant", "content": response})
        st.rerun()


# ── Router ────────────────────────────────────────────────────────────────────

phase = st.session_state.phase

if phase == "onboarding":
    render_onboarding()
elif phase == "journaling":
    render_journaling()
elif phase == "past_self":
    render_past_self()
