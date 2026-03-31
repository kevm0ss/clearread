# ClearRead — Project Knowledge Base

## Core Principle (Non-negotiable)

> **"Content should never be reduced. Only reorganised."**

This applies to everything — the product, the demo, the copy, the code. Never simplify content. Only change how it is structured and presented.

---

## Docs Index

| File | What it covers |
|---|---|
| [docs/product.md](docs/product.md) | Product decisions, structure, and user flow |
| [docs/architecture.md](docs/architecture.md) | Technical architecture and infrastructure |
| [docs/profiles.md](docs/profiles.md) | The four dyslexia profiles and trait mappings |
| [docs/design.md](docs/design.md) | Design system, fonts, colours, accessibility rules |
| [docs/content-principles.md](docs/content-principles.md) | Content rules for copy, demos, and AI output |
| [docs/roadmap.md](docs/roadmap.md) | Built, planned, and future features |
| [docs/gotchas.md](docs/gotchas.md) | Known technical and design pitfalls |
| [docs/stack.md](docs/stack.md) | Tech stack and tooling decisions |

---

## Quick Reference

- **GitHub repo:** kevm0ss/clearread
- **Live URL:** clearread-7x3.pages.dev
- **Domain decision pending:** readclear.ai or importantsmallthings.com/readclear
- **Hosting:** Cloudflare Pages (frontend) + Cloudflare Workers (backend, planned)
- **API:** Anthropic Claude (Kevin has an account and API key)
- **No frameworks.** Vanilla HTML, CSS, JavaScript only.

---

## Before Making Any Change

1. Read the relevant doc first
2. Check [docs/gotchas.md](docs/gotchas.md) for known pitfalls
3. Check [docs/architecture.md](docs/architecture.md) if the change touches infrastructure
4. Flag any conflicts before implementing
5. Update the relevant doc after making the change
