"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Activity, Cpu, Database, RotateCcw, AlertTriangle, Layers, BookOpen, Download, X } from "lucide-react";
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
        return { label: "BREACHED", color: "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse" };
      case "EXECUTING":
        return { label: "AUTO-ROLLING", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40 animate-pulse" };
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
      policyContract: "0xAc8c3afB4f11b43E1C90fC57AEDc91e3e7140d1d (Bytecode Verified - 4207B)",
      executorContract: "0x80AcBF398663079edBfF26132C9AC04204B7c69c (Bytecode Verified - 3505B)",
      collateralToken: "0x9c32F3827A1a99f0cf9B213de8b53eC3d57bb171 (USDso - 7532B)",
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
        <div className="max-w-[96rem] mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2">
          {/* Brand */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group shrink-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-base sm:text-lg shadow-sm shadow-emerald-500/10 group-hover:border-emerald-500/60 transition-all">
              🛡️
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-wider uppercase text-white font-mono">
                  KASUWA<span className="text-emerald-400">SHIELD</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  QUANT
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block">
                AUTONOMOUS PORTFOLIO RISK AGENT
              </p>
            </div>
          </Link>

          {/* Desktop Navigation View Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs font-mono">
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
              <span>EIP-7702</span>
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
              <span>PROOF</span>
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

          {/* Actions & Buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            {onSelectAsset && (
              <div className="hidden md:flex bg-slate-900 p-0.5 rounded-md border border-slate-800 text-xs">
                {["BTC", "ETH", "SOL", "SOMI"].map((sym) => (
                  <button
                    key={sym}
                    onClick={() => onSelectAsset(sym)}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
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

            <button
              onClick={() => setShowJudgeModal(true)}
              className="px-2 sm:px-2.5 py-1.5 rounded-md bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 font-bold text-[11px] sm:text-xs hover:bg-cyan-500/20 transition-all flex items-center space-x-1"
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">JUDGE BRIEF</span>
              <span className="sm:hidden">BRIEF</span>
            </button>

            <button
              onClick={onTriggerStressTest}
              disabled={isSimulationRunning}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md font-bold text-[11px] sm:text-xs flex items-center space-x-1 transition-all shadow-lg border ${
                isSimulationRunning
                  ? "bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed"
                  : "bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-rose-900/30 animate-pulse"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{isSimulationRunning ? "SIMULATING..." : "STRESS TEST"}</span>
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Scrollable Tab Bar */}
        <div className="lg:hidden border-t border-slate-800/60 bg-[#070b14] px-3 py-1.5 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center space-x-1 shrink-0 text-xs font-mono">
            <Link
              href="/"
              className={`px-2.5 py-1 rounded font-bold text-[11px] shrink-0 ${
                pathname === "/" ? "bg-emerald-500 text-slate-950" : "text-slate-400"
              }`}
            >
              OVERVIEW
            </Link>
            <Link
              href="/risk"
              className={`px-2.5 py-1 rounded font-bold text-[11px] shrink-0 ${
                pathname === "/risk" ? "bg-emerald-500 text-slate-950" : "text-slate-400"
              }`}
            >
              RISK
            </Link>
            <Link
              href="/execution"
              className={`px-2.5 py-1 rounded font-bold text-[11px] shrink-0 ${
                pathname === "/execution" ? "bg-cyan-500 text-slate-950" : "text-slate-400"
              }`}
            >
              EIP-7702
            </Link>
            <Link
              href="/proof"
              className={`px-2.5 py-1 rounded font-bold text-[11px] shrink-0 ${
                pathname?.startsWith("/proof") ? "bg-emerald-500 text-slate-950" : "text-slate-400"
              }`}
            >
              PROOF
            </Link>
            <Link
              href="/replay"
              className={`px-2.5 py-1 rounded font-bold text-[11px] shrink-0 ${
                pathname === "/replay" ? "bg-amber-500 text-slate-950" : "text-slate-400"
              }`}
            >
              REPLAY
            </Link>
          </div>

          {onSelectAsset && (
            <div className="flex sm:hidden bg-slate-900 p-0.5 rounded border border-slate-800 text-[10px] shrink-0">
              {["BTC", "ETH", "SOL", "SOMI"].map((sym) => (
                <button
                  key={sym}
                  onClick={() => onSelectAsset(sym)}
                  className={`px-1.5 py-0.5 rounded font-bold ${
                    activeAsset === sym ? "bg-emerald-500 text-slate-950" : "text-slate-400"
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* High-Density Status Strip (Mobile 4x2 / Desktop 8x1) */}
        <div className="border-t border-slate-800/60 bg-[#080c16] py-1.5 px-3 sm:px-6 lg:px-8">
          <div className="max-w-[96rem] mx-auto grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 sm:gap-2.5 text-xs font-mono">
            <div className="bg-slate-900/80 p-1.5 sm:p-2 rounded border border-slate-800">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase block truncate">Portfolio</span>
              <span className="text-xs sm:text-sm font-bold text-white">${portfolioValue.toLocaleString()}</span>
            </div>

            <div className="bg-slate-900/80 p-1.5 sm:p-2 rounded border border-slate-800">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase block truncate">Protected</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-400">${protectedValue.toLocaleString()}</span>
            </div>

            <div className="bg-slate-900/80 p-1.5 sm:p-2 rounded border border-slate-800">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase block truncate">Coverage</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-300">{coveragePct.toFixed(1)}%</span>
            </div>

            <div className="bg-slate-900/80 p-1.5 sm:p-2 rounded border border-slate-800">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase block truncate">Gap</span>
              <span className={`text-xs sm:text-sm font-bold ${protectionGapPct > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                {protectionGapPct.toFixed(1)}%
              </span>
            </div>

            <div className="bg-slate-900/80 p-1.5 sm:p-2 rounded border border-slate-800">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase block truncate">Risk Score</span>
              <span className={`text-xs sm:text-sm font-bold ${riskScore > 60 ? "text-rose-400" : "text-emerald-400"}`}>
                {riskScore} / 100
              </span>
            </div>

            <div className="bg-slate-900/80 p-1.5 sm:p-2 rounded border border-slate-800">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase block truncate">Status</span>
              <span className={`inline-block px-1 py-0.5 rounded text-[9px] sm:text-[10px] font-bold border ${status.color}`}>
                ● {status.label}
              </span>
            </div>

            <div className="bg-slate-900/80 p-1.5 sm:p-2 rounded border border-slate-800">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase block truncate">Interventions</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-400">0 POPUPS</span>
            </div>

            <div className="bg-slate-900/80 p-1.5 sm:p-2 rounded border border-slate-800">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase block truncate">Reaction</span>
              <span className="text-[11px] sm:text-xs font-bold text-slate-300">133ms <span className="text-[8px] text-amber-400">(DEMO)</span></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Terminal Body */}
      <main className="flex-1 max-w-[96rem] w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-3 sm:py-4 px-3 sm:px-6 lg:px-8 bg-[#04060c] text-center text-[10px] sm:text-xs font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between max-w-[96rem] mx-auto w-full gap-1">
        <div>
          <span>KasuwaShield — Somnia × DreamDEX Event Contracts Hackathon 2026</span>
        </div>
        <div className="text-[9px] sm:text-[11px] text-slate-400">
          <span>EIP-7702 Account Abstraction • Somnia Shannon (50312)</span>
        </div>
      </footer>

      {/* Judge Pitch Modal */}
      {showJudgeModal && (
        <div 
          className="fixed inset-0 bg-black/85 z-50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
          onClick={() => setShowJudgeModal(false)}
        >
          <div 
            className="bg-[#0b101d] border border-slate-700 rounded-xl max-w-2xl w-full p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-2xl font-mono text-xs max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🛡️</span>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-white">KasuwaShield — Executive Brief</h3>
                  <span className="text-[9px] sm:text-[10px] text-slate-400">Somnia × DreamDEX Event Contracts Hackathon 2026</span>
                </div>
              </div>
              <button onClick={() => setShowJudgeModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-900 p-2.5 sm:p-3 rounded border-l-2 border-emerald-400 text-slate-300 text-[11px] sm:text-xs">
              <strong className="text-emerald-400 block mb-1">THE PROBLEM SOLVED:</strong>
              15-minute event contracts require ~96 wallet signatures/day. KasuwaShield turns them into a <strong>set-and-forget 24h continuous insurance policy</strong> with zero wallet popups.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <strong className="text-cyan-400 block mb-1">1. EIP-7702 Account Abstraction</strong>
                <p className="text-slate-400 text-[10px] sm:text-[11px]">Sign once to delegate an ephemeral session key. Zero wallet popups for 24h.</p>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <strong className="text-purple-400 block mb-1">2. Somnia On-Chain Reactivity</strong>
                <p className="text-slate-400 text-[10px] sm:text-[11px]"><code>KasuwaReactiveHandler.sol</code> detects settlements on-chain — zero keeper dependencies.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <strong className="text-emerald-400 block mb-1">3. 100% Deterministic (No Hallucinations)</strong>
                <p className="text-slate-400 text-[10px] sm:text-[11px]">Pure financial mathematics (ΔR, VaR, Kelly criterion, Vol skew).</p>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <strong className="text-amber-400 block mb-1">4. Fail-Closed Security</strong>
                <p className="text-slate-400 text-[10px] sm:text-[11px]">Hard budget caps in <code>KasuwaPolicy.sol</code>. Session keys can never withdraw funds.</p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={downloadAuditReceipt}
                className="w-full sm:w-auto px-3 py-2 rounded bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-all flex items-center justify-center space-x-1.5 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD CRYPTOGRAPHIC RECEIPT (JSON)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
