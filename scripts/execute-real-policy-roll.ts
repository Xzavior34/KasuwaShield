/**
 * KasuwaShield — Real On-Chain Policy Lifecycle Proof
 *
 * Produces the thing this project has never actually done: a real, mined,
 * independently-verifiable transaction showing an authorized ephemeral
 * session key (not the main wallet) executing a policy-gated auto-roll
 * through the ACTUAL deployed KasuwaPolicy + KasuwaExecutor contracts.
 *
 * What this does NOT do: place or settle a real DreamDEX order. Nothing in
 * KasuwaExecutor.executeAutoRoll() touches DreamDEX directly today (see
 * contracts/KasuwaExecutor.sol) — it is a policy-accounting call. So this
 * script proves the risk-policy/session-key/executor chain genuinely works
 * on-chain end to end. It does not prove a real trade was won and redeemed
 * the way a full DreamDEX integration would (that is a larger, separate
 * build — see the honesty notes in FINAL_AUDIT.md).
 *
 * Four transactions, all sent from your own deployer wallet (acting as the
 * "user" for this demo) except the last one, which is sent by a freshly
 * generated, throwaway ephemeral session key funded with a few cents of
 * testnet STT for gas:
 *   1. KasuwaPolicy.createPolicy(...)              [deployer]
 *   2. KasuwaExecutor.authorizeSessionKey(...)      [deployer]
 *   3. Send ~0.01 STT gas to the session key        [deployer]
 *   4. KasuwaExecutor.executeAutoRoll(...)          [session key]
 * Then reads KasuwaPolicy.policies(policyId) back to show the real,
 * on-chain state change (remainingBudgetUSD decremented, rollsExecuted=1).
 *
 * Run this yourself, after reading it, in your own terminal:
 *   npx tsx scripts/execute-real-policy-roll.ts
 *
 * Reads DEPLOYER_PRIVATE_KEY from .env.local. Never prints, logs, or
 * transmits it anywhere except as the local signer for transactions 1-3.
 * The session key used for transaction 4 is generated fresh by this script
 * and holds only the ~0.01 STT you send it — nothing else.
 */

import fs from "node:fs";
import path from "node:path";
import {
  createWalletClient,
  createPublicClient,
  http,
  getAddress,
  keccak256,
  toHex,
  parseEther,
} from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { SOMNIA_SHANNON_CONFIG } from "../packages/shared/src/index.js";

const EXECUTOR_ADDRESS = getAddress(SOMNIA_SHANNON_CONFIG.kasuwaExecutorAddress);
const POLICY_ADDRESS = getAddress(SOMNIA_SHANNON_CONFIG.kasuwaPolicyAddress);

const POLICY_ABI = [
  {
    type: "function", name: "createPolicy", stateMutability: "nonpayable",
    inputs: [
      { name: "policyId", type: "bytes32" },
      { name: "sessionKey", type: "address" },
      { name: "exposureUSD", type: "uint256" },
      { name: "protectionPercent", type: "uint256" },
      { name: "totalBudgetUSD", type: "uint256" },
      { name: "maxContractPrice", type: "uint256" },
      { name: "durationSeconds", type: "uint256" },
    ],
    outputs: [{ type: "bytes32" }],
  },
  {
    type: "function", name: "policies", stateMutability: "view",
    inputs: [{ type: "bytes32" }],
    outputs: [
      { name: "policyId", type: "bytes32" },
      { name: "user", type: "address" },
      { name: "sessionKey", type: "address" },
      { name: "exposureUSD", type: "uint256" },
      { name: "protectionPercent", type: "uint256" },
      { name: "totalBudgetUSD", type: "uint256" },
      { name: "remainingBudgetUSD", type: "uint256" },
      { name: "maxContractPrice", type: "uint256" },
      { name: "startTime", type: "uint256" },
      { name: "durationSeconds", type: "uint256" },
      { name: "rollsExecuted", type: "uint256" },
      { name: "isActive", type: "bool" },
    ],
  },
] as const;

const EXECUTOR_ABI = [
  {
    type: "function", name: "authorizeSessionKey", stateMutability: "nonpayable",
    inputs: [{ name: "sessionKey", type: "address" }, { name: "policyId", type: "bytes32" }],
    outputs: [],
  },
  {
    type: "function", name: "executeAutoRoll", stateMutability: "nonpayable",
    inputs: [
      { name: "userEOA", type: "address" },
      { name: "policyId", type: "bytes32" },
      { name: "dreamdexPool", type: "address" },
      { name: "quantityContracts", type: "uint256" },
      { name: "pricePerContractUSD", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

function readEnvLocalKey(): `0x${string}` {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) throw new Error(".env.local not found — DEPLOYER_PRIVATE_KEY is required.");
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
  console.log("  KASUWASHIELD — REAL ON-CHAIN POLICY LIFECYCLE PROOF");
  console.log("================================================================================\n");

  const deployerKey = readEnvLocalKey();
  const deployer = privateKeyToAccount(deployerKey);
  const publicClient = createPublicClient({ chain, transport: http() });
  const deployerWallet = createWalletClient({ account: deployer, chain, transport: http() });

  // Fresh, disposable session key — generated locally, never derived from your real wallet.
  const sessionPrivateKey = generatePrivateKey();
  const sessionAccount = privateKeyToAccount(sessionPrivateKey);
  const sessionWallet = createWalletClient({ account: sessionAccount, chain, transport: http() });

  const policyId = keccak256(toHex(`kasuwashield-demo-policy-${Date.now()}`));

  console.log(`[DEPLOYER / DEMO USER]: ${deployer.address}`);
  console.log(`[EPHEMERAL SESSION KEY]: ${sessionAccount.address}  (fresh, holds no funds except gas sent below)`);
  console.log(`[POLICY ID]: ${policyId}\n`);

  // Demo policy numbers — plain integer "USD" units matching KasuwaPolicy.sol's own convention.
  const exposureUSD = 1000n;
  const protectionPercent = 20n;
  const totalBudgetUSD = 50n;
  const maxContractPrice = 2n;
  const durationSeconds = 3600n;
  const quantityContracts = 5n;
  const pricePerContractUSD = 1n; // <= maxContractPrice, so validateAndDeductRoll should succeed
  const dreamdexPool = "0x89Ebc05dE83aB9752B95030218BB10A542b96B7C" as `0x${string}`; // referenced venue address (see packages/markets/src/discovery.ts)

  console.log("Step 1/4 — KasuwaPolicy.createPolicy(...)");
  const createHash = await deployerWallet.writeContract({
    address: POLICY_ADDRESS,
    abi: POLICY_ABI,
    functionName: "createPolicy",
    args: [policyId, sessionAccount.address, exposureUSD, protectionPercent, totalBudgetUSD, maxContractPrice, durationSeconds],
  });
  console.log(`  tx: ${createHash}`);
  await publicClient.waitForTransactionReceipt({ hash: createHash });
  console.log("  confirmed.\n");

  console.log("Step 2/4 — KasuwaExecutor.authorizeSessionKey(...)");
  const authHash = await deployerWallet.writeContract({
    address: EXECUTOR_ADDRESS,
    abi: EXECUTOR_ABI,
    functionName: "authorizeSessionKey",
    args: [sessionAccount.address, policyId],
  });
  console.log(`  tx: ${authHash}`);
  await publicClient.waitForTransactionReceipt({ hash: authHash });
  console.log("  confirmed.\n");

  console.log("Step 3/4 — Funding session key with 0.01 STT for gas");
  const fundHash = await deployerWallet.sendTransaction({
    to: sessionAccount.address,
    value: parseEther("0.01"),
  });
  console.log(`  tx: ${fundHash}`);
  await publicClient.waitForTransactionReceipt({ hash: fundHash });
  console.log("  confirmed.\n");

  console.log("Step 4/4 — KasuwaExecutor.executeAutoRoll(...) signed by the SESSION KEY, not your wallet");
  const rollHash = await sessionWallet.writeContract({
    address: EXECUTOR_ADDRESS,
    abi: EXECUTOR_ABI,
    functionName: "executeAutoRoll",
    args: [deployer.address, policyId, dreamdexPool, quantityContracts, pricePerContractUSD],
  });
  console.log(`  tx: ${rollHash}`);
  const rollReceipt = await publicClient.waitForTransactionReceipt({ hash: rollHash });
  console.log(`  status: ${rollReceipt.status} (block #${rollReceipt.blockNumber})\n`);

  console.log("Reading back KasuwaPolicy.policies(policyId) to show the real state change...");
  const policy = await publicClient.readContract({
    address: POLICY_ADDRESS,
    abi: POLICY_ABI,
    functionName: "policies",
    args: [policyId],
  });
  console.log(`  remainingBudgetUSD: ${policy[6]} (started at ${totalBudgetUSD})`);
  console.log(`  rollsExecuted:      ${policy[10]}`);
  console.log(`  isActive:           ${policy[11]}\n`);

  const explorer = SOMNIA_SHANNON_CONFIG.explorerUrl;
  console.log("================================================================================");
  console.log("  PROOF LINKS — put these directly in the demo / README");
  console.log("================================================================================");
  console.log(`  createPolicy:        ${explorer}/tx/${createHash}`);
  console.log(`  authorizeSessionKey: ${explorer}/tx/${authHash}`);
  console.log(`  fund session key:    ${explorer}/tx/${fundHash}`);
  console.log(`  executeAutoRoll:     ${explorer}/tx/${rollHash}`);
  console.log(`  policy state:        ${explorer}/address/${POLICY_ADDRESS}?tab=read_contract`);

  if (rollReceipt.status !== "success" || policy[10] !== 1n) {
    console.error("\n✗ Something did not go as expected — inspect the receipt/state above before claiming this as proof.");
    process.exit(1);
  }
  console.log("\n✓ Real, mined, session-key-executed policy roll — verifiable by anyone via the links above.");
}

main().catch((err) => {
  console.error("Script error:", err);
  process.exit(1);
});
