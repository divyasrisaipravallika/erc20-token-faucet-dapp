// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./Token.sol";

/**
 * @title TokenFaucet
 * @dev ERC20 token faucet with cooldown, lifetime limits, and pause control
 */
contract TokenFaucet is Ownable, ReentrancyGuard {
    FaucetToken public immutable token;

    uint256 public constant CLAIM_AMOUNT = 100 * 10 ** 18;
    uint256 public constant COOLDOWN = 24 hours;
    uint256 public immutable MAX_LIFETIME_CLAIM;

    bool private paused;

    mapping(address => uint256) public lastClaimAt;
    mapping(address => uint256) public totalClaimed;

    event TokensClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event FaucetPaused(bool paused);

    error FaucetIsPaused();
    error CooldownActive(uint256 nextClaimTime);
    error LifetimeLimitReached();
    error InsufficientFaucetBalance();

    constructor(
        address tokenAddress,
        uint256 maxLifetimeClaim
    ) Ownable(msg.sender) {
        token = FaucetToken(tokenAddress);
        MAX_LIFETIME_CLAIM = maxLifetimeClaim;
    }

    /**
     * @notice Request faucet tokens
     */
    function requestTokens() external nonReentrant {
        if (paused) revert FaucetIsPaused();

        if (!canClaim(msg.sender)) {
            revert CooldownActive(lastClaimAt[msg.sender] + COOLDOWN);
        }

        if (totalClaimed[msg.sender] + CLAIM_AMOUNT > MAX_LIFETIME_CLAIM) {
            revert LifetimeLimitReached();
        }

        if (token.totalSupply() + CLAIM_AMOUNT > token.maxSupply()) {
            revert InsufficientFaucetBalance();
        }

        lastClaimAt[msg.sender] = block.timestamp;
        totalClaimed[msg.sender] += CLAIM_AMOUNT;

        token.mint(msg.sender, CLAIM_AMOUNT);

        emit TokensClaimed(msg.sender, CLAIM_AMOUNT, block.timestamp);
    }

    /**
     * @notice Check if user can currently claim
     */
    function canClaim(address user) public view returns (bool) {
        return block.timestamp >= lastClaimAt[user] + COOLDOWN;
    }

    /**
     * @notice Remaining lifetime allowance for user
     */
    function remainingAllowance(address user) external view returns (uint256) {
        if (totalClaimed[user] >= MAX_LIFETIME_CLAIM) {
            return 0;
        }
        return MAX_LIFETIME_CLAIM - totalClaimed[user];
    }

    /**
     * @notice Pause or unpause faucet (admin only)
     */
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit FaucetPaused(_paused);
    }

    /**
     * @notice Current pause status
     */
    function isPaused() external view returns (bool) {
        return paused;
    }
}
