# Scan Tool (Image Reformatter)

## Status

**Private beta.** The page exists at `/scan.html` but is not linked from any public page. Share the direct URL for testing only.

Not linked publicly because:
- Still being tested
- Image reformatting costs more than URL reformatting (~3–5x)
- Want to validate quality before wider rollout

---

## What It Does

User takes a photo or uploads a scan of a physical document (letter, leaflet, prescription, form). The image is sent to Claude which reads the text and reformats it for the user's dyslexia profile. The result displays in `read.html` exactly like a URL reformat.

---

## User Flow

1. User opens `/scan.html`
2. Profile is pre-selected from localStorage (same profile as set on index.html)
3. User taps "📷 Take a photo" (opens device camera) or "📁 Upload a file" (opens file picker)
4. Selected image appears as a preview
5. User taps "Reformat this document →"
6. Image is resized client-side (max 800px, JPEG 0.85 quality)
7. Converted to base64, POSTed to Worker `/reformat-image`
8. Worker sends to Claude with profile prompt
9. Result stored in `readclear_result` localStorage key
10. User is navigated to `read.html`

---

## Technical Details

### Client-Side Resize

Before sending, the image is resized in the browser using Canvas API:
- Max dimension: 800px (longest side)
- Format: JPEG, quality 0.85
- This reduces a phone photo from ~3–5MB to ~50–150KB

**Known issue:** `canvas.toBlob()` can return `null` on some mobile browsers. Always use:
```javascript
canvas.toBlob(blob => resolve(blob || file), 'image/jpeg', 0.85);
```
(Falls back to the original file if toBlob fails.)

### FileReader

When converting to base64, use `e.target.result` not `e.result`:
```javascript
reader.onload = e => resolve(e.target.result.split(',')[1]);
```

### Fetch Timeout

A 45-second AbortController timeout is applied to the Worker fetch. If the request hangs (e.g., very slow connection), it fails with a user-friendly message: "This is taking too long — please try a smaller or clearer image."

### Result Handoff

```javascript
localStorage.setItem('readclear_result', JSON.stringify({
  html: data.html,
  title: data.title || 'Scanned document',
  profile,
  source: 'scan', // distinguishes from URL reformat
}));
window.location.href = 'read.html';
```

`read.html` checks `result.url` before showing a source link — since scan results have no URL, the source line is simply omitted. The Refresh button and cache badge are also omitted (no URL to re-fetch or cache).

---

## Worker Endpoint

See [worker.md](worker.md) for the `/reformat-image` endpoint details.

The system prompt for image reformatting instructs Claude to:
1. Transcribe ALL text visible in the image
2. Reformat it for the dyslexia profile
3. Start with a `<h1>` containing the document type (e.g., "Appointment Letter")

---

## Works Best With

- Printed letters (NHS, council, utilities, insurance)
- Leaflets and information sheets
- Forms with typed text
- Newspaper or magazine clippings

**Not reliable for:** handwriting, very low-quality scans, images with dense tables or complex layouts.

---

## Privacy Note

Displayed on the page: "Your image is sent securely to our AI to read and reformat. It is not stored or used for training. Avoid uploading anything with passwords, bank details, or other sensitive information."

Anthropic's API does not train on API data. Images are not stored by the Worker.

---

## When Making Scan Tool Public

Before linking from the main site:
1. Add a cost monitoring approach (image calls are ~3–5x more expensive)
2. Consider rate limiting in the Worker
3. Add scan.html to the nav on index.html, prompt.html, and read.html
4. Update siteowners.html to mention the scan feature
5. Update roadmap.md
