import { useState, useRef, useCallback } from "react";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const C = {
  darkNavy:        "#1A1D6E",
  deepBlue:        "#2B2FBF",
  brightBlue:      "#4B54E0",
  orange:          "#F5A623",
  orangeDark:      "#E09515",
  lightBlue:       "#7BA7D4",
  lavender:        "#A0A8D8",
  w100:            "#FFFFFF",
  w80:             "rgba(255,255,255,0.8)",
  w60:             "rgba(255,255,255,0.6)",
  w40:             "rgba(255,255,255,0.4)",
  w20:             "rgba(255,255,255,0.2)",
  w10:             "rgba(255,255,255,0.1)",
  cardStd:         "rgba(123,167,212,0.25)",
  cardStdBorder:   "rgba(123,167,212,0.4)",
  cardMuted:       "rgba(160,168,216,0.2)",
  cardMutedBorder: "rgba(160,168,216,0.3)",
  gradientBg:      "linear-gradient(135deg, #1A1D6E 0%, #2B2FBF 40%, #4B54E0 100%)",
};
const F = { heading: "'Exo', sans-serif", body: "'Inter', sans-serif" };

// ─── LARI Logo ─────────────────────────────────────────────────────────────────
// NOTE ON LOGO ASSETS:
//   logo.png            — white nodes on white background; cannot be used directly on
//                         dark blue (mix-blend-mode:multiply would erase the white nodes).
//   logo_darkblue_no_bg — transparent PNG but dark navy elements vanish on dark navy nav.
//   BetaLogo.svg        — transparent background, white wordmark, designed for dark
//                         backgrounds. Used here with the BETA badge removed per brand guide.
const LariLogo = () => (
  <svg width="130" height="46" viewBox="0 0 310 111" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="LARI">
    {/* Orange accent node */}
    <path d="M87.3391 33.6611C92.7284 33.6611 97.0972 29.2923 97.0972 23.9031C97.0972 18.5139 92.7284 14.145 87.3391 14.145C81.9499 14.145 77.5811 18.5139 77.5811 23.9031C77.5811 29.2923 81.9499 33.6611 87.3391 33.6611Z" fill="#F5A623"/>
    {/* Network icon */}
    <path d="M102.097 45.2742C98.2258 45.2742 94.9194 47.5322 93.3064 50.758L69.4355 41.3226L60.4032 18.9032C63.871 17.3709 66.2097 13.9838 66.2097 9.95159C66.2903 4.62901 61.8548 0.27417 56.5323 0.27417C51.2097 0.27417 46.7742 4.62901 46.7742 10.0322C46.7742 13.8226 48.9516 17.129 52.0968 18.7419L46.6129 32.3709L35 27.6935C35.4839 26.5645 35.7258 25.2742 35.7258 23.9032C35.7258 18.5 31.371 14.1451 25.9677 14.1451C20.5645 14.1451 16.2097 18.5 16.2097 23.9032C16.2097 29.3064 20.5645 33.6613 25.9677 33.6613C28.2258 33.6613 30.3226 32.8548 32.0161 31.5645L42.7419 42.0484L37.7419 54.629H19.4355C19.1935 49.4677 14.9194 45.3548 9.67742 45.3548C4.35484 45.2742 0 49.629 0 55.0322C0 60.4355 4.35484 64.7903 9.75806 64.7903C15 64.7903 19.2742 60.6774 19.5161 55.5161H37.4194L29.0323 76.2419C28.0645 75.9193 27.0968 75.758 25.9677 75.758C20.5645 75.758 16.2097 80.1129 16.2097 85.5161C16.2097 90.9193 20.5645 95.2742 25.9677 95.2742C31.371 95.2742 35.7258 90.9193 35.7258 85.5161C35.7258 84.3064 35.4839 83.0968 35.0806 81.9677L56.0484 73.8226V90.5968C50.8871 90.8387 46.7742 95.1129 46.7742 100.274C46.7742 105.677 51.129 110.032 56.5323 110.032C61.9355 110.032 66.2903 105.677 66.2903 100.274C66.2903 95.0322 62.1774 90.758 57.0161 90.5161V73.5L70.1613 68.4193L80.5645 78.5C78.7903 80.2742 77.6613 82.6935 77.6613 85.4355C77.6613 90.8387 82.0161 95.1935 87.4194 95.1935C92.8226 95.1935 97.1774 90.8387 97.1774 85.4355C97.1774 80.0322 92.8226 75.6774 87.4194 75.6774C86.0484 75.6774 84.8387 75.9193 83.629 76.4032L79.0323 64.8709L93.5484 59.2258C95.1613 62.3709 98.4677 64.5484 102.258 64.5484C107.661 64.5484 112.016 60.1935 112.016 54.7903C112.016 49.3871 107.5 45.2742 102.097 45.2742ZM92.9839 51.5645C92.6613 52.5322 92.4194 53.5 92.3387 54.5484H74.7581L69.9194 42.3709L92.9839 51.5645ZM56.0484 45.2742C53.7097 45.3548 51.6129 46.3226 49.9194 47.7742L43.7097 41.8064L47.0968 33.4193L56.0484 36.9677V45.2742ZM66.2097 55.4355H74.1129L77.7419 64.5484L70.2419 67.4516L63.9516 61.3226C65.3226 59.7097 66.129 57.6935 66.2097 55.4355ZM66.2097 54.5484C65.9677 49.5484 61.9355 45.4355 56.9355 45.2742V37.2903L68.7097 41.9677L73.7903 54.5484H66.2097ZM68.3064 40.8387L56.9355 36.3226V19.7097C57.9032 19.629 58.7903 19.4677 59.5968 19.2258L68.3064 40.8387ZM52.9032 19.0645C53.871 19.4677 54.9194 19.7097 56.0484 19.7097V36L47.4194 32.6129L52.9032 19.0645ZM32.6613 31C33.4677 30.2742 34.1129 29.3871 34.5968 28.5L46.2903 33.0968L43.0645 41.0806L32.6613 31ZM43.4677 42.6935L49.3548 48.4193C47.8226 50.0322 46.8548 52.2097 46.7742 54.629H38.7097L43.4677 42.6935ZM38.3065 55.4355H46.7742C46.8548 57.7742 47.8226 59.9516 49.2742 61.5645L32.5806 78.3387C31.7742 77.6129 30.8871 77.0484 29.8387 76.5645L38.3065 55.4355ZM34.7581 81.1613C34.3548 80.3548 33.7903 79.5484 33.2258 78.9032L50 62.129C51.6129 63.6613 53.7903 64.629 56.129 64.7097V72.9355L34.7581 81.1613ZM56.9355 72.6129V64.7097C59.4355 64.629 61.6935 63.5806 63.3065 61.8871L69.3548 67.6935L56.9355 72.6129ZM82.7419 76.8871C82.0161 77.2903 81.371 77.6935 80.8064 78.258L81.129 77.9355L70.9677 68.0967L78.1452 65.3548L82.7419 76.8871ZM78.629 64.2258L75.0806 55.4355H92.4194C92.5 56.5645 92.7419 57.6129 93.0645 58.5806L78.629 64.2258Z" fill="white"/>
    {/* L */}
    <path d="M139.355 85.4355C136.935 83.3387 135.726 79.7903 135.726 74.7903V20.2742H143.145V73.8226C143.145 76.8871 143.871 78.9032 145.242 80.1129C146.693 81.2419 148.548 81.8064 150.968 81.8064H175.484V88.5806H149.435C145.08 88.5 141.774 87.5322 139.355 85.4355Z" fill="white"/>
    {/* A */}
    <path d="M203.951 20.2742H213.386L236.774 88.5H229.193L222.338 68.9838H194.919L188.225 88.5H180.645L203.951 20.2742ZM220.483 62.3709L208.709 26.7258L196.774 62.3709H220.483Z" fill="white"/>
    {/* R */}
    <path d="M246.612 20.2742H273.467C278.79 20.2742 283.064 21.7258 286.29 24.5484C289.516 27.3709 291.128 32.6935 291.128 40.4355C291.128 47.0484 289.919 51.7258 287.419 54.4677C284.919 57.2097 281.854 58.9032 278.145 59.629L292.177 88.5806H284.677L271.451 60.6774L266.37 60.5968L254.032 60.2742V88.5806H246.612V20.2742ZM272.419 54.5484C276.048 54.5484 278.87 53.5806 280.886 51.5645C282.903 49.5484 283.87 45.8387 283.87 40.3548C283.87 35.1935 282.822 31.6451 280.806 29.7097C278.79 27.8548 275.967 26.8871 272.338 26.8871H254.032V54.5484H272.419Z" fill="white"/>
    {/* I */}
    <path d="M302.58 20.5161H309.999V88.7419H302.58V20.5161Z" fill="white"/>
  </svg>
);

// ─── Network / node decorative motif ──────────────────────────────────────────
const NetworkMotif = () => {
  const nodes = [
    [70,60],[200,30],[350,80],[500,40],[640,70],
    [130,190],[270,160],[420,210],[560,180],[700,200],
    [160,340],[310,310],[460,360],[610,330],[750,350],
    [780,80],[880,180],[840,320],[950,120],[980,280],
    [1060,60],[1120,190],[1050,320],[1200,100],[1230,260],
    [1310,160],[1350,310],[40,290],[700,440],
  ];
  const edges = [
    [0,1],[0,5],[1,2],[1,6],[2,3],[2,6],[2,7],[3,4],[3,7],[3,8],
    [4,8],[4,15],[5,6],[5,10],[6,7],[6,11],[7,8],[7,11],[7,12],
    [8,9],[8,12],[9,12],[9,13],[10,11],[11,12],[12,13],[13,14],
    [9,16],[14,17],[15,18],[15,20],[16,17],[16,19],[16,21],
    [17,19],[17,22],[18,20],[18,23],[19,21],[19,24],[20,21],
    [21,22],[21,24],[22,23],[22,24],[23,25],[24,26],[25,26],
    [27,5],[27,10],[28,12],[28,13],[28,14],
  ];
  return (
    <svg
      viewBox="0 0 1400 480"
      preserveAspectRatio="xMidYMid slice"
      style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {edges.map(([a,b],i) => (
        <line key={i}
          x1={nodes[a][0]} y1={nodes[a][1]}
          x2={nodes[b][0]} y2={nodes[b][1]}
          stroke="white" strokeWidth="1" opacity="0.12"
        />
      ))}
      {nodes.map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="4" fill="white" opacity="0.18"/>
      ))}
    </svg>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function pct(n, d) {
  if (!d || d === 0) return "—";
  return `${Math.round((n / d) * 100)}%`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
const RiskBadge = ({ level }) => {
  const map = {
    High:   { bg: `${C.orange}22`,    border: C.orange,    color: C.orange    },
    Medium: { bg: `${C.lightBlue}22`, border: C.lightBlue, color: C.lightBlue },
    Low:    { bg: `${C.lavender}22`,  border: C.lavender,  color: C.lavender  },
    None:   { bg: C.w10,              border: C.w20,        color: C.w40       },
  };
  const s = map[level] || map.None;
  return (
    <span style={{
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
      padding: "2px 10px", borderRadius: "20px", fontSize: "11px",
      fontWeight: "700", letterSpacing: "0.05em", textTransform: "uppercase",
      fontFamily: F.body,
    }}>{level || "Unknown"}</span>
  );
};

const ConfidenceBadge = ({ level }) => {
  const map = {
    high:   { bg: `${C.orange}22`,    border: C.orange,    color: C.orange    },
    medium: { bg: `${C.lightBlue}22`, border: C.lightBlue, color: C.lightBlue },
    low:    { bg: `${C.lavender}22`,  border: C.lavender,  color: C.lavender  },
  };
  const s = map[level?.toLowerCase()] || { bg: C.w10, border: C.w20, color: C.w40 };
  return (
    <span style={{
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
      padding: "2px 10px", borderRadius: "20px", fontSize: "11px",
      fontWeight: "700", letterSpacing: "0.05em", textTransform: "uppercase",
      fontFamily: F.body,
    }}>{level || "—"}</span>
  );
};

const Flag = ({ active, label }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px",
    borderRadius: "8px",
    background: active ? `${C.orange}18` : C.w10,
    border: `1px solid ${active ? `${C.orange}55` : C.w20}`,
  }}>
    <span style={{ fontSize: "15px" }}>{active ? "🏷️" : "○"}</span>
    <span style={{ fontSize: "13px", fontFamily: F.body, color: active ? C.orange : C.w40, fontWeight: active ? "600" : "400" }}>{label}</span>
  </div>
);

// Standard card panel (light-blue style). accentTitle uses orange title + left border.
const Section = ({ title, children, icon, accentTitle }) => (
  <div style={{
    background: C.cardStd, border: `1px solid ${C.cardStdBorder}`,
    borderRadius: "16px", padding: "20px", marginBottom: "16px",
    ...(accentTitle ? { borderLeft: `3px solid ${C.orange}` } : {}),
  }}>
    <h3 style={{
      margin: "0 0 14px 0", fontSize: "13px", fontWeight: "600",
      color: accentTitle ? C.orange : C.lightBlue,
      textTransform: "uppercase", letterSpacing: "0.08em",
      display: "flex", alignItems: "center", gap: "8px",
      fontFamily: F.heading,
    }}>
      {icon} {title}
    </h3>
    {children}
  </div>
);

// Loss event relevance → colour mapping
const LOSS_RELEVANCE = {
  high:   { color: C.orange,    label: "High Relevance"   },
  medium: { color: C.lightBlue, label: "Medium Relevance" },
  low:    { color: C.lavender,  label: "Low Relevance"    },
};
const LOSS_EVENT_TYPES = {
  fire:                "🔥 Fire",
  flood:               "🌊 Flood",
  storm:               "⛈️ Storm",
  earthquake:          "🌎 Earthquake",
  theft:               "🔒 Theft",
  equipment_breakdown: "⚙️ Equipment Breakdown",
  pandemic:            "🦠 Pandemic",
  other:               "📋 Other",
};
const LossEventCard = ({ event }) => {
  const rel = LOSS_RELEVANCE[event.relevance?.toLowerCase()] || { color: C.w40, label: event.relevance || "Unknown" };
  const typeLabel = LOSS_EVENT_TYPES[event.event_type?.toLowerCase()] || `📋 ${event.event_type || "Unknown"}`;
  return (
    <div style={{
      background: C.cardStd, border: `1px solid ${C.cardStdBorder}`,
      borderRadius: "12px", padding: "16px 20px", marginBottom: "10px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontWeight: "600", fontSize: "14px", fontFamily: F.body, color: C.w100 }}>{event.date}</span>
          <span style={{
            padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
            color: rel.color, border: `1px solid ${rel.color}55`, background: `${rel.color}18`,
            fontFamily: F.body, textTransform: "uppercase", letterSpacing: "0.04em",
          }}>{rel.label}</span>
        </div>
        <span style={{ fontSize: "12px", color: C.w60, fontFamily: F.body, whiteSpace: "nowrap" }}>{typeLabel}</span>
      </div>
      {event.location && (
        <div style={{ fontSize: "12px", color: C.lightBlue, fontFamily: F.body, marginBottom: "6px" }}>📍 {event.location}</div>
      )}
      <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: C.w80, lineHeight: "1.65", fontFamily: F.body }}>{event.description}</p>
      {event.source_url && (
        <a href={event.source_url} target="_blank" rel="noopener noreferrer" style={{
          color: C.lightBlue, fontSize: "12px", fontFamily: F.body, fontWeight: "600", textDecoration: "none",
        }}>🔗 {event.source_name || "Source"} →</a>
      )}
    </div>
  );
};

const StatCard = ({ label, value, sub, accent }) => (
  <div style={{
    background: accent ? `${C.orange}18` : C.cardStd,
    border: `1px solid ${accent ? `${C.orange}55` : C.cardStdBorder}`,
    borderRadius: "16px", padding: "20px 24px", flex: "1", minWidth: "120px",
  }}>
    <div style={{ fontSize: "11px", color: accent ? C.orange : C.lightBlue, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px", fontFamily: F.body }}>{label}</div>
    <div style={{ fontSize: "24px", fontWeight: "700", color: accent ? C.orange : C.w100, fontFamily: F.heading }}>{value}</div>
    {sub && <div style={{ fontSize: "12px", color: C.w60, marginTop: "4px", fontFamily: F.body }}>{sub}</div>}
  </div>
);

// SOV upload drop zone
const DropZone = ({ label, hint, accept, file, onFile, icon }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();
  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0]; if (f) onFile(f);
  }, [onFile]);

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragging ? C.orange : file ? "#22c55e" : C.w40}`,
        borderRadius: "16px", padding: "24px 16px", textAlign: "center", cursor: "pointer",
        background: dragging ? `${C.orange}0a` : file ? "rgba(34,197,94,0.06)" : C.w10,
        transition: "all 0.15s",
      }}
    >
      <input ref={inputRef} type="file" accept={accept} style={{ display: "none" }}
        onChange={e => { const f = e.target.files[0]; if (f) onFile(f); }} />
      <div style={{ fontSize: "24px", marginBottom: "8px" }}>{file ? "✅" : icon}</div>
      <div style={{ fontSize: "13px", fontWeight: "600", fontFamily: F.body, color: file ? "#86efac" : C.w60, marginBottom: "4px" }}>{label}</div>
      {file
        ? <div style={{ fontSize: "11px", color: "#86efac", wordBreak: "break-all", fontFamily: F.body }}>{file.name}</div>
        : <div style={{ fontSize: "11px", color: C.w40, fontFamily: F.body }}>{hint}</div>
      }
    </div>
  );
};

// Chain step progress indicator
const ChainProgress = ({ steps, activeStep }) => (
  <div style={{ display: "flex", alignItems: "center", marginBottom: "28px" }}>
    {steps.map((s, i) => {
      const isDone   = s.done;
      const isActive = s.key === activeStep && !isDone;
      const isError  = s.error;
      return (
        <div key={s.key} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{
              width: "34px", height: "34px", borderRadius: "50%", margin: "0 auto 6px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", fontWeight: "700", fontFamily: F.body,
              background: isError  ? "rgba(239,68,68,0.15)"   :
                          isDone   ? `${C.orange}25`           :
                          isActive ? C.w20                     : "transparent",
              border: `2px solid ${isError  ? "rgba(239,68,68,0.5)"   :
                                   isDone   ? C.orange                :
                                   isActive ? C.w100                  : C.w40}`,
              color:  isError  ? "#fca5a5" :
                      isDone   ? C.orange  :
                      isActive ? C.w100   : C.w40,
              animation: isActive ? "pulse 1.5s ease-in-out infinite" : "none",
            }}>
              {isError ? "✗" : isDone ? "✓" : i + 1}
            </div>
            <div style={{
              fontSize: "10px", fontWeight: "600", fontFamily: F.body, whiteSpace: "nowrap",
              color: isError ? "#fca5a5" : isDone ? C.orange : isActive ? C.w100 : C.w40,
            }}>{s.label}</div>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1, height: "2px", margin: "0 6px", marginBottom: "18px",
              background: isDone ? `${C.orange}60` : C.w20,
              transition: "background 0.4s",
            }} />
          )}
        </div>
      );
    })}
  </div>
);

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function PartnershipsNamedInsuredAgent() {
  // Input state
  const [namedInsured, setNamedInsured] = useState("");
  const [sovFile,      setSovFile]      = useState(null);
  const nameInputRef = useRef();

  // Workflow state
  const [phase,      setPhase]      = useState("upload");
  const [stepMsg,    setStepMsg]    = useState("");
  const [stepPct,    setStepPct]    = useState(0);
  const [activeStep, setActiveStep] = useState(null);
  const [chainSteps, setChainSteps] = useState([
    { key: "identify",  label: "Named Insured", done: false, error: false },
    { key: "sov",       label: "SOV",           done: false, error: false },
    { key: "naics",     label: "NAICS",         done: false, error: false },
    { key: "benchmark", label: "Benchmark",     done: false, error: false },
    { key: "loss",      label: "Loss Events",   done: false, error: false },
  ]);

  // Results state
  const [identifyResult,   setIdentifyResult]   = useState(null);
  const [chainSummary,     setChainSummary]     = useState(null);
  const [workbookMetrics,  setWorkbookMetrics]  = useState(null);
  const [outputFile,       setOutputFile]       = useState(null);
  const [error,          setError]          = useState(null);
  const [activeTab,      setActiveTab]      = useState("named-insured");

  // Loss event research state
  const [lossEventsData,   setLossEventsData]   = useState(null);   // { loss_events, loss_event_search }
  const [lossEventsPhase,  setLossEventsPhase]  = useState("idle"); // idle | loading | done | error
  const [lossEventsError,  setLossEventsError]  = useState(null);
  // Ref used to invalidate in-flight searches when user resets
  const lossEventSearchRef = useRef(0);

  const markStep = (key, done, isError = false) =>
    setChainSteps(prev => prev.map(s => s.key === key ? { ...s, done, error: isError } : s));

  const resetSteps = () => setChainSteps([
    { key: "identify",  label: "Named Insured", done: false, error: false },
    { key: "sov",       label: "SOV",           done: false, error: false },
    { key: "naics",     label: "NAICS",         done: false, error: false },
    { key: "benchmark", label: "Benchmark",     done: false, error: false },
    { key: "loss",      label: "Loss Events",   done: false, error: false },
  ]);

  const canRun = namedInsured.trim().length > 0 && sovFile !== null;

  const runWorkflow = async () => {
    if (!canRun) return;
    setPhase("running"); setError(null); setIdentifyResult(null);
    setChainSummary(null); setWorkbookMetrics(null); setOutputFile(null);
    setLossEventsData(null); setLossEventsPhase("idle"); setLossEventsError(null);
    resetSteps(); setActiveTab("named-insured");

    try {
      setActiveStep("identify"); setStepMsg("Researching named insured…"); setStepPct(5);

      const idRes = await fetch("/api/identify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: namedInsured.trim() }),
      });
      if (!idRes.ok) {
        const e = await idRes.json().catch(() => ({ error: `HTTP ${idRes.status}` }));
        throw new Error(`Research failed: ${e.error || e.message}`);
      }
      const idData = await idRes.json();
      setIdentifyResult(idData); markStep("identify", true);
      setStepMsg(`Identified: ${idData.named_insured}`); setStepPct(25);

      // Start loss event research in parallel with chain — awaited before report renders
      lossEventSearchRef.current += 1;
      const thisWorkflow = lossEventSearchRef.current;
      setLossEventsPhase("loading"); setLossEventsData(null); setLossEventsError(null);
      const lossEventsPromise = fetch("/api/loss-events", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: idData.named_insured,
          url:  idData.research_data?.company_url || null,
        }),
      }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }).catch(err => ({ _fetchError: err.message }));

      const sovBase64 = await fileToBase64(sovFile);

      const chainRes = await fetch("/api/chain", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sovBase64, sovName: sovFile.name,
          namedInsured: idData.named_insured,
          researchJson: idData.research_data || null,
        }),
      });
      if (!chainRes.ok) {
        const e = await chainRes.json().catch(() => ({ error: `HTTP ${chainRes.status}` }));
        throw new Error(`Chain request failed: ${e.error}`);
      }

      const reader = chainRes.body.getReader();
      const decoder = new TextDecoder();
      let buf = "", currentEvent = "message";
      let finalComplete = null, chainError = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n"); buf = lines.pop();
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            let data; try { data = JSON.parse(line.slice(6)); } catch { continue; }
            if (currentEvent === "progress") {
              const step = data.step; setActiveStep(step);
              setStepMsg(data.message || "");
              if (data.pct != null) setStepPct(data.pct);
              if (step === "naics")     markStep("sov", true);
              if (step === "benchmark") markStep("naics", true);
            } else if (currentEvent === "error") {
              chainError = data; markStep(data.step || "chain", false, true);
            } else if (currentEvent === "complete") {
              finalComplete = data;
            }
            currentEvent = "message";
          }
        }
      }

      if (chainError && !finalComplete) throw new Error(`${chainError.step || "Chain"} step failed: ${chainError.message}`);
      if (!finalComplete) throw new Error("Chain completed without output.");

      markStep("benchmark", true);

      const binStr = atob(finalComplete.data);
      const bytes = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
      const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      setOutputFile({ filename: finalComplete.filename, dataUrl: URL.createObjectURL(blob) });
      setChainSummary(finalComplete.summary);
      setWorkbookMetrics(finalComplete.workbook_metrics ?? null);

      // Await loss event research before showing the report
      setActiveStep("loss"); setStepMsg("Completing loss event research…"); setStepPct(98);
      const lossResult = await lossEventsPromise;
      if (lossEventSearchRef.current !== thisWorkflow) return; // user reset mid-run
      if (lossResult?._fetchError || lossResult?.loss_event_search?.error) {
        setLossEventsError(lossResult._fetchError || lossResult.loss_event_search?.error);
        setLossEventsPhase("error");
        markStep("loss", false, true);
      } else {
        setLossEventsData(lossResult);
        setLossEventsPhase("done");
        markStep("loss", true);
      }

      setStepPct(100);
      setPhase("done"); setActiveTab("partnerships");

    } catch (err) {
      setError(err.message); setPhase("error");
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && canRun && phase !== "running") runWorkflow(); };

  const reset = () => {
    lossEventSearchRef.current += 1; // invalidate any in-flight loss event search
    setPhase("upload"); setNamedInsured(""); setSovFile(null); setError(null);
    setIdentifyResult(null); setChainSummary(null); setWorkbookMetrics(null); setOutputFile(null);
    setLossEventsData(null); setLossEventsPhase("idle"); setLossEventsError(null);
    setActiveTab("named-insured"); resetSteps();
  };

  const tabs = [
    { key: "named-insured", label: "Insured Business Summary" },
    { key: "partnerships",  label: "Analysis Output"        },
    { key: "technical",     label: "Technical Output"      },
  ];

  const r  = identifyResult;
  const rd = r?.research_data;

  return (
    <div style={{ minHeight: "100vh", background: C.gradientBg, fontFamily: F.body, color: C.w100 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.w20}; border-radius: 2px; }
        .ghost-btn:hover { background: ${C.w10} !important; }
        .orange-btn:hover { background: ${C.orangeDark} !important; }
        .tab-btn { background: transparent; border: none; border-bottom: 3px solid transparent; cursor: pointer; transition: all 0.15s; }
        .tab-btn:hover { color: ${C.w100} !important; }
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse  { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        input::placeholder { color: ${C.w40}; }
        input:focus { outline: none; border-color: ${C.orange} !important; }
      `}</style>

      {/* ── Nav bar ─────────────────────────────────────────────────────────── */}
      <nav style={{
        background: C.darkNavy, padding: "0 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: "64px", flexShrink: 0,
      }}>
        {/* Logo — clear space equal to height of "L" on all sides (~8px) */}
        <div style={{ display: "flex", alignItems: "center", padding: "8px 0" }}>
          <LariLogo />
        </div>
        {/* Partnerships Workflow badge */}
        <div style={{
          background: `${C.orange}22`, border: `1px solid ${C.orange}66`,
          borderRadius: "20px", padding: "5px 14px",
          fontSize: "11px", color: C.orange, fontWeight: "700",
          letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: F.body,
        }}>
          🔗 Partnerships Workflow
        </div>
      </nav>

      {/* ── Page content ────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "80px 24px" }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: C.w10, border: `1px solid ${C.w20}`,
            borderRadius: "100px", padding: "6px 16px", marginBottom: "20px",
            fontSize: "12px", color: C.w60, fontWeight: "500",
            letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: F.body,
          }}>
            ⚡ BI Underwriting Intelligence
          </div>
          <h1 style={{
            fontSize: "clamp(28px, 4vw, 48px)", fontWeight: "700", margin: "0 0 12px 0",
            fontFamily: F.heading, color: C.w100, lineHeight: "1.15",
          }}>LARI Automated Analysis Tool</h1>
          <p style={{ color: C.w60, margin: 0, fontSize: "16px", fontFamily: F.body }}>
            Enter the named insured and upload the SOV — produce business interruption intel and LARI analysis workbook.
          </p>
        </div>

        {/* ── UPLOAD / ERROR PHASE ─────────────────────────────────────────── */}
        {(phase === "upload" || phase === "error") && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            {/* Upload card — standard light-blue style, with network motif */}
            <div style={{
              position: "relative", overflow: "hidden",
              background: C.cardStd, border: `1px solid ${C.cardStdBorder}`,
              borderRadius: "16px", padding: "40px 32px", marginBottom: "20px",
            }}>
              <NetworkMotif />
              <div style={{ position: "relative", zIndex: 1 }}>

                {/* Named insured input */}
                <div style={{ marginBottom: "24px" }}>
                  <label style={{
                    display: "block", fontSize: "13px", fontWeight: "600",
                    color: C.lightBlue, textTransform: "uppercase",
                    letterSpacing: "0.08em", marginBottom: "10px", fontFamily: F.heading,
                  }}>
                    Named Insured
                  </label>
                  <input
                    ref={nameInputRef}
                    value={namedInsured}
                    onChange={e => setNamedInsured(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. Wingstop, Marriott International, Prologis"
                    disabled={phase === "running"}
                    style={{
                      width: "100%", background: C.w10, border: `2px solid ${C.w20}`,
                      borderRadius: "8px", color: C.w100, fontSize: "15px",
                      padding: "12px 16px", fontFamily: F.body, transition: "border-color 0.15s",
                    }}
                  />
                  {/* Quick-fill examples */}
                  <div style={{ marginTop: "10px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {["Wingstop", "Marriott International", "Prologis", "Domino's Pizza"].map(ex => (
                      <button key={ex} className="ghost-btn" onClick={() => setNamedInsured(ex)} style={{
                        background: "transparent", border: `1px solid ${C.w30 || C.w20}`,
                        color: C.w60, padding: "4px 12px", borderRadius: "8px",
                        fontSize: "11px", cursor: "pointer", fontFamily: F.body,
                        transition: "background 0.15s",
                      }}>{ex}</button>
                    ))}
                  </div>
                </div>

                {/* SOV upload */}
                <div style={{ marginBottom: "28px" }}>
                  <label style={{
                    display: "block", fontSize: "13px", fontWeight: "600",
                    color: C.lightBlue, textTransform: "uppercase",
                    letterSpacing: "0.08em", marginBottom: "10px", fontFamily: F.heading,
                  }}>
                    Statement of Values (.xlsx)
                  </label>
                  <DropZone
                    label="Drop SOV file here or click to browse"
                    hint="The raw SOV workbook — passed through the full partnerships chain"
                    accept=".xlsx" file={sovFile} onFile={setSovFile} icon="📊"
                  />
                </div>

                {/* Run button — primary CTA orange */}
                <button
                  className="orange-btn"
                  onClick={runWorkflow}
                  disabled={!canRun}
                  style={{
                    width: "100%",
                    background: canRun ? C.orange : C.w20,
                    color: canRun ? C.w100 : C.w40,
                    border: "none", borderRadius: "8px",
                    padding: "14px 28px", fontSize: "15px", fontWeight: "600",
                    cursor: canRun ? "pointer" : "not-allowed",
                    fontFamily: F.body, transition: "background 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  }}
                >
                  🔗 Run Partnerships Workflow
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "16px", padding: "16px 20px", color: "#fca5a5",
                fontSize: "14px", fontFamily: F.body, marginBottom: "16px",
                display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap",
              }}>
                <span style={{ flex: 1 }}>⚠️ {error}</span>
                <button onClick={() => setPhase("upload")} className="ghost-btn" style={{
                  background: "transparent", border: `1px solid ${C.w20}`, color: C.w60,
                  padding: "5px 14px", borderRadius: "8px", fontSize: "12px",
                  cursor: "pointer", fontFamily: F.body, fontWeight: "600",
                }}>Try again</button>
              </div>
            )}
          </div>
        )}

        {/* ── RUNNING PHASE ────────────────────────────────────────────────── */}
        {phase === "running" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{
              background: C.cardStd, border: `1px solid ${C.cardStdBorder}`,
              borderRadius: "16px", padding: "40px 32px",
            }}>
              <ChainProgress steps={chainSteps} activeStep={activeStep} />
              <div style={{ textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                  <div style={{
                    width: "36px", height: "36px",
                    border: `3px solid ${C.w20}`, borderTopColor: C.orange,
                    borderRadius: "50%", animation: "spin 0.8s linear infinite",
                  }} />
                </div>
                <div style={{ fontSize: "15px", color: C.w80, marginBottom: "16px", fontFamily: F.body }}>{stepMsg}</div>
                <div style={{ height: "6px", background: C.w10, borderRadius: "3px", overflow: "hidden", maxWidth: "400px", margin: "0 auto" }}>
                  <div style={{
                    height: "100%", borderRadius: "3px", background: C.orange,
                    width: `${stepPct}%`, transition: "width 0.5s ease",
                  }} />
                </div>
                <div style={{ fontSize: "12px", color: C.w40, marginTop: "8px", fontFamily: F.body }}>{stepPct}%</div>
              </div>
            </div>
          </div>
        )}

        {/* ── DONE PHASE ───────────────────────────────────────────────────── */}
        {phase === "done" && r && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>

            {/* Company header */}
            <div style={{
              background: C.cardStd, border: `1px solid ${C.cardStdBorder}`,
              borderRadius: "16px", padding: "28px 32px", marginBottom: "24px",
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              flexWrap: "wrap", gap: "16px",
            }}>
              <div>
                <h2 style={{ margin: "0 0 8px 0", fontSize: "28px", fontWeight: "700", color: C.w100, fontFamily: F.heading }}>
                  {r.named_insured}
                </h2>
                <div style={{ fontSize: "13px", color: C.w60, display: "flex", gap: "16px", flexWrap: "wrap", fontFamily: F.body }}>
                  {rd?.company_url && (
                    <a href={rd.company_url} target="_blank" rel="noreferrer"
                       style={{ color: C.lightBlue, textDecoration: "none" }}>🔗 {rd.company_url}</a>
                  )}
                  {rd?.headquarters?.city && <span>📍 {rd.headquarters.city}, {rd.headquarters.state}</span>}
                  {rd?.public_company?.is_public && <span>📈 {rd.public_company.exchange}: {rd.public_company.ticker}</span>}
                </div>
              </div>
              <button onClick={reset} className="ghost-btn" style={{
                background: "transparent", border: `2px solid ${C.w20}`, color: C.w60,
                padding: "8px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: "600",
                cursor: "pointer", fontFamily: F.body, transition: "background 0.15s",
              }}>New Workflow</button>
            </div>

            {/* Tab bar */}
            <div style={{ display: "flex", borderBottom: `2px solid ${C.w20}`, marginBottom: "24px" }}>
              {tabs.map(t => (
                <button
                  key={t.key}
                  className="tab-btn"
                  onClick={() => setActiveTab(t.key)}
                  style={{
                    padding: "12px 20px",
                    borderBottom: `3px solid ${activeTab === t.key ? C.orange : "transparent"}`,
                    marginBottom: "-2px",
                    color: activeTab === t.key ? C.w100 : C.w60,
                    fontFamily: F.heading, fontWeight: activeTab === t.key ? "600" : "400",
                    fontSize: "14px", letterSpacing: "0.02em",
                    whiteSpace: "nowrap",
                  }}
                >{t.label}</button>
              ))}
            </div>

            {/* ── Tab 1: Insured Business Summary ── */}
            {activeTab === "named-insured" && (
              <div>
                {rd ? (
                  <>
                    <Section title="Business Description" icon="🏢">
                      <p style={{ margin: 0, lineHeight: "1.7", fontSize: "15px", color: C.w80, fontFamily: F.body }}>{rd.business_description}</p>
                    </Section>

                    {/* ── Loss Event Research ── */}
                    {lossEventsPhase !== "idle" && (() => {
                      const relevanceOrder = { high: 0, medium: 1, low: 2 };
                      const parseEventDate = s => {
                        if (!s || s === "Unknown") return 0;
                        const d = new Date(s);
                        if (!isNaN(d.getTime())) return d.getTime();
                        const m = s.match(/^(\d{4})-(\d{2})$/);
                        if (m) return new Date(+m[1], +m[2] - 1).getTime();
                        const y = s.match(/^(\d{4})$/);
                        if (y) return new Date(+y[1], 0).getTime();
                        return 0;
                      };
                      const sortedEvents = lossEventsData?.loss_events
                        ? [...lossEventsData.loss_events].sort((a, b) => {
                            const rDiff = (relevanceOrder[a.relevance] ?? 3) - (relevanceOrder[b.relevance] ?? 3);
                            return rDiff !== 0 ? rDiff : parseEventDate(b.date) - parseEventDate(a.date);
                          })
                        : [];
                      const meta = lossEventsData?.loss_event_search;
                      return (
                        <Section title="Loss Event Research" icon="🔎" accentTitle>
                          {lossEventsPhase === "loading" && (
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 0" }}>
                              <div style={{
                                width: "18px", height: "18px", border: `2px solid ${C.orange}`,
                                borderTopColor: "transparent", borderRadius: "50%",
                                animation: "spin 0.8s linear infinite", flexShrink: 0,
                              }} />
                              <span style={{ fontSize: "14px", color: C.w60, fontFamily: F.body }}>
                                Searching for publicly reported loss events…
                              </span>
                            </div>
                          )}

                          {lossEventsPhase === "error" && (
                            <span style={{ fontSize: "14px", color: C.w60, fontFamily: F.body }}>
                              Search unavailable — please retry.
                            </span>
                          )}

                          {lossEventsPhase === "done" && (
                            <>
                              {sortedEvents.length > 0 ? (
                                sortedEvents.map((ev, i) => <LossEventCard key={i} event={ev} />)
                              ) : (
                                <p style={{ margin: 0, fontSize: "14px", color: C.w60, fontFamily: F.body }}>
                                  None found.
                                </p>
                              )}
                            </>
                          )}
                        </Section>
                      );
                    })()}

                    <Section title="Income Generation & BI Risk" icon="💰">
                      <p style={{ margin: "0 0 14px 0", lineHeight: "1.7", fontSize: "15px", color: C.w80, fontFamily: F.body }}>{rd.income_generation?.summary}</p>
                      {rd.income_generation?.primary_sources?.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                          {rd.income_generation.primary_sources.map((s, i) => (
                            <span key={i} style={{
                              padding: "4px 12px", background: C.w10, borderRadius: "20px",
                              fontSize: "12px", color: C.w60, border: `1px solid ${C.w20}`, fontFamily: F.body,
                            }}>{s}</span>
                          ))}
                        </div>
                      )}
                      <div style={{ background: C.w10, borderRadius: "12px", padding: "16px", border: `1px solid ${C.w20}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                          <span style={{ fontSize: "13px", fontWeight: "600", color: C.lightBlue, fontFamily: F.heading, textTransform: "uppercase", letterSpacing: "0.06em" }}>BI Risk Exposure</span>
                          <RiskBadge level={rd.income_generation?.bi_risk_assessment?.risk_level} />
                        </div>
                        <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: C.w80, lineHeight: "1.65", fontFamily: F.body }}>{rd.income_generation?.bi_risk_assessment?.explanation}</p>
                        {rd.income_generation?.bi_risk_assessment?.bi_perils?.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {rd.income_generation.bi_risk_assessment.bi_perils.map((p, i) => (
                              <span key={i} style={{
                                padding: "3px 10px", background: `${C.orange}18`, borderRadius: "20px",
                                fontSize: "11px", color: C.orange, border: `1px solid ${C.orange}44`, fontFamily: F.body,
                              }}>{p}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Section>

                    <Section title="Special Industry Flags" icon="🚩">
                      {(rd.special_industry_flags?.is_hotel || rd.special_industry_flags?.is_reit_or_real_estate_vehicle || rd.special_industry_flags?.is_senior_living) ? (
                        <>
                          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            {rd.special_industry_flags?.is_hotel && <Flag active label="Hotel / Hospitality" />}
                            {rd.special_industry_flags?.is_reit_or_real_estate_vehicle && <Flag active label="REIT / Real Estate Vehicle" />}
                            {rd.special_industry_flags?.is_senior_living && <Flag active label="Senior Living" />}
                          </div>
                          {rd.special_industry_flags?.industry_notes && (
                            <p style={{ margin: "12px 0 0 0", fontSize: "13px", color: C.w60, lineHeight: "1.6", fontFamily: F.body }}>{rd.special_industry_flags.industry_notes}</p>
                          )}
                        </>
                      ) : (
                        <p style={{ margin: 0, fontSize: "14px", color: C.w60, fontFamily: F.body }}>None</p>
                      )}
                    </Section>

                    {rd.headquarters?.city && (
                      <Section title="Headquarters" icon="📍">
                        <div style={{ fontSize: "15px", color: C.w80, fontFamily: F.body, lineHeight: "1.7" }}>
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
                            <div key={i} style={{
                              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                              padding: "10px 14px", background: C.w10, borderRadius: "8px", gap: "12px",
                            }}>
                              <div>
                                <div style={{ fontWeight: "600", fontSize: "14px", color: C.w100, fontFamily: F.body }}>{s.name}</div>
                                {s.description && <div style={{ fontSize: "12px", color: C.w60, marginTop: "2px", fontFamily: F.body }}>{s.description}</div>}
                              </div>
                              <span style={{
                                padding: "2px 10px", background: `${C.lightBlue}22`, borderRadius: "20px",
                                fontSize: "11px", color: C.lightBlue, border: `1px solid ${C.lightBlue}55`,
                                whiteSpace: "nowrap", flexShrink: 0, fontFamily: F.body,
                              }}>{s.type}</span>
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
                          <div key={i} style={{ background: C.w10, borderRadius: "8px", padding: "12px 16px", border: `1px solid ${C.w20}`, minWidth: "90px" }}>
                            <div style={{ fontSize: "11px", color: C.lightBlue, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px", fontFamily: F.body }}>{item.label}</div>
                            <div style={{ fontSize: "15px", fontWeight: "700", color: C.w100, fontFamily: F.heading }}>{item.value}</div>
                          </div>
                        ))}
                      </div>
                      {rd.public_company?.latest_10k?.available && (
                        <div style={{ background: C.w10, borderRadius: "10px", padding: "16px", border: `1px solid ${C.w20}` }}>
                          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }}>
                            {[
                              { label: "Fiscal Year", value: rd.public_company.latest_10k.fiscal_year || "N/A" },
                              { label: "Revenue",     value: rd.public_company.latest_10k.key_financials?.revenue || "N/A" },
                              { label: "Net Income",  value: rd.public_company.latest_10k.key_financials?.net_income || "N/A" },
                            ].map((item, i) => (
                              <div key={i} style={{ flex: 1, minWidth: "100px" }}>
                                <div style={{ fontSize: "11px", color: C.lightBlue, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px", fontFamily: F.body }}>{item.label}</div>
                                <div style={{ fontSize: "14px", fontWeight: "700", color: C.w100, fontFamily: F.heading }}>{item.value}</div>
                              </div>
                            ))}
                          </div>
                          <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: C.w80, lineHeight: "1.65", fontFamily: F.body }}>{rd.public_company.latest_10k.highlights}</p>
                          {rd.public_company.latest_10k.sec_filing_url && (
                            <a href={rd.public_company.latest_10k.sec_filing_url} target="_blank" rel="noreferrer"
                               style={{ color: C.lightBlue, fontSize: "13px", textDecoration: "none", fontWeight: "600", fontFamily: F.body }}>
                              🔗 View SEC Filing →
                            </a>
                          )}
                        </div>
                      )}
                    </Section>

                    <Section title="Franchise" icon="🍔">
                      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "14px" }}>
                        <div style={{ background: C.w10, borderRadius: "8px", padding: "12px 16px", border: `1px solid ${C.w20}` }}>
                          <div style={{ fontSize: "11px", color: C.lightBlue, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px", fontFamily: F.body }}>Franchise Related</div>
                          <div style={{ fontSize: "15px", fontWeight: "700", color: C.w100, fontFamily: F.heading }}>{rd.franchise?.is_franchise_related ? "Yes" : "No"}</div>
                        </div>
                        {rd.franchise?.is_franchise_related && (
                          <div style={{ background: C.w10, borderRadius: "8px", padding: "12px 16px", border: `1px solid ${C.w20}` }}>
                            <div style={{ fontSize: "11px", color: C.lightBlue, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px", fontFamily: F.body }}>Role</div>
                            <div style={{ fontSize: "15px", fontWeight: "700", color: C.w100, textTransform: "capitalize", fontFamily: F.heading }}>{rd.franchise?.role}</div>
                          </div>
                        )}
                      </div>
                      {rd.franchise?.franchise_details && (
                        <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: C.w80, lineHeight: "1.65", fontFamily: F.body }}>{rd.franchise.franchise_details}</p>
                      )}
                      {rd.franchise?.latest_performance && rd.franchise.latest_performance !== "null" && (
                        <div style={{ background: C.w10, borderRadius: "10px", padding: "14px", border: `1px solid ${C.w20}` }}>
                          <div style={{ fontSize: "11px", color: C.lightBlue, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px", fontFamily: F.body }}>Latest Performance</div>
                          <p style={{ margin: 0, fontSize: "14px", color: C.w80, lineHeight: "1.65", fontFamily: F.body }}>{rd.franchise.latest_performance}</p>
                        </div>
                      )}
                    </Section>

                    <div style={{
                      marginTop: "20px", display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 16px", background: C.w10, border: `1px solid ${C.w20}`,
                      borderRadius: "10px", flexWrap: "wrap", gap: "8px",
                    }}>
                      <span style={{ fontSize: "12px", color: C.w60, fontFamily: F.body }}>
                        Research confidence: <span style={{
                          color: rd.data_confidence === "High" ? C.orange : rd.data_confidence === "Medium" ? C.lightBlue : C.lavender,
                          fontWeight: "700",
                        }}>{rd.data_confidence}</span>
                      </span>
                      {rd.research_timestamp && (
                        <span style={{ fontSize: "11px", color: C.w40, fontFamily: F.body }}>Researched {new Date(rd.research_timestamp).toLocaleString()}</span>
                      )}
                    </div>
                    {rd.research_notes && (
                      <p style={{ margin: "12px 0 0 0", fontSize: "12px", color: C.w60, lineHeight: "1.6", padding: "0 4px", fontFamily: F.body }}>
                        ℹ️ {rd.research_notes}
                      </p>
                    )}
                  </>
                ) : (
                  <Section title="Research" icon="🔍">
                    <p style={{ margin: 0, color: C.w60, fontSize: "14px", fontFamily: F.body }}>Research data is not available.</p>
                  </Section>
                )}
              </div>
            )}

            {/* ── Tab 2: Analysis Output ── */}
            {activeTab === "partnerships" && (
              <div>
                {/* Download — orange highlighted card */}
                {outputFile && (
                  <div style={{
                    background: `${C.orange}18`, border: `1px solid ${C.orange}55`,
                    borderRadius: "16px", padding: "28px 32px", marginBottom: "24px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    flexWrap: "wrap", gap: "20px",
                  }}>
                    <div>
                      <div style={{ fontSize: "13px", color: C.orange, fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px", fontFamily: F.heading }}>Final Enriched Workbook Ready</div>
                      <div style={{ fontSize: "17px", color: C.w100, fontWeight: "700", fontFamily: F.heading }}>{outputFile.filename}</div>
                      <div style={{ fontSize: "12px", color: C.w60, marginTop: "4px", fontFamily: F.body }}>LARI Values · Benchmark Comparison · LARI Modifiers</div>
                    </div>
                    <a
                      href={outputFile.dataUrl}
                      download={outputFile.filename}
                      className="orange-btn"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "8px",
                        background: C.orange, color: C.w100, textDecoration: "none",
                        padding: "12px 28px", borderRadius: "8px",
                        fontSize: "15px", fontWeight: "600", flexShrink: 0,
                        fontFamily: F.body, transition: "background 0.2s",
                      }}
                    >↓ Download Workbook</a>
                  </div>
                )}

                {/* SOV Summary */}
                {workbookMetrics?.sov && (
                  <Section title="SOV Summary" icon="📋">
                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                      <StatCard label="Total Locations"     value={workbookMetrics.sov.total_locations ?? "—"} sub="locations in SOV" />
                      <StatCard label="Total Submitted BI"  value={workbookMetrics.sov.total_bi_value != null ? `$${Math.round(workbookMetrics.sov.total_bi_value).toLocaleString()}` : "—"} sub="aggregate BI value" accent />
                      <StatCard label="Average BI Value"    value={workbookMetrics.sov.avg_bi_value    != null ? `$${Math.round(workbookMetrics.sov.avg_bi_value).toLocaleString()}`    : "—"} sub="per location" />
                      <StatCard label="Primary NAICS"       value={workbookMetrics.sov.primary_naics ?? "—"} sub="most common activity" />
                      <StatCard label="Unique NAICS"        value={workbookMetrics.sov.unique_naics ?? "—"} sub="distinct codes assigned" />
                    </div>
                  </Section>
                )}

                {/* Analysis Summary */}
                {workbookMetrics?.analysis && (
                  <Section title="Analysis Summary" icon="📈">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "0" }}>
                      <StatCard label="Total Modeled Sales"    value={workbookMetrics.analysis.total_modeled_sales   != null ? `$${Math.round(workbookMetrics.analysis.total_modeled_sales).toLocaleString()}`   : "—"} sub="LARI modelled sales" />
                      <StatCard label="Total Benchmark Sales"  value={workbookMetrics.analysis.total_benchmark_sales != null ? `$${Math.round(workbookMetrics.analysis.total_benchmark_sales).toLocaleString()}` : "—"} sub="Census benchmark" />
                      <StatCard label="Total Benchmark BIV"   value={workbookMetrics.analysis.total_benchmark_biv   != null ? `$${Math.round(workbookMetrics.analysis.total_benchmark_biv).toLocaleString()}`   : "—"} sub="aggregate benchmark BIV" accent />
                      <StatCard label="Avg Benchmark BIV"     value={workbookMetrics.analysis.avg_benchmark_biv     != null ? `$${Math.round(workbookMetrics.analysis.avg_benchmark_biv).toLocaleString()}`     : "—"} sub="per location" />
                      <StatCard label="Total Difference"      value={workbookMetrics.analysis.total_difference      != null ? `$${Math.round(workbookMetrics.analysis.total_difference).toLocaleString()}`      : "—"} sub="submitted vs benchmark BIV" />
                      <StatCard label="Avg Difference"        value={workbookMetrics.analysis.avg_difference        != null ? `$${Math.round(workbookMetrics.analysis.avg_difference).toLocaleString()}`        : "—"} sub="per location" />
                      <StatCard label="% Difference"          value={workbookMetrics.analysis.pct_difference        != null ? `${(workbookMetrics.analysis.pct_difference * 100).toFixed(1)}%`                  : "—"} sub="avg variance from benchmark" />
                      <StatCard label="High Risk Locations"   value={workbookMetrics.analysis.high_risk_locations ?? "—"} sub="BIV variance below −50%" accent={workbookMetrics.analysis.high_risk_locations > 0} />
                    </div>
                  </Section>
                )}

                {/* Summary statistics */}
                {chainSummary && (
                  <Section title="Geocoding Summary" icon="📊">
                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "16px" }}>
                      <StatCard label="Total Locations" value={chainSummary.location_count ?? "—"} sub="processed through benchmark" />
                      <StatCard label="FIPS Resolved" value={`${chainSummary.fips_resolved ?? "—"} / ${chainSummary.location_count ?? "—"}`} sub={chainSummary.location_count > 0 ? `${pct(chainSummary.fips_resolved, chainSummary.location_count)} resolution rate` : ""} accent />
                      <StatCard label="Unresolved" value={chainSummary.fips_failed_count ?? "—"} sub="failed FIPS geocoding" />
                    </div>
                    {chainSummary.fips_failed_count > 0 && (
                      <div style={{ background: `${C.orange}12`, border: `1px solid ${C.orange}44`, borderRadius: "10px", padding: "14px 16px" }}>
                        <div style={{ fontSize: "13px", color: C.orange, fontWeight: "700", marginBottom: "6px", fontFamily: F.body }}>
                          ⚠️ {chainSummary.fips_failed_count} location{chainSummary.fips_failed_count !== 1 ? "s" : ""} could not be geocoded
                        </div>
                        <div style={{ fontSize: "13px", color: C.w60, lineHeight: "1.6", fontFamily: F.body }}>
                          These rows will have null FIPS codes in the output. Check the Geocode Method column in the workbook for details.
                        </div>
                      </div>
                    )}
                  </Section>
                )}

                {/* Chain steps */}
                <Section title="Chain Execution" icon="🔗">
                  <div style={{ display: "grid", gap: "8px" }}>
                    {chainSteps.map((s) => (
                      <div key={s.key} style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        padding: "12px 16px", background: C.w10, borderRadius: "8px",
                        border: `1px solid ${s.done ? `${C.orange}33` : s.error ? "rgba(239,68,68,0.25)" : C.w10}`,
                      }}>
                        <div style={{
                          width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "11px", fontWeight: "700",
                          background: s.error ? "rgba(239,68,68,0.15)" : s.done ? `${C.orange}22` : C.w10,
                          border: `1px solid ${s.error ? "rgba(239,68,68,0.4)" : s.done ? C.orange : C.w20}`,
                          color: s.error ? "#fca5a5" : s.done ? C.orange : C.w40,
                        }}>
                          {s.error ? "✗" : s.done ? "✓" : "·"}
                        </div>
                        <div style={{ fontSize: "14px", color: s.error ? "#fca5a5" : s.done ? C.w100 : C.w60, fontWeight: s.done ? "500" : "400", fontFamily: F.body }}>{s.label}</div>
                        {s.error && <span style={{ fontSize: "11px", color: "#ef4444", marginLeft: "auto", fontFamily: F.body }}>Failed</span>}
                        {s.done  && <span style={{ fontSize: "11px", color: C.orange,  marginLeft: "auto", fontFamily: F.body }}>Complete</span>}
                      </div>
                    ))}
                  </div>
                </Section>
              </div>
            )}

            {/* ── Tab 3: Technical Output ── */}
            {activeTab === "technical" && (
              <div>
                <div style={{
                  background: C.cardMuted, border: `1px solid ${C.cardMutedBorder}`,
                  borderRadius: "10px", padding: "12px 16px", marginBottom: "16px",
                  fontSize: "12px", color: C.w60, fontFamily: F.body,
                }}>
                  ℹ️ Raw technical output for debugging and integration. Not part of the primary workflow.
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
                  <button
                    className="ghost-btn"
                    onClick={() => navigator.clipboard.writeText(JSON.stringify({ identifyResult, chainSummary }, null, 2))}
                    style={{
                      background: "transparent", border: `2px solid ${C.w20}`, color: C.w60,
                      padding: "7px 16px", borderRadius: "8px", fontSize: "12px",
                      cursor: "pointer", fontFamily: F.body, fontWeight: "600",
                      transition: "background 0.15s",
                    }}
                  >Copy JSON</button>
                </div>
                <pre style={{
                  background: "rgba(0,0,0,0.25)", border: `1px solid ${C.w10}`,
                  borderRadius: "12px", padding: "20px", overflowX: "auto",
                  fontSize: "12px", lineHeight: "1.7", color: C.w60,
                  fontFamily: "'DM Mono', 'Fira Code', 'Courier New', monospace",
                  whiteSpace: "pre-wrap", wordBreak: "break-word",
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
