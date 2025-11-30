import { streamChatResponse } from "./api";

class ChatAssistantService {
  async sendStreamingMessage(
    message: string,
    history: { role: "user" | "assistant"; content: string }[], // <--- Added param
    onChunk: (chunk: string) => void
  ): Promise<void> {
    let fullText = "";
    
    // Pass history to api
    for await (const chunk of streamChatResponse(message, history)) {
      fullText += chunk;
      onChunk(fullText); 
    }
  }
}

export default new ChatAssistantService();
