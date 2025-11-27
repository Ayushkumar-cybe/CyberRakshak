import React, { useState } from "react";
import ReportSummaryCards from "../components/reports/ReportSummaryCards";
import ReportTable from "../components/reports/ReportTable";
import GenerateReportModal from "../components/reports/GenerateReportModal";
import ReportFilters from "../components/reports/ReportFilters";

const Reports = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState({});

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="opacity-70 text-sm">
            Generate and review security assessment and vulnerability reports.
          </p>
        </div>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          onClick={() => setModalOpen(true)}
        >
          + Generate Report
        </button>
      </div>

      {/* Summary Cards */}
      <ReportSummaryCards />

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-5 space-y-4">
        <ReportFilters filters={filters} setFilters={setFilters} />
      </div>

      {/* Reports Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4">
        <ReportTable />
      </div>

      <GenerateReportModal open={modalOpen} onClose={() => setModalOpen(false)} />

    </div>
  );
};

export default Reports;