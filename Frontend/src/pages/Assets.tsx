import React, { useState } from "react";
import AssetSummaryCards from "../components/assets/AssetSummaryCards";
import AssetFilters from "../components/assets/AssetFilters";
import AssetTable from "../components/assets/AssetTable";

const Assets = () => {
  const [filters, setFilters] = useState({});

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Asset Inventory</h1>
        <p className="opacity-70 text-sm">
          View and manage all discovered assets across your environment.
        </p>
      </div>

      {/* Summary Cards (to be implemented) */}
      <AssetSummaryCards />

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4">
        <AssetFilters filters={filters} setFilters={setFilters} />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4">
        <AssetTable />
      </div>

    </div>
  );
};

export default Assets;