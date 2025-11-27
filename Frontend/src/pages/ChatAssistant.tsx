import React, { useState, useEffect, useRef } from "react";
import ChatBubbleUser from "../components/chat/ChatBubbleUser";
import ChatBubbleAssistant from "../components/chat/ChatBubbleAssistant";
import ChatInputBar from "../components/chat/ChatInputBar";
import ChatSuggestions from "../components/chat/ChatSuggestions";
import ContextPanel from "../components/chat/ContextPanel";
import TypingIndicator from "../components/chat/TypingIndicator";
import chatAssistantService from "../services/chatAssistant";

const ChatAssistant = () => {
  const [messages, setMessages] = useState<any[]>([
    { sender: "assistant", text: "Hello! I am CyberRakshak AI. How can I assist you today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [contextInfo, setContextInfo] = useState<any>(null);
  const messagesEndRef = useRef<any>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    // User message
    setMessages((prev: any) => [...prev, { sender: "user", text }]);

    // Start typing
    setIsTyping(true);

    // Use our chat assistant service to get a response
    let accumulatedResponse = "";
    
    try {
      await chatAssistantService.sendStreamingMessage(text, (chunk: string) => {
        accumulatedResponse = chunk;
        setMessages((prev: any) => {
          const copy = [...prev];
          // Update the last message with the latest chunk
          copy[copy.length - 1] = { sender: "assistant", text: chunk };
          return copy;
        });
      });
    } catch (error) {
      console.error("Error getting response from chat assistant:", error);
      setMessages((prev: any) => [...prev, { sender: "assistant", text: "Sorry, I encountered an error processing your request." }]);
    }

    setIsTyping(false);

    // Optional: Update context panel after answer
    if (text.toLowerCase().includes("cve")) {
      setContextInfo({
        title: "CVE Details",
        subtitle: "Extracted context",
        sections: [
          { heading: "Summary", body: "Critical RCE vulnerability found." },
          { heading: "Severity", body: "9.8 (Critical)" }
        ]
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

      {/* LEFT: CHAT PANEL */}
      <div className="lg:col-span-2 rounded-xl shadow p-4 flex flex-col h-[80vh] bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">

        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl font-bold">CyberRakshak AI Assistant</h1>
          <p className="opacity-70 text-sm">
            Ask anything about vulnerabilities, attack paths, scan results, or remediation.
          </p>
        </div>

        {/* Suggestions */}
        <ChatSuggestions onSelect={(prompt: string) => handleSendMessage(prompt)} />

        {/* Chat messages container */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          <div className="space-y-4 transition-all duration-300">
            {messages.map((msg, index) =>
              msg.sender === "user" ? (
                <div key={index} className="animate-fade-up">
                  <ChatBubbleUser text={msg.text} />
                </div>
              ) : (
                <div key={index} className="animate-fade-up delay-75">
                  <ChatBubbleAssistant text={msg.text} />
                </div>
              )
            )}

            {isTyping && (
              <div className="flex items-center gap-3 animate-fade-up">
                <div className="bg-blue-100 dark:bg-slate-700 p-2 rounded-full shadow">
                  <span className="text-blue-600 dark:text-blue-300 font-bold">AI</span>
                </div>
                <TypingIndicator />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input bar */}
        <div className="border-t dark:border-slate-700 pt-3">
          <ChatInputBar onSend={handleSendMessage} />
        </div>
      </div>

      {/* RIGHT: CONTEXT PANEL */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 hidden lg:block">
        <ContextPanel context={contextInfo} />
      </div>

    </div>
  );
};

export default ChatAssistant;