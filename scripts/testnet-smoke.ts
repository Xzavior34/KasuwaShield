import { calculateProtection } from "../packages/risk-engine/src/index.js";
import { DEFAULT_RISK_POLICY, BinaryMarketInfo } from "../packages/shared/src/index.js";

async function main() {
  console.log("==========================================");
  console.log("KASUWASHIELD — TESTNET SMOKE TEST");
  console.log("==========================================\n");

  const mockMarket: BinaryMarketInfo = {
    pool: "0x1234567890123456789012345678901234567890",
    marketId: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    asset: "BTC",
    expiry: BigInt(Math.floor(Date.now() / 1000) + 900), // 15m left
    intervalSec: 900n,
    collateral: "0x68B1D87F95878fE05B998F19b66F4baba5De11d4",
    bestBidProb: 0.30,
    bestAskProb: 0.35,
    spread: 0.05,
    liquidityContracts: 500,
    status: 1,
    finalized: false,
  };

  // Case 1: $50 BTC exposure -> 30% protection = $15 protected -> 15 contracts @ $0.35 = $5.25 cost <= $10.00 budget (Should approve PROTECT)
  const approvedParams = {
    exposureUSD: 50,
    protectionPercent: 30,
    contractPrice: 0.35,
    maxBudgetUSD: 10.0,
    maxSlippagePercent: 2.0,
    windowMinutes: 15,
  };

  console.log("1. Case 1: Approved Protection Input Parameters:");
  console.log(` - BTC Exposure: $${approvedParams.exposureUSD}`);
  console.log(` - Desired Protection: ${approvedParams.protectionPercent}% ($15.00)`);
  console.log(` - Max Budget: $${approvedParams.maxBudgetUSD}`);

  const approvedRec = calculateProtection(approvedParams, mockMarket, DEFAULT_RISK_POLICY);

  console.log("\nRisk Engine Output:");
  console.log(` - Recommendation: ${approvedRec.recommendation}`);
  console.log(` - Estimated Cost: $${approvedRec.estimatedCostUSD}`);
  console.log(` - Market Quality Score: ${approvedRec.marketQualityScore}/100 (${approvedRec.marketQualityRating})`);

  if (approvedRec.recommendation !== "PROTECT") {
    console.error("\n[✗] SMOKE TEST FAILED: Case 1 should have approved protection.");
    process.exit(1);
  }

  // Case 2: $500 BTC exposure with $10 budget cap -> cost $52.50 > $10 budget (Should reject SKIP)
  const rejectedParams = {
    exposureUSD: 500,
    protectionPercent: 30,
    contractPrice: 0.35,
    maxBudgetUSD: 10.0,
    maxSlippagePercent: 2.0,
    windowMinutes: 15,
  };

  console.log("\n2. Case 2: Budget Exceeded Input Parameters:");
  console.log(` - BTC Exposure: $${rejectedParams.exposureUSD}`);
  console.log(` - Desired Protection: ${rejectedParams.protectionPercent}% ($150.00)`);
  console.log(` - Max Budget: $${rejectedParams.maxBudgetUSD}`);

  const rejectedRec = calculateProtection(rejectedParams, mockMarket, DEFAULT_RISK_POLICY);

  console.log("\nRisk Engine Output:");
  console.log(` - Recommendation: ${rejectedRec.recommendation}`);
  console.log(` - Estimated Cost: $${rejectedRec.estimatedCostUSD}`);
  console.log(` - Reason: ${rejectedRec.reason}`);

  if (rejectedRec.recommendation !== "SKIP") {
    console.error("\n[✗] SMOKE TEST FAILED: Case 2 should have skipped due to budget limit.");
    process.exit(1);
  }

  console.log("\n[✓] SMOKE TEST PASSED: Risk engine approved protection & budget limit checks verified.");
}

main().catch((err) => {
  console.error("Smoke test error:", err);
  process.exit(1);
});
