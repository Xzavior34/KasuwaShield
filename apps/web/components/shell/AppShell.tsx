"use client";

import React from "react";
import { Shield, Zap, Activity, Radio, AlertTriangle, PlayCircle, Layers, Cpu, Database } from "lucide-react";
import { SystemState } from "../../hooks/useRiskEngineState";

export type ViewTab = "ALL" | "RISK" | "EXECUTION" | "PROOF";

interface AppShellProps {
  children: React.ReactNode;
  systemState: SystemState;
  isSimulationRunning: boolean;
  onTriggerStressTest: () => void;
  riskScore: number;
  coveragePct: number;
  protectionGapPct: number;
  activeView: ViewTab;
  setActiveView: (view: ViewTab) => void;
}

export function AppShell({
  children,
  systemState,
  isSimulationRunning,
  onTriggerStressTest,
  riskScore,
  coveragePct,
  protectionGapPct,
  activeView,
  setActiveView,
}: AppShellProps) {
  const getStatusBadge = () => {
    switch (systemState) {
      case "VOLATILITY_RISING":
      case "THRESHOLD_APPROACHING":
        return { label: "VOLATILITY SPIKE", color: "bg-amber-500/20 text-amber-400 border-amber-500/40" };
      case "THRESHOLD_BREACHED":
      case "RISK_EVALUATING":
        return { label: "THRESHOLD BREACHED", color: "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse" };
      case "EXECUTING":
        return { label: "EIP-7702 AUTO-ROLL", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40 animate-pulse" };
      case "PROTECTED":
      case "NORMAL":
      default:
        return { label: "PROTECTED", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" };
    }
  };

  const status = getStatusBadge();

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30">
      {/* Terminal Header */}
      <header className="border-b border-slate-800/80 bg-[#0a0f1d]/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[96rem] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg shadow-sm shadow-emerald-500/10">
              🛡️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-wider uppercase text-white font-mono">
                  KASUWA<span className="text-emerald-400">SHIELD</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  INSTITUTIONAL QUANT
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight">
                AUTONOMOUS PORTFOLIO DOWNSIDE PROTECTION INFRASTRUCTURE
              </p>
            </div>
          </div>

          {/* Navigation View Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setActiveView("ALL")}
              className={`px-3 py-1.5 rounded transition-all font-bold flex items-center space-x-1.5 ${
                activeView === "ALL"
                  ? "bg-emerald-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>FULL TERMINAL</span>
            </button>

            <button
              onClick={() => setActiveView("RISK")}
              className={`px-3 py-1.5 rounded transition-all font-bold flex items-center space-x-1.5 ${
                activeView === "RISK"
                  ? "bg-emerald-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>QUANT RISK ENGINE</span>
            </button>

            <button
              onClick={() => setActiveView("EXECUTION")}
              className={`px-3 py-1.5 rounded transition-all font-bold flex items-center space-x-1.5 ${
                activeView === "EXECUTION"
                  ? "bg-cyan-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>EIP-7702 PIPELINE</span>
            </button>

            <button
              onClick={() => setActiveView("PROOF")}
              className={`px-3 py-1.5 rounded transition-all font-bold flex items-center space-x-1.5 ${
                activeView === "PROOF"
                  ? "bg-emerald-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>REACTIVITY & PROOF</span>
            </button>
          </nav>

          {/* Network & Action Trigger */}
          <div className="flex items-center space-x-4">
            <div className="hidden xl:flex items-center space-x-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
              <span className="text-slate-400">NETWORK:</span>
              <span className="text-white font-bold">SOMNIA TESTNET</span>
              <span className="text-slate-500">(50312)</span>
            </div>

            <button
              onClick={onTriggerStressTest}
              disabled={isSimulationRunning}
              className={`px-4 py-2 rounded-lg font-mono font-bold text-xs flex items-center space-x-2 transition-all shadow-lg border ${
                isSimulationRunning
                  ? "bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed"
                  : "bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-rose-900/30 animate-pulse"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{isSimulationRunning ? "SIMULATING STRESS..." : "[ SIMULATE MARKET STRESS ]"}</span>
            </button>
          </div>
        </div>

        {/* Hero High-Density Status Strip */}
        <div className="border-t border-slate-800/60 bg-[#090d19] py-2.5 px-4 lg:px-8">
          <div className="max-w-[96rem] mx-auto grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs font-mono">
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Portfolio Value</span>
              <span className="text-sm font-bold text-white">$25,000</span>
            </div>

            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Protected Value</span>
              <span className="text-sm font-bold text-emerald-400">$20,000</span>
            </div>

            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Protection Coverage</span>
              <span className="text-sm font-bold text-emerald-300">{coveragePct.toFixed(1)}%</span>
            </div>

            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Protection Gap</span>
              <span className={`text-sm font-bold ${protectionGapPct > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                {protectionGapPct.toFixed(1)}%
              </span>
            </div>

            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Current Risk</span>
              <span className={`text-sm font-bold ${riskScore > 60 ? "text-rose-400" : "text-emerald-400"}`}>
                {riskScore} / 100
              </span>
            </div>

            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Hedge Status</span>
              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${status.color}`}>
                ● {status.label}
              </span>
            </div>

            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">User Interventions</span>
              <span className="text-sm font-bold text-emerald-400">0 ACTIONS</span>
            </div>

            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Event → Execution</span>
              <span className="text-xs font-bold text-slate-300">133ms <span className="text-[9px] text-amber-400">(DEMO)</span></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Terminal Body */}
      <main className="flex-1 max-w-[96rem] w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-4 lg:px-8 bg-[#04060c] text-center text-xs font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between max-w-[96rem] mx-auto w-full">
        <div>
          <span>KasuwaShield — Somnia × DreamDEX Event Contracts Hackathon 2026</span>
        </div>
        <div className="mt-2 sm:mt-0 text-[11px] text-slate-400">
          <span>Programmable Downside Protection Infrastructure • EIP-7702 Delegated Execution</span>
        </div>
      </footer>
    </div>
  );
}
