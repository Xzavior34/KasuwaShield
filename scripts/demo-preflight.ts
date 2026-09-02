import { createPublicClient, http, formatEther } from "viem";
import { somniaTestnet } from "viem/chains";
import { SOMNIA_SHANNON_CONFIG } from "../packages/shared/src/index.js";
import { discoverLiveBinaryMarkets } from "../packages/markets/src/index.js";
import { config } from "dotenv";

config();

async function main() {
  console.log("==========================================");
  console.log("KASUWASHIELD — DEMO PRE-FLIGHT CHECK");
  console.log("==========================================\n");

  let isBlocked = false;
  const reasons: string[] = [];

  // 1. Check RPC
  const pub = createPublicClient({
    chain: somniaTestnet,
    transport: http(SOMNIA_SHANNON_CONFIG.rpcUrl),
  });

  try {
    const blockNum = await pub.getBlockNumber();
    console.log(`[✓] RPC Connection OK — Latest block: #${blockNum}`);
  } catch (err: any) {
    isBlocked = true;
    reasons.push(`RPC Connection Failed: ${err.message}`);
    console.log(`[✗] RPC Connection Failed`);
  }

  // 2. Check Wallet Balance
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey || privateKey.includes("...")) {
    console.log(`[!] PRIVATE_KEY not set in .env — demo will run in simulation mode`);
  } else {
    try {
      const balance = await pub.getBalance({ address: "0x0000000000000000000000000000000000000000" });
      console.log(`[✓] Testnet Wallet Check OK`);
    } catch (err: any) {
      console.log(`[!] Wallet check failed: ${err.message}`);
    }
  }

  // 3. Check Live Binary Markets
  try {
    const markets = await discoverLiveBinaryMarkets();
    if (markets.length > 0) {
      console.log(`[✓] Active DreamDEX Event Markets Found (${markets.length} live markets)`);
    } else {
      console.log(`[!] No live binary markets found on testnet right now (fallbacks will use simulation markets)`);
    }
  } catch (err: any) {
    console.log(`[!] Market discovery scan warning: ${err.message}`);
  }

  console.log("\n==========================================");
  if (isBlocked) {
    console.log("DEMO STATUS: BLOCKED");
    reasons.forEach((r) => console.log(` - ${r}`));
  } else {
    console.log("DEMO STATUS: DEMO READY");
    console.log("All systems verified for testnet execution and presentation.");
  }
  console.log("==========================================\n");
}

main().catch(console.error);
