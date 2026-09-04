/**
 * KasuwaShield — Executor -> Policy Wiring Fix
 *
 * Sends exactly ONE owner-only transaction:
 *   KasuwaExecutor.setPolicyContract(KasuwaPolicy address)
 * to correct the deploy-time defect documented in EXECUTOR_POLICY_WIRING_PROOF.md,
 * where KasuwaExecutor.policyContract was set to the deployer's own wallet
 * address instead of the real KasuwaPolicy contract address.
 *
 * This script reads DEPLOYER_PRIVATE_KEY from .env.local at runtime. It never
 * prints, logs, or transmits the key anywhere except as the local signer for
 * this one transaction, and it makes no other network calls with it.
 *
 * Run this yourself, after reading it, in your own terminal:
 *   npx tsx scripts/fix-policy-wiring.ts
 *
 * It will NOT run automatically as part of any test/build/audit script.
 */

import fs from "node:fs";
import path from "node:path";
import { createWalletClient, createPublicClient, http, getAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { SOMNIA_SHANNON_CONFIG } from "../packages/shared/src/index.js";

const EXECUTOR_ADDRESS = getAddress(SOMNIA_SHANNON_CONFIG.kasuwaExecutorAddress);
const POLICY_ADDRESS = getAddress(SOMNIA_SHANNON_CONFIG.kasuwaPolicyAddress);

const EXECUTOR_ABI = [
  {
    type: "function",
    name: "setPolicyContract",
    stateMutability: "nonpayable",
    inputs: [{ name: "_policyContract", type: "address" }],
    outputs: [],
  },
  {
    type: "function",
    name: "policyContract",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
] as const;

function readEnvLocalKey(): `0x${string}` {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    throw new Error(".env.local not found — DEPLOYER_PRIVATE_KEY is required to send this transaction.");
  }
  const content = fs.readFileSync(envPath, "utf8");
  const match = content.match(/DEPLOYER_PRIVATE_KEY\s*=\s*["']?([a-fA-F0-9xX]+)["']?/);
  if (!match) throw new Error("DEPLOYER_PRIVATE_KEY not found in .env.local");
  const raw = match[1].trim();
  return (raw.startsWith("0x") ? raw : `0x${raw}`) as `0x${string}`;
}

const chain = {
  id: SOMNIA_SHANNON_CONFIG.chainId,
  name: SOMNIA_SHANNON_CONFIG.chainName,
  nativeCurrency: { name: "STT", symbol: "STT", decimals: 18 },
  rpcUrls: { default: { http: [SOMNIA_SHANNON_CONFIG.rpcUrl] } },
} as const;

async function main() {
  console.log("================================================================================");
  console.log("  KASUWASHIELD — EXECUTOR -> POLICY WIRING FIX");
  console.log("================================================================================\n");

  const privateKey = readEnvLocalKey();
  const account = privateKeyToAccount(privateKey);

  const publicClient = createPublicClient({ chain, transport: http() });
  const walletClient = createWalletClient({ account, chain, transport: http() });

  console.log(`[SIGNER]:           ${account.address}`);
  console.log(`[EXECUTOR]:         ${EXECUTOR_ADDRESS}`);
  console.log(`[TARGET POLICY]:    ${POLICY_ADDRESS}\n`);

  const owner = await publicClient.readContract({
    address: EXECUTOR_ADDRESS,
    abi: EXECUTOR_ABI,
    functionName: "owner",
  });
  if (getAddress(owner as string) !== account.address) {
    console.error(`✗ Signer ${account.address} is not the Executor owner (${owner}). Refusing to send.`);
    process.exit(1);
  }

  const before = await publicClient.readContract({
    address: EXECUTOR_ADDRESS,
    abi: EXECUTOR_ABI,
    functionName: "policyContract",
  });
  console.log(`[CURRENT policyContract()]: ${before}`);

  if (getAddress(before as string) === POLICY_ADDRESS) {
    console.log("\nAlready correctly wired. Nothing to do.");
    return;
  }

  console.log("\nSending setPolicyContract(...) transaction...");
  const hash = await walletClient.writeContract({
    address: EXECUTOR_ADDRESS,
    abi: EXECUTOR_ABI,
    functionName: "setPolicyContract",
    args: [POLICY_ADDRESS],
  });
  console.log(`[TX HASH]: ${hash}`);

  console.log("Waiting for confirmation...");
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`[STATUS]: ${receipt.status} (block #${receipt.blockNumber})`);

  const after = await publicClient.readContract({
    address: EXECUTOR_ADDRESS,
    abi: EXECUTOR_ABI,
    functionName: "policyContract",
  });
  console.log(`[NEW policyContract()]: ${after}`);

  if (getAddress(after as string) === POLICY_ADDRESS) {
    console.log("\n✓ FIXED — KasuwaExecutor now points at the real KasuwaPolicy contract.");
  } else {
    console.error("\n✗ Transaction confirmed but on-chain value still does not match. Investigate manually.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fix script error:", err);
  process.exit(1);
});
