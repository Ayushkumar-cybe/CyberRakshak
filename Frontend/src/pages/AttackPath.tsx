import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import AttackGraph from "../components/attack/AttackGraph";
import { Search, Download } from "lucide-react";

const AttackPath = () => {
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get("job_id") || "";
  
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [techniqueFilter, setTechniqueFilter] = useState("All");

  // Mock data for the attack path table
  const mockAttackPaths = [
    {
      id: "#102",
      source: "Internet",
      target: "Database",
      technique: "T1190 - Exploit Public-Facing Application",
      probability: "87%",
      severity: "Critical"
    },
    {
      id: "#205",
      source: "Workstation-04",
      target: "Domain Controller",
      technique: "T1003 - OS Credential Dumping",
      probability: "92%",
      severity: "Critical"
    },
    {
      id: "#301",
      source: "Email Attachment",
      target: "Finance-PC",
      technique: "T1204 - User Execution",
      probability: "76%",
      severity: "High"
    },
    {
      id: "#412",
      source: "Shared-Admin",
      target: "File Server",
      technique: "T1078 - Valid Accounts",
      probability: "68%",
      severity: "Medium"
    },
    {
      id: "#508",
      source: "VPN Gateway",
      target: "Internal DNS",
      technique: "T1133 - External Remote Services",
      probability: "54%",
      severity: "Low"
    }
  ];

  // Get severity badge style
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-500/20 text-red-500 dark:text-red-400";
      case "High":
        return "bg-orange-500/20 text-orange-500 dark:text-orange-400";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-500 dark:text-yellow-400";
      case "Low":
        return "bg-green-500/20 text-green-500 dark:text-green-400";
      default:
        return "bg-gray-500/20 text-gray-500 dark:text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050b14] text-slate-900 dark:text-white p-6">
      {/* Page Header - REMOVED */}

      {/* LAYER 1: RISK METRICS (The "What's Wrong" Header) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: Critical Attack Paths */}
        <div className="bg-white dark:bg-[#111625]/90 border border-slate-200 dark:border-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600 dark:text-red-500">3</div>
          <div className="text-xs uppercase text-slate-500 dark:text-slate-400 mt-1">Critical Attack Paths</div>
        </div>

        {/* Card 2: Top Choke Point */}
        <div className="bg-white dark:bg-[#111625]/90 border border-slate-200 dark:border-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-500">Admin-PC</div>
          <div className="text-xs uppercase text-slate-500 dark:text-slate-400 mt-1">Top Choke Point</div>
        </div>

        {/* Card 3: Asset Exposure */}
        <div className="bg-white dark:bg-[#111625]/90 border border-slate-200 dark:border-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-500">85%</div>
          <div className="text-xs uppercase text-slate-500 dark:text-slate-400 mt-1">Asset Exposure</div>
        </div>

        {/* Card 4: Time to Compromise */}
        <div className="bg-white dark:bg-[#111625]/90 border border-slate-200 dark:border-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600 dark:text-red-500">{'<'} 2h</div>
          <div className="text-xs uppercase text-slate-500 dark:text-slate-400 mt-1">Time to Compromise</div>
        </div>
      </div>

      {/* LAYER 2: THE GRAPH VISUALIZATION */}
      <div className="h-[500px] w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl relative overflow-hidden mb-6">
        {/* Grid Pattern for Light Mode */}
        <div className="absolute inset-0 opacity-20 bg-[length:20px_20px] hidden dark:block"
          style={{
            backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`
          }}
        ></div>
        
        {/* Grid Pattern for Light Mode */}
        <div className="absolute inset-0 opacity-20 bg-[length:20px_20px] block dark:hidden"
          style={{
            backgroundImage: `radial-gradient(circle, #cbd5e1 1px, transparent 1px)`
          }}
        ></div>

        {/* Graph Content */}
        <div className="w-full h-full">
          <AttackGraph initialJobId={initialJobId} />
        </div>
        
        {/* Legend Overlay */}
        <div className="absolute bottom-4 right-4 bg-white/80 dark:bg-black/40 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-lg p-3 text-xs">
          <div className="flex items-center mb-1">
            <div className="w-3 h-0.5 bg-red-500 mr-2"></div>
            <span className="text-slate-700 dark:text-gray-300">Exploit Path</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-0.5 bg-blue-500 border-dashed border-b mr-2"></div>
            <span className="text-slate-700 dark:text-gray-300">Lateral Movement</span>
          </div>
        </div>
      </div>

      {/* LAYER 3: THE TABLE WITH CONCISE FILTERS */}
      <div className="bg-white dark:bg-[#111625]/90 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
        {/* Header Bar with Filters */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-white/10">
          <div className="text-lg font-semibold text-slate-900 dark:text-white">Attack Path Details</div>
          
          <div className="flex items-center space-x-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search paths..."
                className="w-64 bg-white dark:bg-[#111625] border border-slate-200 dark:border-white/10 rounded px-8 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Severity Filter */}
            <select 
              className="bg-white dark:bg-[#111625] border border-slate-200 dark:border-white/10 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            
            {/* Technique Filter */}
            <select 
              className="bg-white dark:bg-[#111625] border border-slate-200 dark:border-white/10 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
              value={techniqueFilter}
              onChange={(e) => setTechniqueFilter(e.target.value)}
            >
              <option value="All">All Techniques</option>
              <option value="T1190">T1190 - Exploit</option>
              <option value="T1003">T1003 - Credential Dumping</option>
              <option value="T1078">T1078 - Valid Accounts</option>
              <option value="T1204">T1204 - User Execution</option>
            </select>
            
            {/* Export Button */}
            <button className="flex items-center text-sm bg-transparent border border-slate-200 dark:border-white/20 rounded px-3 py-1.5 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition">
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
          </div>
        </div>
        
        {/* Attack Path Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-white/5 text-left">
                <th className="p-3 font-semibold text-slate-600 dark:text-slate-400 uppercase text-xs">Path ID</th>
                <th className="p-3 font-semibold text-slate-600 dark:text-slate-400 uppercase text-xs">Source Node</th>
                <th className="p-3 font-semibold text-slate-600 dark:text-slate-400 uppercase text-xs">Target Node</th>
                <th className="p-3 font-semibold text-slate-600 dark:text-slate-400 uppercase text-xs">Technique</th>
                <th className="p-3 font-semibold text-slate-600 dark:text-slate-400 uppercase text-xs">Probability</th>
                <th className="p-3 font-semibold text-slate-600 dark:text-slate-400 uppercase text-xs">Severity</th>
              </tr>
            </thead>
            <tbody>
              {mockAttackPaths.map((path, index) => (
                <tr key={index} className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition">
                  <td className="p-3 font-mono text-slate-900 dark:text-white">{path.id}</td>
                  <td className="p-3 text-slate-900 dark:text-white">{path.source}</td>
                  <td className="p-3 text-slate-900 dark:text-white">{path.target}</td>
                  <td className="p-3 font-mono text-xs text-slate-900 dark:text-white">{path.technique}</td>
                  <td className="p-3 text-slate-900 dark:text-white">{path.probability}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityBadge(path.severity)}`}>
                      {path.severity}
                    </span>
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

export default AttackPath;