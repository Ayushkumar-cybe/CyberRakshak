import os
import requests
import logging

logger = logging.getLogger(__name__)

# REPLACE THIS WITH YOUR AI INSTANCE'S PRIVATE IP
# Example: "http://10.0.0.5:5000/generate"
AI_SERVER_URL = os.getenv("AI_SERVER_URL", "http://10.0.0.249:5000/generate")

def generate_gemini_response(prompt: str) -> str:
    """
    Redirects the call to our custom AI Microservice on the AI Server.
    We keep the function name 'generate_gemini_response' so we don't 
    have to rewrite the rest of the backend code.
    """
    try:
        # The AI Service expects {"query": "..."}
        payload = {"query": prompt}
        
        # 60s timeout because CPU inference can be slow
        response = requests.post(AI_SERVER_URL, json=payload, timeout=60)
        
        if response.status_code == 200:
            return response.json().get("response", "No response text from AI.")
        
        error_msg = f"AI Server Error ({response.status_code}): {response.text}"
        logger.error(error_msg)
        return error_msg
             
    except requests.exceptions.ConnectionError:
        msg = "Connection Refused: Is the AI Server (Instance B) running and reachable?"
        logger.error(msg)
        return msg
    except Exception as e:
        logger.error(f"AI connection failed: {e}")
        return f"Connection Error: {str(e)}"
