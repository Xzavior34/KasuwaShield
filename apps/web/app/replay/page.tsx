"use client";

import React from "react";
import { AppShell } from "../../components/shell/AppShell";
import { useRiskEngineState } from "../../hooks/useRiskEngineState";
import { RotateCcw, AlertTriangle, Play, Shield, TrendingDown } from "lucide-react";

export default function ReplayPage() {
  const {
    systemState,
    isSimulationRunning,
    triggerMarketStress,
    riskScore,
    currentHedgeCoveragePct,
    protectionGapPct,
  } = useRiskEngineState();

  const exposure = 25000;
  const protectionPct = 0.80;
  const contractCost = 8.33;

  const scenarios = [
    { name: "Flash Crash — Rapid Liquidation Cascade", date: "2026-08-15", dropPct: 12.5, spotBefore: 65200, durationMin: 4, regime: "HIGH_VOL", regimeColor: "bg-amber-500/20 text-amber-400 border-amber-500/40" },
    { name: "Gradual Bleed — Sustained Downward Pressure", date: "2026-08-22", dropPct: 6.8, spotBefore: 64100, durationMin: 45, regime: "MED_VOL", regimeColor: "bg-amber-500/10 text-amber-300 border-amber-500/30" },
    { name: "Volatility Spike — Macro Rate Announcement", date: "2026-08-28", dropPct: 15.2, spotBefore: 63800, durationMin: 2, regime: "EXTREME", regimeColor: "bg-rose-500/20 text-rose-400 border-rose-500/40" },
    { name: "Mean Reversion — Whipsaw Volatility", date: "2026-09-01", dropPct: 9.1, spotBefore: 64500, durationMin: 18, regime: "HIGH_VOL", regimeColor: "bg-amber-500/20 text-amber-400 border-amber-500/40" },
  ];

  return (
    <AppShell
      systemState={systemState}
      isSimulationRunning={isSimulationRunning}
      onTriggerStressTest={triggerMarketStress}
      riskScore={isSimulationRunning ? 98 : riskScore}
      coveragePct={isSimulationRunning ? 58 : currentHedgeCoveragePct}
      protectionGapPct={isSimulationRunning ? 22 : protectionGapPct}
    >
      <div className="space-y-6 max-w-5xl mx-auto font-mono">
        {/* Banner */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between shadow-xl">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              <strong>HISTORICAL REPLAY MODE:</strong> Simulated backtest results over historical market volatility windows. All values mathematically computed from base exposure ($25,000).
            </span>
          </div>
          <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-200 font-mono font-bold">
            DYNAMIC BACKTEST
          </span>
        </div>

        {/* Scenarios List */}
        <div className="space-y-4">
          {scenarios.map((s, idx) => {
            const dollarDrop = (s.spotBefore * s.dropPct) / 100;
            const spotAfter = s.spotBefore - dollarDrop;
            const exposureLoss = (exposure * s.dropPct) / 100;
            const protectedLoss = Math.min(exposureLoss, exposure * (1 - protectionPct));
            const saved = exposureLoss - protectedLoss;
            const rollsNeeded = Math.ceil(s.durationMin / 15) + 1;
            const totalCost = (rollsNeeded * contractCost).toFixed(2);
            const roi = ((saved / parseFloat(totalCost)) * 100).toFixed(0);

            return (
              <div key={idx} className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase">{s.name}</h3>
                    <span className="text-[10px] text-slate-400">{s.date} • {s.durationMin}min duration</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${s.regimeColor}`}>
                    {s.regime}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Price Drop</span>
                    <strong className="text-rose-400 font-bold">-{s.dropPct}%</strong>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Unprotected Loss</span>
                    <strong className="text-rose-400 font-bold">${exposureLoss.toFixed(0)}</strong>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Protected Loss</span>
                    <strong className="text-emerald-400 font-bold">${protectedLoss.toFixed(0)}</strong>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Value Saved</span>
                    <strong className="text-emerald-300 font-bold">${saved.toFixed(0)}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Spot Before</span>
                    <span className="text-slate-300">${s.spotBefore.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Spot After</span>
                    <span className="text-rose-400">${Math.round(spotAfter).toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Auto-Rolls</span>
                    <span className="text-slate-300">{rollsNeeded} × ${contractCost.toFixed(2)}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Protection ROI</span>
                    <strong className="text-emerald-400">{roi}×</strong>
                  </div>
                </div>

                <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                  <span>Agent Reaction Time: <strong className="text-emerald-400">133ms</strong></span>
                  <span>Total Hedge Cost: <strong className="text-amber-300">${totalCost}</strong></span>
                  <span>User Wallet Popups: <strong className="text-emerald-400">0</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
