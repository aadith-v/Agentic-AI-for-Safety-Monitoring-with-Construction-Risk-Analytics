import { useState, useRef, useEffect } from "react";
import {
  ShieldAlert,
  HardHat,
  Camera,
  AlertTriangle,
  CheckCircle2,
  Bot,
  UploadCloud,
  RotateCcw,
  Users,
  Eye,
  Activity,
  Check,
  FileText,
  BarChart3,
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown,
  Circle,
  X
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from "recharts";

import "./App.css";

// ── Static data sets ──────────────────────────────────────────────────────────

const riskDistribution = [
  { type: "Fall Hazards",      count: 38, color: "#f43f5e" },
  { type: "Equipment Risks",   count: 28, color: "#f59e0b" },
  { type: "Electrical",        count: 22, color: "#a855f7" },
  { type: "Environmental",     count: 12, color: "#10b981" },
];

const weeklyRisk = [
  { day: "Mon", risk: 52, ppe: 94, incidents: 1 },
  { day: "Tue", risk: 58, ppe: 91, incidents: 2 },
  { day: "Wed", risk: 44, ppe: 96, incidents: 0 },
  { day: "Thu", risk: 68, ppe: 85, incidents: 3 },
  { day: "Fri", risk: 60, ppe: 92, incidents: 1 },
  { day: "Sat", risk: 72, ppe: 88, incidents: 4 },
  { day: "Sun", risk: 61, ppe: 93, incidents: 1 },
];

const incidentLog = [
  { id: "INC-041", type: "Missing Hardhat",          zone: "Zone A — Tower 2",     severity: "High",   status: "Open",     time: "09:14 AM" },
  { id: "INC-040", type: "Missing Safety Vest",      zone: "Zone B — Ground Deck", severity: "Medium", status: "Resolved", time: "08:52 AM" },
  { id: "INC-039", type: "Excavator Swing Hazard",   zone: "Zone C — Excavation",  severity: "High",   status: "Open",     time: "08:30 AM" },
  { id: "INC-038", type: "Unsecured Perimeter Gate", zone: "Zone A — Entry",       severity: "Medium", status: "Resolved", time: "Yesterday" },
  { id: "INC-037", type: "Worker Near Live Cable",   zone: "Zone D — Basement",    severity: "High",   status: "Resolved", time: "Yesterday" },
  { id: "INC-036", type: "Missing Safety Vest",      zone: "Zone E — Scaffolding", severity: "Medium", status: "Open",     time: "2 days ago" },
  { id: "INC-035", type: "No Hardhat — Crane Zone",  zone: "Zone A — Crane Base",  severity: "High",   status: "Resolved", time: "2 days ago" },
  { id: "INC-034", type: "Missing Protective Gloves",zone: "Zone B — Concrete",    severity: "Low",    status: "Resolved", time: "3 days ago" },
];

const zones = [
  { id: "A", name: "Zone A — Tower Deck",          riskScore: 78, level: "High",   workers: 42, hazards: 6, camera: "CAM-01, CAM-02" },
  { id: "B", name: "Zone B — Haul Road",           riskScore: 34, level: "Low",    workers: 18, hazards: 2, camera: "CAM-03" },
  { id: "C", name: "Zone C — Excavation Pit",      riskScore: 65, level: "Medium", workers: 26, hazards: 5, camera: "CAM-04" },
  { id: "D", name: "Zone D — Basement & Cables",   riskScore: 55, level: "Medium", workers: 20, hazards: 3, camera: "CAM-05" },
  { id: "E", name: "Zone E — Scaffolding",         riskScore: 80, level: "High",   workers: 31, hazards: 7, camera: "CAM-06, CAM-07" },
  { id: "F", name: "Zone F — Concrete Batching",   riskScore: 22, level: "Low",    workers: 14, hazards: 1, camera: "CAM-08" },
];

// ── Helper ────────────────────────────────────────────────────────────────────

function severityClass(level) {
  if (level === "High")   return "danger";
  if (level === "Medium") return "warning";
  return "success";
}

function levelColor(level) {
  if (level === "High")   return "#f87171";
  if (level === "Medium") return "#fbbf24";
  return "#34d399";
}

function riskBg(level) {
  if (level === "High")   return { bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.3)",   text: "#f87171" };
  if (level === "Medium") return { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)",  text: "#fbbf24" };
  return                         { bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.3)", text: "#34d399" };
}

// ── Tooltip style reused across charts ───────────────────────────────────────
const ttStyle = {
  background: "#1e293b",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "#fff",
};

// ══════════════════════════════════════════════════════════════════════════════
//  APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [activeTab, setActiveTab] = useState("site-risk");
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);

  // File / analysis state
  const [file, setFile]           = useState(null);
  const [fileType, setFileType]   = useState("video");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult]       = useState(null);

  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── Load demo telemetry ──────────────────────────────────────────────────
  const loadTelemetry = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/api/demo-telemetry");
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        showToast("Live telemetry synchronized from BuildSure AI.");
      } else throw new Error();
    } catch {
      setResult({
        risk: { site_risk_score: 72, risk_level: "High", total_detections: 23, active_risks: 47, high_risk_zones: 8 },
        safety: {
          ppe_compliance_rate: 92, safety_violations: 14, workers_monitored: 342, safety_score: 88,
          alerts: [
            { type: "Missing Hardhat",            zone: "Zone A — Tower 2",     severity: "High"   },
            { type: "Missing Safety Vest",         zone: "Zone B — Ground Deck", severity: "Medium" },
            { type: "Worker Near Excavation",      zone: "Zone C — Excavation",  severity: "High"   },
            { type: "Unsecured Perimeter Access",  zone: "Zone A — Perimeter",   severity: "Medium" },
          ],
        },
        detections: [
          { class: "NO-Hardhat",    confidence: 0.94, zone: "Zone A" },
          { class: "NO-Safety Vest",confidence: 0.89, zone: "Zone B" },
          { class: "machinery",     confidence: 0.91, zone: "Zone C" },
          { class: "vehicle",       confidence: 0.86, zone: "Zone A" },
        ],
      });
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => { loadTelemetry(); }, []);

  // ── File upload ──────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setFileType(f.type.startsWith("video/") ? "video" : "image");
    setPreviewUrl(URL.createObjectURL(f));
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    const fd = new FormData();
    const isVid = fileType === "video";
    fd.append(isVid ? "video" : "image", file);
    try {
      const res  = await fetch(
        isVid ? "http://127.0.0.1:5000/api/analyze-video" : "http://127.0.0.1:5000/api/analyze",
        { method: "POST", body: fd }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      showToast(`${isVid ? "Video" : "Image"} analyzed with YOLOv11!`);
    } catch {
      showToast("Could not reach Flask backend — showing cached results.");
    } finally {
      setAnalyzing(false);
    }
  };

  // ── Derived values ───────────────────────────────────────────────────────
  const siteRiskScore   = result?.risk?.site_risk_score   ?? 72;
  const activeRisks     = result?.risk?.active_risks       ?? 47;
  const highRiskZones   = result?.risk?.high_risk_zones    ?? 8;
  const hazardsDetected = result?.risk?.total_detections   ?? 23;

  const ppeRate         = result?.safety?.ppe_compliance_rate ?? 92;
  const violations      = result?.safety?.active_violations   ?? result?.safety?.safety_violations ?? 14;
  const workers         = result?.safety?.workers_monitored   ?? 342;
  const safetyScore     = result?.safety?.safety_score        ?? 88;

  const alerts          = result?.safety?.alerts ?? [
    { type: "Missing Hardhat",           zone: "Zone A — Tower 2",     severity: "High"   },
    { type: "Missing Safety Vest",       zone: "Zone B — Ground Deck", severity: "Medium" },
    { type: "Excavator Swing Hazard",    zone: "Zone C — Excavation",  severity: "High"   },
  ];

  const detections = result?.detections ?? [
    { class: "NO-Hardhat",    confidence: 0.94, zone: "Zone A" },
    { class: "NO-Safety Vest",confidence: 0.89, zone: "Zone B" },
    { class: "machinery",     confidence: 0.91, zone: "Zone C" },
  ];

  // ── Nav ──────────────────────────────────────────────────────────────────
  const navItems = [
    { id: "site-risk",            label: "Site Risk Dashboard",    icon: ShieldAlert },
    { id: "safety-intelligence",  label: "Safety Intelligence",    icon: HardHat     },
    { id: "incidents",            label: "Incident Reports",       icon: FileText    },
    { id: "analytics",            label: "Analytics & Trends",     icon: BarChart3   },
    { id: "zone-overview",        label: "Zone Overview",          icon: MapPin      },
  ];

  const pageTitle = {
    "site-risk":           "Site Risk Monitoring & Hazard Detection",
    "safety-intelligence": "Safety Intelligence & Worker Protection",
    "incidents":           "Incident Reports",
    "analytics":           "Analytics & Trends",
    "zone-overview":       "Zone Overview",
  }[activeTab];

  const pageDesc = {
    "site-risk":           "Live hazard surveillance, spatial risk scoring, and detection workflows",
    "safety-intelligence": "PPE compliance tracking, worker safety analytics, and automated alert dispatch",
    "incidents":           "Log of all recorded safety incidents with status and severity tracking",
    "analytics":           "Weekly risk trends, PPE compliance over time, and incident frequency",
    "zone-overview":       "All construction zones with live risk scores and hazard summaries",
  }[activeTab];

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="app-wrapper">
      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon-gradient"><ShieldAlert size={22} /></div>
          <div className="brand-title-wrap">
            <h2>BuildSure AI</h2>
            <span>Risk Intelligence</span>
          </div>
        </div>

        <div className="nav-label">Core Modules</div>
        <nav className="nav-tabs-group">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-btn ${activeTab === id ? "active" : ""}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="status-pill-card">
            <div className="live-dot-green" />
            <div className="status-pill-text">
              <strong>YOLO AI Active</strong>
              <span>Site Monitoring Online</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────────────────────────── */}
      <main className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-title-block">
            <h1>{pageTitle}</h1>
            <p>{pageDesc}</p>
          </div>
          <div className="topbar-actions">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/*,image/*" style={{ display: "none" }} />
            {(activeTab === "site-risk") && (
              <button className="secondary-btn" onClick={() => fileInputRef.current?.click()}>
                <UploadCloud size={14} /> <span>Upload Media</span>
              </button>
            )}
            <button className="gradient-btn" onClick={loadTelemetry}>
              <RotateCcw size={14} /> <span>Reload Demo</span>
            </button>
          </div>
        </header>

        <div className="page-container">

          {/* ════════════════════════════════════════════════════════════════
              PAGE 1 — SITE RISK DASHBOARD
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === "site-risk" && (
            <>
              {/* KPI row */}
              <div className="metric-cards-row">
                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Active Risks</span>
                    <div className="metric-icon-box icon-pink"><AlertTriangle size={18} /></div>
                  </div>
                  <div className="metric-value-wrap">
                    <span className="metric-val">{activeRisks}</span>
                    <span className="metric-sub">total</span>
                  </div>
                  <div className="metric-status text-red">Needs attention</div>
                </div>

                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">High-Risk Zones</span>
                    <div className="metric-icon-box icon-amber"><Activity size={18} /></div>
                  </div>
                  <div className="metric-value-wrap">
                    <span className="metric-val">{highRiskZones}</span>
                    <span className="metric-sub">sectors</span>
                  </div>
                  <div className="metric-status text-orange">Zone A &amp; E flagged</div>
                </div>

                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Hazards Detected</span>
                    <div className="metric-icon-box icon-purple"><Camera size={18} /></div>
                  </div>
                  <div className="metric-value-wrap">
                    <span className="metric-val">{hazardsDetected}</span>
                    <span className="metric-sub">objects</span>
                  </div>
                  <div className="metric-status text-blue">YOLOv11 Inference</div>
                </div>

                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Site Risk Score</span>
                    <div className="metric-icon-box icon-emerald"><ShieldAlert size={18} /></div>
                  </div>
                  <div className="metric-value-wrap">
                    <span className="metric-val">{siteRiskScore}</span>
                    <span className="metric-sub">/100</span>
                  </div>
                  <div className="metric-status text-orange">High — Action needed</div>
                </div>
              </div>

              {/* Vision + Chart */}
              <div className="dashboard-columns">
                <div className="card-panel">
                  <div className="panel-header">
                    <div>
                      <h3><Camera size={16} /> Hazard Detection Feed</h3>
                      <p>AI computer vision processing</p>
                    </div>
                    <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 700 }}>● LIVE</span>
                  </div>

                  <div className="vision-screen">
                    <div className="vision-overlay-badge"><span>CAM-02 • TOWER DECK</span></div>
                    {previewUrl ? (
                      fileType === "video"
                        ? <video className="media-preview-element" src={previewUrl} controls autoPlay loop muted />
                        : <img   className="media-preview-element" src={previewUrl} alt="Preview" />
                    ) : (
                      <div className="vision-placeholder">
                        <div className="vision-icon-wrap"><Eye size={26} /></div>
                        <h4>Construction Site Feed Ready</h4>
                        <p>Upload a site video or image to run the YOLO hazard detector.</p>
                        <button className="gradient-btn" onClick={() => fileInputRef.current?.click()}>
                          <UploadCloud size={14} /> Choose File
                        </button>
                      </div>
                    )}
                    <div className="vision-footer-bar">
                      <span>Model: <b>YOLOv11</b></span>
                      <span>Detections: <b>{hazardsDetected}</b></span>
                      <span>Risk: <b>{siteRiskScore}/100</b></span>
                    </div>
                  </div>

                  {file && (
                    <div className="upload-actions-bar">
                      <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                        {file.name}
                      </span>
                      <button className="gradient-btn" onClick={handleAnalyze} disabled={analyzing}>
                        {analyzing ? "Analyzing…" : "Run Hazard Detection"}
                      </button>
                    </div>
                  )}

                  <div className="ai-box">
                    <h4><Bot size={15} /> Site Risk Agent</h4>
                    <p>Workers without head protection detected near Zone A. Immediate inspection recommended.</p>
                  </div>
                </div>

                <div className="card-panel">
                  <div className="panel-header">
                    <div>
                      <h3>Risk Distribution by Type</h3>
                      <p>Hazard breakdown across project</p>
                    </div>
                  </div>
                  <div style={{ height: 230, marginTop: 10 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={riskDistribution} layout="vertical">
                        <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
                        <YAxis dataKey="type" type="category" stroke="#94a3b8" tick={{ fontSize: 11 }} width={110} />
                        <Tooltip contentStyle={ttStyle} />
                        <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                          {riskDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ marginTop: 20 }}>
                    <h4 style={{ fontSize: 13, color: "#fff", marginBottom: 10 }}>Recent Detections</h4>
                    <div className="alerts-list">
                      {detections.map((d, i) => (
                        <div key={i} className="alert-item-card">
                          <div className="alert-left">
                            <div className={`alert-icon-circle ${d.class.includes("NO-") ? "danger" : "warning"}`}>
                              <AlertTriangle size={14} />
                            </div>
                            <div className="alert-info">
                              <h5>{d.class.replace("NO-", "Missing ")}</h5>
                              <p>{d.zone || "Zone A"}</p>
                            </div>
                          </div>
                          <span className={d.class.includes("NO-") ? "alert-tag tag-red" : "alert-tag tag-yellow"}>
                            {(d.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ════════════════════════════════════════════════════════════════
              PAGE 2 — SAFETY INTELLIGENCE
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === "safety-intelligence" && (
            <>
              <div className="metric-cards-row">
                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">PPE Compliance</span>
                    <div className="metric-icon-box icon-emerald"><CheckCircle2 size={18} /></div>
                  </div>
                  <div className="metric-value-wrap">
                    <span className="metric-val">{ppeRate}%</span>
                  </div>
                  <div className="metric-status text-green">Above target (90%)</div>
                </div>

                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Safety Violations</span>
                    <div className="metric-icon-box icon-pink"><AlertTriangle size={18} /></div>
                  </div>
                  <div className="metric-value-wrap">
                    <span className="metric-val">{violations}</span>
                    <span className="metric-sub">today</span>
                  </div>
                  <div className="metric-status text-red">Resolve open alerts</div>
                </div>

                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Workers Monitored</span>
                    <div className="metric-icon-box icon-blue"><Users size={18} /></div>
                  </div>
                  <div className="metric-value-wrap">
                    <span className="metric-val">{workers}</span>
                  </div>
                  <div className="metric-status text-blue">Live tracking</div>
                </div>

                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Safety Score</span>
                    <div className="metric-icon-box icon-purple"><HardHat size={18} /></div>
                  </div>
                  <div className="metric-value-wrap">
                    <span className="metric-val">{safetyScore}</span>
                    <span className="metric-sub">/100</span>
                  </div>
                  <div className="metric-status text-green">Optimal standard</div>
                </div>
              </div>

              <div className="dashboard-columns">
                {/* PPE progress bars */}
                <div className="card-panel">
                  <div className="panel-header">
                    <div>
                      <h3>PPE Compliance by Type</h3>
                      <p>Component adherence levels</p>
                    </div>
                    <span style={{ fontSize: "11px", color: "#a855f7", fontWeight: 600 }}>Safety Agent</span>
                  </div>

                  <div className="ppe-list">
                    {[
                      { label: "Hard Hats",          pct: 97, fill: "fill-purple", Icon: HardHat      },
                      { label: "Safety Vests",        pct: 94, fill: "fill-emerald",Icon: ShieldAlert   },
                      { label: "Safety Boots",        pct: 91, fill: "fill-blue",   Icon: CheckCircle2 },
                      { label: "Protective Gloves",   pct: 85, fill: "fill-amber",  Icon: AlertTriangle },
                    ].map(({ label, pct, fill, Icon }) => (
                      <div key={label} className="ppe-item">
                        <div className="ppe-header">
                          <span className="ppe-title"><Icon size={15} /> {label}</span>
                          <span className="ppe-percentage">{pct}%</span>
                        </div>
                        <div className="progress-track-bg">
                          <div className={`progress-bar-fill ${fill}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="ai-box" style={{ marginTop: 24 }}>
                    <h4><Bot size={15} /> Safety Agent</h4>
                    <p>Reinforce glove adherence in Zone B concrete-handling areas to reach the 95% overall target.</p>
                  </div>
                </div>

                {/* Alerts */}
                <div className="card-panel">
                  <div className="panel-header">
                    <div>
                      <h3>Active Safety Alerts</h3>
                      <p>Real-time worker safety violations</p>
                    </div>
                    <button className="secondary-btn" style={{ fontSize: "11px", padding: "4px 8px" }}
                      onClick={() => showToast("All alerts acknowledged.")}>
                      Acknowledge All
                    </button>
                  </div>

                  <div className="alerts-list" style={{ maxHeight: 360 }}>
                    {alerts.map((al, i) => (
                      <div key={i} className="alert-item-card">
                        <div className="alert-left">
                          <div className={`alert-icon-circle ${severityClass(al.severity)}`}>
                            <AlertTriangle size={15} />
                          </div>
                          <div className="alert-info">
                            <h5>{al.type}</h5>
                            <p>{al.zone}</p>
                          </div>
                        </div>
                        <button className="secondary-btn" style={{ fontSize: "11px", padding: "4px 8px" }}
                          onClick={() => showToast(`Resolved: ${al.type}`)}>
                          <Check size={12} /> Resolve
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ════════════════════════════════════════════════════════════════
              PAGE 3 — INCIDENT REPORTS
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === "incidents" && (
            <>
              {/* Summary row */}
              <div className="metric-cards-row">
                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Total Incidents</span>
                    <div className="metric-icon-box icon-purple"><FileText size={18} /></div>
                  </div>
                  <div className="metric-value-wrap"><span className="metric-val">41</span></div>
                  <div className="metric-status text-blue">All-time logged</div>
                </div>
                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Open Incidents</span>
                    <div className="metric-icon-box icon-pink"><AlertTriangle size={18} /></div>
                  </div>
                  <div className="metric-value-wrap"><span className="metric-val">3</span></div>
                  <div className="metric-status text-red">Pending resolution</div>
                </div>
                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Resolved Today</span>
                    <div className="metric-icon-box icon-emerald"><CheckCircle2 size={18} /></div>
                  </div>
                  <div className="metric-value-wrap"><span className="metric-val">5</span></div>
                  <div className="metric-status text-green">Good response rate</div>
                </div>
                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">High Severity</span>
                    <div className="metric-icon-box icon-amber"><Activity size={18} /></div>
                  </div>
                  <div className="metric-value-wrap"><span className="metric-val">4</span></div>
                  <div className="metric-status text-orange">This week</div>
                </div>
              </div>

              {/* Incident table */}
              <div className="card-panel">
                <div className="panel-header">
                  <div>
                    <h3><FileText size={16} /> Incident Log</h3>
                    <p>All recorded safety incidents — most recent first</p>
                  </div>
                  <button className="gradient-btn" style={{ fontSize: "12px", padding: "7px 14px" }}
                    onClick={() => showToast("Incident report exported as PDF.")}>
                    Export Report
                  </button>
                </div>

                <div className="incident-table-wrapper">
                  <table className="incident-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Zone</th>
                        <th>Severity</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incidentLog.map((inc) => {
                        const c = riskBg(inc.severity);
                        return (
                          <tr key={inc.id}>
                            <td><span className="incident-id">{inc.id}</span></td>
                            <td>{inc.type}</td>
                            <td style={{ color: "var(--text-muted)" }}>{inc.zone}</td>
                            <td>
                              <span className="incident-badge" style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
                                {inc.severity}
                              </span>
                            </td>
                            <td style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                <Clock size={12} /> {inc.time}
                              </span>
                            </td>
                            <td>
                              <span className={`incident-status ${inc.status === "Open" ? "status-open" : "status-resolved"}`}>
                                {inc.status === "Open"
                                  ? <><Circle size={8} fill="currentColor" /> Open</>
                                  : <><Check size={12} /> Resolved</>}
                              </span>
                            </td>
                            <td>
                              {inc.status === "Open" && (
                                <button className="secondary-btn" style={{ fontSize: "11px", padding: "4px 8px" }}
                                  onClick={() => showToast(`Resolved: ${inc.id}`)}>
                                  Resolve
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ════════════════════════════════════════════════════════════════
              PAGE 4 — ANALYTICS & TRENDS
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === "analytics" && (
            <>
              <div className="metric-cards-row">
                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Avg Risk Score (7d)</span>
                    <div className="metric-icon-box icon-pink"><TrendingUp size={18} /></div>
                  </div>
                  <div className="metric-value-wrap"><span className="metric-val">59</span><span className="metric-sub">/100</span></div>
                  <div className="metric-status text-orange">+6 vs last week</div>
                </div>
                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Avg PPE Compliance</span>
                    <div className="metric-icon-box icon-emerald"><TrendingDown size={18} /></div>
                  </div>
                  <div className="metric-value-wrap"><span className="metric-val">91%</span></div>
                  <div className="metric-status text-green">+3% vs last week</div>
                </div>
                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Total Incidents (7d)</span>
                    <div className="metric-icon-box icon-amber"><Activity size={18} /></div>
                  </div>
                  <div className="metric-value-wrap"><span className="metric-val">12</span></div>
                  <div className="metric-status text-orange">-2 vs last week</div>
                </div>
                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Best Safety Day</span>
                    <div className="metric-icon-box icon-purple"><CheckCircle2 size={18} /></div>
                  </div>
                  <div className="metric-value-wrap"><span className="metric-val">Wed</span></div>
                  <div className="metric-status text-green">Risk: 44/100</div>
                </div>
              </div>

              <div className="dashboard-columns">
                {/* Risk & PPE area chart */}
                <div className="card-panel">
                  <div className="panel-header">
                    <div>
                      <h3>Risk Score &amp; PPE Compliance — Last 7 Days</h3>
                      <p>Daily trend comparison</p>
                    </div>
                  </div>
                  <div style={{ height: 260, marginTop: 10 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyRisk}>
                        <defs>
                          <linearGradient id="gradRisk" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gradPpe" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={ttStyle} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Area type="monotone" dataKey="risk" name="Risk Score"      stroke="#f43f5e" strokeWidth={2.5} fill="url(#gradRisk)" />
                        <Area type="monotone" dataKey="ppe"  name="PPE Compliance %" stroke="#10b981" strokeWidth={2.5} fill="url(#gradPpe)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Incidents per day bar chart */}
                <div className="card-panel">
                  <div className="panel-header">
                    <div>
                      <h3>Incidents Per Day</h3>
                      <p>Count of logged safety events</p>
                    </div>
                  </div>
                  <div style={{ height: 260, marginTop: 10 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyRisk}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={ttStyle} />
                        <Bar dataKey="incidents" name="Incidents" fill="#a855f7" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ════════════════════════════════════════════════════════════════
              PAGE 5 — ZONE OVERVIEW
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === "zone-overview" && (
            <>
              <div className="metric-cards-row">
                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Total Zones</span>
                    <div className="metric-icon-box icon-purple"><MapPin size={18} /></div>
                  </div>
                  <div className="metric-value-wrap"><span className="metric-val">6</span></div>
                  <div className="metric-status text-blue">Active sectors</div>
                </div>
                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">High-Risk Zones</span>
                    <div className="metric-icon-box icon-pink"><AlertTriangle size={18} /></div>
                  </div>
                  <div className="metric-value-wrap"><span className="metric-val">2</span></div>
                  <div className="metric-status text-red">Zone A &amp; E</div>
                </div>
                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Total Workers On-Site</span>
                    <div className="metric-icon-box icon-emerald"><Users size={18} /></div>
                  </div>
                  <div className="metric-value-wrap"><span className="metric-val">151</span></div>
                  <div className="metric-status text-green">Across all zones</div>
                </div>
                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Total Active Hazards</span>
                    <div className="metric-icon-box icon-amber"><Activity size={18} /></div>
                  </div>
                  <div className="metric-value-wrap"><span className="metric-val">24</span></div>
                  <div className="metric-status text-orange">Flagged today</div>
                </div>
              </div>

              {/* Zone cards grid */}
              <div className="zones-grid">
                {zones.map((z) => {
                  const c = riskBg(z.level);
                  return (
                    <div
                      key={z.id}
                      className="zone-card"
                      onClick={() => setSelectedZone(z)}
                    >
                      <div className="zone-card-top">
                        <div className="zone-id-badge" style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
                          {z.id}
                        </div>
                        <span className="zone-risk-chip" style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
                          {z.level} — {z.riskScore}/100
                        </span>
                      </div>
                      <h4 className="zone-name">{z.name}</h4>
                      <div className="zone-stats-row">
                        <span><Users size={13} /> {z.workers} workers</span>
                        <span><AlertTriangle size={13} /> {z.hazards} hazards</span>
                      </div>
                      <div className="zone-progress-wrap">
                        <div className="progress-track-bg">
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${z.riskScore}%`,
                              background: z.level === "High" ? "linear-gradient(90deg,#f43f5e,#f87171)"
                                        : z.level === "Medium" ? "linear-gradient(90deg,#f59e0b,#fbbf24)"
                                        : "linear-gradient(90deg,#10b981,#34d399)"
                            }}
                          />
                        </div>
                      </div>
                      <p className="zone-camera-label"><Camera size={12} /> {z.camera}</p>
                    </div>
                  );
                })}
              </div>

              {/* Zone detail modal */}
              {selectedZone && (
                <div className="modal-overlay" onClick={() => setSelectedZone(null)}>
                  <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h3>{selectedZone.name}</h3>
                      <button className="secondary-btn" style={{ padding: "4px 8px" }} onClick={() => setSelectedZone(null)}>
                        <X size={16} />
                      </button>
                    </div>
                    <div className="modal-body">
                      <div className="modal-stat-row">
                        <div className="modal-stat">
                          <span>Risk Score</span>
                          <strong style={{ color: levelColor(selectedZone.level) }}>{selectedZone.riskScore}/100</strong>
                        </div>
                        <div className="modal-stat">
                          <span>Risk Level</span>
                          <strong style={{ color: levelColor(selectedZone.level) }}>{selectedZone.level}</strong>
                        </div>
                        <div className="modal-stat">
                          <span>Workers</span>
                          <strong>{selectedZone.workers}</strong>
                        </div>
                        <div className="modal-stat">
                          <span>Hazards</span>
                          <strong>{selectedZone.hazards}</strong>
                        </div>
                      </div>
                      <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 14 }}>
                        <Camera size={13} style={{ marginRight: 6 }} />
                        Cameras: <b style={{ color: "#fff" }}>{selectedZone.camera}</b>
                      </p>
                      <button className="gradient-btn" style={{ marginTop: 18, width: "100%", justifyContent: "center" }}
                        onClick={() => { setSelectedZone(null); showToast(`Dispatching safety officer to ${selectedZone.name}.`); }}>
                        Dispatch Safety Officer to Zone
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </main>

      {/* Toast */}
      {toastMessage && (
        <div className="toast">
          <CheckCircle2 size={16} color="#34d399" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}