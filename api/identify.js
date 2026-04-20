// api/identify.js — Vercel serverless function
// Step 1 of partnerships chain: research a named insured by name.
//
// POST body (JSON):
//   { name: string }
//
// Returns JSON:
//   { named_insured, confidence, research_data, ready_for_chain }

const RESEARCH_SYSTEM_PROMPT = `You are an expert insurance underwriting research analyst. When given a business name, you will research and extract specific information relevant to commercial insurance underwriting. Use web search extensively to find accurate, current information.

You must return ONLY a valid JSON object with NO markdown formatting, NO backticks, NO preamble, NO citation tags, NO XML tags of any kind. Return raw JSON only. If you include any <cite> or other XML-style tags in your response it will break the application. Plain text only inside all JSON string values.

The JSON must follow this exact schema:
{
  "company_name": "Official company name",
  "research_timestamp": "ISO date string",
  "business_description": "2-3 sentence high-level description of what the company does",
  "income_generation": {
    "summary": "Explanation of how the business generates revenue",
    "primary_sources": ["list", "of", "income", "sources"],
    "bi_risk_assessment": {
      "is_exposed": true or false,
      "risk_level": "High / Medium / Low / None",
      "bi_perils": ["property damage BI", "cyber BI", "supply chain", "etc - only include applicable ones"],
      "explanation": "Detailed explanation of BI exposure and relevant perils"
    }
  },
  "company_url": "https://...",
  "subsidiaries_and_brands": [
    {"name": "Brand or subsidiary name", "type": "subsidiary / brand / division", "description": "brief description"}
  ],
  "business_locations": {
    "typical_locations": ["warehouse", "office", "factory"],
    "location_details": "Explanation of typical property footprint for this company and industry"
  },
  "public_company": {
    "is_public": true or false,
    "exchange": "NYSE / NASDAQ / etc or null",
    "ticker": "TICKER or null",
    "latest_10k": {
      "available": true or false,
      "fiscal_year": "YYYY or null",
      "key_financials": {
        "revenue": "$ amount or null",
        "net_income": "$ amount or null",
        "total_assets": "$ amount or null"
      },
      "sec_filing_url": "URL or null",
      "highlights": "2-3 sentence summary of key 10-K findings relevant to underwriting"
    }
  },
  "franchise": {
    "is_franchise_related": true or false,
    "role": "franchisor / franchisee / both / neither",
    "franchise_details": "Explanation of franchise relationship if applicable",
    "latest_performance": "Latest available franchise performance data, unit counts, growth trends, or null if not applicable"
  },
  "special_industry_flags": {
    "is_hotel": true or false,
    "is_reit_or_real_estate_vehicle": true or false,
    "is_senior_living": true or false,
    "industry_notes": "Any relevant industry classification notes"
  },
  "headquarters": {
    "address": "Full street address",
    "city": "City",
    "state": "State",
    "zip": "ZIP",
    "country": "Country"
  },
  "data_confidence": "High / Medium / Low",
  "research_notes": "Any caveats, limitations, or important notes about the research"
}

Search the web thoroughly for each data point. For public companies, search SEC EDGAR for 10-K filings. For franchises, look for franchise disclosure documents or news about franchise performance. Be specific and accurate. If data is unavailable, use null rather than guessing.`;

function parseJsonFromText(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON object found in response");
  return JSON.parse(match[0]);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name } = req.body || {};
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Missing or invalid name" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: RESEARCH_SYSTEM_PROMPT,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [
          {
            role: "user",
            content: `Research the following named insured business for commercial insurance underwriting purposes. Extract ALL required data points by searching the web thoroughly:\n\nBusiness Name: ${name.trim()}\n\nReturn a complete JSON object following the exact schema specified. Search for current information including any recent 10-K filings, franchise data, subsidiaries, and business locations.`,
          },
        ],
      }),
    });

    if (anthropicRes.status === 429) {
      await new Promise(r => setTimeout(r, 10000));
      return handler(req, res);
    }

    if (!anthropicRes.ok) {
      const detail = await anthropicRes.text();
      return res.status(502).json({ error: `Anthropic API error ${anthropicRes.status}`, detail: detail.substring(0, 200) });
    }

    const data = await anthropicRes.json();
    const textBlocks = data.content?.filter(b => b.type === "text") || [];
    const fullText = textBlocks.map(b => b.text).join("");

    let researchData;
    try {
      researchData = parseJsonFromText(fullText);
    } catch (e) {
      return res.status(422).json({ error: `Research parse failed: ${e.message}`, raw: fullText.substring(0, 500) });
    }

    return res.status(200).json({
      named_insured:   name.trim(),
      confidence:      researchData.data_confidence?.toLowerCase() || "medium",
      ready_for_chain: true,
      research_data:   researchData,
    });

  } catch (err) {
    console.error("identify handler error:", err);
    return res.status(500).json({ error: `Internal server error: ${err.message}` });
  }
}

export const config = {
  maxDuration: 300,
  api: { bodyParser: { sizeLimit: '1mb' } },
};
