import React, { useEffect, useRef } from "react";

interface Props {
  logs: string[];
  running: boolean;
  onClear: () => void;
}

const LogTerminal: React.FC<Props> = ({ logs, running, onClear }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  return (
    <div className="bg-black text-green-400 font-mono text-xs rounded-lg p-4 h-64 overflow-y-auto border border-slate-700 relative">
      <div className="absolute top-2 right-2 flex gap-2">
        <button
          className="
            px-2 py-1 text-xs rounded bg-slate-700 text-white
            hover:bg-slate-600 transition
          "
          onClick={onClear}
        >
          Clear
        </button>
      </div>

      {logs.map((line, idx) => (
        <div key={idx} className="whitespace-pre-wrap">
          {line}
        </div>
      ))}

      {running && <div className="opacity-70">[streaming...]</div>}

      <div ref={bottomRef}></div>
    </div>
  );
};

export default LogTerminal;