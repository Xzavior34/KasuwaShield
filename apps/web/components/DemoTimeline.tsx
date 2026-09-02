"use client";

import React from "react";
import { AlertTriangle, ArrowRight, Zap, ShieldCheck, CheckCircle } from "lucide-react";
import { SystemState } from "../hooks/useRiskEngineState";

interface DemoTimelineProps {
  systemState: SystemState;
  simulationProgress: number;
}

export function DemoTimeline({ systemState, simulationProgress }: DemoTimelineProps) {
  const steps = [
    { label: "MARKET EVENT", state: "VOLATILITY_RISING" },
    { label: "RISK BREACH", state: "THRESHOLD_BREACHED" },
    { label: "AUTONOMOUS DECISION", state: "RISK_EVALUATING" },
    { label: "DREAMDEX HEDGE", state: "EXECUTING" },
    { label: "PROTECTION RESTORED", state: "PROTECTED" },
  ];

  return (
    <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-4 space-y-3 font-mono shadow-xl animate-pulse">
      <div className="flex items-center justify-between text-xs border-b border-rose-500/30 pb-2">
        <div className="flex items-center space-x-2 text-rose-300 font-bold">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>LIVE MARKET STRESS TEST SIMULATION IN PROGRESS</span>
        </div>
        <span className="text-[11px] text-rose-300 font-bold">{simulationProgress}% CASCADE COMPLETE</span>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
        {steps.map((st, idx) => {
          const isActive = systemState === st.state;
          return (
            <div
              key={st.label}
              className={`p-2 rounded border font-bold text-[10px] flex items-center justify-center space-x-1.5 transition-all ${
                isActive
                  ? "bg-rose-500 text-white border-rose-300 shadow-md shadow-rose-950/80 scale-105"
                  : "bg-slate-900/80 text-slate-400 border-slate-800"
              }`}
            >
              <span>{idx + 1}. {st.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
