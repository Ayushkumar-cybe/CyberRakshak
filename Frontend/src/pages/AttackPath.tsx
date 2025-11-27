import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import AttackFilters from "../components/attack/AttackFilters";
import AttackGraph from "../components/attack/AttackGraph";

const AttackPath = () => {
  const [filters, setFilters] = useState({});
  // Hook to read the URL query parameters
  const [searchParams] = useSearchParams(); 
  const initialJobId = searchParams.get("job_id") || "";

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
        {/* Pass the ID from URL to the graph component */}
        <AttackGraph initialJobId={initialJobId} />
      </div>

    </div>
  );
};

export default AttackPath;
