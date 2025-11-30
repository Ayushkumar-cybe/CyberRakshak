import React from "react";

export const NucleiConfigForm = ({ config, setConfig }: any) => (
  <div className="space-y-4">
    <div>
      <label className="block mb-1 font-medium">Tags</label>
      <input
        type="text"
        value={config.tags}
        onChange={(e) => setConfig({ ...config, tags: e.target.value })}
        className="w-full p-2 rounded bg-slate-200 dark:bg-slate-800"
      />
    </div>

    <div>
      <label className="block mb-1 font-medium">Severity</label>
      <select
        value={config.severity || ""}
        onChange={(e) => setConfig({ ...config, severity: e.target.value })}
        className="w-full p-2 rounded bg-slate-200 dark:bg-slate-800"
      >
        <option value="">Any</option>
        {["low","medium","high","critical"].map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  </div>
);