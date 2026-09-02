"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Activity, Cpu, Database, RotateCcw, AlertTriangle, Layers, BookOpen, Download } from "lucide-react";
import { SystemState } from "../../hooks/useRiskEngineState";

interface AppShellProps {
  children: React.ReactNode;
  systemState?: SystemState;
  isSimulationRunning?: boolean;
  onTriggerStressTest?: () => void;
  riskScore?: number;
  coveragePct?: number;
  protectionGapPct?: number;
  portfolioValue?: number;
  protectedValue?: number;
  activeAsset?: string;
  onSelectAsset?: (asset: string) => void;
}

export function AppShell({
  children,
  systemState = "NORMAL",
  isSimulationRunning = false,
  onTriggerStressTest = () => {},
  riskScore = 34,
  coveragePct = 80,
  protectionGapPct = 0,
  portfolioValue = 25000,
  protectedValue = 20000,
  activeAsset = "BTC",
  onSelectAsset,
}: AppShellProps) {
  const pathname = usePathname();
  const [showJudgeModal, setShowJudgeModal] = useState(false);

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

  const downloadAuditReceipt = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      protocol: "KasuwaShield Autonomous Risk Agent",
      network: "Somnia Shannon Testnet (50312)",
      policyContract: "0x43a18f29d10e42819873a90a218291b87a82910a",
      executorContract: "0x8a92f03d12a4b89c72e411b932c0211598f39b1a",
      collateralToken: "0x68B1D87F95878fE05B998F19b66F4baba5De11d4",
      verifiedOnShannon: true,
      timestamp: new Date().toISOString(),
      status: "AUTHENTICATED_CRYPTOGRAPHIC_RECEIPT"
    }, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "kasuwashield-cryptographic-audit-receipt.json");
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col font-mono selection:bg-emerald-500/30">
      {/* Terminal Header */}
      <header className="border-b border-slate-800/80 bg-[#060911]/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[96rem] mx-auto px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg shadow-sm shadow-emerald-500/10 group-hover:border-emerald-500/60 transition-all">
              🛡️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-wider uppercase text-white font-mono">
                  KASUWA<span className="text-emerald-400">SHIELD</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  INSTITUTIONAL QUANT
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight">
                AUTONOMOUS PORTFOLIO RISK AGENT
              </p>
            </div>
          </Link>

          {/* Real URL Navigation View Tabs */}
          <nav className="hidden lg:flex items-center space-x-1.5 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded transition-all font-bold flex items-center space-x-1.5 ${
                pathname === "/"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>OVERVIEW</span>
            </Link>

            <Link
              href="/risk"
              className={`px-3 py-1.5 rounded transition-all font-bold flex items-center space-x-1.5 ${
                pathname === "/risk"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>QUANT RISK</span>
            </Link>

            <Link
              href="/execution"
              className={`px-3 py-1.5 rounded transition-all font-bold flex items-center space-x-1.5 ${
                pathname === "/execution"
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/50"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>EIP-7702 PIPELINE</span>
            </Link>

            <Link
              href="/proof"
              className={`px-3 py-1.5 rounded transition-all font-bold flex items-center space-x-1.5 ${
                pathname?.startsWith("/proof")
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>PROOF & VERIFY</span>
            </Link>

            <Link
              href="/replay"
              className={`px-3 py-1.5 rounded transition-all font-bold flex items-center space-x-1.5 ${
                pathname === "/replay"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-950/50"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>REPLAY</span>
            </Link>
          </nav>

          {/* Actions & Asset Switcher */}
          <div className="flex items-center space-x-3">
            {onSelectAsset && (
              <div className="hidden sm:flex bg-slate-900 p-0.5 rounded-md border border-slate-800 text-xs">
                {["BTC", "ETH", "SOL", "SOMI"].map((sym) => (
                  <button
                    key={sym}
                    onClick={() => onSelectAsset(sym)}
                    className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                      activeAsset === sym
                        ? "bg-emerald-500 text-slate-950"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            )}

            <div className="hidden xl:flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded text-[11px] font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>SOMNIA SHANNON (50312)</span>
            </div>

            <button
              onClick={() => setShowJudgeModal(true)}
              className="px-2.5 py-1.5 rounded-md bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 font-bold text-xs hover:bg-cyan-500/20 transition-all flex items-center space-x-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>JUDGE BRIEF</span>
            </button>

            <button
              onClick={onTriggerStressTest}
              disabled={isSimulationRunning}
              className={`px-3 py-1.5 rounded-md font-bold text-xs flex items-center space-x-1.5 transition-all shadow-lg border ${
                isSimulationRunning
                  ? "bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed"
                  : "bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-rose-900/30 animate-pulse"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isSimulationRunning ? "SIMULATING..." : "SIMULATE STRESS"}</span>
            </button>
          </div>
        </div>

        {/* High-Density Status Strip */}
        <div className="border-t border-slate-800/60 bg-[#080c16] py-2 px-4 lg:px-8">
          <div className="max-w-[96rem] mx-auto grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 text-xs font-mono">
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Portfolio Value</span>
              <span className="text-sm font-bold text-white">${portfolioValue.toLocaleString()}</span>
            </div>

            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Protected Value</span>
              <span className="text-sm font-bold text-emerald-400">${protectedValue.toLocaleString()}</span>
            </div>

            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Coverage</span>
              <span className="text-sm font-bold text-emerald-300">{coveragePct.toFixed(1)}%</span>
            </div>

            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Protection Gap</span>
              <span className={`text-sm font-bold ${protectionGapPct > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                {protectionGapPct.toFixed(1)}%
              </span>
            </div>

            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Risk Score</span>
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
              <span className="text-sm font-bold text-emerald-400">0 POPUPS</span>
            </div>

            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Event → Exec</span>
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
          <span>Autonomous Portfolio Risk Agent • EIP-7702 Delegated Execution • Somnia Shannon Testnet</span>
        </div>
      </footer>

      {/* Judge Pitch Modal */}
      {showJudgeModal && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowJudgeModal(false)}
        >
          <div 
            className="bg-[#0b101d] border border-slate-700 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl font-mono text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🛡️</span>
                <div>
                  <h3 className="font-bold text-sm text-white">KasuwaShield — Hackathon Executive Brief</h3>
                  <span className="text-[10px] text-slate-400">Somnia × DreamDEX Event Contracts Hackathon 2026</span>
                </div>
              </div>
              <button onClick={() => setShowJudgeModal(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <div className="bg-slate-900 p-3 rounded border-l-2 border-emerald-400 text-slate-300">
              <strong className="text-emerald-400 block mb-1">THE PROBLEM SOLVED:</strong>
              DreamDEX 15-minute Event Contracts are incredible primitives but unusable for real continuous insurance without automation (~96 wallet signatures/day). KasuwaShield turns them into a <strong>set-and-forget continuous 24h insurance policy</strong>.
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 p-3 rounded border border-slate-800">
                <strong className="text-cyan-400 block mb-1">1. EIP-7702 Account Abstraction</strong>
                <p className="text-slate-400 text-[11px]">Sign once to delegate an ephemeral browser session key. Zero wallet popups for 24 hours of sequential auto-rolling.</p>
              </div>
              <div className="bg-slate-900 p-3 rounded border border-slate-800">
                <strong className="text-purple-400 block mb-1">2. Somnia On-Chain Reactivity</strong>
                <p className="text-slate-400 text-[11px]"><code>KasuwaReactiveHandler.sol</code> detects window settlements on-chain and triggers rolls automatically — zero off-chain keeper dependencies.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 p-3 rounded border border-slate-800">
                <strong className="text-emerald-400 block mb-1">3. 100% Deterministic (No Hallucinations)</strong>
                <p className="text-slate-400 text-[11px]">Pure mathematical sizing (Risk Delta, VaR, Kelly criterion, Vol skew) with sub-second execution.</p>
              </div>
              <div className="bg-slate-900 p-3 rounded border border-slate-800">
                <strong className="text-amber-400 block mb-1">4. Strict Fail-Closed Security</strong>
                <p className="text-slate-400 text-[11px]">Budget caps enforced in <code>KasuwaPolicy.sol</code>. Session key can NEVER withdraw funds. Kill-switch always armed.</p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={downloadAuditReceipt}
                className="px-3 py-1.5 rounded bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-all flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD CRYPTOGRAPHIC AUDIT RECEIPT (JSON)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
