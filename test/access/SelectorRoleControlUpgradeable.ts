import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { getSelector } from "../helper";

describe("SelectorRoleControlUpgradeable", function () {
  async function fixtureSelectorRoleControlUpgradeableDeploy() {
    const [initialOwner, admin] = await hre.ethers.getSigners();

    const SelectorRoleControlUpgradeable = await hre.ethers.getContractFactory("SelectorRoleControlUpgradeable");
    const role = await SelectorRoleControlUpgradeable.connect(initialOwner).deploy();

    await expect(role.initEcoOwnable(initialOwner)).not.reverted;

    return { role, initialOwner, admin };
  }

  describe("Test on Deployment", function () {
    it("check initialOwner", async function () {
      const { role, initialOwner } = await loadFixture(fixtureSelectorRoleControlUpgradeableDeploy);
      expect(await role.owner()).equal(initialOwner.address);
      expect(await role.pendingOwner()).equal(hre.ethers.ZeroAddress);
    });

    it("owner pause", async function () {
      const { role } = await loadFixture(fixtureSelectorRoleControlUpgradeableDeploy);

      await expect(role.unpause()).reverted;
      await expect(role.pause()).not.reverted;
      await expect(role.pause()).reverted;
      await expect(role.unpause()).not.reverted;
    });

    it("owner grant admin & admin try & play role", async function () {
      const { role, admin } = await loadFixture(fixtureSelectorRoleControlUpgradeableDeploy);

      await expect(role.connect(admin).pause()).reverted;
      await expect(role.connect(admin).unpause()).reverted;

      await expect(role.revokeRole(getSelector(role.pause), admin)).reverted;
      await expect(role.grantRole(getSelector(role.pause), admin)).not.reverted;
      await expect(role.grantRole(getSelector(role.pause), admin)).reverted;

      await expect(role.connect(admin).pause()).not.reverted;
      await expect(role.connect(admin).pause()).reverted;

      await expect(role.revokeRole(getSelector(role.unpause), admin)).reverted;
      await expect(role.grantRole(getSelector(role.unpause), admin)).not.reverted;
      await expect(role.grantRole(getSelector(role.unpause), admin)).reverted;

      await expect(role.connect(admin).unpause()).not.reverted;
      await expect(role.connect(admin).unpause()).reverted;

      // TODO: unpause revoke test?
      await expect(role.revokeRole(getSelector(role.pause), admin)).not.reverted;
      await expect(role.revokeRole(getSelector(role.pause), admin)).reverted;

      await expect(role.revokeRole(getSelector(role.unpause), admin)).not.reverted;
      await expect(role.revokeRole(getSelector(role.unpause), admin)).reverted;
    });

    it("admin try grant & admin try role", async function () {
      const { role, admin } = await loadFixture(fixtureSelectorRoleControlUpgradeableDeploy);

      await expect(role.connect(admin).grantRole(getSelector(role.pause), admin)).reverted;
      await expect(role.connect(admin).grantRole(getSelector(role.unpause), admin)).reverted;

      await expect(role.connect(admin).revokeRole(getSelector(role.pause), admin)).reverted;
      await expect(role.connect(admin).revokeRole(getSelector(role.unpause), admin)).reverted;
    });
  });
});
