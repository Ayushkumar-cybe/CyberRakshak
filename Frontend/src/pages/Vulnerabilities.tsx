import React, { useState } from "react";
import SeverityFilter from "../components/vuln/SeverityFilter";
import VulnerabilityTable from "../components/vuln/VulnerabilityTable";

const Vulnerabilities = () => {
  const [severity, setSeverity] = useState<string[]>([]);

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Vulnerabilities</h1>
        <p className="opacity-70 text-sm">
          Explore, filter, and analyze detected vulnerabilities across all assets.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 space-y-4">
        <h3 className="text-sm font-semibold opacity-70">Severity</h3>

        <SeverityFilter selected={severity} setSelected={setSeverity} />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4">
        <VulnerabilityTable />
      </div>

    </div>
  );
};

export default Vulnerabilities;