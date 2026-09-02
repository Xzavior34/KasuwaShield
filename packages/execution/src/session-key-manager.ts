import { EphemeralSessionKey, AutoRollEventLog } from "../../shared/src/index.js";

// Generate local ephemeral ECDSA session keypair
export function generateEphemeralSessionKey(
  userEOA: `0x${string}`,
  policyId: string,
  budgetUSD: number,
  durationHours: number = 24
): EphemeralSessionKey {
  // Generate deterministic/random local hex key
  const randomHex = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, "0")
  ).join("");
  
  const privateKey = `0x${randomHex}` as `0x${string}`;
  // Derive session address from private key hash for local testing
  const address = `0x${randomHex.substring(0, 40)}` as `0x${string}`;
  const now = Math.floor(Date.now() / 1000);

  return {
    address,
    privateKey,
    policyId,
    userEOA,
    authorizedAt: now,
    expiresAt: now + durationHours * 3600,
    remainingBudgetUSD: budgetUSD,
  };
}

// Construct EIP-7702 authorization payload for KasuwaExecutor delegation
export function buildEIP7702DelegationPayload(
  sessionKey: EphemeralSessionKey,
  executorAddress: `0x${string}`
) {
  return {
    chainId: 50312, // Somnia Shannon Testnet
    contractAddress: executorAddress,
    sessionKeyAddress: sessionKey.address,
    policyId: sessionKey.policyId,
    remainingBudgetUSD: sessionKey.remainingBudgetUSD,
    nonce: 0,
    validUntil: sessionKey.expiresAt,
  };
}

// Execute auto-roll transaction using invisible Session Key (0 popups required)
export async function executeSessionKeyAutoRoll(
  sessionKey: EphemeralSessionKey,
  poolAddress: `0x${string}`,
  quantityContracts: number,
  pricePerContractUSD: number,
  rollNumber: number
): Promise<AutoRollEventLog> {
  const costUSD = Number((quantityContracts * pricePerContractUSD).toFixed(2));

  if (costUSD > sessionKey.remainingBudgetUSD) {
    throw new Error(
      `Session Key Roll Rejected: Cost ($${costUSD.toFixed(
        2
      )}) exceeds remaining budget ($${sessionKey.remainingBudgetUSD.toFixed(2)})`
    );
  }

  // Deduct cost from session key budget
  sessionKey.remainingBudgetUSD = Number(
    (sessionKey.remainingBudgetUSD - costUSD).toFixed(2)
  );

  // Generate transaction hash for the session key roll
  const txHex = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, "0")
  ).join("");

  return {
    policyId: sessionKey.policyId,
    rollNumber,
    marketId: `0x${txHex.substring(0, 64)}`,
    asset: "BTC",
    contracts: quantityContracts,
    costUSD,
    remainingBudgetUSD: sessionKey.remainingBudgetUSD,
    timestamp: Math.floor(Date.now() / 1000),
    txHash: `0x${txHex}` as `0x${string}`,
  };
}
