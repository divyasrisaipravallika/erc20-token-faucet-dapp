const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // ---- CONFIG VALUES ----
  const TOKEN_NAME = "Faucet Token";
  const TOKEN_SYMBOL = "FAU";
  const MAX_SUPPLY = hre.ethers.parseEther("1000000"); // 1,000,000 tokens
  const MAX_LIFETIME_CLAIM = hre.ethers.parseEther("1000"); // per user lifetime

  // ---- DEPLOY TOKEN ----
  const Token = await hre.ethers.getContractFactory("FaucetToken");
  const token = await Token.deploy(
    TOKEN_NAME,
    TOKEN_SYMBOL,
    MAX_SUPPLY
  );

  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  console.log("Token deployed to:", tokenAddress);

  // ---- DEPLOY FAUCET ----
  const Faucet = await hre.ethers.getContractFactory("TokenFaucet");
  const faucet = await Faucet.deploy(
    tokenAddress,
    MAX_LIFETIME_CLAIM
  );

  await faucet.waitForDeployment();
  const faucetAddress = await faucet.getAddress();

  console.log("Faucet deployed to:", faucetAddress);

  // ---- LINK FAUCET TO TOKEN ----
  const tx = await token.setFaucet(faucetAddress);
  await tx.wait();

  console.log("Faucet set as token minter");

  console.log("\nDeployment complete:");
  console.log({
    token: tokenAddress,
    faucet: faucetAddress,
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

