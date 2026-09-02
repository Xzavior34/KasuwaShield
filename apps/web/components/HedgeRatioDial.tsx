"use client";

import React from "react";
import { ShieldCheck, AlertCircle } from "lucide-react";

interface HedgeRatioDialProps {
  targetCoveragePct: number;
  currentCoveragePct: number;
  protectionGapPct: number;
}

export function HedgeRatioDial({
  targetCoveragePct,
  currentCoveragePct,
  protectionGapPct,
}: HedgeRatioDialProps) {
  let stateColor = "stroke-emerald-400 text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  let statusText = "Protection Sufficient";

  if (currentCoveragePct < 60) {
    stateColor = "stroke-rose-500 text-rose-400 bg-rose-500/10 border-rose-500/30 animate-pulse";
    statusText = "⚠ HEDGE REQUIRED";
  } else if (currentCoveragePct < targetCoveragePct) {
    stateColor = "stroke-amber-400 text-amber-400 bg-amber-500/10 border-amber-500/30";
    statusText = "Protection Approaching Expiry";
  }

  // SVG Ring Calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentCoveragePct / 100) * circumference;

  return (
    <div className="bg-[#0b101d] rounded-xl p-5 border border-slate-800 space-y-4 shadow-xl font-mono flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <h3 className="text-xs font-extrabold uppercase text-white tracking-wider flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>HEDGE COVERAGE RATIO</span>
        </h3>
        <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${stateColor}`}>
          ● {statusText}
        </span>
      </div>

      {/* Center Dial SVG */}
      <div className="flex flex-col items-center justify-center py-2 relative">
        <svg className="w-36 h-36 transform -rotate-90">
          {/* Background Ring */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Active Ring */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            className={`transition-all duration-700 ease-out ${
              currentCoveragePct < 60
                ? "stroke-rose-500"
                : currentCoveragePct < targetCoveragePct
                ? "stroke-amber-400"
                : "stroke-emerald-400"
            }`}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Dial Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-white tracking-tight">
            {currentCoveragePct.toFixed(1)}%
          </span>
          <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
            HEDGE COVERAGE
          </span>
        </div>
      </div>

      {/* Target vs Current Breakdown & Protection Gap */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
        <div>
          <span className="text-slate-400 text-[10px] uppercase block">Target</span>
          <span className="font-bold text-white">{targetCoveragePct}%</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase block">Current</span>
          <span className="font-bold text-emerald-400">{currentCoveragePct.toFixed(1)}%</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase block">Protection Gap</span>
          <span className={`font-bold ${protectionGapPct > 0 ? "text-rose-400" : "text-emerald-400"}`}>
            {protectionGapPct.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
