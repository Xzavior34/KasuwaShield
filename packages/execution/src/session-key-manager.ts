import { generatePrivateKey, privateKeyToAddress } from "viem/accounts";
import { EphemeralSessionKey, AutoRollEventLog } from "../../shared/src/index.js";

// Generate a local ephemeral secp256k1/ECDSA session keypair (real key material,
// derived with viem — never sent to a server, never leaves the browser).
export function generateEphemeralSessionKey(
  userEOA: `0x${string}`,
  policyId: string,
  budgetUSD: number,
  durationHours: number = 24
): EphemeralSessionKey {
  const privateKey = generatePrivateKey();
  const address = privateKeyToAddress(privateKey);
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

// Execute an auto-roll using the invisible local Session Key (0 wallet popups).
// NOTE: this harness enforces the same budget/cap math as KasuwaPolicy.sol and
// generates a placeholder tx hash for local/offline demo runs — swap in a real
// `walletClient.sendTransaction` call (signed by `sessionKey.privateKey`) to
// broadcast against KasuwaExecutor.sol on Somnia Shannon.
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

  // Placeholder transaction hash for the local demo harness (see NOTE above).
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
