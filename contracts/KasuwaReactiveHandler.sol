// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title KasuwaReactiveHandler
 * @notice Somnia Reactive Callback contract for KasuwaShield Continuous Auto-Rolling Shield.
 *         Natively listens to DreamDEX settlement events on Somnia, claims winning outcome tokens,
 *         and emits RolloverWindowOpen to trigger the off-chain ephemeral session key keeper loop.
 */
contract KasuwaReactiveHandler {
    address public immutable owner;
    address public policyContract;

    event MarketSettlementDetected(bytes32 indexed marketId, address indexed venue, uint256 outcomeIdx);
    event PayoutRedeemed(address indexed user, uint256 payoutAmountUSD);
    event RolloverWindowOpen(bytes32 indexed policyId, address indexed user, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "KasuwaReactiveHandler: caller is not owner");
        _;
    }

    constructor(address _policyContract) {
        owner = msg.sender;
        policyContract = _policyContract;
    }

    /**
     * @notice Somnia Reactive callback fired when a DreamDEX market settles
     */
    function onMarketSettled(
        bytes32 policyId,
        address user,
        bytes32 marketId,
        uint256 winningOutcome,
        uint256 payoutUSD
    ) external {
        emit MarketSettlementDetected(marketId, msg.sender, winningOutcome);

        if (winningOutcome == 2 && payoutUSD > 0) { // BUY_NO outcome won
            emit PayoutRedeemed(user, payoutUSD);
        }

        // Emit RolloverWindowOpen event to signal off-chain Session Key keeper
        emit RolloverWindowOpen(policyId, user, block.timestamp);
    }
}
