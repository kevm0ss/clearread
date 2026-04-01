# Product

## What readclear Is

A tool that reformats content to be easier to read for people with dyslexia.

**Core promise:** Content should never be reduced. Only reorganised.

The profile is the product. The tools are surfaces where the profile gets applied:
- **URL reformatter** (lead tool) — paste a URL, get a dyslexia-friendly version instantly
- **Prompt builder** (secondary tool) — generate a system prompt for ChatGPT, Claude, etc.
- **Scan tool** (private beta) — photograph a letter or document, get it reformatted

---

## User Flow

```
URL Reformatter (lead — immediate value, index.html)
    ↓
"Want this everywhere?"
    ↓
Prompt Builder (take it to every AI tool, prompt.html)
    ↓
Future: Chrome extension (reformat while browsing)
```

---

## Audience

**Primary:** People with dyslexia.
**Future:** Stroke patients, acquired brain injury, ADHD, processing disorders, ESL readers.

**Important:** Users should never feel labelled. Language is about reading clearly, not about disability.

---

## Scope: Current

**Included:**
- Four dyslexia profiles
- URL reformatter
- AI prompt builder
- Document scan (private beta)
- Profile persists across all pages via localStorage

**Explicitly out of scope right now:**
- Stroke patients and other conditions
- User-provided API keys
- Chrome extension
- PDF reformatter (separate from image scan)
- Sign-up / accounts

---

## Key Product Decisions

### URL reformatter is the lead tool
The URL reformatter has higher immediate value than the prompt builder. It was originally the secondary tool but became the lead based on user feedback.

### Image reformatting is kept private during beta
Image/scan calls cost ~3–5x more than URL reformats. The scan tool is available at `/scan.html` but not linked publicly until quality and cost are better understood.

### Content is never reduced
This is the product's non-negotiable promise. Claude is instructed to preserve every fact, detail, and nuance. Only structure changes. The system prompt enforces this for every profile.

### Bring your own API key — deferred
Many users won't understand what an API key is. This feature is deferred until there is a clear, safe, user-friendly approach.

---

## Tagline

> "Content should never be reduced. Only reorganised."

Appears in the footer of every page and in the product copy. Must be lived by across the entire product — in the prompts, the demo, and the site copy.
