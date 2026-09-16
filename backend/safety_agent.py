# BuildSure AI - Safety Agent

def analyze_safety(detections):
    """
    Analyzes detections specifically for worker safety and PPE compliance.
    """
    total_persons = 0
    hardhats = 0
    safety_vests = 0
    masks = 0
    
    no_hardhats = 0
    no_vests = 0
    no_masks = 0

    alerts = []
    
    for det in detections:
        cls = det.get("class", "")
        conf = det.get("confidence", 0)
        
        if cls == "Person":
            total_persons += 1
        elif cls == "Hardhat":
            hardhats += 1
        elif cls == "Safety Vest":
            safety_vests += 1
        elif cls == "Mask":
            masks += 1
        elif cls == "NO-Hardhat":
            no_hardhats += 1
            alerts.append({"type": "Missing Hardhat", "severity": "High", "confidence": conf, "bbox": det.get("bbox", [])})
        elif cls == "NO-Safety Vest":
            no_vests += 1
            alerts.append({"type": "Missing Safety Vest", "severity": "Medium", "confidence": conf, "bbox": det.get("bbox", [])})
        elif cls == "NO-Mask":
            no_masks += 1
            alerts.append({"type": "Missing Mask", "severity": "Low", "confidence": conf, "bbox": det.get("bbox", [])})

    workers_monitored = total_persons if total_persons > 0 else (hardhats + no_hardhats)
    
    ppe_compliance_rate = 100
    if workers_monitored > 0:
        expected_ppe = workers_monitored * 2
        actual_ppe = hardhats + safety_vests
        ppe_compliance_rate = min(100, max(0, round((actual_ppe / expected_ppe) * 100)))

    if workers_monitored > 0 and (hardhats < workers_monitored) and no_hardhats == 0:
        ppe_compliance_rate = min(ppe_compliance_rate, round((hardhats/workers_monitored)*100))
        alerts.append({"type": "Potential Missing Hardhats", "severity": "High", "confidence": 0.8, "bbox": []})

    safety_score = ppe_compliance_rate - (len(alerts) * 5)
    safety_score = max(0, min(100, safety_score))

    return {
        "ppe_compliance_rate": ppe_compliance_rate,
        "workers_monitored": workers_monitored,
        "safety_score": safety_score,
        "active_violations": len(alerts),
        "alerts": alerts,
        "details": {
            "hardhats": hardhats,
            "safety_vests": safety_vests,
            "no_hardhats": no_hardhats,
            "no_vests": no_vests
        }
    }
