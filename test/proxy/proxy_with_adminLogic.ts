import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ZeroAddress } from "ethers";
import hre, { ethers } from "hardhat";

import { ERC20L2BridgedUpgradeable } from "../../typechain-types";
import { getAdminAddress, getImplAddress } from "../helper";

describe("ProxyWithAdminLogic Test", function () {
  const name = "Mintable Token";
  const symbol = "M ERC20";

  async function fixtureProxyWithAdminLogicConfig() {
    const [owner, ...users] = await hre.ethers.getSigners();

    const ERC20 = await hre.ethers.getContractFactory("EcoERC20Upgradeable");
    const erc20Logic = await ERC20.deploy();
    await erc20Logic.initEcoERC20(owner, name, symbol, 18n);

    const EcoProxyAdmin = await hre.ethers.getContractFactory("EcoProxyAdmin");
    const proxyAdminLogic = await EcoProxyAdmin.deploy(owner);

    const initData = erc20Logic.interface.encodeFunctionData("initEcoERC20", [
      owner.address,
      name,
      symbol,
      18n,
    ]);

    const EcoTUPWithAdminLogic = await hre.ethers.getContractFactory(
      "EcoTUPWithAdminLogic",
    );
    const proxy = await EcoTUPWithAdminLogic.deploy(
      proxyAdminLogic,
      erc20Logic,
      initData,
    );

    const proxyAdmin = await hre.ethers.getContractAt(
      "EcoProxyAdmin",
      await getAdminAddress(proxy),
      owner,
    );
    const inst = await hre.ethers.getContractAt(
      "EcoERC20Upgradeable",
      proxy.target,
      owner,
    );

    return {
      erc20Logic,
      proxyAdminLogic,
      proxyAdmin,
      proxy,
      inst,
      owner,
      users,
      EcoTUPWithAdminLogic,
    };
  }

  describe("Deployment", function () {
    it("ProxyWithAdminLogicAdmin check", async function () {
      const { proxyAdminLogic, owner } = await loadFixture(
        fixtureProxyWithAdminLogicConfig,
      );

      expect(await proxyAdminLogic.owner()).equal(owner);
      await expect(proxyAdminLogic.initEcoProxyAdmin(owner)).reverted;
    });

    it("ProxyWithAdminLogic check", async function () {
      const { erc20Logic, proxyAdmin, proxy } = await loadFixture(
        fixtureProxyWithAdminLogicConfig,
      );

      expect(await getAdminAddress(proxy)).equal(proxyAdmin);
      expect(await getImplAddress(proxy)).equal(erc20Logic);
    });

    it("Inst check", async function () {
      const { inst } = await loadFixture(fixtureProxyWithAdminLogicConfig);

      expect(await inst.name()).equal(name);
      expect(await inst.symbol()).equal(symbol);
    });

    it("proxy admin check: upgrade, call, calls, delcall, get/setSlot", async function () {
      const { owner, proxyAdmin, proxy, inst, users, erc20Logic } =
        await loadFixture(fixtureProxyWithAdminLogicConfig);

      const theDecimals = 6n;
      const BridgedEcoERC20 = await hre.ethers.getContractFactory(
        "ERC20L2BridgedUpgradeable",
      );
      const BridgedEcoERC20Logic = await BridgedEcoERC20.deploy();
      await BridgedEcoERC20Logic.initEcoERC20(owner, name, symbol, theDecimals);

      const upgradeInst: ERC20L2BridgedUpgradeable = BridgedEcoERC20.attach(
        inst,
      ) as ERC20L2BridgedUpgradeable;

      await expect(upgradeInst.REMOTE_TOKEN()).reverted;

      await expect(
        proxyAdmin
          .connect(users[0])
          .upgradeAndCall(proxy, BridgedEcoERC20Logic, "0x"),
      ).rejected;
      await expect(proxyAdmin.upgradeAndCall(proxy, BridgedEcoERC20Logic, "0x"))
        .not.reverted;

      expect(await upgradeInst.REMOTE_TOKEN()).eq(ZeroAddress);

      const artifact = await hre.artifacts.readArtifact(
        "ITransparentUpgradeableProxy",
      );
      const proxyInterface = new hre.ethers.Interface(artifact.abi);
      const calldata = proxyInterface.encodeFunctionData("upgradeToAndCall", [
        await erc20Logic.getAddress(),
        "0x",
      ]);

      await expect(
        proxyAdmin.connect(users[0]).functionCallWithValue(proxy, calldata, 0),
      ).reverted;
      await expect(proxyAdmin.functionCallWithValue(proxy, calldata, 0)).not
        .reverted;
      await expect(upgradeInst.REMOTE_TOKEN()).reverted;

      const ownableSlot =
        "0x9016d09d72d40fdae2fd8ceac6b6234c7706214fd39c1cd1e609a0528c199300";

      expect(await proxyAdmin.getSlot(ownableSlot)).eq(
        ethers.zeroPadValue(owner.address, 32),
      );
      await expect(
        proxyAdmin
          .connect(users[0])
          .setSlot(ownableSlot, ethers.zeroPadValue(users[0].address, 32)),
      ).reverted;
      await expect(
        proxyAdmin.setSlot(
          ownableSlot,
          ethers.zeroPadValue(users[0].address, 32),
        ),
      ).not.reverted;
      expect(await proxyAdmin.owner()).eq(users[0].address);

      const hackedProxyWithAdminLogicAdmin = proxyAdmin.connect(users[0]);

      const upgradeCalldata = proxyInterface.encodeFunctionData(
        "upgradeToAndCall",
        [await BridgedEcoERC20Logic.getAddress(), "0x"],
      );

      await expect(
        hackedProxyWithAdminLogicAdmin
          .connect(owner)
          .functionCallWithValue(proxy, upgradeCalldata, 0),
      ).reverted;

      await expect(
        hackedProxyWithAdminLogicAdmin.functionCallWithValue(
          proxy,
          upgradeCalldata,
          0,
        ),
      ).not.reverted;

      expect(await upgradeInst.REMOTE_TOKEN()).eq(ZeroAddress);

      const delegateCalldata =
        hackedProxyWithAdminLogicAdmin.interface.encodeFunctionData(
          "transferOwnership",
          [owner.address],
        );
      await expect(
        hackedProxyWithAdminLogicAdmin
          .connect(owner)
          .functionDelegateCall(
            hackedProxyWithAdminLogicAdmin,
            delegateCalldata,
          ),
      ).reverted;
      await expect(
        hackedProxyWithAdminLogicAdmin.functionDelegateCall(
          hackedProxyWithAdminLogicAdmin,
          delegateCalldata,
        ),
      ).not.reverted;
      expect(await proxyAdmin.owner()).eq(owner.address);
    });

    it("ProxyWithAdminLogic Admin call ProxyWithAdminLogic fail check", async function () {
      const { erc20Logic, EcoTUPWithAdminLogic, owner } = await loadFixture(
        fixtureProxyWithAdminLogicConfig,
      );

      const HHProxyAdminFail =
        await hre.ethers.getContractFactory("HHProxyAdminFail");
      const testProxyWithAdminLogicAdminLogic = await HHProxyAdminFail.deploy();

      const initData = erc20Logic.interface.encodeFunctionData("initEcoERC20", [
        owner.address,
        name,
        symbol,
        18n,
      ]);
      const proxy = await EcoTUPWithAdminLogic.deploy(
        testProxyWithAdminLogicAdminLogic,
        erc20Logic,
        initData,
      );

      const proxyAdmin = await hre.ethers.getContractAt(
        "HHProxyAdminFail",
        await getAdminAddress(proxy),
        owner,
      );

      const failInput = erc20Logic.interface.encodeFunctionData("name");

      await expect(proxyAdmin.command(proxy, 0, failInput)).reverted;

      const artifact = await hre.artifacts.readArtifact(
        "ITransparentUpgradeableProxy",
      );
      const proxyInterface = new hre.ethers.Interface(artifact.abi);
      const successInput = proxyInterface.encodeFunctionData(
        "upgradeToAndCall",
        [await erc20Logic.getAddress(), "0x"],
      );

      // await expect(proxyAdmin.connect(users[0]).command(proxy, 0, successInput)).not.reverted;
      await expect(proxyAdmin.command(proxy, 0, successInput)).not.reverted;
    });
  });
});
