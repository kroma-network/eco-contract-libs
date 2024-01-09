import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("EcoOwnable", function () {
  async function fixtureEcoOwnableDeploy() {
    const [initialOwner, nextOwner] = await hre.ethers.getSigners();

    const EcoOwnable = await hre.ethers.getContractFactory("TestEcoOwnable");
    const ecoOwnable = await EcoOwnable.connect(initialOwner).deploy();

    return { ecoOwnable, initialOwner, nextOwner };
  }

  async function fixtureEcoOwnablePendingRegistered() {
    const { ecoOwnable, initialOwner, nextOwner } = await loadFixture(fixtureEcoOwnableDeploy);

    await expect(ecoOwnable.connect(initialOwner).registerPendingOwner(nextOwner)).not.reverted;

    return { ecoOwnable, initialOwner, nextOwner };
  }

  describe("Test on Deployment", function () {
    it("check initialOwner", async function () {
      const { ecoOwnable, initialOwner } = await loadFixture(fixtureEcoOwnableDeploy);
      expect(await ecoOwnable.owner()).equal(initialOwner.address);
      expect(await ecoOwnable.pendingOwner()).equal(hre.ethers.ZeroAddress);

      await expect(ecoOwnable.initEcoOwnable(initialOwner)).reverted;
    });

    it("transfer onwer", async function () {
      const { ecoOwnable, initialOwner, nextOwner } = await loadFixture(fixtureEcoOwnableDeploy);

      await expect(ecoOwnable.connect(nextOwner).transferOwnership(nextOwner)).reverted;
      await expect(ecoOwnable.connect(initialOwner).transferOwnership(nextOwner)).not.reverted;
      await expect(ecoOwnable.connect(initialOwner).transferOwnership(nextOwner)).reverted;
    });

    it("register pending onwer", async function () {
      const { ecoOwnable, initialOwner, nextOwner } = await loadFixture(fixtureEcoOwnableDeploy);

      await expect(ecoOwnable.connect(nextOwner).transferOwnership(initialOwner)).reverted;
      await expect(ecoOwnable.connect(nextOwner).registerPendingOwner(nextOwner)).reverted;
      await expect(ecoOwnable.connect(initialOwner).registerPendingOwner(nextOwner)).not.reverted;

      await expect(ecoOwnable.connect(nextOwner).transferOwnership(initialOwner)).reverted;
      await expect(ecoOwnable.connect(nextOwner).registerPendingOwner(initialOwner)).reverted;
    });
    it("renounce ownership", async function () {
      const { ecoOwnable, initialOwner, nextOwner } = await loadFixture(fixtureEcoOwnableDeploy);

      await expect(ecoOwnable.connect(nextOwner).renounceOwnership()).reverted;
      await expect(ecoOwnable.connect(initialOwner).renounceOwnership()).not.reverted;

      await expect(ecoOwnable.connect(nextOwner).transferOwnership(initialOwner)).reverted;
      await expect(ecoOwnable.connect(initialOwner).transferOwnership(nextOwner)).reverted;
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

      await expect(ecoOwnable.connect(initialOwner).acceptOwnership()).reverted;
      await expect(ecoOwnable.connect(nextOwner).acceptOwnership()).not.reverted;

      await expect(ecoOwnable.connect(initialOwner).acceptOwnership()).reverted;
      await expect(ecoOwnable.connect(nextOwner).acceptOwnership()).reverted;
    });

    it("renounce ownership", async function () {
      // todo redundant check
      const { ecoOwnable, initialOwner, nextOwner } = await loadFixture(fixtureEcoOwnablePendingRegistered);

      await expect(ecoOwnable.connect(nextOwner).renounceOwnership()).reverted;
      // remove owner & pendingOwner
      await expect(ecoOwnable.connect(initialOwner).renounceOwnership()).not.reverted;

      await expect(ecoOwnable.connect(nextOwner).transferOwnership(initialOwner)).reverted;
      await expect(ecoOwnable.connect(initialOwner).transferOwnership(nextOwner)).reverted;

      await expect(ecoOwnable.connect(initialOwner).acceptOwnership()).reverted;
      await expect(ecoOwnable.connect(nextOwner).acceptOwnership()).reverted;

      await expect(ecoOwnable.connect(initialOwner).registerPendingOwner(initialOwner)).reverted;
      await expect(ecoOwnable.connect(nextOwner).registerPendingOwner(nextOwner)).reverted;
    });
  });
});
