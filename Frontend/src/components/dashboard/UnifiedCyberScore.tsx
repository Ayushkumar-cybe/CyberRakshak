import React from "react";

const UnifiedCyberScore = () => {
  const score = 788; // sample score

  const getColor = () => {
    if (score >= 850) return "bg-green-500";
    if (score >= 700) return "bg-yellow-500";
    if (score >= 500) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="w-full h-full">
      <h3 className="text-lg font-semibold mb-3">Unified CyberScore™</h3>

      <div className="p-6 rounded-xl bg-slate-100 dark:bg-slate-800 shadow w-full flex items-center gap-6">

        {/* LEFT: SCORE BADGE */}
        <div className={`w-28 h-28 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg ${getColor()}`}>
          {score}
        </div>

        {/* RIGHT: SCORE DETAILS */}
        <div className="flex flex-col gap-2 text-sm">
          <p className="opacity-80">
            The Unified CyberScore™ is a composite risk index based on vulnerabilities,
            attack paths, asset exposure, cloud posture, threat intelligence, and exploit availability.
          </p>

          <p>
            <span className="font-semibold">Trend:</span> +6.4% improvement this week
          </p>

          <ul className="list-disc ml-4 opacity-80">
            <li>Reduced critical vulnerabilities on key servers</li>
            <li>Improved cloud misconfiguration posture</li>
            <li>Lower exploitable exposure surface</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default UnifiedCyberScore;