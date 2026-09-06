/**
 * KasuwaShield — Real DreamDEX Order Placement Proof
 *
 * Closes the one honestly-disclosed gap flagged by three separate reviews this
 * week (two AI-generated competitor "audits" and one grounded in real code):
 * KasuwaExecutor.executeAutoRoll() validates budget and emits an event, but it
 * has never actually placed a real DreamDEX order. This script does that --
 * for real, using the DreamDEX bot-kit SDK vendored at
 * ref/dreamdex-bot-kit/packages/ec-core, not a simulation.
 *
 * What this proves: the deployer wallet (acting as the trader) can discover a
 * real live DreamDEX binary market, read its authoritative on-chain snapshot,
 * and place a real IOC "NO" (downside) taker order that fills or cancels on
 * the actual venue -- the same kind of order KasuwaShield's policy is meant to
 * protect a user's exposure with.
 *
 * What this does NOT prove: it does not change KasuwaExecutor.sol itself.
 * The deployed contract still only does policy accounting (see
 * contracts/KasuwaExecutor.sol's updated NatSpec). Wiring the contract to call
 * DreamDEX directly on-chain is a larger, separate change (new Solidity, a
 * redeploy, a new security review) -- appropriately out of scope for the time
 * left before submission. This script instead proves the SAME session-key
 * architecture is capable of executing a real trade end-to-end off-chain,
 * which is the honest, verifiable claim to make right now.
 *
 * SETUP (one-time):
 *   1. Add the SDK dependency (not yet installed in this repo):
 *        npm install @somnia-chain/markets-sdk@^0.28.1
 *   2. Make sure .env.local has DEPLOYER_PRIVATE_KEY set (same key every
 *      other script in this repo already uses).
 *
 * RUN:
 *   npx tsx scripts/place-real-dreamdex-order.ts [asset] [quantity]
 *   e.g. npx tsx scripts/place-real-dreamdex-order.ts BTC 1
 *
 * IMPORTANT HONESTY NOTE FOR WHOEVER RUNS THIS (Antigravity or Sara):
 * I (Claude) wrote this against the vendored SDK's documented API and its own
 * source comments, but I could not execute it myself -- my shell's network
 * egress is restricted from reaching Somnia RPC / the DreamDEX indexer /
 * npm's registry for this specific package. This is best-effort, careful code
 * review, not a tested script. If the first run errors, paste the exact error
 * back and I will fix it -- do not paper over an error or claim this "works"
 * without seeing it actually print a real tx hash and fill.
 */

import fs from "node:fs";
import path from "node:path";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import {
  createExchange,
  shutdown,
  activeMarkets,
  marketOnchain,
  outcomeSymbols,
  isTradable,
  snapshot,
  seedInventory,
  placeLimit,
  quantize,
} from "../ref/dreamdex-bot-kit/packages/ec-core/src/index.js";

function readEnvLocalKey(): void {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) throw new Error(".env.local not found — DEPLOYER_PRIVATE_KEY is required.");
  const content = fs.readFileSync(envPath, "utf8");
  const match = content.match(/DEPLOYER_PRIVATE_KEY\s*=\s*["']?([a-fA-F0-9xX]+)["']?/);
  if (!match) throw new Error("DEPLOYER_PRIVATE_KEY not found in .env.local");
  const raw = match[1].trim();
  // The bot-kit's own loadEnv() reads process.env.PRIVATE_KEY, not
  // DEPLOYER_PRIVATE_KEY -- bridge the two so this repo's existing .env.local
  // convention "just works" without asking anyone to duplicate the key.
  process.env.PRIVATE_KEY = raw.startsWith("0x") ? raw : `0x${raw}`;
}

async function main() {
  console.log("================================================================================");
  console.log("  KASUWASHIELD — REAL DREAMDEX ORDER PLACEMENT PROOF");
  console.log("================================================================================\n");

  readEnvLocalKey();

  const assetArg = (process.argv[2] ?? "BTC").toUpperCase();
  const qtyArg = Number(process.argv[3] ?? "1");

  const ctx = createExchange({ withSigner: true });
  console.log(`[TRADER WALLET]: ${ctx.exchange.walletAddress}\n`);

  try {
    console.log(`Step 1 — Loading live markets and finding an active ${assetArg} binary market...`);
    const candidates = await activeMarkets(ctx, { asset: assetArg, max: 5 });
    const market = candidates[0] ?? (await activeMarkets(ctx, { max: 5 }))[0];
    if (!market) {
      throw new Error(
        "No active binary markets found at all right now. This is a live venue -- " +
          "try again in a minute, or run without an asset filter.",
      );
    }
    console.log(`  Found: ${market.symbol}\n`);

    console.log("Step 2 — Reading the market's authoritative on-chain snapshot...");
    const onchain = await marketOnchain(ctx, market);
    if (!onchain) throw new Error("marketOnchain() returned null — not a binary market row.");
    if (!isTradable(onchain)) {
      throw new Error(`Market status is not "Trading" (status=${onchain.status}) -- pick a different market.`);
    }
    console.log(`  pool: ${onchain.pool}`);
    console.log(`  status: Trading, expiry: ${new Date(Number(onchain.expiry) * 1000).toISOString()}\n`);

    console.log("Step 3 — Ensuring the trader wallet holds enough testnet collateral (faucets if low)...");
    await seedInventory(ctx, market, onchain).catch((err: unknown) => {
      console.log(`  (seedInventory skipped/failed non-fatally: ${(err as Error).message} -- continuing, the order below will fail loudly if truly unfunded)`);
    });

    const { no: noSymbol } = outcomeSymbols(market);
    const book = await snapshot(ctx, outcomeSymbols(market).yes, 5);
    console.log(`  current YES best bid/ask: ${book.bestYesBid ?? "—"} / ${book.bestYesAsk ?? "—"}\n`);

    // NO price = 1 - YES price. Quote aggressively above the implied NO ask so
    // the IOC order is guaranteed to cross whatever is actually resting, and
    // cancels the remainder if there isn't enough depth -- never rests badly.
    const impliedNoAsk = book.bestYesBid !== undefined ? 1 - book.bestYesBid : 0.9;
    const aggressivePrice = Math.min(0.97, impliedNoAsk + 0.1);
    const size = quantize(ctx, qtyArg) || qtyArg;

    console.log(`Step 4 — Placing a REAL IOC BUY NO order: ${size} shares @ ${aggressivePrice.toFixed(2)} (NO price)...`);
    const result = await placeLimit(ctx, {
      market,
      onchain,
      outcome: "NO",
      side: "buy",
      price: aggressivePrice,
      size,
      type: "ioc",
      expiresInSec: 60,
    });

    console.log("\n================================================================================");
    console.log("  RESULT");
    console.log("================================================================================");
    console.log(`  tx hash:        ${result.hash ?? "(none — check for a thrown error above)"}`);
    console.log(`  filled shares:  ${result.filled}`);
    console.log(`  requested size: ${result.size}`);
    console.log(`  price sent:     ${result.price}`);
    console.log(`  rested:         ${result.rested} (should be false for a fully-filled/cancelled IOC)`);

    if (result.filled > 0 && result.hash) {
      console.log(`\n  Explorer: https://shannon-explorer.somnia.network/tx/${result.hash}`);
      console.log("\n✓ Real DreamDEX order placed and filled — this tx hash is independently verifiable by anyone.");
    } else {
      console.log(
        "\n⚠ Order sent but nothing filled (symbol " + noSymbol + "). This can legitimately happen if the " +
          "book had no opposing liquidity at this price at this instant -- it is not a bug in this script. " +
          "Re-run, or widen aggressivePrice, before concluding something is broken.",
      );
    }
  } finally {
    await shutdown(ctx);
  }
}

main().catch((err) => {
  console.error("\n✗ Script error:", err);
  process.exit(1);
});
