import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { getSelector } from "../../helper";

describe("NFT Mintable", function () {
  const name = "Mintable NFT";
  const symbol = "MNFT";

  async function NFT_Mintable_Fixture() {
    const [owner, admin, user0, user1] = await hre.ethers.getSigners();

    const NFT = await hre.ethers.getContractFactory("NFT_Mintable");
    const nft = await NFT.connect(owner).deploy(name, symbol);
    // await nft.initNFT_Mintable(owner.address, name, symbol); only for proxy

    // contract NFT_Mintable is
    // contract NFT_Identical is
    // contract NFT_Typed is

    return { owner, admin, user0, user1, nft };
  }

  describe("Deployment", function () {
    it("Basic Initialize", async function () {
      const { nft, owner } = await loadFixture(NFT_Mintable_Fixture);

      await expect(nft.initNFT_Mintable(owner.address, name, symbol)).reverted;

      expect(await nft.owner()).to.equal(owner.address);

      expect(await nft.name()).to.equal(name);
      expect(await nft.symbol()).to.equal(symbol);

      const erc165Factory = await hre.ethers.getContractFactory("ERC165");
      const erc165 = await erc165Factory.deploy();
      expect(await nft.supportsInterface(await erc165.erc721())).equal(true);
    });
  });

  describe("Mintable NFT", function () {
    it("owner mint", async function () {
      const { nft, user0 } = await loadFixture(NFT_Mintable_Fixture);

      await expect(nft.nextMint(user0)).not.reverted;
      await expect(nft.connect(user0).nextMint(user0)).reverted;
    });

    it("admin mint", async function () {
      const { nft, admin, user0 } = await loadFixture(NFT_Mintable_Fixture);

      await expect(nft.connect(admin).nextMint(user0)).reverted;

      await expect(nft.grantRole(getSelector(nft.nextMint), admin)).not.reverted;
      await expect(nft.connect(admin).nextMint(user0)).not.reverted;
      await expect(nft.connect(user0).nextMint(user0)).reverted;
      await expect(nft.revokeRole(getSelector(nft.nextMint), admin)).not.reverted;
    });

    describe("Transfer", function () {
      it("transfer and approve test", async function () {
        const { nft, user0, user1 } = await loadFixture(NFT_Mintable_Fixture);
        await expect(nft.nextMint(user0)).not.reverted;

        await expect(nft.connect(user1).transferFrom(user0, user1, await nft.tokenOfOwnerByIndex(user0, 0))).reverted;
        await expect(nft.connect(user0).transferFrom(user0, user1, await nft.tokenOfOwnerByIndex(user0, 0))).not
          .reverted;
        await expect(nft.connect(user0).transferFrom(user1, user0, await nft.tokenOfOwnerByIndex(user1, 0))).reverted;

        await expect(nft.connect(user1).approve(user0, await nft.tokenOfOwnerByIndex(user1, 0))).not.reverted;
        await expect(nft.connect(user0).transferFrom(user1, user0, await nft.tokenOfOwnerByIndex(user1, 0))).not
          .reverted;

        await expect(nft.nextMint(user0)).not.reverted;
        await expect(nft.nextMint(user0)).not.reverted;
        await expect(nft.nextMint(user0)).not.reverted;

        await expect(nft.connect(user1).transferFrom(user0, user1, await nft.tokenOfOwnerByIndex(user0, 0))).reverted;

        await expect(nft.connect(user0).setApprovalForAll(user1, true)).not.reverted;
        for (let i = 1; i < (await nft.balanceOf(user0)); i++) {
          await expect(nft.connect(user1).transferFrom(user0, user1, i)).not.reverted;
        }
      });
    });
  });
});
