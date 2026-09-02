export interface BinaryMarketInfo {
  pool: string;
  marketId: string;
  asset: string;
  expiry: bigint;
  intervalSec: bigint;
  collateral: string;
  yesId?: bigint;
  noId?: bigint;
  outcomeToken?: string;
  bestBidProb?: number;
  bestAskProb?: number;
  spread?: number;
  liquidityContracts?: number;
  status?: number; // 0=Listed, 1=Trading, 2=Locked, 3=Settling, 4=Resolved, 5=Voided
  finalized?: boolean;
}

export interface ProtectionParams {
  exposureUSD: number;
  protectionPercent: number; // e.g. 30 for 30%
  contractPrice: number;    // e.g. 0.35 ($0.35 per contract paying $1.00)
  maxBudgetUSD: number;     // e.g. 10.00
  maxSlippagePercent: number; // e.g. 2.0
  windowMinutes: number;
}

export type RecommendationType = "PROTECT" | "WAIT" | "SKIP";

export interface ProtectionRecommendation {
  recommendation: RecommendationType;
  targetProtectedUSD: number;
  requiredContracts: number;
  estimatedCostUSD: number;
  maxCostUSD: number;
  effectiveProtectionCoverage: number; // e.g. 30%
  marketQualityScore: number; // 0 - 100
  marketQualityRating: "GOOD" | "FAIR" | "POOR" | "UNAVAILABLE";
  reason: string;
}

export interface RiskPolicy {
  maxProtectionPercent: number;
  maxBudgetUSD: number;
  maxContractPrice: number;
  maxSlippagePercent: number;
  allowedAssets: string[];
  allowedWindowsMinutes: number[];
  enabled: boolean;
}

export interface PositionRecord {
  positionId: string;
  userAddress: string;
  marketId: string;
  poolAddress: string;
  asset: string;
  underlyingExposureUSD: number;
  protectionTargetUSD: number;
  contractQuantity: number;
  contractPrice: number;
  totalCostUSD: number;
  entryTimestamp: number;
  expiryTimestamp: number;
  outcomeDirection: "DOWN" | "UP";
  status: "ACTIVE" | "SETTLED_WIN" | "SETTLED_LOSS" | "REDEEMED" | "VOIDED";
  executionTxHash?: string;
  settlementTxHash?: string;
  reactivityTxHash?: string;
  redemptionTxHash?: string;
  payoutUSD?: number;
}
