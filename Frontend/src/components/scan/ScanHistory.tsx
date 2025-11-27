import React, { useState, useEffect } from "react";
// Import the API service
import { getJobHistory } from "../../services/api";

const statusColors: Record<string, string> = {
  completed: "bg-green-500",
  failed: "bg-red-500",
  running: "bg-yellow-500",
  pending: "bg-blue-500",
  partial_success: "bg-orange-500",
};

const ScanHistory = () => {
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const jobs = await getJobHistory(0, 10);
        // Transform the data to match the existing structure
        const transformedData = jobs.map((job: any) => ({
          id: job.job_id,
          target: job.target,
          tools: job.scanners_used,
          status: job.status,
          time: "N/A", // We would need to calculate this based on timestamps
          date: new Date(job.created_at).toLocaleDateString(),
        }));
        setHistoryData(transformedData);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch scan history:", error);
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="w-full mt-10">
        <h3 className="text-lg font-semibold mb-4">Scan History</h3>
        <p>Loading...</p>
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
              <th className="p-3">Duration</th>
              <th className="p-3">Date</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {historyData.map((item) => (
              <tr key={item.id} className="border-b dark:border-slate-700">
                <td className="p-3 font-medium">{item.target}</td>
                <td className="p-3">{item.tools.join(", ")}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-white text-xs ${statusColors[item.status] || "bg-gray-500"}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="p-3">{item.time}</td>
                <td className="p-3">{item.date}</td>
                <td className="p-3">
                  <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    View Report
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScanHistory;