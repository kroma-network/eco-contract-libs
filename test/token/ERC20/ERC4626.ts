import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { MaxUint256, ZeroAddress } from "ethers";
import hre from "hardhat";

import { erc20Decimals, ERC4626_with_Token_Fixture, erc4626TokenName, erc4626TokenSymbol, unitAmount } from "./helper";

describe("ERC4626 The ERC20 that Wrapping ERC20 for Support Stake and Shares", function () {
  const name = erc4626TokenName;
  const symbol = erc4626TokenSymbol;
  const decimals = erc20Decimals;

  const amount = unitAmount;

  describe("Deployment", function () {
    it("Should set the right init", async function () {
      const { erc20, erc4626Token } = await loadFixture(ERC4626_with_Token_Fixture);

      expect(await erc4626Token.asset()).to.equal(erc20);
      await expect(erc4626Token.initEcoERC4626(erc20, name, symbol)).reverted;
    });

    it("Should set the right metadata", async function () {
      const { erc4626Token } = await loadFixture(ERC4626_with_Token_Fixture);

      expect(await erc4626Token.name()).to.equal(name);
      expect(await erc4626Token.symbol()).to.equal(symbol);
      expect(await erc4626Token.decimals()).to.equal(decimals);
    });

    it("basic view", async function () {
      const { owner, erc20, erc4626Token } = await loadFixture(ERC4626_with_Token_Fixture);

      expect(await erc4626Token.previewDeposit(0n)).to.equal(0n);
      expect(await erc4626Token.previewMint(0n)).to.equal(0n);
      expect(await erc4626Token.previewRedeem(0n)).to.equal(0n);
      expect(await erc4626Token.previewWithdraw(0n)).to.equal(0n);

      expect(await erc4626Token.nonces(owner)).to.equal(0n);
    });

    it("basic fail", async function () {
      const { owner, erc4626Token, users } = await loadFixture(ERC4626_with_Token_Fixture);

      await expect(erc4626Token.connect(users[0]).transfer(users[1], amount)).reverted;
    });
  });
  describe("ERC20 Feature of ERC4626", function () {
    it("TransferFrom", async function () {
      const { owner, erc20, erc4626Token, users } = await loadFixture(ERC4626_with_Token_Fixture);

      await expect(erc4626Token.connect(users[1]).deposit(await erc20.balanceOf(users[1]), users[1])).not.reverted;
      const actionAmount = await erc4626Token.balanceOf(users[1]);
      expect(actionAmount).not.eq(0n);

      await expect(erc4626Token.connect(users[0]).transferFrom(users[1], users[0], actionAmount)).reverted;
      await expect(erc4626Token.connect(users[1]).approve(users[0], actionAmount)).not.reverted;
      await expect(erc4626Token.connect(users[0]).transferFrom(users[1], users[0], actionAmount)).not.reverted;
    });

    it("Burn", async function () {
      const { owner, erc20, erc4626Token, users } = await loadFixture(ERC4626_with_Token_Fixture);

      await expect(erc4626Token.connect(users[0]).deposit(await erc20.balanceOf(users[0]), users[0])).not.reverted;
      const actionAmount = (await erc4626Token.balanceOf(users[0])) / 2n;
      expect(actionAmount).not.eq(0n);

      await expect(erc4626Token.connect(users[0]).burn(actionAmount)).not.reverted;

      await expect(erc4626Token.connect(users[0]).burnFrom(users[0], actionAmount)).reverted;
      await expect(erc4626Token.burnFrom(users[0], actionAmount)).reverted;
      await expect(erc4626Token.connect(users[0]).approve(owner, actionAmount)).not.reverted;
      await expect(erc4626Token.burnFrom(users[0], actionAmount)).not.reverted;
    });
  });

  describe("ERC4626 Feature", function () {
    it("Stake & Reward & Stake", async function () {
      const { owner, erc20, erc4626Token, users } = await loadFixture(ERC4626_with_Token_Fixture);

      await expect(erc4626Token.connect(users[0]).deposit(amount, users[0])).not.reverted;

      expect(await erc4626Token.totalSupply()).eq(amount);
      expect(await erc4626Token.balanceOf(users[0])).eq(amount);

      await expect(erc4626Token.connect(users[1]).deposit(amount, users[1])).not.reverted;
      expect(await erc4626Token.totalSupply()).eq(amount * 2n);
      expect(await erc4626Token.balanceOf(users[0])).eq(amount);
      expect(await erc4626Token.balanceOf(users[1])).eq(amount);

      // add reward
      await expect(erc20.transfer(erc4626Token, amount * 2n)).not.reverted;
      expect(await erc4626Token.totalSupply()).eq(amount * 2n);
      expect(await erc4626Token.balanceOf(users[0])).eq(amount);
      expect(await erc4626Token.balanceOf(users[1])).eq(amount);

      await expect(erc4626Token.connect(users[3]).deposit(amount * 2n, users[3])).not.reverted;
      expect(await erc4626Token.totalSupply()).eq(amount * 3n);
      expect(await erc4626Token.balanceOf(users[0])).eq(amount);
      expect(await erc4626Token.balanceOf(users[1])).eq(amount);
      expect(await erc4626Token.balanceOf(users[3])).eq(amount);

      await expect(erc4626Token.connect(users[3]).redeem(amount, users[3], users[3])).not.reverted;
      expect(await erc4626Token.totalSupply()).eq(amount * 2n);
      expect(await erc4626Token.balanceOf(users[0])).eq(amount);
      expect(await erc4626Token.balanceOf(users[1])).eq(amount);
      expect(await erc4626Token.balanceOf(users[3])).eq(0n);
    });

    it("Stake & Unstake & Stake", async function () {
      const { owner, erc20, erc4626Token, users } = await loadFixture(ERC4626_with_Token_Fixture);

      expect(await erc4626Token.totalSupply()).eq(0n);
      expect(await erc4626Token.balanceOf(users[0])).eq(0n);
      expect(await erc20.balanceOf(erc4626Token)).eq(0n);

      await expect(erc4626Token.connect(users[0]).deposit(amount, users[0])).not.reverted;
      expect(await erc4626Token.totalSupply()).eq(amount);
      expect(await erc4626Token.balanceOf(users[0])).eq(amount);
      expect(await erc20.balanceOf(erc4626Token)).eq(amount);

      await expect(erc4626Token.connect(users[0]).redeem(amount, users[0], users[0])).not.reverted;
      expect(await erc4626Token.totalSupply()).eq(0n);
      expect(await erc4626Token.balanceOf(users[0])).eq(0n);
      expect(await erc20.balanceOf(erc4626Token)).eq(0n);

      await expect(erc4626Token.connect(users[0]).deposit(amount, users[0])).not.reverted;
      expect(await erc4626Token.totalSupply()).eq(amount);
      expect(await erc4626Token.balanceOf(users[0])).eq(amount);
      expect(await erc20.balanceOf(erc4626Token)).eq(amount);
    });

    it("Stake & Reward & Unstake & Stake", async function () {
      const { owner, erc20, erc4626Token, users } = await loadFixture(ERC4626_with_Token_Fixture);

      expect(await erc4626Token.totalSupply()).eq(0n);
      expect(await erc4626Token.balanceOf(users[0])).eq(0n);
      expect(await erc20.balanceOf(erc4626Token)).eq(0n);

      await expect(erc4626Token.connect(users[0]).deposit(amount, users[0])).not.reverted;
      expect(await erc4626Token.totalSupply()).eq(amount);
      expect(await erc4626Token.balanceOf(users[0])).eq(amount);
      expect(await erc20.balanceOf(erc4626Token)).eq(amount);

      await expect(erc20.transfer(erc4626Token, amount)).not.reverted;
      expect(await erc4626Token.totalSupply()).eq(amount);
      expect(await erc4626Token.balanceOf(users[0])).eq(amount);
      expect(await erc20.balanceOf(erc4626Token)).eq(amount * 2n);

      await expect(erc4626Token.connect(users[0]).redeem(amount, users[0], users[0])).not.reverted;
      expect(await erc4626Token.totalSupply()).eq(0n);
      expect(await erc4626Token.balanceOf(users[0])).eq(0n);
      expect(await erc20.balanceOf(erc4626Token)).eq(1n);

      await expect(erc4626Token.connect(users[0]).deposit(amount, users[0])).not.reverted;
      expect(await erc4626Token.totalSupply()).eq(amount / 2n);
      expect(await erc4626Token.balanceOf(users[0])).eq(amount / 2n);
      expect(await erc20.balanceOf(erc4626Token)).eq(amount + 1n);
    });
  });
});
