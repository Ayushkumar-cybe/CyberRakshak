import React from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const GenerateReportModal = ({ open, onClose }: Props) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 space-y-6 animate-fade-in">

        <h2 className="text-xl font-bold">Generate New Report</h2>

        {/* Report Type */}
        <div>
          <label className="font-semibold text-sm">Report Type</label>
          <select className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
            <option>Vulnerability Report</option>
            <option>Asset Inventory Report</option>
            <option>Threat Intelligence Report</option>
            <option>Scan Summary Report</option>
            <option>Compliance Report</option>
            <option>Custom Report</option>
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="font-semibold text-sm">Time Range</label>
          <select className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
            <option>Last 24 Hours</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Custom Range</option>
          </select>
        </div>

        {/* Format */}
        <div>
          <label className="font-semibold text-sm">Format</label>
          <select className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
            <option>PDF</option>
            <option>CSV</option>
            <option>JSON</option>
          </select>
        </div>

        {/* Scheduling */}
        <div>
          <label className="font-semibold text-sm">Schedule</label>
          <select className="w-full mt-1 p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
            <option>Run Now</option>
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
          </select>
        </div>

        {/* Filters */}
        <div>
          <label className="font-semibold text-sm">Filters (Optional)</label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <button className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-700">
              Severity
            </button>
            <button className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-700">
              Status
            </button>
            <button className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-700">
              Asset Groups
            </button>
            <button className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-700">
              Tags
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-slate-300 dark:bg-slate-700 rounded-lg"
            onClick={onClose}
          >
            Cancel
          </button>

          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Generate
          </button>
        </div>

      </div>
    </div>
  );
};

export default GenerateReportModal;