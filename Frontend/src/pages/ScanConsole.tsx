import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ScanHistory from "../components/scan/ScanHistory";
import ScannerList from "../components/scan/ScannerList";
import ScannerConfigDrawer from "../components/scan/ScannerConfigDrawer";
import { startScan, getScanStatus } from "../services/api";

interface ActiveScan {
  id: string;
  target: string;
  tools: string[];
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  jobId?: string;
  startTime: Date;
  toolStatus: Record<string, string>; // Track status of individual tools
}

const ScanConsole = () => {
  const navigate = useNavigate();
  
  // DEFAULT: Nmap selected by default
  const [selectedScanners, setSelectedScanners] = useState<Record<string, boolean>>({
    nmap: true, 
    nuclei: false,
    zap: false,
    nikto: false,
    metasploit: false,
    openvas: false,
    wappalyzer: false,
    nessus: false,
  });
  
  const [drawerScanner, setDrawerScanner] = useState<string | null>(null);
  const [scannerConfigs, setScannerConfigs] = useState<Record<string, any>>({});
  const [target, setTarget] = useState("");
  const [targetError, setTargetError] = useState<string | null>(null);
  const [activeScans, setActiveScans] = useState<ActiveScan[]>([]);
  const [historyKey, setHistoryKey] = useState(0); // Force refresh history

  // Notification State
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [emailList, setEmailList] = useState("");

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
      setTargetError("Enter a valid IPv4 address or domain.");
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

    return { 
      target, 
      scanners: scannersPayload,
      notify_email: notifyEmail,
      email_recipients: notifyEmail ? emailList.split(",").map(e => e.trim()).filter(e => e) : []
    };
  };

  // POLLING & PROGRESS TRACKING
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScans((currentScans) => {
        // Only update scans that are actively running
        const active = currentScans.filter(s => s.status === "running" || s.status === "pending");
        if (active.length === 0) return currentScans;

        // Clone state to modify
        const updatedScans = [...currentScans];

        active.forEach(async (scan) => {
          if (!scan.jobId) return;

          try {
            const statusData = await getScanStatus(scan.jobId);
            
            // Find scan in local state
            const index = updatedScans.findIndex(s => s.id === scan.id);
            if (index === -1) return;

            const backendStatus = statusData.status;
            const toolStatus = statusData.tool_status || {};

            // Calculate progress based on how many tools are "completed" or "failed"
            const totalTools = scan.tools.length;
            let completedTools = 0;
            
            Object.entries(toolStatus).forEach(([tool, status]) => {
              if (status === "completed" || status === "failed") {
                completedTools++;
              }
            });

            // Calculate percentage
            const newProgress = totalTools > 0 ? Math.round((completedTools / totalTools) * 100) : 0;

            updatedScans[index] = {
              ...updatedScans[index],
              status: backendStatus as any,
              progress: newProgress,
              toolStatus: toolStatus as any
            };

            // If completely finished, trigger history refresh
            if (["completed", "failed", "partial_success"].includes(backendStatus)) {
              setHistoryKey(prev => prev + 1);
              
              // Remove from active view after 3 seconds
              setTimeout(() => {
                setActiveScans(prev => prev.filter(s => s.id !== scan.id));
              }, 3000);
            }

          } catch (error) {
            console.error("Poll failed:", error);
          }
        });

        return updatedScans;
      });
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRunScan = async () => {
    if (!validateTarget(target)) return;

    const payload = buildScanPayload();
    const selectedToolNames = Object.keys(payload.scanners);
    if (selectedToolNames.length === 0) {
      alert("Please select at least one scanner.");
      return;
    }

    const scanId = `scan-${Date.now()}`;
    const newScan: ActiveScan = {
      id: scanId,
      target,
      tools: selectedToolNames,
      status: "pending",
      progress: 0,
      startTime: new Date(),
      toolStatus: {}
    };

    setActiveScans((prev) => [...prev, newScan]);

    try {
      const response = await startScan(payload);
      // Update with real Job ID
      setActiveScans((prev) =>
        prev.map((s) => (s.id === scanId ? { ...s, jobId: response.job_id, status: "running" } : s))
      );
      setTarget(""); // Clear input
    } catch (err: any) {
      console.error(err);
      setActiveScans((prev) =>
        prev.map((s) => (s.id === scanId ? { ...s, status: "failed", progress: 100 } : s))
      );
      alert(`Failed to start scan: ${err.message}`);
    }
  };

  const handleStopScan = (scanId: string) => {
    setActiveScans((prev) => prev.filter(s => s.id !== scanId));
  };

  const toggleScanner = (id: string) => {
    setSelectedScanners((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openConfigDrawer = (id: string) => setDrawerScanner(id);
  const saveScannerConfig = (id: string, config: any) => {
    setScannerConfigs((prev) => ({ ...prev, [id]: config }));
  };

  const hasAnyScannerSelected = Object.values(selectedScanners).some(Boolean);
  const canRunScan = hasAnyScannerSelected && !targetError && target.length > 0;

  return (
    <div>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1">
            <ScannerList
              selected={selectedScanners}
              onToggle={toggleScanner}
              onConfigure={openConfigDrawer}
            />
          </div>

          <div className="col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow p-6">
            
            {/* Target Input Section - Now at the top */}
            <div className="space-y-2 mb-4">
              <label className="font-medium text-sm">Target</label>
              <input
                type="text"
                value={target}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  setTarget(value);
                  if (value.length > 0) validateTarget(value);
                }}
                placeholder="Enter IP / Domain (e.g. 192.168.1.1, scanme.nmap.org)"
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

            {/* Email Notification Section */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
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
                  className="w-full p-2 text-sm rounded border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                />
              )}
            </div>

            <button
              disabled={!canRunScan}
              onClick={handleRunScan}
              className={`
                px-4 py-2 rounded-lg text-sm font-semibold mt-4 w-full
                ${canRunScan
                  ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                  : "bg-slate-500 text-slate-300 cursor-not-allowed"}
              `}
            >
              Start Scan
            </button>

            {/* LIVE OPERATIONS PANEL */}
            <div className="mt-6">
              <h2 className="font-semibold mb-2">Live Operations</h2>
              {activeScans.length === 0 ? (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
                  No active scans. Start a scan to see progress here.
                </div>
              ) : (
                <div className="space-y-3">
                  {activeScans.map((scan) => (
                    <div
                      key={scan.id}
                      className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-mono font-semibold text-sm text-slate-900 dark:text-slate-100">
                            {scan.target}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                            - {scan.status.toUpperCase()}
                          </span>
                        </div>
                        <button
                          onClick={() => handleStopScan(scan.id)}
                          className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1"
                        >
                          Clear
                        </button>
                      </div>
                      
                      {/* Overall Progress */}
                      <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                        <div
                          className={`h-full transition-all duration-300 ${
                            scan.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${scan.progress}%` }}
                        ></div>
                      </div>

                      {/* Individual Tool Status */}
                      <div className="flex flex-wrap gap-2">
                        {scan.tools.map((tool) => {
                          const status = scan.toolStatus?.[tool] || "pending";
                          let color = "bg-slate-300 dark:bg-slate-600"; // Pending
                          if (status === "running") color = "bg-blue-500 animate-pulse";
                          if (status === "completed") color = "bg-green-500";
                          if (status === "failed") color = "bg-red-500";

                          return (
                            <div key={tool} className="flex items-center gap-1 text-[10px] bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                              <div className={`w-2 h-2 rounded-full ${color}`}></div>
                              <span className="capitalize">{tool}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
