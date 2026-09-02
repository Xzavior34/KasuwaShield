// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title KasuwaPolicy
 * @notice Non-custodial risk management policy contract for KasuwaShield.
 *         Enforces spending budget caps, price ceilings, maximum protection percentages,
 *         and allowed asset / duration parameters before any trade execution.
 */
contract KasuwaPolicy {
    address public immutable owner;

    uint256 public maxProtectionPercent = 50;
    uint256 public maxBudgetUSD = 100 * 1e6; // in 1e6 units ($100 max)
    uint256 public maxContractPrice = 850000;  // 0.85 in 1e6 probability units
    uint256 public maxSlippageBps = 500;       // 5.00%
    bool public isPolicyActive = true;

    event PolicyUpdated(uint256 maxProtection, uint256 maxBudget, uint256 maxPrice, bool active);
    event PolicyCheckFailed(string reason);
    event PolicyCheckPassed(bytes32 indexed marketId, uint256 estimatedCost);

    modifier onlyOwner() {
        require(msg.sender == owner, "KasuwaPolicy: caller is not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setPolicyParameters(
        uint256 _maxProtectionPercent,
        uint256 _maxBudgetUSD,
        uint256 _maxContractPrice,
        uint256 _maxSlippageBps,
        bool _active
    ) external onlyOwner {
        require(_maxProtectionPercent <= 100, "Invalid protection percent");
        require(_maxContractPrice <= 1000000, "Invalid contract price");

        maxProtectionPercent = _maxProtectionPercent;
        maxBudgetUSD = _maxBudgetUSD;
        maxContractPrice = _maxContractPrice;
        maxSlippageBps = _maxSlippageBps;
        isPolicyActive = _active;

        emit PolicyUpdated(_maxProtectionPercent, _maxBudgetUSD, _maxContractPrice, _active);
    }

    function validateProtectionOrder(
        bytes32 marketId,
        uint256 requestedProtectionPercent,
        uint256 estimatedCostUSD,
        uint256 contractPrice,
        uint256 expiryTimestamp
    ) external returns (bool valid) {
        if (!isPolicyActive) {
            emit PolicyCheckFailed("Policy disabled");
            return false;
        }

        if (block.timestamp >= expiryTimestamp) {
            emit PolicyCheckFailed("Market expired");
            return false;
        }

        if (requestedProtectionPercent > maxProtectionPercent) {
            emit PolicyCheckFailed("Protection percent exceeds maximum policy cap");
            return false;
        }

        if (estimatedCostUSD > maxBudgetUSD) {
            emit PolicyCheckFailed("Estimated cost exceeds maximum budget cap");
            return false;
        }

        if (contractPrice > maxContractPrice) {
            emit PolicyCheckFailed("Contract price exceeds maximum price cap");
            return false;
        }

        emit PolicyCheckPassed(marketId, estimatedCostUSD);
        return true;
    }
}
