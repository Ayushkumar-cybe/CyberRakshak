import logging
import asyncio
from typing import AsyncGenerator, List, Dict, Any
from app.utils.gemini_client import generate_gemini_response
from app.models import Job
from sqlmodel import Session, select
from app.database import engine

logger = logging.getLogger(__name__)

class ChatAssistantService:
    def __init__(self):
        self.system_prompt = """
        You are Cyra, an expert cybersecurity assistant for the CyberRakshak platform.
        You have access to the user's latest vulnerability scan reports below.
        
        Rules:
        1. **Greeting Protocol:** If the user simply says "hello", "hi", or greets you, DO NOT list the vulnerabilities immediately. Instead, introduce yourself, mention the target of the latest scan, and ask if they would like a summary or remediation advice.
        2. **Context Awareness:** Answer questions strictly based on the provided scan context.
        3. **Prioritization:** When asked for a summary, prioritize Critical and High severity vulnerabilities first.
        4. **Actionable Advice:** Provide specific commands (e.g., Nginx/Apache config) when asked for remediation.
        5. **Unknowns:** If the user asks about something not in the scan, say "I don't see that in your latest scan results."
        6. **Tone:** Be professional, concise, and encouraging.
        """

    def _get_latest_scan_context(self) -> str:
        """Fetches the most recent completed scan report from the DB."""
        try:
            with Session(engine) as session:
                # Get latest completed job
                job = session.exec(select(Job).where(Job.status == "completed").order_by(Job.created_at.desc()).limit(1)).first()
                
                if not job or not job.normalized_report:
                    return "No scan data available yet. Tell the user to run a scan first."
                
                report = job.normalized_report
                vulns = report.get("vulnerabilities", [])
                
                # Summarize for the AI (Token efficiency)
                summary = [f"Target: {job.target}"]
                
                ports = report.get('ports', [])
                if ports:
                    summary.append(f"Open Ports: {', '.join([str(p.get('port')) for p in ports])}")
                
                if not vulns:
                    summary.append("No vulnerabilities found.")
                else:
                    summary.append(f"Found {len(vulns)} vulnerabilities. Top findings:")
                    # Limit context size to avoid token limits
                    for v in vulns[:20]: 
                        title = v.get('title', 'Unknown')
                        severity = v.get('severity', 'Info')
                        cve = v.get('cve') or "N/A"
                        summary.append(f"- [{severity}] {title} (CVE: {cve})")
                
                return "\n".join(summary)
        except Exception as e:
            logger.error(f"Context retrieval failed: {e}")
            return "Error retrieving scan data from database."

    async def get_response_async(self, user_message: str) -> str:
        """Generates a response using Gemini + Local Scan Context."""
        # 1. Retrieve Context
        scan_context = self._get_latest_scan_context()
        
        # 2. Construct Prompt
        full_prompt = f"""
        {self.system_prompt}
        
        === LATEST SCAN CONTEXT ===
        {scan_context}
        ===========================
        
        User Query: {user_message}
        """
        
        # 3. Call Gemini
        return generate_gemini_response(full_prompt)

    async def stream_response(self, user_message: str) -> AsyncGenerator[str, None]:
        """
        Streams the response chunk by chunk.
        """
        full_response = await self.get_response_async(user_message)
        
        # Simulate streaming (yield slices)
        chunk_size = 5 
        for i in range(0, len(full_response), chunk_size):
            yield full_response[i:i+chunk_size]
            await asyncio.sleep(0.01) # Slight delay for typing effect

chat_assistant_service = ChatAssistantService()
