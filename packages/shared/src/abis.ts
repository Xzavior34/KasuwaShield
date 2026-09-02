export const IBinaryPoolAbi = [
  {
    type: "function",
    name: "placeBinaryOrder",
    inputs: [
      { name: "kind", type: "uint8" },
      { name: "price", type: "uint256" },
      { name: "quantity", type: "uint256" },
      { name: "expireTimestampNs", type: "uint64" },
      { name: "orderType", type: "uint8" },
      { name: "selfMatchingOption", type: "uint8" },
      { name: "builder", type: "address" },
      { name: "builderFeeBpsTimes1k", type: "uint96" },
      { name: "userData", type: "uint64" }
    ],
    outputs: [
      { name: "success", type: "bool" },
      { name: "orderId", type: "uint128" }
    ],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "cancelOrder",
    inputs: [{ name: "orderId", type: "uint128" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "getBookLevels",
    inputs: [
      { name: "isBid", type: "bool" },
      { name: "numLevels", type: "uint64" }
    ],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { name: "price", type: "uint256" },
          { name: "quantity", type: "uint256" }
        ]
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getBinaryPoolParams",
    inputs: [],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "collateralToken", type: "address" },
          { name: "market", type: "address" },
          { name: "outcomeToken", type: "address" },
          { name: "yesId", type: "uint256" },
          { name: "noId", type: "uint256" },
          { name: "oneCollateral", type: "uint256" },
          { name: "setBacking", type: "uint256" },
          { name: "feeRecipient", type: "address" },
          { name: "makerFeeBpsTimes1k", type: "uint256" },
          { name: "takerFeeBpsTimes1k", type: "uint256" },
          { name: "maxBuilderFeeBpsTimes1k", type: "uint256" },
          { name: "settlementFeeBpsTimes1k", type: "uint256" },
          { name: "settlement", type: "address" },
          { name: "marketNonce", type: "uint64" },
          { name: "finalized", type: "bool" }
        ]
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "marketExpiryNs",
    inputs: [],
    outputs: [{ name: "", type: "uint64" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "finalized",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view"
  }
] as const;

export const IBinaryMarketAbi = [
  {
    type: "function",
    name: "isResolved",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "isVoided",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "payoutNumerators",
    inputs: [],
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view"
  }
] as const;

export const IBinaryMarketsModuleAbi = [
  {
    type: "function",
    name: "redeem",
    inputs: [
      { name: "operatorId", type: "uint32" },
      { name: "venueId", type: "bytes32" },
      { name: "marketId", type: "bytes32" },
      { name: "outcomeIdx", type: "uint8" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  }
] as const;

export const MarketCreatedEventAbi = {
  anonymous: false,
  inputs: [
    { indexed: true, name: "marketId", type: "bytes32" },
    { indexed: false, name: "asset", type: "string" },
    { indexed: false, name: "pool", type: "address" },
    { indexed: false, name: "collateral", type: "address" },
    { indexed: false, name: "expiry", type: "uint256" },
    { indexed: false, name: "intervalSec", type: "uint256" }
  ],
  name: "MarketCreated",
  type: "event"
} as const;
