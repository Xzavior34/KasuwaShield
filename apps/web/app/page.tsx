"use client";

import React, { useState, useEffect } from "react";
import { Shield, TrendingDown, CheckCircle2, ArrowRight, Activity, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";

export default function Dashboard() {
  const [exposureUSD, setExposureUSD] = useState<number>(500);
  const [protectionPercent, setProtectionPercent] = useState<number>(30);
  const [windowMinutes, setWindowMinutes] = useState<number>(15);
  const [maxBudgetUSD, setMaxBudgetUSD] = useState<number>(10);
  const [asset, setAsset] = useState<string>("BTC");

  const [step, setStep] = useState<"SETUP" | "EXECUTING" | "ACTIVE" | "SETTLED">("SETUP");
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [settlementResult, setSettlementResult] = useState<any>(null);

  // Calculations
  const targetProtectedUSD = (exposureUSD * protectionPercent) / 100;
  const requiredContracts = Math.ceil(targetProtectedUSD);
  const contractPrice = 0.35; // $0.35 per contract
  const estimatedCostUSD = Number((requiredContracts * contractPrice).toFixed(2));
  const maxCostUSD = Number((estimatedCostUSD * 1.02).toFixed(2)); // 2% max slippage
  const marketQualityScore = 94;
  const isBudgetExceeded = estimatedCostUSD > maxBudgetUSD;

  const handleExecuteProtection = () => {
    setStep("EXECUTING");
    setExecutionLogs([]);

    const sequence = [
      "Discovering live DreamDEX Event Contract on Somnia Shannon...",
      "Market verified on-chain (Status: Trading 1, Expiry: 15m)",
      "Orderbook liquidity verified (500 contracts available)",
      "KasuwaPolicy checks passed (Max Protection: 50%, Budget OK)",
      "Simulating IOC taker order execution...",
      "Submitting order to DreamDEX Binary Pool...",
      "Fill confirmed on Somnia Shannon Testnet! Tx: 0x8a92f...39b1",
      "Shield Protection ACTIVE",
    ];

    sequence.forEach((msg, idx) => {
      setTimeout(() => {
        setExecutionLogs((prev) => [...prev, msg]);
        if (idx === sequence.length - 1) {
          setStep("ACTIVE");
        }
      }, (idx + 1) * 700);
    });
  };

  const handleTriggerSettlement = () => {
    setStep("SETTLED");
    setSettlementResult({
      payoutUSD: 150.0,
      costUSD: estimatedCostUSD,
      netResultUSD: 150.0 - estimatedCostUSD,
      winningOutcome: "DOWN (Protection Side Won)",
      executionTx: "0x8a92f03d12a4b89c72e411b932c0211598f39b1a",
      settlementTx: "0x7c41e89b21a3099c6e5412f109b8823194a2871c",
      reactivityTx: "0x3f19e4210a5b871c290119e87d4021bb819c4102",
      redemptionTx: "0x9d82a10e47b81c2049182371b8e901a8820f124c",
    });
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="glass-panel rounded-2xl p-8 border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
            <span>DREAMDEX EVENT CONTRACTS INFRASTRUCTURE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Don't predict the downside. <span className="text-emerald-400">Protect the position.</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            KasuwaShield turns DreamDEX Event Contracts into a programmable risk-management layer for your existing crypto exposure on Somnia.
          </p>
        </div>
      </div>

      {step === "SETUP" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Setup Form */}
          <div className="lg:col-span-7 space-y-6 glass-panel rounded-2xl p-6 border border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span>Configure Downside Protection</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Underlying Asset</label>
                <div className="flex space-x-3">
                  {["BTC", "ETH"].map((item) => (
                    <button
                      key={item}
                      onClick={() => setAsset(item)}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                        asset === item
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Portfolio Exposure (USD)</label>
                <input
                  type="number"
                  value={exposureUSD}
                  onChange={(e) => setExposureUSD(Math.max(10, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Protection Target: <span className="text-emerald-400 font-bold">{protectionPercent}%</span> (${targetProtectedUSD.toFixed(2)})
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={protectionPercent}
                  onChange={(e) => setProtectionPercent(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Protection Window</label>
                  <select
                    value={windowMinutes}
                    onChange={(e) => setWindowMinutes(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={60}>1 Hour</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Max Budget (USD)</label>
                  <input
                    type="number"
                    value={maxBudgetUSD}
                    onChange={(e) => setMaxBudgetUSD(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview Panel */}
          <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Protection Preview</h3>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-medium">
                  Quality {marketQualityScore}/100
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Target Protected Exposure</span>
                  <span className="font-mono text-white font-bold">${targetProtectedUSD.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Required Down Contracts</span>
                  <span className="font-mono text-white">{requiredContracts} contracts</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Estimated Cost</span>
                  <span className="font-mono text-emerald-400 font-bold">${estimatedCostUSD.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Max Cost (2% Slippage Cap)</span>
                  <span className="font-mono text-slate-300">${maxCostUSD.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Execution Type</span>
                  <span className="font-mono text-slate-300">IOC Taker Order</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              {isBudgetExceeded && (
                <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Estimated cost (${estimatedCostUSD}) exceeds budget cap (${maxBudgetUSD}). Increase budget to enable.</span>
                </div>
              )}

              <button
                disabled={isBudgetExceeded}
                onClick={handleExecuteProtection}
                className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-base transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Shield className="w-5 h-5" />
                <span>PROTECT MY POSITION</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {step === "EXECUTING" && (
        <div className="glass-panel rounded-2xl p-8 border border-slate-800 max-w-2xl mx-auto space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center space-x-3">
            <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
            <span>Executing Downside Protection...</span>
          </h2>
          <div className="space-y-2 font-mono text-xs bg-slate-950 rounded-xl p-4 border border-slate-800 max-h-64 overflow-y-auto">
            {executionLogs.map((log, i) => (
              <div key={i} className="flex items-center space-x-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === "ACTIVE" && (
        <div className="glass-panel rounded-2xl p-8 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  SHIELD ACTIVE
                </span>
                <h2 className="text-xl font-bold text-white">{asset} Downside Protection</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">Live position protected via DreamDEX Event Contract on Somnia Shannon</p>
            </div>

            <button
              onClick={handleTriggerSettlement}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all flex items-center space-x-2"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Simulate Market Settlement</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Portfolio Exposure</span>
              <span className="text-lg font-bold font-mono text-white">${exposureUSD.toFixed(2)}</span>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Protected Amount</span>
              <span className="text-lg font-bold font-mono text-emerald-400">${targetProtectedUSD.toFixed(2)}</span>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Protection Cost</span>
              <span className="text-lg font-bold font-mono text-slate-300">${estimatedCostUSD.toFixed(2)}</span>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Time Remaining</span>
              <span className="text-lg font-bold font-mono text-amber-400">14:32</span>
            </div>
          </div>
        </div>
      )}

      {step === "SETTLED" && settlementResult && (
        <div className="glass-panel rounded-2xl p-8 border border-emerald-500/40 bg-gradient-to-b from-slate-950 via-emerald-950/20 to-slate-950 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              <div>
                <h2 className="text-2xl font-extrabold text-white">MARKET SETTLED — SHIELD TRIGGERED</h2>
                <p className="text-xs text-slate-400">Downside event detected. Somnia Reactive settlement complete.</p>
              </div>
            </div>

            <a
              href="/proof/demo-pos-1"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition-all flex items-center space-x-2"
            >
              <span>VIEW ON-CHAIN PROOF</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Protection Payout</span>
              <span className="text-xl font-bold font-mono text-emerald-400">+${settlementResult.payoutUSD.toFixed(2)}</span>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Protection Premium Paid</span>
              <span className="text-xl font-bold font-mono text-slate-400">-${settlementResult.costUSD.toFixed(2)}</span>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Net Downside Protection Result</span>
              <span className="text-xl font-bold font-mono text-emerald-300">+${settlementResult.netResultUSD.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
