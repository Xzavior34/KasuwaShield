"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  Wallet,
  ArrowRight,
  ExternalLink,
  Github,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Layers,
  Activity,
  Lock,
  TrendingDown,
  Terminal,
  Zap,
  RefreshCw,
  Copy,
  Check,
  Flame,
  Sliders,
} from "lucide-react";
import { useWallet } from "../hooks/useWallet";
import { CryptoIcon } from "../components/common/CryptoIcon";
import { MAX_PROTECTION_PERCENT } from "../lib/contracts";

export default function LandingPage() {
  const wallet = useWallet();
  const router = useRouter();
  const [connectNotice, setConnectNotice] = useState<string | null>(null);

  // Live Somnia Block Ticker
  const [liveBlock, setLiveBlock] = useState<number | null>(null);
  const [isRpcLive, setIsRpcLive] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    const fetchBlock = async () => {
      try {
        const res = await fetch("https://dream-rpc.somnia.network", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "eth_blockNumber",
            params: [],
          }),
        });
        const json = await res.json();
        if (!cancelled && json?.result) {
          const num = parseInt(json.result, 16);
          if (Number.isFinite(num)) {
            setLiveBlock(num);
            setIsRpcLive(true);
          }
        }
      } catch {
        // Fallback
      }
    };

    fetchBlock();
    const interval = setInterval(fetchBlock, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Live Crypto Prices
  const [prices, setPrices] = useState<Record<string, number>>({
    BTC: 79650,
    ETH: 2520,
    SOL: 105,
    SOMI: 1.20,
  });

  useEffect(() => {
    let cancelled = false;
    const syncPrices = async () => {
      try {
        const res = await fetch("/api/prices");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.prices) {
          setPrices((prev) => ({ ...prev, ...data.prices }));
        }
      } catch {
        // Fallback
      }
    };
    syncPrices();
    const timer = setInterval(syncPrices, 15000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  // Interactive Live Protection Sandbox State
  const [selectedAsset, setSelectedAsset] = useState<string>("BTC");
  const [simExposure, setSimExposure] = useState<number>(25000);
  const [simCoverage, setSimCoverage] = useState<number>(40);
  const [simulateCrash, setSimulateCrash] = useState<boolean>(false);

  // Active showcase tab
  const [activeTab, setActiveTab] = useState<"contracts" | "math" | "delegation" | "clob">("contracts");

  // Copy-to-clipboard state
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const handleCopy = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(null), 2000);
    }
  };

  const handleConnectAndLaunch = async () => {
    if (wallet.isConnected) {
      router.push("/app");
      return;
    }

    if (!wallet.hasInjectedProvider && typeof window !== "undefined" && !(window as any).ethereum) {
      setConnectNotice(
        "No Web3 browser wallet detected (MetaMask or Rabby). You can explore all live features in Guest Mode or install a browser wallet extension."
      );
      return;
    }

    setConnectNotice(null);
    try {
      await wallet.connectWallet();
    } catch {
      // Handled in wallet hook
    }
  };

  // Interactive calculations
  const clampedCoverage = Math.min(simCoverage, MAX_PROTECTION_PERCENT);
  const protectedNotional = Math.round((simExposure * clampedCoverage) / 100);
  const contractsCount = protectedNotional;
  const estimatedRollCost = (contractsCount * 0.0028).toFixed(2);
  const simulatedDrawdownLossWithoutShield = Math.round(simExposure * 0.20);
  const simulatedPayoutWithShield = Math.round(protectedNotional * 0.85);
  const netPreservedCapital = simulatedPayoutWithShield;

  return (
    <main className="min-h-screen bg-[#060911] text-slate-100 font-mono selection:bg-emerald-500/30">
      {/* Live Top Telemetry Stream Bar */}
      <div className="bg-[#04060c] border-b border-slate-800/80 px-4 py-1.5 text-[11px] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-3 text-slate-400">
          <span className="flex items-center space-x-1.5 text-emerald-400 font-bold">
            <span className={`w-2 h-2 rounded-full ${isRpcLive ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
            <span>SOMNIA SHANNON (50312)</span>
          </span>
          <span className="text-slate-600 hidden sm:inline">&bull;</span>
          <span className="hidden sm:inline font-mono text-slate-300">
            {liveBlock ? `BLOCK #${liveBlock.toLocaleString("en-US")}` : "SYNCING BLOCKSTREAM..."}
          </span>
          <span className="text-slate-600 hidden md:inline">&bull;</span>
          <span className="text-cyan-400 hidden md:inline">&lt; 1s SUB-SECOND FINALITY</span>
        </div>

        <div className="flex items-center space-x-4 text-[10px] sm:text-[11px] overflow-x-auto">
          {["BTC", "ETH", "SOL", "SOMI"].map((sym) => (
            <div key={sym} className="flex items-center space-x-1">
              <CryptoIcon symbol={sym} size={13} />
              <span className="text-slate-400">{sym}:</span>
              <span className="text-white font-bold">
                ${prices[sym] < 10 ? prices[sym].toFixed(2) : Math.round(prices[sym]).toLocaleString("en-US")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-[#060911]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/60 transition-all">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-sm font-extrabold tracking-wider text-white">
                KASUWA<span className="text-emerald-400">SHIELD</span>
              </span>
            </Link>
            <span className="hidden sm:inline-block text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
              SOMNIA 50312
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <Link
              href="/app"
              className="text-slate-400 hover:text-white transition-colors hidden md:inline-block"
            >
              Live Terminal
            </Link>
            <Link
              href="/proof"
              className="text-slate-400 hover:text-white transition-colors hidden md:inline-block"
            >
              On-Chain Proof
            </Link>

            {wallet.isConnected ? (
              <div className="flex items-center space-x-2">
                <div className="px-2.5 py-1 rounded bg-slate-900 border border-emerald-500/40 text-emerald-400 font-bold text-[11px] flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}</span>
                  {wallet.balanceSTT && (
                    <span className="text-white font-mono font-bold ml-1 pl-1 border-l border-slate-700">
                      {wallet.balanceSTT} STT
                    </span>
                  )}
                </div>
                <Link
                  href="/app"
                  className="px-3 py-1 rounded bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all flex items-center space-x-1 shadow-sm"
                >
                  <span>LAUNCH APP</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <button
                onClick={handleConnectAndLaunch}
                disabled={wallet.isConnecting}
                className="px-3 py-1.5 rounded bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all flex items-center space-x-1.5 disabled:opacity-60 shadow-sm"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>{wallet.isConnecting ? "CONNECTING..." : "CONNECT WALLET"}</span>
              </button>
            )}

            <a
              href="https://github.com/Xzavior34/KasuwaShield"
              target="_blank"
              rel="noreferrer"
              className="text-slate-500 hover:text-white transition-colors p-1"
              title="GitHub Repository"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-slate-800/80 relative overflow-hidden bg-gradient-to-b from-[#060911] via-[#080d1a] to-[#060911]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-cyan-500/5 to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Pitch */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>DREAMDEX 15-MINUTE EVENT CONTRACTS &times; SOMNIA</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight">
                Event Contracts expire every 15 minutes.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  Your downside risk doesn&apos;t.
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                DreamDEX event contracts settle rapidly, leaving crypto portfolios exposed to sudden flash crashes
                without non-stop manual rolling. KasuwaShield turns one non-custodial authorization into an
                <strong> autonomous 24/7 continuous hedge</strong> governed by quantitative math models ($N(-d_2)$,
                Kelly sizing, and CVaR tail risk clamping) on Somnia Shannon testnet.
              </p>

              {/* Primary Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {wallet.isConnected ? (
                  <>
                    <Link
                      href="/app"
                      className="px-6 py-3 rounded-md bg-emerald-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center space-x-2 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/15"
                    >
                      <span>LAUNCH TRADING TERMINAL</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    {!wallet.isCorrectNetwork && (
                      <button
                        onClick={wallet.switchToSomnia}
                        className="px-4 py-3 rounded-md bg-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 hover:bg-amber-400 transition-all"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>SWITCH TO SOMNIA SHANNON</span>
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={handleConnectAndLaunch}
                    disabled={wallet.isConnecting}
                    className="px-6 py-3 rounded-md bg-emerald-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center space-x-2 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/15 disabled:opacity-60"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>{wallet.isConnecting ? "CONNECTING TO WALLET..." : "CONNECT WALLET & ENTER APP"}</span>
                  </button>
                )}

                <Link
                  href="/app"
                  className="px-5 py-3 rounded-md bg-slate-900 border border-slate-700 text-slate-300 font-bold text-xs sm:text-sm flex items-center space-x-2 hover:border-slate-500 hover:text-white transition-all"
                >
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>EXPLORE AS GUEST</span>
                </Link>

                <Link
                  href="/proof"
                  className="px-4 py-3 rounded-md text-slate-400 font-bold text-xs flex items-center space-x-1 hover:text-emerald-400 transition-colors"
                >
                  <span>On-Chain Evidence</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Status Notice if any */}
              {wallet.error && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Wallet Notice: </span>
                    <span>{wallet.error}</span>
                  </div>
                </div>
              )}

              {connectNotice && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span>{connectNotice}</span>
                    <div className="mt-2 flex items-center space-x-3 font-bold">
                      <Link href="/app" className="text-emerald-400 hover:underline flex items-center space-x-1">
                        <span>Continue in Guest Mode</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                      <a
                        href="https://metamask.io/download/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-200 hover:underline flex items-center space-x-1"
                      >
                        <span>Get MetaMask</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Interactive Live Protection Card */}
            <div className="lg:col-span-5">
              <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Live Protection Sandbox</h3>
                      <span className="text-[10px] text-slate-400">Interactive Quantitative Model</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                    REACTIVE
                  </span>
                </div>

                {/* Asset Selector */}
                <div className="flex items-center justify-between bg-[#060911] p-1 rounded-lg border border-slate-800 text-xs">
                  {["BTC", "ETH", "SOL", "SOMI"].map((sym) => (
                    <button
                      key={sym}
                      onClick={() => setSelectedAsset(sym)}
                      className={`flex-1 py-1 rounded font-bold flex items-center justify-center space-x-1 transition-all ${
                        selectedAsset === sym
                          ? "bg-emerald-500 text-slate-950 shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <CryptoIcon symbol={sym} size={12} />
                      <span>{sym}</span>
                    </button>
                  ))}
                </div>

                {/* Exposure Slider */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Portfolio Exposure:</span>
                    <strong className="text-white font-mono">${simExposure.toLocaleString("en-US")} USD</strong>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="1000"
                    value={simExposure}
                    onChange={(e) => setSimExposure(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                </div>

                {/* Coverage Slider */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Hedge Target (On-Chain Max 50%):</span>
                    <strong className="text-emerald-400 font-mono">{clampedCoverage}%</strong>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="5"
                    value={simCoverage}
                    onChange={(e) => setSimCoverage(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                </div>

                {/* Metric Readouts */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-[#060911] p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Protected Notional</span>
                    <strong className="text-white font-mono text-sm">${protectedNotional.toLocaleString("en-US")}</strong>
                  </div>
                  <div className="bg-[#060911] p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Est. 15m Roll Cost</span>
                    <strong className="text-amber-300 font-mono text-sm">${estimatedRollCost} USD</strong>
                  </div>
                </div>

                {/* Crash Simulation Toggle */}
                <div className="bg-[#060911] border border-slate-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-bold flex items-center space-x-1.5">
                      <Flame className="w-3.5 h-3.5 text-rose-400" />
                      <span>Simulate 20% Sudden Market Drop</span>
                    </span>
                    <button
                      onClick={() => setSimulateCrash(!simulateCrash)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                        simulateCrash
                          ? "bg-rose-500 text-white shadow-sm"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {simulateCrash ? "ACTIVE DROP" : "TEST IMPACT"}
                    </button>
                  </div>

                  {simulateCrash ? (
                    <div className="pt-1 text-[11px] space-y-1 text-rose-300 border-t border-slate-800">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Unhedged Drawdown Loss:</span>
                        <span className="text-rose-400 font-bold">-${simulatedDrawdownLossWithoutShield.toLocaleString("en-US")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">KasuwaShield Payout:</span>
                        <span className="text-emerald-400 font-bold">+${simulatedPayoutWithShield.toLocaleString("en-US")}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-800/60 font-bold text-white">
                        <span className="text-emerald-400">Net Capital Preserved:</span>
                        <span className="text-emerald-400 font-mono">${netPreservedCapital.toLocaleString("en-US")}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 leading-snug">
                      Toggle to evaluate how the Black-Scholes $N(-d_2)$ binary payoff cushions rapid downturns.
                    </p>
                  )}
                </div>

                {/* Direct Launch CTA inside Card */}
                <Link
                  href="/app"
                  className="w-full py-2.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 font-bold text-xs flex items-center justify-center space-x-2 transition-all"
                >
                  <span>TEST IN LIVE TERMINAL</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What KasuwaShield Has Done / Verified Proof Bar */}
      <section className="border-b border-slate-800/80 bg-[#0b101d]/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-4 text-center sm:text-left">
            <h2 className="text-xs uppercase tracking-widest text-slate-500 font-bold">
              Verifiable Milestones &amp; Live On-Chain Infrastructure
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-[#060911] border border-slate-800 rounded-lg p-3.5 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Smart Contracts</span>
              <div className="text-base sm:text-lg font-extrabold text-white flex items-center space-x-1">
                <span>4 Verified</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400">Deployed &amp; verified on Somnia Shannon testnet</p>
            </div>

            <div className="bg-[#060911] border border-slate-800 rounded-lg p-3.5 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Autonomous Roll</span>
              <div className="text-base sm:text-lg font-extrabold text-white flex items-center space-x-1">
                <span>15-Minute</span>
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <p className="text-[11px] text-slate-400">Deterministic auto-roll engine matching event windows</p>
            </div>

            <div className="bg-[#060911] border border-slate-800 rounded-lg p-3.5 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block">DreamDEX CLOB</span>
              <div className="text-base sm:text-lg font-extrabold text-white flex items-center space-x-1">
                <span>Live Staging Depth</span>
                <TrendingDown className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400">Real bids &amp; asks via live proxy, no hardcoded fakes</p>
            </div>

            <div className="bg-[#060911] border border-slate-800 rounded-lg p-3.5 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Mathematical Rigor</span>
              <div className="text-base sm:text-lg font-extrabold text-white flex items-center space-x-1">
                <span>N(-d₂) &amp; Kelly</span>
                <Activity className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-[11px] text-slate-400">Black-Scholes downside prob, CVaR 97.5% &amp; Kelly sizing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution Architecture */}
      <section className="border-b border-slate-800/80 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="max-w-2xl">
            <h2 className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-2">
              The Problem &amp; The Architecture
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Why Event Contracts Need Autonomous Non-Custodial Rolling
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0b101d] border border-rose-500/20 rounded-xl p-5 space-y-3">
              <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>The Challenge: 15-Minute Expiration Gaps</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                DreamDEX 15-minute Binary Event Contracts offer instant, ultra-high-leverage downside
                protection. But their ultra-short lifespan is a double-edged sword: once an event window
                settles, protection drops to zero. Traders either stay awake clicking wallet signatures
                every 15 minutes, or leave their portfolios completely unhedged against gap risk.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-1">
                <li className="flex items-center space-x-1.5">
                  <span className="text-rose-400 font-bold">&times;</span>
                  <span>Constant manual transaction signing fatigue</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <span className="text-rose-400 font-bold">&times;</span>
                  <span>Catastrophic exposure when an expired window isn&apos;t rolled</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <span className="text-rose-400 font-bold">&times;</span>
                  <span>Slippage and toxic spreads when entering blindly during crashes</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#0b101d] border border-emerald-500/20 rounded-xl p-5 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>The KasuwaShield Solution: Autonomous Non-Custodial Rolling</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                KasuwaShield leverages EIP-7702 session key authorization. You sign once to authorize an
                ephemeral session key restricted strictly to rolling downside puts within your declared
                budget and protection cap. Our on-chain smart contracts enforce these boundaries with
                fail-closed guarantees.
              </p>
              <ul className="text-xs text-slate-300 space-y-1.5 pt-1">
                <li className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Zero wallet popups across rolling 15m windows</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Non-custodial: funds never leave your own wallet</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Hard on-chain caps: 50% max coverage clamp &amp; budget kill-switch</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works 3-Step Flow */}
      <section className="border-b border-slate-800/80 bg-[#060911] py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="max-w-2xl">
            <h2 className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-2">
              Simple 3-Step Workflow
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              From One Approval to Continuous On-Chain Protection
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                01
              </div>
              <h4 className="text-sm font-bold text-white">1. Configure Risk Profile</h4>
              <p className="text-slate-400 leading-relaxed">
                Connect your wallet and tune your portfolio exposure ($1k – $100k) and protection ratio
                (10% – 100%). The quantitative engine calculates contract requirements and cost estimates
                in real time.
              </p>
            </div>

            <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                02
              </div>
              <h4 className="text-sm font-bold text-white">2. Activate Live On-Chain</h4>
              <p className="text-slate-400 leading-relaxed">
                Submit two real transactions (<code className="text-slate-300">createPolicy</code> and{" "}
                <code className="text-slate-300">authorizeSessionKey</code>) directly from your own wallet.
                Your policy parameters are permanently recorded on Somnia Shannon testnet.
              </p>
            </div>

            <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                03
              </div>
              <h4 className="text-sm font-bold text-white">3. Autonomous Rolling</h4>
              <p className="text-slate-400 leading-relaxed">
                The autonomous engine evaluates live spot ticks against strike prices. As event windows
                open, authorized rolls execute seamlessly without further manual approvals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Deployed On-Chain Contracts Table */}
      <section className="border-b border-slate-800/80 py-12 sm:py-16 bg-[#0b101d]/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
                Production Transparency
              </h2>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Deployed &amp; Verified Smart Contracts on Somnia Shannon (50312)
              </h3>
            </div>
            <Link
              href="/proof"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center space-x-1"
            >
              <span>View Full Evidence Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-[#060911] border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Core Policy Engine</span>
                <strong className="text-white text-xs block mt-0.5">KasuwaPolicy v2</strong>
                <span className="text-cyan-300 font-mono text-[11px] block mt-1">0xbd2A26c3...f9C550a</span>
              </div>
              <a
                href="https://shannon-explorer.somnia.network/address/0xbd2a26c3893db93ef86e0ceaaec080df8f9c550a"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300 text-[11px] font-bold inline-flex items-center space-x-1 pt-1 border-t border-slate-800"
              >
                <span>Verify on Blockscout</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-[#060911] border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">EIP-7702 Executor</span>
                <strong className="text-white text-xs block mt-0.5">KasuwaExecutor</strong>
                <span className="text-cyan-300 font-mono text-[11px] block mt-1">0x80AcBF39...B7c69c</span>
              </div>
              <a
                href="https://shannon-explorer.somnia.network/address/0x80AcBF398663079edBfF26132C9AC04204B7c69c"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300 text-[11px] font-bold inline-flex items-center space-x-1 pt-1 border-t border-slate-800"
              >
                <span>Verify on Blockscout</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-[#060911] border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Reactive Event Handler</span>
                <strong className="text-white text-xs block mt-0.5">KasuwaReactiveHandler</strong>
                <span className="text-cyan-300 font-mono text-[11px] block mt-1">0x7eAfd01B...2F3213</span>
              </div>
              <a
                href="https://shannon-explorer.somnia.network/address/0x7eAfd01B0736593611c2Ac73e0FdB6BeED2F3213"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300 text-[11px] font-bold inline-flex items-center space-x-1 pt-1 border-t border-slate-800"
              >
                <span>Verify on Blockscout</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-[#060911] border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Collateral Token</span>
                <strong className="text-white text-xs block mt-0.5">USDso Stablecoin</strong>
                <span className="text-cyan-300 font-mono text-[11px] block mt-1">0x9c32F382...7bb171</span>
              </div>
              <a
                href="https://shannon-explorer.somnia.network/address/0x9c32F3827A1a99f0cf9B213de8b53eC3d57bb171"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300 text-[11px] font-bold inline-flex items-center space-x-1 pt-1 border-t border-slate-800"
              >
                <span>Verify on Blockscout</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Experience CTA */}
      <section className="py-14 sm:py-20 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to Experience Autonomous Downside Protection?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Connect any browser wallet on Somnia Shannon to activate your own non-custodial protection policy,
            or launch the live terminal in Guest Mode to explore streaming orderbooks, pricing feeds, and stress simulation.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleConnectAndLaunch}
              disabled={wallet.isConnecting}
              className="px-6 py-3 rounded-md bg-emerald-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center space-x-2 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-60"
            >
              <Wallet className="w-4 h-4" />
              <span>{wallet.isConnected ? "CONTINUE TO TRADING TERMINAL" : "CONNECT WALLET & LAUNCH APP"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              href="/app"
              className="px-6 py-3 rounded-md bg-slate-900 border border-slate-700 text-slate-300 font-bold text-xs sm:text-sm flex items-center space-x-2 hover:border-slate-500 hover:text-white transition-all"
            >
              <span>EXPLORE AS GUEST</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#04060c]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span>KasuwaShield &middot; Somnia &times; DreamDEX Event Contracts Hackathon 2026</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/app" className="hover:text-slate-300 transition-colors">
              App
            </Link>
            <Link href="/proof" className="hover:text-slate-300 transition-colors">
              Evidence
            </Link>
            <a
              href="https://github.com/Xzavior34/KasuwaShield"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300 transition-colors flex items-center space-x-1"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

