/**
 * KasuwaShield — KasuwaPolicy v2 Redeploy (Access-Control Fix)
 *
 * The live v1 KasuwaPolicy (0xAc8c3afB4f11b43E1C90fC57AEDc91e3e7140d1d) has a
 * real defect: validateAndDeductRoll() has NO caller restriction — any address
 * can call it directly and drain or terminate any policy, bypassing
 * KasuwaExecutor entirely. Contracts are immutable, so this cannot be patched
 * in place. contracts/KasuwaPolicy.sol has been updated to add an
 * onlyExecutor modifier; this script deploys that fixed version and re-points
 * KasuwaExecutor at it.
 *
 * Two transactions, both sent from your deployer wallet:
 *   1. Deploy KasuwaPolicy(executor = KasuwaExecutor address)
 *   2. KasuwaExecutor.setPolicyContract(newPolicyAddress)
 * Then reads back KasuwaExecutor.policyContract() to confirm the rewiring.
 *
 * Run this yourself, after reading it, in your own terminal:
 *   npx tsx scripts/redeploy-kasuwapolicy-v2.ts
 *
 * Prerequisite: artifacts/KasuwaPolicy.v2.compiled.json must exist (generated
 * by compiling contracts/KasuwaPolicy.sol with solc — see comment at bottom
 * of this file for the exact command used).
 *
 * After this succeeds, the new KasuwaPolicy address needs Blockscout source
 * verification (same process as the other three contracts): Solidity Single
 * file, compiler v0.8.36+commit.8a079791, optimizer disabled, MIT license,
 * constructor arg ABI-encoded as the KasuwaExecutor address.
 *
 * This script never touches DEPLOYER_PRIVATE_KEY except as the local signer.
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import fs from "node:fs";
import path from "node:path";
import { createWalletClient, createPublicClient, http, getAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { SOMNIA_SHANNON_CONFIG } from "../packages/shared/src/index.js";

const EXECUTOR_ADDRESS = getAddress(SOMNIA_SHANNON_CONFIG.kasuwaExecutorAddress);

const EXECUTOR_ABI = [
  {
    type: "function", name: "setPolicyContract", stateMutability: "nonpayable",
    inputs: [{ name: "_policyContract", type: "address" }], outputs: [],
  },
  {
    type: "function", name: "policyContract", stateMutability: "view",
    inputs: [], outputs: [{ type: "address" }],
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
  console.log("  KASUWASHIELD — KASUWAPOLICY v2 REDEPLOY (ACCESS-CONTROL FIX)");
  console.log("================================================================================\n");

  const compiledPath = path.resolve(process.cwd(), "artifacts/KasuwaPolicy.v2.compiled.json");
  if (!fs.existsSync(compiledPath)) {
    throw new Error(`Missing ${compiledPath}. Compile contracts/KasuwaPolicy.sol with solc first (see comment at bottom of this script).`);
  }
  const { abi, bytecode } = JSON.parse(fs.readFileSync(compiledPath, "utf8"));

  const deployerKey = readEnvLocalKey();
  const deployer = privateKeyToAccount(deployerKey);
  const publicClient = createPublicClient({ chain, transport: http() });
  const deployerWallet = createWalletClient({ account: deployer, chain, transport: http() });

  console.log(`[DEPLOYER]: ${deployer.address}`);
  console.log(`[EXECUTOR (constructor arg)]: ${EXECUTOR_ADDRESS}\n`);

  console.log("Step 1/2 — Deploying KasuwaPolicy v2...");
  const deployHash = await deployerWallet.deployContract({
    abi,
    bytecode,
    args: [EXECUTOR_ADDRESS],
  });
  console.log(`  tx: ${deployHash}`);
  const deployReceipt = await publicClient.waitForTransactionReceipt({ hash: deployHash });
  const newPolicyAddress = deployReceipt.contractAddress;
  if (!newPolicyAddress) throw new Error("Deployment receipt has no contractAddress — inspect manually.");
  console.log(`  ✓ deployed at: ${newPolicyAddress} (block #${deployReceipt.blockNumber})\n`);

  console.log("Step 2/2 — KasuwaExecutor.setPolicyContract(newPolicyAddress)...");
  const rewireHash = await deployerWallet.writeContract({
    address: EXECUTOR_ADDRESS,
    abi: EXECUTOR_ABI,
    functionName: "setPolicyContract",
    args: [newPolicyAddress],
  });
  console.log(`  tx: ${rewireHash}`);
  await publicClient.waitForTransactionReceipt({ hash: rewireHash });
  console.log("  confirmed.\n");

  const check = await publicClient.readContract({
    address: EXECUTOR_ADDRESS,
    abi: EXECUTOR_ABI,
    functionName: "policyContract",
  });

  const explorer = SOMNIA_SHANNON_CONFIG.explorerUrl;
  console.log("================================================================================");
  console.log("  RESULT");
  console.log("================================================================================");
  console.log(`  New KasuwaPolicy address: ${newPolicyAddress}`);
  console.log(`  KasuwaExecutor.policyContract() now reads: ${check}`);
  console.log(`  Match: ${getAddress(check as string) === getAddress(newPolicyAddress)}`);
  console.log(`  Explorer: ${explorer}/address/${newPolicyAddress}`);
  console.log("\n  NEXT: verify this address's source on Blockscout (Solidity Single file,");
  console.log("  compiler v0.8.36+commit.8a079791, optimizer disabled, MIT license, constructor");
  console.log(`  arg = ${EXECUTOR_ADDRESS} ABI-encoded), then update README.md / EXECUTOR_POLICY_WIRING_PROOF.md`);
  console.log("  / packages/shared/src/constants.ts (kasuwaPolicyAddress) with the new address.");

  if (getAddress(check as string) !== getAddress(newPolicyAddress)) {
    console.error("\n✗ Rewiring did not take — investigate before treating this as done.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Script error:", err);
  process.exit(1);
});

/*
 * How artifacts/KasuwaPolicy.v2.compiled.json was generated (already done,
 * checked into this repo — re-run only if you change the contract again):
 *
 *   python3 -c "
 *   import json
 *   src = open('contracts/KasuwaPolicy.sol').read()
 *   inp = {
 *     'language': 'Solidity',
 *     'sources': { 'KasuwaPolicy.sol': { 'content': src } },
 *     'settings': {
 *       'optimizer': { 'enabled': False, 'runs': 200 },
 *       'outputSelection': { '*': { '*': ['abi', 'evm.bytecode.object'] } }
 *     }
 *   }
 *   open('/tmp/std_input.json', 'w').write(json.dumps(inp))
 *   "
 *   npx --yes solc@0.8.36 --standard-json < /tmp/std_input.json > /tmp/kp_compile.json
 *   python3 -c "
 *   content = open('/tmp/kp_compile.json').read()
 *   d = __import__('json').loads(content[content.index('{'):])
 *   c = d['contracts']['KasuwaPolicy.sol']['KasuwaPolicy']
 *   open('artifacts/KasuwaPolicy.v2.compiled.json','w').write(__import__('json').dumps({'abi': c['abi'], 'bytecode': '0x' + c['evm']['bytecode']['object']}, indent=2))
 *   "
 */
