# Profile Storage — Critical Reference

This is one of the most common sources of bugs. Read carefully before touching anything profile-related.

---

## The Storage Format

The profile is stored in `localStorage` under the key `readclear_profile`.

**Format:** `JSON.stringify({ type: 'mixed' })`

**Valid values:**
```
readclear_profile = {"type":"mixed"}
readclear_profile = {"type":"phonological"}
readclear_profile = {"type":"visual"}
readclear_profile = {"type":"memory"}
readclear_profile = {"type":"aphasia"}
```

**Never store as a plain string.** If stored as `"visual"` (plain string), pages that try to `JSON.parse()` it will get the string `"visual"` instead of `{type:"visual"}`, and pages that use `saved.type` will get `undefined`.

---

## Standard Read/Write Pattern

Every page must use this exact pattern. Copy it, do not invent a new one.

```javascript
const PROFILE_KEY = 'readclear_profile';
const VALID_PROFILES = ['mixed', 'phonological', 'visual', 'memory', 'aphasia'];

// Read profile
function getProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY));
    if (saved && VALID_PROFILES.includes(saved.type)) return saved.type;
  } catch(e) {}
  return 'mixed'; // safe default
}

// Write profile
function setProfile(type, el) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ type }));
  } catch(e) {
    // Private browsing — fail silently
  }
  // Update UI active state
  document.querySelectorAll('.mini-card').forEach(c => c.classList.remove('active'));
  if (el) el.classList.add('active');
}
```

**Important:** `VALID_PROFILES` must include `'aphasia'`. If it doesn't, the aphasia profile will be rejected and fall back to mixed.

---

## Using the Profile in a querySelector

**Wrong — will throw a SyntaxError if value is a JSON object string:**
```javascript
const saved = localStorage.getItem('readclear_profile');
document.querySelector(`.mini-card[data-profile="${saved}"]`); // BREAKS
```

**Right — always extract the type string first:**
```javascript
const profile = getProfile(); // returns 'mixed', 'visual', 'aphasia', etc.
document.querySelector(`.mini-card[data-profile="${profile}"]`); // WORKS
```

---

## Using the Profile in the Worker Call

Always use `getProfile()` — never read `localStorage` directly:

```javascript
const profile = getProfile();
fetch(WORKER_URL + '/reformat', {
  method: 'POST',
  body: JSON.stringify({ url, profile }),
});
```

---

## How Profile Reaches read.html

The profile travels through the `readclear_result` localStorage key, not directly from `readclear_profile`:

```javascript
// index.html / scan.html — storing the result after Worker response
localStorage.setItem('readclear_result', JSON.stringify({
  html: data.html,
  title: data.title,
  profile: data.profile,  // ← profile echoed back from Worker
  url: data.url,
  source: 'url' // or 'image'
}));
```

```javascript
// read.html — reading the result
const result = JSON.parse(localStorage.getItem('readclear_result'));
document.body.dataset.profile = result.profile || 'mixed'; // ← sets CSS targeting
```

---

## Pages and Their Profile Handling

| Page | Reads profile | Writes profile | Method |
|---|---|---|---|
| index.html | ✅ on load | ✅ on card click | `loadProfile()` / `setProfile()` |
| prompt.html | ✅ on load | ✅ on card click | Same pattern |
| scan.html | ✅ on load | ✅ on card click | `getProfile()` / `setProfile()` |
| read.html | ✅ reads from `readclear_result` | ✗ | Reads stored result; sets `body.dataset.profile` |

---

## When Adding a New Page

1. Copy the `getProfile()` / `setProfile()` pattern above exactly
2. Include `'aphasia'` in `VALID_PROFILES`
3. Add profile mini-cards with `data-profile` attributes
4. Add the aphasia chip in its own row ("Other reading difficulties:")
5. Call `loadSavedProfile()` on page load
6. Use `getProfile()` when building API requests
7. Test: select aphasia on index.html, navigate to your new page — it should pre-select aphasia
