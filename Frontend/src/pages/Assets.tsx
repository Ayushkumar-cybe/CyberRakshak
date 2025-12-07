import React, { useState } from "react";
import { Search, Filter, Server, Monitor, Shield, AlertTriangle, CheckCircle } from "lucide-react";

const Assets = () => {
  // Mock data for the asset table
  const mockAssets = [
    {
      id: 1,
      name: "WEB-SERVER-01",
      ip: "10.0.0.5",
      criticality: 5,
      riskScore: 761,
      os: "Windows Server 2019",
      missingPatches: 44,
      tags: ["Cloud Agent", "PCI"],
      status: "Active"
    },
    {
      id: 2,
      name: "DB-SERVER-02",
      ip: "10.0.0.12",
      criticality: 5,
      riskScore: 823,
      os: "Ubuntu 20.04 LTS",
      missingPatches: 38,
      tags: ["Database", "Internal"],
      status: "Active"
    },
    {
      id: 3,
      name: "APP-SERVER-03",
      ip: "10.0.1.22",
      criticality: 4,
      riskScore: 642,
      os: "CentOS 7.9",
      missingPatches: 27,
      tags: ["Application", "Production"],
      status: "Maintenance"
    },
    {
      id: 4,
      name: "WORKSTATION-04",
      ip: "10.0.2.15",
      criticality: 3,
      riskScore: 421,
      os: "Windows 10 Pro",
      missingPatches: 18,
      tags: ["Workstation", "User"],
      status: "Active"
    },
    {
      id: 5,
      name: "MAIL-SERVER-05",
      ip: "10.0.3.8",
      criticality: 5,
      riskScore: 789,
      os: "Exchange Server 2016",
      missingPatches: 52,
      tags: ["Mail", "Critical"],
      status: "Active"
    },
    {
      id: 6,
      name: "BACKUP-SERVER-06",
      ip: "10.0.4.33",
      criticality: 4,
      riskScore: 567,
      os: "Windows Server 2016",
      missingPatches: 31,
      tags: ["Backup", "Storage"],
      status: "Inactive"
    },
    {
      id: 7,
      name: "DNS-SERVER-07",
      ip: "10.0.5.9",
      criticality: 5,
      riskScore: 812,
      os: " BIND 9.11",
      missingPatches: 47,
      tags: ["DNS", "Infrastructure"],
      status: "Active"
    },
    {
      id: 8,
      name: "DEV-WORKSTATION-08",
      ip: "10.0.6.45",
      criticality: 3,
      riskScore: 356,
      os: "Ubuntu 22.04 LTS",
      missingPatches: 12,
      tags: ["Development", "Non-Critical"],
      status: "Active"
    },
    {
      id: 9,
      name: "FILE-SERVER-09",
      ip: "10.0.7.18",
      criticality: 4,
      riskScore: 678,
      os: "Windows Server 2022",
      missingPatches: 33,
      tags: ["File Share", "Internal"],
      status: "Active"
    },
    {
      id: 10,
      name: "VPN-GATEWAY-10",
      ip: "10.0.8.7",
      criticality: 5,
      riskScore: 891,
      os: "PFSense 2.6",
      missingPatches: 56,
      tags: ["Network", "Security"],
      status: "Active"
    }
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [groupBy, setGroupBy] = useState("None");

  // Get OS icon based on OS name
  const getOsIcon = (os: string) => {
    if (os.includes("Windows")) return <Monitor className="w-4 h-4 mr-1" />;
    if (os.includes("Ubuntu") || os.includes("CentOS") || os.includes("Linux")) return <Server className="w-4 h-4 mr-1" />;
    return <Server className="w-4 h-4 mr-1" />;
  };

  // Get status indicator
  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "Active":
        return <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> {status}</span>;
      case "Maintenance":
        return <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span> {status}</span>;
      case "Inactive":
        return <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span> {status}</span>;
      default:
        return <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-gray-500 mr-2"></span> {status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#050b14] text-slate-800 dark:text-white p-6">
      {/* TOP ANALYTICS ROW (The Dashboard) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Card 1: Asset Criticality (The Bar Chart) */}
        <div className="bg-white dark:bg-[#1e293b] dark:border-slate-700 border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">Asset Criticality</h3>
          <div className="w-full h-40 flex items-end justify-between px-4 gap-2 mt-4">
            {/* Bar 1 */}
            <div className="flex flex-col items-center gap-1 w-full group">
              <div className="w-full bg-slate-200 h-8 rounded-t-sm"></div>
              <div className="text-xs font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">[1]</div>
            </div>
            {/* Bar 2 */}
            <div className="flex flex-col items-center gap-1 w-full group">
              <div className="w-full bg-slate-200 h-12 rounded-t-sm"></div>
              <div className="text-xs font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">[2]</div>
            </div>
            {/* Bar 3 */}
            <div className="flex flex-col items-center gap-1 w-full group">
              <div className="w-full bg-blue-200 h-16 rounded-t-sm"></div>
              <div className="text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">[3]</div>
            </div>
            {/* Bar 4 */}
            <div className="flex flex-col items-center gap-1 w-full group">
              <div className="w-full bg-blue-400 h-24 rounded-t-sm"></div>
              <div className="text-xs font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">[4]</div>
            </div>
            {/* Bar 5 (Critical) */}
            <div className="flex flex-col items-center gap-1 w-full group">
              <div className="text-xs font-bold text-red-600 mb-1">5037</div>
              <div className="w-full bg-red-500 h-32 rounded-t-sm shadow-lg shadow-red-200"></div>
              <div className="text-xs font-bold text-white bg-red-500 px-1.5 py-0.5 rounded">[5]</div>
            </div>
          </div>
        </div>

        {/* Card 2: Detection Score (The Purple Histogram) */}
        <div className="bg-white dark:bg-[#1e293b] dark:border-slate-700 border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">Detection Score</h3>
          <div className="w-full h-40 flex items-end justify-between px-8 gap-4 mt-4">
            {/* Low */}
            <div className="flex flex-col items-center w-full">
              <div className="w-full bg-purple-200 h-24 rounded-t-sm"></div>
              <span className="text-[10px] uppercase text-slate-400 mt-2">Low</span>
            </div>
            {/* Med */}
            <div className="flex flex-col items-center w-full">
              <div className="w-full bg-purple-300 h-16 rounded-t-sm"></div>
              <span className="text-[10px] uppercase text-slate-400 mt-2">Med</span>
            </div>
            {/* High */}
            <div className="flex flex-col items-center w-full">
              <div className="w-full bg-purple-400 h-10 rounded-t-sm"></div>
              <span className="text-[10px] uppercase text-slate-400 mt-2">High</span>
            </div>
            {/* Critical */}
            <div className="flex flex-col items-center w-full">
              <div className="text-xs font-bold text-purple-700 mb-1">105k</div>
              <div className="w-full bg-purple-600 h-20 rounded-t-sm shadow-lg shadow-purple-200"></div>
              <span className="text-[10px] uppercase text-slate-400 mt-2">Crit</span>
            </div>
          </div>
        </div>

        {/* Card 3: Risk Score (The CSS Ring) */}
        <div className="bg-white dark:bg-[#1e293b] dark:border-slate-700 border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">Risk Score</h3>
          <div className="w-full h-40 flex items-center justify-center relative mt-4">
            {/* The CSS Donut */}
            <div className="w-32 h-32 rounded-full" style={{
              background: 'conic-gradient(#8b5cf6 0% 65%, #cbd5e1 65% 100%)',
              padding: '12px'
            }}>
              <div className="w-full h-full bg-white rounded-full flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-800 dark:text-white">6.43K</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-400 uppercase tracking-wide">Total Assets</span>
              </div>
            </div>
            {/* Legend (Floated Right) */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-1 text-[10px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1"><div className="w-2 h-2 bg-purple-500 rounded-sm"></div> High</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-300 rounded-sm"></div> Low</div>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE KPI STRIP (Prioritization) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-[#1e293b] dark:border-slate-700 border border-gray-200 rounded-lg p-4 shadow-sm relative overflow-hidden">
          <Shield className="absolute right-0 top-1/2 transform -translate-y-1/2 w-24 h-24 text-purple-500 opacity-5" />
          <div className="flex items-center">
            <div className="bg-purple-500 rounded-full w-10 h-10 flex items-center justify-center mr-3 shadow-lg shadow-purple-200">
              <span className="text-sm font-bold text-white">1.31K</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">Prioritized Assets</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Based on risk scoring</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#1e293b] dark:border-slate-700 border border-gray-200 rounded-lg p-4 shadow-sm relative overflow-hidden">
          <AlertTriangle className="absolute right-0 top-1/2 transform -translate-y-1/2 w-24 h-24 text-red-500 opacity-5" />
          <div className="flex items-center">
            <div className="bg-red-500 rounded-full w-10 h-10 flex items-center justify-center mr-3 shadow-lg shadow-red-200">
              <span className="text-sm font-bold text-white">81.8K</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">Vulnerable Instances</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Across all assets</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#1e293b] dark:border-slate-700 border border-gray-200 rounded-lg p-4 shadow-sm relative overflow-hidden">
          <CheckCircle className="absolute right-0 top-1/2 transform -translate-y-1/2 w-24 h-24 text-green-500 opacity-5" />
          <div className="flex items-center">
            <div className="bg-green-500 rounded-full w-10 h-10 flex items-center justify-center mr-3 shadow-lg shadow-green-200">
              <span className="text-sm font-bold text-white">136</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">Available Patches</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Ready for deployment</div>
            </div>
          </div>
        </div>
      </div>

      {/* DATA GRID (High Density Table) */}
      <div className="bg-white dark:bg-[#1e293b] dark:border-slate-700 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {/* Controls */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-700 rounded px-10 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <Filter className="w-4 h-4 mr-2 text-gray-400" />
            <select 
              className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
            >
              <option value="None">Group By: None</option>
              <option value="Criticality">Criticality</option>
              <option value="OS">Operating System</option>
              <option value="Tags">Tags</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#1e293b] border-b border-gray-200 dark:border-slate-700">
                <th className="p-3 text-left font-bold text-gray-500 dark:text-slate-300 uppercase tracking-wider text-xs">Asset Name</th>
                <th className="p-3 text-left font-bold text-gray-500 dark:text-slate-300 uppercase tracking-wider text-xs">Status</th>
                <th className="p-3 text-left font-bold text-gray-500 dark:text-slate-300 uppercase tracking-wider text-xs">Criticality</th>
                <th className="p-3 text-left font-bold text-gray-500 dark:text-slate-300 uppercase tracking-wider text-xs">Risk Score</th>
                <th className="p-3 text-left font-bold text-gray-500 dark:text-slate-300 uppercase tracking-wider text-xs">OS</th>
                <th className="p-3 text-left font-bold text-gray-500 dark:text-slate-300 uppercase tracking-wider text-xs">Missing Patches</th>
                <th className="p-3 text-left font-bold text-gray-500 dark:text-slate-300 uppercase tracking-wider text-xs">Tags</th>
              </tr>
            </thead>
            <tbody>
              {mockAssets.map((asset) => (
                <tr key={asset.id} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800">
                  <td className="p-3">
                    <div className="flex items-center">
                      <Server className="w-4 h-4 mr-2 text-slate-500" />
                      <div>
                        <div className="font-semibold text-blue-600 hover:underline cursor-pointer">{asset.name}</div>
                        <div className="text-gray-500 dark:text-slate-400 text-xs">{asset.ip}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    {getStatusIndicator(asset.status)}
                  </td>
                  <td className="p-3">
                    <div className={`w-6 h-6 flex items-center justify-center text-xs font-bold text-white rounded ${
                      asset.criticality === 5 ? "bg-red-500" : 
                      asset.criticality === 4 ? "bg-orange-500" : 
                      "bg-yellow-500"
                    }`}>
                      {asset.criticality}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="border rounded-full px-2 py-1 text-xs font-medium">
                      {asset.riskScore}
                    </span>
                  </td>
                  <td className="p-3 flex items-center">
                    {getOsIcon(asset.os)}
                    {asset.os}
                  </td>
                  <td className="p-3 text-slate-800 dark:text-white">{asset.missingPatches}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {asset.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Assets;