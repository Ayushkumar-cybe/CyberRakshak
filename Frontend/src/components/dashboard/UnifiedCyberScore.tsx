import React from "react";

interface Props {
  score: number;
}

const UnifiedCyberScore = ({ score }: Props) => {
  const getColor = () => {
    if (score <= 300) return "bg-green-500";
    if (score <= 600) return "bg-yellow-500";
    if (score <= 800) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="w-full h-full">
      <h3 className="text-lg font-semibold mb-3">Unified CyberScore™</h3>
      <div className="p-6 rounded-xl bg-slate-100 dark:bg-slate-800 shadow w-full flex items-center gap-6">
        <div className={`w-28 h-28 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg ${getColor()}`}>
          {score}
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="opacity-80">
            Composite risk index based on vulnerabilities, asset exposure, and open ports.
            Lower is better.
          </p>
          <p><span className="font-semibold">Real-time Calculation</span></p>
        </div>
      </div>
    </div>
  );
};

export default UnifiedCyberScore;
