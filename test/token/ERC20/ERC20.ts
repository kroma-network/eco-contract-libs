import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { getSelector } from "../../helper";

import { ERC20_Mintable_Fixture, erc20Decimals, erc20Name, erc20Symbol, unitAmount } from "./helper";

describe("ERC20 Mintable", function () {
  const name = erc20Name;
  const symbol = erc20Symbol;
  const decimals = erc20Decimals;

  const amount = unitAmount;

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { erc20, owner } = await loadFixture(ERC20_Mintable_Fixture);

      expect(await erc20.owner()).to.equal(owner.address);
      await expect(erc20.initEcoERC20(owner, name, symbol, decimals)).reverted;
    });

    it("Should set the right metadata", async function () {
      const { erc20 } = await loadFixture(ERC20_Mintable_Fixture);

      expect(await erc20.name()).to.equal(name);
      expect(await erc20.symbol()).to.equal(symbol);
      expect(await erc20.decimals()).to.equal(decimals);
      expect(await erc20.totalSupply()).to.equal(0n);
    });

    it("basic view", async function () {
      const { owner, erc20 } = await loadFixture(ERC20_Mintable_Fixture);

      expect(await erc20.nonces(owner)).to.equal(0n);
    });
  });

  describe("ERC20 Feature", function () {
    describe("Mint", function () {
      it("Should revert with the right error if mint called from another account", async function () {
        const { erc20, users } = await loadFixture(ERC20_Mintable_Fixture);
        const user_connected_erc20 = erc20.connect(users[0]);
        await expect(user_connected_erc20.mint(users[0], amount)).reverted;
      });

      it("Shouldn't fail mint with the right owner", async function () {
        const { erc20, users } = await loadFixture(ERC20_Mintable_Fixture);
        await expect(erc20.mint(users[0], amount)).not.reverted;
      });

      it("Shouldn't fail mint with the right role access account", async function () {
        const { erc20, users } = await loadFixture(ERC20_Mintable_Fixture);

        await expect(erc20.grantSelectorRole(getSelector(erc20.mint), users[0])).not.reverted;

        const user_connected_erc20 = erc20.connect(users[0]);
        await expect(user_connected_erc20.mint(users[0], amount)).not.reverted;

        await expect(erc20.revokeSelectorRole(getSelector(erc20.mint), users[0])).not.reverted;
        await expect(user_connected_erc20.mint(users[0], amount)).reverted;
      });
    });

    describe("Transfer", function () {
      it("Should revert with the right error if mint called from another account", async function () {
        const { owner, erc20, users } = await loadFixture(ERC20_Mintable_Fixture);
        await expect(erc20.mint(users[0], amount)).not.reverted;
        expect(await erc20.balanceOf(users[0])).equal(amount);

        await expect(erc20.connect(users[0]).transfer(users[1], amount)).not.reverted;
        expect(await erc20.balanceOf(users[1])).equal(amount);

        await expect(erc20.connect(users[1]).burn(amount)).not.reverted;
        expect(await erc20.balanceOf(users[1])).equal(0);

        await expect(erc20.mint(users[0], amount)).not.reverted;
        await expect(erc20.mint(users[0], amount)).not.reverted;

        await erc20.connect(users[0]).approve(owner, hre.ethers.MaxUint256);
        await expect(erc20.transferFrom(users[0], users[1], await erc20.balanceOf(users[0]))).not.reverted;
        await expect(erc20.transferFrom(users[0], users[1], amount)).reverted;
        await expect(erc20.connect(users[1]).transferFrom(users[1], users[0], await erc20.balanceOf(users[1])))
          .reverted; // should use transfer, owner == spender not allowed
        await erc20.connect(users[1]).approve(owner, hre.ethers.MaxUint256);
        await expect(erc20.burnFrom(users[1], await erc20.balanceOf(users[1]))).not.reverted;
      });
    });
  });
});
