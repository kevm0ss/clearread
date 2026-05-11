# Analytics

## Current Analytics Sources

### 1. Cloudflare Workers Metrics (available now, no setup needed)
- **Where:** Cloudflare dashboard → Workers & Pages → readclear-worker → Metrics tab
- **What it shows:** Total requests, error rate, CPU time, wall time
- **Useful for:** Checking if the Worker is being used, catching errors, estimating API cost
- **Limitation:** No breakdown by URL or profile — all /reformat calls aggregated together

### 2. Anthropic Console (available now, no setup needed)
- **Where:** console.anthropic.com → Usage
- **What it shows:** Token usage per day, cost breakdown, model usage
- **Useful for:** Monthly cost tracking, checking if usage is growing
- **Check monthly:** Compare to previous month to spot unexpected spikes

---

## Pending: Cloudflare Web Analytics

Cloudflare Web Analytics is a privacy-respecting, cookie-free alternative to Google Analytics. Approved to set up — waiting on the tracking token.

### Setup Steps (for Kevin)
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Web Analytics → Add a site
3. Enter `readclear.importantsmallthings.com` (or `clearread-7x3.pages.dev`)
4. Copy the JavaScript snippet (one line with `data-cf-beacon` token)
5. Share the token — Claude will add the script tag to all HTML pages

### Where to add the script
Add the one-line script tag to the `<head>` of each page:
- `index.html`
- `read.html`
- `scan.html`
- `prompt.html`
- `siteowners.html`

### What it will show
- Page views per page
- Session counts
- Referrers (where visitors come from)
- Top pages
- Country breakdown
- Core Web Vitals

### What it won't show (by design)
- Individual user tracking
- Cookie-based sessions
- Personal data

This is aligned with readclear's audience — dyslexic and aphasia users who may use accessibility tools that break cookie consent banners.

---

## Future Analytics Considerations

- **Profile usage distribution:** Knowing what proportion of users choose each profile would help prioritise which profiles to optimise. Could be added as a custom Cloudflare Analytics event.
- **REFINE usage:** Do users actually use the content reformat options? TTS? This would inform which features to invest in.
- **Scan tool vs URL tool:** Which is used more? Currently we don't know.
- **Worker cost per profile:** Aphasia prompts are longer — do they cost meaningfully more? The Anthropic Console shows total tokens but not per-profile breakdown.

These are low priority until there is regular user traffic to measure.
