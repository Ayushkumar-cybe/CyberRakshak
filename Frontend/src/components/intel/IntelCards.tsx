import React, { useState, useEffect } from "react";

const intelData = [
  {
    cve: "CVE-2025-12432",
    severity: "Critical",
    summary: "Remote code execution vulnerability in Apache HTTP Server.",
    epss: 0.92,
    exploit: "Exploit Available",
    tags: ["RCE", "Apache", "Network"],
  },
  {
    cve: "CVE-2024-44711",
    severity: "High",
    summary: "Privilege escalation flaw affecting Linux kernel permissions.",
    epss: 0.67,
    exploit: "No Known Exploit",
    tags: ["PrivEsc", "Linux"],
  },
  {
    cve: "CVE-2023-88451",
    severity: "Medium",
    summary: "Directory traversal vulnerability in PHP applications.",
    epss: 0.33,
    exploit: "Exploit Available",
    tags: ["Traversal", "PHP"],
  },
];

const severityColors: any = {
  Critical: "bg-red-600",
  High: "bg-orange-500",
  Medium: "bg-yellow-500",
  Low: "bg-blue-500",
};

const IntelCards = ({ onSelect }: any) => {
  const [intelItems, setIntelItems] = useState(intelData);
  const [loading, setLoading] = useState(false);

  // In a real implementation, this would fetch from a threat intelligence API
  // For now, we'll use the mock data but structure it for future API integration
  useEffect(() => {
    // This is where we would call the threat intelligence API
    // const fetchIntelData = async () => {
    //   try {
    //     setLoading(true);
    //     // const data = await getThreatIntel(); // This would be a new API endpoint
    //     // setIntelItems(data);
    //   } catch (error) {
    //     console.error("Failed to fetch threat intelligence data:", error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // 
    // fetchIntelData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading threat intelligence data...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {intelItems.map((item, index) => (
        <div
          key={index}
          onClick={() => onSelect(item)}
          className="cursor-pointer bg-white dark:bg-slate-800 shadow rounded-xl p-5 hover:shadow-lg transition border border-slate-200 dark:border-slate-700"
        >
          {/* CVE */}
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-lg">{item.cve}</span>
            <span
              className={`px-2 py-1 text-xs text-white rounded-full ${severityColors[item.severity]}`}
            >
              {item.severity}
            </span>
          </div>

          {/* Summary */}
          <p className="text-sm opacity-70">{item.summary}</p>

          {/* EPSS + Exploit */}
          <div className="mt-4 text-sm">
            <p>
              <strong>EPSS:</strong> {(item.epss * 100).toFixed(1)}%
            </p>
            <p className="opacity-70">{item.exploit}</p>
          </div>

          {/* Tags */}
          <div className="flex gap-2 flex-wrap mt-4">
            {item.tags.map((tag: string, idx: number) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default IntelCards;