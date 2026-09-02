"use client";

import React, { useState } from "react";
import { DemoTimeline } from "../DemoTimeline";
import { ProtectionRestoredCard } from "../ProtectionRestoredCard";
import { SystemState } from "../../hooks/useRiskEngineState";

interface StressTestEngineProps {
  systemState: SystemState;
  isSimulationRunning: boolean;
  simulationProgress: number;
  showFinalSummaryCard: boolean;
}

export function StressTestEngine({
  systemState,
  isSimulationRunning,
  simulationProgress,
  showFinalSummaryCard,
}: StressTestEngineProps) {
  const [dismissSummary, setDismissSummary] = useState<boolean>(false);

  return (
    <div className="space-y-4">
      {/* Active Simulation Compact Timeline Bar */}
      {isSimulationRunning && (
        <DemoTimeline
          systemState={systemState}
          simulationProgress={simulationProgress}
        />
      )}

      {/* Final Protection Restored Screenshot Card */}
      {showFinalSummaryCard && !dismissSummary && (
        <ProtectionRestoredCard onDismiss={() => setDismissSummary(true)} />
      )}
    </div>
  );
}
