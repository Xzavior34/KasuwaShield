import { ProtectionParams, ProtectionRecommendation, BinaryMarketInfo, RiskPolicy } from "../../shared/src/index.js";
import { evaluateMarketQuality } from "./market-quality.js";

/**
 * Standard Normal Cumulative Distribution Function approximation (Abramowitz & Stegun)
 */
export function standardNormalCDF(x: number): number {
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;
  const c = 0.39894228;

  if (x >= 0.0) {
    const t = 1.0 / (1.0 + p * x);
    return 1.0 - c * Math.exp((-x * x) / 2.0) * t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
  } else {
    const t = 1.0 / (1.0 - p * x);
    return c * Math.exp((-x * x) / 2.0) * t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
  }
}

/**
 * Black-Scholes Binary Cash-or-Nothing Downside Payout Probability (N(-d2))
 */
export function calculateBinaryDownsideProbability(
  spotPrice: number,
  strikePrice: number,
  volatilityAnnualized: number,
  timeToExpiryYears: number,
  riskFreeRate: number = 0.04
): number {
  if (timeToExpiryYears <= 0 || volatilityAnnualized <= 0) {
    return spotPrice < strikePrice ? 1.0 : 0.0;
  }
  const d2 =
    (Math.log(spotPrice / strikePrice) + (riskFreeRate - 0.5 * volatilityAnnualized * volatilityAnnualized) * timeToExpiryYears) /
    (volatilityAnnualized * Math.sqrt(timeToExpiryYears));
  return Number(standardNormalCDF(-d2).toFixed(4));
}

/**
 * Conditional Value at Risk (CVaR / Expected Shortfall at 97.5% confidence)
 */
export function calculateCVaR975(
  exposureUSD: number,
  volatilityDaily: number
): number {
  // Alpha = 0.025 (97.5% confidence level), standard normal VaR multiplier = 1.96, CVaR multiplier approx 2.338
  const cvarMultiplier = 2.338;
  return Number((exposureUSD * volatilityDaily * cvarMultiplier).toFixed(2));
}

/**
 * Optimal Kelly Criterion Fraction with downside sizing cap
 */
export function calculateKellyHedgeFraction(
  downsideProbability: number,
  contractPrice: number
): number {
  if (contractPrice <= 0 || contractPrice >= 1.0) return 0.5;
  const payoutOdds = 1.0 / contractPrice;
  const q = 1.0 - downsideProbability;
  const fStar = (downsideProbability * payoutOdds - q) / payoutOdds;
  return Number(Math.max(0.1, Math.min(1.0, fStar)).toFixed(4));
}

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

  // Kelly fraction computed from the market's OWN quoted probability (DreamDEX
  // prices are already probabilities in 1e6 units — see docs/TECHNICAL_RECONNAISSANCE.md)
  // rather than an invented volatility input. In an efficient market this comes out
  // low (little edge) — that is the formula working correctly, not a bug.
  const marketImpliedDownsideProbability = market.bestAskProb ?? effectiveContractPrice;
  const kellyHedgeFraction = calculateKellyHedgeFraction(marketImpliedDownsideProbability, effectiveContractPrice);

  const budgetExceeded = estimatedCostUSD > maxBudgetUSD || estimatedCostUSD > policy.maxBudgetUSD;
  const priceTooHigh = effectiveContractPrice > policy.maxContractPrice;
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
    reason,
    kellyHedgeFraction
  };
}
