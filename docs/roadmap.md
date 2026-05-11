# Roadmap

## Status Key
- ✅ Done
- 🔨 In progress / pending
- 📋 Planned
- 🔮 Future / deferred

---

## Core Infrastructure

| Feature | Status | Notes |
|---|---|---|
| GitHub → Cloudflare Pages pipeline | ✅ | Auto-deploys on push to main |
| Cloudflare Worker | ✅ | readclear-worker.kev-958.workers.dev — manually deployed |
| Custom domain | ✅ | readclear.importantsmallthings.com |
| Buy Me a Coffee link | ✅ | readclear tip page in all footers |
| Cloudflare Web Analytics | 🔨 | Token needed from Cloudflare dashboard — see [analytics.md](analytics.md) |

---

## Profiles

| Feature | Status | Notes |
|---|---|---|
| Mixed / Unsure profile | ✅ | Default |
| Phonological profile | ✅ | |
| Visual Stress profile | ✅ | |
| Working Memory profile | ✅ | |
| Aphasia profile | ✅ | Full implementation across all tools — see [profiles.md](profiles.md) |

---

## URL Reformatter (index.html)

| Feature | Status | Notes |
|---|---|---|
| URL input + submit | ✅ | Auto-adds https:// if missing |
| Profile selector (dyslexia) | ✅ | 4 mini-cards, persists in localStorage |
| Aphasia profile chip | ✅ | Separate row with blue chip |
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

## Read Page (read.html)

| Feature | Status | Notes |
|---|---|---|
| Reformatted content display | ✅ | Sanitised HTML rendering |
| Profile-specific CSS | ✅ | body.dataset.profile targeting |
| Aphasia boxed sections | ✅ | CSS targets body[data-profile="aphasia"] section |
| Truncation banner | ✅ | Shown if content was cut before sending to Claude |
| REFINE panel | ✅ | Design prefs + content reformat — see [refine-panel.md](refine-panel.md) |
| TTS — Listen button | ✅ | Plays whole article |
| TTS — Section icons | ✅ | 🔊 icon next to each heading, plays just that section |
| TTS — Pause/play | ✅ | Pause/resume, works correctly when switching sections |
| TTS — Chrome 15s bug fix | ✅ | Heartbeat pause/resume every 14s |
| TTS — Heading pauses | ✅ | Appends pause after heading text |
| Reading Ruler | ✅ | Horizontal line follows cursor/touch |
| Focus Mode | ✅ | Dims non-active paragraphs and headings |
| Dark mode | ✅ | data-bg="dark" CSS targeting |

---

## Prompt Builder (prompt.html)

| Feature | Status | Notes |
|---|---|---|
| Profile selector (dyslexia) | ✅ | |
| Aphasia profile card | ✅ | Distinct styling with dark border hint |
| Trait toggles | ✅ | |
| Live prompt generator | ✅ | |
| Copy button | ✅ | |
| AI install guide | ✅ | ChatGPT, Claude, Gemini, Copilot |
| Aphasia demo | ✅ | Demo profile button added |

---

## Scan Tool (scan.html)

| Feature | Status | Notes |
|---|---|---|
| Camera + file upload | ✅ | Separate inputs for camera vs file |
| Drag and drop (desktop) | ✅ | |
| Client-side image resize | ✅ | 800px max, JPEG 0.85 |
| Worker vision endpoint | ✅ | /reformat-image, claude-haiku-4-5 |
| Profile carry-through | ✅ | Reads from same localStorage key |
| Aphasia profile chip | ✅ | Same chip as index.html |
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

## Analytics

| Feature | Status | Notes |
|---|---|---|
| Cloudflare Workers Metrics | ✅ | Request count, CPU time — auto-provided |
| Anthropic Console | ✅ | Token usage, cost tracking — check monthly |
| Cloudflare Web Analytics | 🔨 | Needs token from Cloudflare dashboard — see [analytics.md](analytics.md) |

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
| ADHD profile | 🔮 | |
| ESL profile | 🔮 | |
| Widgit symbols in aphasia output | 🔮 | Images alongside text — complex, many failure modes |
| User-provided API keys | 🔮 | Needs careful security thinking |
| User accounts | 🔮 | Cloudflare D1 if needed |
| Full site reformatting | 🔮 | Much more complex than single pages |
