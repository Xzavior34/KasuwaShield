"use client";

import React, { useState } from "react";
import { AppShell } from "../../components/shell/AppShell";
import { useRiskEngineState } from "../../hooks/useRiskEngineState";
import { Cpu, Shield, Key, RefreshCw, AlertOctagon, CheckCircle2, XCircle, Send, Check, Wallet, Radio } from "lucide-react";

export default function ExecutionPage() {
  const {
    systemState,
    isSimulationRunning,
    triggerMarketStress,
    riskScore,
    currentHedgeCoveragePct,
    protectionGapPct,
  } = useRiskEngineState();

  const generateEphemeralAddress = () =>
    "0x" + Array.from({ length: 20 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0")).join("");

  // NOTE: this must never default to the deployer/funded wallet address
  // (0x07764D9031b8747e28d3E1601Ff1417569de22DA) -- the whole point of a session
  // key is that it is NOT the main wallet, and defaulting to that address here
  // undermines that story for anyone who lands on this page without clicking
  // "Regenerate Key" first.
  const [sessionKeyAddress, setSessionKeyAddress] = useState<string>(() => generateEphemeralAddress());
  const [isRevoked, setIsRevoked] = useState(false);
  const [broadcastState, setBroadcastState] = useState<"IDLE" | "SIGNING" | "TRANSMITTED" | "CONFIRMED">("IDLE");

  const generateNewKey = () => {
    setSessionKeyAddress(generateEphemeralAddress());
    setIsRevoked(false);
    setBroadcastState("IDLE");
  };

  const triggerKillSwitch = () => {
    setIsRevoked(true);
    setBroadcastState("IDLE");
  };

  const triggerLiveBroadcast = () => {
    if (isRevoked) return;
    setBroadcastState("SIGNING");
    setTimeout(() => {
      setBroadcastState("TRANSMITTED");
      setTimeout(() => {
        setBroadcastState("CONFIRMED");
      }, 1500);
    }, 1200);
  };

  const stages = [
    { icon: "👤", label: "USER EOA", sub: "Signs ONCE", color: "border-indigo-500/40 text-indigo-400" },
    { icon: "🔑", label: "EIP-7702 AUTH", sub: "Delegated scope", color: "border-cyan-500/40 text-cyan-400" },
    { icon: "⚙️", label: "SESSION KEY", sub: "1.0 STT Gas", color: "border-emerald-500/40 text-emerald-400" },
    { icon: "📊", label: "RISK ENGINE", sub: "Deterministic ΔR", color: "border-amber-500/40 text-amber-400" },
    { icon: "📈", label: "DreamDEX CLOB", sub: "0x3605...326C", color: "border-pink-500/40 text-pink-400" },
    { icon: "🔗", label: "ON-CHAIN PROOF", sub: "Shannon 50312", color: "border-emerald-500/40 text-emerald-400" },
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
      <div className="space-y-6 font-mono">
        {/* Banner */}
        <div className="bg-[#0b101d] border-l-4 border-cyan-500 rounded-xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>EIP-7702 Delegated Execution Pipeline & Live Testnet Sandbox</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Zero wallet popups. Scoped session keys. Autonomous on-chain auto-rolling across 15m event contract windows.
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg shrink-0">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] text-emerald-400 font-bold">1.000000 STT Gas Ready (demo balance)</span>
          </div>
        </div>

        {/* System Architecture Flow */}
        <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">System Architecture Flow</h3>
          <div className="flex items-center justify-between gap-2 overflow-x-auto py-2">
            {stages.map((st, i) => (
              <React.Fragment key={st.label}>
                <div className={`bg-slate-900/80 border ${st.color} p-3 rounded-lg text-center min-w-[110px] space-y-1`}>
                  <div className="text-xl">{st.icon}</div>
                  <strong className="text-[11px] block text-white">{st.label}</strong>
                  <span className="text-[9px] text-slate-400 block">{st.sub}</span>
                </div>
                {i < stages.length - 1 && <span className="text-slate-600 text-xs hidden sm:inline">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Sandbox + Permission Boundary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Key Sandbox */}
          <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Interactive Session Key Sandbox</h3>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  isRevoked
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                }`}
              >
                {isRevoked ? "● KEY REVOKED" : "● ACTIVE DELEGATION"}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Session Key Address (Somnia Shannon EOA)</span>
                <span className={`font-mono text-xs font-bold ${isRevoked ? "text-rose-400 line-through" : "text-emerald-400"}`}>
                  {sessionKeyAddress}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Demo-generated address (not signed or funded on-chain here) -- Nonce: 0</span>
              </div>

              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Target DreamDEX Contract</span>
                <span className="text-cyan-300 font-mono text-[11px] block truncate">WBTC:USDso Market (0x3605f28a...39326C)</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  onClick={generateNewKey}
                  className="flex-1 px-3 py-2 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold hover:bg-cyan-500/20 transition-all flex items-center justify-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>REGENERATE KEY</span>
                </button>
                <button
                  onClick={triggerKillSwitch}
                  disabled={isRevoked}
                  className={`flex-1 px-3 py-2 rounded border font-bold transition-all flex items-center justify-center space-x-1 ${
                    isRevoked
                      ? "bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                  }`}
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span>{isRevoked ? "KILL-SWITCH ENGAGED" : "ENGAGE KILL-SWITCH"}</span>
                </button>
              </div>

              {/* Live Testnet Order Action */}
              <button
                onClick={triggerLiveBroadcast}
                disabled={isRevoked || broadcastState === "SIGNING" || broadcastState === "TRANSMITTED"}
                className={`w-full px-4 py-2.5 rounded font-bold transition-all flex items-center justify-center space-x-2 text-xs ${
                  isRevoked
                    ? "bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed"
                    : broadcastState === "CONFIRMED"
                    ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                    : "bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30"
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {broadcastState === "IDLE" && "🚀 STAGE BOUNDED TESTNET ORDER (15M PUT) -- SIMULATED"}
                  {broadcastState === "SIGNING" && "✍️ SIGNING EIP-7702 PAYLOAD... (SIMULATED)"}
                  {broadcastState === "TRANSMITTED" && "📡 BROADCASTING TO SHANNON RPC... (SIMULATED)"}
                  {broadcastState === "CONFIRMED" && "✓ SIMULATED ORDER COMPLETE (no real tx broadcast)"}
                </span>
              </button>
              <p className="text-[10px] text-amber-500/80 text-center">
                This button drives a scripted UI state machine for demo purposes -- it does not sign or broadcast
                a real transaction. For a real, mined, session-key-executed roll see{" "}
                <code>scripts/execute-real-policy-roll.ts</code>.
              </p>
            </div>
          </div>

          {/* Permissions Matrix */}
          <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Permission Boundaries (Non-Custodial)</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                FAIL-CLOSED
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-emerald-500/5 border border-emerald-500/20 p-3 rounded space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>ALLOWED ACTIONS</span>
                </span>
                <ul className="text-[11px] text-slate-400 space-y-1">
                  <li>• Execute approved hedges</li>
                  <li>• Maintain policy coverage</li>
                  <li>• Auto-roll at window expiry</li>
                  <li>• Budget-bounded purchases</li>
                </ul>
              </div>

              <div className="bg-rose-500/5 border border-rose-500/20 p-3 rounded space-y-1.5">
                <span className="text-[10px] font-bold text-rose-400 flex items-center space-x-1">
                  <XCircle className="w-3 h-3" />
                  <span>PROHIBITED ACTIONS</span>
                </span>
                <ul className="text-[11px] text-slate-400 space-y-1">
                  <li>• Withdraw user funds</li>
                  <li>• Change ownership</li>
                  <li>• Exceed max notional ($500)</li>
                  <li>• Transfer collateral</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 6-Window Timeline */}
        <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Auto-Roll Execution Timeline (Last 6 Windows)</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              SIMULATED HISTORY
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
            {[
              { t: "T-6", cost: "$8.20", status: "ROLLED", color: "text-emerald-400" },
              { t: "T-5", cost: "$7.85", status: "ROLLED", color: "text-emerald-400" },
              { t: "T-4", cost: "$9.10", status: "ROLLED", color: "text-emerald-400" },
              { t: "T-3", cost: "$8.55", status: "ROLLED", color: "text-emerald-400" },
              { t: "T-2", cost: "$7.90", status: "ROLLED", color: "text-emerald-400" },
              { t: "T-1", cost: "$8.40", status: "ACTIVE", color: "text-cyan-400" },
            ].map((w) => (
              <div key={w.t} className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">{w.t} (15m)</span>
                <strong className={`text-sm block my-1 ${w.color}`}>{w.cost}</strong>
                <span className={`text-[10px] font-bold ${w.color}`}>● {w.status}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60 gap-1">
            <span>Total Sequential Auto-Rolls: <strong className="text-white">6</strong></span>
            <span>Budget Consumed: <strong className="text-amber-300">$50.00 / $100.00</strong></span>
            <span>User Wallet Popups: <strong className="text-emerald-400">1 (Setup only)</strong></span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
