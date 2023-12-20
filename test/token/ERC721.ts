import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("NFT Mintable", function () {
  const name = "Mintable NFT";
  const symbol = "MNFT";

  async function NFT_Mintable_Fixture() {
    const [owner, ...users] = await ethers.getSigners();

    const NFT = await ethers.getContractFactory("NFT_Mintable");
    const nft = await NFT.deploy();
    await nft.__NFT_Mintable_init(owner.address, name, symbol);

    return { nft, owner, users };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { nft, owner } = await loadFixture(NFT_Mintable_Fixture);

      expect(await nft.owner()).to.equal(owner.address);
    });

    it("Should set the right metadata", async function () {
      const { nft } = await loadFixture(NFT_Mintable_Fixture);

      expect(await nft.name()).to.equal(name);
      expect(await nft.symbol()).to.equal(symbol);
    });
  });

  describe("Non Fungible Token", function () {
    describe("Mint", function () {
      it("Should revert with the right error if mint called from another account", async function () {
        const { nft, users } = await loadFixture(NFT_Mintable_Fixture);
        const user_connected_nft = nft.connect(users[0])
        await expect( user_connected_nft.nextMint(users[0]) ).reverted;
      });

      it("Shouldn't fail mint with the right owner", async function () {
        const { nft, users } = await loadFixture(NFT_Mintable_Fixture);
        await expect( nft.nextMint(users[0]) ).not.reverted;
      });

      it("Shouldn't fail mint with the right role access account", async function () {
        const { nft, users } = await loadFixture(NFT_Mintable_Fixture);

        const nextMintSelector = ethers.zeroPadBytes(nft.nextMint.fragment.selector, 32)
        await expect( nft.grantRole(nextMintSelector, users[0]) ).not.reverted;

        const user_connected_nft = nft.connect(users[0])
        await expect( user_connected_nft.nextMint(users[0]) ).not.reverted;

        await expect( nft.revokeRole(nextMintSelector, users[0]) ).not.reverted;
        await expect( user_connected_nft.nextMint(users[0]) ).reverted;
      });
    });

    describe("Transfer", function () {
      it("Should revert with the right error if mint called from another account", async function () {
        const { nft, users } = await loadFixture(NFT_Mintable_Fixture);
        await expect( nft.nextMint(users[0]) ).not.reverted;

        const user_connected_nft = nft.connect(users[0])
        await expect( user_connected_nft.transferFrom(users[0], users[1], 1) ).not.reverted;
        await expect( user_connected_nft.transferFrom(users[0], users[1], 1) ).reverted;
        await expect( nft.connect(users[1]).transferFrom(users[1], users[0], 1) ).not.reverted;
      });
    });
  });
});
