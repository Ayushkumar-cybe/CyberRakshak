import React, { useEffect, useState } from "react";
import { getJobHistory } from "../../services/api";

const alerts = [
  { msg: "Critical vulnerability found on app.gov.in", level: "Critical", color: "red" },
  { msg: "Suspicious login attempt from Russia", level: "High", color: "orange" },
  { msg: "New CVE added: CVE-2025-12134", level: "Medium", color: "yellow" },
];

const RecentActivity = () => {
  const [recentScans, setRecentScans] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the 3 most recent jobs to match the UI layout
        const jobs = await getJobHistory(0, 3);
        
        const mapped = jobs.map((j: any) => ({
          tool: j.scanners_used.join(", ") || "Unknown Scanner",
          target: j.target,
          status: j.status,
          // Map status to color for the Tailwind class `bg-{color}-500`
          color: j.status === "completed" ? "green" : j.status === "failed" ? "red" : "orange"
        }));
        setRecentScans(mapped);
      } catch (e) {
        console.error("Failed to fetch recent activity:", e);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Recent Scans & Alerts</h3>

      <div className="grid grid-cols-1 gap-4">

        {/* RECENT SCANS */}
        <div>
          <h4 className="font-semibold mb-2">Recent Scans</h4>
          <div className="space-y-2">
            {recentScans.length === 0 && (
              <p className="text-sm opacity-50 p-3">No recent scans found.</p>
            )}

            {recentScans.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800"
              >
                <div>
                  <p className="font-semibold">{item.tool}</p>
                  <p className="text-sm opacity-70">{item.target}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm text-white bg-${item.color}-500`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ALERTS */}
        <div>
          <h4 className="font-semibold mt-4 mb-2">Alerts</h4>
          <div className="space-y-2">
            {alerts.map((item, index) => (
              <div
                key={index}
                className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-l-4"
                style={{ borderColor: item.color }}
              >
                <p className="font-semibold">{item.level}</p>
                <p className="text-sm opacity-70">{item.msg}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default RecentActivity;
