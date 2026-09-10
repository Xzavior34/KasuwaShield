"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { useWallet } from "../hooks/useWallet";

export default function LandingPage() {
  const wallet = useWallet();
  const router = useRouter();
  const [connectNotice, setConnectNotice] = useState<string | null>(null);

  const handleConnectAndLaunch = async () => {
    if (wallet.isConnected) {
      router.push("/app");
      return;
    }

    if (!wallet.hasInjectedProvider && typeof window !== "undefined" && !(window as any).ethereum) {
      setConnectNotice("No Web3 wallet extension (MetaMask or Rabby) was detected in this browser. You can still explore all live dashboard features and telemetry in Guest Mode!");
      return;
    }

    setConnectNotice(null);
    try {
      await wallet.connectWallet();
    } catch {
      // Handled in wallet hook
    }
  };

  return (
    <main className="min-h-screen bg-[#060911] text-slate-100 font-mono selection:bg-emerald-500/30">
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
                <div className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[11px] flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}</span>
                  {wallet.balanceSTT && (
                    <span className="text-slate-400 font-normal hidden sm:inline">({wallet.balanceSTT} STT)</span>
                  )}
                </div>
                <Link
                  href="/app"
                  className="px-3 py-1 rounded bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all flex items-center space-x-1"
                >
                  <span>LAUNCH APP</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <button
                onClick={handleConnectAndLaunch}
                disabled={wallet.isConnecting}
                className="px-3 py-1.5 rounded bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all flex items-center space-x-1.5 disabled:opacity-60"
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
      <section className="border-b border-slate-800/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative">
          <div className="flex items-center space-x-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-bold">
              Somnia Shannon Testnet &middot; Chain 50312 &middot; Production Verified
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight max-w-3xl">
            Event Contracts expire every 15 minutes.
            <br />
            <span className="text-emerald-400">Your downside risk doesn&apos;t.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 mt-5 max-w-2xl leading-relaxed">
            KasuwaShield turns one non-custodial wallet authorization into an autonomous,
            self-renewing hedge policy on DreamDEX Event Contracts. Governed by deterministic
            quantitative models, our on-chain smart contracts evaluate spot drift every 15 minutes
            and refuse execution the instant parameters breach safety boundaries.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {wallet.isConnected ? (
              <>
                <Link
                  href="/app"
                  className="px-6 py-3 rounded-md bg-emerald-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center space-x-2 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/10"
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
                    <span>SWITCH TO SOMNIA (50312)</span>
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={handleConnectAndLaunch}
                disabled={wallet.isConnecting}
                className="px-6 py-3 rounded-md bg-emerald-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center space-x-2 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-60"
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
              <span>EXPLORE LIVE DASHBOARD AS GUEST</span>
            </Link>

            <Link
              href="/proof"
              className="px-4 py-3 rounded-md text-slate-400 font-bold text-xs flex items-center space-x-1.5 hover:text-emerald-400 transition-colors"
            >
              <span>On-Chain Evidence</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Wallet Error or No Provider Feedback */}
          {wallet.error && (
            <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start space-x-2 max-w-xl">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Wallet Connection: </span>
                <span>{wallet.error}</span>
                <button
                  onClick={handleConnectAndLaunch}
                  className="ml-2 underline hover:text-white font-bold"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {connectNotice && (
            <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start space-x-2 max-w-xl">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p>{connectNotice}</p>
                <div className="mt-2 flex items-center space-x-3 font-bold">
                  <Link href="/app" className="text-emerald-400 hover:underline flex items-center space-x-1">
                    <span>Enter Guest Mode</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-300 hover:underline flex items-center space-x-1"
                  >
                    <span>Install MetaMask</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Gas Faucet Banner */}
          <div className="mt-6 pt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <span>Need gas to test on Somnia Shannon?</span>
            <a
              href="https://testnet.somnia.network/"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center space-x-1 transition-colors"
            >
              <span>Claim free testnet STT from the official Somnia Faucet</span>
              <ExternalLink className="w-3 h-3" />
            </a>
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

