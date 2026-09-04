/**
 * Real, standalone risk-math helpers for the /risk page.
 *
 * These are deliberately duplicated here rather than imported from
 * `packages/risk-engine` -- that package isn't a declared dependency of
 * `apps/web` (see apps/web/package.json), and this app has no verified local
 * build environment to confirm a new cross-package workspace import resolves
 * correctly at build time. Duplicating a few small, pure functions is safer
 * than risking a broken Vercel build over an unverified import.
 *
 * The canonical, unit-tested versions of the same formulas live in
 * packages/risk-engine/src/calculator.ts (see scripts/run-tests.ts for their
 * test coverage) -- keep these two in sync if the formulas change.
 */

/** Daily volatility (stddev of simple returns) computed from a real price series. */
export function computeDailyVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length;
  return Math.sqrt(variance);
}

/** 95% one-tailed Value at Risk (z-score 1.645), from a real exposure and a real computed volatility. */
export function calculateValueAtRisk95(exposureUSD: number, dailyVolatility: number): number {
  return Number((exposureUSD * dailyVolatility * 1.645).toFixed(2));
}

/**
 * Optimal Kelly Criterion fraction, floored at 0.1 and capped at 1.0.
 * Identical formula to packages/risk-engine/src/calculator.ts::calculateKellyHedgeFraction.
 * With an efficient-market downside probability this legitimately comes out low
 * (often hitting the 0.1 floor) -- that's the formula working correctly, not a bug.
 */
export function calculateKellyHedgeFraction(downsideProbability: number, contractPrice: number): number {
  if (contractPrice <= 0 || contractPrice >= 1.0) return 0.5;
  const payoutOdds = 1.0 / contractPrice;
  const q = 1.0 - downsideProbability;
  const fStar = (downsideProbability * payoutOdds - q) / payoutOdds;
  return Number(Math.max(0.1, Math.min(1.0, fStar)).toFixed(4));
}

export type VolRegime = "LOW_VOL" | "MED_VOL" | "HIGH_VOL";

/** Simple, transparent thresholding of a real computed daily volatility into a regime label. */
export function classifyVolRegime(dailyVolatility: number): VolRegime {
  if (dailyVolatility < 0.02) return "LOW_VOL";
  if (dailyVolatility < 0.05) return "MED_VOL";
  return "HIGH_VOL";
}
