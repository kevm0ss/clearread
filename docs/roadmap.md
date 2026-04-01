# Roadmap

## Status Key
- ✅ Done
- 🔨 In progress
- 📋 Planned
- 🔮 Future / deferred

---

## Core Infrastructure

| Feature | Status | Notes |
|---|---|---|
| GitHub → Cloudflare Pages pipeline | ✅ | Auto-deploys on push to main |
| Cloudflare Worker | ✅ | readclear-worker.kev-958.workers.dev |
| Custom domain | ✅ | readclear.importantsmallthings.com |
| Buy Me a Coffee link | ✅ | catmosonic tip page in all footers |

---

## URL Reformatter (index.html)

| Feature | Status | Notes |
|---|---|---|
| URL input + submit | ✅ | Auto-adds https:// if missing |
| Profile selector (4 types) | ✅ | Mini-cards, persists in localStorage |
| Profile quiz | ✅ | One question at a time, emoji anchors |
| Worker backend | ✅ | Fetch + extract + Claude reformat |
| Claude Haiku model | ✅ | ~£0.01/reformat |
| Content extraction | ✅ | Preserves headings, links, lists, bold |
| SSRF protection | ✅ | Blocks private IPs and localhost |
| XSS sanitisation (read.html) | ✅ | Allowlist-based tag/attribute filter |
| localStorage page cache | ✅ | 7-day expiry, max 10 entries, LRU eviction |
| Recently read history | ✅ | Loads from cache or scrolls to URL input |
| Before/after slider demo | ✅ | Real Wikipedia screenshots |
| Share section | ✅ | LinkedIn, X, BlueSky, copy link |
| Cache badge + refresh button | ✅ | Shown on read.html for cached results |

---

## Prompt Builder (prompt.html)

| Feature | Status | Notes |
|---|---|---|
| Profile selector | ✅ | |
| Trait toggles | ✅ | |
| Live prompt generator | ✅ | |
| Copy button | ✅ | |
| AI install guide | ✅ | ChatGPT, Claude, Gemini, Copilot |
| Design aligned with index.html | ✅ | Same nav, footer, CSS variables |

---

## Scan Tool (scan.html)

| Feature | Status | Notes |
|---|---|---|
| Camera + file upload | ✅ | Separate inputs for camera vs file |
| Drag and drop (desktop) | ✅ | |
| Client-side image resize | ✅ | 800px max, JPEG 0.85 |
| Worker vision endpoint | ✅ | /reformat-image, claude-haiku-4-5 |
| Profile carry-through | ✅ | Reads from same localStorage key |
| Privacy notice | ✅ | Honest, not scary |
| Public linking | 📋 | Wait until tested and cost is understood |

---

## Site Owner Page (siteowners.html)

| Feature | Status | Notes |
|---|---|---|
| Soft sales message | ✅ | |
| Contact link | ✅ | importantsmallthings.com/#contact |
| LinkedIn link | ✅ | linkedin.com/company/108339431 |

---

## SEO / Discoverability

| Feature | Status | Notes |
|---|---|---|
| Meta description | 📋 | Domain confirmed — implement when priorities allow |
| Open Graph tags | 📋 | |
| robots.txt | 📋 | |
| llms.txt | 📋 | For AI crawler discoverability |
| JSON-LD structured data | 📋 | |

---

## Future Features

| Feature | Status | Notes |
|---|---|---|
| Chrome extension | 🔮 | Reformat any page while browsing |
| PDF reformatter | 🔮 | Separate from image scan — needs Worker PDF parsing |
| Image reformatter (public) | 🔮 | Currently private beta |
| Stroke / brain injury profiles | 🔮 | Same trait system, different framing |
| ADHD profile | 🔮 | |
| ESL profile | 🔮 | |
| User-provided API keys | 🔮 | Needs careful security thinking |
| Analytics | 🔮 | Add when there is something to measure |
| User accounts | 🔮 | Cloudflare D1 if needed |
| Full site reformatting | 🔮 | Much more complex than single pages |
