// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./KasuwaPolicy.sol";

interface IBinaryPool {
    function placeBinaryOrder(
        uint8 kind,
        uint256 price,
        uint256 quantity,
        uint64 expireTimestampNs,
        uint8 orderType,
        uint8 selfMatchingOption,
        address builder,
        uint96 builderFeeBpsTimes1k,
        uint64 userData
    ) external returns (bool success, uint128 orderId);
}

/**
 * @title KasuwaExecutor
 * @notice Execution contract for KasuwaShield supporting session key / operator rights.
 *         Ensures non-custodial protection execution strictly adhering to user KasuwaPolicy.
 */
contract KasuwaExecutor {
    address public immutable owner;
    KasuwaPolicy public policyContract;
    mapping(address => bool) public authorizedOperators;

    event OperatorSet(address indexed operator, bool approved);
    event ProtectionExecuted(bytes32 indexed marketId, address pool, uint256 quantity, uint128 orderId);

    modifier onlyOwner() {
        require(msg.sender == owner, "KasuwaExecutor: not owner");
        _;
    }

    modifier onlyAuthorized() {
        require(msg.sender == owner || authorizedOperators[msg.sender], "KasuwaExecutor: unauthorized operator");
        _;
    }

    constructor(address _policyAddress) {
        owner = msg.sender;
        policyContract = KasuwaPolicy(_policyAddress);
    }

    function setOperator(address operator, bool approved) external onlyOwner {
        authorizedOperators[operator] = approved;
        emit OperatorSet(operator, approved);
    }

    function executeProtection(
        address poolAddress,
        bytes32 marketId,
        uint8 kind,
        uint256 price,
        uint256 quantity,
        uint64 expireTimestampNs,
        uint256 protectionPercent,
        uint256 estimatedCostUSD,
        uint256 expiryTimestamp
    ) external onlyAuthorized returns (bool success, uint128 orderId) {
        // Validate Policy before execution
        bool policyValid = policyContract.validateProtectionOrder(
            marketId,
            protectionPercent,
            estimatedCostUSD,
            price,
            expiryTimestamp
        );
        require(policyValid, "KasuwaExecutor: Policy validation failed");

        // Route order to DreamDEX Binary Pool CLOB
        (success, orderId) = IBinaryPool(poolAddress).placeBinaryOrder(
            kind,               // 2 = BUY_NO (Downside Protection)
            price,              // probability in 1e6
            quantity,           // size in 1e6
            expireTimestampNs,  // expiry in ns
            2,                  // orderType: 2 = IOC
            0,                  // selfMatchingOption
            address(0),         // builder
            0,                  // builderFeeBpsTimes1k
            0                   // userData
        );

        emit ProtectionExecuted(marketId, poolAddress, quantity, orderId);
    }
}
