# Dyslexia Profiles

## The Four Profiles

### Mixed / Unsure (default)
**Core:** Multiple traits apply, or the user is not sure which type applies.
**Approach:** Apply a broad set of dyslexia-friendly adjustments: short sentences, plain language, numbered steps, clear visual structure.
**Default:** Yes — new users start here.

### Phonological
**Core difficulty:** Word decoding. Sounding out unfamiliar or long words.
**Signs:** Hard to decode unfamiliar words, technical terms cause friction, better with verbal explanation.
**Approach:** Plain, common words. Define technical terms immediately. Short sentences. Key point first.

### Visual Stress
**Core difficulty:** Dense text is visually uncomfortable. Text may appear to move or blur.
**Signs:** Dense blocks feel tiring, words seem to move or blur, layout and spacing matter most.
**Approach:** Prioritise visual layout. Generous spacing. Short line lengths. Chunks of 2–3 sentences max.

### Working Memory
**Core difficulty:** Losing the thread mid-sentence or mid-process.
**Signs:** Loses place or thread mid-sentence, forgets what was just read, better when information is chunked.
**Approach:** Summary first. Numbered steps always. Short sentences. Visual hierarchy so reader always knows where they are.

---

## Profile Storage

Profiles are stored and persisted via localStorage. See [profile-storage.md](profile-storage.md) for the exact format and read/write pattern.

---

## Quiz Logic

One question at a time. Each answer maps to a profile type or none. Scores are tallied. The profile with the highest score wins. Tie or all-zero → defaults to mixed. Quiz is a helper, not a diagnostic. Manual override always available.

---

## Worker Prompts

Each profile has a corresponding system prompt in `worker.js` under `PROFILE_PROMPTS`. Each prompt includes:
1. Profile statement
2. Core rule (never remove/simplify content)
3. Profile-specific formatting guidance
4. Numbered formatting rules

---

## Future Profiles (Not in MVP)

Stroke / acquired brain injury, ADHD, ESL. Same underlying trait system — only profile description and default behaviour change.
