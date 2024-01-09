import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("NFT Identical", function () {
  const name = "Typed NFT";
  const symbol = "TNFT";

  async function NFT_Identical_Fixture() {
    const [owner, admin, user0, user1] = await hre.ethers.getSigners();

    const NFT = await hre.ethers.getContractFactory("NFT_Identical");
    const nft = await NFT.connect(owner).deploy(name, symbol);
    // await nft.initNFT_Mintable(owner.address, name, symbol); only for proxy

    return { owner, admin, user0, user1, nft };
  }

  describe("Deployment", function () {
    it("Basic Initialize", async function () {
      const { nft, owner } = await loadFixture(NFT_Identical_Fixture);

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
      const { nft, user0 } = await loadFixture(NFT_Identical_Fixture);

      const nftAmount = 3;

      for (let i = 0; i < nftAmount; i++) {
        await expect(nft.nextMint(user0)).not.reverted;
      }

      const tokenId = 1;

      const identicalURI = "defaultTokenURI";
      await expect(nft.connect(user0).setBaseURI(identicalURI)).reverted;
      await expect(nft.setBaseURI(identicalURI)).not.reverted;
      expect(await nft.tokenURI(tokenId)).equal(identicalURI);

      const differentURI = "defaultTokenURI/";
      await expect(nft.connect(user0).setBaseURI(differentURI)).reverted;
      await expect(nft.setBaseURI(differentURI)).not.reverted;
      expect(await nft.tokenURI(tokenId)).equal(differentURI + tokenId.toString());
    });
  });
});
