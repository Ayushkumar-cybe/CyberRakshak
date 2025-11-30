import React, { useState, useEffect, useRef } from "react";
import ChatBubbleUser from "../components/chat/ChatBubbleUser";
import ChatBubbleAssistant from "../components/chat/ChatBubbleAssistant";
import ChatInputBar from "../components/chat/ChatInputBar";
import ChatSuggestions from "../components/chat/ChatSuggestions";
import ContextPanel from "../components/chat/ContextPanel";
import TypingIndicator from "../components/chat/TypingIndicator";
import chatAssistantService from "../services/chatAssistant";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
}

const ChatAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: "welcome", 
      sender: "assistant", 
      // UPDATED GREETING
      text: "Hello! I am CYRA. I have access to your latest vulnerability scans. How can I help you remediate them today?" 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [contextInfo, setContextInfo] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    const userMsgId = Date.now().toString();
    
    // 1. Prepare History (Exclude the new message we are about to add)
    const history = messages.map(m => ({
      role: m.sender, // "user" or "assistant"
      content: m.text
    }));

    // 2. Update UI with User Message
    setMessages((prev) => [...prev, { id: userMsgId, sender: "user", text }]);
    setIsTyping(true);

    try {
      // 3. Create Assistant Placeholder
      const aiMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, { id: aiMsgId, sender: "assistant", text: "" }]);

      // 4. Send Message with History
      await chatAssistantService.sendStreamingMessage(
        text, 
        history, 
        (currentFullText: string) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMsgId ? { ...msg, text: currentFullText } : msg
            )
          );
        }
      );

    } catch (error) {
      console.error("Error getting response:", error);
      setMessages((prev) => [
        ...prev,
        { 
          id: Date.now().toString(), 
          sender: "assistant", 
          text: "Sorry, I encountered an error connecting to the server." 
        }
      ]);
    } finally {
      setIsTyping(false);
    }

    // Optional: Context Panel Update (Static Mock for now)
    if (text.toLowerCase().includes("cve")) {
      setContextInfo({
        title: "CVE Context",
        subtitle: "Extracted from Knowledge Base",
        sections: [
          { heading: "Source", body: "National Vulnerability Database (NVD)" },
          { heading: "Status", body: "Analysis Pending" }
        ]
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-6rem)]">

      {/* LEFT: CHAT PANEL */}
      <div className="lg:col-span-2 rounded-xl shadow p-4 flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">

        {/* Header */}
        <div className="mb-4 pb-2 border-b dark:border-slate-700">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            CYRA AI Assistant
          </h1>
          <p className="opacity-70 text-sm">
            Ask anything about vulnerabilities, attack paths, scan results, or remediation.
          </p>
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
           <ChatSuggestions onSelect={(prompt: string) => handleSendMessage(prompt)} />
        )}

        {/* Chat messages container */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.sender === "user" ? (
                  <ChatBubbleUser text={msg.text} />
                ) : (
                  <ChatBubbleAssistant text={msg.text} />
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-3 ml-2">
                <div className="bg-blue-100 dark:bg-slate-700 p-2 rounded-full shadow">
                  <span className="text-blue-600 dark:text-blue-300 font-bold text-xs">CYRA</span>
                </div>
                <TypingIndicator />
                <span className="text-xs text-slate-400 animate-pulse">Thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input bar */}
        <div className="border-t dark:border-slate-700 pt-3">
          <ChatInputBar onSend={handleSendMessage} disabled={isTyping} />
        </div>
      </div>

      {/* RIGHT: CONTEXT PANEL */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 hidden lg:block border-l dark:border-slate-700 overflow-y-auto">
        <ContextPanel context={contextInfo} />
      </div>

    </div>
  );
};

export default ChatAssistant;
