import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ZeroAddress } from "ethers";
import hre from "hardhat";

import { getSelector } from "../../helper";

describe("ERC20 Rebase Native", function () {
  const name = "Rebase Native Token";
  const symbol = "M ERC20";
  const decimals = 18;

  const amount = hre.ethers.parseEther("100");

  async function NFT_Rebase_Native_Fixture() {
    const [owner, ...users] = await hre.ethers.getSigners();

    const ERC20 = await hre.ethers.getContractFactory("EcoERC20RebasedWithNative");
    const erc20 = await ERC20.deploy();
    await erc20.initEcoERC20Rebase(ZeroAddress, name, symbol, decimals);

    return { erc20, owner, users };
  }

  describe("Deployment", function () {
    it("Should set the right init", async function () {
      const { erc20 } = await loadFixture(NFT_Rebase_Native_Fixture);

      expect(await erc20.underlying()).to.equal(ZeroAddress);
      await expect(erc20.initEcoERC20Rebase(ZeroAddress, name, symbol, decimals)).reverted;
    });

    it("Should set the right metadata", async function () {
      const { erc20 } = await loadFixture(NFT_Rebase_Native_Fixture);

      expect(await erc20.name()).to.equal(name);
      expect(await erc20.symbol()).to.equal(symbol);
      expect(await erc20.decimals()).to.equal(decimals);
    });
  });

  describe("ERC20 Rebase Feature", function () {
    describe("Stake", function () {
      it("Should not revert with any account call stake", async function () {
        const { owner, erc20, users } = await loadFixture(NFT_Rebase_Native_Fixture);

        await expect(erc20.connect(users[0]).stake(amount, users[0])).reverted;
        await expect(erc20.connect(users[0]).stake(amount, users[0], {value: amount})).not.reverted;

        expect(await erc20.totalSupply()).eq(amount);
        expect(await erc20.balanceOf(users[0])).eq(amount);

        await expect(erc20.connect(users[1]).stake(amount, users[1], {value: amount})).not.reverted;
        expect(await erc20.totalSupply()).eq(amount*2n);
        expect(await erc20.balanceOf(users[0])).eq(amount);
        expect(await erc20.balanceOf(users[1])).eq(amount);

        await expect(users[2].sendTransaction({to:erc20, value: amount*2n})).not.reverted;
        expect(await erc20.totalSupply()).eq(amount*4n);
        expect(await erc20.balanceOf(users[0])).eq(amount*2n);
        expect(await erc20.balanceOf(users[1])).eq(amount*2n);

        await expect(erc20.connect(users[3]).stake(amount, users[3], {value: amount})).not.reverted;
        expect(await erc20.totalSupply()).eq(amount*5n);
        expect(await erc20.balanceOf(users[0])).eq(amount*2n);
        expect(await erc20.balanceOf(users[1])).eq(amount*2n);
        expect(await erc20.balanceOf(users[3])).eq(amount);

        await expect(erc20.connect(users[3]).unstake(amount, users[3])).not.reverted;
        expect(await erc20.totalSupply()).eq(amount*4n);
        expect(await erc20.balanceOf(users[0])).eq(amount*2n);
        expect(await erc20.balanceOf(users[1])).eq(amount*2n);
        expect(await erc20.balanceOf(users[3])).eq(0n);
      });
    });
  });
});
