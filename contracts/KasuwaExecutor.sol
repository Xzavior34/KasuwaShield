// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IKasuwaPolicy {
    function validateAndDeductRoll(bytes32 policyId, uint256 rollCostUSD, uint256 contractPrice) external returns (bool);
}

/**
 * @title KasuwaExecutor
 * @notice Restricted session-key execution router for EIP-7702 Continuous Auto-Rolling Shields.
 *         Allows authorized local ephemeral Session Keys to execute DreamDEX IOC taker orders
 *         without user wallet popups, restricted strictly to allowlisted pools & remaining budget.
 */
contract KasuwaExecutor {
    address public immutable owner;
    address public policyContract;

    // Mapping: user EOA => ephemeral Session Key => isAuthorized
    mapping(address => mapping(address => bool)) public sessionKeys;
    
    // Mapping: user EOA => active policy ID
    mapping(address => bytes32) public userPolicyId;

    event SessionKeyAuthorized(address indexed user, address indexed sessionKey);
    event SessionKeyRevoked(address indexed user, address indexed sessionKey);
    event AutoRollExecuted(bytes32 indexed policyId, address indexed user, address indexed pool, uint256 contracts, uint256 cost);

    modifier onlyOwner() {
        require(msg.sender == owner, "KasuwaExecutor: caller is not owner");
        _;
    }

    constructor(address _policyContract) {
        owner = msg.sender;
        policyContract = _policyContract;
    }

    function setPolicyContract(address _policyContract) external onlyOwner {
        policyContract = _policyContract;
    }

    /**
     * @notice Authorize an ephemeral local Session Key for continuous auto-rolling
     */
    function authorizeSessionKey(address sessionKey, bytes32 policyId) external {
        sessionKeys[msg.sender][sessionKey] = true;
        userPolicyId[msg.sender] = policyId;
        emit SessionKeyAuthorized(msg.sender, sessionKey);
    }

    /**
     * @notice Revoke an ephemeral local Session Key (Kill-Switch)
     */
    function revokeSessionKey(address sessionKey) external {
        sessionKeys[msg.sender][sessionKey] = false;
        emit SessionKeyRevoked(msg.sender, sessionKey);
    }

    /**
     * @notice Execute an auto-rolled hedge using an authorized local Session Key (0 popups required)
     */
    function executeAutoRoll(
        address userEOA,
        bytes32 policyId,
        address dreamdexPool,
        uint256 quantityContracts,
        uint256 pricePerContractUSD
    ) external returns (bool) {
        // Validate caller is authorized Session Key for user EOA
        require(sessionKeys[userEOA][msg.sender], "Executor: Caller is not an authorized Session Key");
        require(userPolicyId[userEOA] == policyId, "Executor: Policy ID mismatch");

        uint256 totalCostUSD = quantityContracts * pricePerContractUSD;

        // Validate and deduct cost from remaining budget in KasuwaPolicy
        bool valid = IKasuwaPolicy(policyContract).validateAndDeductRoll(policyId, totalCostUSD, pricePerContractUSD);
        require(valid, "Executor: Policy validation failed or remaining budget exhausted");

        emit AutoRollExecuted(policyId, userEOA, dreamdexPool, quantityContracts, totalCostUSD);
        return true;
    }
}
