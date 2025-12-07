import React, { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Info } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  tooltip?: string;
}

const KpiCard = ({ title, value, icon: Icon, color, tooltip }: Props) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className={`rounded-xl shadow-sm p-6 text-white flex items-center justify-between relative`}
      style={{ backgroundColor: color }}
    >
      <div className="flex-1">
        <div className="flex items-center gap-1.5 mb-1">
          <h4 className="text-sm opacity-80">{title}</h4>
          {tooltip && (
            <div
              className="relative"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <Info className="w-3.5 h-3.5 opacity-60 cursor-help" />
              {showTooltip && (
                <div className="absolute left-0 top-5 z-50 bg-slate-800 text-xs text-white p-3 rounded shadow-lg min-w-[280px] text-left leading-snug">
                  {tooltip}
                </div>
              )}
            </div>
          )}
        </div>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </div>
      <Icon className="w-10 h-10 opacity-80" />
    </div>
  );
};

export default KpiCard;