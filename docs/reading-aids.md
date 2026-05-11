# Reading Aids

Reading Aids are accessibility features built into `read.html` that help users consume the reformatted content. They are all zero-cost (no API calls) and use browser APIs only.

---

## Overview

| Aid | How to activate | What it does |
|---|---|---|
| TTS (Listen) | 🔊 Listen button in toolbar | Reads the whole article aloud |
| TTS (Section) | 🔊 icon next to each heading | Reads just that section aloud |
| Pause / Resume | Pause button (replaces Listen while playing) | Pauses/resumes current speech |
| Reading Ruler | Toggle in REFINE panel | Horizontal guide line follows cursor/touch |
| Focus Mode | Toggle in REFINE panel | Dims everything except the active paragraph/heading |

---

## Text-to-Speech (TTS)

### Technology
Web Speech API (`window.speechSynthesis`). Zero cost. Works in all modern browsers. No server calls.

### Listen Button (whole article)
- Located in the read.html toolbar (top right)
- Collects text from the full article element
- Creates a `SpeechSynthesisUtterance` and calls `speechSynthesis.speak()`
- While playing: button changes to "Pause"
- On end: button reverts to "🔊 Listen"

### Section Speaker Icons
- A 🔊 icon is injected immediately after each `h2` and `h3` heading in the article
- Clicking one stops any current speech and plays only that section's text
- Section boundary: from the heading to the next heading at the same level (or end of article)
- Icons show "⏸" while their section is playing

### Heading Pauses
The Web Speech API does not add natural pauses after heading text. Without a fix, the heading runs straight into the first sentence.

**Fix:** When building the TTS text string, append `. ` (period + space) after each heading's text if it doesn't already end with punctuation:
```javascript
headings.forEach(h => {
  const text = h.innerText.trim();
  ttsText += /[.!?]$/.test(text) ? text + ' ' : text + '. ';
});
```

### Utterance ID Stamping (pause/play switching fix)
**Problem:** Clicking a different section icon while TTS is playing causes the pause button to lose reference to the active utterance.

**Fix:** A module-level counter stamps each utterance with an ID. Event handlers only update UI state if the ID still matches:

```javascript
let utteranceCounter = 0;

function speak(text, onEndCallback) {
  speechSynthesis.cancel(); // stop any current speech
  const id = ++utteranceCounter;
  const utt = new SpeechSynthesisUtterance(text);

  utt.onend = () => {
    if (utteranceCounter === id) {
      // Only reset UI if this utterance is still the active one
      resetPlayUI();
      if (onEndCallback) onEndCallback();
    }
  };

  utt.onpause = () => {
    if (utteranceCounter === id) showPausedState();
  };

  speechSynthesis.speak(utt);
}
```

### Chrome 15-Second Bug Workaround
Chrome's Web Speech API silently stops speaking after ~15 seconds of continuous speech. The `onend` event fires prematurely.

**Fix:** A periodic heartbeat calls `pause()` / `resume()` every 14 seconds while speech is active:

```javascript
const chromeFix = setInterval(() => {
  if (speechSynthesis.speaking && !speechSynthesis.paused) {
    speechSynthesis.pause();
    speechSynthesis.resume();
  }
}, 14000);

utt.onend = () => {
  clearInterval(chromeFix);
  resetPlayUI();
};
```

The interval is cleared when the utterance ends naturally.

---

## Reading Ruler

### What it does
A thin horizontal line that follows the user's cursor (desktop) or touch position (mobile). Acts as a guide line to help readers track which line they are on.

### Implementation
```javascript
const ruler = document.getElementById('reading-ruler');

document.addEventListener('mousemove', e => {
  if (rulerEnabled) {
    ruler.style.top = e.clientY + 'px';
    ruler.style.display = 'block';
  }
});

document.addEventListener('touchmove', e => {
  if (rulerEnabled) {
    ruler.style.top = e.touches[0].clientY + 'px';
    ruler.style.display = 'block';
  }
});
```

The ruler element is a `position: fixed` div spanning the full viewport width. It uses a semi-transparent colour that works in both light and dark mode.

### Toggling
- Toggle button in the REFINE panel
- State persisted in `readclear_prefs` localStorage key

---

## Focus Mode

### What it does
Dims all paragraphs and headings in the article except the one the user is currently hovering over or has scrolled to. This reduces peripheral distraction and helps users track their reading position.

### Implementation
```javascript
const paragraphs = article.querySelectorAll('p, h1, h2, h3, h4, li');

paragraphs.forEach(el => {
  el.addEventListener('mouseenter', () => {
    if (!focusEnabled) return;
    paragraphs.forEach(p => p.classList.add('focus-dimmed'));
    el.classList.remove('focus-dimmed');
  });
});

article.addEventListener('mouseleave', () => {
  paragraphs.forEach(p => p.classList.remove('focus-dimmed'));
});
```

CSS:
```css
.focus-dimmed {
  opacity: 0.25;
  transition: opacity 0.15s ease;
}
```

**Important:** Focus mode highlights **both paragraphs and headings**. An earlier version only highlighted paragraphs, which meant headings were always dimmed and hard to see. Headings must be included in the focus target list.

### Toggling
- Toggle button in the REFINE panel
- State persisted in `readclear_prefs` localStorage key

---

## REFINE Panel Integration

Reading Aids toggles (Ruler, Focus Mode) live inside the REFINE panel. The Listen button and section speaker icons are separate, always-visible controls.

See [refine-panel.md](refine-panel.md) for the full REFINE panel architecture.

---

## Accessibility Notes

- TTS relies on the browser's built-in speech engine — voice quality varies by OS and browser
- On iOS, `speechSynthesis` may require a user gesture before first use
- Reading Ruler and Focus Mode are purely visual — they don't affect the DOM or ARIA structure
- All Reading Aids are optional — users who don't want them can ignore them
