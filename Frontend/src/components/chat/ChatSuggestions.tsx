import React from "react";

const suggestions = [
  "Show today's critical vulnerabilities",
  "Explain CVE-2025-12432",
  "Generate attack path for the web server",
  "List assets with high-risk exposures",
  "How to fix Log4j vulnerability?",
  "Show last Nmap scan summary",
];

const ChatSuggestions = ({ onSelect }: { onSelect: (prompt: string) => void }) => {
  return (
    <div className="flex flex-wrap gap-3 mb-4">
      {suggestions.map((s, index) => (
        <button
          key={index}
          onClick={() => onSelect(s)}
          className="
  px-3 py-1 text-sm rounded-full
  bg-slate-200 dark:bg-slate-700
  text-slate-700 dark:text-slate-200
  hover:bg-blue-600 hover:text-white
  shadow-sm hover:shadow
  transition-all duration-200
"
        >
          {s}
        </button>
      ))}
    </div>
  );
};

export default ChatSuggestions;