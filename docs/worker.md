# Cloudflare Worker

## Deployment

The Worker is **not** auto-deployed from GitHub. When `worker.js` changes:

1. Open [dash.cloudflare.com](https://dash.cloudflare.com)
2. Workers & Pages → **readclear-worker**
3. Edit Code → paste the full contents of `worker.js`
4. Click **Deploy**
5. Verify: `curl https://readclear-worker.kev-958.workers.dev/health` → should return `{"status":"ok"}`

**Important:** Visiting the Worker URL in a browser returns "Not found". This is correct — it's an API, not a web page. Only `GET /health` and `POST /reformat` / `POST /reformat-image` are valid.

See [deployment.md](deployment.md) for the full two-system deployment workflow.

---

## Endpoints

### GET /health
Returns `{"status":"ok"}`. Use this to verify the Worker is live before debugging other issues.

### POST /reformat
URL reformatter.

Request body:
```json
{ "url": "https://example.com/article", "profile": "mixed" }
```

Response:
```json
{ "html": "...", "title": "...", "profile": "mixed", "url": "https://..." }
```

Flow: Validates URL → SSRF check → Fetch page → `extractContent()` → Build system prompt → Claude API → strip code fences → return HTML.

### POST /reformat-image
Image/scan reformatter.

Request body:
```json
{ "imageData": "base64string...", "mediaType": "image/jpeg", "profile": "mixed" }
```

Response:
```json
{ "html": "...", "title": "...", "profile": "mixed" }
```

Flow: Validate mediaType → Build system prompt → Claude API with image content block → strip code fences → extract title from first h1 → return HTML.

---

## CORS

```javascript
const ALLOWED_ORIGINS = [
  'https://readclear.importantsmallthings.com',
  'https://clearread-7x3.pages.dev',
];
```

**Update this list when adding new domains.** If a new page is hosted on a different origin it will get CORS errors. After updating, redeploy the Worker.

All endpoints return CORS headers. Preflight OPTIONS returns 204.

---

## AI Model

Both endpoints use `claude-haiku-4-5`.

- Text endpoint: text-only messages
- Image endpoint: messages with `image` content block (vision)
- `claude-haiku-4-5` confirmed to support both text and vision on Kevin's API key

**Do NOT use these — both are rejected by this API key:**
- `claude-3-haiku-20240307`
- `claude-3-5-haiku-20241022`

---

## System Prompt Architecture

The system prompt is built dynamically based on the profile. There are two key components:

### 1. Dynamic role + critical rule
```javascript
const isAphasia = profile === 'aphasia';
const systemPrompt = `You are an accessibility formatter. You reformat web content for people with ${isAphasia ? 'aphasia' : 'dyslexia'}.

CRITICAL RULE: ${isAphasia
  ? 'Preserve every fact and piece of information. You may replace complex or formal words with simpler everyday alternatives, but never remove any meaning. Only change structure, vocabulary, and presentation.'
  : 'Never remove, simplify, or summarise the original content. Every fact, detail, and point must be preserved. Only change the structure and presentation.'}`;
```

**Why this matters:** Dyslexia profiles must never simplify vocabulary. Aphasia profiles may substitute complex words — this is a deliberate, researched difference. The critical rule changes accordingly.

### 2. PROFILE_PROMPTS — per-profile formatting guidance
Each profile has an entry in `PROFILE_PROMPTS`. The system prompt appends the profile-specific prompt after the critical rule.

### 3. SHARED_RULES
Common formatting rules appended to dyslexia profiles **but NOT aphasia**. Aphasia has its own rules embedded directly in its profile prompt (stricter, more specific).

---

## Profile Prompts Summary

| Profile | Key rules |
|---|---|
| `mixed` | Short sentences, numbered steps, clear structure, plain language |
| `phonological` | Plain common words, define terms, key point first |
| `visual` | Generous spacing, short line lengths, chunks of 2–3 sentences |
| `memory` | Summary first, numbered steps, always know where you are |
| `aphasia` | 5-word sentences, active voice, no pronouns, everyday words, `<section>` wrappers |

---

## Aphasia Profile Prompt (full)

```javascript
aphasia: `Profile: I have aphasia.
Core rule: Preserve every fact and piece of information. You may replace complex or formal words with simpler everyday alternatives — but never remove meaning.
Formatting rules:
1. Wrap each topic or message block in a <section> tag. Each <section> covers one clear topic — a heading (h2 or h3) plus 1–4 short paragraphs or a bullet list. Never put multiple topics in one <section>.
2. Target 5 words per sentence. Never more than 10. One point only per sentence.
3. Always use active voice. Rewrite every passive sentence.
4. Never use pronouns (it, they, them, this, that, he, she, we, us). Replace every pronoun with the exact noun it refers to.
5. Use only everyday words: tablets not medication, doctor not physician, get better not recover, stroke not CVA, brain bleed not haemorrhage...
6. Repeat key words freely — repetition aids understanding.
7. Use bullet points for any list of two or more items.
8. Maximum 2 sentences per paragraph.
9. Bold the single most important word or phrase in each paragraph.
10. Never use ALL CAPS, italics, or underlines.`
```

---

## Allowed Output Tags

The Worker instructs Claude to use only these tags. Must stay in sync with `sanitiseHtml()` in `read.html`:

```
p, br, strong, b, em, i, u,
h1, h2, h3, h4, h5, h6,
ul, ol, li,
a (href only, absolute URLs),
blockquote, code, pre,
table, thead, tbody, tr, th, td,
div, span,
section
```

**`<section>` is required** — the aphasia profile uses it to wrap topic blocks. Removing it would break aphasia boxed layout. See [profiles.md](profiles.md).

---

## SSRF Protection (/reformat only)

Blocks requests to:
- `localhost`, `127.0.0.1`, `0.0.0.0`, `::1`
- `169.254.169.254` (cloud metadata endpoint)
- Private IP ranges: `10.x`, `192.168.x`, `172.16-31.x`

---

## Content Extraction

`extractContent(html, baseUrl)` runs in the Worker before the Claude call:

1. Strips scripts, styles, nav, header, footer, aside, iframes
2. Tries to isolate `<main>`, `<article>`, or content divs
3. Converts headings → `# ## ###` markdown style
4. Converts links → `[text](url)` with resolved absolute URLs
5. Converts bold → `**text**`
6. Converts list items → `• item`
7. Strips all remaining HTML tags
8. Decodes HTML entities
9. Collapses excess whitespace

---

## Code Fence Stripping

Claude sometimes wraps output in markdown code fences despite instructions. The Worker strips them:

```javascript
reformattedHtml = reformattedHtml
  .replace(/^```html\s*/i, '')
  .replace(/^```\s*/i, '')
  .replace(/\s*```$/i, '')
  .trim();
```

---

## Environment Variables

| Variable | Where set | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | Cloudflare Worker Secrets | Claude API authentication |

**Never put this in `worker.js` source code.**

---

## Cost

| Operation | Model | Approx cost |
|---|---|---|
| URL reformat | claude-haiku-4-5 | ~£0.01 per reformat |
| Image reformat | claude-haiku-4-5 | ~£0.03–0.05 per image (vision tokens cost more) |

Monitor usage in the Anthropic Console. See [analytics.md](analytics.md).
