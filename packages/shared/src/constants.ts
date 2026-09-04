export const SOMNIA_SHANNON_CONFIG = {
  chainId: 50312,
  chainName: "Somnia Shannon Testnet",
  rpcUrl: "https://dream-rpc.somnia.network",
  wsRpcUrl: "wss://api.infra.testnet.somnia.network/ws",
  explorerUrl: "https://shannon-explorer.somnia.network",
  nativeSymbol: "STT",
  nativeDecimals: 18,
  // Collateral tUSDC address verified on testnet
  testUsdcAddress: "0x9c32F3827A1a99f0cf9B213de8b53eC3d57bb171", // USDso — canonical per DreamDEX bot-kit token registry (corrected from a stale/wrong address)
  kasuwaPolicyAddress: "0xbd2a26c3893db93ef86e0ceaaec080df8f9c550a", // DEPLOYED ON-CHAIN v2 (4,400+ bytes)
  kasuwaExecutorAddress: "0x80AcBF398663079edBfF26132C9AC04204B7c69c", // DEPLOYED ON-CHAIN (3,505 bytes)
  venueId: "0x679795a0195a1b76cdebb7c51d74e058aee92919b8c3389af86ef24535e8a28c",
  oneContractUnit: 1_000_000n, // 1e6 units
};

export const DEFAULT_RISK_POLICY = {
  maxProtectionPercent: 50,
  maxBudgetUSD: 50.0,
  maxContractPrice: 0.85,
  maxSlippagePercent: 5.0,
  allowedAssets: ["BTC", "ETH"],
  allowedWindowsMinutes: [5, 15, 60],
  enabled: true,
};
