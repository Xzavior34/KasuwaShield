"use client";

import React from "react";
import { useRiskEngineState } from "../../hooks/useRiskEngineState";
import { AppShell } from "../../components/shell/AppShell";
import { ReactivityAndProofView } from "../../components/proof/ReactivityAndProofView";
import { StressTestEngine } from "../../components/demo/StressTestEngine";

export default function ProofIndexPage() {
  const {
    systemState,
    isSimulationRunning,
    simulationProgress,
    showFinalSummaryCard,
    currentHedgeCoveragePct,
    protectionGapPct,
    riskScore,
    reactivityLogs,
    latencyMetrics,
    auditLedger,
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
    >
      <div className="space-y-6">
        <StressTestEngine
          systemState={systemState}
          isSimulationRunning={isSimulationRunning}
          simulationProgress={simulationProgress}
          showFinalSummaryCard={showFinalSummaryCard}
        />

        <ReactivityAndProofView
          reactivityLogs={reactivityLogs}
          latencyMetrics={latencyMetrics}
          auditLedger={auditLedger}
        />
      </div>
    </AppShell>
  );
}
