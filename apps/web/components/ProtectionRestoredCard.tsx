"use client";

import React from "react";
import { CheckCircle2, ShieldCheck, Zap, ArrowRight, X } from "lucide-react";

interface ProtectionRestoredCardProps {
  onDismiss: () => void;
}

export function ProtectionRestoredCard({ onDismiss }: ProtectionRestoredCardProps) {
  return (
    <div className="bg-[#0b101d] border-2 border-emerald-500 rounded-xl p-6 shadow-2xl shadow-emerald-950/50 font-mono space-y-4 relative animate-fade-in">
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center space-x-3 border-b border-emerald-500/30 pb-3">
        <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white tracking-wider uppercase">
            ✓ PROTECTION RESTORED
          </h2>
          <p className="text-xs text-emerald-400 font-bold">
            Autonomous EIP-7702 Auto-Roll Executed Successfully • 0 User Signatures Required
          </p>
        </div>
      </div>

      {/* Metric Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-400 text-[10px] uppercase block">Coverage Restored</span>
          <span className="text-lg font-black text-emerald-400">80.0%</span>
        </div>

        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-400 text-[10px] uppercase block">Risk Score</span>
          <span className="text-lg font-black text-emerald-300">32 / 100</span>
        </div>

        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-400 text-[10px] uppercase block">User Actions</span>
          <span className="text-lg font-black text-emerald-400">0 ACTIONS</span>
        </div>

        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-400 text-[10px] uppercase block">Hedge Position</span>
          <span className="text-lg font-black text-cyan-300">ACTIVE</span>
        </div>
      </div>

      {/* End-to-End Pipeline Progression Bar */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <span className="text-slate-400 text-[11px] font-bold">COMPLETE PIPELINE:</span>
        <div className="flex items-center space-x-2 font-bold text-[11px]">
          <span className="text-slate-200">EVENT</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-200">DECISION</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-cyan-400">EXECUTION</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-emerald-400">PROOF</span>
        </div>
      </div>
    </div>
  );
}
