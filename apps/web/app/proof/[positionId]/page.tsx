"use client";

import React from "react";
import { AppShell } from "../../../components/shell/AppShell";
import { ShieldCheck, ExternalLink, CheckCircle, Lock, Cpu, Database } from "lucide-react";
import { useRiskEngineState } from "../../../hooks/useRiskEngineState";

export default function ProofPositionPage({ params }: { params: { positionId: string } }) {
  const positionId = params.positionId || "demo-pos-1";

  const {
    systemState,
    isSimulationRunning,
    triggerMarketStress,
    riskScore,
    currentHedgeCoveragePct,
    protectionGapPct,
  } = useRiskEngineState();

  const mockProofData = {
    positionId,
    status: "ON-CHAIN VERIFIED",
    asset: "BTC",
    exposureUSD: 25000,
    protectedUSD: 20000,
    requiredContracts: 20000,
    entryPrice: 0.35,
    totalCostUSD: 7000.0,
    payoutUSD: 20000.0,
    marketId: "0x679795a0195a1b76cdebb7c51d74e058aee92919b8c3389af86ef24535e8a28c",
    poolAddress: "0x43a18f29d10e42819873a90a218291b87a82910a",
    collateralToken: "0x68B1D87F95878fE05B998F19b66F4baba5De11d4 (tUSDC)",
    blockNumber: 1284925,
    timestamp: "2026-09-02 08:45:12 UTC",
    policy: {
      maxProtectionPercent: "80%",
      maxBudgetUSD: "$100.00",
      maxContractPrice: "0.85",
      maxSlippageBps: "5.00%",
    },
  };

  const explorerBase = "https://shannon-explorer.somnia.network/address/";

  return (
    <AppShell
      systemState={systemState}
      isSimulationRunning={isSimulationRunning}
      onTriggerStressTest={triggerMarketStress}
      riskScore={isSimulationRunning ? 98 : riskScore}
      coveragePct={isSimulationRunning ? 58 : currentHedgeCoveragePct}
      protectionGapPct={isSimulationRunning ? 22 : protectionGapPct}
    >
      <div className="space-y-6 max-w-5xl mx-auto font-mono">
        {/* Header */}
        <div className="bg-[#0b101d] rounded-xl p-6 border border-slate-800 flex items-center justify-between shadow-xl">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            <div>
              <h1 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>On-Chain Position Verification</span>
              </h1>
              <p className="text-xs text-slate-400">Position ID: {positionId}</p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold tracking-wider flex items-center space-x-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{mockProofData.status}</span>
          </span>
        </div>

        {/* Proof Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Execution & Market Parameters */}
          <div className="bg-[#0b101d] rounded-xl p-6 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Position Parameters</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Asset & Portfolio Exposure:</span>
                <span className="text-white font-bold">
                  {mockProofData.asset} (${mockProofData.exposureUSD.toLocaleString()})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Target Protection:</span>
                <span className="text-emerald-400 font-bold">${mockProofData.protectedUSD.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Contracts Purchased:</span>
                <span className="text-slate-200">
                  {mockProofData.requiredContracts.toLocaleString()} contracts @ ${mockProofData.entryPrice}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Block / Timestamp:</span>
                <span className="text-slate-300">#{mockProofData.blockNumber}</span>
              </div>
            </div>
          </div>

          {/* On-Chain Policy Verification */}
          <div className="bg-[#0b101d] rounded-xl p-6 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>KasuwaPolicy Enforcement</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Max Protection Cap:</span>
                <span className="text-emerald-400">{mockProofData.policy.maxProtectionPercent}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Max Budget Cap:</span>
                <span className="text-emerald-400">{mockProofData.policy.maxBudgetUSD}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Max Contract Price:</span>
                <span className="text-emerald-400">{mockProofData.policy.maxContractPrice}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Max Slippage Cap:</span>
                <span className="text-emerald-400">{mockProofData.policy.maxSlippageBps}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Hashes Section */}
        <div className="bg-[#0b101d] rounded-xl p-6 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Verifiable Somnia Explorer Hashes</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div>
                <span className="text-slate-400 block">KasuwaPolicy.sol Contract</span>
                <span className="text-slate-200">{mockProofData.poolAddress}</span>
              </div>
              <a
                href={`${explorerBase}${mockProofData.poolAddress}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 sm:mt-0 text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-bold"
              >
                <span>View Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div>
                <span className="text-slate-400 block">DreamDEX Collateral Token (tUSDC)</span>
                <span className="text-slate-200">{mockProofData.collateralToken}</span>
              </div>
              <a
                href={`${explorerBase}0x68B1D87F95878fE05B998F19b66F4baba5De11d4`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 sm:mt-0 text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-bold"
              >
                <span>View Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
