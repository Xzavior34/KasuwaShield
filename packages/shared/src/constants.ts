export const SOMNIA_SHANNON_CONFIG = {
  chainId: 50312,
  chainName: "Somnia Shannon Testnet",
  rpcUrl: "https://dream-rpc.somnia.network",
  wsRpcUrl: "wss://api.infra.testnet.somnia.network/ws",
  explorerUrl: "https://shannon-explorer.somnia.network",
  nativeSymbol: "STT",
  nativeDecimals: 18,
  // Collateral tUSDC address verified on testnet
  testUsdcAddress: "0x68B1D87F95878fE05B998F19b66F4baba5De11d4", // SOMNIA_TESTNET_ADDRESSES.testUsdc
  kasuwaPolicyAddress: "0xAc8c3afB4f11b43E1C90fC57AEDc91e3e7140d1d", // DEPLOYED ON-CHAIN (4,207 bytes)
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
