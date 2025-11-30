import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getRemediationPlan } from "../services/api";
import type { RemediationStep } from "../services/api"; // <--- Explicit type import
import { CheckCircle2, AlertTriangle, Shield, Terminal, ExternalLink } from "lucide-react";

const Remediation = () => {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("job_id");
  
  const [plan, setPlan] = useState<RemediationStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) {
      fetchRemediation(jobId);
    }
  }, [jobId]);

  const fetchRemediation = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRemediationPlan(id);
      setPlan(data);
    } catch (err) {
      console.error("Failed to fetch remediation plan:", err);
      setError("Failed to load remediation plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    const s = severity.toLowerCase();
    if (s === "critical") return "border-l-4 border-red-600 bg-red-50 dark:bg-red-900/20";
    if (s === "high") return "border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20";
    if (s === "medium") return "border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";
    return "border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Remediation Plan</h1>
        <p className="opacity-70 text-sm">
          Actionable steps to fix discovered vulnerabilities, prioritized by risk.
        </p>
      </div>

      {/* Job Selector / Status */}
      {!jobId ? (
        <div className="p-10 text-center bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
          <Shield className="w-12 h-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold">No Scan Selected</h3>
          <p className="text-sm opacity-70 mb-4">
            Please select a scan from the Console history to view its remediation plan.
          </p>
          <a 
            href="/scan-console"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block"
          >
            Go to Scan Console
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {loading && <p className="text-center py-10">Generating remediation plan...</p>}
          
          {error && (
            <div className="p-4 bg-red-100 text-red-800 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {!loading && !error && plan.length === 0 && (
            <div className="p-8 text-center bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-12 h-12 mx-auto text-green-600 mb-3" />
              <h3 className="text-lg font-bold text-green-800 dark:text-green-300">All Clear!</h3>
              <p className="text-green-700 dark:text-green-400">
                No high-risk vulnerabilities requiring immediate remediation were found in this scan.
              </p>
            </div>
          )}

          <div className="grid gap-4">
            {plan.map((step, index) => (
              <div 
                key={index} 
                className={`p-5 rounded-lg shadow-sm border dark:border-slate-700 ${getSeverityColor(step.severity)}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                        {step.severity} Priority
                      </span>
                      <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                        {step.cve}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                    
                    <div className="bg-white dark:bg-slate-900/50 p-3 rounded border border-slate-200 dark:border-slate-700 mb-3 font-mono text-sm">
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                        <Terminal className="w-4 h-4" />
                        <span className="font-bold">Recommended Action:</span>
                      </div>
                      {step.action}
                    </div>

                    <div className="flex items-center gap-4 text-xs opacity-70">
                      <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Asset: {step.asset}
                      </span>
                      <span className="flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> Source: {step.source}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Remediation;
