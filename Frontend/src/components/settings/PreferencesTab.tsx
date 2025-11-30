import React, { useState } from "react";

interface NotificationSettings {
  scan: boolean;
  critical: boolean;
  report: boolean;
  threatIntel: boolean;
}

interface NotificationItem {
  key: keyof NotificationSettings;
  label: string;
}

const PreferencesTab = () => {
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState<NotificationSettings>({
    scan: true,
    critical: true,
    report: false,
    threatIntel: true,
  });

  const [defaultScan, setDefaultScan] = useState("Quick Scan");

  // Theme toggle handler
  const toggleTheme = (value: string) => {
    setTheme(value);

    // Apply to document
    if (value === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="space-y-10 animate-fade-up">

      {/* THEME */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Appearance</h2>

        <div className="flex gap-4">
          <button
            onClick={() => toggleTheme("light")}
            className={`
              px-4 py-2 rounded-lg border
              ${theme === "light" ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-700"}
            `}
          >
            Light Mode
          </button>

          <button
            onClick={() => toggleTheme("dark")}
            className={`
              px-4 py-2 rounded-lg border
              ${theme === "dark" ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-700"}
            `}
          >
            Dark Mode
          </button>
        </div>
      </div>


      {/* NOTIFICATIONS */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Notifications</h2>

        <div className="space-y-4">

          {(Object.keys(notifications) as (keyof NotificationSettings)[]).map((key) => (
            <label key={key} className="flex items-center justify-between bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
              <span>
                {key === "scan" && "Notify when a scan completes"}
                {key === "critical" && "Alert for critical vulnerabilities"}
                {key === "report" && "Notify when a report is generated"}
                {key === "threatIntel" && "Threat intelligence update alerts"}
              </span>

              <input
                type="checkbox"
                checked={notifications[key]}
                onChange={(e) =>
                  setNotifications({ ...notifications, [key]: e.target.checked })
                }
              />
            </label>
          ))}

        </div>
      </div>


      {/* DEFAULT SCAN MODE */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Default Scan Mode</h2>

        <select
          value={defaultScan}
          onChange={(e) => setDefaultScan(e.target.value)}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600"
        >
          <option>Quick Scan</option>
          <option>Full Scan</option>
          <option>Custom</option>
        </select>
      </div>


      {/* SAVE BUTTON */}
      <div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Save Preferences
        </button>
      </div>

    </div>
  );
};

export default PreferencesTab;