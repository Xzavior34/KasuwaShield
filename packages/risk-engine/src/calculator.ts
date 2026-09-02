import { ProtectionParams, ProtectionRecommendation, BinaryMarketInfo, RiskPolicy } from "../../shared/src/index.js";
import { evaluateMarketQuality } from "./market-quality.js";

export function calculateProtection(
  params: ProtectionParams,
  market: BinaryMarketInfo,
  policy: RiskPolicy
): ProtectionRecommendation {
  const { exposureUSD, protectionPercent, contractPrice, maxBudgetUSD, maxSlippagePercent } = params;

  const effectiveProtectionPercent = Math.min(protectionPercent, policy.maxProtectionPercent);
  const targetProtectedUSD = (exposureUSD * effectiveProtectionPercent) / 100;
  const requiredContracts = Math.ceil(targetProtectedUSD);

  const effectiveContractPrice = contractPrice > 0 ? contractPrice : (market.bestAskProb ?? 0.35);
  const estimatedCostUSD = Number((requiredContracts * effectiveContractPrice).toFixed(2));
  
  const slippageMultiplier = 1 + (maxSlippagePercent / 100);
  const maxCostUSD = Number((estimatedCostUSD * slippageMultiplier).toFixed(2));

  const quality = evaluateMarketQuality(market, requiredContracts, maxBudgetUSD, maxSlippagePercent);

  const budgetExceeded = estimatedCostUSD > maxBudgetUSD || estimatedCostUSD > policy.maxBudgetUSD;
  const priceTooHigh = effectiveContractPrice > policy.maxContractPrice;
  const slippageExceeded = (market.spread ?? 0) > (maxSlippagePercent / 100);
  const marketUnavailable = quality.rating === "UNAVAILABLE";

  let recommendation: "PROTECT" | "WAIT" | "SKIP" = "PROTECT";
  let reason = "Protection strategy meets policy and liquidity requirements.";

  if (marketUnavailable || !policy.enabled) {
    recommendation = "SKIP";
    reason = "Target Event Contract market is currently locked, expired, or disabled.";
  } else if (budgetExceeded) {
    recommendation = "SKIP";
    reason = `Estimated cost ($${estimatedCostUSD.toFixed(2)}) exceeds maximum budget limit ($${maxBudgetUSD.toFixed(2)}).`;
  } else if (priceTooHigh) {
    recommendation = "WAIT";
    reason = `Current contract price ($${effectiveContractPrice.toFixed(2)}) exceeds maximum policy price threshold ($${policy.maxContractPrice.toFixed(2)}).`;
  } else if (quality.rating === "POOR") {
    recommendation = "WAIT";
    reason = `Market quality score (${quality.score}/100) is low due to orderbook illiquidity or wide spread.`;
  }

  return {
    recommendation,
    targetProtectedUSD,
    requiredContracts,
    estimatedCostUSD,
    maxCostUSD,
    effectiveProtectionCoverage: effectiveProtectionPercent,
    marketQualityScore: quality.score,
    marketQualityRating: quality.rating,
    reason
  };
}
