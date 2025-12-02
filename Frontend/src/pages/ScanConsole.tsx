import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ScanTargetPanel from "../components/scan/ScanTargetPanel";
import ScanHistory from "../components/scan/ScanHistory";
import ScannerList from "../components/scan/ScannerList";
import ScannerConfigDrawer from "../components/scan/ScannerConfigDrawer";
import LogTerminal from "../components/scan/LogTerminal";
import { startScan, getScanStatus } from "../services/api";

const ScanConsole = () => {
  const navigate = useNavigate();
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
  const [logs, setLogs] = useState<string[]>([]);
  const [historyKey, setHistoryKey] = useState(0);

  // --- NEW: Notification State ---
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [emailList, setEmailList] = useState("");
  // -------------------------------

  // Validations
  const isValidIp = (value: string) => {
    const ipv4Regex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
    return ipv4Regex.test(value);
  };

  const isValidDomain = (value: string) => {
    const domainRegex = /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z0-9-]{1,63})*\.[A-Za-z]{2,}$/;
    return domainRegex.test(value);
  };

  const validateTarget = (value: string) => {
    if (!value) {
      setTargetError("Target is required.");
      return false;
    }
    if (!(isValidIp(value) || isValidDomain(value))) {
      setTargetError("Enter a valid IPv4 address or domain (e.g., 192.168.1.1 or scanme.nmap.org).");
      return false;
    }
    setTargetError(null);
    return true;
  };

  const buildScanPayload = () => {
    const scannersPayload: Record<string, any> = {};
    Object.keys(selectedScanners).forEach((scannerId) => {
      if (selectedScanners[scannerId]) {
        scannersPayload[scannerId] = {
          enabled: true,
          params: scannerConfigs[scannerId] || {},
        };
      }
    });

    // --- NEW: Include Email Config ---
    return { 
      target, 
      scanners: scannersPayload,
      notify_email: notifyEmail,
      email_recipients: notifyEmail ? emailList.split(",").map(e => e.trim()).filter(e => e) : []
    };
  };

  // POLLING LOGIC
  const pollScanStatus = async (jobId: string) => {
    let previousToolStatus: Record<string, string> = {};
    
    const interval = setInterval(async () => {
      try {
        const statusData = await getScanStatus(jobId);
        const currentToolStatus = statusData.tool_status || {};
        
        Object.entries(currentToolStatus).forEach(([tool, status]) => {
          const prev = previousToolStatus[tool] || "pending";
          
          if (prev !== status) {
            const time = new Date().toLocaleTimeString();
            
            if (prev === "pending" && (status === "completed" || status === "failed")) {
                 setLogs(prevLogs => [...prevLogs, `[${time}] ${tool.toUpperCase()}: Started scanning...`]);
            }

            if (status === "running") {
              setLogs(prevLogs => [...prevLogs, `[${time}] ${tool.toUpperCase()}: Started scanning...`]);
            } else if (status === "completed") {
              setLogs(prevLogs => [...prevLogs, `[${time}] ${tool.toUpperCase()}: Completed successfully.`]);
            } else if (status === "failed") {
              setLogs(prevLogs => [...prevLogs, `[${time}] ${tool.toUpperCase()}: Failed or encountered an error.`]);
            }
          }
        });
        
        previousToolStatus = currentToolStatus;

        if (["completed", "failed", "partial_success"].includes(statusData.status)) {
          clearInterval(interval);
          setIsRunning(false);
          const time = new Date().toLocaleTimeString();
          setLogs(prevLogs => [...prevLogs, `[${time}] Scan finished with status: ${statusData.status.toUpperCase()}`]);
          setHistoryKey(prev => prev + 1);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 2000);
  };

  const handleRunScan = async () => {
    if (!validateTarget(target)) return;

    const payload = buildScanPayload();
    if (Object.keys(payload.scanners).length === 0) {
      alert("Please select at least one scanner.");
      return;
    }

    setIsRunning(true);
    setLogs([`[${new Date().toLocaleTimeString()}] Initializing scan for ${target}...`]);

    try {
      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Sending request to backend...`]);
      const response = await startScan(payload);
      
      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Job ID: ${response.job_id}`]);
      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Scanners queued: ${response.scanners_requested.join(", ")}`]);
      
      if (notifyEmail) {
          setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Email notifications enabled for: ${emailList}`]);
      }

      pollScanStatus(response.job_id);

    } catch (err: any) {
      console.error(err);
      const errorMsg = err.message || "Unknown error";
      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ERROR: ${errorMsg}`]);
      setIsRunning(false);
      alert(`Failed to start scan: ${errorMsg}`);
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
        <div>
          <h1 className="text-2xl font-bold">Scan Console</h1>
          <p className="opacity-70 text-sm">
            Select scan types, enter a target, and initiate active scanning.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1">
            <ScannerList
              selected={selectedScanners}
              onToggle={toggleScanner}
              onConfigure={openConfigDrawer}
            />
          </div>

          <div className="col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow p-6">
            <div className="space-y-2">
              <label className="font-medium text-sm">Target</label>
              <input
                type="text"
                value={target}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  setTarget(value);
                  if (value.length > 0) validateTarget(value);
                }}
                placeholder="Enter IP / Domain (example: 192.168.1.1, scanme.nmap.org)"
                className={`
                  w-full p-2 rounded-lg border
                  bg-slate-50 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100
                  border-slate-300 dark:border-slate-700 focus:outline-none
                  focus:ring-2 focus:ring-blue-500
                  ${targetError ? "border-red-500 focus:ring-red-500" : ""}
                `}
              />
              <p className="text-xs opacity-70">Supports single IPv4 or domain.</p>
              {targetError && <p className="text-xs text-red-400">{targetError}</p>}
            </div>

            {/* --- NEW: Email Notification UI --- */}
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <input 
                  type="checkbox" 
                  checked={notifyEmail} 
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  className="w-4 h-4"
                />
                <label className="text-sm font-semibold">Email Notification</label>
              </div>
              
              {notifyEmail && (
                <input
                  type="text"
                  value={emailList}
                  onChange={(e) => setEmailList(e.target.value)}
                  placeholder="Enter emails (comma separated)..."
                  className="w-full p-2 text-sm rounded border bg-white dark:bg-slate-800"
                />
              )}
            </div>
            {/* ---------------------------------- */}

            <button
              disabled={!canRunScan || isRunning}
              onClick={handleRunScan}
              className={`
                px-4 py-2 rounded-lg text-sm font-semibold mt-4
                ${canRunScan && !isRunning
                  ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                  : "bg-slate-500 text-slate-300 cursor-not-allowed"}
              `}
            >
              {isRunning ? "Scanning..." : "Run Scan"}
            </button>

            <div className="mt-6">
              <h2 className="font-semibold mb-2">Scan Output</h2>
              <LogTerminal logs={logs} running={isRunning} onClear={() => setLogs([])} />
            </div>
          </div>
        </div>
      </div>

      <ScanHistory key={historyKey} />

      <ScannerConfigDrawer
        open={drawerScanner !== null}
        scannerId={drawerScanner}
        currentConfig={drawerScanner ? scannerConfigs[drawerScanner] : null}
        onClose={() => setDrawerScanner(null)}
        onSave={saveScannerConfig}
      />
    </div>
  );
};

export default ScanConsole;
