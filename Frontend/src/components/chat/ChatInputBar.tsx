import React, { useState } from "react";
import { Send, Paperclip } from "lucide-react";

const ChatInputBar = ({ onSend }: any) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message);
    setMessage("");
  };

  return (
    <div className="
  flex items-center gap-3
  bg-slate-100 dark:bg-slate-700
  rounded-xl px-4 py-2
  shadow-inner border border-slate-300 dark:border-slate-600
  transition-all duration-200
  focus-within:ring-2 focus-within:ring-blue-400
">

      {/* Attachment */}
      <button className="opacity-70 hover:opacity-100 transition">
        <Paperclip className="w-5 h-5" />
      </button>

      {/* Input */}
      <input
        type="text"
        className="flex-1 bg-transparent outline-none text-sm"
        placeholder="Ask CyberRakshak anything…"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
      />

      {/* Send Button */}
      <button
        onClick={handleSend}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition"
      >
        <Send className="w-4 h-4" />
      </button>

    </div>
  );
};

export default ChatInputBar;