import { useState, useRef, useCallback } from "react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function pct(n, d) {
  if (!d || d === 0) return "—";
  return `${Math.round((n / d) * 100)}%`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
const RiskBadge = ({ level }) => {
  const colors = { High: "#ff4444", Medium: "#ff8c00", Low: "#22c55e", None: "#6b7280" };
  return (
    <span style={{
      background: colors[level] || "#6b7280", color: "#fff",
      padding: "2px 10px", borderRadius: "20px", fontSize: "11px",
      fontWeight: "700", letterSpacing: "0.05em", textTransform: "uppercase"
    }}>{level || "Unknown"}</span>
  );
};

const ConfidenceBadge = ({ level }) => {
  const colors = { high: "#22c55e", medium: "#f59e0b", low: "#ef4444" };
  return (
    <span style={{
      background: colors[level?.toLowerCase()] ? `${colors[level.toLowerCase()]}22` : "rgba(255,255,255,0.06)",
      border: `1px solid ${colors[level?.toLowerCase()] || "rgba(255,255,255,0.1)"}`,
      color: colors[level?.toLowerCase()] || "#94a3b8",
      padding: "2px 10px", borderRadius: "20px", fontSize: "11px",
      fontWeight: "700", letterSpacing: "0.05em", textTransform: "uppercase"
    }}>{level || "—"}</span>
  );
};

const Flag = ({ active, label }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px",
    borderRadius: "8px",
    background: active ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.03)",
    border: `1px solid ${active ? "rgba(251,191,36,0.4)" : "rgba(255,255,255,0.08)"}`,
  }}>
    <span style={{ fontSize: "16px" }}>{active ? "🏷️" : "○"}</span>
    <span style={{ fontSize: "13px", color: active ? "#fbbf24" : "#9ca3af", fontWeight: active ? "600" : "400" }}>{label}</span>
  </div>
);

const Section = ({ title, children, icon }) => (
  <div style={{
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px", padding: "20px", marginBottom: "16px"
  }}>
    <h3 style={{ margin: "0 0 14px 0", fontSize: "13px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "8px" }}>
      {icon} {title}
    </h3>
    {children}
  </div>
);

const StatCard = ({ label, value, sub, accent }) => (
  <div style={{
    background: "rgba(0,0,0,0.25)", borderRadius: "10px", padding: "16px 20px",
    border: `1px solid ${accent ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.06)"}`,
    flex: "1", minWidth: "120px"
  }}>
    <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>{label}</div>
    <div style={{ fontSize: "20px", fontWeight: "700", color: accent ? "#818cf8" : "#e2e8f0" }}>{value}</div>
    {sub && <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>{sub}</div>}
  </div>
);

// SOV upload drop zone
const DropZone = ({ label, hint, accept, file, onFile, icon }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }, [onFile]);

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragging ? "rgba(99,102,241,0.6)" : file ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.12)"}`,
        borderRadius: "12px", padding: "20px 16px", textAlign: "center",
        cursor: "pointer",
        background: dragging ? "rgba(99,102,241,0.05)" : file ? "rgba(34,197,94,0.04)" : "rgba(255,255,255,0.02)",
        transition: "all 0.15s",
      }}
    >
      <input ref={inputRef} type="file" accept={accept} style={{ display: "none" }}
        onChange={e => { const f = e.target.files[0]; if (f) onFile(f); }} />
      <div style={{ fontSize: "24px", marginBottom: "8px" }}>{file ? "✅" : icon}</div>
      <div style={{ fontSize: "13px", fontWeight: "600", color: file ? "#86efac" : "#94a3b8", marginBottom: "4px" }}>{label}</div>
      {file ? (
        <div style={{ fontSize: "11px", color: "#22c55e", wordBreak: "break-all" }}>{file.name}</div>
      ) : (
        <div style={{ fontSize: "11px", color: "#475569" }}>{hint}</div>
      )}
    </div>
  );
};

// Step progress indicator
const ChainProgress = ({ steps, activeStep }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "24px" }}>
    {steps.map((s, i) => {
      const isDone = s.done;
      const isActive = s.key === activeStep;
      const isError = s.error;
      return (
        <div key={s.key} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%", margin: "0 auto 4px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", fontWeight: "700",
              background: isError ? "rgba(239,68,68,0.2)" : isDone ? "rgba(34,197,94,0.2)" : isActive ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.04)",
              border: `2px solid ${isError ? "rgba(239,68,68,0.5)" : isDone ? "rgba(34,197,94,0.5)" : isActive ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.1)"}`,
              color: isError ? "#fca5a5" : isDone ? "#86efac" : isActive ? "#818cf8" : "#475569",
              animation: isActive && !isDone ? "pulse 1.5s ease-in-out infinite" : "none",
            }}>
              {isError ? "✗" : isDone ? "✓" : i + 1}
            </div>
            <div style={{ fontSize: "10px", color: isError ? "#fca5a5" : isDone ? "#86efac" : isActive ? "#818cf8" : "#475569", fontWeight: "600", whiteSpace: "nowrap" }}>{s.label}</div>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1, height: "2px", margin: "0 6px",
              background: isDone ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.06)",
              marginBottom: "18px", transition: "background 0.3s"
            }} />
          )}
        </div>
      );
    })}
  </div>
);

// ---------------------------------------------------------------------------
// Main App
// ---------------------------------------------------------------------------
export default function PartnershipsNamedInsuredAgent() {
  // Input state
  const [namedInsured, setNamedInsured] = useState("");
  const [sovFile,      setSovFile]      = useState(null);
  const nameInputRef = useRef();

  // Workflow state
  const [phase,      setPhase]      = useState("upload"); // upload | running | done | error
  const [stepMsg,    setStepMsg]    = useState("");
  const [stepPct,    setStepPct]    = useState(0);
  const [activeStep, setActiveStep] = useState(null);
  const [chainSteps, setChainSteps] = useState([
    { key: "identify",  label: "Named Insured", done: false, error: false },
    { key: "sov",       label: "SOV",           done: false, error: false },
    { key: "naics",     label: "NAICS",         done: false, error: false },
    { key: "benchmark", label: "Benchmark",     done: false, error: false },
  ]);

  // Results state
  const [identifyResult, setIdentifyResult] = useState(null);
  const [chainSummary,   setChainSummary]   = useState(null);
  const [outputFile,     setOutputFile]     = useState(null);
  const [error,          setError]          = useState(null);
  const [activeTab,      setActiveTab]      = useState("named-insured");

  const markStep = (key, done, isError = false) => {
    setChainSteps(prev => prev.map(s => s.key === key ? { ...s, done, error: isError } : s));
  };

  const resetSteps = () => {
    setChainSteps([
      { key: "identify",  label: "Named Insured", done: false, error: false },
      { key: "sov",       label: "SOV",           done: false, error: false },
      { key: "naics",     label: "NAICS",         done: false, error: false },
      { key: "benchmark", label: "Benchmark",     done: false, error: false },
    ]);
  };

  const canRun = namedInsured.trim().length > 0 && sovFile !== null;

  const runWorkflow = async () => {
    if (!canRun) return;
    setPhase("running");
    setError(null);
    setIdentifyResult(null);
    setChainSummary(null);
    setOutputFile(null);
    resetSteps();
    setActiveTab("named-insured");

    try {
      // ---- Step 1: Research the named insured --------------------------------
      setActiveStep("identify");
      setStepMsg("Researching named insured…");
      setStepPct(5);

      const idRes = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: namedInsured.trim() }),
      });

      if (!idRes.ok) {
        const e = await idRes.json().catch(() => ({ error: `HTTP ${idRes.status}` }));
        throw new Error(`Research failed: ${e.error || e.message}`);
      }

      const idData = await idRes.json();
      setIdentifyResult(idData);
      markStep("identify", true);
      setStepMsg(`Identified: ${idData.named_insured}`);
      setStepPct(25);

      // ---- Convert SOV to base64 -------------------------------------------
      const sovBase64 = await fileToBase64(sovFile);

      // ---- Steps 2-4: Chain via SSE -----------------------------------------
      const chainRes = await fetch("/api/chain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sovBase64,
          sovName:     sovFile.name,
          namedInsured: idData.named_insured,
          researchJson: idData.research_data || null,
        }),
      });

      if (!chainRes.ok) {
        const e = await chainRes.json().catch(() => ({ error: `HTTP ${chainRes.status}` }));
        throw new Error(`Chain request failed: ${e.error}`);
      }

      // Read SSE stream
      const reader = chainRes.body.getReader();
      const decoder = new TextDecoder();
      let buf = "", currentEvent = "message";
      let finalComplete = null;
      let chainError = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop();

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            let data;
            try { data = JSON.parse(line.slice(6)); } catch { continue; }

            if (currentEvent === "progress") {
              const step = data.step;
              setActiveStep(step);
              setStepMsg(data.message || "");
              if (data.pct != null) setStepPct(data.pct);
              if (step === "naics")     markStep("sov", true);
              if (step === "benchmark") markStep("naics", true);
            } else if (currentEvent === "error") {
              chainError = data;
              markStep(data.step || "chain", false, true);
            } else if (currentEvent === "complete") {
              finalComplete = data;
            }
            currentEvent = "message";
          }
        }
      }

      if (chainError && !finalComplete) {
        throw new Error(`${chainError.step || "Chain"} step failed: ${chainError.message}`);
      }
      if (!finalComplete) {
        throw new Error("Chain completed without output.");
      }

      markStep("benchmark", true);
      setStepPct(100);

      // Build download URL from base64
      const binStr = atob(finalComplete.data);
      const bytes = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
      const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const dataUrl = URL.createObjectURL(blob);

      setOutputFile({ filename: finalComplete.filename, dataUrl });
      setChainSummary(finalComplete.summary);
      setPhase("done");
      setActiveTab("partnerships");

    } catch (err) {
      setError(err.message);
      setPhase("error");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && canRun && phase !== "running") runWorkflow();
  };

  const reset = () => {
    setPhase("upload");
    setNamedInsured("");
    setSovFile(null);
    setError(null);
    setIdentifyResult(null);
    setChainSummary(null);
    setOutputFile(null);
    setActiveTab("named-insured");
    resetSteps();
  };

  const tabs = [
    { key: "named-insured", label: "Named Insured Results" },
    { key: "partnerships",  label: "Partnerships Output" },
    { key: "technical",     label: "Technical Output" },
  ];

  const r  = identifyResult;
  const rd = r?.research_data;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0e1a 0%, #0d1530 50%, #0a0e1a 100%)",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: "#e2e8f0",
      padding: "40px 20px"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .tab-btn:hover { background: rgba(255,255,255,0.06) !important; }
        .action-btn:hover { opacity: 0.85 !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)",
              borderRadius: "100px", padding: "6px 16px",
              fontSize: "12px", color: "#818cf8", fontWeight: "600",
              letterSpacing: "0.06em", textTransform: "uppercase"
            }}>
              ⚡ AI-Powered Underwriting Intelligence
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)",
              borderRadius: "100px", padding: "6px 14px",
              fontSize: "11px", color: "#fbbf24", fontWeight: "700",
              letterSpacing: "0.06em", textTransform: "uppercase"
            }}>
              🔗 Partnerships Workflow
            </div>
          </div>
          <h1 style={{
            fontSize: "clamp(24px, 4vw, 40px)", fontWeight: "700", margin: "0 0 10px 0",
            background: "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: "1.15"
          }}>Named Insured Agent</h1>
          <p style={{ color: "#64748b", margin: 0, fontSize: "15px" }}>
            Enter the named insured and upload the SOV — the full partnerships chain runs automatically.
          </p>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* UPLOAD / INPUT PHASE                                                */}
        {/* ------------------------------------------------------------------ */}
        {(phase === "upload" || phase === "error") && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px", padding: "28px", marginBottom: "20px"
            }}>

              {/* Named insured text input */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
                  Named Insured
                </label>
                <div style={{
                  display: "flex", gap: "12px",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px", padding: "6px",
                }}>
                  <input
                    ref={nameInputRef}
                    value={namedInsured}
                    onChange={e => setNamedInsured(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. Wingstop, Marriott International, Prologis"
                    disabled={phase === "running"}
                    style={{
                      flex: 1, background: "transparent", border: "none", outline: "none",
                      color: "#e2e8f0", fontSize: "15px", padding: "10px 14px", fontFamily: "inherit"
                    }}
                  />
                </div>
                <div style={{ marginTop: "8px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {["Wingstop", "Marriott International", "Prologis", "Domino's Pizza"].map(ex => (
                    <button key={ex} onClick={() => setNamedInsured(ex)} style={{
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                      color: "#64748b", padding: "4px 12px", borderRadius: "6px",
                      fontSize: "11px", cursor: "pointer", fontFamily: "inherit"
                    }}>{ex}</button>
                  ))}
                </div>
              </div>

              {/* SOV file upload */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
                  Statement of Values (.xlsx)
                </label>
                <DropZone
                  label="Drop SOV file here or click to browse"
                  hint="The raw SOV workbook — passed through the full partnerships chain"
                  accept=".xlsx"
                  file={sovFile}
                  onFile={setSovFile}
                  icon="📊"
                />
              </div>

              {/* Run button */}
              <button
                onClick={runWorkflow}
                disabled={!canRun}
                style={{
                  width: "100%",
                  background: canRun
                    ? "linear-gradient(135deg, #6366f1, #4f46e5)"
                    : "rgba(99,102,241,0.2)",
                  color: canRun ? "#fff" : "#475569",
                  border: "none", borderRadius: "10px",
                  padding: "14px 24px", fontSize: "15px", fontWeight: "600",
                  cursor: canRun ? "pointer" : "not-allowed",
                  fontFamily: "inherit", transition: "opacity 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px"
                }}
              >
                🔗 Run Partnerships Workflow
              </button>
            </div>

            {error && (
              <div style={{
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: "12px", padding: "16px 20px", color: "#fca5a5", fontSize: "14px",
                marginBottom: "16px"
              }}>
                ⚠️ {error}
                <button onClick={() => setPhase("upload")} style={{ marginLeft: "12px", background: "none", border: "none", color: "#818cf8", cursor: "pointer", fontSize: "13px", fontFamily: "inherit", textDecoration: "underline" }}>Try again</button>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* RUNNING PHASE                                                       */}
        {/* ------------------------------------------------------------------ */}
        {phase === "running" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px", padding: "28px", marginBottom: "20px"
            }}>
              <ChainProgress steps={chainSteps} activeStep={activeStep} />
              <div style={{ textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                  <div style={{
                    width: "32px", height: "32px",
                    border: "3px solid rgba(99,102,241,0.3)", borderTopColor: "#6366f1",
                    borderRadius: "50%", animation: "spin 0.8s linear infinite"
                  }} />
                </div>
                <div style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "8px" }}>{stepMsg}</div>
                <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: "2px",
                    background: "linear-gradient(90deg, #6366f1, #4f46e5)",
                    width: `${stepPct}%`, transition: "width 0.5s ease"
                  }} />
                </div>
                <div style={{ fontSize: "12px", color: "#475569", marginTop: "8px" }}>{stepPct}%</div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* DONE PHASE                                                          */}
        {/* ------------------------------------------------------------------ */}
        {phase === "done" && r && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            {/* Company header */}
            <div style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(79,70,229,0.06))",
              border: "1px solid rgba(99,102,241,0.25)", borderRadius: "16px",
              padding: "24px", marginBottom: "20px",
              display: "flex", justifyContent: "space-between",
              alignItems: "flex-start", flexWrap: "wrap", gap: "16px"
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px", flexWrap: "wrap" }}>
                  <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: "#fff" }}>
                    {r.named_insured}
                  </h2>
                </div>
                <div style={{ fontSize: "13px", color: "#64748b", display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  {rd?.company_url && <a href={rd.company_url} target="_blank" rel="noreferrer" style={{ color: "#818cf8", textDecoration: "none" }}>🔗 {rd.company_url}</a>}
                  {rd?.headquarters?.city && <span>📍 {rd.headquarters.city}, {rd.headquarters.state}</span>}
                  {rd?.public_company?.is_public && <span>📈 {rd.public_company.exchange}: {rd.public_company.ticker}</span>}
                </div>
              </div>
              <button
                className="action-btn"
                onClick={reset}
                style={{
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#64748b", padding: "8px 14px", borderRadius: "8px", fontSize: "12px",
                  cursor: "pointer", fontFamily: "inherit", fontWeight: "600"
                }}
              >New Workflow</button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "4px", marginBottom: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "4px", border: "1px solid rgba(255,255,255,0.06)" }}>
              {tabs.map(t => (
                <button key={t.key} className="tab-btn" onClick={() => setActiveTab(t.key)} style={{
                  flex: 1,
                  background: activeTab === t.key ? "rgba(99,102,241,0.25)" : "transparent",
                  border: activeTab === t.key ? "1px solid rgba(99,102,241,0.4)" : "1px solid transparent",
                  color: activeTab === t.key ? "#818cf8" : "#64748b",
                  padding: "8px 4px", borderRadius: "7px", fontSize: "12px", fontWeight: "600",
                  cursor: "pointer", fontFamily: "inherit",
                  letterSpacing: "0.02em", transition: "all 0.15s", whiteSpace: "nowrap"
                }}>{t.label}</button>
              ))}
            </div>

            {/* ---- Tab 1: Named Insured Results ---- */}
            {activeTab === "named-insured" && (
              <div>
                {rd ? (
                  <>
                    <Section title="Business Description" icon="🏢">
                      <p style={{ margin: 0, lineHeight: "1.65", fontSize: "14px", color: "#cbd5e1" }}>{rd.business_description}</p>
                    </Section>

                    <Section title="Income Generation & BI Risk" icon="💰">
                      <p style={{ margin: "0 0 14px 0", lineHeight: "1.65", fontSize: "14px", color: "#cbd5e1" }}>{rd.income_generation?.summary}</p>
                      {rd.income_generation?.primary_sources?.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                          {rd.income_generation.primary_sources.map((s, i) => (
                            <span key={i} style={{ padding: "4px 12px", background: "rgba(255,255,255,0.06)", borderRadius: "20px", fontSize: "12px", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }}>{s}</span>
                          ))}
                        </div>
                      )}
                      <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "10px", padding: "16px", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                          <span style={{ fontSize: "13px", fontWeight: "700", color: "#94a3b8" }}>BI RISK EXPOSURE</span>
                          <RiskBadge level={rd.income_generation?.bi_risk_assessment?.risk_level} />
                        </div>
                        <p style={{ margin: "0 0 10px 0", fontSize: "13px", color: "#cbd5e1", lineHeight: "1.6" }}>{rd.income_generation?.bi_risk_assessment?.explanation}</p>
                        {rd.income_generation?.bi_risk_assessment?.bi_perils?.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {rd.income_generation.bi_risk_assessment.bi_perils.map((p, i) => (
                              <span key={i} style={{ padding: "3px 10px", background: "rgba(239,68,68,0.1)", borderRadius: "20px", fontSize: "11px", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.2)" }}>{p}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Section>

                    <Section title="Special Industry Flags" icon="🚩">
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <Flag active={rd.special_industry_flags?.is_hotel} label="Hotel / Hospitality" />
                        <Flag active={rd.special_industry_flags?.is_reit_or_real_estate_vehicle} label="REIT / Real Estate Vehicle" />
                        <Flag active={rd.special_industry_flags?.is_senior_living} label="Senior Living" />
                      </div>
                      {rd.special_industry_flags?.industry_notes && (
                        <p style={{ margin: "12px 0 0 0", fontSize: "13px", color: "#64748b", lineHeight: "1.6" }}>{rd.special_industry_flags.industry_notes}</p>
                      )}
                    </Section>

                    {rd.headquarters?.city && (
                      <Section title="Headquarters" icon="📍">
                        <div style={{ fontSize: "15px", color: "#cbd5e1" }}>
                          {rd.headquarters.address && <div>{rd.headquarters.address}</div>}
                          <div>{[rd.headquarters.city, rd.headquarters.state, rd.headquarters.zip].filter(Boolean).join(", ")}</div>
                          {rd.headquarters.country && rd.headquarters.country !== "United States" && <div>{rd.headquarters.country}</div>}
                        </div>
                      </Section>
                    )}

                    {rd.subsidiaries_and_brands?.length > 0 && (
                      <Section title={`Subsidiaries & Brands (${rd.subsidiaries_and_brands.length})`} icon="🔗">
                        <div style={{ display: "grid", gap: "8px" }}>
                          {rd.subsidiaries_and_brands.map((s, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 14px", background: "rgba(0,0,0,0.2)", borderRadius: "8px", gap: "12px" }}>
                              <div>
                                <div style={{ fontWeight: "600", fontSize: "14px", color: "#e2e8f0" }}>{s.name}</div>
                                {s.description && <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{s.description}</div>}
                              </div>
                              <span style={{ padding: "2px 10px", background: "rgba(99,102,241,0.1)", borderRadius: "20px", fontSize: "11px", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)", whiteSpace: "nowrap", flexShrink: 0 }}>{s.type}</span>
                            </div>
                          ))}
                        </div>
                      </Section>
                    )}

                    <Section title="Public Company" icon="📈">
                      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: rd.public_company?.latest_10k?.available ? "16px" : "0" }}>
                        {[
                          { label: "Public",   value: rd.public_company?.is_public ? "Yes" : "No" },
                          { label: "Exchange", value: rd.public_company?.exchange || "N/A" },
                          { label: "Ticker",   value: rd.public_company?.ticker   || "N/A" },
                        ].map((item, i) => (
                          <div key={i} style={{ background: "rgba(0,0,0,0.25)", borderRadius: "10px", padding: "12px 16px", border: "1px solid rgba(255,255,255,0.06)", minWidth: "90px" }}>
                            <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{item.label}</div>
                            <div style={{ fontSize: "15px", fontWeight: "700", color: "#e2e8f0" }}>{item.value}</div>
                          </div>
                        ))}
                      </div>
                      {rd.public_company?.latest_10k?.available && (
                        <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "10px", padding: "16px", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }}>
                            {[
                              { label: "Fiscal Year", value: rd.public_company.latest_10k.fiscal_year || "N/A" },
                              { label: "Revenue",     value: rd.public_company.latest_10k.key_financials?.revenue || "N/A" },
                              { label: "Net Income",  value: rd.public_company.latest_10k.key_financials?.net_income || "N/A" },
                            ].map((item, i) => (
                              <div key={i} style={{ flex: 1, minWidth: "100px" }}>
                                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{item.label}</div>
                                <div style={{ fontSize: "14px", fontWeight: "700", color: "#e2e8f0" }}>{item.value}</div>
                              </div>
                            ))}
                          </div>
                          <p style={{ margin: "0 0 10px 0", fontSize: "13px", color: "#cbd5e1", lineHeight: "1.65" }}>{rd.public_company.latest_10k.highlights}</p>
                          {rd.public_company.latest_10k.sec_filing_url && (
                            <a href={rd.public_company.latest_10k.sec_filing_url} target="_blank" rel="noreferrer" style={{ color: "#818cf8", fontSize: "13px", textDecoration: "none", fontWeight: "600" }}>
                              🔗 View SEC Filing →
                            </a>
                          )}
                        </div>
                      )}
                    </Section>

                    <Section title="Franchise" icon="🍔">
                      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "14px" }}>
                        <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: "10px", padding: "12px 16px", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Franchise Related</div>
                          <div style={{ fontSize: "15px", fontWeight: "700", color: "#e2e8f0" }}>{rd.franchise?.is_franchise_related ? "Yes" : "No"}</div>
                        </div>
                        {rd.franchise?.is_franchise_related && (
                          <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: "10px", padding: "12px 16px", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Role</div>
                            <div style={{ fontSize: "15px", fontWeight: "700", color: "#e2e8f0", textTransform: "capitalize" }}>{rd.franchise?.role}</div>
                          </div>
                        )}
                      </div>
                      {rd.franchise?.franchise_details && (
                        <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#cbd5e1", lineHeight: "1.65" }}>{rd.franchise.franchise_details}</p>
                      )}
                      {rd.franchise?.latest_performance && rd.franchise.latest_performance !== "null" && (
                        <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "10px", padding: "14px", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Latest Performance</div>
                          <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: "1.65" }}>{rd.franchise.latest_performance}</p>
                        </div>
                      )}
                    </Section>

                    <div style={{ marginTop: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", flexWrap: "wrap", gap: "8px" }}>
                      <span style={{ fontSize: "12px", color: "#475569" }}>
                        Research confidence: <span style={{ color: rd.data_confidence === "High" ? "#22c55e" : rd.data_confidence === "Medium" ? "#f59e0b" : "#ef4444", fontWeight: "700" }}>{rd.data_confidence}</span>
                      </span>
                      {rd.research_timestamp && (
                        <span style={{ fontSize: "11px", color: "#334155" }}>Researched {new Date(rd.research_timestamp).toLocaleString()}</span>
                      )}
                    </div>
                    {rd.research_notes && (
                      <p style={{ margin: "12px 0 0 0", fontSize: "12px", color: "#475569", lineHeight: "1.6", padding: "0 4px" }}>
                        ℹ️ {rd.research_notes}
                      </p>
                    )}
                  </>
                ) : (
                  <Section title="Research" icon="🔍">
                    <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Research data is not available.</p>
                  </Section>
                )}
              </div>
            )}

            {/* ---- Tab 2: Partnerships Output ---- */}
            {activeTab === "partnerships" && (
              <div>
                {outputFile && (
                  <div style={{
                    background: "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(16,185,129,0.05))",
                    border: "1px solid rgba(34,197,94,0.25)", borderRadius: "16px",
                    padding: "24px", marginBottom: "20px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    flexWrap: "wrap", gap: "16px"
                  }}>
                    <div>
                      <div style={{ fontSize: "13px", color: "#86efac", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Final Enriched Workbook Ready</div>
                      <div style={{ fontSize: "15px", color: "#e2e8f0", fontWeight: "600" }}>{outputFile.filename}</div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>LARI Values · Benchmark Comparison · LARI Modifiers</div>
                    </div>
                    <a
                      href={outputFile.dataUrl}
                      download={outputFile.filename}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "8px",
                        background: "linear-gradient(135deg, #22c55e, #16a34a)",
                        color: "#fff", textDecoration: "none",
                        padding: "12px 24px", borderRadius: "10px",
                        fontSize: "14px", fontWeight: "700", flexShrink: 0
                      }}
                    >
                      ↓ Download Workbook
                    </a>
                  </div>
                )}

                {chainSummary && (
                  <Section title="Processing Summary" icon="📊">
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
                      <StatCard label="Total Locations" value={chainSummary.rows ?? "—"} sub="processed through benchmark" />
                      <StatCard label="FIPS Resolved" value={`${chainSummary.geocoded ?? "—"} / ${chainSummary.rows ?? "—"}`} sub={chainSummary.rows > 0 ? `${pct(chainSummary.geocoded, chainSummary.rows)} resolution rate` : ""} accent />
                      <StatCard label="Unresolved" value={chainSummary.unresolved ?? "—"} sub="failed FIPS geocoding" />
                    </div>

                    {chainSummary.unresolved > 0 && (
                      <div style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: "10px", padding: "14px 16px" }}>
                        <div style={{ fontSize: "12px", color: "#fbbf24", fontWeight: "700", marginBottom: "6px" }}>
                          ⚠️ {chainSummary.unresolved} location{chainSummary.unresolved !== 1 ? "s" : ""} could not be geocoded
                        </div>
                        <div style={{ fontSize: "12px", color: "#92400e", lineHeight: "1.6" }}>
                          These rows will have null FIPS codes in the output. Check the Geocode Method column in the workbook for details.
                        </div>
                      </div>
                    )}
                  </Section>
                )}

                <Section title="Chain Execution" icon="🔗">
                  <div style={{ display: "grid", gap: "8px" }}>
                    {chainSteps.map((s) => (
                      <div key={s.key} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
                        <div style={{
                          width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "11px", fontWeight: "700",
                          background: s.error ? "rgba(239,68,68,0.2)" : s.done ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.04)",
                          border: `1px solid ${s.error ? "rgba(239,68,68,0.4)" : s.done ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)"}`,
                          color: s.error ? "#fca5a5" : s.done ? "#86efac" : "#475569",
                        }}>
                          {s.error ? "✗" : s.done ? "✓" : "·"}
                        </div>
                        <div style={{ fontSize: "14px", color: s.error ? "#fca5a5" : s.done ? "#e2e8f0" : "#64748b", fontWeight: s.done ? "500" : "400" }}>{s.label}</div>
                        {s.error && <span style={{ fontSize: "11px", color: "#ef4444", marginLeft: "auto" }}>Failed</span>}
                        {s.done && <span style={{ fontSize: "11px", color: "#22c55e", marginLeft: "auto" }}>Complete</span>}
                      </div>
                    ))}
                  </div>
                </Section>
              </div>
            )}

            {/* ---- Tab 3: Technical Output ---- */}
            {activeTab === "technical" && (
              <div>
                <div style={{
                  background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)",
                  borderRadius: "10px", padding: "12px 16px", marginBottom: "16px",
                  fontSize: "12px", color: "#92400e"
                }}>
                  ℹ️ Raw technical output for debugging and integration. Not part of the primary workflow.
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px", gap: "8px" }}>
                  <button
                    className="action-btn"
                    onClick={() => navigator.clipboard.writeText(JSON.stringify({ identifyResult, chainSummary }, null, 2))}
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#94a3b8", padding: "7px 14px", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", fontWeight: "600" }}
                  >Copy JSON</button>
                </div>
                <pre style={{
                  background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "12px", padding: "20px", overflowX: "auto",
                  fontSize: "12px", lineHeight: "1.7", color: "#94a3b8",
                  fontFamily: "'DM Mono', 'Fira Code', monospace",
                  whiteSpace: "pre-wrap", wordBreak: "break-word"
                }}>
                  {JSON.stringify({ identifyResult, chainSummary }, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
