# readclear — AI Working Reference

This file is the entry point for any AI assistant working on this codebase. Read this first. Follow the rules here. Update the relevant docs after making changes.

## Project in one sentence
readclear reformats web pages, documents, and scanned letters to be easier to read for people with dyslexia and aphasia. **Content is never reduced. Only reorganised.**

## Live URLs
- Main site: https://readclear.importantsmallthings.com
- Cloudflare Pages URL: https://clearread-7x3.pages.dev
- Worker: https://readclear-worker.kev-958.workers.dev

## Doc Index

| File | What it covers |
|---|---|
| [architecture.md](architecture.md) | Pages, Worker endpoints, deploy pipeline, data flows, localStorage keys |
| [deployment.md](deployment.md) | Step-by-step deployment workflow — two-system rule |
| [stack.md](stack.md) | Tools, accounts, models, why each was chosen |
| [profiles.md](profiles.md) | All five profiles (four dyslexia + aphasia), traits, quiz logic, key differences |
| [profile-storage.md](profile-storage.md) | **Critical** — how profile is saved/read in localStorage across pages |
| [worker.md](worker.md) | Cloudflare Worker — endpoints, CORS, prompts, model, aphasia prompt |
| [read.md](read.md) | read.html — sanitiser, body.dataset.profile, aphasia CSS, toolbar, features |
| [reading-aids.md](reading-aids.md) | TTS (incl. Chrome bug fix, utterance ID pattern), Reading Ruler, Focus Mode |
| [refine-panel.md](refine-panel.md) | REFINE panel — design prefs, content reformat, undo, localStorage keys |
| [caching.md](caching.md) | localStorage page cache — keys, expiry, eviction |
| [scan-tool.md](scan-tool.md) | Image/scan reformatter — private beta, how it works |
| [design.md](design.md) | CSS variables, typography, colour, spacing rules |
| [content-principles.md](content-principles.md) | The core rule, demo content, copy tone |
| [gotchas.md](gotchas.md) | Known pitfalls — check before making changes |
| [analytics.md](analytics.md) | Analytics sources, pending Cloudflare Web Analytics setup |
| [roadmap.md](roadmap.md) | What is built, what is planned, what is deferred |
| [product.md](product.md) | Product decisions, audience, scope |

---

## The Two-System Deployment Rule

**Frontend (HTML/CSS/JS):** `git push origin main` → auto-deploys via Cloudflare Pages

**Backend (worker.js):** Must be manually pasted into Cloudflare Workers dashboard → Deploy

These are completely independent. See [deployment.md](deployment.md).

---

## Before Making Any Change

1. **Read [gotchas.md](gotchas.md)** — it lists known pitfalls that have caused real bugs
2. **Check [profile-storage.md](profile-storage.md)** if touching anything profile-related
3. **Check [worker.md](worker.md)** if touching the Worker or adding new API calls
4. **Check [read.md](read.md)** if touching read.html or the sanitiser
5. **Flag conflicts** before implementing — don't silently override an architectural decision

---

## Rules That Must Never Be Broken

- Profile is always stored as `JSON.stringify({ type: 'mixed' })` — never as a plain string
- `VALID_PROFILES` must include `'aphasia'` in every page that validates profiles
- `<section>` must stay in the `sanitiseHtml()` allowlist — aphasia boxes depend on it
- `body.dataset.profile` must be set immediately when content becomes visible in read.html
- The Claude API key lives in Cloudflare Worker Secrets only — never in frontend code
- All URL fetching goes through the Worker — never client-side
- Dyslexia content is never removed or simplified — only restructured
- Aphasia: facts preserved, everyday vocabulary substitution allowed
- Fraunces font is never used in italic — it is unreadable for dyslexic users
- Worker URL in all HTML files must be `https://readclear-worker.kev-958.workers.dev`
- The Worker `ALLOWED_ORIGINS` list must be updated when adding new domains

---

## When Adding a New Page or Feature

- Carry the profile across: read with `getProfile()`, save with `setProfile()`
- Include `'aphasia'` in `VALID_PROFILES`
- Add aphasia chip in its own row ("Other reading difficulties:")
- Match the nav: Monaco logo 22px, BETA badge, sticky 68px height, dark background
- Match the footer: same links, coffee tip link, tagline
- Use CSS variables — never hardcode colours or widths that already have a variable
- Test on mobile — Kevin's primary check device is iPhone
- Update the relevant docs after building

---

## Updating These Docs

Update docs when:
- A new page is added
- A new Worker endpoint is added
- A new profile is added
- A new gotcha is discovered
- An architectural decision changes
- A feature is completed or deferred

Always add gotchas to [gotchas.md](gotchas.md) when a bug is found and fixed.
