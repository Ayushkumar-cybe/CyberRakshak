import React, { useEffect, useState } from "react";
import { getJobHistory } from "../../services/api";

interface ScanJob {
  job_id: string;
  target: string;
  status: string;
  created_at: string;
  scanners_used: string[];
}

const statusColors: Record<string, string> = {
  completed: "bg-green-500",
  failed: "bg-red-500",
  running: "bg-yellow-500",
  pending: "bg-gray-500",
  partial_success: "bg-orange-500",
};

const ScanHistory = () => {
  const [history, setHistory] = useState<ScanJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getJobHistory();
        // @ts-ignore
        setHistory(data);
      } catch (error) {
        console.error("Failed to fetch scan history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

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
              <th className="p-3">Target</th>
              <th className="p-3">Tools</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center opacity-60">
                  No scans found. Start a scan above!
                </td>
              </tr>
            ) : (
              history.map((item) => (
                <tr key={item.job_id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-3 font-medium">{item.target}</td>
                  <td className="p-3">
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
                  <td className="p-3 opacity-80">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                  <td className="p-3 flex gap-2">
                    <a 
                      href={`/reports?job=${item.job_id}`}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-block"
                    >
                      Report
                    </a>
                    {/* NEW BUTTON */}
                    <a 
                      href={`/attack-path?job_id=${item.job_id}`}
                      className="px-3 py-1 text-xs bg-purple-600 text-white rounded-md hover:bg-purple-700 inline-block"
                    >
                      Graph
                    </a>
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
