// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title KasuwaPolicy
 * @notice Non-custodial risk policy contract for KasuwaShield Continuous Auto-Rolling Shield.
 *         Enforces spending budget caps, price ceilings, maximum protection percentages,
 *         remaining budget tracking across window rolls, and policy termination.
 */
contract KasuwaPolicy {
    address public immutable owner;

    struct ContinuousPolicy {
        bytes32 policyId;
        address user;
        address sessionKey;
        uint256 exposureUSD;
        uint256 protectionPercent;
        uint256 totalBudgetUSD;
        uint256 remainingBudgetUSD;
        uint256 maxContractPrice;
        uint256 startTime;
        uint256 durationSeconds;
        uint256 rollsExecuted;
        bool isActive;
    }

    mapping(bytes32 => ContinuousPolicy) public policies;
    mapping(address => bytes32) public userActivePolicy;

    event PolicyCreated(bytes32 indexed policyId, address indexed user, address indexed sessionKey, uint256 budgetUSD, uint256 duration);
    event PolicyRolled(bytes32 indexed policyId, uint256 rollNumber, uint256 costUSD, uint256 remainingBudgetUSD);
    event PolicyTerminated(bytes32 indexed policyId, string reason);

    modifier onlyOwner() {
        require(msg.sender == owner, "KasuwaPolicy: caller is not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createPolicy(
        bytes32 policyId,
        address sessionKey,
        uint256 exposureUSD,
        uint256 protectionPercent,
        uint256 totalBudgetUSD,
        uint256 maxContractPrice,
        uint256 durationSeconds
    ) external returns (bytes32) {
        require(protectionPercent <= 50, "Protection exceeds 50% max cap");
        require(totalBudgetUSD > 0, "Budget must be greater than zero");

        policies[policyId] = ContinuousPolicy({
            policyId: policyId,
            user: msg.sender,
            sessionKey: sessionKey,
            exposureUSD: exposureUSD,
            protectionPercent: protectionPercent,
            totalBudgetUSD: totalBudgetUSD,
            remainingBudgetUSD: totalBudgetUSD,
            maxContractPrice: maxContractPrice,
            startTime: block.timestamp,
            durationSeconds: durationSeconds,
            rollsExecuted: 0,
            isActive: true
        });

        userActivePolicy[msg.sender] = policyId;

        emit PolicyCreated(policyId, msg.sender, sessionKey, totalBudgetUSD, durationSeconds);
        return policyId;
    }

    function validateAndDeductRoll(
        bytes32 policyId,
        uint256 rollCostUSD,
        uint256 contractPrice
    ) external returns (bool valid) {
        ContinuousPolicy storage p = policies[policyId];

        if (!p.isActive) {
            emit PolicyTerminated(policyId, "Policy inactive");
            return false;
        }

        if (block.timestamp >= p.startTime + p.durationSeconds) {
            p.isActive = false;
            emit PolicyTerminated(policyId, "Policy duration expired");
            return false;
        }

        if (contractPrice > p.maxContractPrice) {
            emit PolicyTerminated(policyId, "Contract price exceeds policy cap");
            return false;
        }

        if (rollCostUSD > p.remainingBudgetUSD) {
            p.isActive = false;
            emit PolicyTerminated(policyId, "Remaining budget exhausted");
            return false;
        }

        // Deduct roll cost from remaining budget
        p.remainingBudgetUSD -= rollCostUSD;
        p.rollsExecuted += 1;

        emit PolicyRolled(policyId, p.rollsExecuted, rollCostUSD, p.remainingBudgetUSD);
        return true;
    }

    function revokePolicy(bytes32 policyId) external {
        ContinuousPolicy storage p = policies[policyId];
        require(p.user == msg.sender || msg.sender == owner, "Unauthorized policy revocation");
        p.isActive = false;
        emit PolicyTerminated(policyId, "Revoked by user kill-switch");
    }
}
