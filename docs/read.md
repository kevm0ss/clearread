# read.html — Reformatted Content Display

`read.html` is the page where reformatted content is shown to the user. It reads from localStorage, sanitises the HTML, renders it, and provides all Reading Aids.

---

## Data Flow In

```
localStorage('readclear_result') → {html, title, profile, url, source}
    ↓
read.html parses and validates the result
    ↓
sanitiseHtml(html) — strips unsafe tags and attributes
    ↓
article element innerHTML = sanitised HTML
    ↓
document.body.dataset.profile = result.profile || 'mixed'
    ↓
Profile-specific CSS applies (e.g. aphasia section boxes)
    ↓
Section speaker icons injected next to each h2/h3
    ↓
Truncation banner shown if result.truncated === true
```

---

## sanitiseHtml()

Allowlist-based HTML sanitiser. Strips all unknown tags and dangerous attributes.

**Allowed tags:**
```
p, br, strong, b, em, i, u,
h1, h2, h3, h4, h5, h6,
ul, ol, li,
a, blockquote, code, pre,
table, thead, tbody, tr, th, td,
div, span,
section
```

**Allowed attributes:**
- `href` on `<a>` — protocol must be `https?://` or `mailto:` (relative and `javascript:` links stripped)
- `target="_blank"` on `<a>`
- `rel="noopener noreferrer"` on `<a>`
- All other attributes stripped

**`<section>` must stay in the allowlist.** It is used by the aphasia profile for boxed topic layout. See [profiles.md](profiles.md).

---

## body.dataset.profile

Set immediately when content is made visible:
```javascript
content.style.display = 'block';
document.body.dataset.profile = result.profile || 'mixed';
```

This is the trigger for profile-specific CSS — particularly aphasia section boxes:
```css
body[data-profile="aphasia"] .reading-content section {
  border: 2px solid #c8b89a;
  border-radius: 10px;
  padding: 22px 26px;
  margin-bottom: 28px;
  background: rgba(255,255,255,0.55);
}
```

**Rule:** Must be set at the moment content becomes visible — not before (element not yet visible) and not after (would cause a flash of unstyled content).

---

## Aphasia Section Boxes — CSS

Full CSS for aphasia boxed sections in light and dark mode:

```css
/* Light mode */
body[data-profile="aphasia"] .reading-content section {
  border: 2px solid #c8b89a;
  border-radius: 10px;
  padding: 22px 26px;
  margin-bottom: 28px;
  background: rgba(255,255,255,0.55);
}

body[data-profile="aphasia"] .reading-content section h2,
body[data-profile="aphasia"] .reading-content section h3 {
  margin-top: 0;
  color: #1c6b8a;
}

/* Dark mode */
body[data-bg="dark"][data-profile="aphasia"] .reading-content section {
  background: rgba(255,255,255,0.04);
  border-color: #3a5060;
}

body[data-bg="dark"][data-profile="aphasia"] .reading-content section h2,
body[data-bg="dark"][data-profile="aphasia"] .reading-content section h3 {
  color: #7dd3f0;
}
```

---

## Toolbar

The toolbar at the top of read.html contains:
- **Profile badge** — shows the active profile name (e.g. "Aphasia", "Mixed")
- **🔊 Listen** — TTS for the whole article
- **Source URL** — link back to the original page
- **REFINE** — opens the REFINE panel
- **Back** — returns to index.html

---

## Section Speaker Icons

After content renders, a 🔊 icon is injected next to each `h2` and `h3`:
```javascript
article.querySelectorAll('h2, h3').forEach(heading => {
  const btn = document.createElement('button');
  btn.className = 'section-speak-btn';
  btn.textContent = '🔊';
  btn.title = 'Read this section aloud';
  btn.addEventListener('click', () => speakSection(heading));
  heading.appendChild(btn);
});
```

The `speakSection()` function collects text from the heading through to the next heading at the same level (or end of article). See [reading-aids.md](reading-aids.md) for the TTS implementation including the utterance ID pattern.

---

## Truncation Banner

If the Worker truncated the content before sending to Claude (because it was too long), the response includes `truncated: true`.

```javascript
if (result.truncated) {
  const banner = document.getElementById('truncation-banner');
  banner.style.display = 'block';
  banner.textContent = 'This article was very long. The reformatted version covers the main content only.';
}
```

---

## Cache Badge

If the result came from the local page cache (not a fresh API call), a "Cached" badge is shown with a "Refresh" button:

```javascript
if (result.source === 'cache') {
  document.getElementById('cache-badge').style.display = 'inline-flex';
}
```

---

## REFINE Panel

See [refine-panel.md](refine-panel.md) for full documentation.

---

## Reading Aids

See [reading-aids.md](reading-aids.md) for TTS, Reading Ruler, and Focus Mode documentation.

---

## Key localStorage Keys (read.html reads/writes)

| Key | Read/Write | Purpose |
|---|---|---|
| `readclear_result` | Read | The reformatted content to display |
| `readclear_result_original` | Write (before refine), Read (on undo) | Undo buffer for REFINE content changes |
| `readclear_prefs` | Read + Write | Design preferences from REFINE panel |
| `readclear_content_prefs` | Read + Write | Content reformat checkbox state |

---

## Conflict Checklist Before Changing read.html

- [ ] Does the change touch `body.dataset.profile`? Verify aphasia boxes still render
- [ ] Does the change modify `sanitiseHtml()`? Sync with worker.js allowed tags list
- [ ] Does the change add new CSS classes to article content? Test they don't conflict with profile CSS
- [ ] Does the change affect `readclear_result` structure? Check all pages that write to this key
