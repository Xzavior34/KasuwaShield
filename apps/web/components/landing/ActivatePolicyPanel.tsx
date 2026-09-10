"use client";

import React from "react";
import { AlertTriangle, CheckCircle2, ExternalLink, Loader2, Wallet, Zap } from "lucide-react";
import { useWallet } from "../../hooks/useWallet";
import { usePolicyActions } from "../../hooks/usePolicyActions";
import { MAX_PROTECTION_PERCENT } from "../../lib/contracts";

interface ActivatePolicyPanelProps {
  wallet: ReturnType<typeof useWallet>;
  exposure: number;
  coverageTarget: number;
}

const STAGE_LABEL: Record<string, string> = {
  IDLE: "ACTIVATE MY POLICY (REAL TESTNET TX)",
  AWAITING_CREATE_POLICY_SIGNATURE: "CONFIRM IN WALLET: CREATE POLICY...",
  CREATE_POLICY_PENDING: "BROADCASTING TO SOMNIA SHANNON...",
  AWAITING_AUTHORIZE_SIGNATURE: "CONFIRM IN WALLET: AUTHORIZE SESSION KEY...",
  AUTHORIZE_PENDING: "BROADCASTING TO SOMNIA SHANNON...",
  CONFIRMED: "POLICY LIVE ON-CHAIN",
  ERROR: "RETRY ACTIVATION",
};

export function ActivatePolicyPanel({ wallet, exposure, coverageTarget }: ActivatePolicyPanelProps) {
  const { stage, error, result, activatePolicy, reset, explorerTxUrl } = usePolicyActions(wallet.address);
  const isBusy = stage !== "IDLE" && stage !== "CONFIRMED" && stage !== "ERROR";
  const isClamped = coverageTarget > MAX_PROTECTION_PERCENT;
  const clampedCoverage = Math.min(coverageTarget, MAX_PROTECTION_PERCENT);

  const handleClick = async () => {
    if (!wallet.isConnected) {
      wallet.connectWallet();
      return;
    }
    if (!wallet.isCorrectNetwork) {
      await wallet.switchToSomnia();
      return;
    }
    if (stage === "CONFIRMED" || stage === "ERROR") reset();
    await activatePolicy({ exposureUSD: exposure, protectionPercent: coverageTarget });
  };

  return (
    <div className="bg-[#0b101d] border border-emerald-500/20 rounded-xl p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>Try It Live: Create Your Own Policy</span>
        </h3>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          REAL ON-CHAIN
        </span>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed">
        This sends two real, gas-paying transactions from your own connected wallet:{" "}
        <code className="text-slate-300">KasuwaPolicy.createPolicy(...)</code> and{" "}
        <code className="text-slate-300">KasuwaExecutor.authorizeSessionKey(...)</code>. Protection
        is capped on-chain at {MAX_PROTECTION_PERCENT}% (your slider is at {coverageTarget}%
        {isClamped ? `, will be sent as ${clampedCoverage}%` : ""}).
        You'll need a small amount of testnet STT for gas.
      </p>

      {isClamped && (
        <div className="flex items-start space-x-2 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 text-[11px] text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <span className="font-bold text-amber-200">Protection Capped at 50%: </span>
            <span>
              The on-chain KasuwaPolicy contract enforces a hard 50% max cap to prevent toxic debt.
              Your slider is set to {coverageTarget}%, but this transaction will be clamped and
              submitted with exactly {MAX_PROTECTION_PERCENT}% coverage.
            </span>
          </div>
        </div>
      )}

      <button
        onClick={handleClick}
        disabled={isBusy}
        className={`w-full px-4 py-2.5 rounded-md font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
          stage === "CONFIRMED"
            ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
            : stage === "ERROR"
            ? "bg-rose-500/10 border border-rose-500/40 text-rose-300 hover:bg-rose-500/20"
            : "bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
        }`}
      >
        {isBusy ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : stage === "CONFIRMED" ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : (
          <Wallet className="w-4 h-4" />
        )}
        <span>
          {!wallet.isConnected
            ? "CONNECT WALLET TO ACTIVATE"
            : !wallet.isCorrectNetwork
            ? "SWITCH TO SOMNIA SHANNON"
            : STAGE_LABEL[stage]}
        </span>
      </button>

      {error && (
        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300 space-y-1.5">
          <p className="font-semibold">{error}</p>
          {error.includes("0 STT") && (
            <div>
              <a
                href="https://testnet.somnia.network/"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline inline-flex items-center space-x-1 font-bold"
              >
                <span>Claim free testnet STT from the official Somnia Faucet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      )}

      {result && (
        <div className="space-y-1.5 pt-1">
          <a
            href={explorerTxUrl(result.createPolicyTxHash)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between text-[11px] bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-emerald-400 hover:border-emerald-500/40"
          >
            <span>createPolicy tx</span>
            <span className="flex items-center space-x-1 font-mono">
              <span>{result.createPolicyTxHash.slice(0, 10)}...</span>
              <ExternalLink className="w-3 h-3" />
            </span>
          </a>
          <a
            href={explorerTxUrl(result.authorizeTxHash)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between text-[11px] bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-emerald-400 hover:border-emerald-500/40"
          >
            <span>authorizeSessionKey tx</span>
            <span className="flex items-center space-x-1 font-mono">
              <span>{result.authorizeTxHash.slice(0, 10)}...</span>
              <ExternalLink className="w-3 h-3" />
            </span>
          </a>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
        <span>Need gas for Somnia Shannon?</span>
        <a
          href="https://testnet.somnia.network/"
          target="_blank"
          rel="noreferrer"
          className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center space-x-1 transition-colors"
        >
          <span>Claim free testnet STT from the official Somnia Faucet</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
