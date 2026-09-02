"use client";

import React from "react";
import { Radio, Activity, Clock, Cpu, CheckCircle } from "lucide-react";
import { ReactivityEvent } from "../hooks/useRiskEngineState";

interface ReactivityMonitorProps {
  reactivityLogs: ReactivityEvent[];
  latencyMetrics: {
    eventDetectionMs: number;
    riskEvaluationMs: number;
    handlerDispatchMs: number;
    validatorConfirmationMs: number;
    totalLatencyMs: number;
  };
  isRpcFallback?: boolean;
}

export function ReactivityMonitor({ reactivityLogs, latencyMetrics, isRpcFallback = false }: ReactivityMonitorProps) {
  return (
    <div className="bg-[#0b101d] rounded-xl p-5 border border-slate-800 space-y-4 shadow-xl font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h3 className="text-sm font-extrabold uppercase text-white tracking-wider">
              SOMNIA REACTIVITY (EVENT-DRIVEN AUTOMATION)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Native Somnia Reactivity Event Stream • Event-Driven Automation Benchmark
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isRpcFallback && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
              RPC FALLBACK: DEMO TELEMETRY ACTIVE
            </span>
          )}
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
            TOTAL LATENCY: {latencyMetrics.totalLatencyMs}ms (DEMO)
          </span>
        </div>
      </div>

      {/* Latency Benchmark Bar */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
        <span className="text-[10px] text-slate-400 uppercase font-bold block">
          EVENT-DRIVEN AUTOMATION LATENCY BENCHMARK (~133ms DEMO TOTAL)
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <span className="text-[9px] text-slate-400 uppercase block">1. Event Detected</span>
            <span className="text-cyan-400 font-bold">{latencyMetrics.eventDetectionMs}ms</span>
          </div>

          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <span className="text-[9px] text-slate-400 uppercase block">2. Risk Evaluation</span>
            <span className="text-cyan-400 font-bold">{latencyMetrics.riskEvaluationMs}ms</span>
          </div>

          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <span className="text-[9px] text-slate-400 uppercase block">3. EIP-7702 Dispatch</span>
            <span className="text-cyan-400 font-bold">{latencyMetrics.handlerDispatchMs}ms</span>
          </div>

          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <span className="text-[9px] text-slate-400 uppercase block">4. Confirmation</span>
            <span className="text-emerald-400 font-bold">{latencyMetrics.validatorConfirmationMs}ms</span>
          </div>
        </div>
      </div>

      {/* Live Monospace Event Stream */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 max-h-48 overflow-y-auto space-y-2 text-xs">
        {reactivityLogs.map((log) => (
          <div key={log.id} className="p-2 rounded bg-slate-900/90 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
            <div className="flex items-center space-x-2">
              <span className="text-slate-500">{log.timestamp}</span>
              <span className="text-cyan-300 font-bold">{log.eventType}</span>
              <span className="text-slate-400">Block #{log.blockNumber}</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-500">[{log.source}]</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                log.status === "CONFIRMED"
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  : log.status === "DISPATCHED"
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                  : "bg-slate-800 text-slate-300 border-slate-700"
              }`}>
                {log.status}
              </span>
              {log.isDemo && (
                <span className="text-[9px] text-amber-400 bg-amber-500/10 px-1 rounded border border-amber-500/30">
                  SIMULATED
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
