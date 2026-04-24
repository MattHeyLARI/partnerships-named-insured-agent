// api/chain.js — Vercel serverless function
// Orchestrates steps 2-4 of the partnerships chain via SSE.
//
// POST body (JSON):
//   {
//     sovBase64: string,           // base64-encoded SOV .xlsx
//     sovName: string,             // original filename
//     namedInsured: string,        // extracted named insured name
//     researchJson: object | null  // research data from /api/identify
//   }
//
// Response: text/event-stream
//   progress events: { step, message, pct }
//   error events:    { step, message }
//   complete events: { filename, data (base64), summary, workbook_metrics }

function sseWrite(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

async function consumeSseStream(response, onEvent) {
  /**
   * Reads an SSE stream from a fetch Response.
   * Calls onEvent(eventName, parsedData) for each event.
   * Returns when the stream ends.
   */
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let currentEvent = "message";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop(); // keep incomplete last line

    for (const line of lines) {
      if (line.startsWith("event: ")) {
        currentEvent = line.slice(7).trim();
      } else if (line.startsWith("data: ")) {
        const raw = line.slice(6).trim();
        try {
          const parsed = JSON.parse(raw);
          onEvent(currentEvent, parsed);
        } catch {
          // non-JSON data line — skip
        }
        currentEvent = "message"; // reset after data
      }
    }
  }
}

async function callLossResearch(researchJson, lossUrl) {
  const bypassSecret = process.env.LOSS_RESEARCH_BYPASS_SECRET;
  const headers = { "Content-Type": "application/json" };
  if (bypassSecret) headers["x-vercel-protection-bypass"] = bypassSecret;

  const res = await fetch(`${lossUrl}/api/research`, {
    method: "POST",
    headers,
    body: JSON.stringify(researchJson),
    signal: AbortSignal.timeout(65_000),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${errText.slice(0, 200)}`);
  }
  return res.json();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { sovBase64, sovName, namedInsured, researchJson } = req.body || {};

  if (!sovBase64 || !namedInsured) {
    return res.status(400).json({ error: "Missing sovBase64 or namedInsured" });
  }

  const SOV_URL     = process.env.PARTNERSHIPS_SOV_APP_URL;
  const NAICS_URL   = process.env.PARTNERSHIPS_NAICS_APP_URL;
  const BENCH_URL   = process.env.PARTNERSHIPS_BENCHMARK_APP_URL;
  const LOSS_URL    = process.env.PARTNERSHIPS_LOSS_RESEARCH_URL;

  if (!SOV_URL || !NAICS_URL || !BENCH_URL) {
    return res.status(500).json({ error: "One or more partnerships service URLs are not configured." });
  }

  // Switch to SSE
  res.setHeader("Content-Type",  "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection",    "keep-alive");
  res.flushHeaders();

  const send = (step, message, pct = null) => {
    sseWrite(res, "progress", { step, message, pct });
    console.log(`[chain:${step}] ${message}`);
  };

  const fail = (step, message) => {
    sseWrite(res, "error", { step, message });
    console.error(`[chain:${step}] ERROR: ${message}`);
    res.end();
  };

  // ---- Track B: loss research (parallel with Track A) ----------------------
  const lossPromise = LOSS_URL && researchJson
    ? callLossResearch(researchJson, LOSS_URL).catch(err => {
        console.error("[chain:loss] Error:", err.message);
        return null;
      })
    : Promise.resolve(null);
  send("loss", "Researching loss events in parallel…");

  try {
    // Convert SOV base64 back to Buffer
    const sovBuffer = Buffer.from(sovBase64, "base64");
    const sovFilename = sovName || "sov.xlsx";

    // ---- Step 2: partnerships-sov-app ----------------------------------------
    send("sov", "Processing Statement of Values…", 10);

    const sovForm = new FormData();
    sovForm.append("file", new Blob([sovBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), sovFilename);
    sovForm.append("clientName", namedInsured);
    sovForm.append("startingOE", "1");

    let lariBuffer;
    let lariFilename;
    try {
      const sovRes = await fetch(`${SOV_URL}/api/generate`, {
        method: "POST",
        body: sovForm,
        signal: AbortSignal.timeout(120_000),
      });
      if (!sovRes.ok) {
        const errText = await sovRes.text();
        let errMsg;
        try { errMsg = JSON.parse(errText).error; } catch { errMsg = errText.substring(0, 200); }
        return fail("sov", `SOV processing failed (HTTP ${sovRes.status}): ${errMsg}`);
      }
      const contentDisp = sovRes.headers.get("content-disposition") || "";
      const nameMatch = contentDisp.match(/filename="([^"]+)"/);
      lariFilename = nameMatch ? nameMatch[1] : `${namedInsured.replace(/[^a-zA-Z0-9]/g, "_")}_LARI_Workbook.xlsx`;
      lariBuffer = Buffer.from(await sovRes.arrayBuffer());
    } catch (err) {
      return fail("sov", `SOV app request failed: ${err.message}`);
    }

    send("sov", `SOV processed — ${lariFilename}`, 30);

    // ---- Step 3: partnerships-naics-app --------------------------------------
    send("naics", "Assigning NAICS codes…", 35);

    const naicsForm = new FormData();
    // research field: JSON file
    const researchStr = JSON.stringify(researchJson || { company_name: namedInsured });
    naicsForm.append("research", new Blob([researchStr], { type: "application/json" }), "research.json");
    naicsForm.append("workbook", new Blob([lariBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), lariFilename);

    let naicsBuffer;
    let naicsFilename;
    try {
      const naicsRes = await fetch(`${NAICS_URL}/assign-naics`, {
        method: "POST",
        body: naicsForm,
        signal: AbortSignal.timeout(240_000), // 4min — allows one 65s rate-limit retry
      });
      if (!naicsRes.ok) {
        const errText = await naicsRes.text();
        let errMsg;
        try { errMsg = JSON.parse(errText).error; } catch { errMsg = errText.substring(0, 200); }
        return fail("naics", `NAICS assignment failed (HTTP ${naicsRes.status}): ${errMsg}`);
      }
      naicsFilename = naicsRes.headers.get("x-output-filename") ||
        lariFilename.replace(/\.xlsx$/i, "_naics_assigned.xlsx");
      naicsBuffer = Buffer.from(await naicsRes.arrayBuffer());
    } catch (err) {
      return fail("naics", `NAICS app request failed: ${err.message}`);
    }

    send("naics", `NAICS codes assigned — ${naicsFilename}`, 55);

    // ---- Step 4: partnerships-benchmark-app (SSE) ----------------------------
    send("benchmark", "Running benchmark analysis…", 60);

    const benchForm = new FormData();
    benchForm.append("workbook", new Blob([naicsBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), naicsFilename);

    let benchRes;
    try {
      benchRes = await fetch(`${BENCH_URL}/assign-benchmark`, {
        method: "POST",
        body: benchForm,
        signal: AbortSignal.timeout(280_000),
      });
      if (!benchRes.ok) {
        const errText = await benchRes.text();
        let errMsg;
        try { errMsg = JSON.parse(errText).error; } catch { errMsg = errText.substring(0, 200); }
        return fail("benchmark", `Benchmark request failed (HTTP ${benchRes.status}): ${errMsg}`);
      }
    } catch (err) {
      return fail("benchmark", `Benchmark app request failed: ${err.message}`);
    }

    // Relay benchmark SSE events, collect the final complete payload
    let completePayload = null;
    try {
      await consumeSseStream(benchRes, (event, data) => {
        if (event === "progress") {
          const pct = data.pct != null ? 60 + Math.round(data.pct * 0.4) : null;
          send("benchmark", data.message || "", pct);
        } else if (event === "error") {
          // Will be caught below via completePayload being null
          sseWrite(res, "error", { step: "benchmark", message: data.message });
        } else if (event === "complete") {
          completePayload = data;
        }
      });
    } catch (err) {
      return fail("benchmark", `Error reading benchmark stream: ${err.message}`);
    }

    if (!completePayload) {
      return fail("benchmark", "Benchmark stream ended without a complete event.");
    }

    // ---- Await Track B (likely already resolved) ----------------------------
    const lossData = await lossPromise;

    // ---- Build final output filename ----------------------------------------
    const safeNamed = namedInsured.replace(/[^a-zA-Z0-9 _-]/g, "").trim();
    const finalFilename = `${safeNamed}_LARI_benchmark.xlsx`;

    // ---- Emit complete -------------------------------------------------------
    const summary = completePayload.summary || {};
    sseWrite(res, "complete", {
      filename: finalFilename,
      data: completePayload.data,       // base64 XLSX from benchmark app
      summary: {
        location_count:        summary.rows       || 0,
        fips_resolved:         summary.geocoded   || 0,
        fips_failed_count:     summary.unresolved || 0,
        fips_resolution_rate:  summary.rows > 0 ? (summary.geocoded / summary.rows) : 0,
      },
      workbook_metrics: completePayload.workbook_metrics ?? null,
      loss_research: lossData,
    });

    console.log(`[chain] Complete. Output: ${finalFilename}`);
  } catch (err) {
    console.error("[chain] Unhandled error:", err);
    sseWrite(res, "error", { step: "chain", message: `Internal error: ${err.message}` });
  }

  res.end();
}

export const config = {
  maxDuration: 300,
  api: { bodyParser: { sizeLimit: '20mb' } },
};
