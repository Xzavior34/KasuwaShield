"use client";

import React from "react";
import { Key, Shield, CheckCircle, Lock, Cpu, Fingerprint, ArrowRight } from "lucide-react";

interface DelegatedExecutionPanelProps {
  delegationMeta: {
    type: string;
    accountEOA: string;
    delegatedHandler: string;
    sessionAuthStatus: string;
    authNonce: string;
    chainId: number;
    permissionModel: string;
    userSignatureState: string;
    popupRequired: string;
    autonomousExecution: string;
    isDemo?: boolean;
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
              EIP-7702 DELEGATED EXECUTION ARCHITECTURE
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            EIP-7702 Type-4 Account Delegation • 0 Popups Required After 1st Authorization
          </p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
          0x04 SET_CODE
        </span>
      </div>

      {/* Architectural Flow Visualizer */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
        <span className="text-[10px] text-slate-400 uppercase font-bold block">
          ARCHITECTURAL EXECUTION FLOW
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-[10px]">
          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <span className="text-slate-400 block font-bold">1. EIP-7702 DELEGATION</span>
            <span className="text-cyan-300">EOA Code Set</span>
          </div>
          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <span className="text-slate-400 block font-bold">2. PERMISSION BOUNDARY</span>
            <span className="text-emerald-400">Policy Limits</span>
          </div>
          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <span className="text-slate-400 block font-bold">3. KASUWA EXECUTOR</span>
            <span className="text-cyan-300">Auth Router</span>
          </div>
          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <span className="text-slate-400 block font-bold">4. DREAMDEX HEDGE</span>
            <span className="text-emerald-400">Contract Fill</span>
          </div>
        </div>
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
          <span className="text-slate-200 font-bold">{delegationMeta.authNonce} • Chain ID {delegationMeta.chainId}</span>
        </div>

        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] uppercase block">Wallet Signature Friction</span>
          <span className="text-emerald-400 font-bold">0 POPUPS REQUIRED AFTER 1ST AUTHORIZATION</span>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-xs bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300">
        <div className="flex items-center space-x-2">
          <Fingerprint className="w-4 h-4 text-emerald-400" />
          <span>SESSION AUTHORIZATION: <strong className="text-emerald-400">{delegationMeta.sessionAuthStatus}</strong></span>
        </div>
        <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
          SIMULATED DELEGATION
        </span>
      </div>
    </div>
  );
}
