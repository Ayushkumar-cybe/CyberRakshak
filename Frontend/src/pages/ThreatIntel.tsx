import React, { useState, useEffect } from "react";
import IntelCards from "../components/intel/IntelCards";
import IntelSearchBar from "../components/intel/IntelSearchBar";
import IntelDrawer from "../components/intel/IntelDrawer";
import { getThreatIntelFeed } from "../services/api";
import { Shield, ShieldAlert, Skull } from "lucide-react";

const ThreatIntel = () => {
  const [filters, setFilters] = useState({});
  const [feedData, setFeedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntel, setSelectedIntel] = useState<any>(null);
  const [severityFilter, setSeverityFilter] = useState("All");
  const [exploitStatusFilter, setExploitStatusFilter] = useState("All");

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const data = await getThreatIntelFeed();
        setFeedData(data);
      } catch (error) {
        console.error("Failed to fetch threat intel feed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  const getSeverityColor = (severity: string) => {
    const s = severity ? severity.toUpperCase() : "INFO";
    if (s === 'CRITICAL') return 'bg-red-700';
    if (s === 'HIGH') return 'bg-red-500';
    if (s === 'MEDIUM') return 'bg-orange-500';
    if (s === 'LOW') return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  // Helper to map API data format to Drawer format
  const handleView = (item: any) => {
    setSelectedIntel({
      cve: item.cve_id,
      summary: item.description,
      severity: item.severity,
      // Mock EPSS based on CVSS for demo purposes (since API doesn't have EPSS yet)
      epss: item.cvss_score ? item.cvss_score / 10 : 0, 
      exploit: item.has_exploit ? "Exploit Available" : "No Known Exploit"
    });
  };

  // Mock data for threat landscape widgets
  const mockThreatActors = [
    { name: "APT29 (Cozy Bear)", focus: "Targeting Gov/Diplo", threatLevel: "Critical" },
    { name: "Lazarus Group", focus: "Financial/Crypto", threatLevel: "High" },
    { name: "LockBit 3.0", focus: "Ransomware as a Service", threatLevel: "Critical" }
  ];

  // Mock vulnerability data with new fields
  const mockVulns = [
    {
      cve_id: "CVE-2024-XXXX",
      severity: "CRITICAL",
      cvss_score: 9.8,
      threat_actor: "APT29",
      exploit_status: "In the Wild",
      last_seen: "2024-06-15",
      description: "Zero-Day RCE in Exchange Server"
    },
    {
      cve_id: "CVE-2023-XXXX",
      severity: "HIGH",
      cvss_score: 8.1,
      threat_actor: "LockBit",
      exploit_status: "PoC Available",
      last_seen: "2024-06-12",
      description: "SQL Injection in VPN Gateway"
    },
    {
      cve_id: "CVE-2024-YYYY",
      severity: "CRITICAL",
      cvss_score: 9.1,
      threat_actor: "Lazarus Group",
      exploit_status: "In the Wild",
      last_seen: "2024-06-10",
      description: "Buffer Overflow in Financial Software"
    },
    {
      cve_id: "CVE-2023-YYYY",
      severity: "MEDIUM",
      cvss_score: 6.5,
      threat_actor: "APT29",
      exploit_status: "PoC Available",
      last_seen: "2024-06-08",
      description: "Privilege Escalation in Auth Module"
    },
    {
      cve_id: "CVE-2024-ZZZZ",
      severity: "HIGH",
      cvss_score: 7.3,
      threat_actor: "LockBit",
      exploit_status: "Active Exploitation",
      last_seen: "2024-06-05",
      description: "Remote Code Execution in CMS"
    }
  ];

  const getThreatLevelColor = (level: string) => {
    if (level === "Critical") return "bg-red-500";
    if (level === "High") return "bg-orange-500";
    return "bg-gray-500";
  };

  const getExploitStatusColor = (status: string) => {
    if (status === "In the Wild" || status === "Active Exploitation") return "bg-red-500";
    if (status === "PoC Available") return "bg-orange-500";
    return "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header - REMOVED */}

      {/* Summary Cards */}
      <IntelCards />

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-5">
        <IntelSearchBar />
      </div>

      {/* THREAT LANDSCAPE WIDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Widget 1: Exploitation Trends (Area Chart) */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-5">
          <h3 className="text-lg font-semibold mb-4">Exploitation Activity (Last 30 Days)</h3>
          <div className="h-40 flex items-end justify-between px-2">
            {/* Static SVG Area Chart */}
            <svg width="100%" height="100%" viewBox="0 0 300 150" className="overflow-visible">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <path 
                d="M 0 140 L 30 130 L 60 110 L 90 90 L 120 80 L 150 60 L 180 50 L 210 40 L 240 30 L 270 20 L 300 30 L 300 150 L 0 150 Z" 
                fill="url(#gradient)" 
                stroke="none"
              />
              {/* Line */}
              <polyline 
                points="0,140 30,130 60,110 90,90 120,80 150,60 180,50 210,40 240,30 270,20 300,30" 
                fill="none" 
                stroke="#ef4444" 
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        {/* Widget 2: Top Threat Actors (List) */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-5">
          <h3 className="text-lg font-semibold mb-4">Active Threat Groups</h3>
          <div className="space-y-4">
            {mockThreatActors.map((actor, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Skull className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <div className="font-medium">{actor.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{actor.focus}</div>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs text-white rounded-full ${getThreatLevelColor(actor.threatLevel)}`}>
                  {actor.threatLevel}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 3: Vulnerability by Type (Donut) */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-5">
          <h3 className="text-lg font-semibold mb-4">Vulnerability Categories</h3>
          <div className="flex items-center justify-between">
            <div className="relative w-32 h-32">
              {/* CSS Donut Chart */}
              <div className="absolute inset-0 rounded-full border-8 border-red-500" 
                style={{ clipPath: "polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)" }}></div>
              <div className="absolute inset-0 rounded-full border-8 border-orange-500" 
                style={{ clipPath: "polygon(50% 50%, 100% 0%, 100% 100%, 50% 100%)" }}></div>
              <div className="absolute inset-0 rounded-full border-8 border-yellow-500" 
                style={{ clipPath: "polygon(50% 50%, 50% 100%, 0% 100%, 0% 0%, 50% 0%)" }}></div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm">RCE (40%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                <span className="text-sm">PrivEsc (35%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm">XSS (25%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* UPGRADED TABLE WITH INTEGRATED FILTERS */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
          <h3 className="text-lg font-semibold">Global Vulnerability Feed</h3>
          
          <div className="flex flex-wrap gap-3">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search CVEs..."
                className="pl-3 pr-10 py-1.5 border border-gray-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
              />
            </div>
            
            {/* Severity Filter */}
            <select 
              className="border border-gray-300 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            
            {/* Exploit Status Filter */}
            <select 
              className="border border-gray-300 dark:border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
              value={exploitStatusFilter}
              onChange={(e) => setExploitStatusFilter(e.target.value)}
            >
              <option value="All">All Exploit Status</option>
              <option value="In the Wild">In the Wild</option>
              <option value="PoC Available">PoC Available</option>
              <option value="Active Exploitation">Active Exploitation</option>
              <option value="None">No Exploit</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-4 text-center">Loading feed data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-slate-200 dark:divide-slate-700">
              <thead>
                <tr className="text-left bg-slate-50 dark:bg-slate-700">
                  <th className="p-3">CVE ID</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">CVSS SCORE</th>
                  <th className="p-3">THREAT ACTOR</th>
                  <th className="p-3">EXPLOIT STATUS</th>
                  <th className="p-3">LAST SEEN</th>
                  <th className="p-3">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {mockVulns.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                    {/* Clickable CVE ID */}
                    <td 
                      className="p-3 font-medium text-blue-600 cursor-pointer hover:underline"
                      onClick={() => handleView(item)}
                    >
                      {item.cve_id}
                    </td>

                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs text-white rounded-full ${getSeverityColor(item.severity)}`}>
                        {item.severity ? item.severity.toUpperCase() : "UNKNOWN"}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              item.cvss_score >= 7 ? 'bg-red-500' : 
                              item.cvss_score >= 4 ? 'bg-orange-500' : 'bg-yellow-500'
                            }`} 
                            style={{ width: `${(item.cvss_score / 10) * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold">{item.cvss_score.toFixed(1)}</span>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center">
                        <Skull className="w-4 h-4 text-gray-500 mr-1" />
                        <span>{item.threat_actor}</span>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs text-white rounded-full ${getExploitStatusColor(item.exploit_status)}`}>
                        {item.exploit_status}
                      </span>
                    </td>

                    <td className="p-3 opacity-70">{item.last_seen}</td>

                    {/* View Button */}
                    <td className="p-3">
                      <button 
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                        onClick={() => handleView(item)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer Component */}
      <IntelDrawer 
        open={selectedIntel !== null} 
        onClose={() => setSelectedIntel(null)} 
        intel={selectedIntel} 
      />
    </div>
  );
};

export default ThreatIntel;