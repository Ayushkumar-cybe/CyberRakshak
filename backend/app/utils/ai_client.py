import os
import requests
import logging

logger = logging.getLogger(__name__)

# This points to your separate AI Server (Instance B)
# Default to localhost for dev, but in prod (docker-compose) this will be the private IP
AI_SERVER_URL = os.getenv("AI_SERVER_URL", "http://10.0.0.249:5000/generate")

def generate_ai_response(prompt: str) -> str:
    """
    Sends the prompt to the internal AI Microservice.
    """
    try:
        # The AI Service expects {"query": "..."}
        payload = {"query": prompt}

        # 120s timeout because CPU inference on the other server might be slow
        response = requests.post(AI_SERVER_URL, json=payload, timeout=120)

        if response.status_code == 200:
            return response.json().get("response", "No response text from AI.")

        error_msg = f"AI Server Error ({response.status_code}): {response.text}"
        logger.error(error_msg)
        return error_msg

    except requests.exceptions.ConnectionError:
        msg = "Connection Refused: The AI Server is unreachable."
        logger.error(msg)
        return msg
    except Exception as e:
        logger.error(f"AI connection failed: {e}")
        return f"Connection Error: {str(e)}"
