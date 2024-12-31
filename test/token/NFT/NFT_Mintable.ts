import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { getSelector } from "../../helper";

describe("NFT Mintable", function () {
  const name = "Mintable NFT";
  const symbol = "MNFT";

  async function NFT_SeqMintable_Fixture() {
    const [owner, admin, user0, user1] = await hre.ethers.getSigners();

    const NFT = await hre.ethers.getContractFactory("HH_NFT_Mintable");
    const nft = await NFT.connect(owner).deploy();
    await nft.initNFTMintableBase(owner.address, name, symbol);

    return { owner, admin, user0, user1, nft };
  }

  describe("Deployment", function () {
    it("Basic Initialize", async function () {
      const { nft, owner } = await loadFixture(NFT_SeqMintable_Fixture);

      await expect(nft.initNFTMintableBase(owner.address, name, symbol))
        .reverted;

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
      const { nft, user0 } = await loadFixture(NFT_SeqMintable_Fixture);

      await expect(nft.mint(user0, 0)).not.reverted;
      await expect(nft.connect(user0).mint(user0, 0)).reverted;
      await expect(nft.connect(user0).mint(user0, 1)).reverted;
    });

    it("admin mint", async function () {
      const { nft, admin, user0 } = await loadFixture(NFT_SeqMintable_Fixture);

      await expect(nft.connect(user0).mint(user0, 0)).reverted;
      await expect(nft.connect(admin).mint(user0, 0)).reverted;

      await expect(nft.grantSelectorRole(getSelector(nft.mint), admin)).not
        .reverted;
      await expect(nft.connect(user0).mint(user0, 0)).reverted;

      await expect(nft.connect(admin).mint(user0, 0))
        .emit(nft, "Transfer")
        .withArgs(hre.ethers.ZeroAddress, user0, 0);

      await expect(nft.revokeSelectorRole(getSelector(nft.mint), admin)).not
        .reverted;
      await expect(nft.connect(user0).mint(user0, 0)).reverted;
      await expect(nft.connect(admin).mint(user0, 0)).reverted;
    });

    it("random mint", async function () {
      const { nft, admin, user0 } = await loadFixture(NFT_SeqMintable_Fixture);

      expect(await nft.totalSupply()).eq(0);
      await expect(nft.mints(user0, [1, 3, 5, 7])).not.reverted;
      expect(await nft.totalSupply()).eq(4);

      await expect(nft.tokensOfOwnerIn(user0, 9, 1)).reverted;
      expect(await nft.tokensOfOwnerIn(user0, 1, 9)).deep.eq([1, 3, 5, 7]);
      expect(await nft.tokensOfOwnerIn(user0, 2, 6)).deep.eq([5, 3]);
      expect(await nft.tokensOfOwner(user0)).deep.eq([1, 3, 5, 7]);
    });

    it("mint, uri, burn", async function () {
      const { nft, admin, user0 } = await loadFixture(NFT_SeqMintable_Fixture);

      expect(await nft.totalSupply()).eq(0);
      await expect(nft.mint(user0, 0)).not.reverted;
      expect(await nft.tokenURI(0)).eq("https://test.com/0.json");
      await expect(nft.connect(user0).burn(0)).not.reverted;
    });
  });
});
