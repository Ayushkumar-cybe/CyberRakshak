import React, { useState, useEffect } from "react";
import KpiCard from "../components/dashboard/KpiCard";
import GlobalRiskScore from "../components/dashboard/GlobalRiskScore";
import ExternalAttackSurface from "../components/dashboard/ExternalAttackSurface";
import AssetDistribution from "../components/dashboard/AssetDistribution";
import ContributingFactors from "../components/dashboard/ContributingFactors";
import CvssDistribution from "../components/dashboard/CvssDistribution";
import GeoThreatMap from "../components/dashboard/GeoThreatMap";
import RecentActivity from "../components/dashboard/RecentActivity";
import UnifiedCyberScore from "../components/dashboard/UnifiedCyberScore";
import AiInsightsPanel from "../components/dashboard/AiInsightsPanel";
import { Bug, AlertTriangle, Flame, ShieldHalf, Radio, Gauge } from "lucide-react";
// Import the API service
import { getDashboardStats } from "../services/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_vulnerabilities: 15392,
    critical_findings: 1247,
    high_findings: 3546,
    asset_criticality_score: 9512,
    open_ports_detected: 2341,
    unified_cyber_score: 742
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl shadow-sm p-6 bg-gray-200 dark:bg-gray-700 animate-pulse">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
          ))}
        </div>
        <div className="text-center py-10">
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI SECTION */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <KpiCard
          title="Total Vulnerabilities"
          value={stats.total_vulnerabilities.toLocaleString()}
          icon={Bug}
          color="#dc2626"
        />

        <KpiCard
          title="Critical Findings"
          value={stats.critical_findings.toLocaleString()}
          icon={AlertTriangle}
          color="#ea580c"
        />

        <KpiCard
          title="High Findings"
          value={stats.high_findings.toLocaleString()}
          icon={Flame}
          color="#f97316"
        />

        <KpiCard
          title="Asset Criticality Score"
          value={stats.asset_criticality_score.toLocaleString()}
          icon={ShieldHalf}
          color="#0ea5e9"
        />

        <KpiCard
          title="Open Ports Detected"
          value={stats.open_ports_detected.toLocaleString()}
          icon={Radio}
          color="#6366f1"
        />

        <KpiCard
          title="Unified CyberScore"
          value={stats.unified_cyber_score}
          icon={Gauge}
          color="#16a34a"
        />
      </section>

      {/* MAIN WIDGET GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 shadow rounded-xl p-6 min-h-[260px]">
          <GlobalRiskScore />
        </div>

        <div className="bg-white dark:bg-slate-800 shadow rounded-xl p-6 min-h-[260px]">
          Cloud Posture (Line Chart)
        </div>

        <div className="bg-white dark:bg-slate-800 shadow rounded-xl p-6 min-h-[260px]">
          <ExternalAttackSurface />
        </div>
      </section>

      {/* SECOND ROW */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 shadow rounded-xl p-6 min-h-[260px]">
          <AssetDistribution />
        </div>

        <div className="bg-white dark:bg-slate-800 shadow rounded-xl p-6 min-h-[260px]">
          <ContributingFactors />
        </div>

        <div className="bg-white dark:bg-slate-800 shadow rounded-xl p-6 min-h-[260px]">
          <CvssDistribution />
        </div>
      </section>

      {/* GEO + RECENT DATA */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 shadow rounded-xl p-6 min-h-[360px]">
          <GeoThreatMap />
        </div>

        <div className="bg-white dark:bg-slate-800 shadow rounded-xl p-6 min-h-[360px]">
          <RecentActivity />
        </div>
      </section>

      {/* UNIFIED CYBERSCORE + AI INSIGHTS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 shadow rounded-xl p-6 min-h-[260px]">
          <UnifiedCyberScore />
        </div>
        <div className="bg-white dark:bg-slate-800 shadow rounded-xl p-6 min-h-[260px]">
          <AiInsightsPanel />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;