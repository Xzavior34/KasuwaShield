"use client";

import React from "react";
import { RiskEngineChart } from "../RiskEngineChart";
import { RiskMathPanel } from "../RiskMathPanel";
import { HedgeRatioDial } from "../HedgeRatioDial";
import { ProtectionLadder } from "../ProtectionLadder";
import { PricePoint, SystemState, ProtectionLadderItem } from "../../hooks/useRiskEngineState";

interface RiskEngineViewProps {
  priceHistory: PricePoint[];
  currentBtcPrice: number;
  currentEthPrice: number;
  systemState: SystemState;
  portfolioExposureUSD: number;
  downsideThresholdPct: number;
  protectedNotionalUSD: number;
  targetHedgeCoveragePct: number;
  currentHedgeCoveragePct: number;
  protectionGapPct: number;
  riskDeltaUSD: number;
  priceDropPct: number;
  riskScore: number;
  protectionLadder: ProtectionLadderItem[];
}

export function RiskEngineView({
  priceHistory,
  currentBtcPrice,
  currentEthPrice,
  systemState,
  portfolioExposureUSD,
  downsideThresholdPct,
  protectedNotionalUSD,
  targetHedgeCoveragePct,
  currentHedgeCoveragePct,
  protectionGapPct,
  riskDeltaUSD,
  priceDropPct,
  riskScore,
  protectionLadder,
}: RiskEngineViewProps) {
  return (
    <div className="space-y-6">
      {/* Top Bento Row: Dual-Axis Recharts Chart & Circular SVG Dial */}
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
            protectionGapPct={protectionGapPct}
          />
        </div>
      </div>

      {/* Middle Bento Row: Dynamic Risk Formulas & Protection Ladder */}
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
          <ProtectionLadder protectionLadder={protectionLadder} />
        </div>
      </div>
    </div>
  );
}
