import React from "react";
import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

const KpiCard = ({ title, value, icon: Icon, color }: Props) => {
  return (
    <div
      className={`rounded-xl shadow-sm p-6 text-white flex items-center justify-between`}
      style={{ backgroundColor: color }}
    >
      <div>
        <h4 className="text-sm opacity-80">{title}</h4>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </div>
      <Icon className="w-10 h-10 opacity-80" />
    </div>
  );
};

export default KpiCard;