// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title KasuwaReactiveHandler
 * @notice Somnia Reactive contract for KasuwaShield.
 *         Subscribes to DreamDEX settlement events to update active downside protection position state
 *         and mark settled winning contracts as ready for non-custodial redemption.
 */
contract KasuwaReactiveHandler {
    address public immutable owner;

    enum SettlementState { UNSETTLED, SETTLED_WIN, SETTLED_LOSS, VOIDED }

    struct PositionSettlement {
        bytes32 marketId;
        address user;
        SettlementState state;
        uint8 winningOutcome; // 0 = Up, 1 = Down
        uint256 settledAt;
        bool isClaimed;
    }

    mapping(bytes32 => PositionSettlement) public positionSettlements;
    mapping(address => bool) public authorizedEmitters;

    event ReactiveSettlementProcessed(bytes32 indexed marketId, address indexed user, uint8 winningOutcome, SettlementState state);
    event PositionClaimed(bytes32 indexed marketId, address indexed user, uint256 claimedAmount);

    modifier onlyOwner() {
        require(msg.sender == owner, "KasuwaReactiveHandler: not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setAuthorizedEmitter(address emitter, bool status) external onlyOwner {
        authorizedEmitters[emitter] = status;
    }

    /**
     * @notice Callback invoked when DreamDEX market resolution event fires.
     * @param marketId The unique binary market ID
     * @param user The position holder address
     * @param winningOutcome 0 for Up, 1 for Down
     * @param isVoided True if the market settled voided
     */
    function _onMarketSettledEvent(
        bytes32 marketId,
        address user,
        uint8 winningOutcome,
        bool isVoided
    ) external {
        require(authorizedEmitters[msg.sender] || msg.sender == owner, "KasuwaReactiveHandler: Unauthorized emitter");

        SettlementState state = SettlementState.SETTLED_LOSS;
        if (isVoided) {
            state = SettlementState.VOIDED;
        } else if (winningOutcome == 1) { // 1 = Down (Protection side won!)
            state = SettlementState.SETTLED_WIN;
        }

        positionSettlements[marketId] = PositionSettlement({
            marketId: marketId,
            user: user,
            state: state,
            winningOutcome: winningOutcome,
            settledAt: block.timestamp,
            isClaimed: false
        });

        emit ReactiveSettlementProcessed(marketId, user, winningOutcome, state);
    }

    function markPositionClaimed(bytes32 marketId, uint256 claimedAmount) external {
        PositionSettlement storage ps = positionSettlements[marketId];
        require(ps.user == msg.sender || msg.sender == owner, "Unauthorized claim update");
        require(!ps.isClaimed, "Position already marked claimed");

        ps.isClaimed = true;
        emit PositionClaimed(marketId, msg.sender, claimedAmount);
    }
}
