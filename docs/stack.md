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
| TTS | Web Speech API (browser built-in) | Zero cost, no server calls, works offline |
| Secret management | Cloudflare Worker Secrets | API key stored here — never in frontend |
| Version control | GitHub (kevm0ss/clearread) | Auto-deploys to Cloudflare Pages |
| Code editor | VS Code | Kevin's editor |
| Analytics (pending) | Cloudflare Web Analytics | Cookie-free, privacy-respecting, integrates with Cloudflare |

---

## AI Model Notes

The Anthropic API key available on this account supports `claude-haiku-4-5`.

**Known unavailable models on this API key:**
- `claude-3-haiku-20240307` — rejected
- `claude-3-5-haiku-20241022` — rejected

Always use `claude-haiku-4-5` for both text and image endpoints. `claude-haiku-4-5` supports vision (image) inputs — confirmed working with the `/reformat-image` endpoint.

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
| Cloudflare | Kevin's personal account | Separate from any business accounts — intentional |
| Anthropic | Kevin's account | API key in Worker Secrets as ANTHROPIC_API_KEY |
| Domain | importantsmallthings.com | readclear lives at readclear.importantsmallthings.com |

---

## What We Are Not Using (and Why)

| Tool | Reason |
|---|---|
| React / Vue / Svelte | Adds complexity — not needed |
| Node.js / Express | Cloudflare Workers handles backend |
| Database | No user accounts in MVP — localStorage is sufficient |
| Google Analytics | Privacy concerns for accessibility audience; Cloudflare Web Analytics is better fit |
| Local dev server | Editing and pushing to see live changes |

---

## Two-System Deployment

The most important stack characteristic: **Cloudflare Pages and Cloudflare Workers are separate systems** with separate deployment triggers.

- **Pages:** GitHub push → auto-deploy (HTML/CSS/JS)
- **Workers:** Manual paste into Cloudflare dashboard (worker.js only)

See [deployment.md](deployment.md) for the full workflow.

---

## Future Stack Considerations

- **Chrome Extension:** Requires a separate manifest.json and extension build process
- **PDF tool:** May need a PDF parsing library in the Worker
- **User accounts:** Cloudflare D1 is the natural choice in this ecosystem
- **User-provided API keys:** Security implications need careful thought
- **Widgit symbols (aphasia):** Would require image generation or a symbol API — very complex
