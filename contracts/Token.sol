// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FaucetToken
 * @dev ERC-20 token with fixed max supply.
 * Only the faucet contract (set once) can mint tokens.
 */
contract FaucetToken is ERC20, Ownable {
    uint256 public immutable maxSupply;
    address public faucet;

    error FaucetAlreadySet();
    error NotFaucet();
    error MaxSupplyExceeded();

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply_
    ) ERC20(name_, symbol_) Ownable(msg.sender) {
        maxSupply = maxSupply_;
    }

    /**
     * @dev Set faucet address (one-time only).
     * The faucet will be the only address allowed to mint tokens.
     */
    function setFaucet(address faucet_) external onlyOwner {
        if (faucet != address(0)) revert FaucetAlreadySet();
        faucet = faucet_;
    }

    /**
     * @dev Mint tokens to user.
     * Can only be called by the faucet contract.
     */
    function mint(address to, uint256 amount) external {
        if (msg.sender != faucet) revert NotFaucet();
        if (totalSupply() + amount > maxSupply) revert MaxSupplyExceeded();
        _mint(to, amount);
    }
}

