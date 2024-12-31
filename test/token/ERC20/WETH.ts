import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { getSelector } from "../../helper";

import { WETH_Fixture, unitAmount, wethName, wethSymbol } from "./helper";

describe("ERC20 Mintable", function () {
  const name = wethName;
  const symbol = wethSymbol;
  const decimals = 18n;

  const amount = unitAmount;

  describe("Deployment", function () {
    it("Should set the right Initializations", async function () {
      const { weth, owner } = await loadFixture(WETH_Fixture);

      await expect(weth.initWrappingNativeCoin(name, symbol)).reverted;
    });

    it("Should set the right metadata", async function () {
      const { weth } = await loadFixture(WETH_Fixture);

      expect(await weth.name()).to.equal(name);
      expect(await weth.symbol()).to.equal(symbol);
      expect(await weth.decimals()).to.equal(decimals);
      expect(await weth.totalSupply()).to.equal(0n);
    });

    it("basic view", async function () {
      const { owner, weth } = await loadFixture(WETH_Fixture);

      expect(await weth.balanceOf(owner)).to.equal(0n);
    });
  });

  describe("ERC20 Feature", function () {
    describe("Deposit", function () {
      it("deposit & withdraw", async function () {
        const { owner, weth, users } = await loadFixture(WETH_Fixture);

        await expect(owner.sendTransaction({ to: weth, value: amount })).not
          .reverted;

        const user_connected_weth = weth.connect(users[0]);
        await expect(user_connected_weth.withdraw(amount)).reverted;
        await expect(user_connected_weth.deposit({ value: amount })).not
          .reverted;
        await expect(user_connected_weth.withdraw(amount)).not.reverted;
      });
    });

    describe("Transfer", function () {
      it("Should revert with the right error if mint called from another account", async function () {
        const { owner, weth, users } = await loadFixture(WETH_Fixture);
        await expect(weth.connect(users[0]).deposit({ value: amount })).not
          .reverted;
        expect(await weth.balanceOf(users[0])).equal(amount);

        await expect(weth.connect(users[0]).transfer(users[1], amount)).not
          .reverted;
        expect(await weth.balanceOf(users[1])).equal(amount);

        await expect(weth.connect(users[1]).burn(amount)).not.reverted;
        expect(await weth.balanceOf(users[1])).equal(0);

        await expect(weth.connect(users[0]).deposit({ value: amount })).not
          .reverted;
        await expect(weth.connect(users[0]).deposit({ value: amount })).not
          .reverted;

        await weth.connect(users[0]).approve(owner, hre.ethers.MaxUint256);
        await expect(
          weth.transferFrom(users[0], users[1], await weth.balanceOf(users[0])),
        ).not.reverted;
        await expect(weth.transferFrom(users[0], users[1], amount)).reverted;
        await expect(
          weth
            .connect(users[1])
            .transferFrom(users[1], users[0], await weth.balanceOf(users[1])),
        ).reverted; // should use transfer, owner == spender not allowed
        await weth.connect(users[1]).approve(owner, hre.ethers.MaxUint256);
        await expect(weth.burnFrom(users[1], await weth.balanceOf(users[1])))
          .not.reverted;
      });
    });
  });
});
