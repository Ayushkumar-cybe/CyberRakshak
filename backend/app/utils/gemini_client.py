import os
import requests
import logging

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"

def generate_gemini_response(prompt: str) -> str:
    """Call Gemini API and return the model's response."""
    if not GEMINI_API_KEY:
        return "Error: GEMINI_API_KEY is not set in the backend environment."

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }

    try:
        response = requests.post(GEMINI_API_URL, json=payload, timeout=30)
        
        if response.status_code != 200:
            # --- DEBUG: Log and Return the FULL Error ---
            error_msg = f"Gemini Error ({response.status_code}): {response.text}"
            logger.error(error_msg)
            return error_msg
            # --------------------------------------------

        data = response.json()
        if "candidates" in data and data["candidates"]:
             content = data["candidates"][0].get("content", {})
             parts = content.get("parts", [])
             if parts:
                 return parts[0].get("text", "No text returned.")
        
        return f"AI Error: Unexpected response format: {data}"
             
    except Exception as e:
        logger.error(f"Gemini connection failed: {e}")
        return f"Connection Error: {str(e)}"
