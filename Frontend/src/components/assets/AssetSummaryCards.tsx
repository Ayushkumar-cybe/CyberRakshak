import React from "react";
import { Globe, Shield, Cloud, Server } from "lucide-react";

interface Props {
  stats: {
    total: number;
    exposed: number;
    highRisk: number;
    cloud: number;
  };
}

const AssetSummaryCards = ({ stats }: Props) => {
  const cards = [
    {
      label: "Total Assets",
      value: stats?.total || 0,
      icon: Server,
      color: "text-blue-600",
      subtitle: "All discovered devices",
    },
    {
      label: "Internet Exposed",
      value: stats?.exposed || 0,
      icon: Globe,
      color: "text-red-600",
      subtitle: "Publicly reachable systems",
    },
    {
      label: "High-Risk Assets",
      value: stats?.highRisk || 0,
      icon: Shield,
      color: "text-orange-500",
      subtitle: "Based on vulnerabilities",
    },
    {
      label: "Cloud Assets",
      value: stats?.cloud || 0,
      icon: Cloud,
      color: "text-purple-600",
      subtitle: "AWS / Azure / GCP",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-slate-800 rounded-xl shadow p-5 flex items-start gap-4 hover:shadow-md transition"
          >
            <div
              className={`p-3 rounded-lg bg-slate-100 dark:bg-slate-700 ${item.color}`}
            >
              <Icon className="w-6 h-6" />
            </div>

            <div>
              <p className="text-xl font-bold">{item.value}</p>
              <p className="font-semibold mt-1">{item.label}</p>
              <p className="text-xs mt-1 opacity-70">{item.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AssetSummaryCards;
