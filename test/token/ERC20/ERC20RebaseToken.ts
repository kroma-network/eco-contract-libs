import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { MaxUint256, ZeroAddress } from "ethers";
import hre from "hardhat";

import {
  ERC20_Rebase_Token_Base_Fixture,
  ERC20_Rebase_Token_Fixture,
  erc20Decimals,
  erc20RebasedTokenName,
  erc20RebasedTokenSymbol,
} from "./helper";

describe("ERC20 Rebase Token", function () {
  const name = erc20RebasedTokenName;
  const symbol = erc20RebasedTokenSymbol;
  const decimals = erc20Decimals;

  const amount = hre.ethers.parseEther("100");

  describe("Deployment", function () {
    it("Check Rebase Init Process", async function () {
      const { erc20Underlying, erc20Rebased } = await loadFixture(
        ERC20_Rebase_Token_Base_Fixture,
      );
      await expect(
        erc20Rebased.initEcoERC20Rebase(ZeroAddress, name, symbol, decimals),
      ).reverted;
      await expect(
        erc20Rebased.initEcoERC20Rebase(erc20Underlying, name, symbol, 6n),
      ).reverted;
    });

    it("Should set the right init", async function () {
      const { erc20Underlying, erc20Rebased } = await loadFixture(
        ERC20_Rebase_Token_Fixture,
      );

      expect(await erc20Rebased.underlying()).to.equal(erc20Underlying);
      await expect(
        erc20Rebased.initEcoERC20Rebase(
          erc20Underlying,
          name,
          symbol,
          decimals,
        ),
      ).reverted;
    });

    it("Should set the right metadata", async function () {
      const { erc20Underlying, erc20Rebased } = await loadFixture(
        ERC20_Rebase_Token_Fixture,
      );

      expect(await erc20Rebased.name()).to.equal(name);
      expect(await erc20Rebased.symbol()).to.equal(symbol);
      expect(await erc20Rebased.decimals()).to.equal(decimals);
    });

    it("basic view", async function () {
      const { owner, erc20Underlying, erc20Rebased } = await loadFixture(
        ERC20_Rebase_Token_Fixture,
      );

      expect(await erc20Rebased.calcShare(0n)).to.equal(0n);
    });

    it("basic fail", async function () {
      const { owner, erc20Rebased, users } = await loadFixture(
        ERC20_Rebase_Token_Fixture,
      );

      expect(await erc20Rebased.calcShare(0n)).to.equal(0n);
      await expect(erc20Rebased.connect(users[0]).transfer(users[1], amount))
        .reverted;
    });
  });

  describe("ERC20 Rebase Feature", function () {
    it("Stake & Reward & Stake", async function () {
      const { owner, erc20Underlying, erc20Rebased, users } = await loadFixture(
        ERC20_Rebase_Token_Fixture,
      );

      await expect(erc20Rebased.connect(users[0]).stake(amount, users[0])).not
        .reverted;

      expect(await erc20Rebased.totalSupply()).eq(amount);
      expect(await erc20Rebased.balanceOf(users[0])).eq(amount);

      await expect(erc20Rebased.connect(users[1]).stake(amount, users[1])).not
        .reverted;
      expect(await erc20Rebased.totalSupply()).eq(amount * 2n);
      expect(await erc20Rebased.balanceOf(users[0])).eq(amount);
      expect(await erc20Rebased.balanceOf(users[1])).eq(amount);

      // add reward
      await expect(erc20Underlying.transfer(erc20Rebased, amount * 2n)).not
        .reverted;
      expect(await erc20Rebased.totalSupply()).eq(amount * 4n);
      expect(await erc20Rebased.balanceOf(users[0])).eq(amount * 2n);
      expect(await erc20Rebased.balanceOf(users[1])).eq(amount * 2n);

      await expect(erc20Rebased.connect(users[3]).stake(amount, users[3])).not
        .reverted;
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
      const { owner, erc20Underlying, erc20Rebased, users } = await loadFixture(
        ERC20_Rebase_Token_Fixture,
      );

      expect(await erc20Rebased.totalSupply()).eq(0n);
      expect(await erc20Rebased.balanceOf(users[0])).eq(0n);
      expect(await erc20Underlying.balanceOf(erc20Rebased)).eq(0n);

      await expect(erc20Rebased.connect(users[0]).stake(amount, users[0])).not
        .reverted;
      expect(await erc20Rebased.totalSupply()).eq(amount);
      expect(await erc20Rebased.balanceOf(users[0])).eq(amount);
      expect(await erc20Underlying.balanceOf(erc20Rebased)).eq(amount);

      await expect(erc20Rebased.connect(users[0]).unstake(amount, users[0])).not
        .reverted;
      expect(await erc20Rebased.totalSupply()).eq(0n);
      expect(await erc20Rebased.balanceOf(users[0])).eq(0n);
      expect(await erc20Underlying.balanceOf(erc20Rebased)).eq(0n);

      await expect(erc20Rebased.connect(users[0]).stake(amount, users[0])).not
        .reverted;
      expect(await erc20Rebased.totalSupply()).eq(amount);
      expect(await erc20Rebased.balanceOf(users[0])).eq(amount);
      expect(await erc20Underlying.balanceOf(erc20Rebased)).eq(amount);
    });

    it("Stake & Reward & Unstake & Stake", async function () {
      const { owner, erc20Underlying, erc20Rebased, users } = await loadFixture(
        ERC20_Rebase_Token_Fixture,
      );

      expect(await erc20Rebased.totalSupply()).eq(0n);
      expect(await erc20Rebased.balanceOf(users[0])).eq(0n);
      expect(await erc20Underlying.balanceOf(erc20Rebased)).eq(0n);

      await expect(erc20Rebased.connect(users[0]).stake(amount, users[0])).not
        .reverted;
      expect(await erc20Rebased.totalSupply()).eq(amount);
      expect(await erc20Rebased.balanceOf(users[0])).eq(amount);
      expect(await erc20Underlying.balanceOf(erc20Rebased)).eq(amount);

      await expect(erc20Underlying.transfer(erc20Rebased, amount)).not.reverted;
      expect(await erc20Rebased.totalSupply()).eq(amount * 2n);
      expect(await erc20Rebased.balanceOf(users[0])).eq(amount * 2n);
      expect(await erc20Underlying.balanceOf(erc20Rebased)).eq(amount * 2n);

      await expect(
        erc20Rebased.connect(users[0]).unstake(amount * 2n, users[0]),
      ).not.reverted;
      expect(await erc20Rebased.totalSupply()).eq(0n);
      expect(await erc20Rebased.balanceOf(users[0])).eq(0n);
      expect(await erc20Underlying.balanceOf(erc20Rebased)).eq(0n);

      await expect(erc20Rebased.connect(users[0]).stake(amount, users[0])).not
        .reverted;
      expect(await erc20Rebased.totalSupply()).eq(amount);
      expect(await erc20Rebased.balanceOf(users[0])).eq(amount);
      expect(await erc20Underlying.balanceOf(erc20Rebased)).eq(amount);
    });
  });
});
