import React, { useState } from "react";
import AttackFilters from "../components/attack/AttackFilters";
import AttackGraph from "../components/attack/AttackGraph";

const AttackPath = () => {
  const [filters, setFilters] = useState({});

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Attack Path Analysis</h1>
        <p className="opacity-70 text-sm">
          Visualize exploit chains, lateral movement pathways, and high-risk attack routes.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4">
        <AttackFilters filters={filters} setFilters={setFilters} />
      </div>

      {/* Graph Area */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 min-h-[600px] border border-slate-200 dark:border-slate-700">
        <AttackGraph />
      </div>

    </div>
  );
};

export default AttackPath;