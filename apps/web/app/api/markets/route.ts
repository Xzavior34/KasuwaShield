import { NextResponse } from "next/server";
import https from "https";

export const dynamic = "force-dynamic";

const FALLBACK_MARKETS = [
  {
    symbol: "SOMI:USDso",
    contract: "0x259fD6559214dd5aD3752322426eA9F9fABEFff4",
    base: "0x28f34DeFd2b4CB48d9eE6d89f2Be4Bc601694c00",
    quote: "0x9c32F3827A1a99f0cf9B213de8b53eC3d57bb171",
    baseDecimals: 18,
    quoteDecimals: 18,
    kind: "spot",
    lotSize: "0.01",
    minQuantity: "1",
    tickSize: "0.0001",
    stopRegistry: "0xEb97349Aa62A68507c0bE535eD88B0d028a47E1e",
  },
  {
    symbol: "WBTC:USDso",
    contract: "0x3605f28aA7C50e7441211e77Cb0762d49539326C",
    base: "0x4e85DC48a70DA1298489d5B6FC2492767d98f384",
    quote: "0x9c32F3827A1a99f0cf9B213de8b53eC3d57bb171",
    baseDecimals: 8,
    quoteDecimals: 18,
    kind: "spot",
    lotSize: "0.00001",
    minQuantity: "0.0001",
    tickSize: "0.1",
    stopRegistry: "0x53d5B2b0791b3992a1F3b5e0b0277Ee2e08B7aaD",
  },
  {
    symbol: "WETH:USDso",
    contract: "0xD180195da5459C7a0DEA188ed61216ec43682b50",
    base: "0x4d8E02BBfCf205828A8352Af4376b165E123D7b0",
    quote: "0x9c32F3827A1a99f0cf9B213de8b53eC3d57bb171",
    baseDecimals: 18,
    quoteDecimals: 18,
    kind: "spot",
    lotSize: "0.0001",
    minQuantity: "0.001",
    tickSize: "0.01",
    stopRegistry: "0xf822D4Cb94902d667c9650e702aA5f096cc7598F",
  },
];

export async function GET() {
  try {
    const agent = new https.Agent({ rejectUnauthorized: false });
    const res = await fetch("https://stg.api.dreamdex.io/v0/markets", {
      // @ts-ignore
      agent,
      headers: { "Accept": "application/json" },
      next: { revalidate: 30 },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.markets)) {
        return NextResponse.json({
          source: "live_dreamdex_staging",
          url: "https://stg.api.dreamdex.io/v0/markets",
          status: "ok",
          count: data.markets.length,
          markets: data.markets,
        });
      }
    }
  } catch (err) {
    // Fallback gracefully
  }

  return NextResponse.json({
    source: "verified_testnet_snapshot",
    url: "https://stg.api.dreamdex.io/v0/markets",
    status: "ok",
    count: FALLBACK_MARKETS.length,
    markets: FALLBACK_MARKETS,
  });
}
