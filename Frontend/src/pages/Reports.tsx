import React, { useState } from "react";
import { FileText, Download, Filter, Plus, AlertTriangle, CheckCircle, ArrowDownCircle, FileStack } from "lucide-react";

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Updated vault metrics data
  const vaultMetrics = [
    { 
      id: 1, 
      value: "128", 
      label: "Reports Available",
      visual: "document-stack",
      color: "text-white",
      glow: "hover:border-cyan-500/30"
    },
    { 
      id: 2, 
      value: "12", 
      label: "Requires Immediate Attention",
      visual: "alert",
      color: "text-red-500",
      glow: "hover:border-red-500/30"
    },
    { 
      id: 3, 
      value: "94%", 
      label: "ISO/NIST Readiness",
      visual: "circular-progress",
      color: "text-green-500",
      glow: "hover:border-green-500/30"
    },
    { 
      id: 4, 
      value: "3", 
      label: "Ready for Export",
      visual: "download",
      color: "text-orange-500",
      glow: "hover:border-orange-500/30"
    }
  ];

  // Mock data for recent intelligence
  const recentIntelligence = [
    { id: 1, title: "Executive Summary Q3", type: "CONFIDENTIAL", accent: "blue" },
    { id: 2, title: "Vulnerability Scan", type: "CONFIDENTIAL", accent: "red" },
    { id: 3, title: "Compliance Audit", type: "CONFIDENTIAL", accent: "purple" },
    { id: 4, title: "Threat Intelligence", type: "CONFIDENTIAL", accent: "orange" }
  ];

  // Mock data for archive table
  const archiveData = [
    { id: 1, name: "Executive Summary Q3 2025", classification: "Executive", date: "2025-11-28", size: "5.1 MB" },
    { id: 2, name: "Monthly Vulnerability Scan", classification: "Technical", date: "2025-11-30", size: "2.4 MB" },
    { id: 3, name: "Incident Report #402", classification: "Executive", date: "2025-11-25", size: "1.2 MB" },
    { id: 4, name: "Network Penetration Test", classification: "Technical", date: "2025-11-20", size: "8.7 MB" },
    { id: 5, name: "GDPR Compliance Checklist", classification: "Compliance", date: "2025-11-15", size: "0.8 MB" },
    { id: 6, name: "Quarterly Risk Assessment", classification: "Executive", date: "2025-11-10", size: "3.5 MB" },
    { id: 7, name: "ISO 27001 Audit Report", classification: "Compliance", date: "2025-11-05", size: "4.3 MB" },
    { id: 8, name: "Annual Security Posture", classification: "Executive", date: "2025-10-30", size: "6.2 MB" }
  ];

  // Get classification color
  const getClassificationColor = (classification: string) => {
    if (classification === "Technical") return "text-blue-500";
    if (classification === "Executive") return "text-green-500";
    if (classification === "Compliance") return "text-purple-500";
    return "text-gray-500";
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#050b14] text-slate-900 dark:text-white p-6 max-w-[1600px] mx-auto">
      {/* Generate Report Button */}
      <div className="flex justify-end mb-8">
        <button
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg shadow-lg transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Generate Report
        </button>
      </div>

      {/* TOP ROW: 4 SYMMETRICAL TILES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {vaultMetrics.map((metric) => (
          <div 
            key={metric.id} 
            className={`bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 p-6 rounded-xl ${metric.glow} transition-all`}
          >
            <div className={`text-2xl font-bold mb-1 ${metric.color}`}>{metric.value}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">{metric.label}</div>
            
            {/* Visual Elements */}
            {metric.visual === "document-stack" && (
              <div className="flex justify-center mt-4">
                <FileStack className="w-12 h-12 text-cyan-500" />
              </div>
            )}
            
            {metric.visual === "alert" && (
              <div className="flex justify-center mt-4 animate-pulse">
                <AlertTriangle className="w-12 h-12 text-red-500" />
              </div>
            )}
            
            {metric.visual === "circular-progress" && (
              <div className="flex justify-center mt-4">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.1)"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeDasharray="94, 100"
                    />
                  </svg>
                </div>
              </div>
            )}
            
            {metric.visual === "download" && (
              <div className="flex flex-col items-center mt-4">
                <ArrowDownCircle className="w-8 h-8 text-orange-500 mb-2" />
                <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 rounded-full" 
                    style={{ width: '75%' }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ROW 2: RECENT INTELLIGENCE (4 Visual Document Cards) */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentIntelligence.map((doc) => (
            <div 
              key={doc.id} 
              className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 p-6 rounded-xl hover:border-cyan-500/30 transition-all group hover:-translate-y-2 hover:shadow-cyan-500/20 relative overflow-hidden"
            >
              {/* Document Card */}
              <div className="flex justify-between items-start mb-4">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="text-xs border border-red-500 text-red-500 px-2 py-1 rounded">CONFIDENTIAL</span>
              </div>
              
              <div className="text-lg font-semibold text-slate-900 dark:text-white mb-8">{doc.title}</div>
              
              <div className="text-sm text-slate-500 dark:text-slate-400">Generated by CyRa AI</div>
              
              {/* Hover Download Button */}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                <button className="flex items-center gap-2 bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition">
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ROW 3: THE ARCHIVE (Full Width Table) */}
      <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between p-6 border-b border-slate-200 dark:border-slate-700 gap-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Report Archive</h3>
          
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search archives..."
                className="pl-3 pr-10 py-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <button 
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-lg text-sm hover:bg-[#111625]/80 transition"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <Filter className="w-4 h-4" />
                Filter
              </button>
              
              {showFilterDropdown && (
                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10">
                  <div className="p-2">
                    <div className="px-3 py-2 hover:bg-[#111625]/80 rounded cursor-pointer">Executive</div>
                    <div className="px-3 py-2 hover:bg-[#111625]/80 rounded cursor-pointer">Technical</div>
                    <div className="px-3 py-2 hover:bg-[#111625]/80 rounded cursor-pointer">Compliance</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Archive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#0f172a] text-left">
                <th className="p-4 font-semibold text-gray-400 text-xs">Report Name</th>
                <th className="p-4 font-semibold text-gray-400 text-xs">Classification</th>
                <th className="p-4 font-semibold text-gray-400 text-xs">Generated Date</th>
                <th className="p-4 font-semibold text-gray-400 text-xs">Size</th>
                <th className="p-4 font-semibold text-gray-400 text-xs">Download</th>
              </tr>
            </thead>
            <tbody>
              {archiveData.map((report) => (
                <tr 
                  key={report.id} 
                  className="border-b border-slate-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                >
                  <td className="p-4 font-medium text-slate-900 dark:text-white">{report.name}</td>
                  <td className="p-4">
                    <span className={`flex items-center`}>
                      <span className={`w-2 h-2 rounded-full mr-2 ${getClassificationColor(report.classification)}`}></span>
                      <span className="text-slate-900 dark:text-white">{report.classification}</span>
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">{report.date}</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">{report.size}</td>
                  <td className="p-4">
                    <button className="p-2 rounded hover:bg-[#111625]/40 dark:hover:bg-slate-700 transition">
                      <Download className="w-4 h-4 text-cyan-500" />
                    </button>
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

export default Reports;