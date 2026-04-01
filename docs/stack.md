# Tech Stack

## Guiding Principle

Keep it simple. Add complexity only when needed. Kevin is learning as he builds — every tool added is a tool that needs to be understood.

---

## Current Stack

| Layer | Tool | Why |
|---|---|---|
| Frontend | Vanilla HTML / CSS / JS | No build step, easy to understand |
| Fonts | Google Fonts (Monaco, Fraunces, Plus Jakarta Sans) | Free, fast |
| Hosting | Cloudflare Pages | Free tier, global CDN, auto-deploys from GitHub |
| Backend API | Cloudflare Workers | Keeps API key secure, same Cloudflare ecosystem |
| AI model (text) | claude-haiku-4-5 | Fast, cheap (~£0.01/reformat), available on Kevin's API key |
| AI model (image) | claude-haiku-4-5 | Same model — supports vision inputs |
| Secret management | Cloudflare Worker Secrets | API key stored here — never in frontend |
| Version control | GitHub (kevm0ss/clearread) | Auto-deploys to Cloudflare Pages |
| Code editor | VS Code | Kevin's editor |

---

## AI Model Notes

The Anthropic API key available on this account supports `claude-haiku-4-5`.

**Known unavailable models on this API key:**
- `claude-3-haiku-20240307` — rejected
- `claude-3-5-haiku-20241022` — rejected

Always use `claude-haiku-4-5` for both text and image endpoints. If a new model is needed, test against the Worker `/health` endpoint first.

`claude-haiku-4-5` supports vision (image) inputs — confirmed working with the `/reformat-image` endpoint.

---

## Fonts

| Font | Usage | Notes |
|---|---|---|
| Monaco | Logo/wordmark only | System monospace fallback: 'Courier New' |
| Fraunces | Headings | Weight 600–700. **Never italic** |
| Plus Jakarta Sans | Body text | Weight 400–700 |

---

## Accounts

| Service | Account | Notes |
|---|---|---|
| GitHub | kevm0ss | Kevin's personal account |
| Cloudflare | Kevin's personal account | Separate from Aaron's business account — intentional |
| Anthropic | Kevin's account | API key in Worker Secrets as ANTHROPIC_API_KEY |
| Domain | importantsmallthings.com | readclear lives at /readclear subdirectory redirect |

---

## What We Are Not Using (and Why)

| Tool | Reason |
|---|---|
| React / Vue / Svelte | Adds complexity — not needed |
| Node.js / Express | Cloudflare Workers handles backend |
| Database | No user accounts in MVP — localStorage is sufficient |
| Analytics | Not set up yet |
| Local dev server | Editing and pushing to see live changes |

---

## Future Stack Considerations

- **Chrome Extension:** Requires a separate manifest.json and extension build process
- **PDF tool:** May need a PDF parsing library in the Worker
- **User accounts:** Cloudflare D1 is the natural choice in this ecosystem
- **User-provided API keys:** Security implications need careful thought
