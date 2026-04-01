# Cloudflare Worker

## Deployment

The Worker is **not** auto-deployed. When `worker.js` changes:
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Workers & Pages → readclear-worker
3. Edit Code — paste the full contents of `worker.js`
4. Click Deploy

Worker URL: `https://readclear-worker.kev-958.workers.dev`

---

## Endpoints

### GET /health
Returns `{"status":"ok"}`. Use this to verify the Worker is up before debugging other issues.

### POST /reformat
URL reformatter.

Request body:
```json
{ "url": "https://example.com/article", "profile": "mixed" }
```

Response:
```json
{ "html": "...", "title": "...", "profile": "mixed", "url": "https://..." }
```

Flow: Validates URL → SSRF check → Fetch page → `extractContent()` → Claude API → strip code fences → return HTML.

### POST /reformat-image
Image/scan reformatter.

Request body:
```json
{ "imageData": "base64string...", "mediaType": "image/jpeg", "profile": "mixed" }
```

Response:
```json
{ "html": "...", "title": "...", "profile": "mixed" }
```

Flow: Validate mediaType → Claude API with image content block → strip code fences → extract title from first h1 → return HTML.

---

## CORS

```javascript
const ALLOWED_ORIGINS = [
  'https://readclear.importantsmallthings.com',
  'https://clearread-7x3.pages.dev',
];
```

**Update this list when adding new domains.** If a new page is hosted on a different origin it will get CORS errors.

All endpoints return CORS headers. Preflight OPTIONS returns 204.

---

## AI Model

Both endpoints use `claude-haiku-4-5`.

- Text endpoint: text-only messages
- Image endpoint: messages with `image` content block (vision)
- `claude-haiku-4-5` confirmed to support both text and vision on Kevin's API key
- Do NOT use `claude-3-haiku-20240307` or `claude-3-5-haiku-20241022` — both rejected by this API key

---

## SSRF Protection (/reformat only)

Blocks requests to:
- `localhost`, `127.0.0.1`, `0.0.0.0`, `::1`
- `169.254.169.254` (cloud metadata endpoint)
- Private IP ranges: `10.x`, `192.168.x`, `172.16-31.x`

---

## Content Extraction

`extractContent(html, baseUrl)` runs in the Worker before the Claude call:

1. Strips scripts, styles, nav, header, footer, aside, iframes
2. Tries to isolate `<main>`, `<article>`, or content divs
3. Converts headings → `# ## ###` markdown style
4. Converts links → `[text](url)` with resolved absolute URLs
5. Converts bold → `**text**`
6. Converts list items → `• item`
7. Strips all remaining HTML tags
8. Decodes HTML entities
9. Collapses excess whitespace

---

## System Prompts

The four profile prompts live in `PROFILE_PROMPTS` in `worker.js`. Each contains:
- Profile statement
- Core rule: "Never remove, simplify, or summarise the original content"
- Profile-specific guidance
- Numbered formatting rules

The system prompt also specifies:
- Output format: clean semantic HTML only, no markdown, no code fences
- Allowed tags list
- No `<html>/<head>/<body>/<style>` wrappers

---

## Code Fence Stripping

Claude sometimes wraps output in markdown code fences despite instructions. The Worker strips them:

```javascript
reformattedHtml = reformattedHtml
  .replace(/^```html\s*/i, '')
  .replace(/^```\s*/i, '')
  .replace(/\s*```$/i, '')
  .trim();
```

---

## Environment Variables

| Variable | Where set | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | Cloudflare Worker Secrets | Claude API authentication |

Never put this in `worker.js` source code.

---

## Cost

| Operation | Model | Approx cost |
|---|---|---|
| URL reformat | claude-haiku-4-5 | ~£0.01 per reformat |
| Image reformat | claude-haiku-4-5 | ~£0.03–0.05 per image (vision tokens cost more) |
