# Gotchas — Known Pitfalls

Lessons learned. Check this before making changes.

---

## Content

### Demo content must include ALL original facts
**Problem:** Early demo versions lost content when reformatting for different profiles. The phonological and working memory versions were missing: marketing strategy as a section, the 3-year financial forecast timeframe, risk identification, investor credibility point, and specific financial outputs (P&L, cash flow, balance sheets).

**Rule:** Every fact in the original must appear in every reformatted version. Only the structure changes.

**Check:** When updating demo content, list all facts in the original first, then verify each appears in all four profile versions.

---

## Design

### Italic serif is unreadable for many dyslexic users
**Problem:** Fraunces italic was used for the tagline. Kevin (dyslexic) found it hard to read.

**Rule:** Fraunces is used upright only. Never use the italic variant anywhere on the site.

### Light grey text on dark backgrounds fails readability
**Problem:** `color: #8a857e` on dark backgrounds (`#1c1917`) was used in the quiz. Very hard to read for dyslexic users.

**Rule:** On dark backgrounds, use `--cream` (#faf8f3) or `--white` for readable text. `--ink-soft` is for captions only, never body copy.

### Demo labels must wrap with their panels
**Problem:** On mobile, the demo label row and panel row were separate flex elements. When both went to column layout, the order became: [Original label] [ClearRead label] [Original panel] [ClearRead panel] — labels detached from their content.

**Rule:** Wrap each label + panel pair in a `.demo-col` container. Never rely on two separate flex rows aligning in column mode on mobile.

### Mobile badge overflow
**Problem:** `padding-right: 100px` on the hero top bar pushed the "Free tool · No sign-up required" badge off screen on mobile.

**Rule:** Use a CSS class for this padding, not an inline style. Override to 0 in mobile media queries.

---

## Technical

### CORS blocks client-side URL fetching
**Problem:** Browsers block JavaScript from fetching URLs on other domains. You cannot fetch a URL from the frontend.

**Rule:** All URL fetching MUST go through the Cloudflare Worker. Never attempt to fetch external URLs from frontend JavaScript.

### API key must never be in frontend code
**Problem:** If the Claude API key is placed in HTML or JavaScript, it is publicly visible to anyone who views source.

**Rule:** API key lives in Cloudflare Worker Secrets only. The Worker makes the Claude API call. The frontend never touches the key.

### localStorage not available in private browsing
**Problem:** localStorage is blocked in some private/incognito sessions. Profile persistence will silently fail.

**Rule:** Always wrap localStorage calls in try/catch. Fall back gracefully — show the profile selector as if no profile is saved.

```javascript
function saveProfile(data) {
  try {
    localStorage.setItem('clearread_profile', JSON.stringify(data));
  } catch(e) {
    // Private browsing — fail silently
  }
}
```

### Domain change requires updating multiple places
**Problem:** Meta tags, Open Graph, canonical URL, and Worker CORS config all reference the domain. Changing the domain requires updating all of them.

**Rule:** Do not hardcode the domain more than necessary before it is finalised. When the domain is set, do a full search for the old URL before pushing.

### Mixed profile demo — details/summary default state
**Problem:** The "The 6 sections" details element in the mixed demo was open by default. Should be closed.

**Rule:** Never add the `open` attribute to `<details>` elements in the mixed profile demo. Default is closed.

---

## Workflow

### Do not use index.html as a template
**Problem:** index.html is a polished, agreed file. Copying it as a base for other pages risks accidentally modifying it or inheriting styles that don't belong.

**Rule:** New pages (reformat.html, read.html) should be built from scratch with shared CSS extracted to a separate file if needed.

### Always push to GitHub to see live changes
**Problem:** There is no local dev server set up. Changes only appear live after pushing to GitHub.

**Rule:** For significant changes, consider installing VS Code Live Server extension for local preview before pushing.
