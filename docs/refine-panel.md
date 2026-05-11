# REFINE Panel

The REFINE panel is a floating, collapsible control panel in `read.html` that lets users customise their reading experience without needing to go back to the main tool.

---

## What it Does

Two categories of controls:

### 1. Design Preferences
Visual appearance adjustments applied instantly:

| Control | What it changes | localStorage key |
|---|---|---|
| Font size | `--font-size` CSS variable | `readclear_prefs.fontSize` |
| Line height / spacing | `--line-height` CSS variable | `readclear_prefs.lineHeight` |
| Background colour | `body[data-bg]` attribute | `readclear_prefs.bgColor` |
| Content width | `.reading-content` max-width | `readclear_prefs.width` |

Background colour options: cream (default), white, dark, warm grey. Set via `body.dataset.bg` to allow CSS targeting.

### 2. Content Reformat
Checkboxes that request additional reformatting via Claude API:

| Option | What it asks Claude to do |
|---|---|
| Shorter sentences | Break long sentences further |
| More bullet points | Convert lists of items to bullets |
| Add summaries | Add a brief summary at the top of each section |
| Simpler words | Replace jargon with plainer alternatives |
| Extras (text field) | Free-form additional instruction |

Content reformat sends the **current HTML** back to the Worker with an augmented prompt. Supports undo.

### 3. Reading Aids Toggles (within REFINE panel)
- Reading Ruler on/off
- Focus Mode on/off

See [reading-aids.md](reading-aids.md) for implementation details.

---

## localStorage Keys

| Key | Format | Purpose |
|---|---|---|
| `readclear_prefs` | `{fontSize, lineHeight, bgColor, width, ruler, focusMode}` | Design preferences — persists across sessions |
| `readclear_content_prefs` | `{sentences, bullets, summaries, simpler, extras}` | Content reformat checkbox state |
| `readclear_result_original` | `{html, title, profile, url}` | Pre-refine copy of the result — enables undo |

---

## Undo Flow

When a content reformat is applied:
1. Current `readclear_result` is saved to `readclear_result_original` (before the API call)
2. API call is made with the augmented prompt
3. New result replaces `readclear_result`
4. "Undo" button becomes visible

If the user clicks Undo:
1. `readclear_result_original` is read
2. Content is restored to pre-refine state
3. `readclear_result` is reverted
4. "Undo" button is hidden

**Important:** Undo only works once — it restores to the state before the most recent reformat. There is no multi-level undo.

---

## Panel State

The panel is collapsible. Open/closed state is not persisted — it starts collapsed on each page load.

The panel floats in the lower-right corner on desktop. On mobile it expands to near full-width.

---

## "Revert to Default" Option

A "Reset to default" option in the design prefs section clears `readclear_prefs` from localStorage and resets all CSS variables to their initial values. This is implemented as a button, not a checkbox.

---

## Interaction with Profile CSS

Design preferences and profile CSS do not conflict — they operate on different CSS properties:
- Profile CSS (`body[data-profile="aphasia"] section`) targets structural rendering
- Design prefs CSS variables target typography and colour

The only potential conflict is background colour: the aphasia section box backgrounds are `rgba(255,255,255,0.55)` in light mode and `rgba(255,255,255,0.04)` in dark mode. These adapt to the dark/light setting via `body[data-bg="dark"]` targeting. If new background colour options are added to REFINE, test that aphasia section box borders still look correct.

---

## Conflict Checklist Before Changing REFINE

- [ ] Does the change affect `body.dataset.bg`? If so, test aphasia dark mode boxes
- [ ] Does the change affect `readclear_result`? If so, preserve `readclear_result_original` first
- [ ] Does the change modify the sanitiser allowlist? If so, update both `read.html` and `worker.js` allowed tags
- [ ] Does the content reformat send a different prompt? If so, test with aphasia — it must not violate the 5-word rule
