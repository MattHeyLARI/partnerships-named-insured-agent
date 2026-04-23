// api/loss-events.js — Vercel serverless function
// Searches for publicly reported property/BI loss events for a named insured.
//
// POST body: { name: string, url?: string }
// Returns:   { loss_events, loss_event_search }

const SYSTEM_PROMPT = `You are an expert insurance loss event researcher. Your job is to find publicly reported property damage and business interruption loss events associated with a specific named insured business.

Run exactly three web searches using the web_search tool:
1. The first search for property insurance loss events
2. The second search for business interruption events
3. The third search for fire, flood, damage, or closure events

Evaluate each result strictly. Only include events that describe actual physical damage, destruction, or operational interruption at a location operated by or associated with the named insured.

CREDIBLE SOURCES (include): news articles, local newspapers, trade/industry publications, fire department incident reports, court records, regulatory filings, press releases from the company or its insurers
EXCLUDED SOURCES (skip): social media posts (Twitter/X, Facebook, Instagram), forums (Reddit, Quora, Yelp), opinion pieces, general industry commentary, events involving different businesses with a similar name

Deduplicate: if the same loss event appears across multiple search results, include it once using the most authoritative/detailed source.

For each confirmed loss event extract:
- date: exact date YYYY-MM-DD, or month/year YYYY-MM, or year only YYYY, or "Unknown" if not determinable
- event_type: one of fire | flood | storm | earthquake | theft | equipment_breakdown | pandemic | other
- location: "City, State" if specifically mentioned, otherwise null
- description: 1-2 sentences paraphrased in your own words — do NOT reproduce verbatim text from any source
- source_name: the publication or outlet name
- source_url: the full URL of the source article or document
- relevance: "high" if the event directly involves property damage or BI at the insured's own premises; "medium" if related to the insured but less directly; "low" if the connection is tenuous

You must return ONLY a valid JSON object with NO markdown, NO code blocks, NO preamble, NO citation tags:
{
  "loss_events": [
    {
      "date": "string",
      "event_type": "string",
      "location": "string | null",
      "description": "string",
      "source_name": "string",
      "source_url": "string",
      "relevance": "high | medium | low"
    }
  ],
  "notes": "string or null"
}

If no loss events are found after all searches, return loss_events as an empty array [].
Do not fabricate or infer events — only include what search results explicitly and clearly describe.`;

function parseJsonFromText(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON object found in response");
  return JSON.parse(match[0]);
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchUrlContent(rawUrl) {
  let origin;
  try {
    const u = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
    origin = u.origin;
  } catch {
    return { content: null, status: "failed" };
  }

  const paths = ["", "/news", "/press", "/media", "/investors"];
  const fetched = [];

  await Promise.all(paths.map(async (p) => {
    try {
      const r = await fetch(`${origin}${p}`, {
        signal: AbortSignal.timeout(5_000),
        headers: { "User-Agent": "Mozilla/5.0 (compatible; LARI-research-bot/1.0)" },
        redirect: "follow",
      });
      if (!r.ok) return;
      const html = await r.text();
      const text = stripHtml(html).slice(0, 2_500);
      if (text.length > 100) fetched.push(`[${origin}${p}]\n${text}`);
    } catch {
      // silently skip unreachable paths
    }
  }));

  if (!fetched.length) return { content: null, status: "failed" };
  return {
    content: fetched.join("\n\n---\n\n").slice(0, 8_000),
    status: "success",
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, url } = req.body || {};
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Missing or invalid name" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  const businessName = name.trim();
  const searches = [
    `"${businessName}" property insurance loss`,
    `"${businessName}" business interruption`,
    `"${businessName}" fire flood damage closure`,
  ];
  const timestamp = new Date().toISOString();

  // Fetch URL content in parallel while we prepare (doesn't block Claude call)
  const { content: urlContent, status: urlScanStatus } = url
    ? await fetchUrlContent(url)
    : { content: null, status: "not_attempted" };

  // Build user message
  let userMessage =
    `Research and identify publicly reported loss events for this named insured business: ${businessName}\n\n` +
    `Run these three web searches in order:\n` +
    `1. ${searches[0]}\n` +
    `2. ${searches[1]}\n` +
    `3. ${searches[2]}\n`;

  if (urlContent) {
    userMessage +=
      `\nAdditional context — I fetched content from the business website (${url}). ` +
      `Scan this for any references to property damage, fire, flood, closures, or business interruption:\n\n` +
      `${urlContent}\n`;
  }

  userMessage += `\nReturn your findings as a JSON object following the exact schema in the system prompt. Return raw JSON only.`;

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":    "application/json",
        "x-api-key":       apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system:     SYSTEM_PROMPT,
        tools:      [{ type: "web_search_20250305", name: "web_search" }],
        messages:   [{ role: "user", content: userMessage }],
      }),
      signal: AbortSignal.timeout(50_000),
    });

    // Rate-limit retry
    if (anthropicRes.status === 429) {
      await new Promise(r => setTimeout(r, 10_000));
      return handler(req, res);
    }

    if (!anthropicRes.ok) {
      const detail = await anthropicRes.text();
      console.error("[loss-events] Anthropic API error:", anthropicRes.status, detail.slice(0, 200));
      return res.status(200).json({
        loss_events: [],
        loss_event_search: {
          searches_run: searches,
          url_scanned: url || null,
          url_scan_status: urlScanStatus,
          result_count: 0,
          timestamp,
          error: `Search API error ${anthropicRes.status}`,
        },
      });
    }

    const data = await anthropicRes.json();
    const textBlocks = (data.content || []).filter(b => b.type === "text");
    const fullText = textBlocks.map(b => b.text).join("");

    let parsed;
    try {
      parsed = parseJsonFromText(fullText);
    } catch (e) {
      console.error("[loss-events] JSON parse failed:", e.message, "| raw:", fullText.slice(0, 300));
      return res.status(200).json({
        loss_events: [],
        loss_event_search: {
          searches_run: searches,
          url_scanned: url || null,
          url_scan_status: urlScanStatus,
          result_count: 0,
          timestamp,
          error: "Response parse failed",
        },
      });
    }

    const events = Array.isArray(parsed.loss_events) ? parsed.loss_events : [];

    return res.status(200).json({
      loss_events: events,
      loss_event_search: {
        searches_run:    searches,
        url_scanned:     url || null,
        url_scan_status: urlScanStatus,
        result_count:    events.length,
        timestamp,
        notes:           parsed.notes || null,
      },
    });

  } catch (err) {
    const isTimeout = err.name === "TimeoutError" || err.name === "AbortError";
    console.error("[loss-events] handler error:", err.message);
    return res.status(200).json({
      loss_events: [],
      loss_event_search: {
        searches_run:    searches,
        url_scanned:     url || null,
        url_scan_status: urlScanStatus,
        result_count:    0,
        timestamp,
        error: isTimeout ? "Search timed out — partial results only" : `Internal error: ${err.message}`,
      },
    });
  }
}

export const config = {
  maxDuration: 60,
  api: { bodyParser: { sizeLimit: "1mb" } },
};
