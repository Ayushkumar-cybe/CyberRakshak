import React from "react";

const AiInsightsPanel = () => {
  return (
    <div className="w-full h-full">
      <h3 className="text-lg font-semibold mb-3">AI Insights</h3>

      <div className="p-6 rounded-xl bg-slate-100 dark:bg-slate-800 shadow space-y-4 text-sm">

        <div className="border-l-4 border-blue-500 pl-4">
          <p className="font-semibold">Risk Summary</p>
          <p className="opacity-75">Overall risk reduced by 6.4% due to lower critical CVEs.</p>
        </div>

        <div className="border-l-4 border-orange-500 pl-4">
          <p className="font-semibold">Top Risk Contributor</p>
          <p className="opacity-75">Server-04 contributed 22% of current risk score.</p>
        </div>

        <div className="border-l-4 border-green-500 pl-4">
          <p className="font-semibold">Cloud Posture</p>
          <p className="opacity-75">IAM misconfigurations reduced significantly.</p>
        </div>

        <div className="border-l-4 border-red-500 pl-4">
          <p className="font-semibold">Threat Intelligence</p>
          <p className="opacity-75">New critical exploit available for CVE-2025-14212.</p>
        </div>

      </div>
    </div>
  );
};

export default AiInsightsPanel;