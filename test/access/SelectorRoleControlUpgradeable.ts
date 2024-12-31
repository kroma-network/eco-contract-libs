import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

import { getSelector } from "../helper";

describe("SelectorRoleControlUpgradeable", function () {
  async function fixtureSelectorRoleControlUpgradeableDeploy() {
    const [initialOwner, admin] = await hre.ethers.getSigners();

    const testRole = await hre.ethers.getContractFactory(
      "HH_SelectorRoleControlUpgradeable",
    );
    const role = await testRole.connect(initialOwner).deploy(initialOwner);

    return { role, initialOwner, admin };
  }

  describe("HH on Deployment", function () {
    it("check initialOwner", async function () {
      const { role, initialOwner } = await loadFixture(
        fixtureSelectorRoleControlUpgradeableDeploy,
      );
      expect(await role.owner()).equal(initialOwner.address);
      expect(await role.pendingOwner()).equal(hre.ethers.ZeroAddress);
      await expect(role.initSelectorRoleControl(initialOwner)).reverted;
    });

    it("owner pause", async function () {
      const { role } = await loadFixture(
        fixtureSelectorRoleControlUpgradeableDeploy,
      );

      await expect(role.unpause()).reverted;
      await expect(role.pause()).not.reverted;
      await expect(role.pause()).reverted;
      await expect(role.unpause()).not.reverted;
    });

    it("owner grant admin & admin try & play role", async function () {
      const { role, admin } = await loadFixture(
        fixtureSelectorRoleControlUpgradeableDeploy,
      );

      expect(await role.getSelectorRoleAdmin(getSelector(role.pause))).eq(
        ethers.ZeroHash,
      );

      await expect(role.connect(admin).pause()).reverted;
      await expect(role.connect(admin).unpause()).reverted;

      expect(await role.hasSelectorRole(getSelector(role.pause), admin)).eq(
        false,
      );
      expect(await role.getSelectorRoleMemberCount(getSelector(role.pause))).eq(
        0,
      );
      await expect(role.getSelectorRoleMember(getSelector(role.pause), 0))
        .reverted;

      await expect(role.revokeSelectorRole(getSelector(role.pause), admin))
        .reverted;
      await expect(role.grantSelectorRole(getSelector(role.pause), admin)).not
        .reverted;
      await expect(role.grantSelectorRole(getSelector(role.pause), admin))
        .reverted;

      expect(await role.hasSelectorRole(getSelector(role.pause), admin)).eq(
        true,
      );
      expect(await role.getSelectorRoleMemberCount(getSelector(role.pause))).eq(
        1,
      );
      expect(await role.getSelectorRoleMember(getSelector(role.pause), 0)).eq(
        admin,
      );

      await expect(role.connect(admin).pause()).not.reverted;
      await expect(role.connect(admin).pause()).reverted;

      await expect(role.revokeSelectorRole(getSelector(role.unpause), admin))
        .reverted;
      await expect(role.grantSelectorRole(getSelector(role.unpause), admin)).not
        .reverted;
      await expect(role.grantSelectorRole(getSelector(role.unpause), admin))
        .reverted;

      await expect(role.connect(admin).unpause()).not.reverted;
      await expect(role.connect(admin).unpause()).reverted;

      await expect(role.revokeSelectorRole(getSelector(role.pause), admin)).not
        .reverted;
      await expect(role.revokeSelectorRole(getSelector(role.pause), admin))
        .reverted;

      await expect(role.renounceSelectorRole(getSelector(role.unpause), admin))
        .reverted;
      await expect(
        role
          .connect(admin)
          .renounceSelectorRole(getSelector(role.unpause), admin),
      ).not.reverted;
      await expect(
        role
          .connect(admin)
          .renounceSelectorRole(getSelector(role.unpause), admin),
      ).reverted;
      await expect(role.revokeSelectorRole(getSelector(role.unpause), admin))
        .reverted;
    });

    it("admin try grant & admin try role", async function () {
      const { role, admin } = await loadFixture(
        fixtureSelectorRoleControlUpgradeableDeploy,
      );

      await expect(
        role.connect(admin).grantSelectorRole(getSelector(role.pause), admin),
      ).reverted;
      await expect(
        role.connect(admin).grantSelectorRole(getSelector(role.unpause), admin),
      ).reverted;

      await expect(
        role.connect(admin).revokeSelectorRole(getSelector(role.pause), admin),
      ).reverted;
      await expect(
        role
          .connect(admin)
          .revokeSelectorRole(getSelector(role.unpause), admin),
      ).reverted;
    });
  });
});
