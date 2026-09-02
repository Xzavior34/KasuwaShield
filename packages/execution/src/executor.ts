import {
  BinaryMarketInfo,
  ProtectionParams,
  PositionRecord,
  RiskPolicy,
  DEFAULT_RISK_POLICY,
  SOMNIA_SHANNON_CONFIG
} from "../../shared/src/index.js";
import { calculateProtection } from "../../risk-engine/src/index.js";

export interface ExecutionResult {
  success: boolean;
  position?: PositionRecord;
  txHash?: string;
  error?: string;
}

export function probabilityToPrice(prob: number): number {
  return Math.min(0.99, Math.max(0.01, prob));
}

export async function executeDownsideProtection(
  params: ProtectionParams,
  market: BinaryMarketInfo,
  privateKey: string,
  policy: RiskPolicy = DEFAULT_RISK_POLICY,
  rpcUrl?: string,
  wsRpcUrl?: string
): Promise<ExecutionResult> {
  // 1. Calculate Protection Recommendation & Enforce Policy
  const rec = calculateProtection(params, market, policy);

  if (rec.recommendation === "SKIP" || rec.recommendation === "WAIT") {
    return {
      success: false,
      error: `Execution blocked by risk policy: ${rec.reason}`,
    };
  }

  const now = Math.floor(Date.now() / 1000);
  if (Number(market.expiry) <= now + 30) {
    return {
      success: false,
      error: "Market is within 30 seconds of expiry. Execution aborted for safety.",
    };
  }

  try {
    const contractsToBuy = rec.requiredContracts;
    const askPrice = market.bestAskProb ?? 0.35;
    const priceLimit = Number((askPrice * (1 + params.maxSlippagePercent / 100)).toFixed(4));

    const simulatedTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

    const positionRecord: PositionRecord = {
      positionId: `pos-${market.asset.toLowerCase()}-${Date.now()}`,
      asset: market.asset,
      marketId: market.marketId,
      portfolioExposureUSD: params.exposureUSD,
      targetProtectionUSD: rec.targetProtectedUSD,
      contractsBought: contractsToBuy,
      costUSD: rec.estimatedCostUSD,
      maxPayoutUSD: contractsToBuy * 1.0,
      contractPrice: askPrice,
      maxSlippagePercent: params.maxSlippagePercent,
      openTimestamp: Date.now(),
      marketExpiry: Number(market.expiry) * 1000,
      status: "OPEN",
      txHash: simulatedTxHash,
      policyId: policy.policyId || "default-policy",
    };

    return {
      success: true,
      position: positionRecord,
      txHash: simulatedTxHash,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Execution failed: ${err.message}`,
    };
  }
}
