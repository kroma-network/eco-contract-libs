import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { getSelector } from "../../helper";

import { ERC1155_Mintable_Fixture, erc1155BaseURI, unitAmount } from "./helper";

describe("ERC1155 Mintable", function () {
  const erc1155URI = erc1155BaseURI;

  const amount = unitAmount;

  const default1155Id = 0n;

  const defaultHex = "0x";

  const erc1155InterfaceId = "0x00000000"; // TODO: fix interface id

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { erc1155, owner, users} = await loadFixture(ERC1155_Mintable_Fixture);

      expect(await erc1155.owner()).to.equal(owner.address);
      await expect(erc1155.initEcoERC1155(owner, erc1155URI)).reverted;

      const erc1155IdUri = "1.json";
      expect(await erc1155.uri(0n)).to.equal(erc1155BaseURI);
      await expect(erc1155.setInitURI(erc1155URI)).not.reverted;
      await expect(erc1155.setBaseURI(erc1155URI)).not.reverted;
      await expect(erc1155.setURI(1n, erc1155IdUri)).not.reverted;

      await expect(erc1155.connect(users[0]).setInitURI(erc1155URI)).reverted;
      await expect(erc1155.connect(users[0]).setBaseURI(erc1155URI)).reverted;
      await expect(erc1155.connect(users[0]).setURI(1n, erc1155IdUri)).reverted;
    });

    it("Basic view", async function () {
      const { erc1155 } = await loadFixture(ERC1155_Mintable_Fixture);

      expect(await erc1155["totalSupply()"]()).to.equal(0n);
      expect(await erc1155["totalSupply(uint256)"](0n)).to.equal(0n);

      expect(await erc1155.exists(default1155Id)).to.equal(false); // TODO: fix interface id

      expect(await erc1155.supportsInterface(erc1155InterfaceId)).to.equal(false);

      const erc1155IdUri = "1.json";
      expect(await erc1155.uri(1n)).to.equal(erc1155URI);
      await expect(erc1155.setURI(1n, erc1155IdUri)).not.reverted;
      expect(await erc1155.uri(1n)).to.equal(erc1155URI + erc1155IdUri);
    });
  });

  describe("ERC1155 Feature", function () {
    describe("Mint", function () {
      it("Shouldn't fail mint with the right owner", async function () {
        const { erc1155, users } = await loadFixture(ERC1155_Mintable_Fixture);
        await expect(erc1155.mint(users[0], default1155Id, amount, defaultHex)).not.reverted;
        await expect(erc1155.mintBatch(users[0], [...Array(3).keys()], Array(3).fill(amount), defaultHex)).not.reverted;
        await expect(erc1155.connect(users[0]).mintBatch(users[0], [...Array(3).keys()], Array(3).fill(amount), defaultHex)).reverted;

        await expect(erc1155.pause()).not.reverted;
        await expect(erc1155.mint(users[0], default1155Id, amount, defaultHex)).reverted;
      });

      it("Should revert with the right error if mint called from another account", async function () {
        const { erc1155, users } = await loadFixture(ERC1155_Mintable_Fixture);
        const user_connected_erc1155 = erc1155.connect(users[0]);
        await expect(user_connected_erc1155.mint(users[0], default1155Id, amount, defaultHex)).reverted;
      });

      it("Shouldn't fail mint with the right role access account", async function () {
        const { erc1155, users } = await loadFixture(ERC1155_Mintable_Fixture);

        await expect(erc1155.grantSelectorRole(getSelector(erc1155.mint), users[0])).not.reverted;

        const user_connected_erc1155 = erc1155.connect(users[0]);
        await expect(user_connected_erc1155.mint(users[0], default1155Id, amount, defaultHex)).not.reverted;

        await expect(erc1155.revokeSelectorRole(getSelector(erc1155.mint), users[0])).not.reverted;
        await expect(user_connected_erc1155.mint(users[0], default1155Id, amount, defaultHex)).reverted;
      });
    });

    describe("Transfer", function () {
      it("Should revert with the right error if mint called from another account", async function () {
        const { owner, erc1155, users } = await loadFixture(ERC1155_Mintable_Fixture);
        await expect(erc1155.mint(users[0], default1155Id, amount, defaultHex)).not.reverted;
        await expect(erc1155.connect(users[0]).burn(users[0], default1155Id, amount)).not.reverted;
        expect(await erc1155.balanceOf(users[0], default1155Id)).equal(0);

        await expect(erc1155.mint(users[0], default1155Id, amount, defaultHex)).not.reverted;
        await expect(erc1155.mint(users[0], default1155Id, amount, defaultHex)).not.reverted;

        await erc1155.connect(users[0]).setApprovalForAll(owner, true);
        await expect(erc1155.safeTransferFrom(users[0], users[1], default1155Id, await erc1155.balanceOf(users[0], default1155Id), defaultHex)).not.reverted;
        await expect(erc1155.safeTransferFrom(users[0], users[1], default1155Id, amount, defaultHex)).reverted;

        await expect(erc1155.connect(users[1]).safeTransferFrom(users[1], users[0], default1155Id, await erc1155.balanceOf(users[1], default1155Id)/2n, defaultHex))
          .not.reverted; // this allowed, openzeppelin transfer imple differ from erc20
        await erc1155.connect(users[1]).setApprovalForAll(owner, true);
        await expect(erc1155.burn(users[1], default1155Id, await erc1155.balanceOf(users[1], default1155Id))).not.reverted;
      });
    });
  });
});
