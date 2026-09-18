# BuildSure AI - Insurance Agent
# Evaluates site telemetry, PPE adherence, and hazard events for AI-assisted insurance risk assessment & loss control.

def evaluate_insurance_risk(detections, safety_data=None, risk_data=None, compliance_data=None):
    """
    Synthesizes site risk, PPE compliance, and regulatory violations into an insurance risk assessment.
    """
    if safety_data is None:
        safety_data = {}
    if risk_data is None:
        risk_data = {}
    if compliance_data is None:
        compliance_data = {}

    site_risk_score = risk_data.get("site_risk_score", 50)
    ppe_compliance_rate = safety_data.get("ppe_compliance_rate", 85)
    active_violations = compliance_data.get("violations_count", len(safety_data.get("alerts", [])))
    high_severity_violations = len([v for v in compliance_data.get("violations", []) if v.get("severity") == "High"])

    # Calculate Insurance Risk Score (0 = lowest risk / cleanest site, 100 = critical loss exposure)
    # Factors:
    # 1. Site hazard score contribution (40%)
    # 2. Inverted PPE compliance rate (35%) -> lower PPE increases insurance exposure
    # 3. Violation count & severity penalty (25%)
    ppe_exposure = max(0, 100 - ppe_compliance_rate)
    violation_exposure = min(100, (active_violations * 12) + (high_severity_violations * 15))

    calculated_score = round(
        (site_risk_score * 0.40) +
        (ppe_exposure * 0.35) +
        (violation_exposure * 0.25)
    )
    insurance_risk_score = max(5, min(100, calculated_score))

    # Insurance Risk Level / Tier
    if insurance_risk_score >= 65:
        risk_level = "High"
        loss_control_rating = "Grade C (Substandard Controls)"
        premium_impact = "Elevated Surcharge Risk (+10% to +20%)"
    elif insurance_risk_score >= 40:
        risk_level = "Medium"
        loss_control_rating = "Grade B (Standard Controls)"
        premium_impact = "Standard Underwriting Tier (+0% to +5%)"
    else:
        risk_level = "Low"
        loss_control_rating = "Grade A (Preferred Risk Profile)"
        premium_impact = "Eligible for Preferred Loss-Control Credits (-5% to -10%)"

    # Evaluate specific liability & claim risk factors
    detected_classes = [d.get("class") for d in detections]
    has_no_hardhat = "NO-Hardhat" in detected_classes
    has_no_vest = "NO-Safety Vest" in detected_classes
    has_machinery = "machinery" in detected_classes or "vehicle" in detected_classes

    risk_factors = []
    
    if has_no_hardhat:
        risk_factors.append({
            "line": "Workers' Compensation",
            "driver": "Head / Traumatic Brain Injury Exposure",
            "severity": "High",
            "impact": "Primary driver of severe worker compensation and indemnity claims."
        })
    else:
        risk_factors.append({
            "line": "Workers' Compensation",
            "driver": "Head Protection Adherence",
            "severity": "Low",
            "impact": "Consistent helmet wearing significantly curbs catastrophic trauma claim frequency."
        })

    if has_machinery:
        risk_factors.append({
            "line": "Commercial General Liability (CGL)",
            "driver": "Heavy Machinery & Mobile Equipment Interaction",
            "severity": "Medium",
            "impact": "Potential third-party struck-by or vehicular property damage exposure."
        })

    if has_no_vest:
        risk_factors.append({
            "line": "Site Liability & EHS",
            "driver": "Low Visibility Personnel",
            "severity": "Medium",
            "impact": "Workers without high-visibility vests increase incident probability around equipment."
        })

    # Loss-control recommendations
    loss_control_recommendations = [
        "Enforce strict 100% hardhat and high-vis vest compliance at all zone entry turnstiles.",
        "Implement designated machinery spotters and physical barricades around operating excavators.",
        "Maintain logged pre-shift toolbox safety briefings to document proactive loss control for carrier audits.",
        "Ensure prompt corrective action close-out for all computer-vision-flagged non-compliances."
    ]

    disclaimer = (
        "Notice: This assessment is an AI-assisted risk analytics estimation generated for proactive site safety "
        "and loss control engineering purposes only. It does not constitute an official insurance policy underwriting "
        "decision, formal audit certification, or legally binding rate quotation."
    )

    return {
        "insurance_risk_score": insurance_risk_score,
        "risk_level": risk_level,
        "loss_control_rating": loss_control_rating,
        "premium_impact": premium_impact,
        "risk_factors": risk_factors,
        "loss_control_recommendations": loss_control_recommendations,
        "underwriting_profile": {
            "workers_comp_exposure": "Elevated" if has_no_hardhat else "Controlled",
            "cgl_exposure": "Moderate" if has_machinery else "Low",
            "site_supervision_index": f"{ppe_compliance_rate}% Adherence"
        },
        "disclaimer": disclaimer
    }
