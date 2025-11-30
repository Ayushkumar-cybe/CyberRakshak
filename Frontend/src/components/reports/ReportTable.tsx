import React, { useState, useEffect } from "react";
import { Download, Eye, RefreshCcw } from "lucide-react";
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

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getReports(0, 100);
      const transformedData = data.map((report: any) => ({
        id: report.id,
        name: report.name,
        type: report.type,
        date: report.date,
        status: report.status,
      }));
      setReports(transformedData);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDownload = async (reportId: string) => {
    try {
      const blob = await getScanReport(reportId);
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
      alert("Failed to download report. It might not be ready yet.");
    }
  };

  const handleView = async (reportId: string) => {
    try {
      const blob = await getScanReport(reportId);
      const url = window.URL.createObjectURL(blob);
      // Open PDF in a new tab
      window.open(url, '_blank');
    } catch (error) {
      console.error("Failed to view report:", error);
      alert("Failed to open report. Please try again.");
    }
  };

  if (loading && reports.length === 0) {
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
          {reports.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-6 text-center opacity-60">
                No reports found. Run a scan to generate reports.
              </td>
            </tr>
          ) : (
            reports.map((r, index) => (
              <tr
                key={index}
                className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <td className="p-3 font-medium">{r.name}</td>
                <td className="p-3">{r.type}</td>
                <td className="p-3">{r.date}</td>

                <td className={`p-3 font-semibold ${statusColors[r.status] || "text-slate-500"}`}>
                  {r.status}
                </td>

                <td className="p-3 flex gap-3">
                  <button
                    onClick={() => handleView(r.id)}
                    className="hover:bg-slate-200 dark:hover:bg-slate-700 p-1 rounded transition"
                    title="View Report"
                  >
                    <Eye className="w-5 h-5 text-blue-600" />
                  </button>

                  <button
                    onClick={() => handleDownload(r.id)}
                    className="hover:bg-slate-200 dark:hover:bg-slate-700 p-1 rounded transition"
                    title="Download PDF"
                  >
                    <Download className="w-5 h-5 text-green-600" />
                  </button>

                  <button
                    onClick={() => fetchReports()}
                    className="hover:bg-slate-200 dark:hover:bg-slate-700 p-1 rounded transition"
                    title="Refresh Status"
                  >
                    <RefreshCcw className="w-5 h-5 text-yellow-600" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;
