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
    status: "SIMULATED DEMO POSITION",
    asset: "BTC",
    exposureUSD: 25000,
    protectedUSD: 20000,
    requiredContracts: 20000,
    entryPrice: 0.35,
    totalCostUSD: 7000.0,
    payoutUSD: 20000.0,
    marketId: "0x476bDbf19e3eCf89CA20788DAbC848634b9B270B",
    policyContract: "0xbd2a26c3893db93ef86e0ceaaec080df8f9c550a",
    executorContract: "0x80AcBF398663079edBfF26132C9AC04204B7c69c",
    reactiveHandlerContract: "0x7eAfd01B0736593611c2Ac73e0FdB6BeED2F3213",
    collateralToken: "0x9c32F3827A1a99f0cf9B213de8b53eC3d57bb171",
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

          <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold tracking-wider flex items-center space-x-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{mockProofData.status}</span>
          </span>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2.5 text-[11px] text-amber-200 flex items-center space-x-2">
          <span>
            This position walkthrough uses illustrative numbers (exposure, cost, block, timestamp) to show the UI shape.
            The contract addresses linked below are the real, deployed, source-verified KasuwaShield contracts on Somnia
            Shannon — click through to confirm on Blockscout yourself.
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
              <div className="flex justify-between py-1 border-b border-slate-800/40" suppressHydrationWarning>
                <span className="text-slate-400">Asset & Portfolio Exposure:</span>
                <span className="text-white font-bold">
                  {mockProofData.asset} (${mockProofData.exposureUSD.toLocaleString("en-US")})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/40" suppressHydrationWarning>
                <span className="text-slate-400">Target Protection:</span>
                <span className="text-emerald-400 font-bold">${mockProofData.protectedUSD.toLocaleString("en-US")}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/40" suppressHydrationWarning>
                <span className="text-slate-400">Contracts Purchased:</span>
                <span className="text-slate-200">
                  {mockProofData.requiredContracts.toLocaleString("en-US")} contracts @ ${mockProofData.entryPrice}
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
                <span className="text-slate-400 block">KasuwaPolicy.sol (v2)</span>
                <span className="text-cyan-300 font-mono text-[11px]">{mockProofData.policyContract}</span>
              </div>
              <a
                href={`${explorerBase}${mockProofData.policyContract}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 sm:mt-0 text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-bold"
              >
                <span>View Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div>
                <span className="text-slate-400 block">KasuwaExecutor.sol (EIP-7702)</span>
                <span className="text-cyan-300 font-mono text-[11px]">{mockProofData.executorContract}</span>
              </div>
              <a
                href={`${explorerBase}${mockProofData.executorContract}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 sm:mt-0 text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-bold"
              >
                <span>View Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div>
                <span className="text-slate-400 block">KasuwaReactiveHandler.sol</span>
                <span className="text-cyan-300 font-mono text-[11px]">{mockProofData.reactiveHandlerContract}</span>
              </div>
              <a
                href={`${explorerBase}${mockProofData.reactiveHandlerContract}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 sm:mt-0 text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-bold"
              >
                <span>View Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div>
                <span className="text-slate-400 block">DreamDEX Collateral Token (USDso)</span>
                <span className="text-cyan-300 font-mono text-[11px]">{mockProofData.collateralToken}</span>
              </div>
              <a
                href={`${explorerBase}${mockProofData.collateralToken}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 sm:mt-0 text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-bold"
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
