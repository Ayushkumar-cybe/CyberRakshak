import React, { useState } from "react";

const SecurityTab = () => {
  const [security, setSecurity] = useState({
    mfa: false,
    loginAlerts: true,
    sessionTimeout: "30 minutes",
  });

  const securityLogs = [
    {
      label: "Last Login",
      value: "2025-11-26 10:21 AM",
    },
    {
      label: "Login IP",
      value: "192.168.1.52",
    },
    {
      label: "Device",
      value: "MacOS · Chrome",
    },
  ];

  return (
    <div className="space-y-10 animate-fade-up">

      {/* MFA */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Multi-Factor Authentication</h2>

        <label className="flex items-center justify-between bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
          <span>Enable Two-Factor Authentication (MFA)</span>

          <input
            type="checkbox"
            checked={security.mfa}
            onChange={(e) =>
              setSecurity({ ...security, mfa: e.target.checked })
            }
          />
        </label>
      </div>


      {/* Session Timeout */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Session Timeout</h2>

        <select
          value={security.sessionTimeout}
          onChange={(e) =>
            setSecurity({ ...security, sessionTimeout: e.target.value })
          }
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600"
        >
          <option>15 minutes</option>
          <option>30 minutes</option>
          <option>60 minutes</option>
          <option>Never</option>
        </select>
      </div>


      {/* Login Alerts */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Login Alerts</h2>

        <label className="flex items-center justify-between bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
          <span>Notify me of new or suspicious logins</span>

          <input
            type="checkbox"
            checked={security.loginAlerts}
            onChange={(e) =>
              setSecurity({ ...security, loginAlerts: e.target.checked })
            }
          />
        </label>
      </div>


      {/* Security Logs */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Security Activity</h2>

        <div className="space-y-3">
          {securityLogs.map((log, idx) => (
            <div
              key={idx}
              className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg flex justify-between"
            >
              <span className="font-medium">{log.label}</span>
              <span className="opacity-70 text-sm">{log.value}</span>
            </div>
          ))}
        </div>
      </div>


      {/* Save */}
      <div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
          Save Security Settings
        </button>
      </div>

    </div>
  );
};

export default SecurityTab;