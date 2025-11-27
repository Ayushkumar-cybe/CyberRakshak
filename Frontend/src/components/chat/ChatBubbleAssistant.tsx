import React from "react";
import { Shield } from "lucide-react";

const ChatBubbleAssistant = ({ text }: any) => {
  return (
    <div className="flex items-start gap-3">
      <div className="bg-blue-100 dark:bg-slate-700 p-2 rounded-full shadow">
        <Shield className="w-5 h-5 text-blue-600 dark:text-blue-300" />
      </div>

      <div className="max-w-[75%] bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-4 py-2 rounded-2xl rounded-tl-sm shadow">
        {text}
      </div>
    </div>
  );
};

export default ChatBubbleAssistant;