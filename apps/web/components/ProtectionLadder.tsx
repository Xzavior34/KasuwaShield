"use client";

import React from "react";
import { ShieldCheck, RotateCcw, Clock, CheckCircle2 } from "lucide-react";
import { ProtectionLadderItem } from "../hooks/useRiskEngineState";

interface ProtectionLadderProps {
  protectionLadder: ProtectionLadderItem[];
}

export function ProtectionLadder({ protectionLadder }: ProtectionLadderProps) {
  return (
    <div className="bg-[#0b101d] rounded-xl p-5 border border-slate-800 space-y-4 shadow-xl font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-extrabold uppercase text-white tracking-wider">
            PROTECTION LADDER HISTORY
          </h3>
        </div>
        <span className="text-xs text-slate-400">CONTINUOUS AUTO-ROLLING HEDGES</span>
      </div>

      {/* Grid of Ladder Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {protectionLadder.map((item) => {
          let badgeStyle = "bg-slate-800 text-slate-400 border-slate-700";
          let borderStyle = "border-slate-800 bg-slate-900/60";

          if (item.status === "ACTIVE") {
            badgeStyle = "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold";
            borderStyle = "border-emerald-500/40 bg-emerald-500/5 shadow-md shadow-emerald-950/40";
          } else if (item.status === "ROLLED") {
            badgeStyle = "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
            borderStyle = "border-cyan-500/20 bg-slate-900/80";
          } else if (item.status === "QUEUED") {
            badgeStyle = "bg-amber-500/20 text-amber-300 border-amber-500/40";
            borderStyle = "border-amber-500/20 bg-slate-900/80";
          }

          return (
            <div key={item.id} className={`p-3.5 rounded-lg border flex flex-col justify-between space-y-3 ${borderStyle}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-white uppercase text-xs">{item.label}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded border ${badgeStyle}`}>
                  ● {item.status}
                </span>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Notional:</span>
                  <span className="text-white font-bold">${item.notionalUSD.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Contract:</span>
                  <span className="text-slate-300 truncate max-w-[90px]">{item.contract}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Ask Price:</span>
                  <span className="text-emerald-400">${item.entryPrice}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Expiry Window:</span>
                  <span className="text-slate-300">{item.expiryTime}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
                <span>Executed: {item.executionTime}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
