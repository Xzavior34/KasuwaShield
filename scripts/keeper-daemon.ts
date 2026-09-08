/**
 * KasuwaShield — Automated Keeper Daemon (real, unattended, on-chain rolls)
 *
 * Answers a fair, repeated critique of this project (raised independently by
 * two AI competitor-review reports this week): KasuwaShield's on-chain roll
 * has only ever been triggered by a human running a one-off script. There has
 * been no actual unattended automation. This script is that automation.
 *
 * It does the same real setup as scripts/execute-real-policy-roll.ts (create
 * one policy, authorize one ephemeral session key, fund it for gas) ONCE, and
 * then runs an actual keeper loop: every window (durationSeconds), it checks
 * the policy's live on-chain state and — with NO human triggering it — signs
 * and sends another KasuwaExecutor.executeAutoRoll() from the session key,
 * for real, until the budget is exhausted or you stop it.
 *
 * This proves genuine unattended execution end-to-end on-chain. It does not
 * place a real DreamDEX order (see scripts/place-real-dreamdex-order.ts for
 * that separate proof) or change what the deployed KasuwaExecutor contract
 * does — same honesty boundary as every other proof script in this repo.
 *
 * RUN:
 *   npx tsx scripts/keeper-daemon.ts [maxRolls] [windowSeconds]
 *   e.g. npx tsx scripts/keeper-daemon.ts 3 60
 *   (defaults: maxRolls=3, windowSeconds=60 — short windows so you can watch
 *   it work in a few minutes without tying up a terminal all day; the demo
 *   video should show this running unattended, not the one-shot script)
 *
 * Ctrl+C stops it cleanly at any time; whatever rolled already stays on-chain
 * and verifiable.
 *
 * HONESTY NOTE: I (Claude) could not run this myself — no network path from
 * my shell to Somnia RPC. Written carefully against the same ABI and pattern
 * already proven working in execute-real-policy-roll.ts (which I DID verify
 * end-to-end on-chain), so the on-chain calls themselves are low-risk; the
 * only new logic is the loop/timing around them. If anything errors on first
 * run, send me the exact output and I'll fix it.
 */

import fs from "node:fs";
import path from "node:path";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
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

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const maxRolls = Number(process.argv[2] ?? "3");
  const windowSeconds = Number(process.argv[3] ?? "60");

  console.log("================================================================================");
  console.log("  KASUWASHIELD — AUTOMATED KEEPER DAEMON (real on-chain rolls, unattended)");
  console.log("================================================================================");
  console.log(`  maxRolls=${maxRolls}  windowSeconds=${windowSeconds}\n`);

  const deployerKey = readEnvLocalKey();
  const deployer = privateKeyToAccount(deployerKey);
  const publicClient = createPublicClient({ chain, transport: http() });
  const deployerWallet = createWalletClient({ account: deployer, chain, transport: http() });

  const sessionPrivateKey = generatePrivateKey();
  const sessionAccount = privateKeyToAccount(sessionPrivateKey);
  const sessionWallet = createWalletClient({ account: sessionAccount, chain, transport: http() });

  const policyId = keccak256(toHex(`kasuwashield-keeper-${Date.now()}`));

  console.log(`[USER / DEPLOYER]:       ${deployer.address}`);
  console.log(`[EPHEMERAL SESSION KEY]: ${sessionAccount.address}`);
  console.log(`[POLICY ID]:             ${policyId}\n`);

  const exposureUSD = 1000n;
  const protectionPercent = 20n;
  // Budget big enough for maxRolls with headroom.
  const totalBudgetUSD = 50n;
  const maxContractPrice = 2n;
  const durationSeconds = 3600n; // 1 hour policy validity
  const quantityContracts = 5n;
  const pricePerContractUSD = 1n;
  const dreamdexPool = "0x89Ebc05dE83aB9752B95030218BB10A542b96B7C" as `0x${string}`;

  console.log("Setup 1/3 — KasuwaPolicy.createPolicy(...)");
  const createHash = await deployerWallet.writeContract({
    address: POLICY_ADDRESS, abi: POLICY_ABI, functionName: "createPolicy",
    args: [policyId, sessionAccount.address, exposureUSD, protectionPercent, totalBudgetUSD, maxContractPrice, durationSeconds],
  });
  await publicClient.waitForTransactionReceipt({ hash: createHash });
  console.log(`  confirmed: ${createHash}\n`);

  console.log("Setup 2/3 — KasuwaExecutor.authorizeSessionKey(...)");
  const authHash = await deployerWallet.writeContract({
    address: EXECUTOR_ADDRESS, abi: EXECUTOR_ABI, functionName: "authorizeSessionKey",
    args: [sessionAccount.address, policyId],
  });
  await publicClient.waitForTransactionReceipt({ hash: authHash });
  console.log(`  confirmed: ${authHash}\n`);

  console.log("Setup 3/3 — Funding session key with 0.2 STT for gas (covers many rolls)");
  const fundHash = await deployerWallet.sendTransaction({ to: sessionAccount.address, value: parseEther("0.2") });
  await publicClient.waitForTransactionReceipt({ hash: fundHash });
  console.log(`  confirmed: ${fundHash}\n`);

  console.log("--------------------------------------------------------------------------------");
  console.log("  KEEPER LOOP STARTING — no human will trigger the calls below");
  console.log("--------------------------------------------------------------------------------\n");

  const startTime = Date.now();
  const heartbeatPath = path.resolve(process.cwd(), "artifacts", "keeper-heartbeat.json");

  const writeHeartbeat = (status: string, details: Record<string, any> = {}) => {
    try {
      const dir = path.dirname(heartbeatPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const payload = {
        service: "KasuwaShield Automated Keeper Daemon",
        status,
        timestamp: new Date().toISOString(),
        pid: process.pid,
        uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
        policyId,
        sessionKey: sessionAccount.address,
        rollsExecuted: rollsDone,
        maxRolls,
        windowSeconds,
        ...details,
      };
      fs.writeFileSync(heartbeatPath, JSON.stringify(payload, null, 2));
    } catch {
      // Non-blocking telemetry
    }
  };

  writeHeartbeat("STARTING");

  let stopped = false;
  process.on("SIGINT", () => {
    stopped = true;
    console.log("\nSIGINT received — stopping after current roll.");
    writeHeartbeat("STOPPING", { reason: "SIGINT" });
  });

  const txHashes: string[] = [createHash, authHash, fundHash];
  let rollsDone = 0;

  for (let i = 1; i <= maxRolls && !stopped; i++) {
    writeHeartbeat("WAITING_WINDOW", { currentWindow: i, rollsDone });
    console.log(`[window ${i}/${maxRolls}] waiting ${windowSeconds}s for the window to open...`);
    await sleep(windowSeconds * 1000);
    if (stopped) break;

    const before = await publicClient.readContract({
      address: POLICY_ADDRESS, abi: POLICY_ABI, functionName: "policies", args: [policyId],
    });
    if (!before[11] /* isActive */) {
      console.log("  policy no longer active (budget exhausted or expired) — stopping.");
      writeHeartbeat("STOPPED", { currentWindow: i, reason: "POLICY_INACTIVE_OR_EXPIRED" });
      break;
    }
    if (before[6] /* remainingBudgetUSD */ < quantityContracts * pricePerContractUSD) {
      console.log("  remaining budget too low for another roll — stopping cleanly (fail-closed).");
      writeHeartbeat("STOPPED", { currentWindow: i, reason: "BUDGET_EXHAUSTED_FAIL_CLOSED" });
      break;
    }

    console.log(`[window ${i}/${maxRolls}] KasuwaExecutor.executeAutoRoll(...) — signed by session key, unattended`);
    writeHeartbeat("EXECUTING_ROLL", { currentWindow: i, rollsDone });
    const rollHash = await sessionWallet.writeContract({
      address: EXECUTOR_ADDRESS, abi: EXECUTOR_ABI, functionName: "executeAutoRoll",
      args: [deployer.address, policyId, dreamdexPool, quantityContracts, pricePerContractUSD],
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash: rollHash });
    txHashes.push(rollHash);
    rollsDone++;
    writeHeartbeat("ROLL_CONFIRMED", { currentWindow: i, rollsDone, latestTx: rollHash, blockNumber: Number(receipt.blockNumber) });
    console.log(`  tx: ${rollHash}  status: ${receipt.status}  block: #${receipt.blockNumber}\n`);
  }

  const after = await publicClient.readContract({
    address: POLICY_ADDRESS, abi: POLICY_ABI, functionName: "policies", args: [policyId],
  });

  writeHeartbeat("COMPLETED", {
    rollsDone,
    onChainRollsExecuted: Number(after[10]),
    remainingBudgetUSD: Number(after[6]),
    policyActive: Boolean(after[11]),
  });

  const explorer = SOMNIA_SHANNON_CONFIG.explorerUrl;
  console.log("================================================================================");
  console.log("  KEEPER RUN SUMMARY");
  console.log("================================================================================");
  console.log(`  rolls executed (this run): ${rollsDone}`);
  console.log(`  on-chain rollsExecuted:    ${after[10]}`);
  console.log(`  remainingBudgetUSD:        ${after[6]}`);
  console.log(`  policy still active:       ${after[11]}`);
  console.log(`\n  All tx hashes (verify any of these independently):`);
  for (const h of txHashes) console.log(`    ${explorer}/tx/${h}`);
  console.log(`\n  Policy state: ${explorer}/address/${POLICY_ADDRESS}?tab=read_contract`);

  if (rollsDone === 0) {
    console.error("\n✗ Zero rolls executed — inspect the log above before claiming automated rolling works.");
    process.exit(1);
  }
  console.log(`\n✓ ${rollsDone} real on-chain roll(s) executed with zero human triggering — verifiable above.`);
}

main().catch((err) => {
  console.error("\n✗ Script error:", err);
  try {
    const heartbeatPath = path.resolve(process.cwd(), "artifacts", "keeper-heartbeat.json");
    fs.writeFileSync(heartbeatPath, JSON.stringify({
      service: "KasuwaShield Automated Keeper Daemon",
      status: "FAILED",
      timestamp: new Date().toISOString(),
      error: err.message,
    }, null, 2));
  } catch {}
  process.exit(1);
});
