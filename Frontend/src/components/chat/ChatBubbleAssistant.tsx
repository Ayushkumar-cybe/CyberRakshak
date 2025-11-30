import React from "react";
import { Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatBubbleAssistantProps {
  text: string; // Changed prop name to match usage in ChatAssistant.tsx
}

const ChatBubbleAssistant = ({ text }: ChatBubbleAssistantProps) => {
  return (
    <div className="flex gap-3 max-w-[85%]">
      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
        <Bot className="w-5 h-5 text-blue-600 dark:text-blue-300" />
      </div>
      
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl rounded-tl-none shadow-sm text-sm leading-relaxed prose dark:prose-invert max-w-none">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            // Style code blocks
            code({node, inline, className, children, ...props}: any) {
              const match = /language-(\w+)/.exec(className || '')
              return !inline ? (
                <div className="bg-slate-900 text-slate-100 p-3 rounded-md my-2 overflow-x-auto font-mono text-xs">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </div>
              ) : (
                <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded font-mono text-xs" {...props}>
                  {children}
                </code>
              )
            },
            // Style headings
            h3: ({node, ...props}) => <h3 className="text-md font-bold mt-4 mb-2 text-blue-600 dark:text-blue-400" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc ml-4 space-y-1" {...props} />,
            li: ({node, ...props}) => <li className="ml-2" {...props} />
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default ChatBubbleAssistant;
