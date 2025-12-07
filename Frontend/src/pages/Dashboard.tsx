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
import { Bug, AlertTriangle, Flame, ShieldHalf, Radio, Gauge, Info } from "lucide-react";
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
          <GlobalRiskScore />
        </div>

        {/* REPLACED CLOUD POSTURE CARD WITH TOTAL SOLUTIONS PROVIDED */}
        <div className="bg-white dark:bg-slate-800 shadow rounded-xl p-6 min-h-[260px]">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Total Solutions Provided</h3>
            <Info className="w-5 h-5 text-slate-400" />
          </div>
          
          <div className="relative w-full h-full flex flex-col justify-between overflow-hidden mt-4">
            {/* Top Stats */}
            <div className="z-10">
              <h3 className="text-3xl font-bold text-emerald-500">8,942</h3>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">Solutions Deployed</p>
            </div>
            
            {/* The Chart Visual */}
            <div className="absolute bottom-0 left-0 right-0 h-[70%]">
              {/* Grid Lines */}
              <div className="absolute inset-0">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute w-full border-t border-slate-200 dark:border-slate-700"
                    style={{ bottom: `${i * 25}%` }}
                  ></div>
                ))}
              </div>
              
              {/* X-Axis Labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-xs text-slate-400">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
              
              {/* Area Chart */}
              <svg className="absolute bottom-4 left-0 right-0 h-[80%]" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(16, 185, 129, 0.2)" />
                    <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
                  </linearGradient>
                </defs>
                
                {/* Area */}
                <path 
                  d="M0,100 L0,70 Q10,60 20,55 Q30,50 40,45 Q50,40 60,35 Q70,30 80,25 Q90,20 100,10 L100,100 Z" 
                  fill="url(#areaGradient)" 
                />
                
                {/* Line */}
                <path 
                  d="M0,70 Q10,60 20,55 Q30,50 40,45 Q50,40 60,35 Q70,30 80,25 Q90,20 100,10" 
                  stroke="#10b981" 
                  strokeWidth="2" 
                  fill="none" 
                />
              </svg>
            </div>
          </div>
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