import React, { useState, useEffect } from "react";
import { Search, Filter, Server, Monitor, Shield, AlertTriangle, CheckCircle, HelpCircle, Cloud, X } from "lucide-react";
import { getAssets } from "../services/api";
import AssetDrawer from "../components/assets/AssetDrawer";
import AssetFilters from "../components/assets/AssetFilters";

const Assets = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAssets(0, 100, activeFilters);
      
      const transformed = data.map((item: any) => {
        let crit = 1;
        let score = 200;
        
        if (item.risk === "Critical") { crit = 5; score = 850 + Math.floor(Math.random() * 150); }
        else if (item.risk === "High") { crit = 4; score = 700 + Math.floor(Math.random() * 149); }
        else if (item.risk === "Medium") { crit = 3; score = 500 + Math.floor(Math.random() * 199); }
        else if (item.risk === "Low") { crit = 2; score = 300 + Math.floor(Math.random() * 199); }
        
        return {
          ...item,
          criticality: crit,
          riskScore: score,
          missingPatches: Math.floor(Math.random() * 10),
          status: "Active",
          tags: [item.cloud, item.exposure].filter(Boolean)
        };
      });
      
      setAssets(transformed);
    } catch (error) {
      console.error("Failed to load assets", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeFilters]);

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.ip.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAssets = assets.length;
  const countCrit5 = assets.filter(a => a.criticality === 5).length;
  const countCrit4 = assets.filter(a => a.criticality === 4).length;
  const countCrit3 = assets.filter(a => a.criticality === 3).length;
  const countCrit2 = assets.filter(a => a.criticality === 2).length;
  const countCrit1 = assets.filter(a => a.criticality === 1).length;

  const countLow = countCrit1 + countCrit2;
  const countMed = countCrit3;
  const countHigh = countCrit4;
  const countCritical = countCrit5;

  const critMax = Math.max(countCrit1, countCrit2, countCrit3, countCrit4, countCrit5, 1);
  const detectMax = Math.max(countLow, countMed, countHigh, countCritical, 1);

  const getBarHeight = (value: number, max: number) => {
    return `${Math.max(4, (value / max) * 100)}%`;
  };

  const getOsIcon = (os: string) => {
    const lower = (os || "").toLowerCase();
    if (lower.includes("windows")) return <Monitor className="w-4 h-4 mr-1 text-blue-500" />;
    if (lower.includes("linux") || lower.includes("ubuntu") || lower.includes("centos")) return <Server className="w-4 h-4 mr-1 text-orange-500" />;
    return <Server className="w-4 h-4 mr-1 text-slate-400" />;
  };

  const getStatusIndicator = (status: string) => (
    <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> {status}</span>
  );

  const getRiskBadge = (risk: string) => {
    switch(risk) {
      case "Critical": return "bg-red-500 text-white";
      case "High": return "bg-orange-500 text-white";
      case "Medium": return "bg-yellow-500 text-white";
      default: return "bg-blue-500 text-white";
    }
  };

  const activeFilterCount = Object.values(activeFilters).flat().length;

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#050b14] text-slate-800 dark:text-white p-6">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Criticality Chart */}
        <div className="bg-white dark:bg-[#1e293b] dark:border-slate-700 border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">Asset Criticality</h3>
          <div className="w-full h-40 flex items-end justify-between px-4 gap-2 mt-4">
            
            {/* Bar 1 */}
            <div className="flex flex-col items-center gap-1 w-full group">
              <div className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">{countCrit1}</div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t-sm transition-all duration-500" 
                   style={{ height: getBarHeight(countCrit1, critMax) }}></div>
              <div className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">[1]</div>
            </div>
            
            {/* Bar 2 */}
            <div className="flex flex-col items-center gap-1 w-full group">
              <div className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">{countCrit2}</div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t-sm transition-all duration-500" 
                   style={{ height: getBarHeight(countCrit2, critMax) }}></div>
              <div className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">[2]</div>
            </div>
            
            {/* Bar 3 */}
            <div className="flex flex-col items-center gap-1 w-full group">
              <div className="text-xs font-bold text-blue-400 dark:text-blue-500 mb-1">{countCrit3}</div>
              <div className="w-full bg-blue-200 dark:bg-blue-900/40 rounded-t-sm transition-all duration-500" 
                   style={{ height: getBarHeight(countCrit3, critMax) }}></div>
              <div className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">[3]</div>
            </div>
            
            {/* Bar 4 */}
            <div className="flex flex-col items-center gap-1 w-full group">
              <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">{countCrit4}</div>
              <div className="w-full bg-blue-400 dark:bg-blue-600 rounded-t-sm transition-all duration-500" 
                   style={{ height: getBarHeight(countCrit4, critMax) }}></div>
              <div className="text-xs font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">[4]</div>
            </div>
            
            {/* Bar 5 (Critical) */}
            <div className="flex flex-col items-center gap-1 w-full group">
              <div className="text-xs font-bold text-red-600 mb-1">{countCrit5}</div>
              <div className="w-full bg-red-500 h-32 rounded-t-sm shadow-lg shadow-red-200 dark:shadow-none transition-all duration-500" 
                   style={{ height: getBarHeight(countCrit5, critMax) }}></div>
              <div className="text-xs font-bold text-white bg-red-500 px-1.5 py-0.5 rounded">[5]</div>
            </div>
          </div>
        </div>

        {/* Detection Score Chart */}
        <div className="bg-white dark:bg-[#1e293b] dark:border-slate-700 border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">Detection Score</h3>
          <div className="w-full h-40 flex items-end justify-between px-8 gap-4 mt-4">
            
            {/* Low */}
            <div className="flex flex-col items-center w-full">
              <div className="text-xs font-bold text-purple-400 dark:text-purple-300 mb-1">{countLow}</div>
              <div className="w-full bg-purple-200 dark:bg-purple-900/30 rounded-t-sm transition-all duration-500"
                   style={{ height: getBarHeight(countLow, detectMax) }}></div>
              <span className="text-[10px] uppercase text-slate-400 mt-2">Low</span>
            </div>
            
            {/* Med */}
            <div className="flex flex-col items-center w-full">
              <div className="text-xs font-bold text-purple-500 dark:text-purple-300 mb-1">{countMed}</div>
              <div className="w-full bg-purple-300 dark:bg-purple-800/50 rounded-t-sm transition-all duration-500"
                   style={{ height: getBarHeight(countMed, detectMax) }}></div>
              <span className="text-[10px] uppercase text-slate-400 mt-2">Med</span>
            </div>
            
            {/* High */}
            <div className="flex flex-col items-center w-full">
              <div className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">{countHigh}</div>
              <div className="w-full bg-purple-400 dark:bg-purple-600 rounded-t-sm transition-all duration-500"
                   style={{ height: getBarHeight(countHigh, detectMax) }}></div>
              <span className="text-[10px] uppercase text-slate-400 mt-2">High</span>
            </div>
            
            {/* Critical */}
            <div className="flex flex-col items-center w-full">
              <div className="text-xs font-bold text-purple-700 dark:text-purple-400 mb-1">{countCritical}</div>
              <div className="w-full bg-purple-600 h-20 rounded-t-sm shadow-lg shadow-purple-200 dark:shadow-none transition-all duration-500"
                   style={{ height: getBarHeight(countCritical, detectMax) }}></div>
              <span className="text-[10px] uppercase text-slate-400 mt-2">Crit</span>
            </div>
          </div>
        </div>

        {/* Environment Scope */}
        <div className="bg-white dark:bg-[#1e293b] dark:border-slate-700 border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">Environment Scope</h3>
          <div className="flex flex-col justify-center h-40 gap-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-purple-500" />
                    <span className="text-sm font-medium">Cloud Assets</span>
                </div>
                <span className="text-lg font-bold">{assets.filter(a => a.cloud !== "On-Prem").length}</span>
             </div>
             <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full" style={{ width: '40%' }}></div>
             </div>

             <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium">On-Premise</span>
                </div>
                <span className="text-lg font-bold">{assets.filter(a => a.cloud === "On-Prem").length}</span>
             </div>
             <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full" style={{ width: '60%' }}></div>
             </div>
          </div>
        </div>
      </div>

      {/* FILTER DRAWER / PANEL */}
      {showFilters && (
        <div className="mb-6 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-sm">Advanced Filters</h3>
            <button onClick={() => setShowFilters(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <AssetFilters filters={activeFilters} setFilters={setActiveFilters} />
          
          {activeFilterCount > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
              <button 
                onClick={() => setActiveFilters({})}
                className="text-xs text-red-500 hover:underline"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* DATA GRID */}
      <div className="bg-white dark:bg-[#1e293b] dark:border-slate-700 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {/* Controls */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by Name or IP..."
              className="w-full bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-700 rounded px-10 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button 
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm border transition-colors ${
                showFilters || activeFilterCount > 0
                  ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
                  : "bg-white dark:bg-[#0f172a] border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300"
              }`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#1e293b] border-b border-gray-200 dark:border-slate-700">
                <th className="p-3 text-left font-bold text-gray-500 dark:text-slate-300 uppercase tracking-wider text-xs">Asset Name</th>
                <th className="p-3 text-left font-bold text-gray-500 dark:text-slate-300 uppercase tracking-wider text-xs">IP Address</th>
                <th className="p-3 text-left font-bold text-gray-500 dark:text-slate-300 uppercase tracking-wider text-xs">OS / Tech</th>
                <th className="p-3 text-left font-bold text-gray-500 dark:text-slate-300 uppercase tracking-wider text-xs">Risk Level</th>
                <th className="p-3 text-left font-bold text-gray-500 dark:text-slate-300 uppercase tracking-wider text-xs">Exposure</th>
                <th className="p-3 text-left font-bold text-gray-500 dark:text-slate-300 uppercase tracking-wider text-xs">Location</th>
                <th className="p-3 text-left font-bold text-gray-500 dark:text-slate-300 uppercase tracking-wider text-xs">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-6 text-center text-slate-500">Loading assets...</td></tr>
              ) : filteredAssets.length === 0 ? (
                <tr><td colSpan={7} className="p-6 text-center text-slate-500 opacity-60">No assets found matching criteria.</td></tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                    <td className="p-3">
                      <div className="flex items-center">
                        <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-700 mr-3">
                           <Server className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                            {asset.name}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-xs text-slate-600 dark:text-slate-400">{asset.ip}</td>
                    <td className="p-3 flex items-center">
                      {getOsIcon(asset.os)}
                      <span className="truncate max-w-[100px]" title={asset.os}>{asset.os || "Unknown"}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getRiskBadge(asset.risk)}`}>
                        {asset.risk}
                      </span>
                    </td>
                    <td className="p-3">
                        <span className={`flex items-center gap-1.5 text-xs ${asset.exposure === 'Internet-facing' ? 'text-red-500' : 'text-green-500'}`}>
                            <div className={`w-2 h-2 rounded-full ${asset.exposure === 'Internet-facing' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                            {asset.exposure}
                        </span>
                    </td>
                    <td className="p-3 text-slate-500">
                        {asset.cloud === "On-Prem" ? "Datacenter" : asset.cloud}
                    </td>
                    <td className="p-3">
                      <button 
                        className="px-3 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded text-xs transition"
                        onClick={() => {
                            setSelectedAsset(asset);
                            setDrawerOpen(true);
                        }}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AssetDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        asset={selectedAsset}
      />
    </div>
  );
};

export default Assets;
