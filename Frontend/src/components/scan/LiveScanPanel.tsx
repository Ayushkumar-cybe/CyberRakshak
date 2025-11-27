import React, { useEffect, useRef, useState } from "react";

interface Props {
  selectedTools: string[];
  target: string;
  isRunning: boolean;
  onStop: () => void;
}

const LiveScanPanel = ({ selectedTools, target, isRunning, onStop }: Props) => {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Simulation loop
  useEffect(() => {
    if (!isRunning) return;

    // Initialize progress for each tool
    const initial: any = {};
    selectedTools.forEach((t) => {
      initial[t] = 0;
    });
    setProgress(initial);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress: any = { ...prev };
        selectedTools.forEach((t) => {
          if (newProgress[t] < 100) {
            newProgress[t] += Math.random() * 8; // speed
          }
        });
        return newProgress;
      });

      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Scanning ${target}...`,
      ]);
    }, 400);

    return () => clearInterval(interval);
  }, [isRunning]);

  // All tools finished?
  const allDone =
    Object.values(progress).length > 0 &&
    Object.values(progress).every((v) => v >= 100);

  return (
    <div className="space-y-4">

      {/* Progress Bars */}
      <div className="space-y-3">
        {selectedTools.map((tool) => (
          <div key={tool}>
            <p className="text-sm font-medium mb-1">{tool}</p>
            <div className="w-full bg-slate-700/40 h-3 rounded-md overflow-hidden">
              <div
                className="h-3 bg-blue-500 transition-all"
                style={{
                  width: `${Math.min(progress[tool] || 0, 100)}%`,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Terminal Logs */}
      <div className="bg-black rounded-xl p-4 h-48 overflow-y-auto text-green-400 font-mono text-xs border border-slate-700 shadow-inner">
        {logs.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
        <div ref={logsEndRef} />
      </div>

      {/* Stop or Completed */}
      <div className="flex justify-end">
        {allDone ? (
          <span className="text-green-500 font-semibold">Scan Completed</span>
        ) : (
          <button
            onClick={onStop}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Stop Scan
          </button>
        )}
      </div>
    </div>
  );
};

export default LiveScanPanel;