"use client";

import React from "react";
import { Zap, Cpu, CheckCircle2, ShieldCheck, ArrowRight, Activity, FileCode } from "lucide-react";
import { SystemState } from "../hooks/useRiskEngineState";

interface ExecutionPipelineProps {
  systemState: SystemState;
  riskScore: number;
}

export function ExecutionPipeline({ systemState, riskScore }: ExecutionPipelineProps) {
  // Determine stage activity states
  const getStageStatus = (stageIndex: number) => {
    switch (systemState) {
      case "VOLATILITY_RISING":
        return stageIndex === 1 ? "ACTIVE" : stageIndex < 1 ? "COMPLETED" : "IDLE";
      case "THRESHOLD_BREACHED":
      case "RISK_EVALUATING":
        return stageIndex === 2 ? "ACTIVE" : stageIndex < 2 ? "COMPLETED" : "IDLE";
      case "HEDGE_REQUIRED":
        return stageIndex === 3 ? "ACTIVE" : stageIndex < 3 ? "COMPLETED" : "IDLE";
      case "EXECUTING":
        return stageIndex === 4 ? "ACTIVE" : stageIndex < 4 ? "COMPLETED" : "IDLE";
      case "PROTECTED":
      case "NORMAL":
      default:
        return "COMPLETED";
    }
  };

  const stages = [
    {
      step: "01",
      title: "EVENT",
      type: "BTC_MARKET_STATE_CHANGED",
      meta: "Block #1284921",
      badge: "● RECEIVED",
      icon: Zap,
    },
    {
      step: "02",
      title: "RISK",
      type: `Risk Score: ${riskScore}/100`,
      meta: riskScore > 60 ? "Breach Detected" : "Normal Volatility",
      badge: "● EVALUATED",
      icon: Activity,
    },
    {
      step: "03",
      title: "DECISION",
      type: "ACTION: ROLL HEDGE",
      meta: "Target Coverage: 80%",
      badge: "● APPROVED",
      icon: Cpu,
    },
    {
      step: "04",
      title: "EXECUTION",
      type: "DreamDEX Contract",
      meta: "EIP-7702 Session Key",
      badge: "● SUBMITTED",
      icon: FileCode,
    },
    {
      step: "05",
      title: "PROOF",
      type: "Tx 0x8a7f...91cd",
      meta: "Somnia Shannon Verified",
      badge: "● CONFIRMED",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="bg-[#0b101d] rounded-xl p-5 border border-slate-800 space-y-4 shadow-xl font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-sm font-extrabold uppercase text-white tracking-wider flex items-center space-x-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>AUTONOMOUS EXECUTION PIPELINE</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            5-Stage Event-Driven Pipeline • Zero User Wallet Popups Required
          </p>
        </div>
        <span className="text-[10px] px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
          EIP-7702 AUTOMATED
        </span>
      </div>

      {/* 5 Horizontal Stages */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {stages.map((st, idx) => {
          const stageNum = idx + 1;
          const status = getStageStatus(stageNum);
          const Icon = st.icon;

          let cardBorder = "border-slate-800 bg-slate-900/60 text-slate-400";
          let badgeStyle = "bg-slate-800 text-slate-400 border-slate-700";

          if (status === "ACTIVE") {
            cardBorder = "border-cyan-500/60 bg-cyan-500/10 text-cyan-200 shadow-lg shadow-cyan-950/50 animate-pulse";
            badgeStyle = "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
          } else if (status === "COMPLETED") {
            cardBorder = "border-emerald-500/30 bg-slate-900/90 text-white";
            badgeStyle = "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
          }

          return (
            <div key={st.step} className={`p-3.5 rounded-lg border flex flex-col justify-between space-y-3 transition-all ${cardBorder}`}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 font-bold">{st.step} STAGE</span>
                <Icon className={`w-4 h-4 ${status === "ACTIVE" ? "text-cyan-400 animate-spin" : status === "COMPLETED" ? "text-emerald-400" : "text-slate-500"}`} />
              </div>

              <div>
                <span className="text-xs font-bold uppercase block text-white">{st.title}</span>
                <span className="text-[11px] text-slate-300 font-bold block truncate mt-0.5">{st.type}</span>
                <span className="text-[10px] text-slate-400 block">{st.meta}</span>
              </div>

              <div className="pt-2 border-t border-slate-800/60">
                <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold inline-block ${badgeStyle}`}>
                  {st.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
