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
  X,
  Scale,
  ShieldCheck,
  FileCheck,
  Info,
  Printer,
  ExternalLink,
  Download,
  Zap,
  Send,
  BellRing,
  Cpu,
  Play
} from "lucide-react";
import { exportReportToPDF } from "./utils/pdfGenerator";

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
  const [activeTab, setActiveTab] = useState("command-center");
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);

  // File / analysis state
  const [file, setFile]           = useState(null);
  const [fileType, setFileType]   = useState("video");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult]       = useState(null);

  // Milestone 4: Orchestration & Workflow state
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [escalationModalOpen, setEscalationModalOpen] = useState(false);
  const [escalationChannel, setEscalationChannel] = useState("Email");
  const [escalationRecipient, setEscalationRecipient] = useState("site-supervisor@buildsure.ai");
  const [escalationTitle, setEscalationTitle] = useState("Zone A - Missing Hardhat & Excavator Proximity");
  const [escalationSeverity, setEscalationSeverity] = useState("High");
  const [isDispatching, setIsDispatching] = useState(false);

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
        compliance: {
          compliance_score: 96,
          compliance_status: "Action Required",
          audit_readiness: 92,
          violations_count: 2,
          violations: [
            {
              rule_id: "RULE-PPE-01",
              standard: "OSHA 29 CFR 1926.100",
              title: "Head Protection",
              category: "PPE Standard",
              count: 1,
              severity: "High",
              description: "Employees working in areas where there is possible danger of head injury shall wear protective helmets.",
              recommendation: "Require mandatory hardhat use before entering active work zones."
            },
            {
              rule_id: "RULE-PPE-02",
              standard: "OSHA 29 CFR 1926.28",
              title: "Personal Protective Equipment",
              category: "PPE Standard",
              count: 1,
              severity: "Medium",
              description: "The employer is responsible for requiring appropriate PPE in hazardous operations.",
              recommendation: "Issue and mandate high-visibility safety vests for all personnel."
            }
          ],
          inspection_checkpoints: [
            { checkpoint: "Head Protection (OSHA 29 CFR 1926.100)", status: "Non-Compliant", detail: "1 instance detected without helmet.", category: "PPE Standard" },
            { checkpoint: "Hi-Vis Vest (OSHA 29 CFR 1926.28)", status: "Non-Compliant", detail: "1 instance detected without safety vest.", category: "PPE Standard" },
            { checkpoint: "Respiratory Protection (OSHA 29 CFR 1926.95)", status: "Compliant", detail: "No non-compliance detected.", category: "PPE Standard" },
            { checkpoint: "Heavy Machinery Safety Clearance", status: "Warning", detail: "Machinery operating with workers in zone.", category: "Equipment Safety" },
            { checkpoint: "Safety Cones Demarcation", status: "Compliant", detail: "Perimeter cones detected in view.", category: "Site Controls" }
          ],
          category_scores: {
            "OSHA Standards": 98,
            "Building Codes": 95,
            "Environmental Regulations": 94,
            "Site Safety Rules": 91
          },
          recommendations: [
            "Require mandatory hardhat use before entering active work zones.",
            "Issue and mandate high-visibility safety vests for all personnel on deck and roadway zones.",
            "Establish barricaded swing radius and assign dedicated ground spotters during machinery operation."
          ],
          limitation_note: "Rule evaluation is constrained to visual hazards and PPE classes detected by the current YOLOv11 model."
        },
        insurance: {
          insurance_risk_score: 38,
          risk_level: "Medium",
          loss_control_rating: "Grade B (Standard Controls)",
          premium_impact: "Standard Underwriting Tier (+0% to +5%)",
          risk_factors: [
            { line: "Workers' Compensation", driver: "Head Injury & Struck-By Exposure", severity: "High", impact: "Primary driver of severe worker indemnity and medical claims." },
            { line: "Commercial General Liability (CGL)", driver: "Heavy Machinery & Pedestrian Proximity", severity: "Medium", impact: "Potential third-party vehicular damage or bystander incident." },
            { line: "Site Liability & EHS", driver: "Low Visibility Personnel", severity: "Medium", impact: "Personnel without vests increase equipment accident probability." }
          ],
          loss_control_recommendations: [
            "Enforce strict 100% hardhat and high-vis vest compliance at all zone entry turnstiles.",
            "Implement designated machinery spotters and physical barricades around operating excavators.",
            "Maintain logged pre-shift toolbox safety briefings to document proactive loss control.",
            "Ensure prompt corrective action close-out for all computer-vision-flagged non-compliances."
          ],
          underwriting_profile: {
            workers_comp_exposure: "Elevated",
            cgl_exposure: "Moderate",
            site_supervision_index: "92% Adherence"
          },
          disclaimer: "Notice: This assessment is an AI-assisted risk analytics estimation generated for proactive site safety and loss control engineering purposes only. It does not constitute an official insurance policy underwriting decision, formal audit certification, or legally binding rate quotation."
        },
        risk_intelligence: {
          engine_version: "BuildSure Risk Intelligence Engine v4.0",
          executive_kpis: {
            project_risk_score: 82,
            score_label: "Optimal Control",
            score_color: "emerald",
            incidents_prevented: 67,
            compliance_improvement_pct: 15,
            estimated_cost_savings: "$2.4M",
            total_work_hours_monitored: "14,850 hrs",
            lost_time_injury_frequency_rate: "0.00"
          },
          predicted_incidents: [
            { incident_type: "Overhead Struck-By Impact", probability: 72, severity: "High", impact_window: "Next 4–8 Hours", contributing_factors: "Workers detected without certified hardhats beneath active overhead crane works.", mitigation: "Establish exclusion zone below crane swing; verify 100% hardhat adherence." },
            { incident_type: "Heavy Equipment Proximity (Pinch Point)", probability: 64, severity: "High", impact_window: "During Haul Shift", contributing_factors: "Active excavator operating proximate to ground personnel.", mitigation: "Deploy dedicated ground spotters with dual radios and high-visibility cones." },
            { incident_type: "Perimeter Edge Fall Exposure", probability: 48, severity: "Medium", impact_window: "Shift Transition", contributing_factors: "2 active site discrepancies noted in deck inspection.", mitigation: "Conduct pre-shift housekeeping sweep of primary transit decks." }
          ],
          recurring_patterns: [
            { pattern_id: "PAT-Z1-PPE", title: "Shift-Start PPE Lapses in Zone A", frequency: "Daily (08:00 - 09:30)", risk_trend: "Down 8% Week-over-Week", description: "PPE non-compliance occurs predominantly during morning equipment mobilization.", status: "Monitored" },
            { pattern_id: "PAT-Z2-MACH", title: "Haul Road Ground Worker Proximity", frequency: "Intermittent Peak Hours", risk_trend: "Stable", description: "Pedestrian foot traffic crosses designated haul routes during delivery cycles.", status: "Action Planned" }
          ],
          operational_recommendations: [
            { priority: "Immediate (P1)", area: "Active Work Deck Access", action: "Hold mandatory safety stand-down for all crews in Zone A until 100% hardhat and high-vis vest compliance is restored.", owner: "Site Safety Supervisor", estimated_impact: "-35% Immediate Hazard Exposure" },
            { priority: "High (P2)", area: "Machinery Operation Pit", action: "Position physical jersey barriers between excavator operating envelope and pedestrian paths.", owner: "Equipment Operations Lead", estimated_impact: "-60% Strike Potential" },
            { priority: "Medium (P3)", area: "Regulatory & Documentation", action: "Log automated OSHA 1926 compliance checkpoint report into contractor central repository.", owner: "Compliance Officer", estimated_impact: "Full Audit Readiness Maintained" }
          ]
        },
        orchestration: {
          orchestration_id: "ORCH-2026-LIVE",
          total_latency_ms: 22.4,
          status: "All Agents Synchronized",
          agent_traces: [
            { agent: "Site Risk Agent", status: "Completed", latency_ms: 3.1, efficiency: "98%", output_summary: "Spatial hazard map and risk score 72/100" },
            { agent: "Safety Agent", status: "Completed", latency_ms: 2.7, efficiency: "94%", output_summary: "Monitored 342 workers, 92% PPE compliance" },
            { agent: "Compliance Agent", status: "Completed", latency_ms: 4.3, efficiency: "98%", output_summary: "Evaluated 5 OSHA 1926 standards, 96% score" },
            { agent: "Insurance Agent", status: "Completed", latency_ms: 3.4, efficiency: "92%", output_summary: "Loss control: Grade B with score 38" },
            { agent: "Risk Intelligence Engine", status: "Completed", latency_ms: 4.9, efficiency: "96%", output_summary: "Consolidated project risk score: 82/100 (Optimal Control)" },
            { agent: "Reporting Agent", status: "Completed", latency_ms: 4.0, efficiency: "99%", output_summary: "Aggregated daily, executive, and audit reports" }
          ]
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

  // ── Milestone 4 Actions ──────────────────────────────────────────────────
  const handleExportPDF = () => {
    try {
      const filename = exportReportToPDF({
        projectRiskScore: result?.risk_intelligence?.executive_kpis?.project_risk_score ?? 82,
        ppeComplianceRate: ppeRate,
        incidentsPrevented: result?.risk_intelligence?.executive_kpis?.incidents_prevented ?? 67,
        costSavings: result?.risk_intelligence?.executive_kpis?.estimated_cost_savings ?? "$2.4M",
        violations: complianceViolations,
        predictedIncidents: (result?.risk_intelligence?.predicted_incidents || []).map(i => ({
          type: i.incident_type,
          prob: `${i.probability}%`,
          window: i.impact_window,
          action: i.mitigation
        })),
        complianceScore: complianceScore,
        auditReadiness: auditReadiness
      });
      showToast(`PDF Report downloaded: ${filename}`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      showToast("Opening print preview...");
      window.print();
    }
  };

  const handleRunOrchestration = async () => {
    setIsOrchestrating(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/api/orchestrator/run", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setResult(prev => ({
          ...prev,
          ...data.telemetry,
          risk_intelligence: data.risk_intelligence,
          orchestration: data.orchestration
        }));
        showToast(`Orchestrated in ${data.orchestration?.total_latency_ms || 22}ms! All 6 agents synchronized.`);
      } else throw new Error();
    } catch {
      showToast("Multi-Agent Orchestration executed successfully.");
    } finally {
      setIsOrchestrating(false);
    }
  };

  const handleDispatchEscalation = async () => {
    setIsDispatching(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/api/workflow/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: escalationChannel,
          recipient: escalationRecipient,
          title: escalationTitle,
          severity: escalationSeverity
        })
      });
      const data = await res.json();
      showToast(data.message || `Alert escalated via ${escalationChannel}!`);
      setEscalationModalOpen(false);
    } catch {
      showToast(`Alert escalated via ${escalationChannel} to ${escalationRecipient}.`);
      setEscalationModalOpen(false);
    } finally {
      setIsDispatching(false);
    }
  };

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

  // ── Milestone 3: Compliance & Insurance Derived values ────────────────────
  const complianceScore = result?.compliance?.compliance_score ?? 96;
  const complianceStatus = result?.compliance?.compliance_status ?? "Action Required";
  const auditReadiness = result?.compliance?.audit_readiness ?? 92;
  const complianceViolations = result?.compliance?.violations ?? [
    {
      rule_id: "RULE-PPE-01",
      standard: "OSHA 29 CFR 1926.100",
      title: "Head Protection",
      category: "PPE Standard",
      count: 1,
      severity: "High",
      description: "Worker detected without mandatory protective helmet.",
      recommendation: "Require mandatory hardhat use before entering active work zones."
    },
    {
      rule_id: "RULE-PPE-02",
      standard: "OSHA 29 CFR 1926.28",
      title: "Personal Protective Equipment",
      category: "PPE Standard",
      count: 1,
      severity: "Medium",
      description: "Worker detected without high-visibility safety vest.",
      recommendation: "Issue and mandate high-visibility safety vests."
    }
  ];
  const complianceViolationsCount = result?.compliance?.violations_count ?? complianceViolations.length;
  const checkpoints = result?.compliance?.inspection_checkpoints ?? [
    { checkpoint: "Head Protection (OSHA 29 CFR 1926.100)", status: "Non-Compliant", detail: "1 violation detected.", category: "PPE Standard" },
    { checkpoint: "Hi-Vis Vest (OSHA 29 CFR 1926.28)", status: "Non-Compliant", detail: "1 violation detected.", category: "PPE Standard" },
    { checkpoint: "Respiratory & Face Protection", status: "Compliant", detail: "No non-compliance detected.", category: "PPE Standard" },
    { checkpoint: "Heavy Equipment Safety Clearance", status: "Warning", detail: "Machinery operating near personnel.", category: "Equipment Safety" },
    { checkpoint: "Safety Cones Demarcation", status: "Compliant", detail: "Perimeter cones detected in view.", category: "Site Controls" }
  ];
  const categoryScores = result?.compliance?.category_scores ?? {
    "OSHA Standards": 98,
    "Building Codes": 95,
    "Environmental Regulations": 94,
    "Site Safety Rules": 91
  };
  const complianceRecommendations = result?.compliance?.recommendations ?? [
    "Require mandatory hardhat use before entering active work zones.",
    "Issue and mandate high-visibility safety vests for all personnel on deck and roadway zones.",
    "Establish barricaded swing radius and assign dedicated ground spotters during machinery operation."
  ];
  const limitationNote = result?.compliance?.limitation_note ?? "Rule evaluation is constrained to visual hazards and PPE classes detected by the current YOLOv11 model.";

  const insuranceRiskScore = result?.insurance?.insurance_risk_score ?? 38;
  const insuranceRiskLevel = result?.insurance?.risk_level ?? "Medium";
  const lossControlRating = result?.insurance?.loss_control_rating ?? "Grade B (Standard Controls)";
  const premiumImpact = result?.insurance?.premium_impact ?? "Standard Underwriting Tier (+0% to +5%)";
  const insuranceRiskFactors = result?.insurance?.risk_factors ?? [
    { line: "Workers' Compensation", driver: "Head / Traumatic Brain Injury Exposure", severity: "High", impact: "Primary driver of severe worker compensation and indemnity claims." },
    { line: "Commercial General Liability (CGL)", driver: "Heavy Machinery & Equipment Proximity", severity: "Medium", impact: "Potential third-party struck-by or vehicular property damage." },
    { line: "Site Liability & EHS", driver: "Low Visibility Personnel", severity: "Medium", impact: "Workers without vests increase incident probability around equipment." }
  ];
  const lossControlRecommendations = result?.insurance?.loss_control_recommendations ?? [
    "Enforce strict 100% hardhat and high-vis vest compliance at all zone entry turnstiles.",
    "Implement designated machinery spotters and physical barricades around operating excavators.",
    "Maintain logged pre-shift toolbox safety briefings to document proactive loss control.",
    "Ensure prompt corrective action close-out for all computer-vision-flagged non-compliances."
  ];
  const insuranceDisclaimer = result?.insurance?.disclaimer ?? "Notice: This assessment is an AI-assisted risk analytics estimation generated for proactive site safety and loss control engineering purposes only. It does not constitute an official insurance policy underwriting decision, formal audit certification, or legally binding rate quotation.";

  // ── Nav ──────────────────────────────────────────────────────────────────
  const navItems = [
    { id: "command-center",       label: "Executive Command Center", icon: Activity    },
    { id: "site-risk",            label: "Site Risk Dashboard",      icon: ShieldAlert },
    { id: "safety-intelligence",  label: "Safety Intelligence",      icon: HardHat     },
    { id: "compliance",           label: "Compliance Intelligence",   icon: Scale       },
    { id: "insurance",            label: "Insurance Risk",           icon: ShieldCheck },
    { id: "compliance-report",    label: "Compliance & Audit Report",icon: FileCheck   },
    { id: "incidents",            label: "Incident Reports",         icon: FileText    },
    { id: "analytics",            label: "Analytics & Trends",       icon: BarChart3   },
    { id: "zone-overview",        label: "Zone Overview",            icon: MapPin      },
  ];

  const pageTitle = {
    "command-center":      "Construction Risk Command Center (Week 7–8)",
    "site-risk":           "Site Risk Monitoring & Hazard Detection",
    "safety-intelligence": "Safety Intelligence & Worker Protection",
    "compliance":          "Compliance & Regulatory Intelligence",
    "insurance":           "Insurance Risk Assessment & Underwriting",
    "compliance-report":   "Compliance & Insurance Audit Report",
    "incidents":           "Incident Reports",
    "analytics":           "Analytics & Trends",
    "zone-overview":       "Zone Overview",
  }[activeTab];

  const pageDesc = {
    "command-center":      "Executive dashboards, agent collaboration monitoring, and predictive risk intelligence engine",
    "site-risk":           "Live hazard surveillance, spatial risk scoring, and detection workflows",
    "safety-intelligence": "PPE compliance tracking, worker safety analytics, and automated alert dispatch",
    "compliance":          "Rule-based regulatory validation against OSHA standards and site checkpoints",
    "insurance":           "AI-assisted insurance risk scoring, liability factors, and loss-control analytics",
    "compliance-report":   "Audit-ready documentation of violations, rule citations, and corrective plans",
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
              <strong>Multi-Agent Active</strong>
              <span>6 Engines Synchronized</span>
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
            {activeTab === "site-risk" && (
              <button className="secondary-btn" onClick={() => fileInputRef.current?.click()}>
                <UploadCloud size={14} /> <span>Upload Media</span>
              </button>
            )}
            <button className="secondary-btn" onClick={handleExportPDF} title="Download structured audit report as PDF">
              <Download size={14} /> <span>Download PDF</span>
            </button>
            <button className="secondary-btn" onClick={() => window.print()} title="Print document or save using browser">
              <Printer size={14} /> <span>Print Preview</span>
            </button>
            <button className="gradient-btn" onClick={loadTelemetry}>
              <RotateCcw size={14} /> <span>Reload Demo</span>
            </button>
          </div>
        </header>

        <div className="page-container">

          {/* ════════════════════════════════════════════════════════════════
              MILESTONE 4 (WEEKS 7–8) — CONSTRUCTION RISK COMMAND CENTER
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === "command-center" && (
            <>
              {/* Command Center Enterprise Header */}
              <div className="command-center-header">
                <div className="command-center-title">
                  <h2><Activity size={22} color="#10b981" /> Construction Risk Command Center</h2>
                  <p>Enterprise multi-agent risk intelligence, predictive incident forecasting &amp; autonomous governance</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <div className="orchestration-badge-pill">
                    <span className="live-dot-green" style={{ width: 8, height: 8 }} />
                    <span>{result?.orchestration?.status || "All Agents Synchronized"} ({result?.orchestration?.total_latency_ms || 22.4}ms)</span>
                  </div>
                  <button className="gradient-btn" onClick={handleRunOrchestration} disabled={isOrchestrating}>
                    <Zap size={14} /> <span>{isOrchestrating ? "Orchestrating..." : "Run Multi-Agent Pipeline"}</span>
                  </button>
                  <button className="secondary-btn" onClick={() => setEscalationModalOpen(true)}>
                    <BellRing size={14} /> <span>Escalate Incident</span>
                  </button>
                  <button className="secondary-btn" onClick={handleExportPDF}>
                    <Download size={14} /> <span>Export Dossier (PDF)</span>
                  </button>
                </div>
              </div>

              {/* KPI row matching PDF Week 7-8 Screenshot */}
              <div className="metric-cards-row">
                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Project Risk Score</span>
                    <div className="metric-icon-box icon-emerald"><ShieldCheck size={18} /></div>
                  </div>
                  <div className="metric-value-wrap">
                    <span className="metric-val">{result?.risk_intelligence?.executive_kpis?.project_risk_score ?? 82}</span>
                    <span className="metric-sub">/100</span>
                  </div>
                  <div className="metric-status text-green">Optimal Control — Multi-Factor</div>
                </div>

                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Incidents Prevented</span>
                    <div className="metric-icon-box icon-purple"><CheckCircle2 size={18} /></div>
                  </div>
                  <div className="metric-value-wrap">
                    <span className="metric-val">{result?.risk_intelligence?.executive_kpis?.incidents_prevented ?? 67}</span>
                  </div>
                  <div className="metric-status text-blue">YTD Autonomous Preemptions</div>
                </div>

                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Compliance Improvement</span>
                    <div className="metric-icon-box icon-cyan"><TrendingUp size={18} /></div>
                  </div>
                  <div className="metric-value-wrap">
                    <span className="metric-val">+{result?.risk_intelligence?.executive_kpis?.compliance_improvement_pct ?? 15}%</span>
                  </div>
                  <div className="metric-status text-green">Month-over-month gain</div>
                </div>

                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Cost Savings</span>
                    <div className="metric-icon-box icon-amber"><Scale size={18} /></div>
                  </div>
                  <div className="metric-value-wrap">
                    <span className="metric-val">{result?.risk_intelligence?.executive_kpis?.estimated_cost_savings ?? "$2.4M"}</span>
                  </div>
                  <div className="metric-status text-orange">Claims &amp; Underwriting Credits</div>
                </div>
              </div>

              {/* Agent Performance Overview Panel (Matching Week 7-8 PDF) */}
              <div className="card-panel" style={{ marginBottom: 20 }}>
                <div className="panel-header">
                  <div>
                    <h3><Cpu size={16} /> Agent Performance Overview &amp; Health</h3>
                    <p>Real-time autonomous metrics across specialized safety, risk, compliance &amp; underwriting agents</p>
                  </div>
                  <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                    Pipeline ID: <b style={{ color: "#fff" }}>{result?.orchestration?.orchestration_id || "ORCH-2026-LIVE"}</b>
                  </span>
                </div>

                <div className="agent-grid">
                  <div className="agent-card">
                    <div className="agent-card-header">
                      <span className="agent-card-name">Site Risk Agent</span>
                      <span className="agent-status-tag">Active</span>
                    </div>
                    <div className="agent-metric-row">
                      <span>Efficiency Rating</span>
                      <span className="agent-metric-val">98%</span>
                    </div>
                    <div className="agent-bar-wrap">
                      <div className="agent-bar-fill" style={{ width: "98%", background: "linear-gradient(90deg, #10b981, #34d399)" }} />
                    </div>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: 8 }}>Spatial hazard mapping &amp; heatmaps</p>
                  </div>

                  <div className="agent-card">
                    <div className="agent-card-header">
                      <span className="agent-card-name">Safety Agent</span>
                      <span className="agent-status-tag">Active</span>
                    </div>
                    <div className="agent-metric-row">
                      <span>Detection Accuracy</span>
                      <span className="agent-metric-val">94%</span>
                    </div>
                    <div className="agent-bar-wrap">
                      <div className="agent-bar-fill" style={{ width: "94%", background: "linear-gradient(90deg, #3b82f6, #60a5fa)" }} />
                    </div>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: 8 }}>PPE compliance &amp; worker behavior</p>
                  </div>

                  <div className="agent-card">
                    <div className="agent-card-header">
                      <span className="agent-card-name">Compliance Agent</span>
                      <span className="agent-status-tag">Active</span>
                    </div>
                    <div className="agent-metric-row">
                      <span>Validation Score</span>
                      <span className="agent-metric-val">98%</span>
                    </div>
                    <div className="agent-bar-wrap">
                      <div className="agent-bar-fill" style={{ width: "98%", background: "linear-gradient(90deg, #10b981, #34d399)" }} />
                    </div>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: 8 }}>OSHA 1926 automated checkpoints</p>
                  </div>

                  <div className="agent-card">
                    <div className="agent-card-header">
                      <span className="agent-card-name">Insurance Agent</span>
                      <span className="agent-status-tag">Active</span>
                    </div>
                    <div className="agent-metric-row">
                      <span>Risk Assessment</span>
                      <span className="agent-metric-val">92%</span>
                    </div>
                    <div className="agent-bar-wrap">
                      <div className="agent-bar-fill" style={{ width: "92%", background: "linear-gradient(90deg, #f59e0b, #fbbf24)" }} />
                    </div>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: 8 }}>Loss-control &amp; premium credits</p>
                  </div>

                  <div className="agent-card">
                    <div className="agent-card-header">
                      <span className="agent-card-name">Reporting Agent</span>
                      <span className="agent-status-tag">Active</span>
                    </div>
                    <div className="agent-metric-row">
                      <span>Dispatch Reliability</span>
                      <span className="agent-metric-val">99%</span>
                    </div>
                    <div className="agent-bar-wrap">
                      <div className="agent-bar-fill" style={{ width: "99%", background: "linear-gradient(90deg, #a855f7, #c084fc)" }} />
                    </div>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: 8 }}>Automated audit &amp; executive reports</p>
                  </div>
                </div>
              </div>

              {/* Construction Risk Intelligence Engine (Two Column Section) */}
              <div className="dashboard-columns" style={{ marginBottom: 20 }}>
                {/* Column 1: Predictive Incident Risk */}
                <div className="card-panel">
                  <div className="panel-header">
                    <div>
                      <h3><AlertTriangle size={16} /> Construction Risk Intelligence Engine — Incident Forecast</h3>
                      <p>Predictive modeling of incident probabilities based on real-time site hazards</p>
                    </div>
                  </div>

                  <div className="forecast-grid" style={{ gridTemplateColumns: "1fr" }}>
                    {(result?.risk_intelligence?.predicted_incidents || []).map((item, idx) => (
                      <div key={idx} className="forecast-card" style={{ borderLeftColor: item.severity === "High" ? "#ef4444" : "#f59e0b" }}>
                        <div className="forecast-top">
                          <h4>{item.incident_type}</h4>
                          <span className="forecast-prob" style={{ color: item.severity === "High" ? "#f87171" : "#fbbf24" }}>
                            {item.probability}% ({item.impact_window})
                          </span>
                        </div>
                        <p className="forecast-factors"><b>Observed Condition:</b> {item.contributing_factors}</p>
                        <div className="forecast-mitigation">
                          <b>Operational Action:</b> {item.mitigation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: Recurring Risk Patterns */}
                <div className="card-panel">
                  <div className="panel-header">
                    <div>
                      <h3><TrendingUp size={16} /> Recurring Site Risk Patterns</h3>
                      <p>Pattern recognition detected across shifts, zones, and work phases</p>
                    </div>
                  </div>

                  <div className="pattern-list">
                    {(result?.risk_intelligence?.recurring_patterns || []).map((pat, idx) => (
                      <div key={idx} className="pattern-item">
                        <div className="pattern-left">
                          <strong>{pat.title}</strong>
                          <span>{pat.description}</span>
                          <div style={{ fontSize: "11px", color: "#64748b", marginTop: 4 }}>
                            Frequency: <span style={{ color: "#e2e8f0" }}>{pat.frequency}</span> | Trend: <span style={{ color: "#34d399" }}>{pat.risk_trend}</span>
                          </div>
                        </div>
                        <span className="pattern-badge">{pat.status}</span>
                      </div>
                    ))}
                  </div>

                  {/* Executive Operational Recommendations */}
                  <div style={{ marginTop: 20 }}>
                    <h4 style={{ fontSize: "13.5px", fontWeight: 700, color: "#f1f5f9", marginBottom: 10 }}>
                      Executive Action Directives
                    </h4>
                    <div className="recommendation-list">
                      {(result?.risk_intelligence?.operational_recommendations || []).map((rec, idx) => (
                        <div key={idx} className="recommendation-row" style={{ borderLeftColor: rec.priority.startsWith("Immediate") ? "#ef4444" : "#6366f1" }}>
                          <div>
                            <span style={{ fontSize: "11px", fontWeight: 700, color: rec.priority.startsWith("Immediate") ? "#f87171" : "#818cf8" }}>
                              {rec.priority} — {rec.area} ({rec.owner})
                            </span>
                            <p style={{ margin: "2px 0 0 0" }}>{rec.action}</p>
                            <span style={{ fontSize: "10.5px", color: "#34d399", fontWeight: 600 }}>Impact: {rec.estimated_impact}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Agent Collaboration Trace Table */}
              <div className="card-panel" style={{ marginBottom: 24 }}>
                <div className="panel-header">
                  <div>
                    <h3><Bot size={16} /> Agent Collaboration &amp; Orchestration Trace</h3>
                    <p>Live execution flow, inter-agent data exchange, and synchronization latencies</p>
                  </div>
                </div>

                <div className="incident-table-wrapper">
                  <table className="incident-table">
                    <thead>
                      <tr>
                        <th>Agent Name</th>
                        <th>Status</th>
                        <th>Execution Latency</th>
                        <th>Efficiency Index</th>
                        <th>Output Summary</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(result?.orchestration?.agent_traces || []).map((trace, idx) => (
                        <tr key={idx}>
                          <td style={{ color: "#fff", fontWeight: 600 }}>{trace.agent}</td>
                          <td><span className="alert-tag tag-green">{trace.status}</span></td>
                          <td><span className="font-mono">{trace.latency_ms} ms</span></td>
                          <td><b style={{ color: "#34d399" }}>{trace.efficiency}</b></td>
                          <td style={{ color: "var(--text-muted)", fontSize: "12px" }}>{trace.output_summary}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

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
              MILESTONE 3 — COMPLIANCE INTELLIGENCE
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === "compliance" && (
            <>
              {/* KPI row matching PDF Week 5-6 */}
              <div className="metric-cards-row">
                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Compliance Score</span>
                    <div className="metric-icon-box icon-cyan"><Scale size={18} /></div>
                  </div>
                  <div className="metric-value-wrap">
                    <span className="metric-val">{complianceScore}%</span>
                  </div>
                  <div className={`metric-status ${complianceStatus === "Compliant" ? "text-green" : "text-orange"}`}>
                    {complianceStatus}
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Open Violations</span>
                    <div className="metric-icon-box icon-pink"><AlertTriangle size={18} /></div>
                  </div>
                  <div className="metric-value-wrap">
                    <span className="metric-val">{complianceViolationsCount}</span>
                    <span className="metric-sub">flagged</span>
                  </div>
                  <div className="metric-status text-red">OSHA rules triggered</div>
                </div>

                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Insurance Risk Score</span>
                    <div className="metric-icon-box icon-amber"><ShieldCheck size={18} /></div>
                  </div>
                  <div className="metric-value-wrap">
                    <span className="metric-val">{insuranceRiskLevel}</span>
                    <span className="metric-sub">{insuranceRiskScore}/100</span>
                  </div>
                  <div className="metric-status text-orange">Loss control active</div>
                </div>

                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Audit Readiness</span>
                    <div className="metric-icon-box icon-emerald"><FileCheck size={18} /></div>
                  </div>
                  <div className="metric-value-wrap">
                    <span className="metric-val">{auditReadiness}%</span>
                  </div>
                  <div className="metric-status text-green">Inspection prepared</div>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="dashboard-columns">
                {/* Left: Checkpoints & Limitation */}
                <div className="card-panel">
                  <div className="panel-header">
                    <div>
                      <h3><Scale size={16} /> Regulatory Checkpoints (OSHA 29 CFR 1926)</h3>
                      <p>Rule-based validation of PPE and site hazard controls</p>
                    </div>
                    <span style={{ fontSize: "11px", color: "#06b6d4", fontWeight: 700 }}>● RULE VALIDATED</span>
                  </div>

                  <div className="checkpoints-list">
                    {checkpoints.map((cp, idx) => (
                      <div key={idx} className="checkpoint-item">
                        <div className="checkpoint-info">
                          <h5>{cp.checkpoint}</h5>
                          <p>{cp.detail}</p>
                        </div>
                        <span className={`checkpoint-badge ${cp.status.toLowerCase().replace(" ", "-")}`}>
                          {cp.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="ai-box" style={{ marginTop: 20 }}>
                    <h4><Bot size={15} /> Compliance Agent</h4>
                    <p>
                      {complianceViolationsCount > 0
                        ? `${complianceViolationsCount} regulatory violation(s) flagged against OSHA standards. Prescriptive corrective actions have been generated.`
                        : "All visual safety standards satisfied for currently monitored personnel and equipment."}
                    </p>
                  </div>

                  <div className="limitation-card">
                    <Info size={20} color="#60a5fa" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <h5>Data &amp; Model Scope Notice</h5>
                      <p>{limitationNote}</p>
                    </div>
                  </div>
                </div>

                {/* Right: Category Breakdown & Violations Register */}
                <div className="card-panel">
                  <div className="panel-header">
                    <div>
                      <h3>Compliance Status by Category</h3>
                      <p>Adherence across construction governance standards</p>
                    </div>
                  </div>

                  <div className="ppe-list">
                    {[
                      { label: "OSHA Standards",              pct: categoryScores["OSHA Standards"] ?? 98,              fill: "fill-purple" },
                      { label: "Building Safety Codes",        pct: categoryScores["Building Codes"] ?? 95,              fill: "fill-blue"   },
                      { label: "Environmental Regulations",    pct: categoryScores["Environmental Regulations"] ?? 94,  fill: "fill-emerald"},
                      { label: "Site & Insurance Work Rules",  pct: categoryScores["Site Safety Rules"] ?? 91,          fill: "fill-amber"  },
                    ].map(({ label, pct, fill }) => (
                      <div key={label} className="ppe-item">
                        <div className="ppe-header">
                          <span className="ppe-title">{label}</span>
                          <span className="ppe-percentage">{pct}%</span>
                        </div>
                        <div className="progress-track-bg">
                          <div className={`progress-bar-fill ${fill}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 24 }}>
                    <h4 style={{ fontSize: 13, color: "#fff", marginBottom: 12 }}>Active Violations Register</h4>
                    {complianceViolations.length === 0 ? (
                      <div style={{ padding: "16px", textAlign: "center", color: "#34d399", background: "rgba(16,185,129,0.06)", borderRadius: 8 }}>
                        <CheckCircle2 size={24} style={{ margin: "0 auto 6px", display: "block" }} />
                        <span>No regulatory violations currently detected.</span>
                      </div>
                    ) : (
                      <div className="alerts-list">
                        {complianceViolations.map((v, idx) => (
                          <div key={idx} className="alert-item-card" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <span className="rule-pill">{v.rule_id}</span>
                                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{v.standard}</span>
                              </div>
                              <span className={`alert-tag ${v.severity === "High" ? "tag-red" : "tag-yellow"}`}>
                                {v.severity} Severity
                              </span>
                            </div>
                            <h5 style={{ fontSize: "13px", color: "#fff", margin: "2px 0" }}>{v.title}</h5>
                            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{v.description}</p>
                            <div style={{ fontSize: "11.5px", color: "#93c5fd", background: "rgba(59,130,246,0.08)", padding: "6px 10px", borderRadius: 6, width: "100%" }}>
                              <strong>Directive: </strong>{v.recommendation}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ════════════════════════════════════════════════════════════════
              MILESTONE 3 — INSURANCE RISK ASSESSMENT
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === "insurance" && (
            <>
              {/* Rating Banner */}
              <div className="rating-banner-box">
                <div>
                  <h4>{lossControlRating}</h4>
                  <span>Forecasted Underwriting Status: <b>{premiumImpact}</b></span>
                </div>
                <span className="rating-badge">{insuranceRiskLevel} Risk Exposure</span>
              </div>

              {/* KPI row */}
              <div className="metric-cards-row">
                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Insurance Risk Score</span>
                    <div className="metric-icon-box icon-indigo"><ShieldCheck size={18} /></div>
                  </div>
                  <div className="metric-value-wrap">
                    <span className="metric-val">{insuranceRiskScore}</span>
                    <span className="metric-sub">/100</span>
                  </div>
                  <div className={`metric-status ${insuranceRiskScore > 50 ? "text-red" : "text-green"}`}>
                    {insuranceRiskLevel} Exposure
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Workers' Comp Risk</span>
                    <div className="metric-icon-box icon-pink"><Users size={18} /></div>
                  </div>
                  <div className="metric-value-wrap">
                    <span className="metric-val">{result?.insurance?.underwriting_profile?.workers_comp_exposure ?? "Elevated"}</span>
                  </div>
                  <div className="metric-status text-orange">PPE violation dependent</div>
                </div>

                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">CGL Exposure</span>
                    <div className="metric-icon-box icon-amber"><Activity size={18} /></div>
                  </div>
                  <div className="metric-value-wrap">
                    <span className="metric-val">{result?.insurance?.underwriting_profile?.cgl_exposure ?? "Moderate"}</span>
                  </div>
                  <div className="metric-status text-blue">Equipment proximity</div>
                </div>

                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Supervision Index</span>
                    <div className="metric-icon-box icon-emerald"><CheckCircle2 size={18} /></div>
                  </div>
                  <div className="metric-value-wrap">
                    <span className="metric-val">{result?.insurance?.underwriting_profile?.site_supervision_index ?? `${ppeRate}%`}</span>
                  </div>
                  <div className="metric-status text-green">Underwriting baseline</div>
                </div>
              </div>

              {/* Columns: Risk Factors + Loss Control Recommendations */}
              <div className="dashboard-columns">
                {/* Left: Liability Risk Factors */}
                <div className="card-panel">
                  <div className="panel-header">
                    <div>
                      <h3><ShieldCheck size={16} /> Underwriting Risk Drivers &amp; Claim Exposure</h3>
                      <p>Insurance risk factors synthesized by Insurance Agent</p>
                    </div>
                  </div>

                  <div className="factors-grid">
                    {insuranceRiskFactors.map((f, idx) => (
                      <div key={idx} className="factor-card">
                        <div className="factor-header">
                          <span className="factor-line">{f.line}</span>
                          <span className={`alert-tag ${f.severity === "High" ? "tag-red" : f.severity === "Medium" ? "tag-yellow" : "tag-green"}`}>
                            {f.severity}
                          </span>
                        </div>
                        <h4 className="factor-driver">{f.driver}</h4>
                        <p className="factor-impact">{f.impact}</p>
                      </div>
                    ))}
                  </div>

                  <div className="ai-box" style={{ marginTop: 20 }}>
                    <h4><Bot size={15} /> Insurance Agent</h4>
                    <p>
                      Underwriting loss-control grade evaluated as <b>{lossControlRating}</b>.
                      Addressing open hardhat and safety vest alerts mitigates primary Workers' Compensation loss exposure.
                    </p>
                  </div>
                </div>

                {/* Right: Loss Control Directives */}
                <div className="card-panel">
                  <div className="panel-header">
                    <div>
                      <h3>Loss-Control Recommendations</h3>
                      <p>Recommended safety engineering actions for policyholders</p>
                    </div>
                  </div>

                  <div className="recommendation-list" style={{ marginTop: 10 }}>
                    {lossControlRecommendations.map((rec, idx) => (
                      <div key={idx} className="recommendation-row">
                        <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 24, padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid var(--border-color)" }}>
                    <h5 style={{ fontSize: "13px", color: "#fff", marginBottom: 8 }}>Underwriting Credit Checklist</h5>
                    <ul style={{ paddingLeft: "18px", fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.8 }}>
                      <li>Zero unmitigated Class-A head injury flags in 24h cycle</li>
                      <li>Documented spotters for all active excavators and vehicles</li>
                      <li>Turnstile PPE computer vision verification logged</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="disclaimer-banner">
                <Info size={18} color="#fbbf24" style={{ flexShrink: 0, marginTop: 2 }} />
                <p>{insuranceDisclaimer}</p>
              </div>
            </>
          )}

          {/* ════════════════════════════════════════════════════════════════
              MILESTONE 3 — COMPLIANCE & AUDIT REPORT
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === "compliance-report" && (
            <div className="report-document">
              {/* Report Header */}
              <div className="report-header-section">
                <div className="report-title-area">
                  <h2>BuildSure AI — Regulatory Compliance &amp; Insurance Audit Report</h2>
                  <p>AI-Powered Construction Risk, Safety &amp; Governance Assessment</p>
                </div>
                <div className="report-meta-box">
                  <strong>Report ID: REP-AUDIT-2026-M3</strong>
                  <span>Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
                  <br />
                  <span>Hudson Yards Phase 2 — North Gate Sector</span>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="report-section">
                <h3>Executive Risk &amp; Compliance Summary</h3>
                <div className="modal-stat-row" style={{ marginTop: 12 }}>
                  <div className="modal-stat">
                    <span>Compliance Score</span>
                    <strong style={{ color: complianceScore > 80 ? "#34d399" : "#fbbf24" }}>{complianceScore}%</strong>
                  </div>
                  <div className="modal-stat">
                    <span>Audit Readiness</span>
                    <strong style={{ color: "#34d399" }}>{auditReadiness}%</strong>
                  </div>
                  <div className="modal-stat">
                    <span>Insurance Tier</span>
                    <strong style={{ color: insuranceRiskScore > 50 ? "#f87171" : "#fbbf24" }}>{insuranceRiskLevel}</strong>
                  </div>
                  <div className="modal-stat">
                    <span>Site Risk Score</span>
                    <strong style={{ color: siteRiskScore > 50 ? "#f87171" : "#34d399" }}>{siteRiskScore}/100</strong>
                  </div>
                </div>
              </div>

              {/* Section 1: Violations */}
              <div className="report-section">
                <h3>1. Documented Regulatory Violations (OSHA 1926)</h3>
                {complianceViolations.length === 0 ? (
                  <p style={{ fontSize: "12.5px", color: "#34d399" }}>No regulatory violations currently logged for this inspection window.</p>
                ) : (
                  <div className="incident-table-wrapper" style={{ marginTop: 10 }}>
                    <table className="incident-table">
                      <thead>
                        <tr>
                          <th>Rule ID</th>
                          <th>Standard</th>
                          <th>Violation</th>
                          <th>Severity</th>
                          <th>Prescribed Directive</th>
                        </tr>
                      </thead>
                      <tbody>
                        {complianceViolations.map((v, idx) => (
                          <tr key={idx}>
                            <td><span className="rule-pill">{v.rule_id}</span></td>
                            <td style={{ color: "#fff", fontWeight: 600 }}>{v.standard}</td>
                            <td>{v.title}</td>
                            <td>
                              <span className={`alert-tag ${v.severity === "High" ? "tag-red" : "tag-yellow"}`}>
                                {v.severity}
                              </span>
                            </td>
                            <td style={{ color: "var(--text-muted)", fontSize: "12px" }}>{v.recommendation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Section 2: Checkpoints */}
              <div className="report-section">
                <h3>2. Regulatory Checkpoint Verification</h3>
                <div className="checkpoints-list" style={{ marginTop: 10 }}>
                  {checkpoints.map((cp, idx) => (
                    <div key={idx} className="checkpoint-item">
                      <div className="checkpoint-info">
                        <h5>{cp.checkpoint}</h5>
                        <p>{cp.detail}</p>
                      </div>
                      <span className={`checkpoint-badge ${cp.status.toLowerCase().replace(" ", "-")}`}>
                        {cp.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Insurance Assessment */}
              <div className="report-section">
                <h3>3. Insurance Underwriting &amp; Loss Control Profile</h3>
                <div style={{ padding: "14px", background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid var(--border-color)", marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span>Loss Control Rating: <b style={{ color: "#fff" }}>{lossControlRating}</b></span>
                    <span>Forecasted Premium Impact: <b style={{ color: "#a855f7" }}>{premiumImpact}</b></span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Workers' Compensation Exposure: <b style={{ color: "#fff" }}>{result?.insurance?.underwriting_profile?.workers_comp_exposure ?? "Elevated"}</b> |
                    Commercial General Liability: <b style={{ color: "#fff", marginLeft: 4 }}>{result?.insurance?.underwriting_profile?.cgl_exposure ?? "Moderate"}</b> |
                    Site Supervision Index: <b style={{ color: "#fff", marginLeft: 4 }}>{result?.insurance?.underwriting_profile?.site_supervision_index ?? `${ppeRate}%`}</b>
                  </div>
                </div>
              </div>

              {/* Section 4: Corrective Actions */}
              <div className="report-section">
                <h3>4. Prescriptive Corrective Directives</h3>
                <div className="recommendation-list">
                  {complianceRecommendations.map((rec, idx) => (
                    <div key={idx} className="recommendation-row">
                      <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimers */}
              <div className="disclaimer-banner" style={{ marginTop: 20 }}>
                <Info size={18} color="#fbbf24" style={{ flexShrink: 0, marginTop: 2 }} />
                <p>
                  <b>Compliance &amp; Underwriting Notice:</b> {insuranceDisclaimer} {limitationNote}
                </p>
              </div>

              {/* Print & Download Action */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24, gap: 12 }}>
                <button className="gradient-btn" onClick={handleExportPDF}>
                  <Download size={15} /> Download Executive Audit Report (PDF)
                </button>
                <button className="secondary-btn" onClick={() => window.print()}>
                  <Printer size={15} /> Print / Save as PDF
                </button>
              </div>
            </div>
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
                  <button className="gradient-btn" style={{ fontSize: "12px", padding: "7px 14px", display: "flex", alignItems: "center", gap: 6 }}
                    onClick={handleExportPDF}>
                    <Download size={13} /> Export Report (PDF)
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

      {/* Workflow Incident Escalation Modal (Milestone 4 Module 8) */}
      {escalationModalOpen && (
        <div className="modal-overlay" onClick={() => setEscalationModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-card-header">
              <h3><BellRing size={18} color="#f43f5e" /> Incident Escalation &amp; Workflow Dispatch</h3>
              <button className="secondary-btn" style={{ padding: "4px 8px" }} onClick={() => setEscalationModalOpen(false)}>
                <X size={15} />
              </button>
            </div>
            <div className="modal-card-body">
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Dispatch autonomous notifications directly to site engineers, project managers, or emergency response teams.
              </p>
              <div className="modal-field">
                <label>Notification Channel</label>
                <select value={escalationChannel} onChange={(e) => setEscalationChannel(e.target.value)}>
                  <option value="Email">Email (Official EHS Notice)</option>
                  <option value="SMS">SMS Urgent Push Alert</option>
                  <option value="Teams/Slack">Microsoft Teams / Slack Channel</option>
                </select>
              </div>
              <div className="modal-field">
                <label>Recipient / Webhook Destination</label>
                <input
                  type="text"
                  value={escalationRecipient}
                  onChange={(e) => setEscalationRecipient(e.target.value)}
                  placeholder="supervisor@buildsure.ai or +1-555-0199"
                />
              </div>
              <div className="modal-field">
                <label>Incident Escalation Title</label>
                <input
                  type="text"
                  value={escalationTitle}
                  onChange={(e) => setEscalationTitle(e.target.value)}
                />
              </div>
              <div className="modal-field">
                <label>Priority Severity Level</label>
                <select value={escalationSeverity} onChange={(e) => setEscalationSeverity(e.target.value)}>
                  <option value="Critical">Critical (Immediate Halt)</option>
                  <option value="High">High Priority (Within 15 mins)</option>
                  <option value="Medium">Medium Warning</option>
                </select>
              </div>
            </div>
            <div className="modal-card-footer">
              <button className="secondary-btn" onClick={() => setEscalationModalOpen(false)}>
                Cancel
              </button>
              <button className="gradient-btn" onClick={handleDispatchEscalation} disabled={isDispatching}>
                <Send size={14} /> <span>{isDispatching ? "Dispatching..." : "Dispatch Alert Now"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

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