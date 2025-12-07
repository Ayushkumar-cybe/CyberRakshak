import React from "react";
import CardHeader from "./CardHeader";

const recentScans = [
  { tool: "Nmap", target: "172.31.54.21", status: "Completed", color: "green" },
  { tool: "Nuclei", target: "vuln.app.in", status: "High Risk", color: "red" },
  { tool: "OpenVAS", target: "10.0.0.14", status: "Running", color: "orange" },
];

const alerts = [
  { msg: "Critical vulnerability found on app.gov.in", level: "Critical", color: "red" },
  { msg: "Suspicious login attempt from Russia", level: "High", color: "orange" },
  { msg: "New CVE added: CVE-2025-12134", level: "Medium", color: "yellow" },
];

const RecentActivity = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <CardHeader
        title="Recent Scans & Alerts"
        tooltip="Latest security scan executions and real-time security alerts from monitoring systems."
      />

      <div className="grid grid-cols-1 gap-4">

        {/* RECENT SCANS */}
        <div>
          <h4 className="font-semibold mb-2">Recent Scans</h4>
          <div className="space-y-2">
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