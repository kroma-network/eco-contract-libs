import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { getSelector } from "../helper";

describe("ERC1155 Mintable", function () {
  const baseURI = "https://this.is.base.uri/";
  const amount = hre.ethers.parseEther("100");

  const default1155Id = 0;

  async function NFT_Mintable_Fixture() {
    const [owner, ...users] = await hre.ethers.getSigners();

    const ERC1155 = await hre.ethers.getContractFactory("EcoERC1155Upgradeable");
    const erc1155 = await ERC1155.deploy();
    await erc1155.initEcoERC1155(owner, baseURI);

    return { erc1155, owner, users };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { erc1155, owner } = await loadFixture(NFT_Mintable_Fixture);

      expect(await erc1155.owner()).to.equal(owner.address);
      await expect(erc1155.initEcoERC1155(owner, baseURI)).reverted;
    });

    it("Should set the right metadata", async function () {
      const { erc1155 } = await loadFixture(NFT_Mintable_Fixture);

      expect(await erc1155.uri(0)).to.equal(baseURI);
    });
  });

  describe("ERC1155 Feature", function () {
    describe("Mint", function () {
      it("Should revert with the right error if mint called from another account", async function () {
        const { erc1155, users } = await loadFixture(NFT_Mintable_Fixture);
        const user_connected_nft = erc1155.connect(users[0]);
        await expect(user_connected_nft.mint(users[0], default1155Id, amount, "0x")).reverted;
      });

      it("Shouldn't fail mint with the right owner", async function () {
        const { erc1155, users } = await loadFixture(NFT_Mintable_Fixture);
        await expect(erc1155.mint(users[0], default1155Id, amount, "0x")).not.reverted;
      });

      it("Shouldn't fail mint with the right role access account", async function () {
        const { erc1155, users } = await loadFixture(NFT_Mintable_Fixture);

        await expect(erc1155.grantSelectorRole(getSelector(erc1155.mint), users[0])).not.reverted;

        const user_connected_nft = erc1155.connect(users[0]);
        await expect(user_connected_nft.mint(users[0], default1155Id, amount, "0x")).not.reverted;

        await expect(erc1155.revokeSelectorRole(getSelector(erc1155.mint), users[0])).not.reverted;
        await expect(user_connected_nft.mint(users[0], default1155Id, amount, "0x")).reverted;
      });
    });

    describe("Transfer", function () {
      it("Should revert with the right error if mint called from another account", async function () {
        const { owner, erc1155, users } = await loadFixture(NFT_Mintable_Fixture);
        await expect(erc1155.mint(users[0], default1155Id, amount, "0x")).not.reverted;
        await expect(erc1155.connect(users[0]).burn(users[0], default1155Id, amount)).not.reverted;
        expect(await erc1155.balanceOf(users[0], default1155Id)).equal(0);

        await expect(erc1155.mint(users[0], default1155Id, amount, "0x")).not.reverted;
        await expect(erc1155.mint(users[0], default1155Id, amount, "0x")).not.reverted;

        await erc1155.connect(users[0]).setApprovalForAll(owner, true);
        await expect(erc1155.safeTransferFrom(users[0], users[1], default1155Id, await erc1155.balanceOf(users[0], default1155Id), "0x")).not.reverted;
        await expect(erc1155.safeTransferFrom(users[0], users[1], default1155Id, amount, "0x")).reverted;

        await expect(erc1155.connect(users[1]).safeTransferFrom(users[1], users[0], default1155Id, await erc1155.balanceOf(users[1], default1155Id)/2n, "0x"))
          .not.reverted; // this allowed, openzeppelin transfer imple differ from erc20
        await erc1155.connect(users[1]).setApprovalForAll(owner, true);
        await expect(erc1155.burn(users[1], default1155Id, await erc1155.balanceOf(users[1], default1155Id))).not.reverted;
      });
    });
  });
});
