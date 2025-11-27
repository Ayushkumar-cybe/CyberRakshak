import React, { useState } from "react";
import LiveScanPanel from "./LiveScanPanel";

interface Props {
  selectedTools: string[];
}

const ScanTargetPanel = ({ selectedTools }: Props) => {
  const [target, setTarget] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const startScan = () => {
    setIsRunning(true);
  };

  const stopScan = () => {
    setIsRunning(false);
  };

  const isValidTarget = target.trim().length > 4;

  return (
    <div className="space-y-6">

      {/* Selected Tools Chips */}
      <div className="flex flex-wrap gap-2">
        {selectedTools.length === 0 && (
          <p className="text-sm opacity-70">Select at least one scan tool.</p>
        )}
        {selectedTools.map((tool) => (
          <span
            key={tool}
            className="px-3 py-1 text-xs rounded-full bg-blue-500 text-white"
          >
            {tool}
          </span>
        ))}
      </div>

      {/* Target Input */}
      <div>
        <label className="text-sm font-medium">Target</label>
        <input
          type="text"
          placeholder="Enter IP / Domain (example: 192.168.1.1, example.com)"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="w-full mt-1 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 outline-none"
        />
      </div>

      {/* Run / Stop Button */}
      <div className="flex justify-end">
        {!isRunning ? (
          <button
            className={`px-6 py-2 rounded-lg text-white transition ${
              isValidTarget && selectedTools.length > 0
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-slate-400 cursor-not-allowed"
            }`}
            disabled={!isValidTarget || selectedTools.length === 0}
            onClick={startScan}
          >
            Run Scan
          </button>
        ) : (
          <button
            className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
            onClick={stopScan}
          >
            Stop Scan
          </button>
        )}
      </div>

      {/* Live Logs & Progress */}
      {isRunning && (
        <LiveScanPanel
          selectedTools={selectedTools}
          target={target}
          isRunning={isRunning}
          onStop={stopScan}
        />
      )}

    </div>
  );
};

export default ScanTargetPanel;