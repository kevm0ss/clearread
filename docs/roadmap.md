# Roadmap

## Status Key
- ✅ Done
- 🔨 In progress
- 📋 Planned (MVP)
- 🔮 Future

---

## MVP — Launch Features

| Feature | Status | Notes |
|---|---|---|
| Core HTML page | ✅ | index.html — do not use as template |
| Profile selector (4 types) | ✅ | Cards with icons |
| Profile → smart trait defaults | ✅ | Selecting a profile pre-sets relevant traits |
| Preference toggles | ✅ | User can override any trait |
| Prompt generator | ✅ | Updates live as user makes selections |
| Copy prompt button | ✅ | |
| AI install guide | ✅ | ChatGPT, Claude, Gemini, Copilot |
| Demo (4 profiles, same content) | ✅ | Business plan document |
| Profile quiz | ✅ | Modal, one question at a time |
| Share section | ✅ | LinkedIn, Twitter/X, BlueSky, copy link |
| Mobile responsive | ✅ | Tested on iPhone |
| GitHub → Cloudflare pipeline | ✅ | Auto-deploys on push |
| SEO / GEO meta tags | 📋 | Waiting on domain decision |
| robots.txt | 📋 | Waiting on domain decision |
| llms.txt | 📋 | Waiting on domain decision |
| Domain setup | 📋 | readclear.ai or importantsmallthings.com/readclear |
| URL Reformatter (reformat.html) | 📋 | Lead tool — see architecture.md |
| Cloudflare Worker (backend API) | 📋 | Required for URL reformatter |
| Clean reading page (read.html) | 📋 | Output of URL reformatter |
| Profile persistence (localStorage) | 📋 | Share profile between pages |

---

## Post-Launch

| Feature | Status | Notes |
|---|---|---|
| Chrome extension | 🔮 | Reformat any page while browsing — no URL copy needed |
| PDF / image reformatter | 🔮 | Kevin has flagged this. People sent letters and documents need this. |
| Stroke / brain injury profiles | 🔮 | Same trait system, different profile framing |
| ADHD profile | 🔮 | |
| ESL profile | 🔮 | English as a second language |
| User-provided API keys | 🔮 | Needs careful security and UX thinking before building |
| Full site reformatting (not just pages) | 🔮 | Much more complex than single-page reformatting |
| Analytics | 🔮 | Add after launch when there's something to measure |

---

## Domain Decision (Pending)

Two options under consideration:

| Option | Pros | Cons |
|---|---|---|
| `readclear.ai` | Standalone, credible .ai TLD, own identity, easier to spin out | ~£12/year cost, new domain to manage |
| `importantsmallthings.com/readclear` | Free, builds on existing domain authority | Tied to IST brand, harder to spin out later |

Decision needed before SEO/GEO work begins.

---

## Next Build Session

1. Decide and set up domain
2. Add SEO/GEO meta tags, robots.txt, llms.txt
3. Build reformat.html (URL input + saved profile)
4. Set up Cloudflare Worker
5. Build read.html (reformatted reading view)
6. Wire them together end-to-end
