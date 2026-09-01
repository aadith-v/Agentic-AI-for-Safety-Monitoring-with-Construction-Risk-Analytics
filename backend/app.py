from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from detector import detect_hazards
from risk_engine import calculate_risk

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
        "status": "GUARDEX API is running"
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

    return jsonify({
        "success": True,
        "type": "image",
        "detections": detections,
        "risk": risk
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

        "risk": risk
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