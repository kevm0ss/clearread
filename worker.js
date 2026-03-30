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
  'http://localhost:3000',
  'http://127.0.0.1:5500',
];

const PROFILE_PROMPTS = {
  phonological: `Profile: I have phonological dyslexia.
Core rule: Never simplify content. Only change how it is structured and presented.
Profile-specific: Use plain, common words. If a technical term is necessary, define it in plain language immediately after. Avoid jargon where a simpler word exists.
Formatting rules:
1. Use short sentences. One idea per sentence.
2. Bold the key term in each sentence for easy scanning.
3. Leave clear visual gaps between sections and ideas.
4. Always lead with the most important point. Put detail after.
5. Use plain language throughout. Define any technical term when first used.`,

  visual: `Profile: I have visual stress dyslexia.
Core rule: Never simplify content. Only change how it is structured and presented.
Profile-specific: Layout and spacing are critical. Dense text is the main barrier. Use generous whitespace, short line lengths, and strong visual hierarchy.
Formatting rules:
1. Use short sentences. One idea per sentence.
2. Bold the key term in each sentence for easy scanning.
3. Leave generous visual gaps between every section and idea.
4. Use diagrams, bullet points, and visual structure wherever possible.
5. Avoid long unbroken paragraphs — break into chunks of 2-3 sentences maximum.`,

  memory: `Profile: I have working memory dyslexia.
Core rule: Never simplify content. Only change how it is structured and presented.
Profile-specific: Losing the thread mid-sentence is the main challenge. Number all steps. Summarise first. Never bury the main point.
Formatting rules:
1. Use short sentences. One idea per sentence.
2. Bold the key term in each sentence for easy scanning.
3. Always put a summary or key point at the top of each section.
4. Number every step or sequential item — never bury steps in prose.
5. Use clear visual gaps and section headers so the reader always knows where they are.`,

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
7. Use a summary at the top of long sections.`,
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

    // Main reformat endpoint
    if (url.pathname === '/reformat' && request.method === 'POST') {
      return handleReformat(request, env, corsHeaders);
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

  const { url, profile = 'mixed' } = body;

  if (!url || !url.startsWith('http')) {
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
  const truncatedText = text.length > 12000 ? text.slice(0, 12000) + '\n\n[Content truncated for length]' : text;

  // 3. Build Claude prompt
  const profilePrompt = PROFILE_PROMPTS[profile] || PROFILE_PROMPTS.mixed;

  const systemPrompt = `You are an accessibility formatter. You reformat web content for people with dyslexia.

CRITICAL RULE: Never remove, simplify, or summarise the original content. Every fact, detail, and point must be preserved. Only change the structure and presentation.

${profilePrompt}

Output format: Return clean semantic HTML only. No markdown. No code fences. No commentary.
Use: <h1>, <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <details>, <summary>, <blockquote>, <hr>
Do not include <html>, <head>, <body>, or <style> tags.`;

  const userMessage = `Reformat the following web page content according to the formatting rules above. Preserve every piece of information.

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
        model: 'claude-opus-4-5',
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

  const reformattedHtml = claudeResponse.content?.[0]?.text || '';

  if (!reformattedHtml) {
    return errorResponse('No content returned from formatter.', 500, corsHeaders);
  }

  // 5. Return result
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

/**
 * Extract readable text content from HTML
 * Strips scripts, styles, nav, footer, ads
 */
function extractContent(html, url) {
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : url;

  // Remove unwanted elements
  let cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
    .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')        // Strip remaining tags
    .replace(/\s{2,}/g, ' ')          // Collapse whitespace
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();

  return { title, text: cleaned };
}

function errorResponse(message, status, corsHeaders) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
