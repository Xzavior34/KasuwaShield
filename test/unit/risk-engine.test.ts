import { describe, it, expect } from "vitest";
import { calculateProtection, evaluateMarketQuality } from "../../packages/risk-engine/src/index.js";
import { DEFAULT_RISK_POLICY, BinaryMarketInfo } from "../../packages/shared/src/index.js";

describe("Risk Engine & Protection Sizing", () => {
  const baseMarket: BinaryMarketInfo = {
    pool: "0x1111111111111111111111111111111111111111",
    marketId: "0x2222222222222222222222222222222222222222222222222222222222222222",
    asset: "BTC",
    expiry: BigInt(Math.floor(Date.now() / 1000) + 1200),
    intervalSec: 900n,
    collateral: "0x68B1D87F95878fE05B998F19b66F4baba5De11d4",
    bestBidProb: 0.30,
    bestAskProb: 0.35,
    spread: 0.05,
    liquidityContracts: 500,
    status: 1,
    finalized: false,
  };

  it("calculates 30% downside protection for $500 BTC exposure correctly", () => {
    const params = {
      exposureUSD: 500,
      protectionPercent: 30,
      contractPrice: 0.35,
      maxBudgetUSD: 10.0,
      maxSlippagePercent: 2.0,
      windowMinutes: 15,
    };

    const res = calculateProtection(params, baseMarket, DEFAULT_RISK_POLICY);

    expect(res.targetProtectedUSD).toBe(150);
    expect(res.requiredContracts).toBe(150);
    expect(res.estimatedCostUSD).toBe(52.5); // 150 * 0.35 = $52.50
    expect(res.recommendation).toBe("SKIP"); // budget $10.00 is exceeded by $52.50
  });

  it("approves protection when cost is within budget", () => {
    const params = {
      exposureUSD: 50,
      protectionPercent: 30,
      contractPrice: 0.35,
      maxBudgetUSD: 10.0,
      maxSlippagePercent: 2.0,
      windowMinutes: 15,
    };

    const res = calculateProtection(params, baseMarket, DEFAULT_RISK_POLICY);

    expect(res.targetProtectedUSD).toBe(15);
    expect(res.requiredContracts).toBe(15);
    expect(res.estimatedCostUSD).toBe(5.25); // 15 * 0.35 = $5.25
    expect(res.recommendation).toBe("PROTECT");
    expect(res.marketQualityScore).toBeGreaterThanOrEqual(80);
  });

  it("evaluates market quality score correctly", () => {
    const quality = evaluateMarketQuality(baseMarket, 100, 20, 2.0);
    expect(quality.rating).toBe("GOOD");
    expect(quality.score).toBeGreaterThanOrEqual(80);
  });
});
