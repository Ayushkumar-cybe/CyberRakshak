import React, { useState, useEffect } from "react";
import { Zap, ShieldAlert, Clock, Database } from "lucide-react";
import { getThreatIntelSummary } from "../../services/api";

const IntelCards = () => {
  const [stats, setStats] = useState({
    total_cve_tracked: 0,
    cisa_kev_tracked: 0,
    exploits_available: 0,
    most_recent_sync: "N/A"
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getThreatIntelSummary();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch threat intel summary:", error);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    {
      label: "Total CVEs Tracked",
      value: stats.total_cve_tracked.toLocaleString(),
      icon: Database,
      color: "text-blue-600",
      subtitle: "Unique vulnerabilities in cache",
    },
    {
      label: "CISA KEV Found",
      value: stats.cisa_kev_tracked.toLocaleString(),
      icon: ShieldAlert,
      color: "text-red-600",
      subtitle: "Critical exploited vulnerabilities",
    },
    {
      label: "Exploits Available",
      value: stats.exploits_available.toLocaleString(),
      icon: Zap,
      color: "text-orange-500",
      subtitle: "Confirmed exploits in public sources",
    },
    {
      label: "Last Feed Update",
      value: stats.most_recent_sync,
      icon: Clock,
      color: "text-gray-500",
      subtitle: "Last time data was synced from NVD",
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

export default IntelCards;
