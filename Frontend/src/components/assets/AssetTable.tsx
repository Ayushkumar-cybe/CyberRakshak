import React, { useState, useEffect } from "react";
import { Server, Cloud, Network, Monitor, HelpCircle } from "lucide-react"; // Added HelpCircle
import AssetDrawer from "./AssetDrawer";
import { getAssets } from "../../services/api";

const exposureColors: Record<string, string> = {
  "Internet-facing": "bg-red-600",
  Internal: "bg-blue-600",
};

const riskColors: Record<string, string> = {
  Critical: "bg-red-600",
  High: "bg-orange-500",
  Medium: "bg-yellow-500",
  Low: "bg-green-500",
};

const cloudIcons: Record<string, any> = {
  AWS: Cloud,
  Azure: Cloud,
  GCP: Cloud,
  "On-Prem": Network,
};

const osIcons: Record<string, any> = {
  Linux: Server,
  Windows: Monitor,
  macOS: Monitor,
  Unknown: HelpCircle, // Added explicit Unknown handler
};

const AssetTable = () => {
  const [sortKey, setSortKey] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const data = await getAssets(0, 100);
        const transformedData = data.map((asset: any) => ({
          name: asset.name,
          ip: asset.ip,
          os: asset.os || "Unknown", // Ensure OS is never null
          exposure: asset.exposure,
          risk: asset.risk,
          cloud: asset.cloud || "On-Prem",
          discoveredBy: asset.discovered_by,
          date: asset.last_seen,
        }));
        setAssets(transformedData);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch assets:", error);
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  const sorted = [...assets].sort((a, b) => {
    const x = a[sortKey as keyof typeof a];
    const y = b[sortKey as keyof typeof b];

    if (x < y) return sortAsc ? -1 : 1;
    if (x > y) return sortAsc ? 1 : -1;
    return 0;
  });

  const columns = [
    { key: "name", label: "Asset Name" },
    { key: "ip", label: "IP Address" },
    { key: "os", label: "OS" },
    { key: "exposure", label: "Exposure" },
    { key: "risk", label: "Risk" },
    { key: "cloud", label: "Cloud" },
    { key: "discoveredBy", label: "Discovered By" },
    { key: "date", label: "Last Seen" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading assets...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left bg-slate-100 dark:bg-slate-700">
            {columns.map((col) => (
              <th
                key={col.key}
                className="p-3 cursor-pointer select-none"
                onClick={() => {
                  setSortKey(col.key);
                  setSortAsc(sortKey === col.key ? !sortAsc : true);
                }}
              >
                {col.label}
                {sortKey === col.key && (sortAsc ? " ▲" : " ▼")}
              </th>
            ))}
            <th className="p-3">Action</th>
          </tr>
        </thead>

        <tbody>
          {sorted.map((row, i) => {
            // FIX: Use fallback icons if the key is missing
            const OsIcon = osIcons[row.os] || HelpCircle;
            const CloudIcon = cloudIcons[row.cloud] || Network;

            return (
              <tr
                key={i}
                className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition"
              >
                {/* Asset Name */}
                <td className="p-3 font-semibold flex items-center gap-2">
                  <OsIcon className="w-4 h-4 opacity-70" />
                  {row.name}
                </td>

                <td className="p-3">{row.ip}</td>

                <td className="p-3">{row.os}</td>

                {/* Exposure */}
                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-xs text-white rounded-full ${exposureColors[row.exposure] || "bg-gray-500"}`}
                  >
                    {row.exposure}
                  </span>
                </td>

                {/* Risk */}
                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-xs text-white rounded-full ${riskColors[row.risk] || "bg-gray-500"}`}
                  >
                    {row.risk}
                  </span>
                </td>

                {/* Cloud Provider */}
                <td className="p-3 flex items-center gap-2">
                  <CloudIcon className="w-4 h-4 opacity-70" />
                  {row.cloud}
                </td>

                <td className="p-3 opacity-80">{row.discoveredBy}</td>

                <td className="p-3 opacity-70">{row.date}</td>

                <td className="p-3">
                  <button
                    onClick={() => {
                      setSelectedAsset(row);
                      setDrawerOpen(true);
                    }}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <AssetDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        asset={selectedAsset}
      />
    </div>
  );
};

export default AssetTable;
