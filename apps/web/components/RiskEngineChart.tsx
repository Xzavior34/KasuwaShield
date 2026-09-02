"use client";

import React, { useState, useEffect } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";
import { TrendingDown, Shield, Activity, BarChart2 } from "lucide-react";
import { PricePoint, SystemState } from "../hooks/useRiskEngineState";

interface RiskEngineChartProps {
  priceHistory: PricePoint[];
  currentBtcPrice: number;
  currentEthPrice: number;
  systemState: SystemState;
}

export function RiskEngineChart({
  priceHistory,
  currentBtcPrice,
  currentEthPrice,
  systemState,
}: RiskEngineChartProps) {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const strikeThresholdPrice = 64000;
  const isBreached = currentBtcPrice < strikeThresholdPrice;

  return (
    <div className="bg-[#0b101d] rounded-xl p-5 border border-slate-800 space-y-4 shadow-xl font-mono">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-extrabold tracking-wider uppercase text-white">
              DETERMINISTIC RISK ENGINE
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Mathematical downside protection • Deterministic spot price vs. strike threshold evaluation
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
            <span className="text-slate-300">BTC Spot:</span>
            <span className={`font-bold ${isBreached ? "text-rose-400" : "text-emerald-400"}`}>
              ${currentBtcPrice.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
            <span className="text-slate-300">ETH Spot:</span>
            <span className="font-bold text-cyan-300">${currentEthPrice.toLocaleString()}</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
            <span className="text-slate-300">Trigger Threshold:</span>
            <span className="font-bold text-rose-400">${strikeThresholdPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Recharts Chart Area */}
      <div className="h-72 w-full pt-2 min-h-[288px]">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceHistory} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="btcGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="ethGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="timestamp"
                stroke="#64748b"
                fontSize={11}
                fontFamily="monospace"
                tickLine={false}
              />
              <YAxis
                domain={["dataMin - 1000", "dataMax + 1000"]}
                stroke="#64748b"
                fontSize={11}
                fontFamily="monospace"
                tickFormatter={(val) => `$${val}`}
                orientation="right"
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontFamily: "monospace",
                  color: "#f8fafc",
                }}
              />

              <ReferenceLine
                y={strikeThresholdPrice}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{
                  value: "HEDGE THRESHOLD STRIKE ($64,000)",
                  fill: "#ef4444",
                  fontSize: 10,
                  position: "insideTopRight",
                  fontFamily: "monospace",
                }}
              />

              <Area
                type="monotone"
                dataKey="btcPrice"
                name="BTC Spot Price ($)"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#btcGrad)"
              />

              <Area
                type="monotone"
                dataKey="hedgePrice"
                name="Hedge Protection Strike ($)"
                stroke="#6366f1"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                fillOpacity={0}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-slate-500 text-xs">
            <span>LOADING QUANT RISK CHART...</span>
          </div>
        )}
      </div>

      {/* Legend & Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between text-xs bg-slate-900/90 p-3 rounded-lg border border-slate-800 text-slate-400">
        <div>
          <span>PORTFOLIO EXPOSURE: <strong className="text-white">$25,000 USD (BTC + ETH)</strong></span>
        </div>
        <div>
          <span>DOWNSIDE TRIGGER: <strong className="text-rose-400">-8.0% ($64,000 BTC)</strong></span>
        </div>
        <div>
          <span>DREAMDEX HEDGE POSITION: <strong className="text-emerald-400">$20,000 NOTIONAL (80%)</strong></span>
        </div>
      </div>
    </div>
  );
}
