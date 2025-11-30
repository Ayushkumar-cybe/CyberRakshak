import React from "react";

export const ZapConfigForm = ({ config, setConfig }: any) => (
  <div className="space-y-4">
    <div>
      <label className="block mb-1 font-medium">Mode</label>
      <select
        value={config.mode}
        onChange={(e) => setConfig({ ...config, mode: e.target.value })}
        className="w-full p-2 rounded bg-slate-200 dark:bg-slate-800"
      >
        <option value="baseline">Baseline</option>
        <option value="full">Full Scan</option>
      </select>
    </div>
  </div>
);