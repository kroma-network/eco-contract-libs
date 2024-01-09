import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("NFT Typed", function () {
  const name = "Typed NFT";
  const symbol = "TNFT";

  async function NFT_Typed_Fixture() {
    const [owner, admin, user0, user1] = await hre.ethers.getSigners();

    const NFT = await hre.ethers.getContractFactory("NFT_Typed");
    const nft = await NFT.connect(owner).deploy(name, symbol);
    // await nft.initNFT_Mintable(owner.address, name, symbol); only for proxy

    return { owner, admin, user0, user1, nft };
  }

  describe("Deployment", function () {
    it("Basic Initialize", async function () {
      const { nft, owner } = await loadFixture(NFT_Typed_Fixture);

      await expect(nft.initNFT_Mintable(owner.address, name, symbol)).reverted;

      expect(await nft.owner()).to.equal(owner.address);

      expect(await nft.name()).to.equal(name);
      expect(await nft.symbol()).to.equal(symbol);

      const erc165Factory = await hre.ethers.getContractFactory("ERC165");
      const erc165 = await erc165Factory.deploy();
      expect(await nft.supportsInterface(await erc165.erc721())).equal(true);
    });
  });

  describe("Mint", function () {
    it("Typed mint", async function () {
      const { nft, user0 } = await loadFixture(NFT_Typed_Fixture);

      const typeURIs = ["type 0", "type 1", "type 2"];

      for (let i = 0; i < typeURIs.length; i++) {
        await expect(nft.typedMint(user0, i)).reverted;
        await expect(nft.setTypeURI(i, "")).reverted;
        await expect(nft.connect(user0).setTypeURI(i, typeURIs[i])).reverted;
        await expect(nft.connect(user0).typedMint(user0, i)).reverted;

        await expect(nft.setTypeURI(i, typeURIs[i])).not.reverted;
      }

      for (let i = 0; i < typeURIs.length; i++) {
        await expect(nft.typedMint(user0, i)).not.reverted;
      }

      for (let i = 0; i < typeURIs.length; i++) {
        expect(await nft.tokenType(i + 1)).equal(i);
        expect(await nft.tokenURI(i + 1)).equal(typeURIs[i]);
        await expect(nft.connect(user0).setTokenType(i + 1, 0)).reverted;
        await expect(nft.setTokenType(i + 1, 0)).not.reverted;
      }
    });

    it("Next mint", async function () {
      const { nft, user0 } = await loadFixture(NFT_Typed_Fixture);

      await expect(nft.nextMint(user0)).reverted;
    });
  });
});
