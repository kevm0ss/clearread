# Design System

## The Rule

The site must practice what it teaches. Every design decision should make content easier to read for someone with dyslexia. If a choice makes reading harder, it is wrong regardless of how it looks.

---

## CSS Variables

Defined in `:root` on every page. All pages must use these — never hardcode colours or widths.

```css
:root {
  --bg:         #f7f4ee;  /* warm cream — main background */
  --ink:        #1c1917;  /* near-black — hero/nav background, main text */
  --ink-mid:    #6b6560;  /* mid grey — secondary text on light bg */
  --ink-soft:   #a8a29e;  /* soft grey — captions only */
  --ink-faint:  #e8e4dc;  /* very light — borders on light bg */
  --cream:      #faf8f3;  /* off-white — card backgrounds */
  --amber:      #d97706;  /* primary accent — CTAs, highlights, active states */
  --amber-soft: rgba(217,119,6,0.1);
  --teal:       #0d9488;  /* secondary accent — quiz link, secondary actions */
  --border:     #ddd8ce;  /* warm border */
  --dark:       #1c1917;  /* nav/hero/footer background */
  --dark-2:     #262320;  /* card backgrounds on dark sections */
  --dark-border:#3a3530;  /* borders on dark sections */
  --text-width: 720px;    /* max-width for all text content */
  --demo-width: 1000px;   /* max-width for the before/after demo */
}
```

### text-width
`--text-width: 720px` is the content column width used by every section. All `max-width` on `.hero-inner`, `.why-inner`, `.footer-inner`, etc. should use `var(--text-width)`. Never override with a hardcoded pixel value.

---

## Typography

| Role | Font | Weight | Notes |
|---|---|---|---|
| Logo | Monaco (monospace) | 700 | `'Monaco', 'Courier New', monospace` — the "readclear" wordmark only |
| Headings | Fraunces (serif) | 600–700 | **Never italic** — italic serif is unreadable for dyslexic users |
| Body | Plus Jakarta Sans | 400–700 | Clear, humanist sans-serif |
| Code/prompts | JetBrains Mono | 400–500 | Prompt display in prompt.html |

**Critical:** Fraunces is used upright only. Never apply `font-style: italic` to Fraunces anywhere.

---

## Colour on Dark Backgrounds

Dark sections (nav, hero, footer) use `--dark: #1c1917`.

On dark backgrounds:
- Primary text: `#faf8f3` (--cream)
- Secondary text: `#c8c3bc`
- Muted/label text: `#8a857e`
- Minimum readable: `#6a6560`
- **Never use below `#6a6560`** — it fails contrast and is hard for dyslexic users

---

## Nav

Every page has the same sticky nav:

```css
.nav {
  background: var(--dark);
  border-bottom: 1px solid var(--dark-border);
  padding: 0 48px;
  height: 68px;
  position: sticky;
  top: 0;
  z-index: 50;
}
```

Nav structure: logo (Monaco 22px) + BETA badge on the left, nav-link(s) on the right.

---

## Hero

Dark section (`background: var(--dark)`) with padding `72px 48px 80px`. Grid overlay and glow for visual interest.

Hero headlines use Fraunces with `clamp()` for responsive sizing. The amber highlight word is wrapped in `<span class="highlight">`.

---

## Footer

Same structure on every page:

```html
<footer class="footer">
  <div class="footer-inner">
    Built by <a href="https://importantsmallthings.com">Important Small Things</a>
    &nbsp;·&nbsp; <a href="siteowners.html">Site owners</a>
    &nbsp;·&nbsp; Content should never be reduced. Only reorganised.
    &nbsp;·&nbsp; If you can, please drop us a coffee and help us keep readclear free, use our <a href="https://buymeacoffee.com/readclear" target="_blank" rel="noopener">readclear tip page</a>.
  </div>
</footer>
```

---

## Spacing and Layout

- Body line height: 1.7 minimum
- Paragraph spacing: at least 1em
- Reading column max-width: `var(--text-width)` (720px)
- Sections have generous padding — do not compress vertical space
- Mobile: reduce padding to 20px on sides (from 48px desktop)

---

## Mobile Rules

- All layouts tested on iPhone
- `profile-mini-row` collapses from 4 columns to 2 columns on mobile
- Nav padding reduces to 20px
- Hero padding reduces to 48px 20px 60px
- Fraunces headline uses `clamp()` to scale down on small screens
- Touch targets minimum 44px height

---

## Things to Avoid

- Italic Fraunces
- Dense paragraphs (max 3 sentences)
- Light grey text on dark backgrounds below `#6a6560`
- Justified text (uneven word spacing)
- Text running full browser width
- Small radio buttons or checkboxes as primary interaction
- Decorative text that isn't scannable
