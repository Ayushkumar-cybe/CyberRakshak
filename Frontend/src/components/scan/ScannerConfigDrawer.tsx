import React, { useState, useEffect } from "react";
import RightDrawer from "../ui/RightDrawer";

import { NmapConfigForm } from "./configs/NmapConfigForm";
import { NucleiConfigForm } from "./configs/NucleiConfigForm";
import { ZapConfigForm } from "./configs/ZapConfigForm";
import { NiktoConfigForm } from "./configs/NiktoConfigForm";
import { MetasploitConfigForm } from "./configs/MetasploitConfigForm";
import { OpenVASConfigForm } from "./configs/OpenVASConfigForm";
import { WappalyzerConfigForm } from "./configs/WappalyzerConfigForm";

const DEFAULT_CONFIGS = {
  nmap: { ports: "", speed: "T4", script: "" },
  nuclei: { tags: "cve", severity: "" },
  zap: { mode: "baseline" },
  nikto: { tuning: "" },
  metasploit: { modules: ["auxiliary/scanner/http/http_version"] },
  openvas: { profile: "Full and fast" },
  wappalyzer: { enabled: true }
};

const ScannerConfigDrawer = ({ open, scannerId, onClose, onSave }: any) => {
  const [config, setConfig] = useState(DEFAULT_CONFIGS[scannerId as keyof typeof DEFAULT_CONFIGS] || {});

  useEffect(() => {
    if (scannerId) {
      setConfig(DEFAULT_CONFIGS[scannerId as keyof typeof DEFAULT_CONFIGS]);
    }
  }, [scannerId]);

  const handleSave = () => {
    onSave(scannerId, config);
    onClose();
  };

  return (
    <RightDrawer
      open={open}
      onClose={onClose}
      title={`${scannerId?.toUpperCase()} Configuration`}
    >
      {scannerId === "nmap" && <NmapConfigForm config={config} setConfig={setConfig} />}
      {scannerId === "nuclei" && <NucleiConfigForm config={config} setConfig={setConfig} />}
      {scannerId === "zap" && <ZapConfigForm config={config} setConfig={setConfig} />}
      {scannerId === "nikto" && <NiktoConfigForm config={config} setConfig={setConfig} />}
      {scannerId === "metasploit" && <MetasploitConfigForm config={config} setConfig={setConfig} />}
      {scannerId === "openvas" && <OpenVASConfigForm config={config} setConfig={setConfig} />}
      {scannerId === "wappalyzer" && <WappalyzerConfigForm config={config} setConfig={setConfig} />}

      <button
        className="w-full mt-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        onClick={handleSave}
      >
        Save Configuration
      </button>
    </RightDrawer>
  );
};

export default ScannerConfigDrawer;