"use client";

import React, { useState } from "react";
import { Calculator, ChevronDown, ChevronUp, HelpCircle, ShieldAlert } from "lucide-react";

interface RiskMathPanelProps {
  portfolioExposureUSD: number;
  downsideThresholdPct: number;
  protectedNotionalUSD: number;
  currentHedgeCoveragePct: number;
  riskDeltaUSD: number;
  priceDropPct: number;
  riskScore: number;
}

export function RiskMathPanel({
  portfolioExposureUSD,
  downsideThresholdPct,
  protectedNotionalUSD,
  currentHedgeCoveragePct,
  riskDeltaUSD,
  priceDropPct,
  riskScore,
}: RiskMathPanelProps) {
  const [isWhyExpanded, setIsWhyExpanded] = useState<boolean>(false);

  const maxToleratedDownsideUSD = (portfolioExposureUSD * downsideThresholdPct) / 100;
  const isHedgeRequired = riskScore > 60 || priceDropPct >= downsideThresholdPct;

  return (
    <div className="bg-[#0b101d] rounded-xl p-5 border border-slate-800 space-y-4 shadow-xl font-mono">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <Calculator className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-extrabold uppercase text-white tracking-wider">
            RISK CALCULATION FORMULAS
          </h3>
        </div>
        <span className="text-xs text-slate-400">DETERMINISTIC EVALUATION</span>
      </div>

      {/* Math Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-400 block text-[11px] uppercase">Portfolio Exposure</span>
          <span className="text-sm font-bold text-white">${portfolioExposureUSD.toLocaleString()}</span>
        </div>

        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-400 block text-[11px] uppercase">Downside Threshold</span>
          <span className="text-sm font-bold text-rose-400">-{downsideThresholdPct.toFixed(1)}% (${maxToleratedDownsideUSD.toLocaleString()})</span>
        </div>

        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-400 block text-[11px] uppercase">Protected Notional</span>
          <span className="text-sm font-bold text-emerald-400">${protectedNotionalUSD.toLocaleString()}</span>
        </div>

        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-400 block text-[11px] uppercase">Current Hedge Ratio</span>
          <span className="text-sm font-bold text-emerald-300">{currentHedgeCoveragePct.toFixed(1)}%</span>
        </div>
      </div>

      {/* Formula Display Box */}
      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 uppercase text-[11px]">Formula: Risk Delta (ΔR)</span>
          <span className="text-emerald-400 font-bold">ΔP - (Threshold × Exposure)</span>
        </div>
        <div className="flex items-center justify-between text-sm pt-1 border-t border-slate-900">
          <span className="text-slate-300 text-xs">Calculated Risk Delta:</span>
          <span className={`font-bold ${riskDeltaUSD > 0 ? "text-rose-400" : "text-emerald-400"}`}>
            {riskDeltaUSD > 0 ? `+$${riskDeltaUSD.toLocaleString()} (BREACH)` : `$${riskDeltaUSD.toLocaleString()} (SAFE)`}
          </span>
        </div>
      </div>

      {/* Expandable Section: WHY THIS HEDGE? */}
      <div className="border border-slate-800/80 rounded-lg overflow-hidden bg-slate-900/50">
        <button
          onClick={() => setIsWhyExpanded(!isWhyExpanded)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-slate-300 hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>WHY THIS HEDGE? (DECISION ENGINE LOGIC)</span>
          </div>
          {isWhyExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {isWhyExpanded && (
          <div className="p-4 border-t border-slate-800/80 text-xs space-y-2.5 bg-slate-950/80 text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">Total Portfolio Exposure:</span>
              <span className="text-white font-bold">${portfolioExposureUSD.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">Maximum Tolerated Downside (-8.0%):</span>
              <span className="text-rose-400 font-bold">${maxToleratedDownsideUSD.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">Target Protection Required:</span>
              <span className="text-emerald-400 font-bold">${protectedNotionalUSD.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">Current Protection Coverage:</span>
              <span className="text-emerald-300 font-bold">{currentHedgeCoveragePct.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between py-1 pt-2">
              <span className="text-slate-300 font-bold">Autonomous Risk Decision:</span>
              <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                isHedgeRequired
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              }`}>
                {isHedgeRequired ? "HEDGE REQUIRED (AUTO-ROLL DISPATCHED)" : "MAINTAIN COVERAGE (ACTIVE)"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
