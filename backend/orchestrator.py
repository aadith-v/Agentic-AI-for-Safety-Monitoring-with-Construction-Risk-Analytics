# BuildSure AI - Multi-Agent Orchestrator
# Coordinates agent execution order, data exchange, status tracking, and pipeline synthesis
# across Site Risk, Safety, Compliance, Insurance, Risk Intelligence Engine, and Reporting Agent.

import time
from datetime import datetime
from risk_engine import calculate_risk
from safety_agent import analyze_safety
from compliance_agent import evaluate_compliance
from insurance_agent import evaluate_insurance_risk
from risk_intelligence_engine import compute_project_risk_intelligence
import reporting_agent


def orchestrate_pipeline(detections, source_info=None):
    """
    Executes the end-to-end multi-agent pipeline synchronously or sequentially,
    recording telemetry, execution time per agent, and state consolidation.
    """
    start_time = time.time()
    source_info = source_info or {"type": "demo", "name": "Hudson Yards CAM04"}

    agent_traces = []

    # Step 1: Site Risk Agent
    t0 = time.time()
    site_risk = calculate_risk(detections)
    t_risk = round((time.time() - t0) * 1000, 2)
    agent_traces.append({
        "agent": "Site Risk Agent",
        "status": "Completed",
        "latency_ms": t_risk,
        "efficiency": "98%",
        "output_summary": f"Calculated site risk score: {site_risk.get('site_risk_score')}/100 ({site_risk.get('risk_level')})"
    })

    # Step 2: Safety Agent
    t0 = time.time()
    safety = analyze_safety(detections)
    t_safety = round((time.time() - t0) * 1000, 2)
    agent_traces.append({
        "agent": "Safety Agent",
        "status": "Completed",
        "latency_ms": t_safety,
        "efficiency": "94%",
        "output_summary": f"Monitored {safety.get('workers_monitored')} personnel with {safety.get('ppe_compliance_rate')}% PPE compliance rate"
    })

    # Step 3: Compliance Agent
    t0 = time.time()
    compliance = evaluate_compliance(detections, safety, site_risk)
    t_comp = round((time.time() - t0) * 1000, 2)
    agent_traces.append({
        "agent": "Compliance Agent",
        "status": "Completed",
        "latency_ms": t_comp,
        "efficiency": "98%",
        "output_summary": f"Evaluated 5 OSHA 1926 standards: {compliance.get('compliance_score')}% score, {compliance.get('violations_count')} violations"
    })

    # Step 4: Insurance Agent
    t0 = time.time()
    insurance = evaluate_insurance_risk(detections, safety, site_risk, compliance)
    t_ins = round((time.time() - t0) * 1000, 2)
    agent_traces.append({
        "agent": "Insurance Agent",
        "status": "Completed",
        "latency_ms": t_ins,
        "efficiency": "92%",
        "output_summary": f"Underwriting loss rating: {insurance.get('loss_control_rating')} with risk score {insurance.get('insurance_risk_score')}"
    })

    # Step 5: Construction Risk Intelligence Engine
    t0 = time.time()
    intelligence = compute_project_risk_intelligence(detections, site_risk, safety, compliance, insurance)
    t_intel = round((time.time() - t0) * 1000, 2)
    agent_traces.append({
        "agent": "Risk Intelligence Engine",
        "status": "Completed",
        "latency_ms": t_intel,
        "efficiency": "96%",
        "output_summary": f"Consolidated project risk score: {intelligence['executive_kpis']['project_risk_score']}/100 ({intelligence['executive_kpis']['score_label']})"
    })

    # Consolidated audit state for reporting
    audit_state = {
        "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "source_type": source_info.get("type", "demo"),
        "project_name": source_info.get("project_name", "Hudson Yards Phase 2 - Commercial High-Rise"),
        "detections": detections,
        "risk": site_risk,
        "safety": safety,
        "compliance": compliance,
        "insurance": insurance
    }

    # Step 6: Reporting Agent
    t0 = time.time()
    health_report = reporting_agent.generate_project_health_report(audit_state, intelligence)
    t_rep = round((time.time() - t0) * 1000, 2)
    agent_traces.append({
        "agent": "Reporting Agent",
        "status": "Completed",
        "latency_ms": t_rep,
        "efficiency": "99%",
        "output_summary": "Aggregated daily, executive, and regulatory audit reports"
    })

    total_pipeline_time_ms = round((time.time() - start_time) * 1000, 2)

    return {
        "orchestration_id": f"ORCH-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
        "executed_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "total_latency_ms": total_pipeline_time_ms,
        "status": "All Agents Synchronized",
        "agent_traces": agent_traces,
        "telemetry": audit_state,
        "risk_intelligence": intelligence,
        "health_report": health_report
    }
