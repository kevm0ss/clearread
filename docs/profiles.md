# Profiles

## The Five Profiles

### Mixed / Unsure (default)
**Core:** Multiple traits apply, or the user is not sure which type applies.
**Approach:** Apply a broad set of dyslexia-friendly adjustments: short sentences, plain language, numbered steps, clear visual structure.
**Default:** Yes — new users start here.
**Chip colour:** Amber.

### Phonological
**Core difficulty:** Word decoding. Sounding out unfamiliar or long words.
**Signs:** Hard to decode unfamiliar words, technical terms cause friction, better with verbal explanation.
**Approach:** Plain, common words. Define technical terms immediately. Short sentences. Key point first.
**Chip colour:** Amber.

### Visual Stress
**Core difficulty:** Dense text is visually uncomfortable. Text may appear to move or blur.
**Signs:** Dense blocks feel tiring, words seem to move or blur, layout and spacing matter most.
**Approach:** Prioritise visual layout. Generous spacing. Short line lengths. Chunks of 2–3 sentences max.
**Chip colour:** Amber.

### Working Memory
**Core difficulty:** Losing the thread mid-sentence or mid-process.
**Signs:** Loses place or thread mid-sentence, forgets what was just read, better when information is chunked.
**Approach:** Summary first. Numbered steps always. Short sentences. Visual hierarchy so reader always knows where they are.
**Chip colour:** Amber.

### Aphasia
**Core difficulty:** Language processing after stroke or brain injury. Word finding, sentence parsing, and comprehension of complex grammar.
**Signs:** Difficulty understanding long or complex sentences, struggles with pronouns and passive voice, benefits from repetition, benefits from visual separation of topics.
**Approach:** Very short sentences (target 5 words, max 10). Active voice only. No pronouns — always repeat the noun. Everyday vocabulary substitutions. Each topic wrapped in a boxed `<section>`. Repetition encouraged.
**Chip colour:** Blue (`#38bdf8`) — visually distinct from the dyslexia amber chips to signal this is a different condition.
**Chip row:** Aphasia has its own row ("Other reading difficulties:") separated from the four dyslexia chips.
**Source:** Stroke Association "Accessible Information Guidelines" PDF.

---

## Critical Difference: Aphasia vs Dyslexia

| | Dyslexia profiles | Aphasia |
|---|---|---|
| Content rule | **Never** simplify or remove meaning | Meaning preserved; vocabulary **may** be simplified |
| Vocabulary | Keep original words | Replace complex/formal words with everyday alternatives |
| Sentence length | Short, but no hard limit | Target 5 words, never more than 10 |
| Pronouns | Allowed | **Never** — always replace with the noun |
| Voice | Encouraged active, but passive allowed | Active voice **only** — always rewrite passive |
| Sections | Headings and paragraphs | Each topic wrapped in `<section>` tag for boxed display |
| System prompt flag | `isAphasia = false` | `isAphasia = true` — changes role description AND critical rule |

---

## Worker Prompt Architecture

Each profile has an entry in `PROFILE_PROMPTS` in `worker.js`.

The **system prompt** is built dynamically:
```javascript
const isAphasia = profile === 'aphasia';
const systemPrompt = `You are an accessibility formatter...
CRITICAL RULE: ${isAphasia
  ? 'Preserve every fact. You may replace complex words with simpler alternatives, but never remove meaning.'
  : 'Never remove, simplify, or summarise the original content. Every fact must be preserved.'}`;
```

`SHARED_RULES` (formatting guidance common to all dyslexia profiles) is appended to dyslexia prompts but **NOT to aphasia**. Aphasia has its own stricter rules embedded directly in the profile prompt.

---

## Aphasia Key Rules (from Stroke Association Guidelines)

1. Target 5 words per sentence. Never more than 10. One point per sentence.
2. Always use active voice. Rewrite every passive sentence.
3. Never use pronouns (it, they, them, this, that, he, she, we, us). Replace with the exact noun.
4. Use only everyday words: tablets not medication, doctor not physician, get better not recover, stroke not CVA.
5. Repeat key words freely — repetition aids understanding.
6. Use bullet points for any list of two or more items.
7. Maximum 2 sentences per paragraph.
8. Bold the single most important word or phrase in each paragraph.
9. Never use ALL CAPS, italics, or underlines.
10. Wrap each topic block in a `<section>` tag (one heading + 1–4 paragraphs or a list).

---

## Profile Storage

Profiles are stored via localStorage. See [profile-storage.md](profile-storage.md) for the exact format and read/write pattern.

`VALID_PROFILES` in all pages must include `'aphasia'`:
```javascript
const VALID_PROFILES = ['mixed', 'phonological', 'visual', 'memory', 'aphasia'];
```

---

## Profile Display on read.html

When read.html renders a reformatted result, it sets:
```javascript
document.body.dataset.profile = result.profile || 'mixed';
```

This must be set **immediately after** `content.style.display = 'block'`. CSS then targets:
```css
body[data-profile="aphasia"] .reading-content section { ... }
```

See [read.md](read.md) for the full rendering pattern.

---

## Quiz Logic

One question at a time. Each answer maps to a profile type or none. Scores are tallied. The profile with the highest score wins. Tie or all-zero → defaults to mixed. Quiz is a helper, not a diagnostic. Manual override always available. Quiz does not include aphasia — aphasia is self-identified via the chip, not a quiz outcome.

---

## Future Profiles (Not in Scope)

ADHD, ESL. Same underlying trait system — only profile description and default behaviour change. Images within aphasia content (Widgit symbols) are a possible future addition but were explicitly deferred as too complex.
