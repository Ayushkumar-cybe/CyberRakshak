import React, { useState, useEffect } from "react";
import AssetSummaryCards from "../components/assets/AssetSummaryCards";
import AssetFilters from "../components/assets/AssetFilters";
import AssetTable from "../components/assets/AssetTable";
import { getDashboardStats } from "../services/api";

const Assets = () => {
  const [filters, setFilters] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    exposed: 0,
    highRisk: 0,
    cloud: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats({
          total: data.total_assets || 0,
          exposed: data.internet_exposed || 0,
          highRisk: data.high_risk_assets || 0,
          cloud: data.cloud_assets || 0
        });
      } catch (error) {
        console.error("Failed to fetch asset stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Asset Inventory</h1>
        <p className="opacity-70 text-sm">
          View and manage all discovered assets across your environment.
        </p>
      </div>

      {/* Summary Cards with Real Data */}
      <AssetSummaryCards stats={stats} />

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
