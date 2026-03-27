# Technical Architecture

## Current State

```
GitHub (kevm0ss/clearread)
    ↓  auto-deploy on every push
Cloudflare Pages
    ↓
clearread-7x3.pages.dev
```

Single HTML file. No build step. No framework.

---

## Planned State (Service 2)

```
Browser (reformat.html)
    ↓  POST { url, profile, traits }
Cloudflare Worker (/api/reformat)
    ↓  fetch URL
Target Website
    ↓  extract article content (Readability.js)
Cloudflare Worker
    ↓  call Claude API with profile prompt
Anthropic Claude API
    ↓  return reformatted HTML
Browser (read.html)
```

---

## Pages

| File | Purpose |
|---|---|
| `index.html` | Prompt builder — DO NOT treat as a template for other pages |
| `reformat.html` | URL input + profile selector (to build) |
| `read.html` | Clean reformatted reading view (to build) |

---

## Infrastructure

### Cloudflare Pages
- Hosts all frontend HTML/CSS/JS files
- Free tier is sufficient for MVP
- Auto-deploys from GitHub main branch
- Current URL: clearread-7x3.pages.dev
- Domain pending: readclear.ai or importantsmallthings.com/readclear

### Cloudflare Workers
- Handles backend API calls
- Required for: URL fetching (CORS bypass), Claude API calls (key security)
- API key stored as a Worker Secret — NEVER in frontend code
- Free tier: 100k requests/day — sufficient for MVP
- Must be created in Kevin's own Cloudflare account (separate from Aaron's)

### GitHub
- Repo: kevm0ss/clearread
- Branch: main (production)
- Pipeline: push to main → Cloudflare auto-deploys

---

## Why No Framework

- Easier to learn and understand
- No build step, no dependencies, no breaking changes
- Cloudflare Pages serves static files perfectly
- Can add a framework later if needed — not before

---

## Profile State Management

- Stored in browser `localStorage`
- Key: `clearread_profile` (object: profile type + active traits)
- Set on profile selection on any page
- Read on page load — pre-selects saved profile
- No server-side storage in MVP

---

## Content Extraction (Planned)

When the Worker fetches a URL:
1. Fetch raw HTML from the target URL
2. Extract article content using **Mozilla Readability.js** (same library Firefox uses for Reader View)
3. Strip navigation, ads, footers, sidebars
4. Send clean text/HTML to Claude API

Readability.js is the right tool — battle-tested, handles most websites well.

---

## Claude API Integration (Planned)

- Model: claude-opus-4 or claude-sonnet-4 (decide at build time — balance cost vs quality)
- System prompt: built from user's profile + active traits (same logic as prompt builder)
- User message: extracted article content
- Response: reformatted HTML
- API key: stored as Cloudflare Worker Secret

---

## SEO / GEO (Pending)

Not implemented yet. Wait until domain is decided.

When domain is confirmed, add:
- `<meta name="description">`
- Open Graph tags
- Twitter Card tags
- JSON-LD structured data (WebApplication)
- `robots.txt`
- `llms.txt` (for AI crawler discoverability)
- Canonical URL

See [docs/roadmap.md](roadmap.md) for timing.

---

## Conflicts to Watch

- **CORS:** Browsers cannot fetch other websites directly. All URL fetching MUST go through the Worker. Never attempt client-side URL fetching.
- **API Key exposure:** Claude API key must never appear in frontend code. Worker Secrets only.
- **localStorage limits:** Not available in private/incognito browsing. Plan a graceful fallback (just show profile selector).
- **Domain change:** When domain is set, update canonical URL, all meta tags, and CORS allowed origins in the Worker config.
