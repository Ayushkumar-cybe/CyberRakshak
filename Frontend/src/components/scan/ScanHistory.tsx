import { useEffect, useState } from "react";
import { FileText, Activity } from "lucide-react";
import { getJobHistory } from "../../services/api";

interface ScanJob {
  job_id: string;
  target: string;
  status: string;
  created_at: string;
  scanners_used: string[];
  risk?: string;
}

const statusColors: Record<string, string> = {
  completed: "bg-green-500",
  failed: "bg-red-500",
  running: "bg-yellow-500",
  pending: "bg-gray-500",
  partial_success: "bg-orange-500",
};

const riskColors: Record<string, string> = {
  Critical: "text-red-500",
  High: "text-orange-500",
  Medium: "text-yellow-500",
  Low: "text-blue-500",
  "N/A": "text-gray-500",
};

const ScanHistory = () => {
  const [history, setHistory] = useState<ScanJob[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  const mockHistory: ScanJob[] = [
    {
      job_id: "mock-1",
      target: "192.168.1.45 (Database)",
      status: "completed",
      created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      scanners_used: ["Nmap", "Nessus"],
      risk: "High",
    },
    {
      job_id: "mock-2",
      target: "app.cyberrakshak.in",
      status: "completed",
      created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      scanners_used: ["Nmap", "ZAP", "Nuclei"],
      risk: "Critical",
    },
    {
      job_id: "mock-3",
      target: "10.0.0.8 (Internal)",
      status: "failed",
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      scanners_used: ["Nmap"],
      risk: "N/A",
    },
  ];

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getJobHistory();
        // @ts-ignore
        const fetchedHistory = Array.isArray(data) && data.length > 0 ? data : mockHistory;
        setHistory(fetchedHistory);
      } catch (error) {
        console.error("Failed to fetch scan history:", error);
        // Use mock data on error
        setHistory(mockHistory);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleReportClick = (jobId: string, target: string) => {
    alert('Opening Report Preview...');
    // TODO: Replace with navigation logic later
    // Example: navigate(`/reports/${jobId}`);
  };

  const handleGraphClick = (jobId: string) => {
    console.log("Opening Graph/Analytics...", { jobId });
    // TODO: Navigate to graph/analytics view
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="w-full mt-10 p-4 text-center opacity-60 text-sm">
        Loading scan history...
      </div>
    );
  }

  return (
    <div className="w-full mt-10">
      <h3 className="text-lg font-semibold mb-4">Scan History</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-slate-100 dark:bg-slate-700">
              <th className="p-3">Report Name</th>
              <th className="p-3">Tools</th>
              <th className="p-3">Status</th>
              <th className="p-3">Risk</th>
              <th className="p-3">Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center opacity-60">
                  No scans found. Start a scan above!
                </td>
              </tr>
            ) : (
              history.map((item) => (
                <tr 
                  key={item.job_id} 
                  onClick={() => handleReportClick(item.job_id, item.target)}
                  className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3 text-cyan-400 font-medium hover:underline hover:text-cyan-300 transition-colors">
                      <FileText size={16} />
                      <span>{item.target}</span>
                    </div>
                  </td>
                  <td className="p-3 opacity-80">
                    {item.scanners_used && item.scanners_used.length > 0 
                      ? item.scanners_used.join(", ") 
                      : "Unknown"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-white text-xs ${
                        statusColors[item.status] || "bg-gray-500"
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={riskColors[item.risk || "N/A"] || "text-gray-500"}>
                      {item.risk || "N/A"}
                    </span>
                  </td>
                  <td className="p-3 opacity-80">
                    {formatDate(item.created_at)}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGraphClick(item.job_id);
                      }}
                      className="text-gray-400 hover:text-cyan-400 transition-colors p-1"
                      title="View Analytics"
                    >
                      <Activity size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScanHistory;
