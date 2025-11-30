import React from "react";

export const OpenVASConfigForm = ({ config, setConfig }: any) => (
  <div className="space-y-4">
    <div>
      <label className="block mb-1 font-medium">Profile</label>
      <select
        value={config.profile}
        onChange={(e) => setConfig({ ...config, profile: e.target.value })}
        className="w-full p-2 rounded bg-slate-200 dark:bg-slate-800"
      >
        <option value="Full and fast">Full and fast</option>
        <option value="Discovery">Discovery</option>
      </select>
    </div>
  </div>
);