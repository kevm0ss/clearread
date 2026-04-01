# Architecture

## Deploy Pipeline

```
Developer (local) → git push → GitHub (kevm0ss/clearread, main branch)
                                    ↓ auto-deploy webhook
                             Cloudflare Pages
                                    ↓
                    https://clearread-7x3.pages.dev
                    https://readclear.importantsmallthings.com
```

**Important:** The Cloudflare Pages webhook occasionally disconnects. If a push to GitHub doesn't appear on the live site, go to the Cloudflare Pages dashboard and click "Retry deployment" or reconnect the GitHub integration. See [gotchas.md](gotchas.md).

The Cloudflare Worker is **deployed separately** — paste updated `worker.js` into the Cloudflare Workers dashboard and click Deploy. It does not auto-deploy.

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
    ↓ reads text from image, reformats for dyslexia profile
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
| `readclear_profile` | `{"type":"mixed"}` | Active dyslexia profile — shared across all pages |
| `readclear_result` | `{html, title, profile, url, source}` | Last reformatted page — read by read.html |
| `readclear_prefill` | plain string URL | Pre-fills the URL input after returning from read.html |
| `rc_pg_[hash]` | `{html, title, profile, url, ts}` | Page cache entries (max 10, 7-day expiry) |

---

## Infrastructure

| Service | Account | Notes |
|---|---|---|
| GitHub | kevm0ss | Auto-deploys to Cloudflare Pages on push to main |
| Cloudflare Pages | Kevin's account | Hosts all frontend HTML/CSS/JS |
| Cloudflare Workers | Kevin's account | Hosts backend — manually deployed |
| Anthropic | Kevin's account | API key stored as Worker Secret |

---

## Why No Framework

- Easier for Kevin to learn and understand
- No build step, no dependencies, no breaking changes
- Cloudflare Pages serves static files perfectly
- Can add a framework later — not before it is needed
