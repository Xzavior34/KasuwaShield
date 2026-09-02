"use client";

import React from "react";
import { useRiskEngineState } from "../../hooks/useRiskEngineState";
import { AppShell } from "../../components/shell/AppShell";
import { ExecutionPipelineView } from "../../components/execution/ExecutionPipelineView";
import { StressTestEngine } from "../../components/demo/StressTestEngine";

export default function ExecutionPage() {
  const {
    systemState,
    isSimulationRunning,
    simulationProgress,
    showFinalSummaryCard,
    currentHedgeCoveragePct,
    protectionGapPct,
    riskScore,
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
    >
      <div className="space-y-6">
        <StressTestEngine
          systemState={systemState}
          isSimulationRunning={isSimulationRunning}
          simulationProgress={simulationProgress}
          showFinalSummaryCard={showFinalSummaryCard}
        />

        <ExecutionPipelineView
          systemState={systemState}
          riskScore={riskScore}
          delegationMeta={delegationMeta}
        />
      </div>
    </AppShell>
  );
}
