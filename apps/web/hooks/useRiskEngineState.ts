"use client";

import { useState, useEffect, useCallback } from "react";

export type SystemState =
  | "IDLE"
  | "NORMAL"
  | "VOLATILITY_RISING"
  | "THRESHOLD_APPROACHING"
  | "THRESHOLD_BREACHED"
  | "RISK_EVALUATING"
  | "HEDGE_REQUIRED"
  | "EXECUTING"
  | "PROTECTED"
  | "AUTO_ROLL"
  | "COMPLETE";

export interface PricePoint {
  timestamp: string;
  btcPrice: number;
  ethPrice: number;
  thresholdPrice: number;
  hedgePrice: number;
  portfolioValue: number;
}

export interface ReactivityEvent {
  id: string;
  timestamp: string;
  eventType: string;
  blockNumber: number;
  source: string;
  status: "RECEIVED" | "EVALUATED" | "DISPATCHED" | "CONFIRMED";
  isDemo?: boolean;
}

export interface AuditRecord {
  id: string;
  time: string;
  event: string;
  action: string;
  contract: string;
  riskScore: number;
  txHash: string;
  status: "CONFIRMED" | "PENDING" | "ROLLED";
  isDemo?: boolean;
}

export interface ProtectionLadderItem {
  id: string;
  label: string;
  notionalUSD: number;
  contract: string;
  entryPrice: number;
  expiryTime: string;
  status: "EXPIRED" | "ROLLED" | "ACTIVE" | "QUEUED";
  executionTime: string;
}

const INITIAL_PRICE_POINTS: PricePoint[] = [
  { timestamp: "14:45", btcPrice: 65200, ethPrice: 3480, thresholdPrice: 64000, hedgePrice: 65000, portfolioValue: 25000 },
  { timestamp: "14:46", btcPrice: 65150, ethPrice: 3475, thresholdPrice: 64000, hedgePrice: 65000, portfolioValue: 24980 },
  { timestamp: "14:47", btcPrice: 65100, ethPrice: 3470, thresholdPrice: 64000, hedgePrice: 65000, portfolioValue: 24950 },
  { timestamp: "14:48", btcPrice: 65050, ethPrice: 3465, thresholdPrice: 64000, hedgePrice: 65000, portfolioValue: 24920 },
  { timestamp: "14:49", btcPrice: 65000, ethPrice: 3460, thresholdPrice: 64000, hedgePrice: 65000, portfolioValue: 24900 },
  { timestamp: "14:50", btcPrice: 64950, ethPrice: 3455, thresholdPrice: 64000, hedgePrice: 65000, portfolioValue: 24870 },
  { timestamp: "14:51", btcPrice: 64900, ethPrice: 3450, thresholdPrice: 64000, hedgePrice: 65000, portfolioValue: 24850 },
  { timestamp: "14:52", btcPrice: 64850, ethPrice: 3445, thresholdPrice: 64000, hedgePrice: 65000, portfolioValue: 24820 },
  { timestamp: "14:53", btcPrice: 64800, ethPrice: 3440, thresholdPrice: 64000, hedgePrice: 65000, portfolioValue: 24800 },
];

export function useRiskEngineState() {
  const [systemState, setSystemState] = useState<SystemState>("NORMAL");
  const [isSimulationRunning, setIsSimulationRunning] = useState<boolean>(false);
  const [simulationProgress, setSimulationProgress] = useState<number>(0);

  // Portfolio metrics
  const portfolioExposureUSD = 25000;
  const downsideThresholdPct = 8.0; // -8%
  const protectedNotionalUSD = 20000; // $20,000 protected
  const targetHedgeCoveragePct = 80.0; // 80% target
  const [currentHedgeCoveragePct, setCurrentHedgeCoveragePct] = useState<number>(80.0);
  const [riskScore, setRiskScore] = useState<number>(34);
  const [userInteractionsCount, setUserInteractionsCount] = useState<number>(0);

  // Dynamic price data for Recharts
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>(INITIAL_PRICE_POINTS);
  const [currentBtcPrice, setCurrentBtcPrice] = useState<number>(64800);
  const [currentEthPrice, setCurrentEthPrice] = useState<number>(3440);

  // Latencies (ms)
  const latencyMetrics = {
    eventDetectionMs: 12,
    riskEvaluationMs: 18,
    handlerDispatchMs: 41,
    validatorConfirmationMs: 62,
    totalLatencyMs: 133,
  };

  // Somnia Reactivity Stream
  const [reactivityLogs, setReactivityLogs] = useState<ReactivityEvent[]>([
    {
      id: "ev-1",
      timestamp: "14:52:10.124",
      eventType: "SOMNIA_BLOCK_FINALIZED",
      blockNumber: 1284920,
      source: "Somnia.sol",
      status: "CONFIRMED",
    },
    {
      id: "ev-2",
      timestamp: "14:53:01.481",
      eventType: "DREAMDEX_POOL_TICK_UPDATED",
      blockNumber: 1284921,
      source: "DreamDEXPool.sol",
      status: "EVALUATED",
    },
  ]);

  // Audit Ledger
  const [auditLedger, setAuditLedger] = useState<AuditRecord[]>([
    {
      id: "aud-1",
      time: "14:30:00",
      event: "PERIODIC_CHECK",
      action: "MAINTAIN_COVERAGE",
      contract: "0x31a8...91ac",
      riskScore: 28,
      txHash: "0x8a7f91c0284e912ab71c89012a4b89c72e411b932c0211598f39b1a7c41e89b",
      status: "CONFIRMED",
    },
    {
      id: "aud-2",
      time: "14:45:00",
      event: "SETTLEMENT_WINDOW_OPEN",
      action: "AUTO_ROLL",
      contract: "0x43a1...10aa",
      riskScore: 34,
      txHash: "0x7c41e89b21a3099c6e5412f109b8823194a2871c290119e87d4021bb819c410",
      status: "CONFIRMED",
    },
  ]);

  // Protection Ladder
  const [protectionLadder, setProtectionLadder] = useState<ProtectionLadderItem[]>([
    {
      id: "ladder-1",
      label: "HEDGE #001",
      notionalUSD: 20000,
      contract: "BTC-DOWN-15M-001",
      entryPrice: 0.32,
      expiryTime: "14:30 UTC",
      status: "EXPIRED",
      executionTime: "14:15:02 UTC",
    },
    {
      id: "ladder-2",
      label: "HEDGE #002",
      notionalUSD: 20000,
      contract: "BTC-DOWN-15M-002",
      entryPrice: 0.35,
      expiryTime: "14:45 UTC",
      status: "ROLLED",
      executionTime: "14:30:01 UTC",
    },
    {
      id: "ladder-3",
      label: "HEDGE #003",
      notionalUSD: 20000,
      contract: "BTC-DOWN-15M-003",
      entryPrice: 0.35,
      expiryTime: "15:00 UTC",
      status: "ACTIVE",
      executionTime: "14:45:01 UTC",
    },
    {
      id: "ladder-4",
      label: "HEDGE #004",
      notionalUSD: 20000,
      contract: "BTC-DOWN-15M-004",
      entryPrice: 0.34,
      expiryTime: "15:15 UTC",
      status: "QUEUED",
      executionTime: "PENDING AUTO-ROLL",
    },
  ]);

  // Derived Risk Math
  // Risk Delta Formula: ΔP - (Threshold % * Exposure)
  const priceDropPct = Number(((65200 - currentBtcPrice) / 65200 * 100).toFixed(2));
  const thresholdDollarLimit = (portfolioExposureUSD * downsideThresholdPct) / 100; // $2,000
  const actualDollarLoss = (portfolioExposureUSD * (priceDropPct / 100));
  const riskDeltaUSD = Number((actualDollarLoss - thresholdDollarLimit).toFixed(2));

  // EIP-7702 Delegation state metadata
  const delegationMeta = {
    type: "0x04 SET_CODE",
    accountEOA: "0x71C9f28a9b12c48d9012a4b89c72e411b9329A2B",
    delegatedHandler: "0x8F31a980bc712e411b932c0211598f39b1a4C1C",
    authNonce: 17,
    chainId: 50312,
    permissionModel: "KasuwaExecutor Whitelist Router",
    userSignatureState: "DELEGATED (1-Time Setup)",
    popupRequired: "0 Popups Required",
    autonomousExecution: "ENABLED",
  };

  // Demo Stress Test Trigger (5-8 Seconds Cascade)
  const triggerMarketStress = useCallback(() => {
    if (isSimulationRunning) return;
    setIsSimulationRunning(true);
    setSimulationProgress(0);

    const nowStr = () => new Date().toISOString().substring(11, 23);
    const blockNum = 1284925;

    // Timeline Step 1: Volatility Rising (0s - 1.8s)
    setSystemState("VOLATILITY_RISING");
    setSimulationProgress(15);
    setCurrentBtcPrice(63900); // Below threshold strike 64,000!
    setCurrentEthPrice(3380);
    setRiskScore(68);
    setCurrentHedgeCoveragePct(74.0);

    setPriceHistory((prev) => [
      ...prev,
      {
        timestamp: "14:54",
        btcPrice: 63900,
        ethPrice: 3380,
        thresholdPrice: 64000,
        hedgePrice: 65000,
        portfolioValue: 24200,
      },
    ]);

    setReactivityLogs((prev) => [
      {
        id: `ev-stress-1`,
        timestamp: nowStr(),
        eventType: "VOLATILITY_SPIKE_DETECTED",
        blockNumber: blockNum,
        source: "Somnia.sol",
        status: "RECEIVED",
        isDemo: true,
      },
      ...prev,
    ]);

    // Step 2: Threshold Breached & Risk Evaluation (1.8s - 3.8s)
    setTimeout(() => {
      setSystemState("THRESHOLD_BREACHED");
      setSimulationProgress(45);
      setRiskScore(98);
      setCurrentBtcPrice(62800);
      setCurrentEthPrice(3290);
      setCurrentHedgeCoveragePct(58.0);

      setPriceHistory((prev) => [
        ...prev,
        {
          timestamp: "14:55",
          btcPrice: 62800,
          ethPrice: 3290,
          thresholdPrice: 64000,
          hedgePrice: 65000,
          portfolioValue: 23600,
        },
      ]);

      setReactivityLogs((prev) => [
        {
          id: `ev-stress-2`,
          timestamp: nowStr(),
          eventType: "THRESHOLD_BREACH_ALERT",
          blockNumber: blockNum + 1,
          source: "KasuwaPolicy.sol",
          status: "EVALUATED",
          isDemo: true,
        },
        ...prev,
      ]);
    }, 1800);

    // Step 3: Autonomous Execution via EIP-7702 (3.8s - 5.8s)
    setTimeout(() => {
      setSystemState("EXECUTING");
      setSimulationProgress(75);

      setReactivityLogs((prev) => [
        {
          id: `ev-stress-3`,
          timestamp: nowStr(),
          eventType: "EIP7702_SESSION_KEY_DISPATCHED",
          blockNumber: blockNum + 2,
          source: "KasuwaExecutor.sol",
          status: "DISPATCHED",
          isDemo: true,
        },
        ...prev,
      ]);
    }, 3800);

    // Step 4: Protection Restored & Auto-Rolled (5.8s - 7.5s)
    setTimeout(() => {
      setSystemState("PROTECTED");
      setSimulationProgress(100);
      setCurrentHedgeCoveragePct(80.0); // Coverage restored!
      setRiskScore(32);

      const demoTx = "0x8a7f91c0284e912ab71c89012a4b89c72e411b932c0211598f39b1a7c41e89b";

      setReactivityLogs((prev) => [
        {
          id: `ev-stress-4`,
          timestamp: nowStr(),
          eventType: "EXECUTION_CONFIRMED",
          blockNumber: blockNum + 3,
          source: "DreamDEXPool.sol",
          status: "CONFIRMED",
          isDemo: true,
        },
        ...prev,
      ]);

      setAuditLedger((prev) => [
        {
          id: `aud-stress-${Date.now()}`,
          time: new Date().toISOString().substring(11, 19),
          event: "MARKET_STRESS_AUTO_ROLL",
          action: "REBALANCE_HEDGE",
          contract: "BTC-DOWN-15M-STRESS",
          riskScore: 98,
          txHash: demoTx,
          status: "CONFIRMED",
          isDemo: true,
        },
        ...prev,
      ]);

      setProtectionLadder((prev) => [
        {
          id: `ladder-stress-${Date.now()}`,
          label: "HEDGE #005",
          notionalUSD: 20000,
          contract: "BTC-DOWN-15M-STRESS",
          entryPrice: 0.38,
          expiryTime: "15:30 UTC",
          status: "ACTIVE",
          executionTime: `${nowStr()} UTC`,
        },
        ...prev.map((item) => item.status === "ACTIVE" ? { ...item, status: "ROLLED" as const } : item),
      ]);

      setIsSimulationRunning(false);
    }, 6000);
  }, [isSimulationRunning]);

  return {
    systemState,
    isSimulationRunning,
    simulationProgress,
    portfolioExposureUSD,
    downsideThresholdPct,
    protectedNotionalUSD,
    targetHedgeCoveragePct,
    currentHedgeCoveragePct,
    riskScore,
    userInteractionsCount,
    priceHistory,
    currentBtcPrice,
    currentEthPrice,
    latencyMetrics,
    reactivityLogs,
    auditLedger,
    protectionLadder,
    priceDropPct,
    riskDeltaUSD,
    delegationMeta,
    triggerMarketStress,
  };
}
