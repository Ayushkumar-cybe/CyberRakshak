import React from "react";

export const MetasploitConfigForm = ({ config, setConfig }: any) => {
  // FIX: Safety check. Use empty array if config is not yet loaded.
  const modules = Array.isArray(config.modules) ? config.modules : [];

  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">Modules</label>
        <input
          type="text"
          value={modules.join(",")}
          placeholder="auxiliary/scanner/http/http_version"
          onChange={(e) =>
            setConfig({ ...config, modules: e.target.value.split(",") })
          }
          className="w-full p-2 rounded bg-slate-200 dark:bg-slate-800"
        />
        <p className="text-xs opacity-70 mt-1">Comma-separated list of MSF modules.</p>
      </div>
    </div>
  );
};
