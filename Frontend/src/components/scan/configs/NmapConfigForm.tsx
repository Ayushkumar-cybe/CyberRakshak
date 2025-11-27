import React from "react";

export const NmapConfigForm = ({ config, setConfig }: any) => (
  <div className="space-y-4">
    <div>
      <label className="block mb-1 font-medium">Ports</label>
      <input
        type="text"
        value={config.ports || ""}
        placeholder="22,80,443 or 1-1024"
        onChange={(e) => setConfig({ ...config, ports: e.target.value })}
        className="w-full p-2 rounded bg-slate-200 dark:bg-slate-800"
      />
    </div>

    <div>
      <label className="block mb-1 font-medium">Scan Speed</label>
      <select
        value={config.speed}
        onChange={(e) => setConfig({ ...config, speed: e.target.value })}
        className="w-full p-2 rounded bg-slate-200 dark:bg-slate-800"
      >
        {["T1","T2","T3","T4","T5"].map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>

    <div>
      <label className="block mb-1 font-medium">Script</label>
      <input
        type="text"
        value={config.script || ""}
        placeholder="vuln, ssl-heartbleed, discovery..."
        onChange={(e) => setConfig({ ...config, script: e.target.value })}
        className="w-full p-2 rounded bg-slate-200 dark:bg-slate-800"
      />
    </div>
  </div>
);