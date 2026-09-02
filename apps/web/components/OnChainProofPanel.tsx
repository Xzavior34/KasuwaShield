"use client";

import React, { useState } from "react";
import { ShieldCheck, ExternalLink, Copy, Check } from "lucide-react";

export function OnChainProofPanel() {
  const [copied, setCopied] = useState<boolean>(false);

  const proofData = {
    txHash: "0x8a7f91c0284e912ab71c89012a4b89c72e411b932c0211598f39b1a7c41e89b",
    blockNumber: 1284925,
    contractAddress: "0x43a18f29d10e42819873a90a218291b87a82910a",
    action: "AUTO_ROLL",
    status: "CONFIRMED",
    eventSignature: "HedgeRolled(bytes32 policyId, uint256 newNotional, uint256 price)",
    explorerUrl: "https://shannon-explorer.somnia.network/address/0x43a18f29d10e42819873a90a218291b87a82910a",
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(proofData.txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0b101d] rounded-xl p-5 border border-slate-800 space-y-4 shadow-xl font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-extrabold uppercase text-white tracking-wider">
            ON-CHAIN PROOF VERIFICATION
          </h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
          ✓ SOMNIA SHANNON VERIFIED
        </span>
      </div>

      {/* Proof Card Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px] uppercase">Transaction Hash</span>
            <button onClick={handleCopy} className="text-slate-400 hover:text-white transition-colors">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <span className="text-white font-bold block truncate">{proofData.txHash}</span>
        </div>

        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] uppercase block">Target Contract Address</span>
          <span className="text-cyan-400 font-bold block truncate">{proofData.contractAddress}</span>
        </div>

        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] uppercase block">Action & Event Signature</span>
          <span className="text-emerald-400 font-bold block">{proofData.action} • {proofData.eventSignature}</span>
        </div>

        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] uppercase block">Block Height & Status</span>
          <span className="text-slate-200 font-bold block">Block #{proofData.blockNumber} • ● {proofData.status}</span>
        </div>
      </div>

      {/* Explorer Action Bar */}
      <div className="flex items-center justify-between text-xs bg-slate-950 p-3 rounded-lg border border-slate-800">
        <span className="text-slate-400 text-[11px]">VERIFY ON SOMNIA SHANNON BLOCK EXPLORER:</span>
        <a
          href={proofData.explorerUrl}
          target="_blank"
          rel="noreferrer"
          className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center space-x-1.5 transition-all text-xs"
        >
          <span>VIEW TRANSACTION ON EXPLORER</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
