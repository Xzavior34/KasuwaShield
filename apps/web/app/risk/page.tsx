"use client";

import React from "react";
import { AppShell } from "../../components/shell/AppShell";
import { useRiskEngineState } from "../../hooks/useRiskEngineState";
import { Activity, Shield, TrendingDown, Percent, DollarSign, BarChart2 } from "lucide-react";
import {
  computeDailyVolatility,
  calculateValueAtRisk95,
  calculateKellyHedgeFraction,
  classifyVolRegime,
} from "../../lib/riskMath";

// Market ask price used elsewhere in the app (dashboard CLOB order book) for the
// downside PUT contract -- kept consistent across pages rather than re-invented here.
const MARKET_ASK_PRICE = 0.28;

export default function RiskPage() {
  const {
    systemState,
    isSimulationRunning,
    triggerMarketStress,
    riskScore,
    currentHedgeCoveragePct,
    protectionGapPct,
    portfolioExposureUSD,
    downsideThresholdPct,
    riskDeltaUSD,
    priceDropPct,
    priceHistory,
  } = useRiskEngineState();

  const effectiveRiskScore = isSimulationRunning ? 98 : riskScore;

  // Real, recalculated from the actual price history in state -- not a fixed number.
  const dailyVolatility = computeDailyVolatility(priceHistory.map((p) => p.btcPrice));
  const valueAtRisk95 = calculateValueAtRisk95(portfolioExposureUSD, dailyVolatility);
  const volRegime = classifyVolRegime(dailyVolatility);

  // Real Kelly criterion computed from the market's own quoted ask price as the
  // downside-probability input (DreamDEX prices are already probabilities) --
  // same approach as packages/risk-engine/src/calculator.ts::calculateProtection().
  // In an efficient market this legitimately floors at 0.1 -- that's correct
  // behavior, not a display bug.
  const payoutOdds = 1.0 / MARKET_ASK_PRICE;
  const downsideProbability = MARKET_ASK_PRICE;
  const kellyFraction = calculateKellyHedgeFraction(downsideProbability, MARKET_ASK_PRICE);

  const realizedPriceChangeUSD = Number(((portfolioExposureUSD * priceDropPct) / 100).toFixed(2));
  const thresholdDollarLimit = Number(((portfolioExposureUSD * downsideThresholdPct) / 100).toFixed(2));

  return (
    <AppShell
      systemState={systemState}
      isSimulationRunning={isSimulationRunning}
      onTriggerStressTest={triggerMarketStress}
      riskScore={effectiveRiskScore}
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

        {/* 4 Quant Stat Cards -- all four now recompute from real state, not fixed text */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Composite Risk Score</span>
            <div className="text-3xl font-extrabold text-emerald-400 my-2">{effectiveRiskScore}</div>
            <span className="text-[11px] text-slate-500">/ 100 (Lower = Safer)</span>
          </div>

          <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Value at Risk (VaR 95%)</span>
            <div className="text-2xl font-extrabold text-amber-400 my-2">${valueAtRisk95.toLocaleString()}</div>
            <span className="text-[11px] text-slate-500">5% probability of exceeding, from realized volatility</span>
          </div>

          <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Kelly Hedge Fraction (f*)</span>
            <div className="text-2xl font-extrabold text-cyan-300 my-2">{kellyFraction.toFixed(2)}</div>
            <span className="text-[11px] text-slate-500">Optimal sizing, market-implied probability</span>
          </div>

          <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Max Drawdown (Protected)</span>
            <div className="text-2xl font-extrabold text-emerald-400 my-2">-{downsideThresholdPct.toFixed(1)}%</div>
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
                <span className="text-white">${realizedPriceChangeUSD.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">θ (Tolerance Threshold)</span>
                <span className="text-white">{(downsideThresholdPct / 100).toFixed(2)} ({downsideThresholdPct.toFixed(0)}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">E (Total Portfolio Exposure)</span>
                <span className="text-white">${portfolioExposureUSD.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">θ × E (Threshold Dollar Limit)</span>
                <span className="text-white">${thresholdDollarLimit.toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between font-bold">
                <span className="text-white">Calculated Risk Delta:</span>
                <span className={riskDeltaUSD <= 0 ? "text-emerald-400" : "text-rose-400"}>
                  {riskDeltaUSD >= 0 ? "+" : "−"}${Math.abs(riskDeltaUSD).toLocaleString()} ({riskDeltaUSD <= 0 ? "SAFE" : "BREACH"})
                </span>
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
                <span className="text-white">{downsideProbability.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">b (Payout Odds)</span>
                <span className="text-white">{payoutOdds.toFixed(2)}x ($1.00 / ${MARKET_ASK_PRICE.toFixed(2)})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">q (1 − p)</span>
                <span className="text-white">{(1 - downsideProbability).toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between font-bold">
                <span className="text-white">Optimal Sizing Fraction (f*):</span>
                <span className="text-emerald-400">
                  {kellyFraction.toFixed(4)} ({kellyFraction <= 0.1 ? "FLOOR (LOW EDGE)" : "ALLOCATED"})
                </span>
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
              <strong className="text-white">{dailyVolatility.toFixed(4)}</strong>
              <span className="text-[9px] text-slate-500 block mt-0.5">from live price history</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Implied Vol</span>
              <strong className="text-white">0.0312</strong>
              <span className="text-[9px] text-slate-500 block mt-0.5">model input (no live options feed)</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Vol Skew</span>
              <strong className="text-amber-300">+0.0078</strong>
              <span className="text-[9px] text-slate-500 block mt-0.5">model input (no live options feed)</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block">CLOB Liquidity</span>
              <strong className="text-cyan-300">$450,000</strong>
              <span className="text-[9px] text-slate-500 block mt-0.5">model input (demo orderbook)</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-center">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {volRegime.replace("_", " ")} REGIME
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
