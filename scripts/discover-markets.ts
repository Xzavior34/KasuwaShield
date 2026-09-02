import { discoverLiveBinaryMarkets } from "../packages/markets/src/index.js";

async function main() {
  console.log("==========================================");
  console.log("KASUWASHIELD — LIVE MARKET DISCOVERY");
  console.log("Scanning Somnia Shannon Testnet...");
  console.log("==========================================\n");

  const markets = await discoverLiveBinaryMarkets();
  console.log(`Discovered ${markets.length} live active binary markets.\n`);

  for (const m of markets) {
    const minsLeft = Math.round((Number(m.expiry) - Math.floor(Date.now() / 1000)) / 60);
    console.log(
      `Asset: ${m.asset.padEnd(6)} | Expiry: in ${minsLeft}m | Pool: ${m.pool} | MarketID: ${m.marketId.slice(0, 16)}...`
    );
    console.log(
      `  Spread: ${((m.spread ?? 0) * 100).toFixed(1)}% | Best Ask: $${(m.bestAskProb ?? 0).toFixed(2)} | Liquidity: ${m.liquidityContracts} contracts`
    );
    console.log("--------------------------------------------------");
  }
}

main().catch((err) => {
  console.error("Discovery error:", err);
  process.exit(1);
});
