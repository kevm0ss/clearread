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
];

// Additional rules layered on top of every profile — from the readclear formatting framework
const SHARED_RULES = `
Additional rules (apply to every profile):
- Keep sentences to 20 words or fewer.
- Keep paragraphs to 1–3 sentences. Never run longer.
- When 3 or more related items appear in prose, convert them to a bullet list.
- Never use ALL CAPS. Avoid double negatives — rewrite them positively (e.g. "not unlikely" → "likely").
- Never use italics.`;

const PROFILE_PROMPTS = {
  phonological: `Profile: I have phonological dyslexia.
Core rule: Never simplify content. Only change how it is structured and presented.
Profile-specific: Use plain, common words. If a technical term is necessary, define it in plain language immediately after. Avoid jargon where a simpler word exists.
Formatting rules:
1. Use short sentences. One idea per sentence.
2. Bold the key term in each sentence for easy scanning.
3. Leave clear visual gaps between sections and ideas.
4. Always lead with the most important point. Put detail after.
5. Use plain language throughout. Define any technical term when first used.
${SHARED_RULES}`,

  visual: `Profile: I have visual stress dyslexia.
Core rule: Never simplify content. Only change how it is structured and presented.
Profile-specific: Dense text is the main barrier — it can feel visually overwhelming or appear to move. The goal is to keep the page light. Only the most important content should be immediately visible. Secondary content should be tucked away and opened only when needed.
Formatting rules:
1. Use short sentences. One idea per sentence.
2. Bold the key term in each sentence for easy scanning.
3. Leave generous visual gaps between every section and idea.
4. Prefer bullet points over prose wherever possible — dense paragraphs are the main barrier.
5. Avoid long unbroken paragraphs — break into chunks of 2 sentences maximum.
6. Use <details><summary> to collapse secondary content only. Secondary content includes: background or context sections, long lists of examples (show 2–3, collapse the rest), methodology or technical detail, historical context, and "further reading" sections. The <summary> label must clearly describe what is inside — e.g. "Background: how this started" or "More examples (8)". Primary content — the main argument, key facts, conclusions, and actions — must always stay open. Do not collapse more than one third of the page.
${SHARED_RULES}`,

  memory: `Profile: I have working memory dyslexia.
Core rule: Never simplify content. Only change how it is structured and presented.
Profile-specific: Losing the thread mid-sentence is the main challenge. Number all steps. Summarise first. Never bury the main point.
Formatting rules:
1. Use short sentences. One idea per sentence.
2. Bold the key term in each sentence for easy scanning.
3. Always put the key point at the top of each section — never bury it.
4. Number every step or sequential item — never bury steps in prose.
5. Use clear visual gaps and section headers so the reader always knows where they are.
6. Add a one-sentence summary at the start of any section longer than 3 paragraphs.
${SHARED_RULES}`,

  mixed: `Profile: I am dyslexic (mixed profile).
Core rule: Never simplify content. Only change how it is structured and presented.
Profile-specific: Apply a broad set of dyslexia-friendly adjustments: short sentences, plain language, numbered steps for any process, clear visual structure.
Formatting rules:
1. Use short sentences. One idea per sentence.
2. Bold the key term in each sentence for easy scanning.
3. Leave clear visual gaps between sections and ideas.
4. Always lead with the most important point. Put detail after.
5. Use plain language. Define technical terms when first used.
6. Number every step or process — never bury steps in prose.
7. Use a one-sentence summary at the top of long sections.
${SHARED_RULES}`,

  aphasia: `Profile: I have aphasia.
Core rule: Preserve every fact and piece of information. You may replace complex or formal words with simpler everyday alternatives — but never remove meaning. Reorganise structure to make each point as clear as possible.
Profile-specific: Aphasia affects how language is processed. Very short sentences help most. Active voice is much easier than passive. Pronouns (it, they, this, that, he, she, we, us) are confusing — always replace them with the actual noun. Everyday words are easier than formal, medical, or abstract language. Repeating key words is helpful — do not avoid repetition.
Formatting rules:
1. Target 5 words per sentence. Never more than 10. One point only per sentence.
2. Split any sentence with embedded clauses into two or more separate sentences.
3. Always use active voice. Rewrite every passive sentence. Example: "The ambulance will collect you" not "You will be collected by the ambulance".
4. Never use pronouns (it, they, them, this, that, he, she, we, us). Replace every pronoun with the exact noun it refers to.
5. Use only everyday words. Replace formal or technical words: tablets not medication, doctor not physician, get better not recover, stroke not CVA, brain bleed not haemorrhage, blood clot not ischaemic, cope with not compensate for, interest not motivation, ambulance not transport.
6. Repeat key words freely — repetition aids understanding. Do not use pronouns to avoid repeating a word.
7. Use bullet points for any list of two or more items.
8. Maximum 2 sentences per paragraph. Leave generous space between paragraphs.
9. Bold the single most important word or phrase in each paragraph.
10. Never use ALL CAPS, italics, or underlines.`,
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
  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid request body.', 400, corsHeaders);
  }

  const { url, profile = 'mixed', extras = '' } = body;

  if (!url || !url.startsWith('http')) {
    return errorResponse('A valid URL is required.', 400, corsHeaders);
  }

  // Block private/internal addresses to prevent SSRF
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const blocked = [
      'localhost', '127.0.0.1', '0.0.0.0', '::1',
      '169.254.169.254', // cloud metadata
    ];
    if (blocked.includes(host)) {
      return errorResponse('That URL cannot be reformatted.', 400, corsHeaders);
    }
    // Block private IP ranges (10.x, 172.16-31.x, 192.168.x)
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

  // Limit content length to avoid huge Claude requests
  const wasTruncated = text.length > 12000;
  const truncatedText = wasTruncated ? text.slice(0, 12000) + '\n\n[Content truncated for length]' : text;

  // 3. Build Claude prompt
  const profilePrompt = PROFILE_PROMPTS[profile] || PROFILE_PROMPTS.mixed;
  const isAphasia = profile === 'aphasia';

  const systemPrompt = `You are an accessibility formatter. You reformat web content for people with ${isAphasia ? 'aphasia' : 'dyslexia'}.

CRITICAL RULE: ${isAphasia
    ? 'Preserve every fact and piece of information. You may replace complex or formal words with simpler everyday alternatives, but never remove any meaning. Only change structure, vocabulary, and presentation.'
    : 'Never remove, simplify, or summarise the original content. Every fact, detail, and point must be preserved. Only change the structure and presentation.'}

${profilePrompt}

Input format: The content uses markdown-style structure:
- # ## ### mark headings — preserve as <h1> <h2> <h3>
- [link text](url) marks links — preserve as <a href="url">link text</a>
- **text** marks bold — preserve as <strong>text</strong>
- • marks list items — use <ul><li> for these

Output format: Return clean semantic HTML only. No markdown. No code fences. No commentary.
Allowed tags: <h1> <h2> <h3> <p> <ul> <ol> <li> <strong> <a href=""> <details> <summary> <blockquote> <hr>
Do not include <html> <head> <body> or <style> tags.
Always preserve every <a href=""> link from the original content.${extras ? `\n\nPersonalisation — apply these additional instructions on top of the profile rules:\n${extras.slice(0, 800)}` : ''}`;

  const userMessage = `Reformat the following web page content. Preserve every fact, link, and detail. Only change structure and presentation.

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

  // 5. Return result
  return new Response(JSON.stringify({
    title,
    html: reformattedHtml,
    profile,
    url,
    truncated: wasTruncated,
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

  // Sanity check media type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(mediaType)) {
    return errorResponse('Unsupported image type.', 400, corsHeaders);
  }

  const profilePrompt = PROFILE_PROMPTS[profile] || PROFILE_PROMPTS.mixed;

  const systemPrompt = `You are an accessibility formatter. You read text from images of documents and reformat it for people with dyslexia.

CRITICAL RULE: Transcribe and include every word of text you can see in the image. Never remove, simplify, or summarise content. Only change the structure and presentation.

${profilePrompt}

Output format: Return clean semantic HTML only. No markdown. No code fences. No commentary.
Allowed tags: <h1> <h2> <h3> <p> <ul> <ol> <li> <strong> <a href=""> <details> <summary> <blockquote> <hr>
Do not include <html> <head> <body> or <style> tags.
Start your response with a <h1> containing the document title or type (e.g. "Appointment Letter", "Prescription Notice").`;

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
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageData,
              },
            },
            {
              type: 'text',
              text: 'Please read all the text in this document image and reformat it to be more accessible for someone with dyslexia. Include every piece of text you can see.',
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

  // Strip any accidental markdown code fences
  reformattedHtml = reformattedHtml
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  if (!reformattedHtml) {
    return errorResponse('No content returned from formatter.', 500, corsHeaders);
  }

  // Extract a title from the first <h1> if present
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
 * Preserves headings, links, lists, bold text and paragraph breaks.
 * Sends structured markdown-style text to Claude so nothing is lost.
 */
function extractContent(html, baseUrl) {
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? decodeEntities(titleMatch[1]).trim() : baseUrl;

  // Step 1 — remove entirely useless blocks
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

  // Step 2 — try to isolate main content area
  // Note: the div regex uses a lazy match which can stop at the first nested </div>.
  // Only trust the match if it captured enough content — otherwise fall back to full body.
  const mainMatch =
    cleaned.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i) ||
    cleaned.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i) ||
    cleaned.match(/<div[^>]+(?:id|class)="[^"]*(?:content|article|main|post|body)[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  if (mainMatch && mainMatch[1].length > 500) cleaned = mainMatch[1];

  // Step 3 — convert semantic elements to structured text before stripping

  // Headings → markdown style
  cleaned = cleaned
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => `\n\n# ${stripTags(t).trim()}\n\n`)
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `\n\n## ${stripTags(t).trim()}\n\n`)
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `\n\n### ${stripTags(t).trim()}\n\n`)
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, t) => `\n\n#### ${stripTags(t).trim()}\n\n`)
    .replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, (_, t) => `\n\n##### ${stripTags(t).trim()}\n\n`)
    .replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, (_, t) => `\n\n###### ${stripTags(t).trim()}\n\n`);

  // Bold
  cleaned = cleaned
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');

  // Links — convert to [text](url), skip anchors and javascript
  cleaned = cleaned.replace(/<a\s[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
    const linkText = stripTags(text).trim();
    if (!linkText) return '';
    // Skip javascript: and empty anchors
    if (href.startsWith('javascript:') || href === '#') return linkText;
    // Resolve relative URLs
    let absUrl = href;
    try {
      absUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href;
    } catch(e) { return linkText; }
    return `[${linkText}](${absUrl})`;
  });

  // List items
  cleaned = cleaned
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `\n• ${stripTags(t).trim()}`)
    .replace(/<\/[uo]l>/gi, '\n');

  // Paragraphs and divs → double newlines
  cleaned = cleaned
    .replace(/<p[^>]*>/gi, '\n\n')
    .replace(/<\/p>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/section>/gi, '\n\n');

  // Step 4 — strip all remaining tags
  cleaned = stripTags(cleaned);

  // Step 5 — decode HTML entities
  cleaned = decodeEntities(cleaned);

  // Step 6 — clean up whitespace
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
