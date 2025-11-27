import React from "react";

export const WappalyzerConfigForm = ({ config, setConfig }: any) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={config.enabled}
        onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
      />
      <label className="font-medium">Enable Wappalyzer</label>
    </div>
  </div>
);