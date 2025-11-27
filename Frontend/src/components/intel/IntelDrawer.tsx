import React from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  intel: any;
}

const IntelDrawer = ({ open, onClose, intel }: Props) => {
  if (!open || !intel) return null;

  return (
    <div className="fixed inset-0 z-50 flex">

      {/* BACKDROP */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      {/* DRAWER */}
      <div className="w-full sm:w-[420px] lg:w-[480px] bg-white dark:bg-slate-800 shadow-xl p-6 overflow-y-auto animate-slide-left">

        {/* HEADER */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold">{intel.cve}</h2>
            <p className="opacity-70 text-sm">{intel.summary}</p>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-300 dark:bg-slate-700 rounded-md"
          >
            Close
          </button>
        </div>

        {/* Severity */}
        <div className="mb-6">
          <h3 className="font-semibold">Severity</h3>
          <p className="mt-1 text-sm opacity-80">{intel.severity}</p>
        </div>

        {/* EPSS */}
        <div className="mb-6">
          <h3 className="font-semibold">EPSS Score</h3>
          <p className="mt-1 text-sm opacity-80">
            {(intel.epss * 100).toFixed(1)}%
          </p>
        </div>

        {/* Exploit Availability */}
        <div className="mb-6">
          <h3 className="font-semibold">Exploit Availability</h3>
          <p className="mt-1 text-sm opacity-80">{intel.exploit}</p>
        </div>

        {/* Affected Products */}
        <div className="mb-6">
          <h3 className="font-semibold">Affected Products</h3>
          <ul className="list-disc list-inside text-sm opacity-80 mt-1 space-y-1">
            <li>Apache HTTP Server 2.4.x</li>
            <li>Ubuntu Server 22.04</li>
            <li>RedHat Enterprise Linux 9</li>
          </ul>
        </div>

        {/* MITRE Techniques */}
        <div className="mb-6">
          <h3 className="font-semibold">MITRE ATT&CK Techniques</h3>
          <ul className="list-disc list-inside text-sm opacity-80 mt-1 space-y-1">
            <li>T1190 — Exploit Public-Facing Application</li>
            <li>T1059 — Command Execution</li>
          </ul>
        </div>

        {/* Threat Actors */}
        <div className="mb-6">
          <h3 className="font-semibold">Threat Actor Associations</h3>
          <p className="text-sm opacity-80 mt-1">
            Known groups actively exploiting this vulnerability:
          </p>
          <ul className="list-disc list-inside text-sm opacity-80 mt-1 space-y-1">
            <li>APT28</li>
            <li>Lazarus Group</li>
          </ul>
        </div>

        {/* References */}
        <div className="mb-6">
          <h3 className="font-semibold">References</h3>
          <ul className="list-disc list-inside text-sm opacity-80 mt-1 space-y-1">
            <li>NVD Database</li>
            <li>ExploitDB</li>
            <li>Rapid7 Advisory</li>
          </ul>
        </div>

        {/* AI Summary */}
        <div className="mb-6">
          <h3 className="font-semibold">AI Threat Summary</h3>
          <p className="text-sm opacity-80 mt-1">
            This vulnerability is highly critical due to confirmed exploitation in the wild.
            Attackers can leverage it for remote code execution and persistent access.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t dark:border-slate-600">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Add to Watchlist
          </button>

          <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
            Generate Report
          </button>
        </div>

      </div>
    </div>
  );
};

export default IntelDrawer;