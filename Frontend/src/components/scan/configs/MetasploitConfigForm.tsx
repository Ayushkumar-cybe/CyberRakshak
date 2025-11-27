import React from "react";

export const MetasploitConfigForm = ({ config, setConfig }: any) => (
  <div className="space-y-4">
    <div>
      <label className="block mb-1 font-medium">Modules</label>
      <input
        type="text"
        value={config.modules.join(",")}
        placeholder="auxiliary/scanner/http/http_version"
        onChange={(e) =>
          setConfig({ ...config, modules: e.target.value.split(",") })
        }
        className="w-full p-2 rounded bg-slate-200 dark:bg-slate-800"
      />
    </div>
  </div>
);