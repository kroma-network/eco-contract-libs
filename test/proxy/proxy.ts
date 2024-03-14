import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { getAdminAddress, getImplAddress } from "../helper";

describe("Proxy Test", function () {
  const name = "Mintable Token";
  const symbol = "M ERC20";

  async function fixtureProxyConfig() {
    const [owner, ...users] = await hre.ethers.getSigners();

    const ERC20 = await hre.ethers.getContractFactory("EcoERC20Upgradeable");
    const erc20Logic = await ERC20.deploy();
    await erc20Logic.initEcoERC20(owner, name, symbol, 18n);

    const EcoProxyAdmin = await hre.ethers.getContractFactory("EcoProxyAdmin");
    const proxyAdminLogic = await EcoProxyAdmin.deploy(owner);

    const initData = erc20Logic.interface.encodeFunctionData("initEcoERC20", [owner.address, name, symbol, 18n]);

    const EcoTUPWithAdminLogic = await hre.ethers.getContractFactory("EcoTUPWithAdminLogic");
    const proxy = await EcoTUPWithAdminLogic.deploy(proxyAdminLogic, erc20Logic, initData);

    const proxyAdmin = await hre.ethers.getContractAt("EcoProxyAdmin", await getAdminAddress(proxy), owner);
    const inst = await hre.ethers.getContractAt("EcoERC20Upgradeable", proxy.target, owner);

    return { erc20Logic, proxyAdminLogic, proxyAdmin, proxy, inst, owner, users, EcoTUPWithAdminLogic };
  }

  describe("Deployment", function () {
    it("ProxyAdmin check", async function () {
      const { proxyAdminLogic, owner } = await loadFixture(fixtureProxyConfig);

      expect(await proxyAdminLogic.owner()).equal(owner);
      await expect(proxyAdminLogic.initEcoProxyAdmin(owner)).reverted;
    });

    it("Proxy check", async function () {
      const { erc20Logic, proxyAdmin, proxy } = await loadFixture(fixtureProxyConfig);

      expect(await getAdminAddress(proxy)).equal(proxyAdmin);
      expect(await getImplAddress(proxy)).equal(erc20Logic);
    });

    it("Inst check", async function () {
      const { inst } = await loadFixture(fixtureProxyConfig);

      expect(await inst.name()).equal(name);
      expect(await inst.symbol()).equal(symbol);
    });

    it("upgrade check", async function () {
      const { owner, erc20Logic, proxyAdmin, proxy, inst, users } = await loadFixture(fixtureProxyConfig);

      const theDecimals = 6n;
      const EcoERC20 = await hre.ethers.getContractFactory("EcoERC20Upgradeable");
      const EcoERC20Logic = await EcoERC20.deploy();
      await EcoERC20Logic.initEcoERC20(owner, name, symbol, theDecimals);

      // test update, immutable decimals logic upgrade to state view return

      // expect(await erc20Logic.decimals()).equal(18);
      // expect(await inst.decimals()).equal(18);
      // expect(await EcoERC20Logic.decimals()).equal(theDecimals);

      // await expect(proxyAdmin.connect(users[0]).upgradeAndCall(proxy, EcoERC20Logic, "0x")).rejected;
      // await expect(proxyAdmin.upgradeAndCall(proxy, EcoERC20Logic, "0x")).not.reverted;

      // expect(await inst.decimals()).equal(theDecimals);
      // expect(await inst.name()).equal(name);
      // expect(await inst.symbol()).equal(symbol);
    });

    it("Proxy Admin call Proxy fail check", async function () {
      const { erc20Logic, EcoTUPWithAdminLogic, owner, users } = await loadFixture(fixtureProxyConfig);

      const TestProxyAdminFail = await hre.ethers.getContractFactory("TestProxyAdminFail");
      const testProxyAdminLogic = await TestProxyAdminFail.deploy();

      const initData = erc20Logic.interface.encodeFunctionData("initEcoERC20", [owner.address, name, symbol, 18n]);
      const proxy = await EcoTUPWithAdminLogic.deploy(testProxyAdminLogic, erc20Logic, initData);

      const proxyAdmin = await hre.ethers.getContractAt("TestProxyAdminFail", await getAdminAddress(proxy), owner);

      const failInput = erc20Logic.interface.encodeFunctionData("name");

      await expect(proxyAdmin.command(proxy, 0, failInput)).reverted;

      const artifact = await hre.artifacts.readArtifact("ITransparentUpgradeableProxy");
      const proxyInterface = new hre.ethers.Interface(artifact.abi);
      const successInput = proxyInterface.encodeFunctionData("upgradeToAndCall", [await erc20Logic.getAddress(), "0x"]);

      // await expect(proxyAdmin.connect(users[0]).command(proxy, 0, successInput)).not.reverted;
      await expect(proxyAdmin.command(proxy, 0, successInput)).not.reverted;
    });
  });
});
