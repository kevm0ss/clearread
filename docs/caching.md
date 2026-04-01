# Page Cache

## Purpose

When a user reformats a URL, the result is cached in localStorage. If they visit the same URL with the same profile again within 7 days, the cached version is served instantly without calling the Worker or Claude API. This saves cost and makes the tool feel faster.

---

## Cache Keys

Key format: `rc_pg_` + hash of `url|profile`

Hash function (simple djb2-style):
```javascript
function makeCacheKey(url, profile) {
  const raw = url + '|' + profile;
  let h = 0;
  for (let i = 0; i < raw.length; i++) {
    h = Math.imul(31, h) + raw.charCodeAt(i) | 0;
  }
  return 'rc_pg_' + Math.abs(h).toString(36);
}
```

Different profile = different cache key. Reformatting the same URL with `visual` vs `mixed` creates two separate cache entries.

---

## Cache Entry Format

```json
{
  "html": "...",
  "title": "Page title",
  "profile": "mixed",
  "url": "https://example.com/article",
  "ts": 1704067200000
}
```

`ts` is a Unix timestamp in milliseconds (Date.now()) set when the entry is stored.

---

## Expiry and Eviction

- **Expiry:** 7 days (604,800,000 ms). Entries older than this are ignored and replaced.
- **Max entries:** 10. When the 11th entry would be added, the oldest entry (lowest `ts`) is removed first.

---

## UI Indicators

When `read.html` serves content from cache:
- Shows **⚡ Cached** badge in the toolbar
- Shows **↻ Refresh** button

Clicking Refresh:
1. Removes the cache entry for this URL + profile
2. Stores the URL in `localStorage.readclear_prefill`
3. Navigates back to `index.html`
4. The URL input is pre-filled with the stored URL

---

## History List

The "Recently read" list on index.html shows recent URLs from localStorage.

When a history item is clicked:
- If it exists in the cache → navigate directly to `read.html` (instant load)
- If not in cache (expired or evicted) → scroll to the URL input box so the user can reformat it again

---

## What Is NOT Cached

- Image/scan results from `scan.html` — these are not cached (no URL to key on)
- Results are stored in `readclear_result` temporarily to pass to `read.html`, but this is a single-entry handoff key, not a cache

---

## localStorage Limits

localStorage is blocked in some private/incognito browsing sessions. All cache operations are wrapped in try/catch and fail silently. The tool works without caching — it just makes a fresh API call each time.
