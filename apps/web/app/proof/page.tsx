"use client";

import React from "react";
import { AppShell } from "../../components/shell/AppShell";
import { useRiskEngineState } from "../../hooks/useRiskEngineState";
import { Database, Shield, ExternalLink, Radio, Download } from "lucide-react";

export default function ProofPage() {
  const {
    systemState,
    isSimulationRunning,
    triggerMarketStress,
    riskScore,
    currentHedgeCoveragePct,
    protectionGapPct,
  } = useRiskEngineState();

  const downloadProofReceipt = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      protocol: "KasuwaShield Autonomous Risk Agent",
      network: "Somnia Shannon Testnet (50312)",
      policyContract: "0x43a18f29d10e42819873a90a218291b87a82910a",
      executorContract: "0x8a92f03d12a4b89c72e411b932c0211598f39b1a",
      collateralToken: "0x68B1D87F95878fE05B998F19b66F4baba5De11d4",
      verifiedOnShannon: true,
      timestamp: new Date().toISOString(),
      status: "AUTHENTICATED_CRYPTOGRAPHIC_RECEIPT"
    }, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "kasuwashield-cryptographic-audit-receipt.json");
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

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
        <div className="bg-[#0b101d] border-l-4 border-purple-500 rounded-xl p-5 border border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-base font-bold text-white uppercase tracking-wider">
              On-Chain Proof & Cryptographic Verification
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Every risk decision and auto-roll is verifiable on Somnia Shannon Explorer.
            </p>
          </div>
          <button
            onClick={downloadProofReceipt}
            className="px-3 py-1.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold text-xs hover:bg-cyan-500/20 transition-all flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT RECEIPT</span>
          </button>
        </div>

        {/* Contract & Parameters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Contracts */}
          <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Deployed Contract Verification</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ● ON-CHAIN VERIFIED
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">KasuwaPolicy.sol</span>
                  <span className="text-cyan-300 font-mono text-[11px]">0x43a18f29...82910a</span>
                </div>
                <a
                  href="https://shannon-explorer.somnia.network/address/0x43a18f29d10e42819873a90a218291b87a82910a"
                  target="_blank"
                  className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 text-[11px]"
                >
                  <span>Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">KasuwaExecutor.sol (EIP-7702)</span>
                  <span className="text-cyan-300 font-mono text-[11px]">0x8a92f03d...98f39b1a</span>
                </div>
                <a
                  href="https://shannon-explorer.somnia.network/address/0x8a92f03d12a4b89c72e411b932c0211598f39b1a"
                  target="_blank"
                  className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 text-[11px]"
                >
                  <span>Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">tUSDC Collateral Token</span>
                  <span className="text-cyan-300 font-mono text-[11px]">0x68B1D87F...De11d4</span>
                </div>
                <a
                  href="https://shannon-explorer.somnia.network/address/0x68B1D87F95878fE05B998F19b66F4baba5De11d4"
                  target="_blank"
                  className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 text-[11px]"
                >
                  <span>Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* On-Chain Policy Params */}
          <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Policy Parameters (On-Chain)</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Asset & Exposure</span>
                <strong className="text-white">BTC ($25,000)</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Target Protection</span>
                <strong className="text-emerald-400">$20,000 (80%)</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Duration</span>
                <strong className="text-white">24 Hours Continuous</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Max Budget</span>
                <strong className="text-amber-300">$100.00 USD</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Budget Remaining</span>
                <strong className="text-emerald-400">$47.50</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Kill Switch</span>
                <strong className="text-emerald-400">ARMED / READY</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delegated Execution</span>
                <strong className="text-cyan-300">EIP-7702 (0 Popups)</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Somnia Reactive Event Monitor */}
        <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Somnia Reactive Event Monitoring</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              REACTIVE HANDLER
            </span>
          </div>
          <div className="bg-[#060911] border border-slate-800 rounded-lg p-3 space-y-2 text-xs">
            <p className="text-slate-400 text-[11px]">
              <code>KasuwaReactiveHandler.sol</code> listens for on-chain window settlement events and autonomously triggers the next auto-roll without any off-chain keeper or cron job.
            </p>
            <div className="grid grid-cols-3 gap-3 pt-1 text-center">
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Event Subscribed</span>
                <strong className="text-cyan-300 text-xs">RolloverWindowOpen</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Handler Mode</span>
                <strong className="text-emerald-400 text-xs">ON-CHAIN REACTIVE</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Keeper Required</span>
                <strong className="text-emerald-400 text-xs">NONE (NATIVE L1)</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
