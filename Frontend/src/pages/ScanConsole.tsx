import React, { useState } from "react";
import ScanTargetPanel from "../components/scan/ScanTargetPanel";
import ScanHistory from "../components/scan/ScanHistory";
import ScannerList from "../components/scan/ScannerList";
import ScannerConfigDrawer from "../components/scan/ScannerConfigDrawer";
import LogTerminal from "../components/scan/LogTerminal";
// Import the API service
import { startScan, getJobHistory } from "../services/api";

const ScanConsole = () => {
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [selectedScanners, setSelectedScanners] = useState<Record<string, boolean>>({
    nmap: false,
    nuclei: false,
    zap: false,
    nikto: false,
    metasploit: false,
    openvas: false,
    wappalyzer: false,
  });
  const [drawerScanner, setDrawerScanner] = useState<string | null>(null);
  const [scannerConfigs, setScannerConfigs] = useState<Record<string, any>>({});
  const [target, setTarget] = useState("");
  const [targetError, setTargetError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [lastPayload, setLastPayload] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const isValidIp = (value: string) => {
    const ipv4Regex =
      /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
    return ipv4Regex.test(value);
  };

  const isValidDomain = (value: string) => {
    const domainRegex =
      /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)\.[A-Za-z]{2,}$/;
    return domainRegex.test(value);
  };

  const validateTarget = (value: string) => {
    if (!value) {
      setTargetError("Target is required.");
      return false;
    }
    if (!(isValidIp(value) || isValidDomain(value))) {
      setTargetError("Enter a valid IPv4 address or domain (e.g., 192.168.1.1 or example.gov.in).");
      return false;
    }
    setTargetError(null);
    return true;
  };

  const startFakeLogs = () => {
    let counter = 0;

    const interval = setInterval(() => {
      counter++;

      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Log line ${counter}...`,
      ]);

      if (counter >= 30 || !isRunning) {
        clearInterval(interval);
      }
    }, 400);
  };

  const buildScanPayload = () => {
    const scannersPayload: Record<string, any> = {};

    Object.keys(selectedScanners).forEach((scannerId) => {
      const enabled = selectedScanners[scannerId];

      scannersPayload[scannerId as keyof typeof scannersPayload] = {
        enabled,
        params: enabled ? scannerConfigs[scannerId as keyof typeof scannerConfigs] || null : null,
      };
    });

    return {
      target,
      scanners: scannersPayload,
    };
  };

  const handleRunScan = async () => {
    if (!validateTarget(target)) return;

    const payload = buildScanPayload();
    setLastPayload(payload);
    setIsRunning(true);
    setLogs([]); // Clear previous logs
    startFakeLogs();

    try {
      // Use the real API to start the scan
      console.log("SCAN PAYLOAD:", payload);
      const response = await startScan(payload);
      console.log("SCAN STARTED:", response);
      
      alert(`Scan started successfully! Job ID: ${response.job_id}`);
    } catch (err) {
      console.error("Failed to start scan:", err);
      alert("Failed to start scan.");
    } finally {
      // keep running state for 2 seconds after logs finish
      setTimeout(() => setIsRunning(false), 2000);
    }
  };

  const toggleScanner = (id: string) => {
    setSelectedScanners((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openConfigDrawer = (id: string) => {
    setDrawerScanner(id);
  };

  const saveScannerConfig = (id: string, config: any) => {
    setScannerConfigs((prev) => ({ ...prev, [id]: config }));
  };

  const hasAnyScannerSelected = Object.values(selectedScanners).some(Boolean);

  const canRunScan = hasAnyScannerSelected && !targetError && target.length > 0;

  return (
    <div>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">Scan Console</h1>
          <p className="opacity-70 text-sm">
            Select scan types, enter a target, and initiate active scanning.
          </p>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT PANEL → Scan Selection */}
          <div className="col-span-1">
            <ScannerList
              selected={selectedScanners}
              onToggle={toggleScanner}
              onConfigure={openConfigDrawer}
            />
          </div>

          {/* RIGHT PANEL → Target + Run + Next Features */}
          <div className="col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow p-6">
            <div className="space-y-2">
              <label className="font-medium text-sm">Target</label>
              <input
                type="text"
                value={target}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  setTarget(value);
                  if (value.length > 0) {
                    validateTarget(value);
                  } else {
                    setTargetError("Target is required.");
                  }
                }}
                placeholder="Enter IP / Domain (example: 192.168.1.1, app.gov.in)"
                className={`
                  w-full p-2 rounded-lg border
                  bg-slate-900/40 text-slate-100
                  border-slate-700 focus:outline-none
                  focus:ring-2 focus:ring-blue-500
                  ${targetError ? "border-red-500 focus:ring-red-500" : ""}
                `}
              />
              <p className="text-xs opacity-70">
                Supports single IPv4 or domain. Ranges and CIDRs can be added later from Advanced Mode.
              </p>
              {targetError && (
                <p className="text-xs text-red-400">{targetError}</p>
              )}
            </div>

            <button
              disabled={!canRunScan}
              onClick={handleRunScan}
              className={`
                px-4 py-2 rounded-lg text-sm font-semibold mt-4
                ${canRunScan
                  ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                  : "bg-slate-500 text-slate-300 cursor-not-allowed"}
              `}
            >
              {isRunning ? "Starting..." : "Run Scan"}
            </button>

            <div className="mt-6">
              <h2 className="font-semibold mb-2">Scan Output</h2>

              <LogTerminal
                logs={logs}
                running={isRunning}
                onClear={() => setLogs([])}
              />
            </div>
          </div>

        </div>
      </div>

      <ScanHistory />

      <ScannerConfigDrawer
        open={drawerScanner !== null}
        scannerId={drawerScanner}
        onClose={() => setDrawerScanner(null)}
        onSave={saveScannerConfig}
      />
    </div>
  );
};

export default ScanConsole;