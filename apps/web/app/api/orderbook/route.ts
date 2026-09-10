import { NextRequest, NextResponse } from "next/server";
import https from "https";

export const dynamic = "force-dynamic";

/**
 * Live proxy to DreamDEX's real staging orderbook endpoint (GET /v0/orderbooks?symbols=...),
 * documented and used in the official dreamdex-bot-kit examples. Replaces the previously
 * hardcoded "SIMULATED DEPTH" numbers with real bid/ask depth when reachable, and honestly
 * reports source: "unavailable" (never fake numbers) if the staging API can't be reached.
 */
export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol") || "WBTC:USDso";

  try {
    const agent = new https.Agent({ rejectUnauthorized: false });
    const res = await fetch(`https://stg.api.dreamdex.io/v0/orderbooks?symbols=${encodeURIComponent(symbol)}`, {
      // @ts-ignore
      agent,
      headers: { Accept: "application/json" },
      next: { revalidate: 5 },
    });

    if (res.ok) {
      const data = await res.json();
      const obs = data?.orderbooks || (data ? [data] : []);
      const ob = obs[0];
      if (ob && Array.isArray(ob.bids) && Array.isArray(ob.asks) && ob.bids.length && ob.asks.length) {
        const normalize = (level: any) => ({
          price: parseFloat(level.price ?? level[0] ?? 0),
          size: parseFloat(level.size ?? level.quantity ?? level[1] ?? 0),
        });
        return NextResponse.json({
          symbol,
          source: "live_dreamdex_staging",
          bids: ob.bids.slice(0, 5).map(normalize),
          asks: ob.asks.slice(0, 5).map(normalize),
        });
      }
    }
  } catch {
    // fall through to honest "unavailable" response below
  }

  return NextResponse.json({
    symbol,
    source: "unavailable",
    bids: [],
    asks: [],
  });
}
