"use client";

import React from "react";
import { ExecutionPipeline } from "../ExecutionPipeline";
import { DelegatedExecutionPanel } from "../DelegatedExecutionPanel";
import { PermissionBoundary } from "../PermissionBoundary";
import { SystemState } from "../../hooks/useRiskEngineState";

interface ExecutionPipelineViewProps {
  systemState: SystemState;
  riskScore: number;
  delegationMeta: {
    type: string;
    accountEOA: string;
    delegatedHandler: string;
    sessionAuthStatus: string;
    authNonce: string;
    chainId: number;
    permissionModel: string;
    userSignatureState: string;
    popupRequired: string;
    autonomousExecution: string;
    isDemo?: boolean;
  };
}

export function ExecutionPipelineView({
  systemState,
  riskScore,
  delegationMeta,
}: ExecutionPipelineViewProps) {
  return (
    <div className="space-y-6">
      {/* 5-Stage Autonomous Execution Pipeline */}
      <ExecutionPipeline systemState={systemState} riskScore={riskScore} />

      {/* Security & Delegation Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <DelegatedExecutionPanel delegationMeta={delegationMeta} />
        </div>
        <div className="lg:col-span-6">
          <PermissionBoundary />
        </div>
      </div>
    </div>
  );
}
