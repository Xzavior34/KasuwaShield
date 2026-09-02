"use client";

import React, { useState } from "react";
import { AppShell } from "../../components/shell/AppShell";
import { useRiskEngineState } from "../../hooks/useRiskEngineState";
import { RotateCcw, AlertTriangle, Play, Shield, TrendingDown, Sliders, CheckCircle2, RefreshCw } from "lucide-react";

export default function ReplayPage() {
  const {
    systemState,
    isSimulationRunning,
    triggerMarketStress,
    riskScore,
    currentHedgeCoveragePct,
    protectionGapPct,
  } = useRiskEngineState();

  // Dynamic interactive user parameters
  const [exposure, setExposure] = useState(25000);
  const [coveragePct, setCoveragePct] = useState(80);
  const [contractCost, setContractCost] = useState(0.28);
  const [activePlayback, setActivePlayback] = useState<number | null>(null);
  const [playbackStep, setPlaybackStep] = useState(0);

  const scenarios = [
    {
      id: 0,
      name: "Flash Crash — Rapid Liquidation Cascade",
      date: "2026-08-15",
      dropPct: 12.5,
      spotBefore: 65200,
      durationMin: 4,
      regime: "HIGH_VOL",
      regimeColor: "bg-amber-500/20 text-amber-400 border-amber-500/40",
      description: "Sudden spot decline triggered by cascading futures liquidations. KasuwaShield detects breach in 133ms.",
    },
    {
      id: 1,
      name: "Gradual Bleed — Sustained Downward Pressure",
      date: "2026-08-22",
      dropPct: 6.8,
      spotBefore: 64100,
      durationMin: 45,
      regime: "MED_VOL",
      regimeColor: "bg-amber-500/10 text-amber-300 border-amber-500/30",
      description: "Multi-hour downward drift across 3 consecutive 15-minute event windows, testing autonomous auto-rolling.",
    },
    {
      id: 2,
      name: "Volatility Spike — Macro Rate Announcement",
      date: "2026-08-28",
      dropPct: 15.2,
      spotBefore: 63800,
      durationMin: 2,
      regime: "EXTREME",
      regimeColor: "bg-rose-500/20 text-rose-400 border-rose-500/40",
      description: "High-velocity macroeconomic volatility gap. Binary event contracts settle at $1.00 payout.",
    },
    {
      id: 3,
      name: "Mean Reversion — Whipsaw Volatility",
      date: "2026-09-01",
      dropPct: 9.1,
      spotBefore: 64500,
      durationMin: 18,
      regime: "HIGH_VOL",
      regimeColor: "bg-amber-500/20 text-amber-400 border-amber-500/40",
      description: "Aggressive downside dump followed by sharp recovery. Demonstrates non-custodial budget conservation.",
    },
  ];

  const runScenarioPlayback = (scenarioId: number) => {
    setActivePlayback(scenarioId);
    setPlaybackStep(1);

    setTimeout(() => setPlaybackStep(2), 1000);
    setTimeout(() => setPlaybackStep(3), 2200);
    setTimeout(() => {
      setPlaybackStep(4);
      setTimeout(() => setActivePlayback(null), 3500);
    }, 3400);
  };

  return (
    <AppShell
      systemState={systemState}
      isSimulationRunning={isSimulationRunning}
      onTriggerStressTest={triggerMarketStress}
      riskScore={isSimulationRunning ? 98 : riskScore}
      coveragePct={isSimulationRunning ? 58 : currentHedgeCoveragePct}
      protectionGapPct={isSimulationRunning ? 22 : protectionGapPct}
      portfolioValue={exposure}
      protectedValue={Math.round((exposure * coveragePct) / 100)}
    >
      <div className="space-y-5 max-w-5xl mx-auto font-mono">
        {/* Dynamic Parameter Sandbox Panel */}
        <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-2.5 gap-1">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Dynamic Backtest & Replay Parameter Engine
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold self-start sm:self-auto">
              REAL-TIME MATHEMATICAL EVALUATION
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Exposure Slider */}
            <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400 text-[11px]">Portfolio Exposure:</span>
                <strong className="text-white">${exposure.toLocaleString()}</strong>
              </div>
              <input
                type="range"
                min="1000"
                max="100000"
                step="1000"
                value={exposure}
                onChange={(e) => setExposure(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Coverage Target Slider */}
            <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400 text-[11px]">Target Protection:</span>
                <strong className="text-emerald-400">{coveragePct}%</strong>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={coveragePct}
                onChange={(e) => setCoveragePct(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Binary Contract Cost Slider */}
            <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400 text-[11px]">Contract Ask Price:</span>
                <strong className="text-amber-300">${contractCost.toFixed(2)} USD</strong>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.80"
                step="0.01"
                value={contractCost}
                onChange={(e) => setContractCost(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Scenarios Grid */}
        <div className="space-y-4">
          {scenarios.map((s) => {
            const dollarDrop = (s.spotBefore * s.dropPct) / 100;
            const spotAfter = s.spotBefore - dollarDrop;
            const exposureLoss = (exposure * s.dropPct) / 100;
            const targetProtectionNotional = (exposure * coveragePct) / 100;
            const protectedLoss = Math.max(0, exposureLoss - targetProtectionNotional * (s.dropPct / 100));
            const valueSaved = exposureLoss - protectedLoss;
            const rollsNeeded = Math.ceil(s.durationMin / 15) + 1;
            const totalRollCost = rollsNeeded * (targetProtectionNotional * 0.0028 * (contractCost / 0.28));
            const netBenefit = valueSaved - totalRollCost;
            const roi = totalRollCost > 0 ? (valueSaved / totalRollCost).toFixed(1) : "0.0";
            const isPlaying = activePlayback === s.id;

            return (
              <div
                key={s.id}
                className={`bg-[#0b101d] border rounded-xl p-4 sm:p-5 space-y-3 transition-all ${
                  isPlaying ? "border-emerald-500 shadow-xl shadow-emerald-950/40 ring-1 ring-emerald-500/50" : "border-slate-800"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-2.5 gap-2">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white uppercase">{s.name}</h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">{s.description}</p>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${s.regimeColor}`}>
                      {s.regime}
                    </span>
                    <button
                      onClick={() => runScenarioPlayback(s.id)}
                      disabled={isPlaying}
                      className={`px-3 py-1.5 rounded font-bold text-xs flex items-center space-x-1.5 transition-all ${
                        isPlaying
                          ? "bg-emerald-500 text-slate-950 animate-pulse"
                          : "bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
                      }`}
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{isPlaying ? "SIMULATING STEP..." : "RUN PLAYBACK"}</span>
                    </button>
                  </div>
                </div>

                {/* Animated Playback Tracker Strip if Playing */}
                {isPlaying && (
                  <div className="bg-slate-900/90 border border-emerald-500/40 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">PLAYBACK STATUS:</span>
                      <strong className="text-emerald-400">
                        {playbackStep === 1 && "STAGE 1: Spot Price Drop Detected (-" + s.dropPct + "%)"}
                        {playbackStep === 2 && "STAGE 2: Strike Threshold Breached • Evaluating Risk Delta"}
                        {playbackStep === 3 && "STAGE 3: EIP-7702 Auto-Roll Executed • Filled at $" + contractCost.toFixed(2)}
                        {playbackStep === 4 && "STAGE 4: Event Settled at $1.00 • $" + valueSaved.toFixed(0) + " Recovered"}
                      </strong>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full transition-all duration-700"
                        style={{ width: `${(playbackStep / 4) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Real-Time Computed Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-center text-xs">
                  <div className="bg-slate-900 p-2 sm:p-2.5 rounded border border-slate-800">
                    <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase">Price Decline</span>
                    <strong className="text-rose-400 text-xs sm:text-sm font-bold">-{s.dropPct}%</strong>
                  </div>
                  <div className="bg-slate-900 p-2 sm:p-2.5 rounded border border-slate-800">
                    <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase">Unprotected Loss</span>
                    <strong className="text-rose-400 text-xs sm:text-sm font-bold">${exposureLoss.toFixed(0)}</strong>
                  </div>
                  <div className="bg-slate-900 p-2 sm:p-2.5 rounded border border-slate-800">
                    <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase">Protected Loss</span>
                    <strong className="text-emerald-400 text-xs sm:text-sm font-bold">${protectedLoss.toFixed(0)}</strong>
                  </div>
                  <div className="bg-slate-900 p-2 sm:p-2.5 rounded border border-slate-800">
                    <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase">Value Saved</span>
                    <strong className="text-emerald-300 text-xs sm:text-sm font-bold">${valueSaved.toFixed(0)}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-center text-xs">
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase">Spot Change</span>
                    <span className="text-slate-300 text-[11px] sm:text-xs">
                      ${s.spotBefore.toLocaleString()} → <strong className="text-rose-400">${Math.round(spotAfter).toLocaleString()}</strong>
                    </span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase">Auto-Rolls Required</span>
                    <span className="text-slate-300 text-[11px] sm:text-xs">{rollsNeeded} × 15m Windows</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase">Total Roll Cost</span>
                    <span className="text-amber-300 font-bold text-[11px] sm:text-xs">${totalRollCost.toFixed(2)} USD</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase">Protection ROI</span>
                    <strong className="text-emerald-400 font-bold text-[11px] sm:text-xs">{roi}×</strong>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[10px] sm:text-[11px] text-slate-400 pt-1 gap-1 border-t border-slate-800/60">
                  <span>Net Capital Preserved: <strong className="text-emerald-400">${netBenefit.toFixed(0)} USD</strong></span>
                  <span>Autonomous Auto-Roll Reaction: <strong className="text-cyan-300">133ms (0 Popups)</strong></span>
                  <span>Settlement Venue: <strong className="text-white">DreamDEX CLOB</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
