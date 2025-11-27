import React from "react";
import { Globe, Shield, Cloud, Server } from "lucide-react";

const cards = [
  {
    label: "Total Assets",
    value: "238",
    icon: Server,
    color: "text-blue-600",
    subtitle: "All discovered devices",
  },
  {
    label: "Internet Exposed",
    value: "14",
    icon: Globe,
    color: "text-red-600",
    subtitle: "Publicly reachable systems",
  },
  {
    label: "High-Risk Assets",
    value: "27",
    icon: Shield,
    color: "text-orange-500",
    subtitle: "Based on vulnerabilities",
  },
  {
    label: "Cloud Assets",
    value: "62",
    icon: Cloud,
    color: "text-purple-600",
    subtitle: "AWS / Azure / GCP",
  },
];

const AssetSummaryCards = () => {
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