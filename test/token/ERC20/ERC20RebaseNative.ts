import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ZeroAddress } from "ethers";
import hre, { ethers } from "hardhat";

import {
  ERC20_Rebase_Native_Base_Fixture,
  ERC20_Rebase_Native_Fixture,
  erc20Decimals,
  erc20RebasedNativeName,
  erc20RebasedNativeSymbol,
  unitAmount,
} from "./helper";

describe("ERC20 Rebase Native", function () {
  const name = erc20RebasedNativeName;
  const symbol = erc20RebasedNativeSymbol;
  const decimals = erc20Decimals;

  const amount = unitAmount;

  describe("Deployment", function () {
    it("Check Rebase Init Process", async function () {
      const { erc20Rebased, owner, users } = await loadFixture(
        ERC20_Rebase_Native_Base_Fixture,
      );
      await expect(
        erc20Rebased.initEcoERC20Rebase(erc20Rebased, name, symbol, decimals),
      ).reverted;
      await expect(
        erc20Rebased.initEcoERC20Rebase(ZeroAddress, name, symbol, 6n),
      ).reverted;
    });

    it("Should set the right init", async function () {
      const { erc20Rebased } = await loadFixture(ERC20_Rebase_Native_Fixture);

      expect(await erc20Rebased.underlying()).to.equal(ZeroAddress);
      await expect(
        erc20Rebased.initEcoERC20Rebase(ZeroAddress, name, symbol, decimals),
      ).reverted;
    });

    it("Should set the right metadata", async function () {
      const { erc20Rebased } = await loadFixture(ERC20_Rebase_Native_Fixture);

      expect(await erc20Rebased.name()).to.equal(name);
      expect(await erc20Rebased.symbol()).to.equal(symbol);
      expect(await erc20Rebased.decimals()).to.equal(decimals);
    });

    it("basic view", async function () {
      const { owner, erc20Rebased } = await loadFixture(
        ERC20_Rebase_Native_Fixture,
      );

      expect(await erc20Rebased.calcShare(0n)).to.equal(0n);
    });

    it("basic fail", async function () {
      const { owner, erc20Rebased, users } = await loadFixture(
        ERC20_Rebase_Native_Fixture,
      );

      expect(await erc20Rebased.calcShare(0n)).to.equal(0n);
      await expect(erc20Rebased.connect(users[0]).transfer(users[1], amount))
        .reverted;
    });

    it("receive success", async function () {
      const { owner, erc20Rebased, users } = await loadFixture(
        ERC20_Rebase_Native_Fixture,
      );
      await expect(owner.sendTransaction({ to: erc20Rebased })).not.reverted;
    });
  });

  describe("ERC20 Rebase Feature", function () {
    it("Stake & Reward & Stake", async function () {
      const { owner, erc20Rebased, users } = await loadFixture(
        ERC20_Rebase_Native_Fixture,
      );

      await expect(erc20Rebased.connect(users[0]).stake(amount, users[0]))
        .reverted;
      await expect(
        erc20Rebased
          .connect(users[0])
          .stake(amount, users[0], { value: amount }),
      ).not.reverted;

      expect(await erc20Rebased.totalSupply()).eq(amount);
      expect(await erc20Rebased.balanceOf(users[0])).eq(amount);

      await expect(
        erc20Rebased
          .connect(users[1])
          .stake(amount, users[1], { value: amount }),
      ).not.reverted;
      expect(await erc20Rebased.totalSupply()).eq(amount * 2n);
      expect(await erc20Rebased.balanceOf(users[0])).eq(amount);
      expect(await erc20Rebased.balanceOf(users[1])).eq(amount);

      // add reward
      await expect(
        owner.sendTransaction({ to: erc20Rebased, value: amount * 2n }),
      ).not.reverted;
      expect(await erc20Rebased.totalSupply()).eq(amount * 4n);
      expect(await erc20Rebased.balanceOf(users[0])).eq(amount * 2n);
      expect(await erc20Rebased.balanceOf(users[1])).eq(amount * 2n);

      await expect(
        erc20Rebased
          .connect(users[3])
          .stake(amount, users[3], { value: amount }),
      ).not.reverted;
      expect(await erc20Rebased.totalSupply()).eq(amount * 5n);
      expect(await erc20Rebased.balanceOf(users[0])).eq(amount * 2n);
      expect(await erc20Rebased.balanceOf(users[1])).eq(amount * 2n);
      expect(await erc20Rebased.balanceOf(users[3])).eq(amount);

      await expect(erc20Rebased.connect(users[3]).unstake(amount, users[3])).not
        .reverted;
      expect(await erc20Rebased.totalSupply()).eq(amount * 4n);
      expect(await erc20Rebased.balanceOf(users[0])).eq(amount * 2n);
      expect(await erc20Rebased.balanceOf(users[1])).eq(amount * 2n);
      expect(await erc20Rebased.balanceOf(users[3])).eq(0n);
    });

    it("Stake & Unstake & Stake", async function () {
      const { owner, erc20Rebased, users } = await loadFixture(
        ERC20_Rebase_Native_Fixture,
      );

      expect(await erc20Rebased.totalSupply()).eq(0n);
      expect(await erc20Rebased.balanceOf(users[0])).eq(0n);
      expect(await ethers.provider.getBalance(erc20Rebased)).eq(0n);

      await expect(
        erc20Rebased
          .connect(users[0])
          .stake(amount, users[0], { value: amount }),
      ).not.reverted;
      expect(await erc20Rebased.totalSupply()).eq(amount);
      expect(await erc20Rebased.balanceOf(users[0])).eq(amount);
      expect(await ethers.provider.getBalance(erc20Rebased)).eq(amount);

      await expect(erc20Rebased.connect(users[0]).unstake(amount, users[0])).not
        .reverted;
      expect(await erc20Rebased.totalSupply()).eq(0n);
      expect(await erc20Rebased.balanceOf(users[0])).eq(0n);
      expect(await ethers.provider.getBalance(erc20Rebased)).eq(0n);

      await expect(
        erc20Rebased
          .connect(users[0])
          .stake(amount, users[0], { value: amount }),
      ).not.reverted;
      expect(await erc20Rebased.totalSupply()).eq(amount);
      expect(await erc20Rebased.balanceOf(users[0])).eq(amount);
      expect(await ethers.provider.getBalance(erc20Rebased)).eq(amount);
    });

    it("Stake & Reward & Unstake & Stake", async function () {
      const { owner, erc20Rebased, users } = await loadFixture(
        ERC20_Rebase_Native_Fixture,
      );

      expect(await erc20Rebased.totalSupply()).eq(0n);
      expect(await erc20Rebased.balanceOf(users[0])).eq(0n);
      expect(await ethers.provider.getBalance(erc20Rebased)).eq(0n);

      await expect(
        erc20Rebased
          .connect(users[0])
          .stake(amount, users[0], { value: amount }),
      ).not.reverted;
      expect(await erc20Rebased.totalSupply()).eq(amount);
      expect(await erc20Rebased.balanceOf(users[0])).eq(amount);
      expect(await ethers.provider.getBalance(erc20Rebased)).eq(amount);

      await expect(owner.sendTransaction({ to: erc20Rebased, value: amount }))
        .not.reverted;
      expect(await erc20Rebased.totalSupply()).eq(amount * 2n);
      expect(await erc20Rebased.balanceOf(users[0])).eq(amount * 2n);
      expect(await ethers.provider.getBalance(erc20Rebased)).eq(amount * 2n);

      await expect(
        erc20Rebased.connect(users[0]).unstake(amount * 2n, users[0]),
      ).not.reverted;
      expect(await erc20Rebased.totalSupply()).eq(0n);
      expect(await erc20Rebased.balanceOf(users[0])).eq(0n);
      expect(await ethers.provider.getBalance(erc20Rebased)).eq(0n);

      await expect(
        erc20Rebased
          .connect(users[0])
          .stake(amount, users[0], { value: amount }),
      ).not.reverted;
      expect(await erc20Rebased.totalSupply()).eq(amount);
      expect(await erc20Rebased.balanceOf(users[0])).eq(amount);
      expect(await ethers.provider.getBalance(erc20Rebased)).eq(amount);
    });
  });
});
