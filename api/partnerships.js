// api/partnerships.js — Vercel serverless function
// Unified API route for Step 5 orchestration layer.
// Accepts named insured name + SOV as base64, runs the full chain, returns structured JSON.
//
// POST body (JSON):
//   {
//     namedInsured: string,   // named insured business name (text)
//     sovBase64: string,      // SOV .xlsx file as base64
//     sovName: string
//   }
//
// Returns:
//   {
//     named_insured, confidence, source_file, ready_for_chain,
//     chain_output: { output_file, location_count, fips_resolution_rate,
//                     fips_failed, naics_distribution, processing_errors },
//     metadata: { ...research_data... }
//   }

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { namedInsured, sovBase64, sovName } = req.body || {};

  if (!namedInsured || !sovBase64) {
    return res.status(400).json({ error: "Missing required fields: namedInsured, sovBase64" });
  }

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const errors = [];

  // ---- Step 1: Research the named insured ----------------------------------
  let identifyResult;
  try {
    const idRes = await fetch(`${baseUrl}/api/identify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: namedInsured }),
    });
    if (!idRes.ok) {
      const e = await idRes.json().catch(() => ({ error: `HTTP ${idRes.status}` }));
      return res.status(502).json({ error: `Research step failed: ${e.error}` });
    }
    identifyResult = await idRes.json();
  } catch (err) {
    return res.status(500).json({ error: `Research step failed: ${err.message}` });
  }

  // ---- Steps 2-4: Chain (call each service directly) -----------------------
  const SOV_URL   = process.env.PARTNERSHIPS_SOV_APP_URL;
  const NAICS_URL = process.env.PARTNERSHIPS_NAICS_APP_URL;
  const BENCH_URL = process.env.PARTNERSHIPS_BENCHMARK_APP_URL;

  if (!SOV_URL || !NAICS_URL || !BENCH_URL) {
    return res.status(500).json({ error: "One or more partnerships service URLs are not configured." });
  }

  const sovBuffer   = Buffer.from(sovBase64, "base64");
  const sovFilename = sovName || "sov.xlsx";

  // Step 2: SOV
  let lariBuffer, lariFilename;
  try {
    const sovForm = new FormData();
    sovForm.append("file", new Blob([sovBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), sovFilename);
    sovForm.append("clientName", namedInsured);
    sovForm.append("startingOE", "1");

    const sovRes = await fetch(`${SOV_URL}/api/generate`, {
      method: "POST", body: sovForm, signal: AbortSignal.timeout(120_000),
    });
    if (!sovRes.ok) throw new Error(`SOV app HTTP ${sovRes.status}`);
    const cd = sovRes.headers.get("content-disposition") || "";
    const nm = cd.match(/filename="([^"]+)"/);
    lariFilename = nm ? nm[1] : `${namedInsured.replace(/[^a-zA-Z0-9]/g, "_")}_LARI_Workbook.xlsx`;
    lariBuffer = Buffer.from(await sovRes.arrayBuffer());
  } catch (err) {
    return res.status(502).json({ error: `SOV processing failed: ${err.message}` });
  }

  // Step 3: NAICS
  let naicsBuffer, naicsFilename;
  try {
    const naicsForm = new FormData();
    const researchStr = JSON.stringify(identifyResult.research_data || { company_name: namedInsured });
    naicsForm.append("research", new Blob([researchStr], { type: "application/json" }), "research.json");
    naicsForm.append("workbook", new Blob([lariBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), lariFilename);

    const naicsRes = await fetch(`${NAICS_URL}/assign-naics`, {
      method: "POST", body: naicsForm, signal: AbortSignal.timeout(180_000),
    });
    if (!naicsRes.ok) throw new Error(`NAICS app HTTP ${naicsRes.status}`);
    naicsFilename = naicsRes.headers.get("x-output-filename") ||
      lariFilename.replace(/\.xlsx$/i, "_naics_assigned.xlsx");
    naicsBuffer = Buffer.from(await naicsRes.arrayBuffer());
  } catch (err) {
    errors.push(`NAICS assignment error: ${err.message}`);
    // Use lariBuffer without NAICS as a fallback
    naicsBuffer = lariBuffer;
    naicsFilename = lariFilename;
  }

  // Step 4: Benchmark (SSE — collect complete event)
  let benchComplete;
  try {
    const benchForm = new FormData();
    benchForm.append("workbook", new Blob([naicsBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), naicsFilename);

    const benchRes = await fetch(`${BENCH_URL}/assign-benchmark`, {
      method: "POST", body: benchForm, signal: AbortSignal.timeout(280_000),
    });
    if (!benchRes.ok) throw new Error(`Benchmark app HTTP ${benchRes.status}`);

    // Collect SSE events
    const reader = benchRes.body.getReader();
    const dec = new TextDecoder();
    let buf = "", currentEvent = "message";

    outer: while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop();
      for (const line of lines) {
        if (line.startsWith("event: ")) {
          currentEvent = line.slice(7).trim();
        } else if (line.startsWith("data: ")) {
          try {
            const d = JSON.parse(line.slice(6));
            if (currentEvent === "complete") { benchComplete = d; break outer; }
            if (currentEvent === "error") errors.push(d.message);
          } catch { /* skip */ }
          currentEvent = "message";
        }
      }
    }
  } catch (err) {
    return res.status(502).json({ error: `Benchmark processing failed: ${err.message}`, errors });
  }

  if (!benchComplete) {
    return res.status(502).json({ error: "Benchmark stream ended without a complete event", errors });
  }

  // ---- Build response ------------------------------------------------------
  const safeNamed = namedInsured.replace(/[^a-zA-Z0-9 _-]/g, "").trim();
  const outputFilename = `${safeNamed}_LARI_benchmark.xlsx`;
  const summary = benchComplete.summary || {};

  return res.status(200).json({
    named_insured:    namedInsured,
    confidence:       identifyResult.confidence,
    source_file:      identifyResult.source_file,
    ready_for_chain:  true,
    chain_output: {
      output_file:          outputFilename,
      output_data_base64:   benchComplete.data,
      location_count:       summary.rows       || 0,
      fips_resolution_rate: summary.rows > 0 ? (summary.geocoded / summary.rows) : 0,
      fips_failed:          [],     // detailed list not available from benchmark summary
      naics_distribution:   {},     // not available from chain output currently
      processing_errors:    errors,
    },
    metadata: identifyResult.research_data || {},
  });
}

export const config = {
  maxDuration: 300,
  api: { bodyParser: { sizeLimit: '20mb' } },
};
