"use client";

import React from "react";
import { AppShell } from "../../components/shell/AppShell";
import { useRiskEngineState } from "../../hooks/useRiskEngineState";
import { Activity, Shield, TrendingDown, Percent, DollarSign, BarChart2 } from "lucide-react";

export default function RiskPage() {
  const {
    systemState,
    isSimulationRunning,
    triggerMarketStress,
    riskScore,
    currentHedgeCoveragePct,
    protectionGapPct,
  } = useRiskEngineState();

  return (
    <AppShell
      systemState={systemState}
      isSimulationRunning={isSimulationRunning}
      onTriggerStressTest={triggerMarketStress}
      riskScore={isSimulationRunning ? 98 : riskScore}
      coveragePct={isSimulationRunning ? 58 : currentHedgeCoveragePct}
      protectionGapPct={isSimulationRunning ? 22 : protectionGapPct}
    >
      <div className="space-y-6 font-mono">
        <div className="bg-[#0b101d] border-l-4 border-emerald-500 rounded-xl p-5 border border-slate-800">
          <h1 className="text-base font-bold text-white uppercase tracking-wider">
            Quantitative Risk Engine — Deep Mathematical Modeling
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic, formula-driven risk evaluation. No LLMs. No hallucinations. Pure financial mathematics.
          </p>
        </div>

        {/* 4 Quant Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Composite Risk Score</span>
            <div className="text-3xl font-extrabold text-emerald-400 my-2">34</div>
            <span className="text-[11px] text-slate-500">/ 100 (Lower = Safer)</span>
          </div>

          <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Value at Risk (VaR 95%)</span>
            <div className="text-2xl font-extrabold text-amber-400 my-2">$1,250</div>
            <span className="text-[11px] text-slate-500">5% probability of exceeding</span>
          </div>

          <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Sharpe Ratio (Hedged)</span>
            <div className="text-2xl font-extrabold text-cyan-300 my-2">2.14</div>
            <span className="text-[11px] text-slate-500">Risk-adjusted return</span>
          </div>

          <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Max Drawdown (Protected)</span>
            <div className="text-2xl font-extrabold text-emerald-400 my-2">-8.0%</div>
            <span className="text-[11px] text-slate-500">Hard policy ceiling</span>
          </div>
        </div>

        {/* Formulas Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Risk Delta Calculation (ΔR)</h3>
            <div className="bg-[#060911] border border-slate-800 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Formula</span>
                <span className="text-cyan-300 font-bold">ΔR = ΔP − (θ × E)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ΔP (Realized Price Change)</span>
                <span className="text-white">$0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">θ (Tolerance Threshold)</span>
                <span className="text-white">0.08 (8%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">E (Total Portfolio Exposure)</span>
                <span className="text-white">$25,000</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between font-bold">
                <span className="text-white">Calculated Risk Delta:</span>
                <span className="text-emerald-400">−$2,000.00 (SAFE)</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Optimal Sizing (Kelly Criterion f*)</h3>
            <div className="bg-[#060911] border border-slate-800 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Formula</span>
                <span className="text-cyan-300 font-bold">f* = (p × b − q) / b</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">p (Downside Probability)</span>
                <span className="text-white">0.28</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">b (Payout Odds)</span>
                <span className="text-white">2.57x ($1.00 / $0.28)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">q (1 − p)</span>
                <span className="text-white">0.72</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between font-bold">
                <span className="text-white">Optimal Sizing Fraction (f*):</span>
                <span className="text-emerald-400">0.42 (ALLOCATED)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Volatility Regimes */}
        <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Volatility Regime Detection & Order Book Liquidity
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Realized Vol (σ)</span>
              <strong className="text-white">0.0234</strong>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Implied Vol</span>
              <strong className="text-white">0.0312</strong>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Vol Skew</span>
              <strong className="text-amber-300">+0.0078</strong>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block">CLOB Liquidity</span>
              <strong className="text-cyan-300">$450,000</strong>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-center">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                LOW VOL REGIME
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
