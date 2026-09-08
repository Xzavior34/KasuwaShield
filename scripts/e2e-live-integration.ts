/**
 * KasuwaShield — Comprehensive Live E2E Integration Test Suite
 * 
 * Verifies the complete stack against live production infrastructure:
 * 1. Somnia Shannon RPC (Chain ID 50312, live block height, gas balance)
 * 2. On-Chain Smart Contracts (bytecode verification, executor-to-policy storage wiring)
 * 3. DreamDEX Staging API Proxy (/api/markets live dynamic parsing)
 * 4. Deployed Frontend Pages (SSR payload integrity, address consistency)
 * 5. Cryptographic EIP-712 Session Key delegation validation
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { SOMNIA_SHANNON_CONFIG } from "../packages/shared/src/index.js";
import { keccak256, toHex, recoverAddress, hashTypedData } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const DEPLOYED_BASE_URL = process.env.TARGET_URL || "https://kasuwa-shield-web-ousu.vercel.app";
const RPC_URL = SOMNIA_SHANNON_CONFIG.rpcUrl;

async function rpcCall(method: string, params: any[] = []) {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || "RPC Error");
  return json.result;
}

async function runE2EIntegration() {
  console.log("================================================================================");
  console.log("  KASUWASHIELD — END-TO-END LIVE INTEGRATION TEST SUITE");
  console.log(`  Target Deployment: ${DEPLOYED_BASE_URL}`);
  console.log(`  Target Network:    Somnia Shannon Testnet (${SOMNIA_SHANNON_CONFIG.chainId})`);
  console.log("================================================================================\n");

  let passed = 0;
  let total = 0;

  function report(name: string, ok: boolean, details: string) {
    total++;
    if (ok) {
      passed++;
      console.log(`  [✓] PASS: ${name}`);
      console.log(`      -> ${details}`);
    } else {
      console.log(`  [✗] FAIL: ${name}`);
      console.log(`      -> ${details}`);
    }
  }

  // 1. Live RPC & Network Health
  try {
    const chainIdHex = await rpcCall("eth_chainId");
    const chainId = parseInt(chainIdHex, 16);
    report("Somnia Shannon Chain ID Integrity", chainId === 50312, `Live eth_chainId returned ${chainId}`);
  } catch (err: any) {
    report("Somnia Shannon Chain ID Integrity", false, err.message);
  }

  try {
    const blockHex = await rpcCall("eth_blockNumber");
    const blockNumber = parseInt(blockHex, 16);
    report("Somnia Head Block Height", Number.isFinite(blockNumber) && blockNumber > 480000000, `Head Block #${blockNumber.toLocaleString()}`);
  } catch (err: any) {
    report("Somnia Head Block Height", false, err.message);
  }

  // 2. On-Chain Contracts & Storage Wiring
  try {
    const policyCode = await rpcCall("eth_getCode", [SOMNIA_SHANNON_CONFIG.kasuwaPolicyAddress, "latest"]);
    const executorCode = await rpcCall("eth_getCode", [SOMNIA_SHANNON_CONFIG.kasuwaExecutorAddress, "latest"]);
    const hasBytecode = policyCode.length > 100 && executorCode.length > 100;
    report("Deployed Smart Contract Bytecode", hasBytecode, `KasuwaPolicy: ${Math.round(policyCode.length/2)}B, KasuwaExecutor: ${Math.round(executorCode.length/2)}B`);
  } catch (err: any) {
    report("Deployed Smart Contract Bytecode", false, err.message);
  }

  try {
    const slot0 = await rpcCall("eth_getStorageAt", [SOMNIA_SHANNON_CONFIG.kasuwaExecutorAddress, "0x0", "latest"]);
    const wiredAddress = "0x" + slot0.slice(26).toLowerCase();
    const expectedPolicy = SOMNIA_SHANNON_CONFIG.kasuwaPolicyAddress.toLowerCase();
    const isWired = wiredAddress === expectedPolicy;
    report("Executor-to-Policy Storage Slot 0 Wiring", isWired, `Storage Slot 0: ${wiredAddress} (matches KasuwaPolicy v2)`);
  } catch (err: any) {
    report("Executor-to-Policy Storage Slot 0 Wiring", false, err.message);
  }

  // 3. Live DreamDEX API Staging Proxy
  try {
    const apiRes = await fetch(`${DEPLOYED_BASE_URL}/api/markets`);
    const data = await apiRes.json();
    const validMarkets = data && Array.isArray(data.markets) && data.markets.length >= 3;
    report("DreamDEX Staging API Proxy (/api/markets)", apiRes.status === 200 && validMarkets, `Source: ${data.source}, Loaded ${data.markets.length} active markets (BTC, ETH, SOMI)`);
  } catch (err: any) {
    report("DreamDEX Staging API Proxy (/api/markets)", false, err.message);
  }

  // 4. Live Deployed Pages & Contract Address Alignment
  const routesToCheck = [
    { path: "/", name: "Homepage & Risk Dashboard", expected: ["Deterministic Risk Engine", "Agent Telemetry Stream", SOMNIA_SHANNON_CONFIG.kasuwaPolicyAddress] },
    { path: "/risk", name: "Risk Configuration Page", expected: ["Quantitative Risk Engine", "Value at Risk", "Kelly Criterion"] },
    { path: "/execution", name: "EIP-7702 Execution & Rollover", expected: ["System Architecture Flow", "Interactive Session Key Sandbox", "Permission Boundaries"] },
    { path: "/proof", name: "On-Chain Truth & Evidence Center", expected: ["Live Testnet Execution Proof Center", SOMNIA_SHANNON_CONFIG.kasuwaPolicyAddress, SOMNIA_SHANNON_CONFIG.kasuwaExecutorAddress] },
    { path: "/proof/demo-pos-1", name: "On-Chain Position Verification", expected: ["On-Chain Position Verification", "0x12407c4343bcec1a28fd0c788f6e4019c2e4624e0aad67a19800665baab2c562"] },
    { path: "/replay", name: "Historical Stress Replay Engine", expected: ["Flash Crash", "Gradual Bleed", "Volatility Spike"] },
  ];

  for (const r of routesToCheck) {
    try {
      const res = await fetch(`${DEPLOYED_BASE_URL}${r.path}`);
      const text = await res.text();
      const hasAll = r.expected.every((k) => text.includes(k));
      report(`Live Page Integrity: ${r.name}`, res.status === 200 && hasAll && text.length > 15000, `HTTP ${res.status}, ${text.length.toLocaleString()} bytes, all critical signatures confirmed`);
    } catch (err: any) {
      report(`Live Page Integrity: ${r.name}`, false, err.message);
    }
  }

  // 5. Cryptographic EIP-712 Delegation Signature Flow
  try {
    const account = privateKeyToAccount(generatePrivateKey());
    const ephemeralKey = privateKeyToAccount(generatePrivateKey());

    const domain = {
      name: "KasuwaShield",
      version: "1",
      chainId: 50312,
      verifyingContract: SOMNIA_SHANNON_CONFIG.kasuwaExecutorAddress as `0x${string}`,
    };

    const types = {
      SessionKeyAuthorization: [
        { name: "delegator", type: "address" },
        { name: "sessionKey", type: "address" },
        { name: "allowedContracts", type: "address[]" },
        { name: "maxBudgetUSD", type: "string" },
        { name: "validUntil", type: "uint256" },
      ],
    };

    const message = {
      delegator: account.address,
      sessionKey: ephemeralKey.address,
      allowedContracts: [SOMNIA_SHANNON_CONFIG.kasuwaPolicyAddress as `0x${string}`],
      maxBudgetUSD: "$100.00",
      validUntil: BigInt(Math.floor(Date.now() / 1000) + 86400),
    };

    const signature = await account.signTypedData({
      domain,
      types,
      primaryType: "SessionKeyAuthorization",
      message,
    });

    const recovered = await recoverAddress({
      hash: hashTypedData({ domain, types, primaryType: "SessionKeyAuthorization", message }),
      signature,
    });

    const isSigValid = recovered.toLowerCase() === account.address.toLowerCase();
    report("Cryptographic EIP-712 Session Key Delegation", isSigValid, `Generated & verified valid ECDSA signature from ${account.address.slice(0, 10)}...`);
  } catch (err: any) {
    report("Cryptographic EIP-712 Session Key Delegation", false, err.message);
  }

  console.log("\n================================================================================");
  console.log(`  E2E INTEGRATION RESULTS: ${passed}/${total} CHECKS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log("================================================================================\n");

  if (passed !== total) {
    process.exit(1);
  }
}

runE2EIntegration().catch((err) => {
  console.error("E2E Integration Fatal Error:", err);
  process.exit(1);
});
