"use client";

import React from "react";
import { ShieldCheck, Check, X, Lock } from "lucide-react";

export function PermissionBoundary() {
  const allowed = [
    "Execute approved hedge contracts",
    "Maintain protection within configured limits",
    "Auto-roll eligible positions",
  ];

  const prohibited = [
    "Withdraw user funds",
    "Change portfolio ownership",
    "Exceed maximum hedge notional",
    "Execute outside configured contracts",
  ];

  return (
    <div className="bg-[#0b101d] rounded-xl p-5 border border-slate-800 space-y-4 shadow-xl font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-extrabold uppercase text-white tracking-wider">
            EXECUTION PERMISSIONS & BOUNDARIES
          </h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
          CONSTRAINED POLICY
        </span>
      </div>

      {/* Allowed vs Prohibited Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Allowed Section */}
        <div className="bg-slate-900/80 p-3.5 rounded-lg border border-emerald-500/30 space-y-2.5">
          <span className="text-emerald-400 font-bold uppercase text-[11px] block border-b border-emerald-500/20 pb-1">
            ✓ ALLOWED ACTIONS
          </span>
          <ul className="space-y-1.5 text-slate-200">
            {allowed.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Prohibited Section */}
        <div className="bg-slate-900/80 p-3.5 rounded-lg border border-rose-500/30 space-y-2.5">
          <span className="text-rose-400 font-bold uppercase text-[11px] block border-b border-rose-500/20 pb-1">
            ✕ PROHIBITED ACTIONS
          </span>
          <ul className="space-y-1.5 text-slate-300">
            {prohibited.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <X className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
