import { expect } from "chai";
import { ZeroAddress } from "ethers";
import { ethers } from "hardhat";

import { erc20Decimals, erc20Name, erc20Symbol } from "./helper";

describe("ERC20 Coverage", function () {
  const name = erc20Name;
  const symbol = erc20Symbol;
  const decimals = erc20Decimals;

  const zeroInterfaceId = "0x00000000";

  describe("EcoERC20MintableUpgradeable", function () {
    it("Eco ERC20 Mintable Coverage(revert)", async function () {
      const factory = await ethers.getContractFactory("TestEcoERC20MintableUpgradeable");
      const erc20 = await factory.deploy();
      await expect(erc20.testInitEcoERC20Mintable(ZeroAddress, name, symbol, decimals)).reverted;
    });
  });

  describe("ERC20MetadataUpgradeable", function () {
    it("ERC20 Metadata Coverage(revert)", async function () {
      const factory = await ethers.getContractFactory("TestERC20MetadataUpgradeable");
      const erc20 = await factory.deploy();
      await expect(erc20.initEcoERC20Metadata(name, symbol, decimals)).reverted;
    });
  });

  describe("EcoERC4626Upgradeable", function () {
    it("ERC4626 Coverage(revert)", async function () {
      const factory = await ethers.getContractFactory("TestEcoERC4626Upgradeable");
      const erc20 = await factory.deploy();
      await expect(erc20.testInitEcoERC4626(ZeroAddress, name, symbol)).reverted;
    });
  });

  describe("ERC20RebasedUpgradeable", function () {
    it("ERC20 Rebased Coverage(revert and virtual)", async function () {
      const factory = await ethers.getContractFactory("TestERC20RebasedUpgradeable");
      const erc20 = await factory.deploy();
      await expect(erc20.testVirtual()).not.reverted;
      await expect(erc20.testInitERC20Rebased(ZeroAddress)).reverted;
    });
  });

  describe("ERC20L2BridgedUpgradeable", function () {
    it("ERC20 L2 Bridged Coverage(view interface Id)", async function () {
      const factory = await ethers.getContractFactory("ERC20L2BridgedUpgradeable");
      const erc20 = await factory.deploy();
      const IKromaBridge_interfaceId = "0x30a0c5a9";
      const IAccessControlEnumerable_interfaceId = "0x5a05180f";

      expect(await erc20.supportsInterface(zeroInterfaceId)).eq(false);
      expect(await erc20.supportsInterface(IKromaBridge_interfaceId)).eq(true);
      expect(await erc20.supportsInterface(IAccessControlEnumerable_interfaceId)).eq(true);
    });
  });
});