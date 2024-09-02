import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ZeroAddress } from "ethers";
import hre, { ethers } from "hardhat";

describe("Echidna", function () {
  async function HHKromaBridgeFixture() {
    const [owner, ...users] = await hre.ethers.getSigners();

    const bridgeL1Factory = await hre.ethers.getContractFactory("HHL1KromaBridge");
    const bridgeL2Factory = await hre.ethers.getContractFactory("HHL2KromaBridge");

    const bridgeL1 = await bridgeL1Factory.deploy();
    const bridgeL2 = await bridgeL2Factory.deploy();
    await expect(bridgeL1.initSelectorRoleControl(owner)).not.reverted;
    await expect(bridgeL2.initSelectorRoleControl(owner)).not.reverted;
    await expect(bridgeL1.setRemoteBridge(bridgeL2)).not.reverted;
    await expect(bridgeL2.setRemoteBridge(bridgeL1)).not.reverted;

    const tokenL1Factory = await hre.ethers.getContractFactory("EcoERC20Upgradeable");
    const tokenL2Factory = await hre.ethers.getContractFactory("ERC20L2BridgedUpgradeable");
    const tokenL1 = await tokenL1Factory.deploy();
    const tokenL2 = await tokenL2Factory.deploy();

    await expect(tokenL1.initEcoERC20(owner, "tokenL1", "TL1", 18)).not.reverted;
    await expect(tokenL2.initERC20L2Bridged(owner, "tokenL2", "TL2", 18, tokenL1, bridgeL2)).not.reverted;

    return { owner, users, bridgeL1, bridgeL2, tokenL1, tokenL2 };
  }

  describe("Basic", function () {
    it("Bridge", async function () {
      const { owner, bridgeL1, bridgeL2, tokenL1, tokenL2 } = await loadFixture(HHKromaBridgeFixture);
      const amount = hre.ethers.parseEther("1");
      await tokenL1.mint(owner, 2n * amount);
      await tokenL1.approve(bridgeL1, 2n * amount);

      expect(await tokenL2.balanceOf(owner)).eq(0);

      await expect(bridgeL1.bridgeERC20(tokenL1, tokenL2, amount, 200000, "0x")).not.reverted;
      expect(await tokenL2.balanceOf(owner)).eq(amount);

      await expect(bridgeL2.bridgeERC20(tokenL2, tokenL1, amount, 200000, "0x")).not.reverted;
      expect(await tokenL2.balanceOf(owner)).eq(0);
    });

    it("BridgeTo", async function () {
      const { owner, bridgeL1, bridgeL2, tokenL1, tokenL2 } = await loadFixture(HHKromaBridgeFixture);
      const amount = hre.ethers.parseEther("1");
      await tokenL1.mint(owner, amount);
      await tokenL1.approve(bridgeL1, amount);

      expect(await tokenL2.balanceOf(owner)).eq(0);

      await expect(bridgeL1.bridgeERC20To(tokenL1, tokenL2, owner, amount, 200000, "0x")).not.reverted;
      expect(await tokenL2.balanceOf(owner)).eq(amount);

      await expect(bridgeL2.bridgeERC20To(tokenL2, tokenL1, owner, amount, 200000, "0x")).not.reverted;
      expect(await tokenL2.balanceOf(owner)).eq(0);
    });

    it("Bridge Token Coverage(revert)", async function () {
      const { owner, users, tokenL1, tokenL2, bridgeL2 } = await loadFixture(HHKromaBridgeFixture);

      const amount = ethers.parseEther("1");
      await tokenL2.mint(users[0], amount);
      await expect(tokenL2.connect(users[0])["burn(address,uint256)"](users[0], amount)).reverted;

      const tokenL2Factory = await hre.ethers.getContractFactory("ERC20L2BridgedUpgradeable");
      const tokenL2InitRevert = await tokenL2Factory.deploy();
      await expect(tokenL2InitRevert.initERC20L2Bridged(users[0], "tokenL2", "TL2", 18, tokenL1, bridgeL2)).not.reverted;
    });

    it("Bridge Token Coverage(view)", async function () {
      const { owner, users, tokenL2 } = await loadFixture(HHKromaBridgeFixture);
      expect(await tokenL2.supportsInterface("0x00000000")).eq(false);
      expect(await tokenL2.nonces(owner)).eq(0n);
    });

    it("Bridge Coverage(revert)", async function () {
      const { owner, users, bridgeL1, bridgeL2 } = await loadFixture(HHKromaBridgeFixture);
      await expect(bridgeL1.bridgeETHTo(ZeroAddress, 0, "0x")).reverted;
      await expect(bridgeL1.bridgeETH(0, "0x")).reverted;
      await expect(bridgeL1.finalizeBridgeETH(ZeroAddress, ZeroAddress, 0, "0x")).reverted;
      await expect(bridgeL1.connect(users[0]).setRemoteBridge(ZeroAddress)).reverted;
      await expect(bridgeL1.connect(users[0]).finalizeBridgeERC20(ZeroAddress, ZeroAddress, ZeroAddress, ZeroAddress, 0, "0x")).reverted;
      await expect(owner.sendTransaction({to:bridgeL1})).reverted;

      await expect(bridgeL2.bridgeETHTo(ZeroAddress, 0, "0x")).reverted;
      await expect(bridgeL2.bridgeETH(0, "0x")).reverted;
      await expect(bridgeL2.finalizeBridgeETH(ZeroAddress, ZeroAddress, 0, "0x")).reverted;
      await expect(bridgeL2.connect(users[0]).setRemoteBridge(ZeroAddress)).reverted;
      await expect(bridgeL2.connect(users[0]).finalizeBridgeERC20(ZeroAddress, ZeroAddress, ZeroAddress, ZeroAddress, 0, "0x")).reverted;
      await expect(owner.sendTransaction({to:bridgeL2})).reverted;
    });
  });
});