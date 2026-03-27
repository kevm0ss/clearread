# Tech Stack

## Guiding Principle

Keep it simple. Add complexity only when needed. Kevin is learning as he builds — every tool added is a tool that needs to be understood.

---

## Current Stack

| Layer | Tool | Why |
|---|---|---|
| Frontend | Vanilla HTML / CSS / JS | No build step, easy to understand, Cloudflare serves static files perfectly |
| Fonts | Google Fonts (Monaco, Fraunces, Plus Jakarta Sans, JetBrains Mono) | Free, fast, no self-hosting needed yet |
| Hosting | Cloudflare Pages | Free tier, global CDN, auto-deploys from GitHub |
| Version control | GitHub (kevm0ss/clearread) | Standard, integrates with Cloudflare Pages |
| Code editor | VS Code | Kevin's editor, already installed |

---

## Planned Stack (Service 2)

| Layer | Tool | Why |
|---|---|---|
| Backend API | Cloudflare Workers | Already in the Cloudflare ecosystem, generous free tier (100k req/day), keeps API key secure |
| Content extraction | Mozilla Readability.js | Same library Firefox uses for Reader View, battle-tested |
| AI model | Anthropic Claude API | Kevin already has an account and API key |
| Secret management | Cloudflare Worker Secrets | API key stored here — never in frontend code |

---

## Accounts and Access

| Service | Account | Notes |
|---|---|---|
| GitHub | kevm0ss | Kevin's personal account |
| Cloudflare | Kevin's personal account | Separate from Aaron's business account — intentional |
| Anthropic | Kevin's account | API key ready |
| Domain registrar | TBD | Decision pending: readclear.ai or importantsmallthings.com/readclear |

---

## What We Are Not Using (and Why)

| Tool | Reason not used |
|---|---|
| React / Vue / Svelte | Adds complexity and a build step — not needed for this scope |
| Node.js / Express | Cloudflare Workers handles the backend — no server to manage |
| Database | No user accounts in MVP — localStorage is sufficient |
| Analytics | Not set up yet — add after domain decision |
| CMS | Static HTML is fine for now |

---

## Future Stack Considerations

- **Chrome Extension:** Will require a separate manifest.json + extension build process. Different from the web app.
- **PDF tool:** May need a PDF parsing library in the Worker (e.g., pdf-parse).
- **User accounts:** If added, would need a database (Cloudflare D1 is the natural choice in this ecosystem).
- **User API keys:** Security implications need careful thought before implementation.

---

## Local Development

Kevin's setup:
- Mac (MacBook Air)
- Git: version 2.39.5 (Apple Git-154)
- VS Code with shell command installed (`code .` works)
- `code .` opens repo in VS Code from Terminal
- Push to GitHub via Terminal git commands

No local dev server currently — editing files and pushing to see changes on the live Cloudflare URL. When the project grows, a local server may be helpful (VS Code Live Server extension is the easiest option).
