# BuildSure AI - Compliance Agent
# Validates detected hazards and PPE adherence against documented construction safety standards (e.g. OSHA 1926)

SAFETY_RULES = [
    {
        "id": "RULE-PPE-01",
        "standard": "OSHA 29 CFR 1926.100",
        "title": "Head Protection",
        "category": "PPE Standard",
        "description": "Employees working in areas where there is a possible danger of head injury from impact, or from falling or flying objects, shall be protected by protective helmets.",
        "target_class": "NO-Hardhat",
        "severity": "High",
        "recommendation": "Require mandatory hardhat use before entering active work zones."
    },
    {
        "id": "RULE-PPE-02",
        "standard": "OSHA 29 CFR 1926.28",
        "title": "Personal Protective Equipment (Hi-Vis Vest)",
        "category": "PPE Standard",
        "description": "The employer is responsible for requiring the wearing of appropriate personal protective equipment in all operations where there is an exposure to hazardous conditions.",
        "target_class": "NO-Safety Vest",
        "severity": "Medium",
        "recommendation": "Issue and mandate high-visibility safety vests for all personnel on deck and roadway zones."
    },
    {
        "id": "RULE-PPE-03",
        "standard": "OSHA 29 CFR 1926.95",
        "title": "Respiratory & Face Protection",
        "category": "PPE Standard",
        "description": "Protective equipment shall be provided and maintained wherever it is necessary by reason of hazards of processes or environment.",
        "target_class": "NO-Mask",
        "severity": "Low",
        "recommendation": "Provide particulate masks in dusty excavation, cutting, or demolition areas."
    },
    {
        "id": "RULE-SITE-04",
        "standard": "OSHA 29 CFR 1926.600",
        "title": "Heavy Equipment & Machinery Safety",
        "category": "Equipment Safety",
        "description": "Equipment operating near personnel must maintain safe clearance, audible backup alarms, and designated spotters.",
        "target_class": "machinery",
        "severity": "Medium",
        "recommendation": "Establish barricaded swing radius and assign dedicated ground spotters during machinery operation."
    },
    {
        "id": "RULE-SITE-05",
        "standard": "OSHA 29 CFR 1926.200",
        "title": "Accident Prevention Signs & Demarcation",
        "category": "Site Controls",
        "description": "Safety cones, signs, and physical barriers must delineate active hazard perimeters and traffic pathways.",
        "target_class": "Safety Cone",
        "severity": "Low",
        "recommendation": "Ensure safety cones and warning indicators are present around hazard perimeters."
    }
]


def evaluate_compliance(detections, safety_data=None, risk_data=None):
    """
    Evaluates site detections against standard construction safety rules.
    Takes YOLO detections, Safety Agent results, and Risk Engine scores.
    """
    if safety_data is None:
        safety_data = {}
    if risk_data is None:
        risk_data = {}

    detected_classes = [d.get("class") for d in detections]
    
    # Count occurrences of classes
    class_counts = {}
    for c in detected_classes:
        class_counts[c] = class_counts.get(c, 0) + 1

    violations = []
    checkpoints = []

    # Check rule-based violations
    for rule in SAFETY_RULES:
        t_cls = rule["target_class"]
        count = class_counts.get(t_cls, 0)

        # Violation conditions based on model classes
        if t_cls.startswith("NO-") and count > 0:
            violations.append({
                "rule_id": rule["id"],
                "standard": rule["standard"],
                "title": rule["title"],
                "category": rule["category"],
                "count": count,
                "severity": rule["severity"],
                "description": rule["description"],
                "recommendation": rule["recommendation"],
                "status": "Violation Detected"
            })
            checkpoints.append({
                "checkpoint": f"{rule['title']} ({rule['standard']})",
                "status": "Non-Compliant",
                "detail": f"{count} instance(s) detected without required safety equipment.",
                "category": rule["category"]
            })
        elif t_cls == "machinery" and count > 0:
            # Check if workers are in vicinity
            person_count = class_counts.get("Person", 0)
            if person_count > 0:
                violations.append({
                    "rule_id": rule["id"],
                    "standard": rule["standard"],
                    "title": rule["title"],
                    "category": rule["category"],
                    "count": count,
                    "severity": "Medium",
                    "description": f"Active machinery operating near {person_count} ground personnel.",
                    "recommendation": rule["recommendation"],
                    "status": "Precaution Required"
                })
                checkpoints.append({
                    "checkpoint": f"{rule['title']} Clearance",
                    "status": "Warning",
                    "detail": f"Machinery operating with {person_count} workers in the monitored zone.",
                    "category": rule["category"]
                })
            else:
                checkpoints.append({
                    "checkpoint": f"{rule['title']} Clearance",
                    "status": "Compliant",
                    "detail": "Machinery operating without close worker exposure.",
                    "category": rule["category"]
                })
        elif t_cls == "Safety Cone":
            has_cones = count > 0
            checkpoints.append({
                "checkpoint": f"{rule['title']} Demarcation",
                "status": "Compliant" if has_cones else "Notice",
                "detail": f"{count} perimeter cone(s) verified." if has_cones else "No warning cones detected in view.",
                "category": rule["category"]
            })
        elif t_cls.startswith("NO-") and count == 0:
            # Class was not detected as missing
            checkpoints.append({
                "checkpoint": f"{rule['title']} ({rule['standard']})",
                "status": "Compliant",
                "detail": "No non-compliance detected for this rule in current frame.",
                "category": rule["category"]
            })

    # Additional check: workers monitored vs hardhats
    workers_monitored = safety_data.get("workers_monitored", 0)
    details = safety_data.get("details", {})
    hardhats = details.get("hardhats", 0)
    no_hardhats = details.get("no_hardhats", 0)

    # Calculate compliance score
    base_rate = safety_data.get("ppe_compliance_rate", 100)
    high_viol_penalty = sum(15 for v in violations if v["severity"] == "High")
    med_viol_penalty = sum(8 for v in violations if v["severity"] == "Medium")
    low_viol_penalty = sum(4 for v in violations if v["severity"] == "Low")
    
    total_penalty = high_viol_penalty + med_viol_penalty + low_viol_penalty
    compliance_score = max(0, min(100, round((base_rate * 0.7) + (max(0, 100 - total_penalty) * 0.3))))

    if compliance_score >= 85 and len([v for v in violations if v["severity"] == "High"]) == 0:
        compliance_status = "Compliant"
    elif compliance_score >= 60:
        compliance_status = "Action Required"
    else:
        compliance_status = "Non-Compliant"

    # Category breakdowns
    category_scores = {
        "OSHA Standards": max(30, min(100, round(compliance_score * 0.98))),
        "Building Codes": max(40, min(100, round(compliance_score * 0.95))),
        "Environmental Regulations": max(45, min(100, round(100 - (class_counts.get("NO-Mask", 0) * 15)))),
        "Site Safety Rules": max(35, min(100, round(base_rate)))
    }

    # Consolidated corrective recommendations
    recommendations = []
    for v in violations:
        if v["recommendation"] not in recommendations:
            recommendations.append(v["recommendation"])

    if not recommendations:
        recommendations.append("Continue standard daily safety walkthroughs and verify all PPE before shift handoff.")
        recommendations.append("Ensure perimeter barriers and emergency egress routes remain clear of obstruction.")

    audit_readiness = max(30, min(100, round((compliance_score * 0.85) + (15 if len(violations) <= 1 else 5))))

    return {
        "compliance_score": compliance_score,
        "compliance_status": compliance_status,
        "audit_readiness": audit_readiness,
        "violations_count": len(violations),
        "violations": violations,
        "inspection_checkpoints": checkpoints,
        "category_scores": category_scores,
        "recommendations": recommendations,
        "standards_evaluated": [
            "OSHA 29 CFR 1926.100 (Head Protection)",
            "OSHA 29 CFR 1926.28 (Personal Protective Equipment)",
            "OSHA 29 CFR 1926.95 (General PPE Criteria)",
            "OSHA 29 CFR 1926.600 (Equipment & Heavy Machinery Safety)",
            "OSHA 29 CFR 1926.200 (Accident Prevention Signs & Tags)"
        ],
        "limitation_note": "Rule evaluation is constrained to visual hazards and PPE classes detected by the current YOLOv11 model."
    }
