"use client";

import React from "react";
import { useRiskEngineState } from "../hooks/useRiskEngineState";
import { AppShell } from "../components/AppShell";
import { RiskEngineChart } from "../components/RiskEngineChart";
import { RiskMathPanel } from "../components/RiskMathPanel";
import { HedgeRatioDial } from "../components/HedgeRatioDial";
import { ExecutionPipeline } from "../components/ExecutionPipeline";
import { DelegatedExecutionPanel } from "../components/DelegatedExecutionPanel";
import { PermissionBoundary } from "../components/PermissionBoundary";
import { ReactivityMonitor } from "../components/ReactivityMonitor";
import { OnChainProofPanel } from "../components/OnChainProofPanel";
import { ProtectionLadder } from "../components/ProtectionLadder";
import { AuditLedger } from "../components/AuditLedger";
import { DemoTimeline } from "../components/DemoTimeline";

export default function TerminalDashboard() {
  const {
    systemState,
    isSimulationRunning,
    simulationProgress,
    portfolioExposureUSD,
    downsideThresholdPct,
    protectedNotionalUSD,
    targetHedgeCoveragePct,
    currentHedgeCoveragePct,
    riskScore,
    priceHistory,
    currentBtcPrice,
    currentEthPrice,
    latencyMetrics,
    reactivityLogs,
    auditLedger,
    protectionLadder,
    priceDropPct,
    riskDeltaUSD,
    delegationMeta,
    triggerMarketStress,
  } = useRiskEngineState();

  return (
    <AppShell
      systemState={systemState}
      isSimulationRunning={isSimulationRunning}
      onTriggerStressTest={triggerMarketStress}
      riskScore={riskScore}
      coveragePct={currentHedgeCoveragePct}
    >
      <div className="space-y-6">
        {/* Active Simulation Compact Timeline Bar */}
        {isSimulationRunning && (
          <DemoTimeline
            systemState={systemState}
            simulationProgress={simulationProgress}
          />
        )}

        {/* Bento Row 1: Primary Risk Chart & Hedge Coverage Dial */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <RiskEngineChart
              priceHistory={priceHistory}
              currentBtcPrice={currentBtcPrice}
              currentEthPrice={currentEthPrice}
              systemState={systemState}
            />
          </div>
          <div className="lg:col-span-4 flex flex-col justify-between">
            <HedgeRatioDial
              targetCoveragePct={targetHedgeCoveragePct}
              currentCoveragePct={currentHedgeCoveragePct}
            />
          </div>
        </div>

        {/* Bento Row 2: Risk Mathematics & Autonomous Execution Pipeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <RiskMathPanel
              portfolioExposureUSD={portfolioExposureUSD}
              downsideThresholdPct={downsideThresholdPct}
              protectedNotionalUSD={protectedNotionalUSD}
              currentHedgeCoveragePct={currentHedgeCoveragePct}
              riskDeltaUSD={riskDeltaUSD}
              priceDropPct={priceDropPct}
              riskScore={riskScore}
            />
          </div>
          <div className="lg:col-span-7">
            <ExecutionPipeline
              systemState={systemState}
              riskScore={riskScore}
            />
          </div>
        </div>

        {/* Bento Row 3: EIP-7702 Delegated Execution & Security Boundaries */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <DelegatedExecutionPanel delegationMeta={delegationMeta} />
          </div>
          <div className="lg:col-span-6">
            <PermissionBoundary />
          </div>
        </div>

        {/* Bento Row 4: Somnia Reactivity Stream & On-Chain Proof */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <ReactivityMonitor
              reactivityLogs={reactivityLogs}
              latencyMetrics={latencyMetrics}
            />
          </div>
          <div className="lg:col-span-6">
            <OnChainProofPanel />
          </div>
        </div>

        {/* Bento Row 5: Protection Ladder History & Audit Ledger */}
        <div className="space-y-6">
          <ProtectionLadder protectionLadder={protectionLadder} />
          <AuditLedger auditLedger={auditLedger} />
        </div>
      </div>
    </AppShell>
  );
}
