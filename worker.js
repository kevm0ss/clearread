/**
 * readclear Cloudflare Worker
 * Fetches a URL, extracts readable content, reformats via Claude API
 *
 * Environment variables (set as Worker Secrets in Cloudflare):
 *   ANTHROPIC_API_KEY  — your Anthropic API key
 *
 * Allowed origins (update when domain is confirmed):
 *   https://readclear.importantsmallthings.com
 *   https://clearread-7x3.pages.dev
 */

const ALLOWED_ORIGINS = [
  'https://readclear.importantsmallthings.com',
  'https://clearread-7x3.pages.dev',
  'https://reformat-v2.clearread-7x3.pages.dev',
];

// Shared rules applied to every profile
const SHARED_RULES = `
Universal formatting rules (apply to every profile):
- Keep sentences to 20 words or fewer. One idea per sentence.
- Keep paragraphs to 1–3 sentences. Never run more than 3 sentences together.
- When 3 or more related items appear in prose, convert them to a bullet list.
- Use a meaningful heading every 3–4 paragraphs to help the reader track their place.
- Never use ALL CAPS. Never use double negatives (e.g. "not unlikely" → "likely", "not unimportant" → "important").
- Never use italics.
- Bold one key term per paragraph — the single most important word or phrase. Use it sparingly so it stands out.
- Use <details><summary> only for sections that are genuinely long or complex — 4 or more sentences, or sections covering multiple distinct sub-topics. Short sections, single facts, and simple lists must stay open as normal HTML. Do not wrap everything.
- When you do use <details>, the <summary> must be one plain sentence stating the most important point of that section. The reader should know what they will find before opening it.`;

const PROFILE_PROMPTS = {
  phonological: `Profile: I have phonological dyslexia.
Core rule: Never simplify content. Only change how it is structured and presented.
Profile-specific: Long or unfamiliar words are the main barrier. Use plain, common words wherever possible. If a technical term is essential, define it in plain language immediately after in brackets.
Formatting rules:
1. Use plain language throughout. Swap jargon for everyday words where possible.
2. Define every technical term when first used — e.g. "photosynthesis (how plants make food from sunlight)".
3. Lead with the most important point. Put supporting detail after.
4. Open the first <details> section by default (add the open attribute) so the reader sees content immediately.
${SHARED_RULES}`,

  visual: `Profile: I have visual stress dyslexia.
Core rule: Never simplify content. Only change how it is structured and presented.
Profile-specific: Dense blocks of text are the main barrier — they can feel visually overwhelming or appear to move. Space and structure are more important than anything else.
Formatting rules:
1. Break paragraphs aggressively — 2 sentences maximum per paragraph for this profile.
2. Prefer bullet lists over prose wherever the content allows.
3. Leave extra space between sections — use <hr> between major topic shifts.
4. All <details> sections start closed. The reader opens only what they need, reducing visual clutter.
${SHARED_RULES}`,

  memory: `Profile: I have working memory dyslexia.
Core rule: Never simplify content. Only change how it is structured and presented.
Profile-specific: Losing the thread mid-sentence or mid-section is the main challenge. Structure must make it easy to stop, look away, and find your place again.
Formatting rules:
1. Always put the key point at the top of every section — never bury it.
2. Number every step or sequential process — never leave steps inside prose.
3. Use a short summary sentence at the start of any section longer than 3 paragraphs.
4. All <details> sections start closed — the reader controls what they hold in mind at once.
${SHARED_RULES}`,

  mixed: `Profile: I am dyslexic (mixed profile).
Core rule: Never simplify content. Only change how it is structured and presented.
Profile-specific: Apply the full range of dyslexia-friendly adjustments. Prioritise structure, spacing, and plain language equally.
Formatting rules:
1. Lead with the most important point in every section.
2. Use plain language. Define technical terms when first used.
3. Number every step or process — never bury steps in prose.
4. Use a short summary sentence at the start of any section longer than 3 paragraphs.
5. All <details> sections start closed.
${SHARED_RULES}`,
};

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const isAllowed = ALLOWED_ORIGINS.includes(origin);
    const corsHeaders = {
      'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);

    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Main reformat endpoint (URL)
    if (url.pathname === '/reformat' && request.method === 'POST') {
      return handleReformat(request, env, corsHeaders);
    }

    // Image/scan reformat endpoint
    if (url.pathname === '/reformat-image' && request.method === 'POST') {
      return handleReformatImage(request, env, corsHeaders);
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
  }
};

async function handleReformat(request, env, corsHeaders) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid request body.', 400, corsHeaders);
  }

  const { url, profile = 'mixed' } = body;

  if (!url || !url.startsWith('http')) {
    return errorResponse('A valid URL is required.', 400, corsHeaders);
  }

  // Block private/internal addresses to prevent SSRF
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const blocked = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '169.254.169.254'];
    if (blocked.includes(host)) {
      return errorResponse('That URL cannot be reformatted.', 400, corsHeaders);
    }
    if (/^10\./.test(host) || /^192\.168\./.test(host) ||
        /^172\.(1[6-9]|2\d|3[01])\./.test(host)) {
      return errorResponse('That URL cannot be reformatted.', 400, corsHeaders);
    }
  } catch {
    return errorResponse('A valid URL is required.', 400, corsHeaders);
  }

  // 1. Fetch the target page
  let pageHtml;
  try {
    const pageRes = await fetch(url, {
      headers: {
        'User-Agent': 'readclear/1.0 (accessibility reformatter; readclear.importantsmallthings.com)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-GB,en;q=0.9',
      },
      redirect: 'follow',
      cf: { timeout: 10 },
    });

    if (!pageRes.ok) {
      if (pageRes.status === 403 || pageRes.status === 401) {
        return errorResponse('blocked', 403, corsHeaders);
      }
      return errorResponse(`Unable to fetch page (${pageRes.status}).`, 502, corsHeaders);
    }

    pageHtml = await pageRes.text();
  } catch (err) {
    return errorResponse('blocked', 403, corsHeaders);
  }

  // 2. Extract readable text from HTML
  const { title, text } = extractContent(pageHtml, url);

  if (!text || text.length < 100) {
    return errorResponse('blocked', 403, corsHeaders);
  }

  const truncatedText = text.length > 12000 ? text.slice(0, 12000) + '\n\n[Content truncated for length]' : text;

  // 3. Build Claude prompt
  const profilePrompt = PROFILE_PROMPTS[profile] || PROFILE_PROMPTS.mixed;

  const systemPrompt = `You are an accessibility formatter. You reformat web content for people with dyslexia using progressive disclosure — collapsible sections that let the reader start with the key points and drill into detail only when they want to.

CRITICAL RULE: Never remove, simplify, or summarise the original content. Every fact, detail, and point must be preserved in the expanded sections. Only change the structure and presentation.

${profilePrompt}

Input format: The content uses markdown-style structure:
- # ## ### mark headings — use these to identify major sections
- [link text](url) marks links — preserve as <a href="url">link text</a>
- **text** marks bold — preserve as <strong>text</strong>
- • marks list items — use <ul><li> for these

Output format: Return clean semantic HTML only. No markdown. No code fences. No commentary.
Allowed tags: <div> <h1> <h2> <h3> <h4> <p> <ul> <ol> <li> <strong> <a href=""> <details> <summary> <blockquote> <hr>
Do not include <html> <head> <body> or <style> tags.
Always preserve every <a href=""> link from the original content.`;

  const userMessage = `Reformat the following web page content using progressive disclosure. Preserve every fact, link, and detail in the expanded sections. Start with a visible summary block, then collapse each section.

Page title: ${title}

Content:
${truncatedText}`;

  // 4. Call Claude API
  let claudeResponse;
  try {
    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!apiRes.ok) {
      const errBody = await apiRes.text();
      console.error('Claude API error:', apiRes.status, errBody);
      return errorResponse('Formatting service unavailable. Please try again.', 502, corsHeaders);
    }

    claudeResponse = await apiRes.json();
  } catch (err) {
    return errorResponse('Formatting service unavailable. Please try again.', 502, corsHeaders);
  }

  let reformattedHtml = claudeResponse.content?.[0]?.text || '';

  // Strip markdown code fences Claude sometimes wraps around HTML output
  reformattedHtml = reformattedHtml
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  if (!reformattedHtml) {
    return errorResponse('No content returned from formatter.', 500, corsHeaders);
  }

  return new Response(JSON.stringify({
    title,
    html: reformattedHtml,
    profile,
    url,
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleReformatImage(request, env, corsHeaders) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid request body.', 400, corsHeaders);
  }

  const { imageData, mediaType = 'image/jpeg', profile = 'mixed' } = body;

  if (!imageData) {
    return errorResponse('No image data provided.', 400, corsHeaders);
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(mediaType)) {
    return errorResponse('Unsupported image type.', 400, corsHeaders);
  }

  const profilePrompt = PROFILE_PROMPTS[profile] || PROFILE_PROMPTS.mixed;

  const systemPrompt = `You are an accessibility formatter. You read text from images of documents and reformat it for people with dyslexia using progressive disclosure — collapsible sections that let the reader start with the key points and drill into detail only when they want to.

CRITICAL RULE: Transcribe and include every word of text you can see in the image. Never remove, simplify, or summarise content. Only change the structure and presentation.

${profilePrompt}

Output format: Return clean semantic HTML only. No markdown. No code fences. No commentary.
Allowed tags: <div> <h1> <h2> <h3> <h4> <p> <ul> <ol> <li> <strong> <a href=""> <details> <summary> <blockquote> <hr>
Do not include <html> <head> <body> or <style> tags.
Start with a <h1> containing the document title or type (e.g. "Appointment Letter", "Prescription Notice"), then follow with the summary block and collapsible sections.`;

  let claudeResponse;
  try {
    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: imageData },
            },
            {
              type: 'text',
              text: 'Please read all the text in this document image and reformat it using progressive disclosure — a visible summary block followed by collapsible sections. Include every piece of text you can see.',
            },
          ],
        }],
      }),
    });

    if (!apiRes.ok) {
      const errBody = await apiRes.text();
      console.error('Claude API error:', apiRes.status, errBody);
      let detail = '';
      try { detail = JSON.parse(errBody)?.error?.message || ''; } catch(e) {}
      return errorResponse(`Formatting service error: ${detail || apiRes.status}`, 502, corsHeaders);
    }

    claudeResponse = await apiRes.json();
  } catch (err) {
    return errorResponse('Formatting service unavailable. Please try again.', 502, corsHeaders);
  }

  let reformattedHtml = claudeResponse.content?.[0]?.text || '';

  reformattedHtml = reformattedHtml
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  if (!reformattedHtml) {
    return errorResponse('No content returned from formatter.', 500, corsHeaders);
  }

  const titleMatch = reformattedHtml.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const title = titleMatch ? titleMatch[1].trim() : 'Scanned document';

  return new Response(JSON.stringify({
    html: reformattedHtml,
    title,
    profile,
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * Extract readable structured content from HTML.
 */
function extractContent(html, baseUrl) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? decodeEntities(titleMatch[1]).trim() : baseUrl;

  let cleaned = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, '')
    .replace(/<iframe\b[\s\S]*?<\/iframe>/gi, '')
    .replace(/<nav\b[\s\S]*?<\/nav>/gi, '')
    .replace(/<header\b[\s\S]*?<\/header>/gi, '')
    .replace(/<footer\b[\s\S]*?<\/footer>/gi, '')
    .replace(/<aside\b[\s\S]*?<\/aside>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  const mainMatch =
    cleaned.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i) ||
    cleaned.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i) ||
    cleaned.match(/<div[^>]+(?:id|class)="[^"]*(?:content|article|main|post|body)[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  if (mainMatch) cleaned = mainMatch[1];

  cleaned = cleaned
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => `\n\n# ${stripTags(t).trim()}\n\n`)
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `\n\n## ${stripTags(t).trim()}\n\n`)
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `\n\n### ${stripTags(t).trim()}\n\n`)
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, t) => `\n\n#### ${stripTags(t).trim()}\n\n`)
    .replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, (_, t) => `\n\n##### ${stripTags(t).trim()}\n\n`)
    .replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, (_, t) => `\n\n###### ${stripTags(t).trim()}\n\n`);

  cleaned = cleaned
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');

  cleaned = cleaned.replace(/<a\s[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
    const linkText = stripTags(text).trim();
    if (!linkText) return '';
    if (href.startsWith('javascript:') || href === '#') return linkText;
    let absUrl = href;
    try {
      absUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href;
    } catch(e) { return linkText; }
    return `[${linkText}](${absUrl})`;
  });

  cleaned = cleaned
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `\n• ${stripTags(t).trim()}`)
    .replace(/<\/[uo]l>/gi, '\n');

  cleaned = cleaned
    .replace(/<p[^>]*>/gi, '\n\n')
    .replace(/<\/p>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/section>/gi, '\n\n');

  cleaned = stripTags(cleaned);
  cleaned = decodeEntities(cleaned);
  cleaned = cleaned
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  return { title, text: cleaned };
}

function stripTags(str) {
  return str.replace(/<[^>]+>/g, ' ');
}

function decodeEntities(str) {
  return str
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '...')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    .replace(/&[a-z]+;/g, ' ');
}

function errorResponse(message, status, corsHeaders) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
