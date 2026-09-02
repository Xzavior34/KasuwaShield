# DEVELOPER FEEDBACK REPORT

**Developer Experience Report**: Somnia Network & DreamDEX Event Contracts SDK Integration  
**Project**: KasuwaShield  
**Tested Version**: `@somnia-chain/markets-sdk v0.22.0`  
**Network**: Somnia Shannon Testnet (Chain ID 50312)  

---

## 1. Positives & Highlights

- **SDK Interface Cleanliness**: The `@somnia-chain/markets-sdk` library provides convenient helpers like `probabilityToPrice` and `getMarketOnchain` that simplify probability calculations.
- **On-Chain Log Accessibility**: Discovering markets by querying `MarketCreated` logs directly from the chain works reliably even when public indexers experience rate limits.
- **Somnia Reactivity**: Somnia's native event subscription architecture makes off-chain and on-chain reactive workflows fast and reliable.

---

## 2. Developer Friction & Discoveries

- **SDK Floating Point Precision**: Float price inputs on 18-decimal venues can cause rounding inaccuracies (`0.050000000000000003`). Using fixed integer tick units avoids `InvalidPrice` pool reverts.
- **On-Chain Status vs Indexer Lag**: The indexer can lag chain state by a few seconds. We found it essential to verify `getMarketOnchain(marketId).status === 1` (`Trading`) directly against the chain before placing orders.
- **Manual Redemption Requirement**: Settled positions do not automatically decay into collateral; explicit `redeem` calls are required to sweep winnings. Automating this via Somnia Reactivity substantially improves UX.

---

## 3. Recommendations for DreamDEX & Somnia Teams

1. **Re-export Event ABIs**: Exporting `marketCreatorEventsAbi` directly from the main `@somnia-chain/markets-sdk` package entrypoint would avoid needing deep imports.
2. **Built-in Order Status Helper**: Adding a simple `isMarketTrading(marketId)` helper method to `SomniaMarkets` would streamline pre-trade checks.
