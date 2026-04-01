# Gotchas — Known Pitfalls

Check this file before making changes. Add to it whenever a bug is found and fixed.

---

## Profile Storage

### Profile stored as JSON object — never as plain string
**Problem:** `localStorage.getItem('readclear_profile')` returns `{"type":"visual"}` (a JSON object string). If this is passed directly to `querySelector`, it throws a SyntaxError:
```
Failed to execute 'querySelector': '.mini-card[data-profile="{"type":"visual"}"]' is not a valid selector
```

**Rule:** Always use `getProfile()` which parses the JSON and returns just the type string. Never use `localStorage.getItem('readclear_profile')` directly as a selector value. See [profile-storage.md](profile-storage.md).

### Profile format must be consistent across ALL pages
**Problem:** If one page saves as a plain string and another expects a JSON object, the profile is lost when navigating between pages.

**Rule:** Every page must use the exact same read/write pattern. See [profile-storage.md](profile-storage.md) for the canonical pattern.

---

## JavaScript

### FileReader uses e.target.result, not e.result
**Problem:** `reader.onload = e => e.result.split(',')[1]` throws `Cannot read properties of undefined (reading 'split')` because `e.result` doesn't exist.

**Rule:** Always use `e.target.result`:
```javascript
reader.onload = e => resolve(e.target.result.split(',')[1]);
```

### canvas.toBlob() can return null on mobile
**Problem:** On some mobile browsers, `canvas.toBlob()` calls the callback with `null` instead of a Blob. The subsequent `blobToBase64(null)` call then throws.

**Rule:** Always provide a fallback:
```javascript
canvas.toBlob(blob => resolve(blob || file), 'image/jpeg', 0.85);
```

### Uncaught errors in async functions silently swallow errors
**Rule:** Always wrap `async` function bodies in try/catch. Always have a catch block that shows the error to the user, not just `console.error`.

---

## Cloudflare Worker

### Wrong model name causes silent hang on the frontend
**Problem:** Using a model name not available on the API key (e.g., `claude-3-haiku-20240307`, `claude-3-5-haiku-20241022`) causes the Claude API to return an error. If the Worker doesn't surface that error clearly, the frontend appears to hang indefinitely.

**Rule:** Only use `claude-haiku-4-5` — confirmed working on Kevin's API key for both text and vision. Always surface the raw Claude API error message when logging:
```javascript
let detail = '';
try { detail = JSON.parse(errBody)?.error?.message || ''; } catch(e) {}
return errorResponse(`Formatting service error: ${detail || apiRes.status}`, 502, corsHeaders);
```

### Worker must be manually redeployed
**Problem:** Pushing `worker.js` to GitHub does NOT redeploy the Worker. Only the Cloudflare Pages frontend auto-deploys.

**Rule:** After every `worker.js` change, paste the new code into the Cloudflare Workers dashboard and click Deploy. Test with a curl to `/health` after deploying.

### Cloudflare Pages webhook sometimes disconnects
**Problem:** A push to GitHub doesn't trigger a Pages redeploy. The live site shows an old version.

**Fix:** Go to Cloudflare Pages dashboard → your project → Deployments → click "Retry deployment" on the latest commit. If that doesn't work, go to Settings → Git Integration → disconnect and reconnect GitHub.

### CORS blocks requests from unlisted origins
**Problem:** If a new page is served from a domain not in `ALLOWED_ORIGINS`, all Worker requests will fail with a CORS error.

**Rule:** When adding a new domain or subdomain, update `ALLOWED_ORIGINS` in `worker.js` AND redeploy the Worker.

---

## Design

### Fraunces italic is unreadable for dyslexic users
**Rule:** Never use the italic variant of Fraunces anywhere on the site. Upright only.

### Light grey text on dark backgrounds fails contrast
**Rule:** On dark backgrounds (`--dark: #1c1917`), minimum readable text colour is `#6a6560`. Prefer `#8a857e` or `#c8c3bc` for secondary text, `#faf8f3` for primary.

### Demo labels must wrap with their panels
**Problem:** On mobile, if the label row and panel row are separate flex elements, labels detach from their panels in column layout.

**Rule:** Wrap each label + panel pair in a `.demo-col` container.

---

## Content

### Demo content must preserve ALL original facts
**Problem:** Early demo versions lost facts when reformatting for different profiles.

**Rule:** List every fact in the original content. Verify all appear in every profile version. Only structure changes, never content.

---

## Workflow

### Browser caches old JS — hard refresh required
**Problem:** After deploying a fix, the user's browser may serve the old cached JavaScript. The fix appears not to work.

**Rule:** After deploying JS fixes, always hard refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+F5 (Windows).

### Always use absolute paths for Worker URL
**Problem:** If the WORKER_URL is defined without `https://` or points to the wrong subdomain, all API calls silently fail.

**Rule:** Worker URL is `https://readclear-worker.kev-958.workers.dev`. Double-check this is correct in any new page.
