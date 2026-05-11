# Architecture

## Deploy Pipeline — Two Separate Systems

This is the most important architectural fact: there are **two independent deployment systems**.

```
Developer (local) → git push → GitHub (kevm0ss/clearread, main branch)
                                    ↓ auto-deploy webhook
                             Cloudflare Pages
                                    ↓
                    https://clearread-7x3.pages.dev
                    https://readclear.importantsmallthings.com

worker.js → MANUAL ONLY → Cloudflare Workers dashboard
                                    ↓
                    https://readclear-worker.kev-958.workers.dev
```

**System 1 — Cloudflare Pages (automatic):**
- Deploys: `index.html`, `read.html`, `scan.html`, `prompt.html`, `siteowners.html`, CSS, JS
- Trigger: any `git push origin main`
- Takes ~30–60 seconds

**System 2 — Cloudflare Worker (manual):**
- Deploys: `worker.js` only
- Trigger: **none** — must paste into Cloudflare dashboard manually
- Steps: dash.cloudflare.com → Workers & Pages → readclear-worker → Edit Code → paste → Deploy
- Verify: `curl https://readclear-worker.kev-958.workers.dev/health`

See [gotchas.md](gotchas.md) for webhook disconnect fixes and branch merge URL pitfalls.

---

## Pages

| File | URL | Purpose | Status |
|---|---|---|---|
| `index.html` | `/` | URL reformatter — the lead tool | Live |
| `read.html` | `/read` | Reformatted content display | Live |
| `prompt.html` | `/prompt` | AI prompt builder (secondary tool) | Live |
| `scan.html` | `/scan` | Image/scan reformatter | Live — private beta (not linked) |
| `siteowners.html` | `/siteowners` | Soft sales page for site owners | Live |

---

## URL Reformatter Data Flow

```
index.html (user pastes URL + selects profile)
    ↓ POST { url, profile }
Worker /reformat
    ↓ fetch URL with readclear User-Agent
Target website
    ↓ raw HTML
Worker extractContent() — strips nav/ads/scripts, preserves headings/links/lists
    ↓ markdown-style structured text
Claude API (claude-haiku-4-5)
    ↓ reformatted HTML
Worker → response { html, title, profile, url }
    ↓ stored in localStorage (readclear_result)
read.html — sanitises and renders HTML
    ↓ sets body.dataset.profile
Profile-specific CSS applies (e.g. aphasia section boxes)
```

---

## Image/Scan Data Flow

```
scan.html (user selects photo/file + profile)
    ↓ client-side resize to 800px max, JPEG 0.85
    ↓ convert to base64
    ↓ POST { imageData, mediaType, profile }
Worker /reformat-image
    ↓ send image + profile prompt to Claude API
Claude API (claude-haiku-4-5) — vision model
    ↓ reads text from image, reformats for profile
Worker → response { html, title, profile }
    ↓ stored in localStorage (readclear_result)
read.html — same display as URL reformat
```

---

## Worker Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/reformat` | POST | URL reformatter — fetches URL, extracts text, calls Claude |
| `/reformat-image` | POST | Image reformatter — sends base64 image to Claude vision |
| `/health` | GET | Health check — returns `{"status":"ok"}` |

Worker URL: `https://readclear-worker.kev-958.workers.dev`

ALLOWED_ORIGINS (must update when adding new domains):
- `https://readclear.importantsmallthings.com`
- `https://clearread-7x3.pages.dev`

---

## localStorage Keys

| Key | Format | Purpose |
|---|---|---|
| `readclear_profile` | `{"type":"mixed"}` | Active profile — shared across all pages |
| `readclear_result` | `{html, title, profile, url, source}` | Last reformatted result — read by read.html |
| `readclear_result_original` | `{html, title, profile, url}` | Pre-refine copy — used for undo in REFINE panel |
| `readclear_prefs` | `{fontSize, lineHeight, bgColor, width}` | Design preferences from REFINE panel |
| `readclear_content_prefs` | `{sentences, bullets, ...}` | Content reformat checkboxes from REFINE panel |
| `readclear_prefill` | plain string URL | Pre-fills URL input after returning from read.html |
| `rc_pg_[hash]` | `{html, title, profile, url, ts}` | Page cache entries (max 10, 7-day expiry) |

---

## Allowed HTML Tags (read.html sanitiser + Worker output)

The `sanitiseHtml()` function in `read.html` and the allowed tags list in `worker.js` must stay in sync.

Current allowed tags:
```
p, br, strong, b, em, i, u, h1, h2, h3, h4, h5, h6,
ul, ol, li, a, blockquote, code, pre, table, thead, tbody, tr, th, td,
div, span, section
```

**`<section>` is intentionally included** — used by the aphasia profile to wrap topic blocks for CSS boxed display. Do not remove it.

Allowed attributes: `href` on `<a>` only (with `https?://` protocol filter), `target="_blank"`, `rel="noopener noreferrer"`.

---

## body.dataset.profile Pattern

When `read.html` renders a result, it immediately sets:
```javascript
document.body.dataset.profile = result.profile || 'mixed';
```

This enables profile-specific CSS without any JavaScript logic in the style rules:
```css
body[data-profile="aphasia"] .reading-content section {
  border: 2px solid #c8b89a;
  border-radius: 10px;
  /* ... */
}
```

**Rule:** `body.dataset.profile` must be set at the exact moment content becomes visible, not before or after. See [gotchas.md](gotchas.md).

---

## Read.html — Key Feature Architecture

See [read.md](read.md) for full detail. Summary:

- **Sanitiser:** Allowlist-based `sanitiseHtml()` — strips all unknown tags/attributes
- **REFINE panel:** Floating panel for design prefs and content reformatting. See [refine-panel.md](refine-panel.md)
- **Reading Aids:** TTS (Web Speech API), Reading Ruler (mousemove), Focus Mode (dimming). See [reading-aids.md](reading-aids.md)
- **Truncation banner:** Shown if content was too long and was cut before sending to Claude
- **Section speaker icons:** 🔊 icons injected next to each heading; play just that section's text
- **Listen button:** 🔊 Listen in the toolbar; plays the whole article
- **Profile badge:** Shows active profile name in the toolbar

---

## Infrastructure

| Service | Account | Notes |
|---|---|---|
| GitHub | kevm0ss | Auto-deploys to Cloudflare Pages on push to main |
| Cloudflare Pages | Kevin's account | Hosts all frontend HTML/CSS/JS |
| Cloudflare Workers | Kevin's account | Hosts backend — manually deployed |
| Anthropic | Kevin's account | API key stored as Worker Secret `ANTHROPIC_API_KEY` |

---

## Why No Framework

- Easier for Kevin to learn and understand
- No build step, no dependencies, no breaking changes
- Cloudflare Pages serves static files perfectly
- Can add a framework later — not before it is needed
