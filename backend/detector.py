import os
from ultralytics import YOLO

# Get the main project directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Path to trained YOLO model
MODEL_PATH = os.path.join(BASE_DIR, "models", "best.pt")

# Load trained model
model = YOLO(MODEL_PATH)


def detect_hazards(image_path):
    """
    Detect construction-site hazards in an image.
    """

    # Automatically choose device (CUDA if available, else CPU)
    try:
        results = model.predict(
            source=image_path,
            conf=0.25,
            verbose=False
        )
    except Exception:
        results = model.predict(
            source=image_path,
            conf=0.25,
            device="cpu",
            verbose=False
        )

    detections = []

    for result in results:

        for box in result.boxes:

            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            class_name = model.names[class_id]

            x1, y1, x2, y2 = map(int, box.xyxy[0])

            detections.append({
                "class": class_name,
                "confidence": round(confidence, 3),
                "bbox": [x1, y1, x2, y2]
            })

    return detections