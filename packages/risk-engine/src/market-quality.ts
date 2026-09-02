import { BinaryMarketInfo } from "../../shared/src/index.js";

export interface MarketQualityResult {
  score: number;
  rating: "GOOD" | "FAIR" | "POOR" | "UNAVAILABLE";
  metrics: {
    liquidityOk: boolean;
    spreadOk: boolean;
    timeRemainingOk: boolean;
    statusOk: boolean;
    priceOk: boolean;
  };
  details: string[];
}

export function evaluateMarketQuality(
  market: BinaryMarketInfo,
  requestedContracts: number,
  maxBudgetUSD: number,
  maxSlippagePercent: number
): MarketQualityResult {
  const details: string[] = [];
  let score = 100;

  const statusOk = market.status === 1 && !market.finalized;
  if (!statusOk) {
    score -= 100;
    details.push("Market is not in active Trading status");
    return {
      score: 0,
      rating: "UNAVAILABLE",
      metrics: {
        liquidityOk: false,
        spreadOk: false,
        timeRemainingOk: false,
        statusOk: false,
        priceOk: false
      },
      details
    };
  }
  details.push("Market status: Trading ACTIVE");

  const now = Math.floor(Date.now() / 1000);
  const secondsLeft = Number(market.expiry) - now;
  const timeRemainingOk = secondsLeft >= 60;
  if (secondsLeft < 60) {
    score -= 40;
    details.push(`Market expires in ${secondsLeft}s (too close to expiry)`);
  } else if (secondsLeft < 300) {
    score -= 15;
    details.push(`Market expires in ${Math.round(secondsLeft / 60)} minutes`);
  } else {
    details.push(`Time remaining: ${Math.round(secondsLeft / 60)} minutes`);
  }

  const askPrice = market.bestAskProb ?? 0.5;
  const bidPrice = market.bestBidProb ?? 0.45;
  const spread = market.spread ?? Math.abs(askPrice - bidPrice);
  const spreadOk = spread <= maxSlippagePercent / 100 + 0.05;

  if (spread > 0.10) {
    score -= 30;
    details.push(`Wide orderbook spread: ${(spread * 100).toFixed(1)}%`);
  } else if (spread > 0.05) {
    score -= 15;
    details.push(`Moderate spread: ${(spread * 100).toFixed(1)}%`);
  } else {
    details.push(`Tight spread: ${(spread * 100).toFixed(1)}%`);
  }

  const priceOk = askPrice <= 0.85;
  if (askPrice > 0.85) {
    score -= 25;
    details.push(`High downside contract price: $${askPrice.toFixed(2)}`);
  }

  const availableLiquidity = market.liquidityContracts ?? 100;
  const liquidityOk = availableLiquidity >= requestedContracts;
  if (!liquidityOk) {
    score -= 35;
    details.push(`Insufficient opposing liquidity: ${availableLiquidity} contracts available vs ${requestedContracts} requested`);
  } else {
    details.push(`Available liquidity: ${availableLiquidity} contracts (sufficient)`);
  }

  const finalScore = Math.max(0, Math.min(100, score));
  let rating: "GOOD" | "FAIR" | "POOR" | "UNAVAILABLE" = "POOR";
  if (finalScore >= 80) rating = "GOOD";
  else if (finalScore >= 50) rating = "FAIR";

  return {
    score: finalScore,
    rating,
    metrics: {
      liquidityOk,
      spreadOk,
      timeRemainingOk,
      statusOk,
      priceOk
    },
    details
  };
}
