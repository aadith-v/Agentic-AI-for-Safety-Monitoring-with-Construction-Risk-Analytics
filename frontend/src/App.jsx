import { useState } from "react";
import {
  LayoutDashboard,
  ShieldAlert,
  HardHat,
  ClipboardCheck,
  FileWarning,
  BarChart3,
  Settings,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Camera,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Bot,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import "./App.css";

const riskData = [
  { day: "Mon", risk: 52 },
  { day: "Tue", risk: 58 },
  { day: "Wed", risk: 49 },
  { day: "Thu", risk: 67 },
  { day: "Fri", risk: 61 },
  { day: "Sat", risk: 74 },
  { day: "Sun", risk: 68 },
];

const defaultHazards = [
  {
    type: "No Hardhat",
    location: "Zone A — Tower 02",
    severity: "High",
    score: 85,
    time: "2 min ago",
  },
  {
    type: "No Safety Vest",
    location: "Zone B — Ground",
    severity: "Medium",
    score: 68,
    time: "8 min ago",
  },
  {
    type: "Machinery Detected",
    location: "Zone C — Excavation",
    severity: "Medium",
    score: 56,
    time: "14 min ago",
  },
  {
    type: "Vehicle Activity",
    location: "Zone A — Entry",
    severity: "Low",
    score: 31,
    time: "21 min ago",
  },
];

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("Dashboard");

  // Video analysis state
  const [video, setVideo] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [videoResult, setVideoResult] = useState(null);

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Site Risk", icon: ShieldAlert },
    { name: "Safety Monitoring", icon: HardHat },
    { name: "Compliance", icon: ClipboardCheck },
    { name: "Insurance", icon: FileWarning },
    { name: "Reports", icon: BarChart3 },
  ];

  // -----------------------------
  // VIDEO ANALYSIS
  // -----------------------------

  const analyzeVideo = async () => {
    if (!video) return;

    setAnalyzing(true);
    setVideoResult(null);

    const formData = new FormData();
    formData.append("video", video);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/analyze-video",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Video analysis failed");
      }

      setVideoResult(data);
    } catch (error) {
      console.error(error);
      alert("Video analysis failed. Make sure Flask is running.");
    } finally {
      setAnalyzing(false);
    }
  };

  // -----------------------------
  // REAL DATA
  // -----------------------------

  const realRisk = videoResult?.risk;

  const currentRiskScore =
    realRisk?.site_risk_score ?? 68;

  const currentRiskLevel =
    realRisk?.risk_level ?? "High";

  const activeHazards =
    realRisk?.total_detections ?? 12;

  const detectedHazards =
    videoResult?.detections || [];

  return (
    <div className="app">

      {/* ================= SIDEBAR ================= */}

      <aside
        className={`sidebar ${collapsed ? "collapsed" : ""}`}
      >
        <div className="brand">

          <div className="brand-icon">
            <ShieldAlert size={21} />
          </div>

          {!collapsed && (
            <div>
              <h2>GUARDEX</h2>
              <span>Risk Intelligence</span>
            </div>
          )}

        </div>

        <div className="sidebar-section">

          {!collapsed && (
            <p className="section-label">
              MAIN MENU
            </p>
          )}

          <nav>

            {navItems.map((item) => {

              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  className={`nav-item ${
                    active === item.name
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setActive(item.name)
                  }
                  title={
                    collapsed
                      ? item.name
                      : ""
                  }
                >

                  <Icon size={19} />

                  {!collapsed && (
                    <span>{item.name}</span>
                  )}

                </button>
              );
            })}

          </nav>

        </div>

        <div className="sidebar-bottom">

          <button className="nav-item">
            <Settings size={19} />

            {!collapsed && (
              <span>Settings</span>
            )}
          </button>

          <button
            className="collapse-btn"
            onClick={() =>
              setCollapsed(!collapsed)
            }
          >

            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}

            {!collapsed && (
              <span>
                Collapse sidebar
              </span>
            )}

          </button>

          {!collapsed && (
            <div className="user-card">

              <div className="avatar">
                AV
              </div>

              <div className="user-info">
                <strong>Aadith V</strong>
                <span>
                  Administrator
                </span>
              </div>

              <MoreHorizontal size={17} />

            </div>
          )}

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="main">

        {/* TOPBAR */}

        <header className="topbar">

          <div className="search-box">

            <Search size={18} />

            <input
              placeholder="Search site, hazard or report..."
            />

          </div>

          <div className="top-actions">

            <div className="status">

              <span className="status-dot"></span>

              System operational

            </div>

            <button className="icon-btn">

              <Bell size={19} />

              <span className="notification-dot"></span>

            </button>

            <div className="profile-mini">
              AV
            </div>

          </div>

        </header>

        <div className="content">

          {/* PAGE HEADER */}

          <div className="page-header">

            <div>

              <div className="breadcrumb">

                <span>GUARDEX</span>
                <span>/</span>
                <span>Dashboard</span>

              </div>

              <h1>
                Construction Risk Overview
              </h1>

              <p>
                Real-time intelligence across your
                construction operations.
              </p>

            </div>

            <button className="date-btn">

              <Clock3 size={17} />

              Last 7 days

            </button>

          </div>

          {/* ================= STAT CARDS ================= */}

          <section className="stats-grid">

            <StatCard
              title="Overall Risk Score"
              value={currentRiskScore}
              suffix="/100"
              label={`${currentRiskLevel.toUpperCase()} RISK`}
              icon={<ShieldAlert />}
              trend="+8.2%"
              trendUp
              danger={
                currentRiskScore >= 50
              }
            />

            <StatCard
              title="Active Hazards"
              value={activeHazards}
              label={
                videoResult
                  ? "From video analysis"
                  : "Needs attention"
              }
              icon={<AlertTriangle />}
              trend={
                videoResult
                  ? "LIVE"
                  : "+3"
              }
              trendUp
            />

            <StatCard
              title="Safety Incidents"
              value="04"
              label="This week"
              icon={<Activity />}
              trend="-12.5%"
              trendUp={false}
              positive
            />

            <StatCard
              title="Safety Compliance"
              value="86"
              suffix="%"
              label="Above target"
              icon={<CheckCircle2 />}
              trend="+4.8%"
              trendUp
              positive
            />

          </section>

          {/* ================= CHART + MONITORING ================= */}

          <section className="middle-grid">

            {/* RISK CHART */}

            <div className="panel risk-panel">

              <div className="panel-header">

                <div>

                  <h3>Risk Trend</h3>

                  <p>
                    Project-wide risk score over time
                  </p>

                </div>

                <button className="more-btn">
                  <MoreHorizontal size={19} />
                </button>

              </div>

              <div className="chart-container">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <AreaChart data={riskData}>

                    <defs>

                      <linearGradient
                        id="riskGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >

                        <stop
                          offset="0%"
                          stopOpacity={0.22}
                        />

                        <stop
                          offset="100%"
                          stopOpacity={0}
                        />

                      </linearGradient>

                    </defs>

                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip />

                    <Area
                      type="monotone"
                      dataKey="risk"
                      strokeWidth={2.5}
                      fill="url(#riskGradient)"
                      fillOpacity={1}
                    />

                  </AreaChart>

                </ResponsiveContainer>

              </div>

            </div>

            {/* SITE MONITORING */}

            <div className="panel monitoring-panel">

              <div className="panel-header">

                <div>

                  <h3>
                    Site Monitoring
                  </h3>

                  <p>
                    Construction video analysis
                  </p>

                </div>

                <span className="live-badge">

                  <span></span>

                  LIVE

                </span>

              </div>

              <div className="monitoring-screen">

                <div className="camera-overlay">

                  <div className="camera-title">

                    <Camera size={15} />

                    CAM-02 • ZONE A

                  </div>

                  <span className="recording">
                    ● REC
                  </span>

                </div>

                {/* VIDEO AREA */}

                {video ? (

                  <video
                    className="video-preview"
                    src={
                      URL.createObjectURL(video)
                    }
                    controls
                  />

                ) : (

                  <div className="monitor-placeholder">

                    <Camera size={40} />

                    <span>
                      Upload site monitoring video
                    </span>

                    <small>
                      MP4 / AVI / MOV
                    </small>

                  </div>

                )}

                {/* CONTROLS */}

                <div className="video-controls">

                  <label className="upload-btn">

                    Choose Video

                    <input
                      type="file"
                      accept="video/*"
                      hidden
                      onChange={(e) => {

                        const selected =
                          e.target.files[0];

                        if (selected) {
                          setVideo(selected);
                          setVideoResult(null);
                        }

                      }}
                    />

                  </label>

                  {video && (

                    <button
                      className="analyze-btn"
                      onClick={analyzeVideo}
                      disabled={analyzing}
                    >

                      {analyzing
                        ? "Analyzing..."
                        : "Analyze Video"}

                    </button>

                  )}

                </div>

                <div className="camera-footer">

                  <span>
                    Detections:{" "}
                    <b>
                      {videoResult
                        ? videoResult.detections.length
                        : "—"}
                    </b>
                  </span>

                  <span>
                    Risk:{" "}
                    <b>
                      {videoResult
                        ? `${currentRiskScore}/100`
                        : "—"}
                    </b>
                  </span>

                </div>

              </div>

            </div>

          </section>

          {/* ================= HAZARDS ================= */}

          <section className="bottom-grid">

            <div className="panel hazards-panel">

              <div className="panel-header">

                <div>

                  <h3>
                    Recent Hazards
                  </h3>

                  <p>
                    Latest detected safety events
                  </p>

                </div>

                <button className="view-btn">
                  View all
                </button>

              </div>

              <div className="hazard-list">

                {videoResult &&
                detectedHazards.length > 0
                  ? detectedHazards
                      .slice(0, 5)
                      .map(
                        (hazard, index) => {

                          const severity =
                            getSeverity(
                              hazard.class
                            );

                          return (
                            <HazardRow
                              key={index}
                              type={formatClassName(
                                hazard.class
                              )}
                              location={`Frame ${
                                hazard.frame ?? "-"
                              }`}
                              severity={severity}
                              score={Math.round(
                                hazard.confidence *
                                  100
                              )}
                              time={
                                hazard.time_seconds !==
                                undefined
                                  ? `${hazard.time_seconds}s`
                                  : "Detected"
                              }
                            />
                          );
                        }
                      )
                  : defaultHazards.map(
                      (hazard, index) => (
                        <HazardRow
                          key={index}
                          {...hazard}
                        />
                      )
                    )}

              </div>

            </div>

            {/* ================= AI ================= */}

            <div className="panel ai-panel">

              <div className="ai-header">

                <div className="ai-icon">
                  <Bot size={21} />
                </div>

                <div>

                  <h3>
                    AI Recommendation
                  </h3>

                  <span>
                    GUARDEX Intelligence Engine
                  </span>

                </div>

              </div>

              <div className="recommendation">

                <div className="recommendation-tag">
                  {videoResult
                    ? "LIVE ANALYSIS"
                    : "HIGH PRIORITY"}
                </div>

                <h4>
                  {videoResult
                    ? getRecommendation(
                        currentRiskLevel
                      )
                    : "Immediate PPE inspection recommended"}
                </h4>

                <p>

                  {videoResult
                    ? `Video analysis detected ${videoResult.detections.length} objects. Current site risk is ${currentRiskScore}/100 (${currentRiskLevel}).`
                    : "Multiple workers without required head protection should be checked in Zone A. This can significantly contribute to the project risk score."}

                </p>

                <div className="recommendation-footer">

                  <div>

                    <span>
                      Confidence
                    </span>

                    <strong>
                      {videoResult
                        ? getAverageConfidence(
                            detectedHazards
                          )
                        : "94%"}
                    </strong>

                  </div>

                  <button>
                    Review action
                    <ArrowUpRight size={16} />
                  </button>

                </div>

              </div>

            </div>

          </section>

          {/* FOOTER */}

          <footer>

            <span>
              GUARDEX AI • Construction Risk Intelligence
            </span>

            <span>
              {videoResult
                ? "Analysis completed"
                : "Last updated just now"}
            </span>

          </footer>

        </div>

      </main>

    </div>
  );
}


/* ================= STAT CARD ================= */

function StatCard({
  title,
  value,
  suffix,
  label,
  icon,
  trend,
  trendUp,
  danger,
  positive,
}) {

  return (

    <div
      className={`stat-card ${
        danger ? "danger-card" : ""
      }`}
    >

      <div className="stat-top">

        <span>
          {title}
        </span>

        <div
          className={`stat-icon ${
            positive ? "positive" : ""
          }`}
        >
          {icon}
        </div>

      </div>

      <div className="stat-value">

        {value}

        {suffix && (
          <small>
            {suffix}
          </small>
        )}

      </div>

      <div className="stat-bottom">

        <span>
          {label}
        </span>

        <span
          className={`trend ${
            positive
              ? "positive-text"
              : trendUp
              ? "negative-text"
              : ""
          }`}
        >

          {trendUp ? (
            <ArrowUpRight size={14} />
          ) : (
            <ArrowDownRight size={14} />
          )}

          {trend}

        </span>

      </div>

    </div>
  );
}


/* ================= HAZARD ROW ================= */

function HazardRow({
  type,
  location,
  severity,
  score,
  time,
}) {

  return (

    <div className="hazard-row">

      <div
        className={`severity-icon ${
          severity.toLowerCase()
        }`}
      >

        <AlertTriangle size={16} />

      </div>

      <div className="hazard-main">

        <strong>
          {type}
        </strong>

        <span>
          {location}
        </span>

      </div>

      <div
        className={`severity ${
          severity.toLowerCase()
        }`}
      >

        {severity}

      </div>

      <div className="risk-number">
        {score}
      </div>

      <div className="hazard-time">
        {time}
      </div>

    </div>
  );
}


/* ================= HELPERS ================= */

function getSeverity(className) {

  if (
    className === "NO-Hardhat" ||
    className === "NO-Mask" ||
    className === "NO-Safety Vest"
  ) {
    return "High";
  }

  if (
    className === "machinery" ||
    className === "vehicle"
  ) {
    return "Medium";
  }

  return "Low";
}


function formatClassName(name) {

  return name
    .replace("NO-", "No ")
    .replace("-", " ");
}


function getAverageConfidence(detections) {

  if (!detections.length) {
    return "0%";
  }

  const average =
    detections.reduce(
      (sum, item) =>
        sum + item.confidence,
      0
    ) / detections.length;

  return `${Math.round(
    average * 100
  )}%`;
}


function getRecommendation(level) {

  if (level === "Critical") {
    return "Immediate site intervention recommended";
  }

  if (level === "High") {
    return "High-priority safety inspection recommended";
  }

  if (level === "Medium") {
    return "Review detected safety conditions";
  }

  return "Site conditions currently appear low risk";
}


export default App;