# GUARDEX Risk Engine

RISK_LEVELS = {
    "NO-Hardhat": 25,
    "NO-Mask": 20,
    "NO-Safety Vest": 25,
    "machinery": 10,
    "vehicle": 8,
    "Person": 0,
    "Hardhat": 0,
    "Mask": 0,
    "Safety Vest": 0,
    "Safety Cone": 0,
}


def calculate_risk(detections):
    """
    Calculate overall construction site risk
    from YOLO detections.
    """

    total_risk = 0
    high_risk_count = 0
    medium_risk_count = 0
    low_risk_count = 0

    risk_by_type = {}

    for detection in detections:
        class_name = detection["class"]
        confidence = detection["confidence"]

        base_risk = RISK_LEVELS.get(class_name, 5)

        # Confidence-weighted risk
        risk = base_risk * confidence

        total_risk += risk

        # Track risk by type
        if class_name not in risk_by_type:
            risk_by_type[class_name] = 0

        risk_by_type[class_name] += round(risk, 2)

        # Categorize hazards
        if base_risk >= 20:
            high_risk_count += 1
        elif base_risk >= 8:
            medium_risk_count += 1
        elif base_risk > 0:
            low_risk_count += 1

    # Keep score between 0 and 100
    site_risk_score = min(100, max(0, round(total_risk)))

    if site_risk_score >= 70:
        risk_level = "Critical"
    elif site_risk_score >= 50:
        risk_level = "High"
    elif site_risk_score >= 25:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return {
        "site_risk_score": site_risk_score,
        "risk_level": risk_level,
        "total_detections": len(detections),
        "high_risk_count": high_risk_count,
        "medium_risk_count": medium_risk_count,
        "low_risk_count": low_risk_count,
        "risk_by_type": risk_by_type,
    }