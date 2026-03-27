# Dyslexia Profiles

## The Four Profiles

### Phonological
**Core difficulty:** Word decoding. Sounding out unfamiliar or long words.

**Signs:**
- Hard to decode unfamiliar words
- Technical terms cause friction
- Better with verbal explanation than reading
- Reads fine once words are familiar

**Auto-selected traits:**
`short-sentences`, `bold-keys`, `clear-gaps`, `lead-point`, `no-jargon`, `html-docs`

**Prompt profile-specific line:**
> "Use plain, common words. Avoid jargon — if a technical term is necessary, define it in brackets immediately after."

---

### Visual Stress
**Core difficulty:** Dense text is visually uncomfortable. Text may appear to move or blur.

**Signs:**
- Dense blocks of text feel tiring or uncomfortable
- Words seem to move or blur
- Screen reading harder than listening
- Layout and spacing matter most

**Auto-selected traits:**
`short-sentences`, `bold-keys`, `clear-gaps`, `lead-point`, `html-docs`, `diagrams`, `no-padding`

**Prompt profile-specific line:**
> "Prioritise visual layout. Use generous spacing. Break text into short, clearly separated chunks. Avoid dense paragraphs entirely."

---

### Working Memory
**Core difficulty:** Losing the thread. Hard to hold information mid-sentence or mid-process.

**Signs:**
- Loses place or thread mid-sentence
- Forgets what was just read
- Steps out of order in processes
- Better when information is chunked

**Auto-selected traits:**
`short-sentences`, `bold-keys`, `clear-gaps`, `lead-point`, `numbered-steps`, `no-padding`, `summary-first`

**Prompt profile-specific line:**
> "Always provide a summary first. Use numbered steps for any process. Keep sentences short enough to hold in working memory. Never bury the key point."

---

### Mixed / Unsure
**Core difficulty:** Multiple traits apply, or still figuring it out.

**Auto-selected traits:** All traits on.

**Prompt profile-specific line:**
> "Apply a broad set of dyslexia-friendly adjustments: short sentences, plain language, numbered steps for any process, clear visual structure."

---

## Trait Definitions

| Key | Label | Description |
|---|---|---|
| `short-sentences` | Short sentences | One idea per sentence |
| `bold-keys` | Bold key terms | Anchor words for scanning |
| `clear-gaps` | Clear gaps | Space between sections |
| `lead-point` | Key point first | Most important thing, always first |
| `html-docs` | Interactive documents | HTML over Word docs |
| `diagrams` | Diagrams over prose | Visual structure preferred |
| `no-jargon` | Plain language | Define technical terms |
| `numbered-steps` | Numbered steps | Never bury steps in prose |
| `no-padding` | No filler | Skip preamble, get to the point |
| `summary-first` | Summary first | TL;DR always visible at top |

---

## Profile → Trait Mapping (Code Reference)

```javascript
const profileTraits = {
  phonological: ['short-sentences','bold-keys','clear-gaps','lead-point','no-jargon','html-docs'],
  visual:       ['short-sentences','bold-keys','clear-gaps','lead-point','html-docs','diagrams','no-padding'],
  memory:       ['short-sentences','bold-keys','clear-gaps','lead-point','numbered-steps','no-padding','summary-first'],
  mixed:        ['short-sentences','bold-keys','clear-gaps','lead-point','html-docs','diagrams','no-jargon','numbered-steps','no-padding','summary-first']
};
```

---

## Quiz Logic

5 questions. Each answer maps to a profile type or 'none'.
Scores are tallied. Highest score wins.
Tie or all-zero → defaults to 'mixed'.
Requires minimum 3 answered questions.

The quiz is a helper — not a diagnostic. Always allow manual override.

---

## Future Profiles (Not in MVP)

- Stroke / acquired brain injury
- ADHD
- ESL (English as a second language)
- Age-related processing changes

These use the same underlying trait system. Only the profile description and default traits change.
