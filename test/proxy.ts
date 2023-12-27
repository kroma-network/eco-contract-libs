import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { expect } from "chai";
  import { ethers } from "hardhat";
import { EcoERC20Mintable } from "../typechain-types";

describe("ERC20 Mintable", function () {
const name = "Mintable Token";
const symbol = "M ERC20";

const amount = ethers.parseEther("100");

    async function NFT_Mintable_Fixture() {
        const [owner, ...users] = await ethers.getSigners();

        const EcoProxyAdmin = await ethers.getContractFactory("EcoProxyAdmin");
        const admin = await EcoProxyAdmin.deploy(owner);

        const EcoProxyForProxyAdmin = await ethers.getContractFactory("EcoProxyForProxyAdmin");
        const pAdmin = await EcoProxyForProxyAdmin.deploy(admin, owner);

        const ERC20 = await ethers.getContractFactory("EcoERC20Mintable");
        const erc20 = await ERC20.deploy(name, symbol);


        const EcoTUPWithAdmin = await ethers.getContractFactory("EcoTUPWithAdmin");
        let inst = await EcoTUPWithAdmin.deploy(pAdmin, erc20, erc20.interface.encodeFunctionData("initEcoERC20Mintable", [owner.address, name, symbol]))
        const pErc20:EcoERC20Mintable = erc20.attach( await inst.getAddress() )

        return { owner, users, admin, pAdmin, erc20, pErc20 };
    }

    describe("Deployment", function () {
      it("Should set the right owner", async function () {
        const { pErc20, owner } = await loadFixture(NFT_Mintable_Fixture);

        expect(await pErc20.owner()).to.equal(owner.address);
      });

      it("Should set the right metadata", async function () {
        const { pErc20 } = await loadFixture(NFT_Mintable_Fixture);

        expect(await pErc20.name()).to.equal(name);
        expect(await pErc20.symbol()).to.equal(symbol);
      });
    });

    describe("Non Fungible Token", function () {
      describe("Mint", function () {
        it("Should revert with the right error if mint called from another account", async function () {
          const { pErc20, users } = await loadFixture(NFT_Mintable_Fixture);
          const user_connected_nft = pErc20.connect(users[0])
          await expect( user_connected_nft.mint(users[0], amount) ).reverted;
        });

        it("Shouldn't fail mint with the right owner", async function () {
          const { pErc20, users } = await loadFixture(NFT_Mintable_Fixture);
          await expect( pErc20.mint(users[0], amount) ).not.reverted;
        });

        it("Shouldn't fail mint with the right role access account", async function () {
          const { pErc20, users } = await loadFixture(NFT_Mintable_Fixture);

          const nextMintSelector = ethers.zeroPadBytes(pErc20.mint.fragment.selector, 32)
          await expect( pErc20.grantRole(nextMintSelector, users[0]) ).not.reverted;

          const user_connected_nft = pErc20.connect(users[0])
          await expect( user_connected_nft.mint(users[0], amount) ).not.reverted;

          await expect( pErc20.revokeRole(nextMintSelector, users[0]) ).not.reverted;
          await expect( user_connected_nft.mint(users[0], amount) ).reverted;
        });
      });

      describe("Transfer", function () {
        it("Should revert with the right error if mint called from another account", async function () {
          const { owner, pErc20, users } = await loadFixture(NFT_Mintable_Fixture);
          await expect( pErc20.mint(users[0], amount) ).not.reverted;

          await pErc20.connect(users[0]).approve(owner, ethers.MaxUint256);
          await expect( pErc20.transferFrom(users[0], users[1], await pErc20.balanceOf(users[0])) ).not.reverted;
          await expect( pErc20.transferFrom(users[0], users[1], amount) ).reverted;
          await expect( pErc20.connect(users[1]).transferFrom(users[1], users[0], await pErc20.balanceOf(users[1])) ).reverted;
          await pErc20.connect(users[1]).approve(owner, ethers.MaxUint256);
          await expect( pErc20.transferFrom(users[1], users[0], await pErc20.balanceOf(users[1])) ).not.reverted;
        });
      });
    });
});
