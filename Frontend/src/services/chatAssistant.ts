import { streamChatResponse } from "./api";

class ChatAssistantService {
  async sendStreamingMessage(
    message: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    let fullText = "";
    
    // Iterate over the async generator
    for await (const chunk of streamChatResponse(message)) {
      fullText += chunk;
      // Pass the accumulated text to the callback
      onChunk(fullText); 
    }
  }
}

export default new ChatAssistantService();
