# Profile Storage — Critical Reference

This is one of the most common sources of bugs. Read carefully before touching anything profile-related.

---

## The Storage Format

The dyslexia profile is stored in `localStorage` under the key `readclear_profile`.

**Format:** `JSON.stringify({ type: 'mixed' })`

**Examples:**
```
readclear_profile = {"type":"mixed"}
readclear_profile = {"type":"phonological"}
readclear_profile = {"type":"visual"}
readclear_profile = {"type":"memory"}
```

**Never store as a plain string.** If stored as `"visual"` (plain string), pages that try to `JSON.parse()` it will get the string `"visual"` instead of `{type:"visual"}`, and pages that use `saved.type` will get `undefined`.

---

## Standard Read/Write Pattern

Every page must use this exact pattern. Copy it, do not invent a new one.

```javascript
const PROFILE_KEY = 'readclear_profile';
const VALID_PROFILES = ['mixed', 'phonological', 'visual', 'memory'];

// Read profile
function getProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY));
    if (saved && VALID_PROFILES.includes(saved.type)) return saved.type;
  } catch(e) {}
  return 'mixed'; // safe default
}

// Write profile
function setProfile(type) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ type }));
  } catch(e) {
    // Private browsing — fail silently
  }
}
```

---

## Using the Profile in a querySelector

**Wrong — will throw a SyntaxError if value is a JSON object string:**
```javascript
const saved = localStorage.getItem('readclear_profile');
document.querySelector(`.mini-card[data-profile="${saved}"]`); // BREAKS
```

**Right — always extract the type string first:**
```javascript
const profile = getProfile(); // returns 'mixed', 'visual', etc.
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

## Pages and Their Profile Handling

| Page | Reads profile | Writes profile | Method |
|---|---|---|---|
| index.html | ✅ on load | ✅ on card click | `loadProfile()` / `setProfile()` |
| prompt.html | ✅ on load | ✅ on card click | Same pattern |
| scan.html | ✅ on load | ✅ on card click | `getProfile()` / `setProfile()` |
| read.html | ✅ reads from `readclear_result` | ✗ | Reads stored result, not profile key directly |

---

## When Adding a New Page

1. Copy the `getProfile()` / `setProfile()` pattern above exactly
2. Add profile mini-cards with `data-profile` attributes
3. Call `loadSavedProfile()` on page load
4. Use `getProfile()` when building API requests
5. Test: select a profile on index.html, navigate to your new page — it should pre-select the same profile
