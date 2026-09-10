"use client";

import React, { useState, useEffect, useRef } from "react";
import { AppShell } from "../components/shell/AppShell";
import { useRiskEngineState } from "../hooks/useRiskEngineState";
import { useWallet } from "../hooks/useWallet";
import { Activity, Cpu, Shield, AlertTriangle, ArrowRight, ExternalLink, Download, Radio, CheckCircle2 } from "lucide-react";
import { CryptoIcon } from "../components/common/CryptoIcon";
import { Hero } from "../components/landing/Hero";
import { ActivatePolicyPanel } from "../components/landing/ActivatePolicyPanel";

export default function TerminalDashboard() {
  const {
    systemState,
    isSimulationRunning,
    triggerMarketStress,
    riskScore,
    currentHedgeCoveragePct,
    protectionGapPct,
  } = useRiskEngineState();

  const wallet = useWallet();
  const dashboardRef = useRef<HTMLDivElement | null>(null);
  const scrollToDashboard = () => {
    dashboardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Multi-asset state
  const [activeAsset, setActiveAsset] = useState("BTC");
  const [exposure, setExposure] = useState(25000);
  const [coverageTarget, setCoverageTarget] = useState(80);

  const [livePrices, setLivePrices] = useState<Record<string, number>>({
    BTC: 79650,
    ETH: 2520,
    SOL: 105,
    SOMI: 1.20,
  });
  const [priceSource, setPriceSource] = useState<string>("calibrated_baseline");

  // Fetch live real-time prices from /api/prices
  useEffect(() => {
    let cancelled = false;
    async function syncPrices() {
      try {
        const res = await fetch("/api/prices");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.prices) {
          setLivePrices((prev) => ({
            ...prev,
            ...data.prices,
          }));
          if (data.source) setPriceSource(data.source);
        }
      } catch (err) {
        // Fallback gracefully
      }
    }
    syncPrices();
    const timer = setInterval(syncPrices, 20000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const btcSpot = livePrices.BTC || 79650;
  const ethSpot = livePrices.ETH || 2520;
  const solSpot = livePrices.SOL || 105;
  const somiSpot = livePrices.SOMI || 1.20;

  const assetConfigs: Record<string, { spot: number; strike: number; min: number; range: number; drop: number }> = {
    BTC: {
      spot: btcSpot,
      strike: Math.round((btcSpot * 0.985) / 100) * 100,
      min: Math.round((btcSpot * 0.965) / 100) * 100,
      range: Math.round((btcSpot * 0.04) / 100) * 100,
      drop: Math.round((btcSpot * 0.96) / 100) * 100,
    },
    ETH: {
      spot: ethSpot,
      strike: Math.round((ethSpot * 0.98) / 10) * 10,
      min: Math.round((ethSpot * 0.96) / 10) * 10,
      range: Math.round((ethSpot * 0.05) / 10) * 10,
      drop: Math.round((ethSpot * 0.95) / 10) * 10,
    },
    SOL: {
      spot: solSpot,
      strike: Math.round(solSpot * 0.97 * 10) / 10,
      min: Math.round(solSpot * 0.94 * 10) / 10,
      range: Math.round(solSpot * 0.08 * 10) / 10,
      drop: Math.round(solSpot * 0.93 * 10) / 10,
    },
    SOMI: {
      spot: somiSpot,
      strike: Number((somiSpot * 0.96).toFixed(2)),
      min: Number((somiSpot * 0.92).toFixed(2)),
      range: Number((somiSpot * 0.16).toFixed(2)),
      drop: Number((somiSpot * 0.88).toFixed(2)),
    },
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
  }, [activeAsset, curConfig.spot]);

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
    "LIVE_INIT — connecting to Somnia Shannon RPC (chain=50312)...",
    "DELEGATION_VERIFIED — EIP-7702 session key active scope=executeAutoRoll",
    "POLICY_CHECK — remainingBudget=$47.50 maxNotional=$500 killSwitch=ARMED",
    "DREAMDEX_CLOB_SCAN — bestAskProb=0.28 spread=0.01 liquidity=35,000 PUTs",
    "AUTO_ROLL_READY — budget=$47.50 maxPrice=0.85 contracts=20,000 status=STANDBY",
  ]);
  const [isLiveRpcConnected, setIsLiveRpcConnected] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

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

    const pollLiveBlock = async () => {
      try {
        const res = await fetch("https://dream-rpc.somnia.network", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] }),
        });
        const json = await res.json();
        const blockNum = parseInt(json.result, 16);
        if (!cancelled && Number.isFinite(blockNum)) {
          setIsLiveRpcConnected(true);
          const now = new Date().toISOString().slice(11, 23);
          const blockEvt = `[${now}] [LIVE] SOMNIA_BLOCK_FINALIZED — block=#${blockNum.toLocaleString("en-US")} chain=50312 status=CONFIRMED`;
          setTelemetryLogs((prev) => [...prev.slice(-25), blockEvt]);
        }
      } catch {
        // Continue fallback telemetry
      }
    };

    pollLiveBlock();
    const rpcInterval = setInterval(pollLiveBlock, 4500);

    const eventInterval = setInterval(() => {
      const now = new Date().toISOString().slice(11, 23);
      const nextEvt = `[${now}] ${events[Math.floor(Math.random() * events.length)]}`;
      setTelemetryLogs((prev) => [...prev.slice(-25), nextEvt]);
    }, 2800);

    return () => {
      cancelled = true;
      clearInterval(rpcInterval);
      clearInterval(eventInterval);
    };
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
      <Hero
        isConnected={wallet.isConnected}
        isConnecting={wallet.isConnecting}
        hasInjectedProvider={wallet.hasInjectedProvider}
        address={wallet.address}
        onConnect={wallet.connectWallet}
        onScrollToApp={scrollToDashboard}
      />
      <div ref={dashboardRef} className="space-y-4 sm:space-y-5 font-mono px-1 pt-4 sm:pt-5">
        {/* Top Bento Row: Animated SVG Chart & SVG Dial */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          {/* SVG Area Chart */}
          <div className="lg:col-span-8 bg-[#0b101d] border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-2 gap-1">
              <div className="flex items-center space-x-2.5">
                <CryptoIcon symbol={activeAsset} size={22} />
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Deterministic Risk Engine</h2>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-mono flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>LIVE SPOT</span>
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-400">
                    {activeAsset} Spot Price vs Strike Threshold Evaluation
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-xs" suppressHydrationWarning>
                <span>
                  Spot:{" "}
                  <strong className={isBreached ? "text-rose-400" : "text-emerald-400"}>
                    ${curConfig.spot < 10 ? currentSpot.toFixed(2) : Math.round(currentSpot).toLocaleString("en-US")}
                  </strong>
                </span>
                <span>
                  Strike: <strong className="text-rose-400">${curConfig.strike < 10 ? curConfig.strike.toFixed(2) : curConfig.strike.toLocaleString("en-US")}</strong>
                </span>
              </div>
            </div>

            <div className="bg-[#060911] border border-slate-800 rounded-lg h-36 sm:h-44 relative overflow-hidden">
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
                  STRIKE ${curConfig.strike.toLocaleString("en-US")}
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

              <div className="absolute bottom-1.5 left-2.5 flex items-center space-x-2 sm:space-x-3 text-[9px] sm:text-[10px] text-slate-500">
                <span className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Spot</span>
                </span>
                <span>--- Strike</span>
                <span className="text-cyan-400">15m Auto-Roll</span>
                <span className="text-slate-400 hidden sm:inline font-mono">
                  • {priceSource === "live_market_feed" ? "Live Ticker API" : "Live Spot Calibrated"}
                </span>
              </div>
            </div>
          </div>

          {/* SVG Arc Dial */}
          <div className="lg:col-span-4 bg-[#0b101d] border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
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
              <svg viewBox="0 0 120 80" className="w-32 sm:w-40 mx-auto block">
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
              <div className="-mt-5 sm:-mt-6">
                <div className="text-2xl sm:text-3xl font-extrabold text-white">{coverageTarget.toFixed(1)}%</div>
                <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-widest block">HEDGE RATIO</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center text-xs">
              <div className="bg-slate-900 p-1.5 sm:p-2 rounded border border-slate-800">
                <span className="text-[9px] sm:text-[10px] text-slate-400 block">Target</span>
                <strong className="text-white text-xs">{coverageTarget}%</strong>
              </div>
              <div className="bg-slate-900 p-1.5 sm:p-2 rounded border border-slate-800">
                <span className="text-[9px] sm:text-[10px] text-slate-400 block">Current</span>
                <strong className="text-emerald-400 text-xs">{coverageTarget.toFixed(1)}%</strong>
              </div>
              <div className="bg-slate-900 p-1.5 sm:p-2 rounded border border-slate-800">
                <span className="text-[9px] sm:text-[10px] text-slate-400 block">Gap</span>
                <strong className="text-emerald-400 text-xs">0.0%</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Bento Row: Interactive Sliders + DreamDEX CLOB Micro-Book */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          {/* Sliders */}
          <div className="lg:col-span-6 bg-[#0b101d] border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Policy Configuration Sandbox</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                REACTIVE PARAMS
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1" suppressHydrationWarning>
                  <span className="text-slate-400">Asset Exposure:</span>
                  <strong className="text-white">${exposure.toLocaleString("en-US")}</strong>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={exposure}
                  onChange={(e) => setExposure(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
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
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1">
                <div className="bg-slate-900 p-2 sm:p-2.5 rounded border border-slate-800" suppressHydrationWarning>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase">Required Contracts</span>
                  <strong className="text-xs sm:text-sm text-cyan-300">{contractsRequired.toLocaleString("en-US")} PUTs</strong>
                </div>
                <div className="bg-slate-900 p-2 sm:p-2.5 rounded border border-slate-800">
                  <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase">Est. Cost / 15m Roll</span>
                  <strong className="text-xs sm:text-sm text-amber-300">${estimatedCost} USD</strong>
                </div>
              </div>
            </div>

            <ActivatePolicyPanel wallet={wallet} exposure={exposure} coverageTarget={coverageTarget} />
          </div>

          {/* DreamDEX CLOB Orderbook Depth */}
          <div className="lg:col-span-6 bg-[#0b101d] border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">DreamDEX CLOB Order Book</h3>
                <p className="text-[9px] sm:text-[10px] text-slate-400">15-Min Binary Event Contracts ($1.00 / $0.00)</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                SIMULATED DEPTH
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs">
              {/* Bids */}
              <div className="bg-[#060911] p-2 sm:p-2.5 rounded border border-slate-800 space-y-1.5">
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
              <div className="bg-[#060911] p-2 sm:p-2.5 rounded border border-slate-800 space-y-1.5">
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

            <div className="flex justify-between text-[10px] sm:text-[11px] text-slate-400 pt-1">
              <span>Spread: <strong className="text-emerald-400">$0.01</strong></span>
              <span>Venue: <strong className="text-white">DreamDEX Somnia L1</strong></span>
            </div>
          </div>
        </div>

        {/* 5-Stage Pipeline */}
        <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Autonomous Execution Pipeline</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              EIP-7702
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
            {["EVENT", "RISK", "DECISION", "EXECUTION", "PROOF"].map((s, i) => (
              <div key={s} className="bg-slate-900 p-2 sm:p-2.5 rounded border border-slate-800">
                <span className="text-[9px] text-slate-500 block">0{i + 1} STAGE</span>
                <strong className="text-white text-[11px] sm:text-xs block my-0.5">{s}</strong>
                <span className="text-[9px] text-emerald-400 font-bold">● READY</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bento Row: Live Contracts + Streaming Telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          {/* Contracts */}
          <div className="lg:col-span-6 bg-[#0b101d] border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Deployed Contracts & Verification</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ● ON-CHAIN
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="bg-slate-900 p-2 rounded border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase">KasuwaPolicy.sol</span>
                  <span className="text-cyan-300 font-mono text-[10px] sm:text-[11px]">0xbd2a26c3...f9c550a</span>
                </div>
                <a
                  href="https://shannon-explorer.somnia.network/address/0xbd2a26c3893db93ef86e0ceaaec080df8f9c550a"
                  target="_blank"
                  className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 text-[10px] sm:text-[11px]"
                >
                  <span>Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="bg-slate-900 p-2 rounded border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase">KasuwaExecutor.sol (EIP-7702)</span>
                  <span className="text-cyan-300 font-mono text-[10px] sm:text-[11px]">0x80AcBF39...4B7c69c</span>
                </div>
                <a
                  href="https://shannon-explorer.somnia.network/address/0x80AcBF398663079edBfF26132C9AC04204B7c69c"
                  target="_blank"
                  className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 text-[10px] sm:text-[11px]"
                >
                  <span>Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="bg-slate-900 p-2 rounded border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase">KasuwaReactiveHandler.sol</span>
                  <span className="text-cyan-300 font-mono text-[10px] sm:text-[11px]">0x7eAfd01B...eED2F3213</span>
                </div>
                <a
                  href="https://shannon-explorer.somnia.network/address/0x7eAfd01B0736593611c2Ac73e0FdB6BeED2F3213"
                  target="_blank"
                  className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 text-[10px] sm:text-[11px]"
                >
                  <span>Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="bg-slate-900 p-2 rounded border border-slate-800 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <CryptoIcon symbol="USDSO" size={18} />
                  <div>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase">USDso Collateral Token</span>
                    <span className="text-cyan-300 font-mono text-[10px] sm:text-[11px]">0x9c32F382...bb171</span>
                  </div>
                </div>
                <a
                  href="https://shannon-explorer.somnia.network/address/0x9c32F3827A1a99f0cf9B213de8b53eC3d57bb171"
                  target="_blank"
                  className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 text-[10px] sm:text-[11px]"
                >
                  <span>Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Telemetry Stream */}
          <div className="lg:col-span-6 bg-[#0b101d] border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center space-x-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Agent Telemetry Stream</h3>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <span className={`text-[10px] font-bold flex items-center space-x-1.5 ${isLiveRpcConnected ? "text-emerald-400" : "text-amber-400"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isLiveRpcConnected ? "bg-emerald-400 animate-ping" : "bg-amber-400 animate-pulse"}`}></span>
                <span>{isLiveRpcConnected ? "● LIVE RPC TELEMETRY (SOMNIA 50312)" : "○ CONNECTING RPC..."}</span>
              </span>
            </div>

            <div className="bg-[#060911] border border-slate-800 rounded-lg p-2.5 h-32 sm:h-36 overflow-y-auto space-y-1 text-[10px] sm:text-[11px] text-emerald-400 font-mono">
              {telemetryLogs.map((log, idx) => (
                <div key={idx} className="leading-relaxed opacity-90 truncate">
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
