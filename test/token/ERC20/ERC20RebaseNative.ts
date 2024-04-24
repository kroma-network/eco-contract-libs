import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ZeroAddress } from "ethers";
import hre, { ethers } from "hardhat";

describe("ERC20 Rebase Native", function () {
  const name = "Rebase Native Token";
  const symbol = "M ERC20";
  const decimals = 18;

  const amount = hre.ethers.parseEther("100");

  async function ERC20_Rebase_Native_Fixture() {
    const [owner, ...users] = await hre.ethers.getSigners();

    const ERC20 = await hre.ethers.getContractFactory("EcoERC20RebasedWithNative");
    const erc20Rebased = await ERC20.deploy();
    await erc20Rebased.initEcoERC20Rebase(ZeroAddress, name, symbol, decimals);

    return { erc20Rebased, owner, users };
  }

  describe("Deployment", function () {
    it("Should set the right init", async function () {
      const { erc20Rebased } = await loadFixture(ERC20_Rebase_Native_Fixture);

      expect(await erc20Rebased.underlying()).to.equal(ZeroAddress);
      await expect(erc20Rebased.initEcoERC20Rebase(ZeroAddress, name, symbol, decimals)).reverted;
    });

    it("Should set the right metadata", async function () {
      const { erc20Rebased } = await loadFixture(ERC20_Rebase_Native_Fixture);

      expect(await erc20Rebased.name()).to.equal(name);
      expect(await erc20Rebased.symbol()).to.equal(symbol);
      expect(await erc20Rebased.decimals()).to.equal(decimals);
    });

    it("basic view", async function () {
      const { owner, erc20Rebased } = await loadFixture(ERC20_Rebase_Native_Fixture);

      expect(await erc20Rebased.calcShare(0n)).to.equal(0n);
    });

    it("basic fail", async function () {
      const { owner, erc20Rebased, users } = await loadFixture(ERC20_Rebase_Native_Fixture);

      expect(await erc20Rebased.calcShare(0n)).to.equal(0n);
      await expect(erc20Rebased.connect(users[0]).transfer(users[1], amount)).reverted;
    });
  });

  describe("ERC20 Rebase Feature", function () {
    it("Stake & Reward & Stake", async function () {
      const { owner, erc20Rebased, users } = await loadFixture(ERC20_Rebase_Native_Fixture);

      await expect(erc20Rebased.connect(users[0]).stake(amount, users[0])).reverted;
      await expect(erc20Rebased.connect(users[0]).stake(amount, users[0], {value: amount})).not.reverted;

      expect(await erc20Rebased.totalSupply()).eq(amount);
      expect(await erc20Rebased.balanceOf(users[0])).eq(amount);

      await expect(erc20Rebased.connect(users[1]).stake(amount, users[1], {value: amount})).not.reverted;
      expect(await erc20Rebased.totalSupply()).eq(amount*2n);
      expect(await erc20Rebased.balanceOf(users[0])).eq(amount);
      expect(await erc20Rebased.balanceOf(users[1])).eq(amount);

      // add reward
      await expect(owner.sendTransaction({to:erc20Rebased, value: amount*2n})).not.reverted;
      expect(await erc20Rebased.totalSupply()).eq(amount*4n);
      expect(await erc20Rebased.balanceOf(users[0])).eq(amount*2n);
      expect(await erc20Rebased.balanceOf(users[1])).eq(amount*2n);

      await expect(erc20Rebased.connect(users[3]).stake(amount, users[3], {value: amount})).not.reverted;
      expect(await erc20Rebased.totalSupply()).eq(amount*5n);
      expect(await erc20Rebased.balanceOf(users[0])).eq(amount*2n);
      expect(await erc20Rebased.balanceOf(users[1])).eq(amount*2n);
      expect(await erc20Rebased.balanceOf(users[3])).eq(amount);

      await expect(erc20Rebased.connect(users[3]).unstake(amount, users[3])).not.reverted;
      expect(await erc20Rebased.totalSupply()).eq(amount*4n);
      expect(await erc20Rebased.balanceOf(users[0])).eq(amount*2n);
      expect(await erc20Rebased.balanceOf(users[1])).eq(amount*2n);
      expect(await erc20Rebased.balanceOf(users[3])).eq(0n);
    });

    it("Stake & Unstake & Stake", async function () {
      const { owner, erc20Rebased, users } = await loadFixture(ERC20_Rebase_Native_Fixture);

      expect(await erc20Rebased.totalSupply()).eq(0n);
      expect(await erc20Rebased.balanceOf(users[0])).eq(0n);
      expect(await ethers.provider.getBalance(erc20Rebased)).eq(0n);

      await expect(erc20Rebased.connect(users[0]).stake(amount, users[0], {value: amount})).not.reverted;
      expect(await erc20Rebased.totalSupply()).eq(amount);
      expect(await erc20Rebased.balanceOf(users[0])).eq(amount);
      expect(await ethers.provider.getBalance(erc20Rebased)).eq(amount);

      await expect(erc20Rebased.connect(users[0]).unstake(amount, users[0])).not.reverted;
      expect(await erc20Rebased.totalSupply()).eq(0n);
      expect(await erc20Rebased.balanceOf(users[0])).eq(0n);
      expect(await ethers.provider.getBalance(erc20Rebased)).eq(0n);

      await expect(erc20Rebased.connect(users[0]).stake(amount, users[0], {value: amount})).not.reverted;
      expect(await erc20Rebased.totalSupply()).eq(amount);
      expect(await erc20Rebased.balanceOf(users[0])).eq(amount);
      expect(await ethers.provider.getBalance(erc20Rebased)).eq(amount);
    });

    it("Stake & Reward & Unstake & Stake", async function () {
      const { owner, erc20Rebased, users } = await loadFixture(ERC20_Rebase_Native_Fixture);

      expect(await erc20Rebased.totalSupply()).eq(0n);
      expect(await erc20Rebased.balanceOf(users[0])).eq(0n);
      expect(await ethers.provider.getBalance(erc20Rebased)).eq(0n);

      await expect(erc20Rebased.connect(users[0]).stake(amount, users[0], {value: amount})).not.reverted;
      expect(await erc20Rebased.totalSupply()).eq(amount);
      expect(await erc20Rebased.balanceOf(users[0])).eq(amount);
      expect(await ethers.provider.getBalance(erc20Rebased)).eq(amount);

      await expect(owner.sendTransaction({to:erc20Rebased, value: amount})).not.reverted;
      expect(await erc20Rebased.totalSupply()).eq(amount*2n);
      expect(await erc20Rebased.balanceOf(users[0])).eq(amount*2n);
      expect(await ethers.provider.getBalance(erc20Rebased)).eq(amount*2n);

      await expect(erc20Rebased.connect(users[0]).unstake(amount*2n, users[0])).not.reverted;
      expect(await erc20Rebased.totalSupply()).eq(0n);
      expect(await erc20Rebased.balanceOf(users[0])).eq(0n);
      expect(await ethers.provider.getBalance(erc20Rebased)).eq(0n);

      await expect(erc20Rebased.connect(users[0]).stake(amount, users[0], {value: amount})).not.reverted;
      expect(await erc20Rebased.totalSupply()).eq(amount);
      expect(await erc20Rebased.balanceOf(users[0])).eq(amount);
      expect(await ethers.provider.getBalance(erc20Rebased)).eq(amount);
    });
  });
});
