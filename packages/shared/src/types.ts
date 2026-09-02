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
  enabled: boolean;
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
