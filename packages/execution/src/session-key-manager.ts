import crypto from "node:crypto";
import { EphemeralSessionKey, AutoRollEventLog } from "../../shared/src/index.js";

// --- Dependency-free Keccak-256 (the Ethereum/EVM hash -- NOT NIST SHA3, which pads
// differently and produces different digests). This is the real hash Ethereum address
// derivation requires. A previous version of this file used SHA-256 here as a stand-in
// "for now", which produced a plausible-looking 0x address that was NOT the address
// actually controlled by the corresponding private key on any EVM chain -- silently
// breaking the EIP-7702 session-key mechanism this file exists to implement. Verified
// byte-for-byte against known Keccak-256 test vectors and against viem's audited
// privateKeyToAddress() across 20 random keys before being wired in here -- see
// scripts/run-tests.ts, "Session key address is the REAL Ethereum address for its
// private key". Implemented locally (no npm dependency) so this correctness does not
// depend on package installation succeeding in every environment.
function keccak256(message: Uint8Array): Buffer {
  const RC = [
    0x0000000000000001n, 0x0000000000008082n, 0x800000000000808an, 0x8000000080008000n,
    0x000000000000808bn, 0x0000000080000001n, 0x8000000080008081n, 0x8000000000008009n,
    0x000000000000008an, 0x0000000000000088n, 0x0000000080008009n, 0x000000008000000an,
    0x000000008000808bn, 0x800000000000008bn, 0x8000000000008089n, 0x8000000000008003n,
    0x8000000000008002n, 0x8000000000000080n, 0x000000000000800an, 0x800000008000000an,
    0x8000000080008081n, 0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n,
  ];
  const R = [
    [0, 36, 3, 41, 18],
    [1, 44, 10, 45, 2],
    [62, 6, 43, 15, 61],
    [28, 55, 25, 21, 56],
    [27, 20, 39, 8, 14],
  ];
  const MASK64 = (1n << 64n) - 1n;
  const rotl64 = (x: bigint, n: bigint): bigint => {
    n = n % 64n;
    if (n === 0n) return x & MASK64;
    return ((x << n) | (x >> (64n - n))) & MASK64;
  };

  const state = new Array<bigint>(25).fill(0n);

  function keccakF1600(): void {
    for (let round = 0; round < 24; round++) {
      const C = new Array<bigint>(5);
      for (let x = 0; x < 5; x++) {
        C[x] = state[x] ^ state[x + 5] ^ state[x + 10] ^ state[x + 15] ^ state[x + 20];
      }
      const D = new Array<bigint>(5);
      for (let x = 0; x < 5; x++) {
        D[x] = C[(x + 4) % 5] ^ rotl64(C[(x + 1) % 5], 1n);
      }
      for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
          state[x + 5 * y] ^= D[x];
        }
      }
      const B = new Array<bigint>(25).fill(0n);
      for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
          const newX = y;
          const newY = (2 * x + 3 * y) % 5;
          B[newX + 5 * newY] = rotl64(state[x + 5 * y], BigInt(R[x][y]));
        }
      }
      for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
          state[x + 5 * y] = B[x + 5 * y] ^ ((~B[((x + 1) % 5) + 5 * y] & MASK64) & B[((x + 2) % 5) + 5 * y]);
        }
      }
      state[0] ^= RC[round];
    }
  }

  const rateBytes = 136; // 1088 bits for Keccak-256
  const input = Buffer.from(message);
  const padded = Buffer.alloc(Math.ceil((input.length + 1) / rateBytes) * rateBytes);
  input.copy(padded);
  padded[input.length] |= 0x01; // Keccak padding (not SHA3's 0x06)
  padded[padded.length - 1] |= 0x80;

  for (let offset = 0; offset < padded.length; offset += rateBytes) {
    for (let i = 0; i < rateBytes / 8; i++) {
      const lane = padded.readBigUInt64LE(offset + i * 8);
      state[i] ^= lane;
    }
    keccakF1600();
  }

  const out = Buffer.alloc(32);
  for (let i = 0; i < 4; i++) {
    out.writeBigUInt64LE(state[i] & MASK64, i * 8);
  }
  return out;
}

// Generates the real secp256k1-derived Ethereum address for a 32-byte private key:
// public key via Node's native ECDH, address via Keccak-256(pubkey)[-20:].
export function deriveAddressFromPrivateKey(privKeyHex: string): `0x${string}` {
  const ecdh = crypto.createECDH("secp256k1");
  ecdh.setPrivateKey(Buffer.from(privKeyHex.replace("0x", ""), "hex"));
  const uncompressedPubKey = ecdh.getPublicKey().subarray(1); // strip 0x04 prefix (64 bytes)
  const hash = keccak256(uncompressedPubKey);
  const addressHex = hash.subarray(12).toString("hex"); // last 20 bytes
  return `0x${addressHex}` as `0x${string}`;
}

// Generate a local ephemeral secp256k1 ECDSA session keypair (real cryptographic key material,
// derived in browser/local memory — never sent to a server, never touches user funds).
export function generateEphemeralSessionKey(
  userEOA: `0x${string}`,
  policyId: string,
  budgetUSD: number,
  durationHours: number = 24
): EphemeralSessionKey {
  const privKeyBuffer = crypto.randomBytes(32);
  const privateKey = `0x${privKeyBuffer.toString("hex")}` as `0x${string}`;
  const address = deriveAddressFromPrivateKey(privateKey);
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
// generates a transaction record for local/offline demo runs.
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

  const txHex = crypto.randomBytes(32).toString("hex");

  return {
    policyId: sessionKey.policyId,
    rollNumber,
    marketId: `0x${txHex}`,
    asset: "BTC",
    contracts: quantityContracts,
    costUSD,
    remainingBudgetUSD: sessionKey.remainingBudgetUSD,
    timestamp: Math.floor(Date.now() / 1000),
    txHash: `0x${txHex}` as `0x${string}`,
  };
}
