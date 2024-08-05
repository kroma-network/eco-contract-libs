import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ZeroAddress, ZeroHash } from "ethers";
import hre, { ethers } from "hardhat";

import { ERC20L2BridgedUpgradeable } from "../../typechain-types";
import { getAdminAddress, getImplAddress } from "../helper";

describe("ProxyWithDeployAdmin Test", function () {
  const name = "Mintable Token";
  const symbol = "M ERC20";
  const decimals = 18n;

  async function fixtureProxyWithDeployAdminConfig() {
    const [owner, ...users] = await hre.ethers.getSigners();

    const ERC20 = await hre.ethers.getContractFactory("EcoERC20Upgradeable");
    const erc20Logic = await ERC20.deploy();
    await erc20Logic.initEcoERC20(owner, name, symbol, decimals);

    const initData = erc20Logic.interface.encodeFunctionData("initEcoERC20", [owner.address, name, symbol, decimals]);

    const ERC1967Proxy = await hre.ethers.getContractFactory("ERC1967Proxy");
    const proxy = await ERC1967Proxy.deploy(erc20Logic, initData);

    const inst = await hre.ethers.getContractAt("EcoERC20Upgradeable", proxy.target, owner);

    return { erc20Logic, proxy, inst, owner, users, ERC1967Proxy };
  }

  describe("Deployment", function () {
    it("ProxyWithDeployAdmin check", async function () {
      const { erc20Logic, proxy } = await loadFixture(fixtureProxyWithDeployAdminConfig);

      expect(await getAdminAddress(proxy)).equal(ZeroAddress);
      expect(await getImplAddress(proxy)).equal(erc20Logic);
    });

    it("Inst check", async function () {
      const { inst } = await loadFixture(fixtureProxyWithDeployAdminConfig);

      expect(await inst.name()).equal(name);
      expect(await inst.symbol()).equal(symbol);
      expect(await inst.decimals()).equal(decimals);
    });

    it("UUPS upgrade", async function () {
      const { owner, inst, users } = await loadFixture(fixtureProxyWithDeployAdminConfig);

      const theDecimals = 6n;
      const BridgedEcoERC20 = await hre.ethers.getContractFactory("ERC20L2BridgedUpgradeable");
      const BridgedEcoERC20Logic = await BridgedEcoERC20.deploy();
      await BridgedEcoERC20Logic.initEcoERC20(owner, name, symbol, theDecimals);

      const upgradeInst:ERC20L2BridgedUpgradeable = BridgedEcoERC20.attach(inst) as ERC20L2BridgedUpgradeable;

      await expect(upgradeInst.REMOTE_TOKEN()).reverted;

      await expect(inst.connect(users[0]).upgradeToAndCall(BridgedEcoERC20Logic, "0x")).reverted;
      await expect(inst.upgradeToAndCall(BridgedEcoERC20Logic, "0x")).not.reverted;

      expect(await upgradeInst.REMOTE_TOKEN()).eq(ZeroAddress);
    });
  });
});
