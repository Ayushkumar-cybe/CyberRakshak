// Chat Assistant Service
// This service will handle communication with the chat assistant backend

import { sendChatMessage, streamChatResponse } from './api';

class ChatAssistantService {
  // Send a message to the chat assistant and get a response
  async sendMessage(message: string): Promise<string> {
    try {
      // In a real implementation, this makes an API call to the backend
      return await sendChatMessage(message);
    } catch (error) {
      console.error('Error sending message to chat assistant:', error);
      return "Sorry, I encountered an error processing your request.";
    }
  }

  // Get a streaming response
  async sendStreamingMessage(message: string, onChunk: (chunk: string) => void): Promise<void> {
    try {
      // Use the streaming API
      for await (const chunk of streamChatResponse(message)) {
        onChunk(chunk);
      }
    } catch (error) {
      console.error('Error streaming response from chat assistant:', error);
      throw error;
    }
  }
}

// Export a singleton instance
const chatAssistantService = new ChatAssistantService();
export default chatAssistantService;