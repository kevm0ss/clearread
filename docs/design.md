# Design System

## The Rule

The site must practice what it teaches.

Every design decision should make the page easier to read for someone with dyslexia. If a design choice makes reading harder, it is wrong — regardless of how it looks.

---

## Typography

| Role | Font | Notes |
|---|---|---|
| Logo / wordmark | Monaco (monospace) | The "clearread" wordmark only |
| Headings | Fraunces (serif) | Weight 600–700. **Never italic.** Italic serif is hard to read for dyslexic users. |
| Body | Plus Jakarta Sans | Weight 400–600. Clear, humanist sans-serif. |
| Prompts / code | JetBrains Mono | Monospace. Used for the generated prompt display. |

**Critical rule:** Fraunces is used in serif (upright) only. The italic variant is hard to read and must not be used — including for the tagline.

---

## Colour Palette

```css
--bg:        #f7f4ee  /* warm cream — main background */
--ink:       #1c1917  /* near-black — hero background, main text */
--ink-mid:   #6b6560  /* mid grey — secondary text */
--ink-soft:  #a8a29e  /* soft grey — captions */
--ink-faint: #e8e4dc  /* very light — borders */
--cream:     #faf8f3  /* off-white — card backgrounds */
--white:     #ffffff
--amber:     #d97706  /* primary accent — CTAs, highlights */
--amber-soft: rgba(217,119,6,0.1)
--teal:      #0d9488  /* secondary accent — quiz link, secondary actions */
--teal-soft: rgba(13,148,136,0.1)
--plum:      #7c3aed  /* tertiary accent — occasional highlight */
--border:    #ddd8ce  /* warm border colour */
```

---

## Contrast Rules

- Never use light grey text on dark grey backgrounds — fails accessibility and is hard to read for dyslexic users
- Body text must pass WCAG AA contrast minimum
- Secondary text (--ink-mid) on cream (--bg) is acceptable for captions only — not for body copy
- On dark backgrounds (--ink): use --cream or --white for readable text

---

## Spacing

- Generous line height: 1.7 minimum for body text
- Clear gaps between sections — do not compress vertical space
- Paragraph spacing: at least 1em between paragraphs
- The reading width should be constrained: max ~680px for article content

---

## Layout Principles

- One idea per visual block
- Key point first — most important information at the top of every section
- Bold key terms for scannability
- Short paragraphs — 3 sentences maximum in most cases
- Visual hierarchy must be obvious without reading the text

---

## Accessible Components

### Profile Cards
- Large tap targets
- Selected state clearly visible (amber border + background tint)
- Icon + title + one-line description

### Trait Toggles
- Checkbox-style, large tap area
- Clear on/off state
- Grouped logically (universal traits vs optional)

### Quiz Modal
- One question at a time
- Large answer cards (not small radio buttons)
- Emoji anchors on each answer for visual recognition
- Progress indicator
- Minimum 3 questions answered before submitting

### Buttons
- Primary: amber fill, dark text
- Minimum touch target: 44px height
- Clear label — no ambiguous icons without text

---

## Mobile Rules

- All layouts must be tested on iPhone (Kevin's primary check device)
- Hero badge ("Free tool · No sign-up required") must not break on small screens
- Demo panels: label must sit directly above its corresponding panel — wrap label+panel pairs together in a container div, do not rely on separate flexbox rows
- Modal: reduce padding on small screens

---

## Things to Avoid

- Italic serif (especially Fraunces italic)
- Dense paragraphs
- Light grey text on dark backgrounds
- Small radio buttons or checkboxes as primary interaction
- Justified text (creates uneven word spacing)
- Text that runs full browser width (constrain reading columns)
- Decorative text that isn't scannable
