"use client";

import React, { useState } from "react";
import { ShieldCheck, ExternalLink, Copy, Check, Info } from "lucide-react";

interface OnChainProofPanelProps {
  isLiveMode?: boolean;
  txHash?: string;
  blockNumber?: string | number;
  contractAddress?: string;
}

export function OnChainProofPanel({
  isLiveMode = false,
  txHash = "SIMULATED_TX_0x8a7f91c0284e912ab71c89012a4b89c72e411b932c0211598f39b1a7c41e89b",
  blockNumber = "DEMO #1284925",
  contractAddress = "0x43a18f29d10e42819873a90a218291b87a82910a (KasuwaPolicy)",
}: OnChainProofPanelProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0b101d] rounded-xl p-5 border border-slate-800 space-y-4 shadow-xl font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-extrabold uppercase text-white tracking-wider">
            {isLiveMode ? "ON-CHAIN PROOF VERIFICATION" : "PROOF VERIFICATION (DEMO MODE)"}
          </h3>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
          isLiveMode
            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
            : "bg-amber-500/10 text-amber-300 border-amber-500/30"
        }`}>
          {isLiveMode ? "✓ ON-CHAIN VERIFIED" : "SIMULATED TRANSACTION"}
        </span>
      </div>

      {/* Proof Card Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px] uppercase">Transaction Identifier</span>
            <button onClick={handleCopy} className="text-slate-400 hover:text-white transition-colors">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <span className="text-white font-bold block truncate">{txHash}</span>
        </div>

        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] uppercase block">Target Policy Contract</span>
          <span className="text-cyan-400 font-bold block truncate">{contractAddress}</span>
        </div>

        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] uppercase block">Action & Event Signature</span>
          <span className="text-emerald-400 font-bold block">AUTO_ROLL • HedgeRolled(bytes32,uint256)</span>
        </div>

        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] uppercase block">Block Height & Execution State</span>
          <span className="text-slate-200 font-bold block">{blockNumber} • ● {isLiveMode ? "CONFIRMED" : "SIMULATED"}</span>
        </div>
      </div>

      {/* Explorer Action Bar */}
      <div className="flex items-center justify-between text-xs bg-slate-950 p-3 rounded-lg border border-slate-800">
        <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{isLiveMode ? "VERIFY ON SOMNIA EXPLORER:" : "DEMO RECORD (SOMNIA SHANNON TESTNET READY)"}</span>
        </div>
        {isLiveMode ? (
          <a
            href="https://shannon-explorer.somnia.network/address/0x43a18f29d10e42819873a90a218291b87a82910a"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center space-x-1.5 transition-all text-xs"
          >
            <span>VIEW TRANSACTION ON EXPLORER</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-400 text-[10px] font-bold border border-slate-700">
            SIMULATED DEMO PROOF
          </span>
        )}
      </div>
    </div>
  );
}
