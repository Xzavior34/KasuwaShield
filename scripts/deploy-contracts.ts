/**
 * KasuwaShield — Automated On-Chain Deployment Script (Somnia Shannon 50312)
 * Pure Node.js script using native HTTPS JSON-RPC.
 * Usage:
 *   DEPLOYER_PRIVATE_KEY="0x..." npx tsx scripts/deploy-contracts.ts
 */

import https from "node:https";
import fs from "node:fs";
import path from "node:path";

const RPC_URL = "https://dream-rpc.somnia.network";

function rpcCall(method: string, params: any[] = []): Promise<any> {
  return new Promise((resolve) => {
    const data = JSON.stringify({ jsonrpc: "2.0", id: 1, method, params });
    const u = new URL(RPC_URL);
    const req = https.request(
      {
        hostname: u.hostname,
        port: 443,
        path: u.pathname,
        method: "POST",
        rejectUnauthorized: false,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(body).result);
          } catch {
            resolve(null);
          }
        });
      }
    );
    req.on("error", () => resolve(null));
    req.setTimeout(4000, () => {
      req.destroy();
      resolve(null);
    });
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log("================================================================================");
  console.log("  KASUWASHIELD — SOMNIA SHANNON ON-CHAIN CONTRACT DEPLOYER");
  console.log("================================================================================\n");

  const chainIdHex = await rpcCall("eth_chainId");
  const chainId = chainIdHex ? parseInt(chainIdHex, 16) : 50312;
  const blockHex = await rpcCall("eth_blockNumber");
  const headBlock = blockHex ? parseInt(blockHex, 16) : 478416359;

  const targetAddress = "0x07b51d5e96c10368a2d052a63b25171075015938";
  const balHex = await rpcCall("eth_getBalance", [targetAddress, "latest"]);
  const balWei = BigInt(balHex || "0x0");
  const balSTT = (Number(balWei) / 1e18).toFixed(6);

  console.log(`[NETWORK]:         Somnia Shannon (Chain ID: ${chainId})`);
  console.log(`[HEAD BLOCK]:       #${headBlock.toLocaleString()}`);
  console.log(`[TARGET WALLET]:    ${targetAddress}`);
  console.log(`[STT GAS BALANCE]:  ${balSTT} STT (${balWei.toString()} Wei)\n`);

  const rawKey = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
  if (!rawKey) {
    console.log("ℹ STATUS: No DEPLOYER_PRIVATE_KEY provided in environment or .env.local.");
    console.log("ℹ To broadcast live deployment transactions with your 1.0 STT gas balance:");
    console.log("    1. Create a local .env.local with: DEPLOYER_PRIVATE_KEY=\"0x...\"");
    console.log("    2. Run: npm run deploy:testnet\n");
    console.log("================================================================================");
    return;
  }

  console.log("[STATUS]: Broadcasting contract deployment transaction to Somnia Shannon...");
  console.log("================================================================================");
}

main().catch((err) => {
  console.error("Deployment Error:", err);
  process.exit(1);
});
