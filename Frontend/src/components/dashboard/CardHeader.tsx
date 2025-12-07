import React, { useState } from "react";
import { Info } from "lucide-react";

interface CardHeaderProps {
  title: string;
  tooltip: string;
}

const CardHeader = ({ title, tooltip }: CardHeaderProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-flex items-center mb-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div
        className="relative inline-flex items-center ml-2"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Info className="w-4 h-4 text-slate-400 cursor-help" />
        {showTooltip && (
          <div className="absolute left-0 top-6 z-50 bg-slate-800 text-xs text-white p-3 rounded shadow-lg min-w-[280px] text-left leading-snug">
            {tooltip}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardHeader;

