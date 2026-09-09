import { NextResponse } from "next/server";
import https from "https";

export const dynamic = "force-dynamic";

// Current calibrated market fallbacks (September 2026)
const CALIBRATED_FALLBACK_PRICES: Record<string, number> = {
  BTC: 79650,
  ETH: 2520,
  SOL: 105,
  SOMI: 1.20,
};

export async function GET() {
  const prices: Record<string, number> = { ...CALIBRATED_FALLBACK_PRICES };
  let source = "calibrated_baseline";

  try {
    const agent = new https.Agent({ rejectUnauthorized: false });

    // Try fetching from Binance public ticker API
    const symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT"];
    const promises = symbols.map(async (sym) => {
      const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${sym}`, {
        // @ts-ignore
        agent,
        headers: { "Accept": "application/json" },
        next: { revalidate: 15 },
      });
      if (res.ok) {
        const data = await res.json();
        return { symbol: sym, price: parseFloat(data.price) };
      }
      return null;
    });

    const results = await Promise.allSettled(promises);
    let successCount = 0;

    for (const r of results) {
      if (r.status === "fulfilled" && r.value) {
        const { symbol, price } = r.value;
        if (symbol === "BTCUSDT" && price > 10000) {
          prices.BTC = Math.round(price * 100) / 100;
          successCount++;
        } else if (symbol === "ETHUSDT" && price > 500) {
          prices.ETH = Math.round(price * 100) / 100;
          successCount++;
        } else if (symbol === "SOLUSDT" && price > 10) {
          prices.SOL = Math.round(price * 100) / 100;
          successCount++;
        }
      }
    }

    if (successCount > 0) {
      source = "live_market_feed";
    }
  } catch (err) {
    // Graceful fallback to calibrated baseline
  }

  return NextResponse.json({
    source,
    timestamp: new Date().toISOString(),
    prices,
  });
}
