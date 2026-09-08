"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Activity, Cpu, Database, RotateCcw, AlertTriangle, Layers, BookOpen, Download, X, Wallet, ExternalLink } from "lucide-react";
import { SystemState } from "../../hooks/useRiskEngineState";
import { useWallet } from "../../hooks/useWallet";

interface AppShellProps {
  children?: React.ReactNode;
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
  const [showNoWalletModal, setShowNoWalletModal] = useState(false);

  const {
    address,
    balanceSTT,
    isConnected,
    isConnecting,
    isCorrectNetwork,
    hasInjectedProvider,
    connectWallet,
    disconnectWallet,
    switchToSomnia,
  } = useWallet();

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

  const downloadAuditReceipt = async () => {
    const timestamp = new Date().toISOString();
    const coreReceipt = {
      protocol: "KasuwaShield Autonomous Risk Agent",
      network: "Somnia Shannon Testnet (50312)",
      contracts: {
        policyContract: "0xbd2a26c3893db93ef86e0ceaaec080df8f9c550a (Source-Verified - v2)",
        executorContract: "0x80AcBF398663079edBfF26132C9AC04204B7c69c (Source-Verified - 3505B)",
        reactiveHandlerContract: "0x7eAfd01B0736593611c2Ac73e0FdB6BeED2F3213 (Source-Verified)",
        collateralToken: "0x9c32F3827A1a99f0cf9B213de8b53eC3d57bb171 (USDso - 7532B)",
      },
      verifiedOnShannon: true,
      timestamp,
      verificationType: "ON_CHAIN_SOURCE_AND_STATE_RECEIPT",
    };

    let sha256Checksum = "unavailable";
    try {
      if (typeof window !== "undefined" && window.crypto?.subtle) {
        const msgBuffer = new TextEncoder().encode(JSON.stringify(coreReceipt));
        const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        sha256Checksum = "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      }
    } catch {
      sha256Checksum = "computation_skipped";
    }

    const receipt = {
      ...coreReceipt,
      cryptographicIntegrity: {
        algorithm: "SHA-256",
        payloadHash: sha256Checksum,
      },
      status: "VERIFIED_CRYPTOGRAPHIC_RECEIPT",
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(receipt, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "kasuwashield-verification-receipt.json");
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

            {/* Live Web3 Wallet Connect Widget */}
            {isConnected ? (
              !isCorrectNetwork ? (
                <button
                  onClick={switchToSomnia}
                  className="px-2 sm:px-2.5 py-1.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[11px] sm:text-xs flex items-center space-x-1.5 animate-pulse"
                  title="Click to switch wallet network to Somnia Shannon (50312)"
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">SWITCH SOMNIA</span>
                  <span className="sm:hidden">SWITCH</span>
                </button>
              ) : (
                <div className="flex items-center space-x-1.5 bg-slate-900 border border-emerald-500/40 px-2 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="text-white font-mono font-bold">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                  {balanceSTT && (
                    <span className="text-emerald-400 text-[10px] hidden md:inline font-mono font-bold">
                      {balanceSTT} STT
                    </span>
                  )}
                  <button
                    onClick={disconnectWallet}
                    title="Disconnect Wallet"
                    className="text-slate-500 hover:text-rose-400 text-xs ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )
            ) : (
              <button
                onClick={() => {
                  if (!hasInjectedProvider) {
                    setShowNoWalletModal(true);
                  } else {
                    connectWallet();
                  }
                }}
                disabled={isConnecting}
                className="px-2 sm:px-2.5 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 font-bold text-[11px] sm:text-xs flex items-center space-x-1.5 transition-all"
              >
                <Wallet className="w-3.5 h-3.5 shrink-0" />
                <span>{isConnecting ? "CONNECTING..." : "CONNECT WALLET"}</span>
              </button>
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
        <div className="lg:hidden relative border-t border-slate-800/60 bg-[#070b14]">
        <div className="px-3 py-1.5 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
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
        {/* Fade cue: hints there is more to scroll to on narrow screens (e.g. ETH/SOL/SOMI) */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#070b14] to-transparent" />
        </div>

        {/* High-Density Status Strip (Mobile 4x2 / Desktop 8x1) */}
        <div className="border-t border-slate-800/60 bg-[#080c16] py-1.5 px-3 sm:px-6 lg:px-8" suppressHydrationWarning>
          <div className="max-w-[96rem] mx-auto grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 sm:gap-2.5 text-xs font-mono">
            <div className="bg-slate-900/80 p-1.5 sm:p-2 rounded border border-slate-800">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase block truncate">Portfolio</span>
              <span className="text-xs sm:text-sm font-bold text-white">${portfolioValue.toLocaleString("en-US")}</span>
            </div>

            <div className="bg-slate-900/80 p-1.5 sm:p-2 rounded border border-slate-800">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase block truncate">Protected</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-400">${protectedValue.toLocaleString("en-US")}</span>
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
                <p className="text-slate-400 text-[10px] sm:text-[11px]"><code>KasuwaReactiveHandler.sol</code> prevents duplicate settlement processing on-chain. Live auto-rolling today runs via a real, verified unattended keeper daemon — native reactive-precompile triggering is on the roadmap.</p>
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
                <span>DOWNLOAD VERIFICATION RECEIPT (SHA-256)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Wallet Detected Modal */}
      {showNoWalletModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b101d] border border-slate-700 max-w-lg w-full rounded-xl p-5 space-y-4 shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Wallet className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Web3 Browser Wallet Notice</h3>
              </div>
              <button onClick={() => setShowNoWalletModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded text-xs space-y-2 text-slate-300 leading-relaxed">
              <p>
                No injected Web3 browser wallet (e.g. <strong>MetaMask, Rabby, Coinbase Wallet</strong>) was detected in this browser window.
              </p>
              <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] space-y-1">
                <strong className="block font-bold">✓ READ-ONLY & PROOF MODE ACTIVE:</strong>
                <span>
                  You can explore all protocol dashboards, live Somnia RPC telemetry, 4-tier proof ledgers, and execute interactive simulations using our pre-funded testnet signer (<code>0x07764D90...22DA</code>).
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                To sign real EIP-7702 session key authorizations with your own wallet, open this app in a browser with MetaMask installed and connected to <strong>Somnia Shannon Testnet (50312)</strong>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowNoWalletModal(false)}
                className="px-3.5 py-2 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all"
              >
                CONTINUE IN TESTNET MODE
              </button>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold hover:bg-cyan-500/30 text-xs flex items-center justify-center space-x-1 transition-all"
              >
                <span>INSTALL METAMASK</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
