import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("EcoOwnable", function () {
  const name = "Mintable Token";
  const symbol = "M ERC20";

  const amount = ethers.parseEther("100");

  async function fixtureEcoOwnableDeploy() {
    const [initialOwner, nextOwner, ...otherAccounts] = await ethers.getSigners();

    const EcoOwnable = await ethers.getContractFactory("TestEcoOwnable");
    const ecoOwnable = await EcoOwnable.connect(initialOwner).deploy();

    return { ecoOwnable, initialOwner, nextOwner };
  }

  async function fixtureEcoOwnablePendingRegistered() {
    const { ecoOwnable, initialOwner, nextOwner } = await loadFixture(fixtureEcoOwnableDeploy);

    await expect(ecoOwnable.connect(initialOwner).registerPendingOwner(nextOwner)).not.reverted

    return { ecoOwnable, initialOwner, nextOwner };
  }

  describe("Test on Deployment", function () {
    it("check initialOwner", async function () {
      const { ecoOwnable, initialOwner } = await loadFixture(fixtureEcoOwnableDeploy);
      expect(await ecoOwnable.owner()).equal(initialOwner.address);
      expect(await ecoOwnable.pendingOwner()).equal(ethers.ZeroAddress);
    });

    it("transfer onwer", async function () {
      const { ecoOwnable, initialOwner, nextOwner } = await loadFixture(fixtureEcoOwnableDeploy);

      await expect(ecoOwnable.connect(nextOwner).transferOwnership(nextOwner)).reverted
      await expect(ecoOwnable.connect(initialOwner).transferOwnership(nextOwner)).not.reverted
      await expect(ecoOwnable.connect(initialOwner).transferOwnership(nextOwner)).reverted
    });

    it("register pending onwer", async function () {
      const { ecoOwnable, initialOwner, nextOwner } = await loadFixture(fixtureEcoOwnableDeploy);

      await expect(ecoOwnable.connect(nextOwner).transferOwnership(initialOwner)).reverted
      await expect(ecoOwnable.connect(nextOwner).registerPendingOwner(nextOwner)).reverted
      await expect(ecoOwnable.connect(initialOwner).registerPendingOwner(nextOwner)).not.reverted

      await expect(ecoOwnable.connect(nextOwner).transferOwnership(initialOwner)).reverted
      await expect(ecoOwnable.connect(nextOwner).registerPendingOwner(initialOwner)).reverted
    });
  });

  describe("Test on Registered pendingOwner", function () {
    it("check pendingOwner", async function () {
      const { ecoOwnable, initialOwner, nextOwner } = await loadFixture(fixtureEcoOwnablePendingRegistered);
      expect(await ecoOwnable.owner()).equal(initialOwner.address);
      expect(await ecoOwnable.pendingOwner()).equal(nextOwner.address);
    });

    it("claim registered", async function () {
      const { ecoOwnable, initialOwner, nextOwner } = await loadFixture(fixtureEcoOwnablePendingRegistered);

      await expect(ecoOwnable.connect(initialOwner).acceptOwnership()).reverted
      await expect(ecoOwnable.connect(nextOwner).acceptOwnership()).not.reverted

      await expect(ecoOwnable.connect(initialOwner).acceptOwnership()).reverted
      await expect(ecoOwnable.connect(nextOwner).acceptOwnership()).reverted
    });
  });
});
