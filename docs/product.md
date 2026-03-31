# Product Decisions

## What ClearRead Is

One reading profile. Used everywhere.

ClearRead is not two separate tools. It is one profile that powers multiple surfaces:
- Reformat any web page right now (URL tool)
- Take your preferences to any AI tool (prompt builder)
- Future: Chrome extension, PDF tool, other surfaces

The profile is the product. The tools are where it gets applied.

---

## The Two Services (MVP)

### Service 1 — Prompt Builder (built)
- User selects their dyslexia profile
- Selects/adjusts preferences
- Gets a formatted prompt to paste into their AI tool's system settings
- Explains how to install in ChatGPT, Claude, Gemini, Copilot

### Service 2 — URL Reformatter (planned)
- User pastes a URL
- Backend fetches and extracts the article content
- Sends it to Claude API with the user's profile prompt
- Returns a clean reformatted reading page
- This is the lead tool — higher wow factor, immediately useful

---

## User Flow

```
URL Reformatter (lead — immediate value)
↓
"Want this on every AI conversation?"
↓
Prompt Builder (take it everywhere)
↓
Future surfaces (Chrome extension, PDF, etc.)
```

The reformatter is the entry point. The prompt builder is the power-user follow-through.

---

## Scope: MVP

**Included:**
- Dyslexia profiles only (4 types)
- URL reformatter
- Prompt builder
- Profile saved to localStorage (persists between pages)

**Explicitly excluded from MVP:**
- Stroke patients and other conditions (future)
- PDF / image reformatting (future)
- User-provided API keys (future — needs careful thinking)
- Chrome extension (future)
- Full website reformatting, not just single pages (future)
- Sign-up / accounts

---

## Profile Persistence

User's profile is saved in **localStorage**.

- Set when user selects a profile on any page
- Loaded automatically when visiting any other page
- Means the user builds their profile once
- Both services use the same saved profile

---

## User-Provided API Keys (Future)

This has been flagged as a future consideration. Needs careful thinking before implementation:
- Security implications
- UX complexity
- Whether to store in localStorage or never store
- Do not implement without a proper plan

---

## Audience

Primary: People with dyslexia.
Future expansion: Stroke patients, acquired brain injuries, ADHD, processing disorders, ESL readers.

**Important:** Users should never feel labelled. The language is about reading clearly, not about disability.

---

## Tagline

> "Content should never be reduced. Only reorganised."

This must appear prominently and must be lived by across the entire product.
