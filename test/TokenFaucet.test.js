const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenFaucet", function () {
  let token, faucet;
  let owner, user;

  const CLAIM_AMOUNT = ethers.parseEther("100");
  const MAX_SUPPLY = ethers.parseEther("1000000");
  const MAX_LIFETIME = ethers.parseEther("300");

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("FaucetToken");
    token = await Token.deploy("Faucet Token", "FAU", MAX_SUPPLY);
    await token.waitForDeployment();

    const Faucet = await ethers.getContractFactory("TokenFaucet");
    faucet = await Faucet.deploy(await token.getAddress(), MAX_LIFETIME);
    await faucet.waitForDeployment();

    await token.setFaucet(await faucet.getAddress());
  });

  it("allows first claim", async function () {
    await expect(faucet.connect(user).requestTokens())
      .to.emit(faucet, "TokensClaimed")
      .withArgs(user.address, CLAIM_AMOUNT, anyValue);
  });

  it("prevents claim during cooldown", async function () {
    await faucet.connect(user).requestTokens();

    await expect(
      faucet.connect(user).requestTokens()
    ).to.be.reverted;
  });

  it("allows claim after cooldown", async function () {
    await faucet.connect(user).requestTokens();

    await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    await expect(faucet.connect(user).requestTokens())
      .to.emit(faucet, "TokensClaimed");
  });

  it("enforces lifetime claim limit", async function () {
    await faucet.connect(user).requestTokens();
    await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    await faucet.connect(user).requestTokens();
    await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    await faucet.connect(user).requestTokens();

    await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    await expect(
      faucet.connect(user).requestTokens()
    ).to.be.revertedWithCustomError(faucet, "LifetimeLimitReached");
  });

  it("respects pause/unpause", async function () {
    await faucet.setPaused(true);

    await expect(
      faucet.connect(user).requestTokens()
    ).to.be.revertedWithCustomError(faucet, "FaucetIsPaused");

    await faucet.setPaused(false);
    await expect(faucet.connect(user).requestTokens()).to.not.be.reverted;
  });

  it("updates lastClaimAt and totalClaimed", async function () {
    await faucet.connect(user).requestTokens();

    const last = await faucet.lastClaimAt(user.address);
    const total = await faucet.totalClaimed(user.address);

    expect(last).to.be.gt(0);
    expect(total).to.equal(CLAIM_AMOUNT);
  });
});

