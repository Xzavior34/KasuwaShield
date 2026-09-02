import { describe, it, expect } from "vitest";
import {
  generateEphemeralSessionKey,
  buildEIP7702DelegationPayload,
  executeSessionKeyAutoRoll,
} from "../../packages/execution/src/session-key-manager.js";

describe("EIP-7702 Ephemeral Session Key & Delegation", () => {
  const mockEOA = "0x71C9999999999999999999999999999999999A2B" as const;
  const mockExecutor = "0x8F31111111111111111111111111111111114C1C" as const;

  it("generates a valid secp256k1 keypair with proper expiry and budget", () => {
    const session = generateEphemeralSessionKey(mockEOA, "policy-btc-001", 100.0, 24);

    expect(session.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(session.privateKey).toMatch(/^0x[a-fA-F0-9]{64}$/);
    expect(session.userEOA).toBe(mockEOA);
    expect(session.remainingBudgetUSD).toBe(100.0);
    expect(session.expiresAt - session.authorizedAt).toBe(24 * 3600);
  });

  it("constructs correct EIP-7702 authorization delegation payload", () => {
    const session = generateEphemeralSessionKey(mockEOA, "policy-btc-001", 50.0, 12);
    const payload = buildEIP7702DelegationPayload(session, mockExecutor);

    expect(payload.chainId).toBe(50312); // Somnia Shannon Testnet
    expect(payload.contractAddress).toBe(mockExecutor);
    expect(payload.sessionKeyAddress).toBe(session.address);
    expect(payload.policyId).toBe("policy-btc-001");
    expect(payload.remainingBudgetUSD).toBe(50.0);
    expect(payload.validUntil).toBe(session.expiresAt);
  });

  it("deducts budget accurately across multiple auto-rolls", async () => {
    const session = generateEphemeralSessionKey(mockEOA, "policy-btc-001", 30.0, 24);

    const roll1 = await executeSessionKeyAutoRoll(session, mockExecutor, 10, 0.50, 1);
    expect(roll1.costUSD).toBe(5.0);
    expect(session.remainingBudgetUSD).toBe(25.0);

    const roll2 = await executeSessionKeyAutoRoll(session, mockExecutor, 20, 0.50, 2);
    expect(roll2.costUSD).toBe(10.0);
    expect(session.remainingBudgetUSD).toBe(15.0);
  });

  it("rejects auto-roll when budget is exceeded (fail-closed security)", async () => {
    const session = generateEphemeralSessionKey(mockEOA, "policy-btc-001", 5.0, 24);

    await expect(
      executeSessionKeyAutoRoll(session, mockExecutor, 20, 0.50, 1) // 20 * 0.50 = $10 > $5
    ).rejects.toThrow(/exceeds remaining budget/);
  });
});
