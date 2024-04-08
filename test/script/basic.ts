import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { ProxiedInstance } from "../../eco-libs/lib";
import { EcoERC20Upgradeable__factory } from "../../typechain-types";
import { getSelector } from "../helper";

describe("Script Library Test(Upgradeable ERC20)", function () {
  const name = "Up Token";
  const symbol = "Up ERC20";
  const decimals = 18;

  const amount = hre.ethers.parseEther("100");

  async function ERC20_Upgrade_Fixture() {
    const [owner, ...users] = await hre.ethers.getSigners();

    const erc20 = await new ProxiedInstance("erc20", EcoERC20Upgradeable__factory, owner);
    await erc20.deployWithInputBuilder(async () => {
      return erc20.logic.interface.encodeFunctionData("initEcoERC20", [owner.address, name, symbol, decimals]);
    });

    return { erc20, owner, users };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { erc20, owner } = await loadFixture(ERC20_Upgrade_Fixture);

      expect(await erc20.inst.owner()).to.equal(owner.address);
      await expect(erc20.inst.initEcoERC20(owner, name, symbol, decimals)).reverted;
    });

    it("Should set the right metadata", async function () {
      const { erc20 } = await loadFixture(ERC20_Upgrade_Fixture);

      expect(await erc20.inst.name()).to.equal(name);
      expect(await erc20.inst.symbol()).to.equal(symbol);
      expect(await erc20.inst.decimals()).to.equal(decimals);
    });
  });

  describe("ERC20 Upgrade", function () {
    describe("Mint", function () {
      it("Should revert with the right error if mint called from another account", async function () {
        const { erc20, users } = await loadFixture(ERC20_Upgrade_Fixture);
        const user_connected_nft = erc20.inst.connect(users[0]);
        await expect(user_connected_nft.mint(users[0], amount)).reverted;
      });

      it("Shouldn't fail mint with the right owner", async function () {
        const { erc20, users } = await loadFixture(ERC20_Upgrade_Fixture);
        await expect(erc20.inst.mint(users[0], amount)).not.reverted;
      });

      it("Shouldn't fail mint with the right role access account", async function () {
        const { erc20, users } = await loadFixture(ERC20_Upgrade_Fixture);

        await expect(erc20.inst.grantSelectorRole(getSelector(erc20.inst.mint), users[0])).not.reverted;

        const user_connected_nft = erc20.inst.connect(users[0]);
        await expect(user_connected_nft.mint(users[0], amount)).not.reverted;

        await expect(erc20.inst.revokeSelectorRole(getSelector(erc20.inst.mint), users[0])).not.reverted;
        await expect(user_connected_nft.mint(users[0], amount)).reverted;
      });
    });

    describe("Transfer", function () {
      it("Should revert with the right error if mint called from another account", async function () {
        const { owner, erc20, users } = await loadFixture(ERC20_Upgrade_Fixture);
        await expect(erc20.inst.mint(users[0], amount)).not.reverted;
        await expect(erc20.inst.connect(users[0]).burn(amount)).not.reverted;
        expect(await erc20.inst.balanceOf(users[0])).equal(0);

        await expect(erc20.inst.mint(users[0], amount)).not.reverted;
        await expect(erc20.inst.mint(users[0], amount)).not.reverted;

        await erc20.inst.connect(users[0]).approve(owner, hre.ethers.MaxUint256);
        await expect(erc20.inst.transferFrom(users[0], users[1], await erc20.inst.balanceOf(users[0]))).not.reverted;
        await expect(erc20.inst.transferFrom(users[0], users[1], amount)).reverted;
        await expect(erc20.inst.connect(users[1]).transferFrom(users[1], users[0], await erc20.inst.balanceOf(users[1])))
          .reverted;
        await erc20.inst.connect(users[1]).approve(owner, hre.ethers.MaxUint256);
        await expect(erc20.inst.burnFrom(users[1], await erc20.inst.balanceOf(users[1]))).not.reverted;
      });
    });
  });
});
