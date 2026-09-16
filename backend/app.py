from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from detector import detect_hazards
from risk_engine import calculate_risk
from safety_agent import analyze_safety

import os
import cv2
import tempfile

app = Flask(__name__)
CORS(app)

# -----------------------------
# FOLDERS
# -----------------------------

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# -----------------------------
# HEALTH CHECK
# -----------------------------

@app.route("/api/health")
def health():
    return jsonify({
        "status": "BuildSure AI API is running",
        "agent_network": "Active",
        "agents": ["Site Risk Agent", "Safety Agent", "Compliance Agent", "Risk Intelligence Engine"]
    })


@app.route("/api/demo-telemetry", methods=["GET"])
def demo_telemetry():
    """Returns sample pre-computed multi-agent telemetry for instant live preview."""
    sample_detections = [
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
    risk = calculate_risk(sample_detections)
    safety = analyze_safety(sample_detections)
    return jsonify({
        "success": True,
        "type": "demo",
        "video": {
            "filename": "Hudson_Yards_NorthGate_CAM04.mp4",
            "total_frames": 240,
            "fps": 25.0,
            "duration_seconds": 9.6
        },
        "detections": sample_detections,
        "risk": risk,
        "safety": safety
    })


# -----------------------------
# IMAGE ANALYSIS
# -----------------------------

@app.route("/api/analyze", methods=["POST"])
def analyze_image():

    if "image" not in request.files:
        return jsonify({
            "error": "No image uploaded"
        }), 400

    image = request.files["image"]

    if image.filename == "":
        return jsonify({
            "error": "No image selected"
        }), 400

    filename = secure_filename(image.filename)

    image_path = os.path.join(
        UPLOAD_FOLDER,
        filename
    )

    image.save(image_path)

    # YOLO detection
    detections = detect_hazards(image_path)

    # Risk calculation
    risk = calculate_risk(detections)
    
    # Safety calculation
    safety = analyze_safety(detections)

    return jsonify({
        "success": True,
        "type": "image",
        "detections": detections,
        "risk": risk,
        "safety": safety
    })


# -----------------------------
# VIDEO ANALYSIS
# -----------------------------

@app.route("/api/analyze-video", methods=["POST"])
def analyze_video():

    if "video" not in request.files:
        return jsonify({
            "error": "No video uploaded"
        }), 400

    video = request.files["video"]

    if video.filename == "":
        return jsonify({
            "error": "No video selected"
        }), 400

    filename = secure_filename(video.filename)

    video_path = os.path.join(
        UPLOAD_FOLDER,
        filename
    )

    video.save(video_path)

    # Open video
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        return jsonify({
            "error": "Unable to open video"
        }), 400

    total_frames = int(
        cap.get(cv2.CAP_PROP_FRAME_COUNT)
    )

    fps = cap.get(
        cv2.CAP_PROP_FPS
    )

    if fps <= 0:
        fps = 25

    # Analyze selected frames
    frame_skip = max(
        1,
        int(fps)
    )

    frame_number = 0

    all_detections = []

    while True:

        success, frame = cap.read()

        if not success:
            break

        # Analyze approximately one frame per second
        if frame_number % frame_skip == 0:

            # Temporary frame file
            temp_file = tempfile.NamedTemporaryFile(
                suffix=".jpg",
                delete=False
            )

            temp_path = temp_file.name

            temp_file.close()

            cv2.imwrite(
                temp_path,
                frame
            )

            try:
                detections = detect_hazards(
                    temp_path
                )

                for detection in detections:

                    detection["frame"] = frame_number

                    detection["time_seconds"] = round(
                        frame_number / fps,
                        2
                    )

                    all_detections.append(
                        detection
                    )

            finally:

                if os.path.exists(temp_path):
                    os.remove(temp_path)

        frame_number += 1

    cap.release()

    # Calculate overall video risk
    risk = calculate_risk(
        all_detections
    )
    
    # Calculate safety metrics
    safety = analyze_safety(all_detections)

    return jsonify({

        "success": True,

        "type": "video",

        "video": {
            "filename": filename,
            "total_frames": total_frames,
            "fps": round(fps, 2),
            "duration_seconds": round(
                total_frames / fps,
                2
            )
        },

        "detections": all_detections,

        "risk": risk,
        "safety": safety
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