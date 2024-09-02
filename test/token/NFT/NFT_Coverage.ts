import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ZeroAddress } from "ethers";
import hre, { ethers } from "hardhat";

import { getSelector } from "../../helper";

describe("NFT Coverage", function () {
  const name = "Coverage NFT";
  const symbol = "CNFT";
  const baseURI = "https://test.com/";

  async function NFT_SeqMintable_Fixture() {
    const [owner, admin, user0, user1] = await hre.ethers.getSigners();

    const NFT = await hre.ethers.getContractFactory("HH_NFT_SeqMintable");
    const nft = await NFT.connect(owner).deploy();
    await nft.initNFT_SeqMintable(owner.address, name, symbol);

    return { owner, admin, user0, user1, nft };
  }

  it("NFT_SeqMintable (init revert)", async function () {
    const [owner, admin, user0, user1] = await hre.ethers.getSigners();
    const NFT = await hre.ethers.getContractFactory("NFT_SeqMintable");
    const nft = await NFT.connect(owner).deploy();
    await expect(nft.initNFT_SeqMintable(owner.address, name, symbol)).reverted;
  });

  it("EcoERC721Base(view)", async function () {
    const { nft, user0, user1 } = await loadFixture(NFT_SeqMintable_Fixture);

    const tokenId = await nft.nextMintId();
    await expect(nft.nextMint(user0)).not.reverted;
    expect(await nft.tokenURI(tokenId)).eq(baseURI + tokenId + ".json");
  });

  it("EcoERC721URIStorage (view & set)", async function () {
    const { nft, user0, user1 } = await loadFixture(NFT_SeqMintable_Fixture);

    expect(await nft.getBaseURI()).eq(baseURI);

    const tokenId = await nft.nextMintId();
    await expect(nft.nextMint(user0)).not.reverted;
    expect(await nft.tokenURI(tokenId)).eq(baseURI + tokenId + ".json");

    const extraURIPath = "extra/path/";
    await expect(nft.setTokenURI(tokenId, extraURIPath + tokenId)).not.reverted;
    await expect(nft.connect(user0).setTokenURI(tokenId, extraURIPath + tokenId)).reverted;
    expect(await nft.tokenURI(tokenId)).eq(baseURI + extraURIPath + tokenId + ".json");
  });

  it("NFT_SeqMintableIdenticalURI (view & set)", async function () {
    const { owner, nft, user0, user1 } = await loadFixture(NFT_SeqMintable_Fixture);

    const seqIdentical = await (await ethers.getContractFactory("HH_NFT_SeqMintableIdenticalURI")).deploy();
    await expect(seqIdentical.initNFT_SeqMintable(
      owner,
      "SeqMintableIdenticalURI",
      "SMIURI"
    )).not.reverted;

    const tokenId = await seqIdentical.nextMintId();
    await expect(seqIdentical.nextMint(user0)).not.reverted;
    expect(await seqIdentical.tokenURI(tokenId)).eq(baseURI + "metadata.json");

    await expect(seqIdentical.setTokenURI(tokenId, "")).reverted;
    expect(await seqIdentical.supportsInterface("0x00000000")).eq(false);
    await expect(seqIdentical.connect(user0).burn(tokenId)).not.reverted;
  });

  it("EcoERC721SequencialQueryable", async function () {
    const { nft, user0, user1 } = await loadFixture(NFT_SeqMintable_Fixture);

    const len = 10;

    const tokenIds = Array(len);

    for (let i = 0; i < 10; i++) {
      tokenIds[i] = await nft.nextMintId();
      await expect(nft.nextMint(user0)).not.reverted;
    }

    expect(await nft.tokensOfOwner(user0)).deep.equal(tokenIds);
    expect(await nft.tokensOfOwnerIn(user0, 1, len + 1)).deep.equal(tokenIds);

    expect(await nft.tokensOfOwnerIn(user0, 1, len + 2)).deep.equal(tokenIds);

    await expect(nft.tokensOfOwnerIn(user0, len + 1, 1)).reverted;

    expect(await nft.tokensOfOwnerIn(user1, 1, len + 1)).deep.equal([]);

    // for coverage
    await expect(nft.nextMintBatch(user1, len)).not.reverted;
    expect(await nft.tokensOfOwnerIn(user0, len - 5, len + 5)).deep.equal([10n, 9n, 8n, 7n, 5n, 6n]);
    expect(await nft.tokensOfOwnerIn(user1, len - 5, len + 5)).deep.equal([11n, 12n, 13n, 14n, 15n]);
  });

  it("SBT (view)", async function () {
    const [owner, admin, user0, user1] = await hre.ethers.getSigners();
    const SBT = await hre.ethers.getContractFactory("HH_SBT");
    const sbt = await SBT.connect(owner).deploy();
    await sbt.initNFT_SeqMintable(owner.address, name, symbol);

    const tokenId = await sbt.nextMintId();
    await expect(sbt.nextMint(user0)).not.reverted;
    expect(await sbt.tokenURI(tokenId)).eq(baseURI + tokenId + ".json");
  });

  it("ERC721Receiver", async function () {
    const { nft, user0, user1 } = await loadFixture(NFT_SeqMintable_Fixture);

    const factory = await ethers.getContractFactory("HHERC721Receiver");
    const receiver_contract = await factory.deploy();

    expect(await receiver_contract.onERC721Received(ZeroAddress, ZeroAddress, 0, "0x")).eq("0x150b7a02");
    await expect(nft.nextMint(receiver_contract)).not.reverted;
  });
});
