# ClearRead — Project Knowledge Base

## Core Principle (Non-negotiable)

> **"Content should never be reduced. Only reorganised."**

This applies to everything — the product, the demo, the copy, the code. For dyslexia profiles: never simplify or remove content. For aphasia: facts are always preserved, vocabulary may be simplified using everyday alternatives.

---

## Docs Index

| File | What it covers |
|---|---|
| [docs/product.md](docs/product.md) | Product decisions, structure, audience, and user flow |
| [docs/architecture.md](docs/architecture.md) | Technical architecture, data flows, localStorage keys, two-system deployment |
| [docs/deployment.md](docs/deployment.md) | Step-by-step deployment workflow for Pages and Worker |
| [docs/profiles.md](docs/profiles.md) | All five profiles including aphasia — traits, prompts, and key differences |
| [docs/profile-storage.md](docs/profile-storage.md) | localStorage format, read/write pattern, VALID_PROFILES |
| [docs/worker.md](docs/worker.md) | Cloudflare Worker endpoints, system prompts, allowed tags, aphasia prompt |
| [docs/read.md](docs/read.md) | read.html — sanitiser, body.dataset.profile, aphasia CSS, toolbar |
| [docs/reading-aids.md](docs/reading-aids.md) | TTS implementation, Chrome bug fix, utterance ID pattern, ruler, focus mode |
| [docs/refine-panel.md](docs/refine-panel.md) | REFINE panel — design prefs, content reformat, undo, localStorage keys |
| [docs/design.md](docs/design.md) | Design system, fonts, colours, accessibility rules |
| [docs/content-principles.md](docs/content-principles.md) | Content rules for copy, demos, and AI output |
| [docs/stack.md](docs/stack.md) | Tech stack and tooling decisions |
| [docs/caching.md](docs/caching.md) | Page cache implementation |
| [docs/scan-tool.md](docs/scan-tool.md) | scan.html — image/scan reformatter |
| [docs/analytics.md](docs/analytics.md) | Analytics sources, pending Cloudflare Web Analytics setup |
| [docs/roadmap.md](docs/roadmap.md) | Built, in progress, planned, and future features |
| [docs/gotchas.md](docs/gotchas.md) | Known technical and design pitfalls — check before every change |

---

## Quick Reference

- **GitHub repo:** kevm0ss/clearread
- **Live URL:** readclear.importantsmallthings.com (also clearread-7x3.pages.dev)
- **Hosting:** Cloudflare Pages (frontend auto-deploy) + Cloudflare Workers (backend manual deploy)
- **Worker URL:** `https://readclear-worker.kev-958.workers.dev`
- **AI model:** `claude-haiku-4-5` — only confirmed model on this API key
- **No frameworks.** Vanilla HTML, CSS, JavaScript only.

---

## The Two-System Deployment Rule

**Frontend (HTML/CSS/JS):** `git push origin main` → auto-deploys via Cloudflare Pages (~60s)

**Backend (worker.js):** Must be manually pasted into the Cloudflare Workers dashboard → click Deploy

These are completely independent. A git push does NOT deploy the Worker. See [docs/deployment.md](docs/deployment.md).

---

## Profiles Quick Reference

| Profile | Type | Key rule |
|---|---|---|
| mixed | Dyslexia | Short sentences, clear structure, plain language |
| phonological | Dyslexia | Common words, define terms, key point first |
| visual | Dyslexia | Generous spacing, short lines, small chunks |
| memory | Dyslexia | Summary first, numbered steps, always know where you are |
| aphasia | Language difficulty | 5-word sentences, no pronouns, active voice, everyday words, `<section>` boxes |

**Critical difference:** Dyslexia — vocabulary must NOT be changed. Aphasia — vocabulary MAY be simplified with everyday alternatives. Facts always preserved.

---

## Before Making Any Change

1. Read the relevant doc first
2. Check [docs/gotchas.md](docs/gotchas.md) for known pitfalls
3. Check [docs/architecture.md](docs/architecture.md) if the change touches infrastructure
4. If adding a new profile: update `VALID_PROFILES` in all pages + Worker
5. If touching `sanitiseHtml()` in read.html: sync with Worker allowed tags list
6. If touching `body.dataset.profile`: verify aphasia boxes still render
7. Flag any conflicts before implementing
8. Update the relevant doc after making the change

---

## Never Break These Rules

- `VALID_PROFILES` must include `'aphasia'` in every page and the Worker
- `<section>` must stay in the sanitiser allowlist — aphasia boxes depend on it
- `body.dataset.profile` must be set immediately when content becomes visible in read.html
- `ANTHROPIC_API_KEY` must never appear in source code — Worker Secrets only
- Worker URL in all HTML files must be `https://readclear-worker.kev-958.workers.dev`
- Fraunces font: never italic
- The "content not reduced" rule must be in every dyslexia system prompt
