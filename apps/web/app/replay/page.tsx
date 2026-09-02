"use client";

import React from "react";
import { AppShell } from "../../components/AppShell";
import { Play, RotateCcw, AlertCircle, TrendingDown, CheckCircle2 } from "lucide-react";
import { useRiskEngineState } from "../../hooks/useRiskEngineState";

export default function ReplayPage() {
  const { systemState, isSimulationRunning, triggerMarketStress, riskScore, currentHedgeCoveragePct, protectionGapPct } = useRiskEngineState();

  const mockHistoricalEvents = [
    {
      date: "2026-08-28 14:15 UTC",
      asset: "BTC",
      move: "-2.4% Drop in 15m",
      exposure: "$25,000",
      protectionPercent: "80%",
      premiumCost: "$70.00",
      payout: "$20,000.00",
      netSaved: "+$19,930.00",
    },
    {
      date: "2026-08-25 09:30 UTC",
      asset: "ETH",
      move: "-4.1% Drop in 1h",
      exposure: "$10,000",
      protectionPercent: "80%",
      premiumCost: "$32.00",
      payout: "$8,000.00",
      netSaved: "+$7,968.00",
    },
    {
      date: "2026-08-20 18:00 UTC",
      asset: "BTC",
      move: "+1.2% Gain in 15m",
      exposure: "$25,000",
      protectionPercent: "80%",
      premiumCost: "$70.00",
      payout: "$0.00",
      netSaved: "-$70.00 (Spot Position Gained)",
    },
  ];

  return (
    <AppShell
      systemState={systemState}
      isSimulationRunning={isSimulationRunning}
      onTriggerStressTest={triggerMarketStress}
      riskScore={riskScore}
      coveragePct={currentHedgeCoveragePct}
      protectionGapPct={protectionGapPct}
    >
      <div className="space-y-8 max-w-5xl mx-auto font-mono">
        {/* Simulation Banner */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between shadow-xl">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              <strong>HISTORICAL REPLAY MODE:</strong> Simulated backtest results over historical market volatility windows. Clearly distinguished from live testnet execution.
            </span>
          </div>
          <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-200 font-mono font-bold">
            SIMULATION
          </span>
        </div>

        <div className="bg-[#0b101d] rounded-xl p-6 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center space-x-2">
                <RotateCcw className="w-5 h-5 text-emerald-400" />
                <span>Historical Strategy Replay</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Evaluate KasuwaShield protection performance during high-volatility event windows.</p>
            </div>

            <button
              onClick={triggerMarketStress}
              disabled={isSimulationRunning}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isSimulationRunning ? "SIMULATING..." : "Run Scenario Simulation"}</span>
            </button>
          </div>

          <div className="space-y-4">
            {mockHistoricalEvents.map((item, index) => (
              <div key={index} className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {item.asset}
                    </span>
                    <span className="text-xs text-slate-400">{item.date}</span>
                  </div>
                  <span className="text-xs font-bold text-rose-400">{item.move}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Exposure</span>
                    <span className="text-white font-bold">{item.exposure} ({item.protectionPercent})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Protection Premium</span>
                    <span className="text-slate-300">{item.premiumCost}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Event Payout</span>
                    <span className="text-emerald-400 font-bold">{item.payout}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Net Result</span>
                    <span className="text-emerald-300 font-bold">{item.netSaved}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
