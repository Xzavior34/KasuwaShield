"use client";

import React, { useState } from "react";
import { useRiskEngineState } from "../hooks/useRiskEngineState";
import { AppShell, ViewTab } from "../components/shell/AppShell";
import { RiskEngineView } from "../components/risk/RiskEngineView";
import { ExecutionPipelineView } from "../components/execution/ExecutionPipelineView";
import { ReactivityAndProofView } from "../components/proof/ReactivityAndProofView";
import { StressTestEngine } from "../components/demo/StressTestEngine";

export default function TerminalDashboard() {
  const [activeView, setActiveView] = useState<ViewTab>("ALL");

  const {
    systemState,
    isSimulationRunning,
    simulationProgress,
    showFinalSummaryCard,
    portfolioExposureUSD,
    downsideThresholdPct,
    protectedNotionalUSD,
    targetHedgeCoveragePct,
    currentHedgeCoveragePct,
    protectionGapPct,
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
      protectionGapPct={protectionGapPct}
      activeView={activeView}
      setActiveView={setActiveView}
    >
      <div className="space-y-6">
        {/* Stress-Test Cascade Engine Controls */}
        <StressTestEngine
          systemState={systemState}
          isSimulationRunning={isSimulationRunning}
          simulationProgress={simulationProgress}
          showFinalSummaryCard={showFinalSummaryCard}
        />

        {/* View Switcher Routing */}
        {activeView === "ALL" && (
          <div className="space-y-6">
            <RiskEngineView
              priceHistory={priceHistory}
              currentBtcPrice={currentBtcPrice}
              currentEthPrice={currentEthPrice}
              systemState={systemState}
              portfolioExposureUSD={portfolioExposureUSD}
              downsideThresholdPct={downsideThresholdPct}
              protectedNotionalUSD={protectedNotionalUSD}
              targetHedgeCoveragePct={targetHedgeCoveragePct}
              currentHedgeCoveragePct={currentHedgeCoveragePct}
              protectionGapPct={protectionGapPct}
              riskDeltaUSD={riskDeltaUSD}
              priceDropPct={priceDropPct}
              riskScore={riskScore}
              protectionLadder={protectionLadder}
            />

            <ExecutionPipelineView
              systemState={systemState}
              riskScore={riskScore}
              delegationMeta={delegationMeta}
            />

            <ReactivityAndProofView
              reactivityLogs={reactivityLogs}
              latencyMetrics={latencyMetrics}
              auditLedger={auditLedger}
            />
          </div>
        )}

        {activeView === "RISK" && (
          <RiskEngineView
            priceHistory={priceHistory}
            currentBtcPrice={currentBtcPrice}
            currentEthPrice={currentEthPrice}
            systemState={systemState}
            portfolioExposureUSD={portfolioExposureUSD}
            downsideThresholdPct={downsideThresholdPct}
            protectedNotionalUSD={protectedNotionalUSD}
            targetHedgeCoveragePct={targetHedgeCoveragePct}
            currentHedgeCoveragePct={currentHedgeCoveragePct}
            protectionGapPct={protectionGapPct}
            riskDeltaUSD={riskDeltaUSD}
            priceDropPct={priceDropPct}
            riskScore={riskScore}
            protectionLadder={protectionLadder}
          />
        )}

        {activeView === "EXECUTION" && (
          <ExecutionPipelineView
            systemState={systemState}
            riskScore={riskScore}
            delegationMeta={delegationMeta}
          />
        )}

        {activeView === "PROOF" && (
          <ReactivityAndProofView
            reactivityLogs={reactivityLogs}
            latencyMetrics={latencyMetrics}
            auditLedger={auditLedger}
          />
        )}
      </div>
    </AppShell>
  );
}
