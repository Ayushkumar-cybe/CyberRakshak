import React from "react";

export const NiktoConfigForm = ({ config, setConfig }: any) => (
  <div className="space-y-4">
    <div>
      <label className="block mb-1 font-medium">Tuning</label>
      <input
        type="text"
        value={config.tuning || ""}
        placeholder="x 1-9 (e.g., 123459)"
        onChange={(e) => setConfig({ ...config, tuning: e.target.value })}
        className="w-full p-2 rounded bg-slate-200 dark:bg-slate-800"
      />
    </div>
  </div>
);