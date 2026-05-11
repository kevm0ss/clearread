# Product

## What readclear Is

A tool that reformats content to be easier to read for people with dyslexia and aphasia.

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
**Now also:** People with aphasia (post-stroke or acquired brain injury language difficulties).
**Future:** ADHD, processing disorders, ESL readers.

**Important:** Users should never feel labelled. Language is about reading clearly, not about disability.

---

## Profiles in Scope

### Dyslexia profiles (four types)
- Mixed / Unsure
- Phonological
- Visual Stress
- Working Memory

### Aphasia
Added after user testing and real-world interest from aphasia communities.

Key difference from dyslexia: aphasia profiles may substitute complex vocabulary with simpler everyday alternatives. Dyslexia profiles must never simplify vocabulary — only structure changes. See [profiles.md](profiles.md) for the full distinction.

Source: Stroke Association "Accessible Information Guidelines" PDF.

---

## Scope: Current

**Included:**
- Five profiles (four dyslexia + aphasia)
- URL reformatter
- AI prompt builder
- Document scan (private beta)
- Reading Aids: TTS, Reading Ruler, Focus Mode (see [reading-aids.md](reading-aids.md))
- REFINE panel: design preferences, content reformat, undo (see [refine-panel.md](refine-panel.md))
- Profile persists across all pages via localStorage

**Explicitly out of scope right now:**
- User-provided API keys
- Chrome extension
- PDF reformatter (separate from image scan)
- Sign-up / accounts
- Widgit symbols / image-based aphasia content

---

## Key Product Decisions

### URL reformatter is the lead tool
The URL reformatter has higher immediate value than the prompt builder. It was originally the secondary tool but became the lead based on user feedback.

### Image reformatting is kept private during beta
Image/scan calls cost ~3–5x more than URL reformats. The scan tool is available at `/scan.html` but not linked publicly until quality and cost are better understood.

### Content is never reduced (dyslexia)
This is the product's non-negotiable promise for dyslexia profiles. Claude is instructed to preserve every fact, detail, and nuance. Only structure changes. The system prompt enforces this.

### Vocabulary may be simplified for aphasia
Aphasia is a language processing condition — complex words are a barrier even if the structure is clear. The Stroke Association guidelines explicitly recommend substituting formal/medical vocabulary with everyday alternatives. This is the one exception to the "content unchanged" rule — but facts are always preserved.

### Reading Aids belong on read.html, not on the source tools
TTS, ruler, and focus mode are in read.html only — where content is actually being read. The source tools (index.html, scan.html, prompt.html) do not need reading aids.

### REFINE panel gives users control without complexity
The REFINE panel lets users adjust font size, spacing, background colour, width, and content preferences. This is preferable to building separate UI per-profile because it gives users agency and avoids prescriptive design assumptions about what each dyslexia type needs visually.

### Analytics deferred until something to measure
Cloudflare Web Analytics is pending setup (token needed). Worker Metrics and Anthropic Console are already available for cost tracking. Full analytics will be added when there is meaningful usage to measure.

---

## Tagline

> "Content should never be reduced. Only reorganised."

Appears in the footer of every page and in the product copy. Must be lived by across the entire product — in the prompts, the demo, and the site copy.

**For aphasia:** Content facts are never removed. Vocabulary may change. Structure always changes.
