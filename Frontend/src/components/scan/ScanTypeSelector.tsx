import React from "react";
import {
  Radio,
  Bug,
  Shield,
  Activity,
  Target,
  Search,
  Wifi,
  Scan,
} from "lucide-react";

const scanTools = [
  {
    id: "nmap",
    name: "Nmap",
    desc: "Port scanning & service detection",
    icon: Radio,
  },
  {
    id: "nuclei",
    name: "Nuclei",
    desc: "Template-based vulnerability scanning",
    icon: Bug,
  },
  {
    id: "openvas",
    name: "OpenVAS",
    desc: "Comprehensive vulnerability scanning",
    icon: Shield,
  },
  {
    id: "nessus",
    name: "Nessus",
    desc: "Deep vulnerability assessment",
    icon: Activity,
  },
  {
    id: "nikto",
    name: "Nikto",
    desc: "Web server vulnerability testing",
    icon: Target,
  },
  {
    id: "whatweb",
    name: "WhatWeb",
    desc: "Website fingerprinting",
    icon: Search,
  },
  {
    id: "wappalyzer",
    name: "Wappalyzer",
    desc: "Tech stack identification",
    icon: Wifi,
  },
  {
    id: "dirsearch",
    name: "Dirsearch",
    desc: "Content discovery and directories",
    icon: Scan,
  },
];

const ScanTypeSelector = ({ selected, setSelected, advancedMode, setAdvancedMode }: { selected: string[], setSelected: React.Dispatch<React.SetStateAction<string[]>>, advancedMode: boolean, setAdvancedMode: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const toggleSelect = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item: string) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Scan Types</h2>

        <button
          onClick={() => setAdvancedMode(!advancedMode)}
          className="text-sm px-3 py-1 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition"
        >
          {advancedMode ? "Card Mode" : "Advanced List"}
        </button>
      </div>

      {/* CARD MODE */}
      {!advancedMode && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {scanTools.map((tool) => {
            const Icon = tool.icon;
            const isActive = selected.includes(tool.id);

            return (
              <div
                key={tool.id}
                onClick={() => toggleSelect(tool.id)}
                className={`cursor-pointer p-4 rounded-xl border transition shadow-sm
                  ${
                    isActive
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-slate-300 dark:border-slate-700"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-md ${
                      isActive
                        ? "bg-blue-500 text-white"
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div>
                    <p className="font-semibold">{tool.name}</p>
                    <p className="text-xs opacity-70">{tool.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADVANCED MODE */}
      {advancedMode && (
        <div className="space-y-3">
          {scanTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <label
                key={tool.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(tool.id)}
                  onChange={() => toggleSelect(tool.id)}
                />
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tool.name}</span>
                <span className="text-xs opacity-70">{tool.desc}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ScanTypeSelector;