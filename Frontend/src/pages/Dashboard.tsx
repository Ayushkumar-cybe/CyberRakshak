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
import { getDashboardStats } from "../services/api";

const Dashboard = () => {
  // State for real data
  const [stats, setStats] = useState({
    total_vulnerabilities: 0,
    critical_findings: 0,
    high_findings: 0,
    medium_findings: 0,
    low_findings: 0,
    asset_criticality_score: 0,
    open_ports_detected: 0,
    unified_cyber_score: 0,
    total_assets: 0,
    internet_exposed: 0,
    high_risk_assets: 0,
    cloud_assets: 0,
    asset_distribution: {} // <--- Added this field
  });

  // Fetch data on mount
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };

    fetchDashboardStats();
  }, []);

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
          <GlobalRiskScore score={stats.unified_cyber_score} />
        </div>

        <div className="bg-white dark:bg-slate-800 shadow rounded-xl p-6 min-h-[260px]">
          Cloud Posture (Line Chart)
        </div>

        <div className="bg-white dark:bg-slate-800 shadow rounded-xl p-6 min-h-[260px]">
          <ExternalAttackSurface stats={{
             total: stats.total_assets, 
             exposed: stats.internet_exposed, 
             cloud: stats.cloud_assets
          }} />
        </div>
      </section>

      {/* SECOND ROW */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 shadow rounded-xl p-6 min-h-[260px]">
          {/* FIX: Pass distribution prop instead of totalAssets */}
          <AssetDistribution distribution={stats.asset_distribution} />
        </div>

        <div className="bg-white dark:bg-slate-800 shadow rounded-xl p-6 min-h-[260px]">
          <ContributingFactors />
        </div>

        <div className="bg-white dark:bg-slate-800 shadow rounded-xl p-6 min-h-[260px]">
          <CvssDistribution stats={{
             critical: stats.critical_findings,
             high: stats.high_findings,
             medium: stats.medium_findings,
             low: stats.low_findings
          }} />
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
          <UnifiedCyberScore score={stats.unified_cyber_score} />
        </div>
        <div className="bg-white dark:bg-slate-800 shadow rounded-xl p-6 min-h-[260px]">
          <AiInsightsPanel />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
