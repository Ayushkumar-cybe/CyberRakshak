from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import traceback
import json
import os
import httpx
import asyncio

from qdrant_client import QdrantClient
from . import gemini_client
embed_model = gemini_client


# -------------------------------
# CONFIG
# -------------------------------
PHASE2_BASE = os.getenv("PHASE2_BASE")  # e.g. http://161.118.189.151:8000
QDRANT_HOST = "qdrant"
QDRANT_PORT = 6333
QDRANT_COLLECTION = "vuln_docs"

router = APIRouter()


# -------------------------------
# MODELS
# -------------------------------
class ChatRequest(BaseModel):
    query: str
    top_k: Optional[int] = 5
    session_id: Optional[str] = None


class SourceItem(BaseModel):
    id: str
    score: float
    payload: dict


class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceItem] = []


# -------------------------------
# QDRANT CLIENT
# -------------------------------
_qdrant_client = None

def get_qdrant_client() -> QdrantClient:
    global _qdrant_client
    if _qdrant_client is None:
        _qdrant_client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)
    return _qdrant_client
def fetch_phase2_outputs(session_id: Optional[str]):
    """
    Fetches /api/scan/status/<session_id> and generates
    4 detailed summaries for:
        - normalizer
        - report
        - threat
        - attack_path
    """

    if not session_id or not PHASE2_BASE:
        return None, None, None, None

    url = f"{PHASE2_BASE}/api/scan/status/{session_id}"

    try:
        with httpx.Client(timeout=30.0) as client:
            r = client.get(url)
            r.raise_for_status()
            data = r.json()
    except Exception as e:
        print("Phase-2 fetch error:", e)
        return None, None, None, None

    # --------------------------
    # Extract core fields
    # --------------------------
    results = data.get("results", {})
    ports = results.get("ports", [])
    vulns = results.get("vulnerabilities", [])
    tech = results.get("technologies", [])
    host_info = results.get("host_info", {})

    # -------------------------
    # Build detailed Normalizer summary
    # -------------------------
    normalizer_summary_lines = []

    normalizer_summary_lines.append(f"Target: {data.get('target')} ({host_info.get('ip')})")
    normalizer_summary_lines.append(f"Open Ports: {len(ports)}")
    for p in ports:
        normalizer_summary_lines.append(
            f"- Port {p.get('port')}/{p.get('protocol')} → {p.get('service')} ({p.get('product')} {p.get('version')})"
        )

    normalizer_summary_lines.append(f"\nTotal Vulnerabilities: {len(vulns)}")
    for v in vulns:
        normalizer_summary_lines.append(
            f"- [{v.get('severity').upper()}] {v.get('title')} (tool: {v.get('tool')}, CVSS: {v.get('cvss_score')})"
        )

    normalizer = {
        "summary": "\n".join(normalizer_summary_lines),
        "ports": ports,
        "vulnerabilities": vulns
    }

    # -------------------------
    # Build detailed Report summary
    # -------------------------
    report_lines = []
    report_lines.append("Detailed Vulnerability Report:")
    for v in vulns:
        report_lines.append(f"\n=== {v.get('title')} ===")
        report_lines.append(f"Severity: {v.get('severity')}")
        report_lines.append(f"Description: {v.get('description')}")
        report_lines.append(f"Tool: {v.get('tool')}")
        report_lines.append(f"Matched At: {v.get('matched_at')}")
        report_lines.append(f"IP: {v.get('ip')}  Port: {v.get('port')}")
        report_lines.append(f"References: {v.get('references')}")
        if v.get("enrichment"):
            report_lines.append(f"Enrichment: {v.get('enrichment')}")

    report = {
        "report_summary": "\n".join(report_lines),
        "vulnerabilities": vulns
    }

    # -------------------------
    # Build Threat Management summary
    # -------------------------
    threat_lines = []
    threat_lines.append("Threat Insights Based on Vulnerability Data:")

    for v in vulns:
        sev = v.get("severity", "").lower()
        if sev in ["high", "critical", "medium"]:
            threat_lines.append(
                f"- {v.get('title')} ({sev}) may be exploitable depending on service exposure and configuration."
            )

    if not vulns:
        threat_lines.append("No actionable threat patterns detected.")

    threat = {
        "summary": "\n".join(threat_lines)
    }

    # -------------------------
    # Build Attack Path summary
    # -------------------------
    attack_lines = []
    attack_lines.append("Probable Attack Paths:")

    # SSH terrapin
    terrapin = next((v for v in vulns if "Terrapin" in v.get("title", "")), None)
    if terrapin:
        attack_lines.append(
            "- SSH Terrapin attack detected. Potential path: Internet → SSH Service → Integrity-bypass → session downgrade."
        )

    # Web-based issues
    medium_zap = [v for v in vulns if v.get("tool") == "zap" and v.get("severity") == "medium"]
    if medium_zap:
        attack_lines.append("- Multiple web header misconfigurations can enable XSS or clickjacking → credential theft.")

    # Apache version
    if any("Apache" in t.get("name", "") for t in tech):
        attack_lines.append("- Apache service is public; version disclosure may aid targeted exploits.")

    if len(attack_lines) == 1:
        attack_lines.append("No clear attack chain identified.")

    attack_path = {
        "summary": "\n".join(attack_lines)
    }

    return normalizer, report, threat, attack_path


def build_prompt(
    query: str,
    normalizer: Optional[Dict[str, Any]],
    report: Optional[Dict[str, Any]],
    threat: Optional[Dict[str, Any]],
    attack_path: Optional[Dict[str, Any]],
    kb_contexts: Optional[List[Dict[str, Any]]] = None
) -> str:

    parts = []
    parts.append("You are a cybersecurity assistant. Use the detailed Phase-2 scan results and knowledge base to answer the question.\n")

    if normalizer:
        parts.append("=== Normalizer Summary ===\n")
        parts.append(normalizer.get("summary", ""))

    if report:
        parts.append("\n=== Detailed Report ===\n")
        parts.append(report.get("report_summary", ""))

    if threat:
        parts.append("\n=== Threat Analysis ===\n")
        parts.append(threat.get("summary", ""))

    if attack_path:
        parts.append("\n=== Attack Path Inference ===\n")
        parts.append(attack_path.get("summary", ""))

    if kb_contexts:
        parts.append("\n=== Qdrant KB Contexts ===\n")
        for i, c in enumerate(kb_contexts):
            title = c.get("title") or f"context_{i+1}"
            summary = c.get("summary") or c.get("content") or ""
            parts.append(f"Context {i+1}: {title}\n{summary}\n")

    parts.append("\n=== User Question ===")
    parts.append(query)

    parts.append("""
Provide a detailed but structured answer:
1. Technical explanation
2. Impact analysis
3. Exploitation feasibility
4. Remediation steps (immediate + long-term)
5. References if applicable
""")

    return "\n".join(parts)



# ==============================================================
#                    MAIN CHAT ENDPOINT
# ==============================================================

@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    try:
        session_id = req.session_id
        query = req.query
        top_k = req.top_k or 5

        # 1) Get Phase-2 outputs
        normalizer, report, threat, attack_path = fetch_phase2_outputs(session_id)

        # 2) Compute embedding for query
        query_vector = embed_model.encode(query, convert_to_numpy=True).tolist()

        # 3) Retrieve Qdrant KB hits
        kb_contexts = []
        qdrant_sources = []
        try:
            client = get_qdrant_client()
            hits = client.search(
                collection_name=QDRANT_COLLECTION,
                query_vector=query_vector,
                limit=top_k,
                with_payload=True
            )
            for h in hits:
                payload = h.payload or {}
                kb_contexts.append(payload)
                qdrant_sources.append(
                    SourceItem(id=str(h.id), score=float(h.score), payload=payload)
                )
        except Exception:
            kb_contexts = []
            qdrant_sources = []

        # 4) Build prompt
        prompt = build_prompt(query, normalizer, report, threat, attack_path, kb_contexts)

        # 5) Call Gemini
        answer = gemini_client.generate_gemini_response(prompt)

        # 6) Build sources list
        sources = []
        if normalizer:
            sources.append(SourceItem(id="normalizer", score=1.0, payload=normalizer))
        if report:
            sources.append(SourceItem(id="report", score=1.0, payload=report))
        if threat:
            sources.append(SourceItem(id="threat", score=1.0, payload=threat))
        if attack_path:
            sources.append(SourceItem(id="attack_path", score=1.0, payload=attack_path))

        sources.extend(qdrant_sources)

        return ChatResponse(answer=answer or "", sources=sources)

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Chat handler error: {e}")
