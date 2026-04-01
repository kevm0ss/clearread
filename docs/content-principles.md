# Content Principles

## The Core Rule

> **"Content should never be reduced. Only reorganised."**

This is the non-negotiable principle of the entire product. It applies everywhere:
- The demo content on the homepage
- Claude's output from the URL reformatter
- Claude's output from the image scan tool
- The system prompts in the prompt builder
- The copy on the site itself

---

## What Reformatting Allows

**Allowed:**
- Splitting one sentence into two (or more)
- Converting prose to bullet points
- Bolding key terms
- Reordering information (key point first)
- Adding visual structure (headers, numbered steps)
- Defining jargon in plain language
- Adding a summary at the top of a section

**Not allowed:**
- Removing facts, details, or nuance
- Simplifying vocabulary to the point of losing meaning
- "Dumbing down"
- Omitting caveats or qualifications
- Cutting content because it seems long

---

## Claude System Prompt Rules

Every Claude call (URL reformat and image reformat) has the core rule in the system prompt:
> "CRITICAL RULE: Never remove, simplify, or summarise the original content. Every fact, detail, and point must be preserved. Only change the structure and presentation."

This must always appear. Do not remove it when updating prompts.

---

## Demo Content

The homepage demo shows the same document reformatted for all four profiles. Every fact in the original must appear in every profile version. Verify this whenever demo content is updated.

---

## Copy Tone

- Direct and clear — lead with the point
- Short sentences
- No jargon without explanation
- No preamble
- Warm but not patronising
- Never implies the user is less capable

**Wrong:** "This tool helps people who struggle with reading to understand complex information."
**Right:** "Built for the way your brain reads."

---

## Key Copy Lines (Agreed)

Do not change these without discussion:

- **Tagline:** "Content should never be reduced. Only reorganised."
- **Homepage headline:** "Make any webpage / **dyslexic** friendly"
- **Prompt page headline:** "Make your AI Assistant / **dyslexic** friendly"
- **Scan page headline:** "Make any printed document / **dyslexic** friendly"
- **Subheading pattern:** "We believe content should never be reduced. Only reorganised."
