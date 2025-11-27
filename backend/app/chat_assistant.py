"""
Chat Assistant Service for CyberRakshak
This service handles the AI chat functionality for the application.
"""

from typing import Dict, List, Any, Optional
import asyncio
import logging

logger = logging.getLogger(__name__)

class ChatAssistantService:
    """Service to handle chat assistant functionality"""
    
    def __init__(self):
        # Predefined responses for common queries
        self.responses = {
            'hello': 'Hello! I am CyberRakshak AI. How can I assist you with cybersecurity today?',
            'hi': 'Hi there! I\'m here to help you with cybersecurity insights. What would you like to know?',
            'help': 'I can help you with:\n- Vulnerability analysis\n- Attack path visualization\n- Security recommendations\n- CVE details\n- Scan result interpretation\n\nWhat specific cybersecurity topic would you like assistance with?',
            'what can you do': 'I can help you with:\n- Vulnerability analysis\n- Attack path visualization\n- Security recommendations\n- CVE details\n- Scan result interpretation\n\nWhat specific cybersecurity topic would you like assistance with?',
            'scan results': 'I can help interpret your scan results. Please share the specific findings you\'d like me to analyze.',
            'vulnerability': 'I can provide detailed information about vulnerabilities. Please specify which vulnerability or CVE you\'re interested in.',
            'cve': 'I can provide detailed information about CVEs. Please share the specific CVE identifier you\'d like to know more about.',
            'attack path': 'Attack path analysis helps identify potential routes attackers could take to compromise your systems. Please share your scan results for a detailed analysis.',
        }
        
        # Default response for unrecognized queries
        self.default_response = "I'm CyberRakshak AI, your cybersecurity assistant. I can help with vulnerability analysis, attack path visualization, security recommendations, and interpreting scan results. How can I assist you today?"

    def get_response(self, message: str) -> str:
        """
        Get a response for the given message.
        
        Args:
            message (str): The user's message
            
        Returns:
            str: The assistant's response
        """
        # Convert to lowercase for case-insensitive matching
        lower_message = message.lower().strip()
        
        # Check for exact matches
        if lower_message in self.responses:
            return self.responses[lower_message]
            
        # Check for partial matches
        for key, response in self.responses.items():
            if key in lower_message:
                return response
                
        # Return default response if no match found
        return self.default_response

    async def get_response_async(self, message: str) -> str:
        """
        Get a response for the given message asynchronously.
        Simulates processing delay.
        
        Args:
            message (str): The user's message
            
        Returns:
            str: The assistant's response
        """
        # Simulate processing delay
        await asyncio.sleep(0.1)
        return self.get_response(message)

    async def stream_response(self, message: str) -> List[str]:
        """
        Stream a response character by character.
        
        Args:
            message (str): The user's message
            
        Returns:
            List[str]: List of response chunks
        """
        full_response = await self.get_response_async(message)
        chunks = []
        
        # Create chunks of the response
        for i in range(1, len(full_response) + 1):
            chunks.append(full_response[:i])
            
        return chunks

# Create a singleton instance
chat_assistant_service = ChatAssistantService()