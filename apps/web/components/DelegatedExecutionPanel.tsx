"use client";

import React from "react";
import { Key, Shield, CheckCircle, Lock, Cpu, Fingerprint } from "lucide-react";

interface DelegatedExecutionPanelProps {
  delegationMeta: {
    type: string;
    accountEOA: string;
    delegatedHandler: string;
    authNonce: number;
    chainId: number;
    permissionModel: string;
    userSignatureState: string;
    popupRequired: string;
    autonomousExecution: string;
  };
}

export function DelegatedExecutionPanel({ delegationMeta }: DelegatedExecutionPanelProps) {
  return (
    <div className="bg-[#0b101d] rounded-xl p-5 border border-slate-800 space-y-4 shadow-xl font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <Key className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-extrabold uppercase text-white tracking-wider">
              DELEGATED EXECUTION (EIP-7702)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            EIP-7702 Type-4 Authorization Layer • Ephemeral Session Key Router
          </p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
          0x04 SET_CODE
        </span>
      </div>

      {/* Terminal Card Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] uppercase block">Account (EOA)</span>
          <span className="text-white font-bold block truncate">{delegationMeta.accountEOA}</span>
        </div>

        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] uppercase block">Delegated Executor Contract</span>
          <span className="text-cyan-400 font-bold block truncate">{delegationMeta.delegatedHandler}</span>
        </div>

        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] uppercase block">Auth Nonce / Chain ID</span>
          <span className="text-slate-200 font-bold">Nonce #{delegationMeta.authNonce} • Chain ID {delegationMeta.chainId}</span>
        </div>

        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] uppercase block">Wallet Popups Required</span>
          <span className="text-emerald-400 font-bold">{delegationMeta.popupRequired}</span>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-xs bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300">
        <div className="flex items-center space-x-2">
          <Fingerprint className="w-4 h-4 text-emerald-400" />
          <span>USER DELEGATION STATE: <strong className="text-emerald-400">{delegationMeta.userSignatureState}</strong></span>
        </div>
        <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
          DEMO DELEGATION SIMULATED
        </span>
      </div>
    </div>
  );
}
