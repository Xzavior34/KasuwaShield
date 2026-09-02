"use client";

import React from "react";
import { useRiskEngineState } from "../../hooks/useRiskEngineState";
import { AppShell } from "../../components/shell/AppShell";
import { RiskEngineView } from "../../components/risk/RiskEngineView";
import { StressTestEngine } from "../../components/demo/StressTestEngine";

export default function RiskPage() {
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
    protectionLadder,
    priceDropPct,
    riskDeltaUSD,
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
      </div>
    </AppShell>
  );
}
