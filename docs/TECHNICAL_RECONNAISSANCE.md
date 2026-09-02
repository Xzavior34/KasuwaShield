# TECHNICAL RECONNAISSANCE: DreamDEX & Somnia Protocol Integration

**Project**: KasuwaShield — Programmable Downside Protection  
**Hackathon**: Somnia × DreamDEX Event Contracts Hackathon 2026  
**Last Updated**: September 2, 2026  

---

## 1. Network & Chain Environment

- **Primary Network**: Somnia Shannon Testnet
- **Chain ID**: `50312` (`0xc488`)
- **RPC Endpoint**: `https://dream-rpc.somnia.network`
- **WebSocket RPC**: `wss://api.infra.testnet.somnia.network/ws`
- **Block Explorer**: `https://shannon-explorer.somnia.network/`
- **Native Currency**: `STT` (Somnia Testnet Token)
- **Collateral Token**: `tUSDC` (Address: `SOMNIA_TESTNET_ADDRESSES.testUsdc`)
- **Collateral Decimals**: 6 decimals (`1_000_000` base units = 1 whole contract/collateral unit)

---

## 2. DreamDEX Event Contract Architecture

DreamDEX Event Contracts represent binary outcome markets (Up / Down) settling over fixed time windows (e.g. 5m, 15m, 1h).

### Key Entities & Contracts
1. **Market Creator / Registry**: Emits `MarketCreated` logs when a new window market is launched.
2. **Binary Pool (`IBinaryPool`)**: The central limit order book (CLOB) where orders are placed, matched, and cancelled.
3. **Binary Market (`IBinaryMarket`)**: The per-window market contract storing outcome status (`isResolved`, `isVoided`, `payoutNumerators`).
4. **Outcome Token (`IOutcomeToken6909`)**: An ERC-6909 singleton holding all market outcome tokens (Yes/Up ID, No/Down ID).
5. **Markets Module (`IBinaryMarketsModule`)**: The registry contract where settled positions are redeemed for collateral.

### Key Operational Rules (From Official Bot Kit & Protocol Specs)
- **Market Identity**: Markets MUST be identified by `marketId` or `symbol`, NOT by pool address (pool addresses are recycled across windows).
- **On-Chain Status**: Applications MUST gate order execution on `getMarketOnchain(marketId).status === 1` (`Trading`) and `finalized === false`. Indexers lag by seconds; chain state is authoritative.
- **Order Placement**:
  - `kind`: `0=BUY_YES`, `1=SELL_YES`, `2=BUY_NO`, `3=SELL_NO`
  - `price`: Probability in 1e6 units (`500_000` = $0.50 probability)
  - `quantity`: Amount in 1e6 base units (`1_000_000` = 1 contract)
  - `orderType`: `1 = FOK`, `2 = IOC` (Taker), `3 = PostOnly` (Maker)
  - `expireTimestampNs`: Expiry in nanoseconds (MUST be `0 < expireTimestampNs <= marketExpiryNs`).
- **Winnings Claiming**: Settled positions do NOT automatically decay into collateral. Winning outcome tokens MUST be redeemed explicitly via `redeem({ marketId, outcomeIdx, amount })`.

---

## 3. Somnia Reactivity Architecture

Somnia provides native reactivity allowing contracts and clients to respond to on-chain events:
- **On-Chain Reactivity**: Contracts inherit `SomniaEventHandler` from `@somnia-chain/reactivity-contracts` and implement `_onEvent(...)` to process verified events.
- **Off-Chain Reactivity**: Persistent WebSocket client via `@somnia-chain/reactivity` watching `MarketCreated` and settlement resolution events in real-time.

---

## 4. EIP-7702 & Session Key Capabilities

- **EIP-7702 Batching**: Allows batching approval, order placement, and position tracking in a single user authorization call.
- **Restricted Operator Model**: Delegate specific order execution rights to a temporary, non-custodial session key without granting withdrawal or arbitrary transfer permissions.

---

## 5. Verified Source References
- DreamDEX Developer Docs: `https://docs.dreamdex.io/developers/event-contracts`
- Somnia Developer Docs: `https://docs.somnia.network/`
- DreamDEX Bot Kit: `https://github.com/somnia-chain/dreamdex-bot-kit`
- Hackathon Starter Template: `https://github.com/IronicDeGawd/ec-dreamdex-hackathon-template`
