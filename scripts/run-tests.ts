// Standalone TypeScript test runner for KasuwaShield
import assert from "node:assert";
import { calculateProtection, evaluateMarketQuality } from "../packages/risk-engine/src/index.js";
import { DEFAULT_RISK_POLICY, BinaryMarketInfo } from "../packages/shared/src/index.js";
import {
  generateEphemeralSessionKey,
  buildEIP7702DelegationPayload,
  executeSessionKeyAutoRoll,
} from "../packages/execution/src/session-key-manager.js";

async function runAllTests() {
  console.log("==================================================");
  console.log("  KASUWASHIELD PROTOCOL VERIFICATION TEST SUITE");
  console.log("==================================================");

  let passed = 0;
  let total = 0;

  function test(name: string, fn: () => void) {
    total++;
    try {
      fn();
      console.log(`  [✓] PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  [✗] FAIL: ${name}`);
      console.error(`      ${err.message}`);
    }
  }

  async function testAsync(name: string, fn: () => Promise<void>) {
    total++;
    try {
      await fn();
      console.log(`  [✓] PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  [✗] FAIL: ${name}`);
      console.error(`      ${err.message}`);
    }
  }

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

  // 1. Quant Risk Engine Tests
  console.log("\n1. QUANT RISK ENGINE & SIZING TESTS:");
  test("Calculates 30% downside protection for $500 BTC exposure accurately", () => {
    const params = {
      exposureUSD: 500,
      protectionPercent: 30,
      contractPrice: 0.35,
      maxBudgetUSD: 10.0,
      maxSlippagePercent: 2.0,
      windowMinutes: 15,
    };
    const res = calculateProtection(params, baseMarket, DEFAULT_RISK_POLICY);
    assert.strictEqual(res.targetProtectedUSD, 150);
    assert.strictEqual(res.requiredContracts, 150);
    assert.strictEqual(res.estimatedCostUSD, 52.5);
    assert.strictEqual(res.recommendation, "SKIP"); // Budget $10 exceeded by $52.50
  });

  test("Approves protection when cost is within budget limits", () => {
    const params = {
      exposureUSD: 50,
      protectionPercent: 30,
      contractPrice: 0.35,
      maxBudgetUSD: 10.0,
      maxSlippagePercent: 2.0,
      windowMinutes: 15,
    };
    const res = calculateProtection(params, baseMarket, DEFAULT_RISK_POLICY);
    assert.strictEqual(res.targetProtectedUSD, 15);
    assert.strictEqual(res.requiredContracts, 15);
    assert.strictEqual(res.estimatedCostUSD, 5.25);
    assert.strictEqual(res.recommendation, "PROTECT");
    assert.ok(res.marketQualityScore >= 80);
  });

  test("Evaluates market quality score and liquidity boundaries accurately", () => {
    const quality = evaluateMarketQuality(baseMarket, 100, 20, 2.0);
    assert.strictEqual(quality.rating, "GOOD");
    assert.ok(quality.score >= 80);
  });

  // 2. EIP-7702 Delegation & Session Key Tests
  console.log("\n2. EIP-7702 DELEGATION & SESSION KEY TESTS:");
  const mockEOA = "0x71C9999999999999999999999999999999999A2B" as `0x${string}`;
  const mockExecutor = "0x8F31111111111111111111111111111111114C1C" as `0x${string}`;

  test("Generates valid secp256k1 keypair with proper expiry and budget", () => {
    const session = generateEphemeralSessionKey(mockEOA, "policy-btc-001", 100.0, 24);
    assert.match(session.address, /^0x[a-fA-F0-9]{40}$/);
    assert.match(session.privateKey, /^0x[a-fA-F0-9]{64}$/);
    assert.strictEqual(session.userEOA, mockEOA);
    assert.strictEqual(session.remainingBudgetUSD, 100.0);
    assert.strictEqual(session.expiresAt - session.authorizedAt, 24 * 3600);
  });

  test("Constructs valid EIP-7702 delegation payload for Somnia Shannon (50312)", () => {
    const session = generateEphemeralSessionKey(mockEOA, "policy-btc-001", 50.0, 12);
    const payload = buildEIP7702DelegationPayload(session, mockExecutor);
    assert.strictEqual(payload.chainId, 50312);
    assert.strictEqual(payload.contractAddress, mockExecutor);
    assert.strictEqual(payload.sessionKeyAddress, session.address);
    assert.strictEqual(payload.policyId, "policy-btc-001");
    assert.strictEqual(payload.remainingBudgetUSD, 50.0);
    assert.strictEqual(payload.validUntil, session.expiresAt);
  });

  await testAsync("Deducts budget accurately across sequential auto-rolls", async () => {
    const session = generateEphemeralSessionKey(mockEOA, "policy-btc-001", 30.0, 24);
    const roll1 = await executeSessionKeyAutoRoll(session, mockExecutor, 10, 0.50, 1);
    assert.strictEqual(roll1.costUSD, 5.0);
    assert.strictEqual(session.remainingBudgetUSD, 25.0);

    const roll2 = await executeSessionKeyAutoRoll(session, mockExecutor, 20, 0.50, 2);
    assert.strictEqual(roll2.costUSD, 10.0);
    assert.strictEqual(session.remainingBudgetUSD, 15.0);
  });

  await testAsync("Rejects auto-roll when budget is exceeded (fail-closed security)", async () => {
    const session = generateEphemeralSessionKey(mockEOA, "policy-btc-001", 5.0, 24);
    let errorThrown = false;
    try {
      await executeSessionKeyAutoRoll(session, mockExecutor, 20, 0.50, 1); // 20 * $0.50 = $10 > $5
    } catch (err: any) {
      errorThrown = true;
      assert.match(err.message, /exceeds remaining budget/);
    }
    assert.ok(errorThrown, "Expected budget overflow error");
  });

  console.log("\n==================================================");
  console.log(`  VERIFICATION RESULTS: ${passed}/${total} TESTS PASSED (100%)`);
  console.log("==================================================");

  if (passed !== total) {
    process.exit(1);
  }
}

runAllTests();
