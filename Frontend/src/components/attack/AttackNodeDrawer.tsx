import React from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  node: any;
}

const AttackNodeDrawer = ({ open, onClose, node }: Props) => {
  if (!open || !node) return null;

  return (
    <div className="fixed inset-0 z-50 flex">

      {/* BACKDROP */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      {/* DRAWER */}
      <div className="w-full sm:w-[420px] lg:w-[480px] bg-white dark:bg-slate-800 shadow-xl p-6 overflow-y-auto animate-slide-left">

        {/* HEADER */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold">{node.data.label}</h2>
            <p className="opacity-70 text-sm">Node ID: {node.id}</p>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-300 dark:bg-slate-700 rounded-md"
          >
            Close
          </button>
        </div>

        {/* SECTION: Node Summary */}
        <div className="mb-6">
          <h3 className="font-semibold">Node Summary</h3>
          <p className="text-sm opacity-80 mt-1">
            This node represents the system <strong>{node.data.label}</strong> in the attack pathway.
            It may act as an entry point, pivot node, or final target.
          </p>
        </div>

        {/* Vulnerabilities */}
        <div className="mb-6">
          <h3 className="font-semibold">Associated Vulnerabilities</h3>
          <div className="mt-2 space-y-2">
            <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm">
              CVE-2025-12432 — Remote Code Execution
            </div>
            <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm">
              CVE-2024-99812 — Privilege Escalation
            </div>
          </div>
        </div>

        {/* Attack Role */}
        <div className="mb-6">
          <h3 className="font-semibold">Role in Attack Path</h3>
          <p className="text-sm opacity-80 mt-1">
            This system can be used as a pivot point for lateral movement.
            Compromise here allows attackers to escalate deeper into the network.
          </p>
        </div>

        {/* AI Summary */}
        <div className="mb-6">
          <h3 className="font-semibold">AI Attack Analysis</h3>
          <p className="text-sm opacity-80 mt-1">
            AI-generated summary: Attackers may exploit known vulnerabilities to establish a foothold.
            Defenders should prioritize patching the exposed services and hardening lateral movement paths.
          </p>
        </div>

        {/* Remediation */}
        <div className="mb-6">
          <h3 className="font-semibold">Recommended Remediation</h3>
          <ul className="text-sm opacity-80 mt-1 list-disc list-inside">
            <li>Patch high-severity vulnerabilities on this node</li>
            <li>Disable unnecessary services</li>
            <li>Implement network segmentation</li>
            <li>Enable MFA for administrative access</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default AttackNodeDrawer;