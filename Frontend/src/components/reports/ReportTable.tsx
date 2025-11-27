import React, { useState, useEffect } from "react";
import { Download, Eye, RefreshCcw } from "lucide-react";
// Import the API service
import { getReports, getScanReport } from "../../services/api";

const statusColors: any = {
  Completed: "text-green-600",
  Pending: "text-yellow-600",
  Failed: "text-red-600",
  Running: "text-blue-600",
};

const ReportTable = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getReports(0, 100);
        // Transform the data to match the existing structure
        const transformedData = data.map((report: any) => ({
          id: report.id,
          name: report.name,
          type: report.type,
          date: report.date,
          status: report.status,
        }));
        setReports(transformedData);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleDownload = async (reportId: string) => {
    try {
      const blob = await getScanReport(reportId);
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download report:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-100 dark:bg-slate-700 text-left">
            <th className="p-3">Report Name</th>
            <th className="p-3">Type</th>
            <th className="p-3">Generated On</th>
            <th className="p-3">Status</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {reports.map((r, index) => (
            <tr
              key={index}
              className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <td className="p-3">{r.name}</td>
              <td className="p-3">{r.type}</td>
              <td className="p-3">{r.date}</td>

              <td className={`p-3 font-semibold ${statusColors[r.status]}`}>
                {r.status}
              </td>

              <td className="p-3 flex gap-3">
                <Eye className="w-5 h-5 cursor-pointer hover:text-blue-600" />
                <Download 
                  className="w-5 h-5 cursor-pointer hover:text-green-600" 
                  onClick={() => handleDownload(r.id)}
                />
                <RefreshCcw className="w-5 h-5 cursor-pointer hover:text-yellow-600" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;