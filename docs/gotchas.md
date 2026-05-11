# Gotchas — Known Pitfalls

Check this file before making changes. Add to it whenever a bug is found and fixed.

---

## Deployment

### Two-system deployment — the most common source of confusion
**Problem:** There are two separate deployment systems. GitHub push only deploys the frontend. The Worker requires a separate manual step.

**System 1 — Cloudflare Pages (auto):**
- GitHub push to `main` → Cloudflare Pages webhook → live site updated
- Covers: `index.html`, `read.html`, `scan.html`, `prompt.html`, `siteowners.html`, all CSS/JS
- Takes ~30–60 seconds after the push

**System 2 — Cloudflare Worker (manual):**
- `worker.js` changes do NOT auto-deploy
- Must: open Cloudflare dashboard → Workers & Pages → readclear-worker → Edit Code → paste full `worker.js` → click Deploy
- Always verify with `curl https://readclear-worker.kev-958.workers.dev/health` after deploying

**Rule:** If user-facing behaviour depends on a Worker change, that change will not appear until the Worker is redeployed manually.

### Cloudflare Pages webhook sometimes disconnects
**Problem:** A push to GitHub doesn't trigger a Pages redeploy. The live site shows an old version.

**Fix:** Go to Cloudflare Pages dashboard → your project → Deployments → click "Retry deployment" on the latest commit. If that doesn't work: Settings → Git Integration → disconnect and reconnect GitHub. Last resort: `git commit --allow-empty -m "Trigger redeploy" && git push origin main`

### Wrong Worker URLs after branch merges
**Problem:** When merging feature branches, Worker URLs in HTML files may still point to the branch-specific Worker subdomain (e.g. `readclear-worker-v2.kev-958.workers.dev`) instead of the production Worker.

**Fix before merging:** Find and replace all occurrences in all HTML files:
```bash
sed -i '' 's/readclear-worker-v2\.kev-958\.workers\.dev/readclear-worker.kev-958.workers.dev/g' read.html index.html scan.html
```

**Rule:** Always confirm the Worker URL is `https://readclear-worker.kev-958.workers.dev` in every HTML file before merging to main.

---

## Profile Storage

### Profile stored as JSON object — never as plain string
**Problem:** `localStorage.getItem('readclear_profile')` returns `{"type":"visual"}`. If passed directly to `querySelector`, it throws a SyntaxError.

**Rule:** Always use `getProfile()` which parses the JSON and returns just the type string. See [profile-storage.md](profile-storage.md).

### Profile format must be consistent across ALL pages
**Rule:** Every page must use the same read/write pattern. See [profile-storage.md](profile-storage.md).

### VALID_PROFILES must include 'aphasia'
**Problem:** Pages that hardcode `VALID_PROFILES = ['mixed', 'phonological', 'visual', 'memory']` will reject the aphasia profile and fall back to mixed.

**Rule:**
```javascript
const VALID_PROFILES = ['mixed', 'phonological', 'visual', 'memory', 'aphasia'];
```
This must be updated in every page that validates profiles: `index.html`, `scan.html`, `prompt.html`, `read.html`, `worker.js`.

---

## body.dataset.profile — Aphasia CSS Targeting

### Must be set immediately when result renders
**Problem:** The aphasia boxed-sections CSS targets `body[data-profile="aphasia"]`. If `body.dataset.profile` is not set when the content becomes visible, the CSS won't apply and sections won't appear boxed.

**Rule:** In `read.html`, set `document.body.dataset.profile` at the exact moment the content is made visible:
```javascript
content.style.display = 'block';
document.body.dataset.profile = result.profile || 'mixed'; // ← immediately after
```

### Dark mode override requires both data attributes
**Problem:** Dark mode aphasia boxes need both `data-bg="dark"` and `data-profile="aphasia"` on the body.

**Rule:**
```css
body[data-bg="dark"][data-profile="aphasia"] .reading-content section {
  background: rgba(255,255,255,0.04);
  border-color: #3a5060;
}
```
If the dark mode toggle only sets `data-bg`, verify `data-profile` is also set on body at render time.

---

## Text-to-Speech (TTS)

### Section speaker icons play the whole article instead of the section
**Problem:** If the click handler for section speaker icons calls `speakAll()` or reads `document.body.innerText`, it plays the whole article.

**Rule:** Each section icon must collect text only from within its own section:
```javascript
const section = icon.closest('section') || icon.closest('.reading-section');
const text = section ? section.innerText : article.innerText;
window.speechSynthesis.speak(utterance); // speak only `text`
```

### Pause/play breaks when switching between section icons
**Problem:** Clicking a different section icon while TTS is playing causes the pause button to lose its reference to the current utterance. Subsequent pause clicks do nothing.

**Root cause:** Each new `SpeechSynthesisUtterance` is a separate object. Pausing only works if `speechSynthesis.pause()` is called — not if you try to pause a stale utterance reference.

**Fix:** Use a module-level `currentUtteranceId` counter. Each utterance gets an ID stamped at creation. Event handlers (`onend`, `onpause`) check if the ID still matches before updating UI state:
```javascript
let utteranceCounter = 0;
function speak(text) {
  const id = ++utteranceCounter;
  const utt = new SpeechSynthesisUtterance(text);
  utt.onend = () => { if (utteranceCounter === id) resetPlayUI(); };
}
```

### Chrome 15-second TTS bug
**Problem:** Chrome's Web Speech API silently stops speaking after ~15 seconds of continuous TTS. The `onend` event fires prematurely.

**Fix:** Use a periodic `pause()/resume()` heartbeat while speech is active:
```javascript
const chromeFix = setInterval(() => {
  if (speechSynthesis.speaking) {
    speechSynthesis.pause();
    speechSynthesis.resume();
  }
}, 14000);
utt.onend = () => clearInterval(chromeFix);
```

### Headings run into first sentence without a pause
**Problem:** The Web Speech API doesn't add a natural pause after heading text, so it sounds like the heading runs into the first sentence.

**Fix:** When collecting text for TTS, append a period to heading text if it doesn't already end with punctuation:
```javascript
el.querySelectorAll('h1,h2,h3,h4').forEach(h => {
  if (!/[.!?]$/.test(h.innerText.trim())) {
    // handled in text collection by adding '. ' after heading text
  }
});
```
Or build the TTS text string manually, adding `. ` after each heading.

---

## Cloudflare Worker

### Wrong model name causes silent hang
**Problem:** Using an unavailable model name causes Claude API to return an error that may not surface clearly on the frontend.

**Rule:** Only use `claude-haiku-4-5`. See [worker.md](worker.md) for the full model list.

### Worker root URL returns "Not found" — this is correct
**Problem:** Visiting `https://readclear-worker.kev-958.workers.dev/` in a browser shows "Not found". This alarms users who think something is broken.

**Explanation:** The Worker only handles `POST /reformat`, `POST /reformat-image`, and `GET /health`. A `GET /` returns "Not found" by design — the Worker is an API, not a web page. This is correct behaviour.

**Verification:** Use `curl https://readclear-worker.kev-958.workers.dev/health` — should return `{"status":"ok"}`.

### CORS blocks requests from unlisted origins
**Rule:** When adding a new domain, update `ALLOWED_ORIGINS` in `worker.js` AND redeploy the Worker manually.

---

## JavaScript

### FileReader uses e.target.result, not e.result
**Rule:**
```javascript
reader.onload = e => resolve(e.target.result.split(',')[1]);
```

### canvas.toBlob() can return null on mobile
**Rule:**
```javascript
canvas.toBlob(blob => resolve(blob || file), 'image/jpeg', 0.85);
```

### Uncaught errors in async functions silently swallow errors
**Rule:** Always wrap `async` function bodies in try/catch with a user-visible error path.

---

## Design

### Fraunces italic is unreadable for dyslexic users
**Rule:** Never use the italic variant of Fraunces anywhere. Upright only.

### Light grey text on dark backgrounds fails contrast
**Rule:** On dark backgrounds (`--dark: #1c1917`), minimum readable text is `#6a6560`. Prefer `#8a857e` or `#c8c3bc` for secondary, `#faf8f3` for primary.

### Demo labels must wrap with their panels
**Rule:** Wrap each label + panel pair in a `.demo-col` container to prevent detachment on mobile column layout.

---

## Content

### Demo content must preserve ALL original facts
**Rule:** List every fact in the original. Verify all appear in every profile version. Only structure changes, never content.

---

## Workflow

### Browser caches old JS — hard refresh required
**Rule:** After deploying JS fixes, hard refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+F5 (Windows).

### Edit tool fails if old_string is not exact
**Problem:** When using Claude Code's Edit tool to modify a file, the edit will fail if `old_string` doesn't exactly match (including surrounding context like `active-check` divs).

**Fix:** Read the file at the exact offset of the section to edit, then use the exact content shown.

### Always use absolute paths for Worker URL
**Rule:** Worker URL is `https://readclear-worker.kev-958.workers.dev`. Always include `https://`.
