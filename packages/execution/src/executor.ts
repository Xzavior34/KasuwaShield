import {
  BinaryMarketInfo,
  ProtectionParams,
  PositionRecord,
  RiskPolicy,
  DEFAULT_RISK_POLICY,
  SOMNIA_SHANNON_CONFIG
} from "@kasuwa-shield/shared";
import { calculateProtection } from "@kasuwa-shield/risk-engine";
import { SomniaMarkets } from "@somnia-chain/markets-sdk";
import { probabilityToPrice } from "@somnia-chain/markets-sdk";

export interface ExecutionResult {
  success: boolean;
  position?: PositionRecord;
  txHash?: string;
  error?: string;
}

export async function executeDownsideProtection(
  params: ProtectionParams,
  market: BinaryMarketInfo,
  privateKey: string,
  policy: RiskPolicy = DEFAULT_RISK_POLICY,
  rpcUrl?: string,
  wsRpcUrl?: string
): Promise<ExecutionResult> {
  // 1. Calculate Protection Recommendation & Enforce Policy
  const rec = calculateProtection(params, market, policy);

  if (rec.recommendation === "SKIP" || rec.recommendation === "WAIT") {
    return {
      success: false,
      error: `Execution blocked by risk policy: ${rec.reason}`,
    };
  }

  const now = Math.floor(Date.now() / 1000);
  if (Number(market.expiry) <= now + 30) {
    return {
      success: false,
      error: "Market is within 30 seconds of expiry. Execution aborted for safety.",
    };
  }

  try {
    // 2. Initialize SomniaMarkets SDK
    const ex = new SomniaMarkets({
      chain: {
        id: SOMNIA_SHANNON_CONFIG.chainId,
        name: SOMNIA_SHANNON_CONFIG.chainName,
        nativeCurrency: { name: "Somnia Token", symbol: "STT", decimals: 18 },
        rpcUrls: { default: { http: [rpcUrl || SOMNIA_SHANNON_CONFIG.rpcUrl] } },
      } as any,
      addresses: {
        testUsdc: SOMNIA_SHANNON_CONFIG.testUsdcAddress,
      } as any,
      privateKey: privateKey as `0x${string}`,
      wsRpcUrl: wsRpcUrl || SOMNIA_SHANNON_CONFIG.wsRpcUrl,
      indexerUrl: "https://dev.smk.somnia.host/v1/graphql",
    });

    // 3. Verify On-Chain Market Status
    const mo = await ex.client.getMarketOnchain(market.marketId);
    if (mo.finalized || mo.status !== 1) {
      return {
        success: false,
        error: `On-chain market is not open for trading (status=${mo.status}, finalized=${mo.finalized}).`,
      };
    }

    // 4. Sizing & Order Parameters
    const quantityContracts = BigInt(rec.requiredContracts);
    const quantityBase = quantityContracts * SOMNIA_SHANNON_CONFIG.oneContractUnit;
    const executionPriceProb = Math.min(0.99, (market.bestAskProb ?? 0.45) + (params.maxSlippagePercent / 100));
    const priceUnits = probabilityToPrice(executionPriceProb);

    // 5. Submit IOC Order on DreamDEX CLOB (BUY_NO = Downside Protection)
    const takerOrder = await ex.trader.placeOrder({
      pool: market.pool as `0x${string}`,
      side: "BUY_NO",
      price: priceUnits,
      quantity: quantityBase,
      orderType: 2, // 2 = IOC (Immediate Or Cancel)
    });

    const txHash = takerOrder.hash || takerOrder.txHash || takerOrder.info?.transactionHash || "0x_simulated_execution";
    const positionId = `shield_${Date.now()}_${market.marketId.slice(0, 8)}`;

    const positionRecord: PositionRecord = {
      positionId,
      userAddress: ex.account?.address || "0xUser",
      marketId: market.marketId,
      poolAddress: market.pool,
      asset: market.asset,
      underlyingExposureUSD: params.exposureUSD,
      protectionTargetUSD: rec.targetProtectedUSD,
      contractQuantity: rec.requiredContracts,
      contractPrice: Number(executionPriceProb.toFixed(4)),
      totalCostUSD: rec.estimatedCostUSD,
      entryTimestamp: now,
      expiryTimestamp: Number(market.expiry),
      outcomeDirection: "DOWN",
      status: "ACTIVE",
      executionTxHash: txHash,
    };

    return {
      success: true,
      position: positionRecord,
      txHash,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Execution error: ${err.message || String(err)}`,
    };
  }
}
