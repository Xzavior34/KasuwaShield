export interface ProtectionParams {
  exposureUSD: number;
  protectionPercent: number;
  contractPrice: number;
  maxBudgetUSD: number;
  maxSlippagePercent: number;
  durationHours?: number;
}

export interface RiskPolicy {
  policyId?: string;
  maxProtectionPercent: number;
  maxBudgetUSD: number;
  remainingBudgetUSD: number;
  maxContractPrice: number;
  maxSlippagePercent: number;
  durationSeconds: number;
  allowedAssets?: string[];
  allowedContractType?: "DOWN" | "PUT" | "BOTH";
  minLiquidityUSD?: number;
  emergencyStop?: boolean;
  enabled: boolean;
}

export type HedgeLifecycleState =
  | "UNPROTECTED"
  | "RISK_DETECTED"
  | "HEDGE_CALCULATED"
  | "HEDGE_PENDING"
  | "HEDGE_ACTIVE"
  | "MONITORING"
  | "ROLLOVER_REQUIRED"
  | "REHEDGE_PENDING"
  | "SETTLEMENT_PENDING"
  | "SETTLED_PROFIT"
  | "SETTLED_LOSS"
  | "EXECUTION_FAILED"
  | "RECOVERY_REQUIRED";

export interface HedgeStateTransition {
  timestamp: string;
  fromState: HedgeLifecycleState;
  toState: HedgeLifecycleState;
  reason: string;
  marketId: string;
  asset: string;
  hedgeRatioPct: number;
  targetProtectionUSD: number;
  executionStatus: "SUCCESS" | "PENDING" | "FAILED" | "RETRYING";
  txHash?: string;
  blockNumber?: number;
}

export interface ProtectionRecommendation {
  recommendation: "PROTECT" | "WAIT" | "SKIP";
  targetProtectedUSD: number;
  requiredContracts: number;
  estimatedCostUSD: number;
  maxCostUSD: number;
  effectiveProtectionCoverage: number;
  marketQualityScore: number;
  marketQualityRating: "GOOD" | "FAIR" | "POOR" | "UNAVAILABLE";
  reason: string;
}

export interface EphemeralSessionKey {
  address: `0x${string}`;
  privateKey: `0x${string}`;
  policyId: string;
  userEOA: `0x${string}`;
  authorizedAt: number;
  expiresAt: number;
  remainingBudgetUSD: number;
}

export interface AutoRollEventLog {
  policyId: string;
  rollNumber: number;
  marketId: string;
  asset: string;
  contracts: number;
  costUSD: number;
  remainingBudgetUSD: number;
  timestamp: number;
  txHash: `0x${string}`;
}

export interface BinaryMarketInfo {
  pool: string;
  marketId: string;
  asset: string;
  expiry: bigint;
  intervalSec: bigint;
  collateral: string;
  bestBidProb?: number;
  bestAskProb?: number;
  spread?: number;
  liquidityContracts?: number;
  status: number;
  finalized: boolean;
}
