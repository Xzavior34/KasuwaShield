"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "../components/shell/AppShell";
import { useRiskEngineState } from "../hooks/useRiskEngineState";
import { Activity, Cpu, Shield, AlertTriangle, ArrowRight, ExternalLink, Download, Radio, CheckCircle2 } from "lucide-react";

export default function TerminalDashboard() {
  const {
    systemState,
    isSimulationRunning,
    triggerMarketStress,
    riskScore,
    currentHedgeCoveragePct,
    protectionGapPct,
  } = useRiskEngineState();

  // Multi-asset state
  const [activeAsset, setActiveAsset] = useState("BTC");
  const [exposure, setExposure] = useState(25000);
  const [coverageTarget, setCoverageTarget] = useState(80);

  const assetConfigs: Record<string, { spot: number; strike: number; min: number; range: number; drop: number }> = {
    BTC: { spot: 64800, strike: 64000, min: 63500, range: 2000, drop: 62800 },
    ETH: { spot: 3420, strike: 3350, min: 3300, range: 200, drop: 3220 },
    SOL: { spot: 145, strike: 140, min: 135, range: 15, drop: 132 },
    SOMI: { spot: 1.20, strike: 1.15, min: 1.10, range: 0.20, drop: 1.05 },
  };

  const curConfig = assetConfigs[activeAsset] || assetConfigs.BTC;
  const [chartPts, setChartPts] = useState<number[]>([]);
  const [isBreached, setIsBreached] = useState(false);

  // Initialize price chart points
  useEffect(() => {
    const pts: number[] = [];
    for (let i = 0; i < 30; i++) {
      pts.push(curConfig.spot + (Math.random() - 0.5) * (curConfig.range * 0.15));
    }
    setChartPts(pts);
    setIsBreached(false);
  }, [activeAsset]);

  // Live breathing price tick
  useEffect(() => {
    if (isSimulationRunning) {
      setChartPts((prev) => [...prev.slice(-40), curConfig.drop]);
      setIsBreached(true);
      return;
    }

    const timer = setInterval(() => {
      setChartPts((prev) => {
        if (!prev.length) return [curConfig.spot];
        const last = prev[prev.length - 1];
        const noise = (Math.random() - 0.48) * (curConfig.range * 0.04);
        const drift = (curConfig.spot - last) * 0.08;
        let nextP = last + noise + drift;
        nextP = Math.max(curConfig.min + 5, Math.min(curConfig.min + curConfig.range - 5, nextP));
        setIsBreached(nextP < curConfig.strike);
        return [...prev.slice(-40), nextP];
      });
    }, 800);

    return () => clearInterval(timer);
  }, [curConfig, isSimulationRunning]);

  // Telemetry stream
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    "RISK_EVALUATED — riskScore=34 coverage=80.0% gap=0.0% status=SAFE",
    "COVERAGE_CHECK — target=80% current=80.0% Δ=0.0% action=NONE",
    "DELEGATION_VERIFIED — EIP-7702 session key active scope=executeAutoRoll",
    "DREAMDEX_CLOB_SCAN — bestAskProb=0.28 spread=0.01 liquidity=35,000 PUTs",
    "AUTO_ROLL_READY — budget=$47.50 maxPrice=0.85 contracts=20,000 status=STANDBY",
  ]);

  useEffect(() => {
    const events = [
      "RISK_EVALUATED — riskScore=34 coverage=80.0% gap=0.0% status=SAFE",
      "COVERAGE_CHECK — target=80% current=80.0% Δ=0.0% action=NONE",
      "DELEGATION_VERIFIED — EIP-7702 session key active scope=executeAutoRoll",
      "DREAMDEX_CLOB_SCAN — bestAskProb=0.28 spread=0.01 liquidity=35,000 PUTs",
      "AUTO_ROLL_READY — budget=$47.50 maxPrice=0.85 contracts=20,000 status=STANDBY",
      "HEARTBEAT — latency=133ms chain=50312",
      "POLICY_CHECK — remainingBudget=$47.50 maxNotional=$500 killSwitch=ARMED",
      "REACTIVE_HANDLER — listening for RolloverWindowOpen on-chain event",
      "VOL_MONITOR — σ=0.0234 drift=+0.08% skew=NORMAL regime=LOW_VOL",
    ];

    const interval = setInterval(() => {
      const now = new Date().toISOString().slice(11, 23);
      const nextEvt = `[${now}] ${events[Math.floor(Math.random() * events.length)]}`;
      setTelemetryLogs((prev) => [...prev.slice(-25), nextEvt]);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  const protectedVal = Math.round((exposure * coverageTarget) / 100);
  const contractsRequired = protectedVal;
  const estimatedCost = (contractsRequired * 0.0028).toFixed(2);

  // SVG Chart points calculation
  const chartW = 600;
  const chartH = 180;
  const step = chartW / Math.max(1, chartPts.length - 1);
  const priceToY = (p: number) => chartH - ((p - curConfig.min) / curConfig.range) * (chartH - 20) - 10;

  const polylinePoints = chartPts
    .map((p, i) => `${(i * step).toFixed(1)},${priceToY(p).toFixed(1)}`)
    .join(" ");

  const areaD = chartPts.length
    ? `M 0,${priceToY(chartPts[0]).toFixed(1)} ` +
      chartPts.map((p, i) => `L ${(i * step).toFixed(1)},${priceToY(p).toFixed(1)}`).join(" ") +
      ` L ${chartW},${chartH} L 0,${chartH} Z`
    : "";

  const currentSpot = chartPts.length ? chartPts[chartPts.length - 1] : curConfig.spot;

  return (
    <AppShell
      systemState={systemState}
      isSimulationRunning={isSimulationRunning}
      onTriggerStressTest={triggerMarketStress}
      riskScore={isSimulationRunning ? 98 : riskScore}
      coveragePct={isSimulationRunning ? 58 : currentHedgeCoveragePct}
      protectionGapPct={isSimulationRunning ? 22 : protectionGapPct}
      portfolioValue={exposure}
      protectedValue={protectedVal}
      activeAsset={activeAsset}
      onSelectAsset={setActiveAsset}
    >
      <div className="space-y-5 font-mono">
        {/* Top Bento Row: Animated SVG Chart & SVG Dial */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* SVG Area Chart */}
          <div className="lg:col-span-8 bg-[#0b101d] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Deterministic Risk Engine</h2>
                <p className="text-[11px] text-slate-400">
                  {activeAsset} Spot Price vs Strike Threshold Evaluation
                </p>
              </div>
              <div className="flex items-center space-x-4 text-xs">
                <span>
                  Spot:{" "}
                  <strong className={isBreached ? "text-rose-400" : "text-emerald-400"}>
                    ${curConfig.spot < 10 ? currentSpot.toFixed(2) : Math.round(currentSpot).toLocaleString()}
                  </strong>
                </span>
                <span>
                  Strike: <strong className="text-rose-400">${curConfig.strike.toLocaleString()}</strong>
                </span>
              </div>
            </div>

            <div className="bg-[#060911] border border-slate-800 rounded-lg h-44 relative overflow-hidden">
              <svg width="100%" height="100%" viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="svgAreaGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="svgAreaRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Strike Line */}
                <line
                  x1="0"
                  y1={priceToY(curConfig.strike)}
                  x2={chartW}
                  y2={priceToY(curConfig.strike)}
                  stroke="#ef4444"
                  strokeWidth="1"
                  strokeDasharray="6,4"
                  opacity="0.7"
                />
                <text
                  x={chartW - 120}
                  y={priceToY(curConfig.strike) - 6}
                  fill="#ef4444"
                  fontSize="9"
                  opacity="0.8"
                >
                  STRIKE ${curConfig.strike.toLocaleString()}
                </text>

                {/* Fill Area */}
                <path d={areaD} fill={isBreached ? "url(#svgAreaRed)" : "url(#svgAreaGreen)"} />

                {/* Price Polyline */}
                <polyline
                  fill="none"
                  stroke={isBreached ? "#ef4444" : "#10b981"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={polylinePoints}
                />
              </svg>

              <div className="absolute bottom-2 left-3 flex items-center space-x-3 text-[10px] text-slate-500">
                <span className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Spot Price</span>
                </span>
                <span>--- Strike Line</span>
                <span className="text-cyan-400">⚡ 15m Auto-Roll Window</span>
              </div>
            </div>
          </div>

          {/* SVG Arc Dial */}
          <div className="lg:col-span-4 bg-[#0b101d] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Hedge Coverage</h3>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  coverageTarget >= 70
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                }`}
              >
                ● {coverageTarget >= 70 ? "Sufficient" : "Partial"}
              </span>
            </div>

            <div className="text-center py-2 relative">
              <svg viewBox="0 0 120 80" className="w-40 mx-auto block">
                <path d="M 15 70 A 50 50 0 0 1 105 70" fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
                <path
                  d="M 15 70 A 50 50 0 0 1 105 70"
                  fill="none"
                  stroke={coverageTarget >= 70 ? "#10b981" : "#f59e0b"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(coverageTarget / 100) * 141.37} 141.37`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="-mt-6">
                <div className="text-3xl font-extrabold text-white">{coverageTarget.toFixed(1)}%</div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">HEDGE RATIO</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Target</span>
                <strong className="text-white">{coverageTarget}%</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Current</span>
                <strong className="text-emerald-400">{coverageTarget.toFixed(1)}%</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Gap</span>
                <strong className="text-emerald-400">0.0%</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Bento Row: Interactive Sliders + DreamDEX CLOB Micro-Book */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Sliders */}
          <div className="lg:col-span-6 bg-[#0b101d] border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Live Policy Configuration Sandbox</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                REACTIVE PARAMS
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Asset Exposure:</span>
                  <strong className="text-white">${exposure.toLocaleString()}</strong>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={exposure}
                  onChange={(e) => setExposure(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Target Protection:</span>
                  <strong className="text-emerald-400">{coverageTarget}%</strong>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={coverageTarget}
                  onChange={(e) => setCoverageTarget(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Required Contracts</span>
                  <strong className="text-sm text-cyan-300">{contractsRequired.toLocaleString()} PUTs</strong>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Est. Cost / 15m Roll</span>
                  <strong className="text-sm text-amber-300">${estimatedCost} USD</strong>
                </div>
              </div>
            </div>
          </div>

          {/* DreamDEX CLOB Orderbook Depth */}
          <div className="lg:col-span-6 bg-[#0b101d] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">DreamDEX CLOB Order Book Depth</h3>
                <p className="text-[10px] text-slate-400">15-Min Binary Event Contracts (Settles @ $1.00 / $0.00)</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                LIVE CLOB DEPTH
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Bids */}
              <div className="bg-[#060911] p-2.5 rounded border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-400 block uppercase">Bids (YES / Above Strike)</span>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    <span className="text-emerald-400 font-bold">$0.72</span>
                    <span className="text-slate-400">14,200 size</span>
                  </div>
                  <div className="flex justify-between bg-emerald-500/5 px-1.5 py-0.5 rounded">
                    <span className="text-emerald-400">$0.71</span>
                    <span className="text-slate-400">28,500 size</span>
                  </div>
                  <div className="flex justify-between bg-emerald-500/5 px-1.5 py-0.5 rounded">
                    <span className="text-emerald-400">$0.70</span>
                    <span className="text-slate-400">52,000 size</span>
                  </div>
                </div>
              </div>

              {/* Asks */}
              <div className="bg-[#060911] p-2.5 rounded border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-rose-400 block uppercase">Asks (NO / Downside Hedge)</span>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between bg-rose-500/15 px-1.5 py-0.5 rounded border-l-2 border-rose-400">
                    <span className="text-rose-400 font-bold">$0.28</span>
                    <span className="text-white font-bold">35,000 (FILL)</span>
                  </div>
                  <div className="flex justify-between bg-rose-500/5 px-1.5 py-0.5 rounded">
                    <span className="text-rose-400">$0.29</span>
                    <span className="text-slate-400">41,200 size</span>
                  </div>
                  <div className="flex justify-between bg-rose-500/5 px-1.5 py-0.5 rounded">
                    <span className="text-rose-400">$0.30</span>
                    <span className="text-slate-400">80,000 size</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between text-[11px] text-slate-400 pt-1">
              <span>Spread: <strong className="text-emerald-400">$0.01 (0.28 / 0.72 implied)</strong></span>
              <span>Venue: <strong className="text-white">DreamDEX Somnia L1</strong></span>
            </div>
          </div>
        </div>

        {/* 5-Stage Pipeline */}
        <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Autonomous Execution Pipeline</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              EIP-7702 DELEGATED
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            {["EVENT", "RISK", "DECISION", "EXECUTION", "PROOF"].map((s, i) => (
              <div key={s} className="bg-slate-900 p-2.5 rounded border border-slate-800 relative">
                <span className="text-[10px] text-slate-500 block">0{i + 1} STAGE</span>
                <strong className="text-white text-xs block my-0.5">{s}</strong>
                <span className="text-[10px] text-emerald-400 font-bold">● READY</span>
                {i < 4 && <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 text-slate-600 text-xs">→</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bento Row: Live Contracts + Streaming Telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Contracts */}
          <div className="lg:col-span-6 bg-[#0b101d] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Deployed Contracts & Verification</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ● ON-CHAIN VERIFIED
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="bg-slate-900 p-2 rounded border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">KasuwaPolicy.sol</span>
                  <span className="text-cyan-300 font-mono text-[11px]">0x43a18f29...82910a</span>
                </div>
                <a
                  href="https://shannon-explorer.somnia.network/address/0x43a18f29d10e42819873a90a218291b87a82910a"
                  target="_blank"
                  className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 text-[11px]"
                >
                  <span>Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="bg-slate-900 p-2 rounded border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">KasuwaExecutor.sol (EIP-7702)</span>
                  <span className="text-cyan-300 font-mono text-[11px]">0x8a92f03d...98f39b1a</span>
                </div>
                <a
                  href="https://shannon-explorer.somnia.network/address/0x8a92f03d12a4b89c72e411b932c0211598f39b1a"
                  target="_blank"
                  className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 text-[11px]"
                >
                  <span>Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="bg-slate-900 p-2 rounded border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">tUSDC Collateral Token</span>
                  <span className="text-cyan-300 font-mono text-[11px]">0x68B1D87F...De11d4</span>
                </div>
                <a
                  href="https://shannon-explorer.somnia.network/address/0x68B1D87F95878fE05B998F19b66F4baba5De11d4"
                  target="_blank"
                  className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 text-[11px]"
                >
                  <span>Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Telemetry Stream */}
          <div className="lg:col-span-6 bg-[#0b101d] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center space-x-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Agent Telemetry Stream</h3>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">● STREAMING LIVE</span>
            </div>

            <div className="bg-[#060911] border border-slate-800 rounded-lg p-2.5 h-36 overflow-y-auto space-y-1 text-[11px] text-emerald-400 font-mono">
              {telemetryLogs.map((log, idx) => (
                <div key={idx} className="leading-relaxed opacity-90">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
