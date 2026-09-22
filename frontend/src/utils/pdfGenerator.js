// BuildSure AI - Professional PDF Report Generator
// Uses jsPDF to generate a comprehensive, multi-page vector PDF report

import { jsPDF } from "jspdf";

export function exportReportToPDF(reportData = {}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - (margin * 2);

  let y = 45;

  // Helper: check page break
  function checkPageBreak(neededHeight = 40) {
    if (y + neededHeight > pageHeight - 45) {
      addFooter();
      doc.addPage();
      y = 45;
      addHeaderStrip();
    }
  }

  function addHeaderStrip() {
    doc.setFillColor(15, 23, 42); // dark navy
    doc.rect(margin, y, contentWidth, 24, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text("BUILDSURE AI | ENTERPRISE CONSTRUCTION RISK INTELLIGENCE", margin + 10, y + 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`CONFIDENTIAL AUDIT | ${new Date().toLocaleDateString()}`, pageWidth - margin - 10, y + 15, { align: "right" });
    y += 36;
  }

  function addFooter() {
    const pageNum = doc.internal.getNumberOfPages();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "BuildSure AI Multi-Agent Network v4.0 — Certified Autonomous Safety & Risk Monitoring",
      margin,
      pageHeight - 20
    );
    doc.text(
      `Page ${pageNum}`,
      pageWidth - margin,
      pageHeight - 20,
      { align: "right" }
    );
  }

  // --- TOP HEADER ---
  addHeaderStrip();

  // Document Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text("Executive Construction Risk & Compliance Audit", margin, y);
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text("Project: Hudson Yards Phase 2 — Commercial High-Rise (North Gate Sector)", margin, y);
  y += 14;
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} | Report ID: REP-AUDIT-${new Date().getFullYear()}-M4`, margin, y);
  y += 20;

  // Thin separator
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 18;

  // --- EXECUTIVE KPI CARDS ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("1. Executive Enterprise Performance Indicators", margin, y);
  y += 14;

  const kpiWidth = (contentWidth - 30) / 4;
  const kpis = [
    { label: "Project Risk Score", val: `${reportData.projectRiskScore || 82}/100`, sub: "Optimal Control", color: [16, 185, 129] },
    { label: "PPE Compliance", val: `${reportData.ppeComplianceRate || 92}%`, sub: "Site Standard Met", color: [16, 185, 129] },
    { label: "Incidents Prevented", val: `${reportData.incidentsPrevented || 67}`, sub: "YTD Autonomous", color: [59, 130, 246] },
    { label: "Cost Savings", val: `${reportData.costSavings || "$2.4M"}`, sub: "Underwriting / Claims", color: [168, 85, 247] }
  ];

  kpis.forEach((kpi, idx) => {
    const kx = margin + idx * (kpiWidth + 10);
    // Background card box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(kx, y, kpiWidth, 54, 4, 4, "FD");

    // Indicator top accent
    doc.setFillColor(...kpi.color);
    doc.rect(kx, y, kpiWidth, 3, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, kx + 8, y + 16);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.val, kx + 8, y + 34);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.sub, kx + 8, y + 46);
  });

  y += 68;

  // --- SECTION 2: MULTI-AGENT STATUS & AUDIT METRICS ---
  checkPageBreak(80);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("2. Multi-Agent Performance & Governance Status", margin, y);
  y += 14;

  const agentColumns = [
    { name: "Site Risk Agent", stat: "98% Efficiency", note: "Spatial Hazard Detection Active" },
    { name: "Safety Agent", stat: "94% Accuracy", note: "PPE & Worker Behavioral Tracking" },
    { name: "Compliance Agent", stat: "98% Compliance", note: "OSHA 1926 Standards Evaluated" },
    { name: "Insurance Agent", stat: "92% Risk Precision", note: "Loss-Control Rating: Grade B" }
  ];

  agentColumns.forEach((ag) => {
    checkPageBreak(24);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, y, contentWidth, 20, 3, 3, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(ag.name, margin + 8, y + 13);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129);
    doc.text(ag.stat, margin + 180, y + 13);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(ag.note, margin + 280, y + 13);

    y += 24;
  });

  y += 10;

  // --- SECTION 3: REGULATORY COMPLIANCE VIOLATIONS (OSHA 1926) ---
  checkPageBreak(100);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("3. Documented Regulatory Violations & Directives (OSHA 1926)", margin, y);
  y += 14;

  const violations = reportData.violations || [
    { rule_id: "RULE-PPE-01", standard: "OSHA 1926.100", title: "Head Protection", severity: "High", recommendation: "Mandatory hardhat enforcement at all perimeter turnstiles." },
    { rule_id: "RULE-PPE-02", standard: "OSHA 1926.28", title: "High-Visibility Vest", severity: "Medium", recommendation: "Issue certified reflective vests for transit across haul zones." },
    { rule_id: "RULE-SITE-04", standard: "OSHA 1926.600", title: "Machinery Proximity", severity: "Medium", recommendation: "Establish 15-foot barricaded swing radius around active excavator." }
  ];

  // Table header
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 20, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("Rule ID", margin + 6, y + 13);
  doc.text("Standard", margin + 80, y + 13);
  doc.text("Title / Violation", margin + 170, y + 13);
  doc.text("Severity", margin + 280, y + 13);
  doc.text("Corrective Directive", margin + 340, y + 13);
  y += 20;

  violations.forEach((v, idx) => {
    checkPageBreak(26);
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(margin, y, contentWidth, 22, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(79, 70, 229);
    doc.text(v.rule_id || "RULE-GEN", margin + 6, y + 14);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    doc.text(v.standard || "OSHA 1926", margin + 80, y + 14);
    doc.text(v.title || "Safety Discrepancy", margin + 170, y + 14);

    if (v.severity === "High") {
      doc.setTextColor(225, 29, 72);
      doc.setFont("helvetica", "bold");
    } else {
      doc.setTextColor(217, 119, 6);
      doc.setFont("helvetica", "normal");
    }
    doc.text(v.severity || "Medium", margin + 280, y + 14);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    const recText = doc.splitTextToSize(v.recommendation || "Verify compliance.", contentWidth - 345);
    doc.text(recText[0] || "", margin + 340, y + 14);

    y += 22;
  });

  y += 14;

  // --- SECTION 4: PREDICTIVE INCIDENT RISK FORECAST ---
  checkPageBreak(120);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("4. Construction Risk Intelligence Engine — Incident Forecast", margin, y);
  y += 14;

  const predicted = reportData.predictedIncidents || [
    { type: "Overhead Struck-By Impact", prob: "72%", window: "Next 4–8 Hours", action: "Establish exclusion zone below crane swing; verify 100% hardhat adherence." },
    { type: "Heavy Equipment Pinch Point", prob: "64%", window: "During Haul Shift", action: "Deploy dedicated ground spotters with dual radios and high-visibility cones." },
    { type: "Slip, Trip & Perimeter Edge Fall", prob: "48%", window: "Shift Transition", action: "Conduct pre-shift housekeeping sweep of primary transit decks." }
  ];

  predicted.forEach((item) => {
    checkPageBreak(36);
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(margin, y, contentWidth, 32, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(153, 27, 27);
    doc.text(`Potential Incident: ${item.type}`, margin + 8, y + 13);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 38, 38);
    doc.text(`Probability: ${item.prob} (${item.window})`, pageWidth - margin - 150, y + 13);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Mitigation: ${item.action}`, margin + 8, y + 25);

    y += 36;
  });

  y += 10;

  // --- SECTION 5: INSURANCE EXPOSURE & LOSS CONTROL DIRECTIVES ---
  checkPageBreak(90);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("5. Insurance Underwriting & Executive Action Directives", margin, y);
  y += 14;

  const directives = [
    "Enforce mandatory safety stand-down for all crews in Zone A until 100% hardhat and high-vis vest compliance is restored.",
    "Position physical jersey barriers between the excavator operating envelope and pedestrian paths.",
    "Log automated OSHA 1926 compliance checkpoint report into the contractor central repository for audit attestation.",
    "Transmit weekly synthesized risk telemetry report to carrier underwriting portal for loss-control premium credits."
  ];

  directives.forEach((dir, i) => {
    checkPageBreak(22);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(79, 70, 229);
    doc.text(`[Directive 0${i + 1}]`, margin, y + 11);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    const dText = doc.splitTextToSize(dir, contentWidth - 75);
    doc.text(dText, margin + 70, y + 11);

    y += 18;
  });

  // Disclaimer block
  checkPageBreak(45);
  y += 10;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 32, 3, 3, "FD");

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "Compliance & Underwriting Notice: This audit document is compiled automatically by BuildSure AI Multi-Agent Network. " +
    "Data reflects visual hazard recognition, PPE tracking, and standard OSHA 29 CFR 1926 evaluation. " +
    "Certified for internal governance, contractor compliance audits, and insurer loss-control reviews.",
    margin + 8,
    y + 12,
    { maxWidth: contentWidth - 16 }
  );

  addFooter();

  // Trigger browser download
  const filename = `BuildSure_Executive_Risk_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
  return filename;
}
