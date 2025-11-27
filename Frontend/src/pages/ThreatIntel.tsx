import React, { useState, useEffect } from "react";
import IntelCards from "../components/intel/IntelCards";
import IntelFilters from "../components/intel/IntelFilters";
import IntelSearchBar from "../components/intel/IntelSearchBar";
import IntelDrawer from "../components/intel/IntelDrawer"; // <--- Added
import { getThreatIntelFeed } from "../services/api";
import { Shield, ShieldAlert } from "lucide-react";

const ThreatIntel = () => {
  const [filters, setFilters] = useState({});
  const [feedData, setFeedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntel, setSelectedIntel] = useState<any>(null); // <--- Added State

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

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Threat Intelligence Feed</h1>
        <p className="opacity-70 text-sm">
          Real-time feed of vulnerabilities (NVD) and exploited flaws (CISA KEV).
        </p>
      </div>

      {/* Summary Cards */}
      <IntelCards />

      {/* Search Bar + Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-5 space-y-4">
        <IntelSearchBar />
        <IntelFilters filters={filters} setFilters={setFilters} />
      </div>

      {/* Detailed Feed Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Latest Vulnerability Feed</h3>
        {loading ? (
          <div className="p-4 text-center">Loading feed data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-slate-200 dark:divide-slate-700">
              <thead>
                <tr className="text-left bg-slate-50 dark:bg-slate-700">
                  <th className="p-3">CVE ID</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">CVSS</th>
                  <th className="p-3">CISA KEV</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Last Updated</th>
                  <th className="p-3">Action</th> {/* <--- Added Column */}
                </tr>
              </thead>
              <tbody>
                {feedData.map((item, index) => (
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

                    <td className="p-3 font-semibold">{item.cvss_score ? item.cvss_score.toFixed(1) : 'N/A'}</td>

                    <td className="p-3">
                      {item.is_cisa_kev ? (
                        <div className="flex items-center gap-1 text-red-600 font-bold" title="Known Exploited Vulnerability">
                           <ShieldAlert className="w-5 h-5" /> KEV
                        </div>
                      ) : (
                        <Shield className="w-5 h-5 text-gray-400" />
                      )}
                    </td>

                    <td className="p-3 opacity-80 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap" title={item.description}>
                      {item.description}
                    </td>

                    <td className="p-3 opacity-70">{new Date(item.last_updated).toLocaleDateString()}</td>

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
