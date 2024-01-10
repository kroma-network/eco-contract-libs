import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ERC20 Mintable", function () {
  const name = "Mintable Token";
  const symbol = "M ERC20";
  const decimals = 18;

  const amount = ethers.parseEther("100");

  async function NFT_Mintable_Fixture() {
    const [owner, ...users] = await ethers.getSigners();

    const ERC20 = await ethers.getContractFactory("EcoERC20MintableDecimal");
    const erc20 = await ERC20.deploy(name, symbol, decimals);
    // await erc20.initNFT_Mintable(owner.address, name, symbol); only for proxy

    return { erc20, owner, users };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { erc20, owner } = await loadFixture(NFT_Mintable_Fixture);

      expect(await erc20.owner()).to.equal(owner.address);
    });

    it("Should set the right metadata", async function () {
      const { erc20 } = await loadFixture(NFT_Mintable_Fixture);

      expect(await erc20.name()).to.equal(name);
      expect(await erc20.symbol()).to.equal(symbol);
      expect(await erc20.decimals()).to.equal(decimals);
    });
  });

  describe("Non Fungible Token", function () {
    describe("Mint", function () {
      it("Should revert with the right error if mint called from another account", async function () {
        const { erc20, users } = await loadFixture(NFT_Mintable_Fixture);
        const user_connected_nft = erc20.connect(users[0]);
        await expect(user_connected_nft.mint(users[0], amount)).reverted;
      });

      it("Shouldn't fail mint with the right owner", async function () {
        const { erc20, users } = await loadFixture(NFT_Mintable_Fixture);
        await expect(erc20.mint(users[0], amount)).not.reverted;
      });

      it("Shouldn't fail mint with the right role access account", async function () {
        const { erc20, users } = await loadFixture(NFT_Mintable_Fixture);

        const nextMintSelector = ethers.zeroPadBytes(erc20.mint.fragment.selector, 32);
        await expect(erc20.grantRole(nextMintSelector, users[0])).not.reverted;

        const user_connected_nft = erc20.connect(users[0]);
        await expect(user_connected_nft.mint(users[0], amount)).not.reverted;

        await expect(erc20.revokeRole(nextMintSelector, users[0])).not.reverted;
        await expect(user_connected_nft.mint(users[0], amount)).reverted;
      });
    });

    describe("Transfer", function () {
      it("Should revert with the right error if mint called from another account", async function () {
        const { owner, erc20, users } = await loadFixture(NFT_Mintable_Fixture);
        await expect(erc20.mint(users[0], amount)).not.reverted;
        await expect(erc20.connect(users[0]).burn(amount)).not.reverted;
        expect(await erc20.balanceOf(users[0])).equal(0);

        await expect(erc20.mint(users[0], amount)).not.reverted;
        await expect(erc20.mint(users[0], amount)).not.reverted;

        await erc20.connect(users[0]).approve(owner, ethers.MaxUint256);
        await expect(erc20.transferFrom(users[0], users[1], await erc20.balanceOf(users[0]))).not.reverted;
        await expect(erc20.transferFrom(users[0], users[1], amount)).reverted;
        await expect(erc20.connect(users[1]).transferFrom(users[1], users[0], await erc20.balanceOf(users[1])))
          .reverted;
        await erc20.connect(users[1]).approve(owner, ethers.MaxUint256);
        await expect(erc20.burnFrom(users[1], await erc20.balanceOf(users[1]))).not.reverted;
      });
    });
  });
});
