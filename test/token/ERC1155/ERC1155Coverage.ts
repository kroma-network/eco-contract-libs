import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ZeroAddress } from "ethers";
import { ethers } from "hardhat";

import { getSelector } from "../../helper";

import { ERC1155_Mintable_Fixture, erc1155BaseURI, unitAmount } from "./helper";

describe("ERC1155 Coverage", function () {
  const mockInterfaceId = "0x00000000";

  describe("ERC1155Pausable Coverage(Revert)", function () {
    it("ERC1155Pausable onlyInitializing: revert NotInitializing", async function () {
      const [owner, ...users] = await ethers.getSigners();
      const erc1155PausableFactory = await ethers.getContractFactory("HHERC1155PausableUpgradeable");
      const erc1155Pausable = await erc1155PausableFactory.deploy();

      await expect(erc1155Pausable.ERC1155Pausable_init()).reverted;
      await expect(erc1155Pausable.ERC1155Pausable_init_unchained()).reverted;
    });
  });

  describe("ERC1155URIStorage Coverage(Revert)", function () {
    it("ERC1155Pausable onlyInitializing: revert NotInitializing", async function () {
      const [owner, ...users] = await ethers.getSigners();
      const erc1155URIStorageFactory = await ethers.getContractFactory("HHEcoERC1155URIControl");
      const erc1155URIStorage = await erc1155URIStorageFactory.deploy();

      await expect(erc1155URIStorage.EcoERC1155URIControl_init()).reverted;
    });
  });

  describe("ERC1155 Receiver Coverage", function () {
    it("ERC1155 Receiver Receiving Token", async function () {
      const { erc1155, owner, users} = await loadFixture(ERC1155_Mintable_Fixture);
      const erc1155ReceiverFactory = await ethers.getContractFactory("HHERC1155Receiver");
      const erc1155Receiver = await erc1155ReceiverFactory.deploy();
      await expect(erc1155.mint(erc1155, 0, 1, "0x")).reverted;
      await expect(erc1155.mint(erc1155Receiver, 0, 1, "0x")).not.reverted;

    });

    it("ERC1155 Receiver Simple View", async function () {
      const erc1155ReceiverFactory = await ethers.getContractFactory("HHERC1155Receiver");
      const erc1155Receiver = await erc1155ReceiverFactory.deploy();

      const erc1155ReceiverInterfaceId = await erc1155Receiver.IERC1155ReceiverInterfaceId();

      expect(await erc1155Receiver.supportsInterface(mockInterfaceId)).eq(false);
      expect(await erc1155Receiver.supportsInterface(erc1155ReceiverInterfaceId)).eq(true);

      expect(await erc1155Receiver.onERC1155Received(
        ZeroAddress,
        ZeroAddress,
        0,
        0,
        "0x"
      )).eq("0xf23a6e61");
      expect(await erc1155Receiver.onERC1155BatchReceived(
        ZeroAddress,
        ZeroAddress,
        [],
        [],
        "0x"
      )).eq("0xbc197c81");
    });
  });
});
