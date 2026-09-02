"use client";

import React from "react";
import { ReactivityMonitor } from "../ReactivityMonitor";
import { OnChainProofPanel } from "../OnChainProofPanel";
import { AuditLedger } from "../AuditLedger";
import { ReactivityEvent, AuditRecord } from "../../hooks/useRiskEngineState";

interface ReactivityAndProofViewProps {
  reactivityLogs: ReactivityEvent[];
  latencyMetrics: {
    eventDetectionMs: number;
    riskEvaluationMs: number;
    handlerDispatchMs: number;
    validatorConfirmationMs: number;
    totalLatencyMs: number;
  };
  auditLedger: AuditRecord[];
}

export function ReactivityAndProofView({
  reactivityLogs,
  latencyMetrics,
  auditLedger,
}: ReactivityAndProofViewProps) {
  return (
    <div className="space-y-6">
      {/* Top Row: Somnia Reactivity Stream & Proof Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <ReactivityMonitor
            reactivityLogs={reactivityLogs}
            latencyMetrics={latencyMetrics}
          />
        </div>
        <div className="lg:col-span-6">
          <OnChainProofPanel isLiveMode={false} />
        </div>
      </div>

      {/* Bottom Row: Tabular Audit Ledger */}
      <AuditLedger auditLedger={auditLedger} />
    </div>
  );
}
