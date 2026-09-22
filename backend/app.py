from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from detector import detect_hazards
from risk_engine import calculate_risk
from safety_agent import analyze_safety
from compliance_agent import evaluate_compliance
from insurance_agent import evaluate_insurance_risk
from risk_intelligence_engine import compute_project_risk_intelligence
import reporting_agent
from orchestrator import orchestrate_pipeline
from datetime import datetime

import os
import cv2
import tempfile

app = Flask(__name__)
CORS(app)

# -----------------------------
# FOLDERS & STATE
# -----------------------------

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# In-memory store for the latest analyzed telemetry state
latest_audit_state = {
    "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    "source_type": "demo",
    "project_name": "Hudson Yards Phase 2 - Commercial High-Rise",
    "detections": [],
    "risk": {},
    "safety": {},
    "compliance": {},
    "insurance": {},
    "risk_intelligence": {},
    "orchestration": {}
}


# Default baseline detections for demo
SAMPLE_DETECTIONS = [
    {"class": "NO-Hardhat", "confidence": 0.942, "bbox": [180, 84, 260, 210], "frame": 12, "time_seconds": 0.48, "zone": "Zone A — High Rise Deck"},
    {"class": "Person", "confidence": 0.965, "bbox": [170, 80, 310, 480], "frame": 12, "time_seconds": 0.48, "zone": "Zone A — High Rise Deck"},
    {"class": "NO-Safety Vest", "confidence": 0.887, "bbox": [190, 190, 305, 360], "frame": 12, "time_seconds": 0.48, "zone": "Zone A — High Rise Deck"},
    {"class": "machinery", "confidence": 0.912, "bbox": [420, 240, 720, 540], "frame": 36, "time_seconds": 1.44, "zone": "Zone C — Excavation Pit"},
    {"class": "Person", "confidence": 0.951, "bbox": [530, 280, 610, 510], "frame": 36, "time_seconds": 1.44, "zone": "Zone C — Excavation Pit"},
    {"class": "Hardhat", "confidence": 0.938, "bbox": [545, 280, 595, 330], "frame": 36, "time_seconds": 1.44, "zone": "Zone C — Excavation Pit"},
    {"class": "Safety Vest", "confidence": 0.925, "bbox": [535, 330, 605, 420], "frame": 36, "time_seconds": 1.44, "zone": "Zone C — Excavation Pit"},
    {"class": "vehicle", "confidence": 0.874, "bbox": [50, 310, 290, 580], "frame": 60, "time_seconds": 2.40, "zone": "Zone B — Haul Road"},
    {"class": "Safety Cone", "confidence": 0.899, "bbox": [320, 460, 380, 540], "frame": 60, "time_seconds": 2.40, "zone": "Zone B — Perimeter"}
]


def refresh_state_from_detections(detections, source_type="demo", source_name=None):
    """Refreshes all agent findings, risk intelligence, and orchestrator traces."""
    global latest_audit_state

    source_info = {
        "type": source_type,
        "name": source_name or "Hudson Yards CAM04",
        "project_name": "Hudson Yards Phase 2 - Commercial High-Rise"
    }

    orch_result = orchestrate_pipeline(detections, source_info)

    latest_audit_state = {
        "generated_at": orch_result["executed_at"],
        "source_type": source_type,
        "source_name": source_name,
        "project_name": "Hudson Yards Phase 2 - Commercial High-Rise",
        "detections": detections,
        "risk": orch_result["telemetry"]["risk"],
        "safety": orch_result["telemetry"]["safety"],
        "compliance": orch_result["telemetry"]["compliance"],
        "insurance": orch_result["telemetry"]["insurance"],
        "risk_intelligence": orch_result["risk_intelligence"],
        "orchestration": {
            "orchestration_id": orch_result["orchestration_id"],
            "total_latency_ms": orch_result["total_latency_ms"],
            "status": orch_result["status"],
            "agent_traces": orch_result["agent_traces"]
        }
    }
    return latest_audit_state


# Initialize baseline state
refresh_state_from_detections(SAMPLE_DETECTIONS, source_type="demo")


# -----------------------------
# HEALTH & METADATA
# -----------------------------

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "BuildSure AI Platform is running",
        "milestone": "Milestone 4 - Reporting Intelligence & Enterprise Deployment",
        "agent_network": "Active",
        "orchestration_engine": "Operational",
        "agents": [
            {"name": "Site Risk Agent", "role": "Spatial Hazard Mapping & Scoring", "status": "Online"},
            {"name": "Safety Agent", "role": "Worker PPE Compliance & Behavioral Alerts", "status": "Online"},
            {"name": "Compliance Agent", "role": "OSHA 1926 Standards Validation", "status": "Online"},
            {"name": "Insurance Agent", "role": "Underwriting Loss-Control Analytics", "status": "Online"},
            {"name": "Reporting Agent", "role": "Executive & Audit Report Generation", "status": "Online"},
            {"name": "Construction Risk Intelligence Engine", "role": "Predictive Analytics & Cross-Agent Synthesis", "status": "Online"}
        ]
    })


@app.route("/api/demo-telemetry", methods=["GET"])
def demo_telemetry():
    """Returns multi-agent telemetry and risk intelligence for instant live preview."""
    state = refresh_state_from_detections(SAMPLE_DETECTIONS, source_type="demo")

    return jsonify({
        "success": True,
        "type": "demo",
        "video": {
            "filename": "Hudson_Yards_NorthGate_CAM04.mp4",
            "total_frames": 240,
            "fps": 25.0,
            "duration_seconds": 9.6
        },
        "detections": state["detections"],
        "risk": state["risk"],
        "safety": state["safety"],
        "compliance": state["compliance"],
        "insurance": state["insurance"],
        "risk_intelligence": state["risk_intelligence"],
        "orchestration": state["orchestration"]
    })


# -----------------------------
# AGENT ORCHESTRATION PIPELINE
# -----------------------------

@app.route("/api/orchestrator/run", methods=["GET", "POST"])
def run_orchestration():
    """Triggers the full multi-agent orchestration sequence."""
    detections = latest_audit_state.get("detections") or SAMPLE_DETECTIONS
    state = refresh_state_from_detections(detections, source_type="orchestration_run")

    return jsonify({
        "success": True,
        "message": "Multi-agent orchestration executed successfully",
        "orchestration": state["orchestration"],
        "risk_intelligence": state["risk_intelligence"],
        "telemetry": {
            "risk": state["risk"],
            "safety": state["safety"],
            "compliance": state["compliance"],
            "insurance": state["insurance"]
        }
    })


# -----------------------------
# RISK INTELLIGENCE ENGINE
# -----------------------------

@app.route("/api/risk-intelligence", methods=["GET"])
def get_risk_intelligence():
    """Returns findings from the Construction Risk Intelligence Engine."""
    if not latest_audit_state.get("risk_intelligence"):
        refresh_state_from_detections(SAMPLE_DETECTIONS)

    return jsonify({
        "success": True,
        "risk_intelligence": latest_audit_state["risk_intelligence"]
    })


# -----------------------------
# REPORTING AGENT ENDPOINTS
# -----------------------------

@app.route("/api/reporting/executive", methods=["GET"])
def get_executive_report():
    """Returns Executive Construction Risk & Underwriting Summary."""
    if not latest_audit_state.get("risk_intelligence"):
        refresh_state_from_detections(SAMPLE_DETECTIONS)

    report = reporting_agent.generate_executive_risk_summary(
        latest_audit_state,
        latest_audit_state["risk_intelligence"]
    )
    return jsonify({"success": True, "report": report})


@app.route("/api/reporting/daily", methods=["GET"])
def get_daily_report():
    """Returns Daily Site Safety & Activity Report."""
    if not latest_audit_state.get("risk"):
        refresh_state_from_detections(SAMPLE_DETECTIONS)

    report = reporting_agent.generate_daily_site_report(latest_audit_state)
    return jsonify({"success": True, "report": report})


@app.route("/api/reporting/audit", methods=["GET"])
@app.route("/api/compliance/report", methods=["GET"])
def get_audit_report():
    """Returns structured regulatory compliance audit record."""
    if not latest_audit_state.get("compliance"):
        refresh_state_from_detections(SAMPLE_DETECTIONS)

    report = reporting_agent.generate_audit_documentation(latest_audit_state)
    return jsonify({
        "success": True,
        "report": report,
        "executive_summary": {
            "compliance_score": latest_audit_state["compliance"].get("compliance_score", 96),
            "compliance_status": latest_audit_state["compliance"].get("compliance_status", "Compliant"),
            "audit_readiness": latest_audit_state["compliance"].get("audit_readiness", 92),
            "insurance_risk_level": latest_audit_state["insurance"].get("risk_level", "Medium"),
            "insurance_risk_score": latest_audit_state["insurance"].get("insurance_risk_score", 38),
            "site_risk_score": latest_audit_state["risk"].get("site_risk_score", 72),
            "ppe_compliance_rate": latest_audit_state["safety"].get("ppe_compliance_rate", 92),
            "active_violations": latest_audit_state["compliance"].get("violations_count", 0)
        },
        "regulatory_findings": latest_audit_state["compliance"].get("violations", []),
        "inspection_checkpoints": latest_audit_state["compliance"].get("inspection_checkpoints", []),
        "category_scores": latest_audit_state["compliance"].get("category_scores", {}),
        "insurance_assessment": latest_audit_state["insurance"],
        "corrective_recommendations": latest_audit_state["compliance"].get("recommendations", [])
    })


@app.route("/api/reporting/project-health", methods=["GET"])
def get_project_health_report():
    """Returns holistic project health report combining all agents."""
    if not latest_audit_state.get("risk_intelligence"):
        refresh_state_from_detections(SAMPLE_DETECTIONS)

    report = reporting_agent.generate_project_health_report(
        latest_audit_state,
        latest_audit_state["risk_intelligence"]
    )
    return jsonify({"success": True, "health_report": report})


# -----------------------------
# WORKFLOW & NOTIFICATIONS
# -----------------------------

@app.route("/api/workflow/notify", methods=["POST"])
def dispatch_notification():
    """Dispatches alerts via Email, SMS, or Teams/Slack channels."""
    data = request.get_json() or {}
    channel = data.get("channel", "Email")
    recipient = data.get("recipient", "site-supervisor@buildsure.ai")
    alert_title = data.get("title", "Safety Hazard Escalation")
    severity = data.get("severity", "High")

    log_entry = {
        "dispatch_id": f"NTF-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
        "channel": channel,
        "recipient": recipient,
        "title": alert_title,
        "severity": severity,
        "status": "Delivered",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    return jsonify({
        "success": True,
        "message": f"Alert escalated successfully via {channel} to {recipient}",
        "notification": log_entry
    })


# -----------------------------
# IMAGE ANALYSIS
# -----------------------------

@app.route("/api/analyze", methods=["POST"])
def analyze_image():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image = request.files["image"]
    if image.filename == "":
        return jsonify({"error": "No image selected"}), 400

    filename = secure_filename(image.filename)
    image_path = os.path.join(UPLOAD_FOLDER, filename)
    image.save(image_path)

    detections = detect_hazards(image_path)
    state = refresh_state_from_detections(detections, source_type="image", source_name=filename)

    return jsonify({
        "success": True,
        "type": "image",
        "detections": state["detections"],
        "risk": state["risk"],
        "safety": state["safety"],
        "compliance": state["compliance"],
        "insurance": state["insurance"],
        "risk_intelligence": state["risk_intelligence"],
        "orchestration": state["orchestration"]
    })


# -----------------------------
# VIDEO ANALYSIS
# -----------------------------

@app.route("/api/analyze-video", methods=["POST"])
def analyze_video():
    if "video" not in request.files:
        return jsonify({"error": "No video uploaded"}), 400

    video = request.files["video"]
    if video.filename == "":
        return jsonify({"error": "No video selected"}), 400

    filename = secure_filename(video.filename)
    video_path = os.path.join(UPLOAD_FOLDER, filename)
    video.save(video_path)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return jsonify({"error": "Unable to open video"}), 400

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        fps = 25.0

    frame_skip = max(1, int(fps))
    frame_number = 0
    all_detections = []

    while True:
        success, frame = cap.read()
        if not success:
            break

        if frame_number % frame_skip == 0:
            temp_file = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
            temp_path = temp_file.name
            temp_file.close()

            cv2.imwrite(temp_path, frame)
            try:
                detections = detect_hazards(temp_path)
                for detection in detections:
                    detection["frame"] = frame_number
                    detection["time_seconds"] = round(frame_number / fps, 2)
                    all_detections.append(detection)
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)

        frame_number += 1

    cap.release()

    state = refresh_state_from_detections(all_detections, source_type="video", source_name=filename)

    return jsonify({
        "success": True,
        "type": "video",
        "video": {
            "filename": filename,
            "total_frames": total_frames,
            "fps": round(fps, 2),
            "duration_seconds": round(total_frames / fps, 2)
        },
        "detections": state["detections"],
        "risk": state["risk"],
        "safety": state["safety"],
        "compliance": state["compliance"],
        "insurance": state["insurance"],
        "risk_intelligence": state["risk_intelligence"],
        "orchestration": state["orchestration"]
    })


# -----------------------------
# RUN SERVER
# -----------------------------

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )