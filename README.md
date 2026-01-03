# ERC-20 Token Faucet DApp

A full-stack decentralized application (DApp) demonstrating end-to-end
Web3 development by implementing an ERC-20 token faucet with enforced
rate limits, lifetime claim limits, wallet integration, and Dockerized
deployment.

------------------------------------------------------------------------

## 🚀 Features

-   ERC-20 token with fixed maximum supply
-   Faucet with:
    -   Fixed claim amount
    -   24-hour cooldown per address
    -   Lifetime maximum claim limit
    -   On-chain enforcement (no backend trust)
    -   Pause / unpause (admin only)
-   MetaMask (EIP-1193) wallet integration
-   Real-time balance and claim status
-   Mandatory `window.__EVAL__` interface for automated evaluation
-   Fully Dockerized frontend with `/health` endpoint
-   Sepolia testnet deployment & Etherscan verification

------------------------------------------------------------------------

## 🛠 Tech Stack

-   Smart Contracts: Solidity, OpenZeppelin
-   Framework: Hardhat (v2)
-   Frontend: React, Vite, ethers.js (v6)
-   Network: Sepolia Testnet
-   Containerization: Docker, Docker Compose

------------------------------------------------------------------------

## 📂 Project Structure

contracts/ - Token.sol - TokenFaucet.sol

scripts/ - deploy.js

test/ - TokenFaucet.test.js

frontend/ - Dockerfile - package.json - src/ - App.jsx - main.jsx -
utils/contracts.js

docker-compose.yml\
hardhat.config.js\
.env.example\
README.md

------------------------------------------------------------------------

## 🔐 Environment Variables

Create a `.env` file based on `.env.example`:

SEPOLIA_RPC_URL=YOUR_SEPOLIA_RPC_URL\
PRIVATE_KEY=YOUR_WALLET_PRIVATE_KEY\
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY

VITE_TOKEN_ADDRESS=DEPLOYED_TOKEN_ADDRESS\
VITE_FAUCET_ADDRESS=DEPLOYED_FAUCET_ADDRESS

------------------------------------------------------------------------

## 🧪 Run Locally (Docker)

docker compose up

-   App: http://localhost:3000
-   Health check: http://localhost:3000/health

------------------------------------------------------------------------

## 🔗 Smart Contract Deployment (Sepolia)

npm install\
npx hardhat run scripts/deploy.js --network sepolia

------------------------------------------------------------------------

## 🔍 Contract Verification

npx hardhat verify --network sepolia TOKEN_ADDRESS "Faucet Token" "FAU"
MAX_SUPPLY\
npx hardhat verify --network sepolia FAUCET_ADDRESS TOKEN_ADDRESS
MAX_LIFETIME_CLAIM

------------------------------------------------------------------------

## 📡 Evaluation Interface

window.\_\_EVAL\_\_ exposes:

-   connectWallet()
-   requestTokens()
-   getBalance(address)
-   canClaim(address)
-   getRemainingAllowance(address)
-   getContractAddresses()

All numeric values are returned as strings.

------------------------------------------------------------------------

## 🧾 License

MIT
