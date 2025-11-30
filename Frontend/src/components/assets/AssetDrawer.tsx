import React from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  asset: any;
}

const AssetDrawer = ({ open, onClose, asset }: Props) => {
  if (!open || !asset) return null;

  return (
    <div className="fixed inset-0 z-50 flex">

      {/* BACKDROP */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      {/* DRAWER */}
      <div className="w-full sm:w-[420px] lg:w-[480px] bg-white dark:bg-slate-800 shadow-xl p-6 overflow-y-auto animate-slide-left">

        {/* HEADER */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold">{asset.name}</h2>
            <p className="opacity-70 text-sm">{asset.ip}</p>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-300 dark:bg-slate-700 rounded-md"
          >
            Close
          </button>
        </div>

        {/* SECTION: Asset Overview */}
        <div className="mb-6">
          <h3 className="font-semibold">Asset Overview</h3>
          <ul className="text-sm opacity-80 mt-2 space-y-1">
            <li><strong>OS:</strong> {asset.os}</li>
            <li><strong>Exposure:</strong> {asset.exposure}</li>
            <li><strong>Risk:</strong> {asset.risk}</li>
            <li><strong>Cloud:</strong> {asset.cloud}</li>
            <li><strong>Discovered By:</strong> {asset.discoveredBy}</li>
            <li><strong>Last Seen:</strong> {asset.date}</li>
          </ul>
        </div>

        {/* SECTION: Vulnerabilities */}
        <div className="mb-6">
          <h3 className="font-semibold">Vulnerabilities</h3>
          <div className="mt-2 space-y-2">
            <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm">
              CVE-2025-12432 (Critical) — Remote Code Execution
            </div>

            <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm">
              CVE-2024-99532 (High) — Privilege Escalation
            </div>
          </div>
        </div>

        {/* SECTION: Attack Path */}
        <div className="mb-6">
          <h3 className="font-semibold">Attack Path Relevance</h3>
          <p className="text-xs opacity-70 mt-1">
            This asset appears in a lateral movement chain between two high-value nodes.
          </p>

          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700 mt-2 text-xs">
            [Attack graph placeholder]
          </div>
        </div>

        {/* SECTION: AI Analysis */}
        <div className="mb-6">
          <h3 className="font-semibold">AI Summary</h3>
          <p className="text-sm opacity-80 mt-1">
            This asset presents elevated risk due to multiple high-severity vulnerabilities and internet exposure.
            Recommended action: patch exposed services immediately.
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3 pt-4 border-t dark:border-slate-600">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Assign Owner
          </button>

          <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
            Add to Watchlist
          </button>
        </div>

      </div>
    </div>
  );
};

export default AssetDrawer;