import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { getSelector } from "../helper";

describe("Bridged ERC20", function () {
  const name = "Bridged ERC20";
  const symbol = "B ERC20";
  const decimals = 18;

  const amount = hre.ethers.parseEther("100");

  async function NFT_Mintable_Fixture() {
    const [owner, remoteToken, bridge, ...users] = await hre.ethers.getSigners();

    const L2ERC20 = await hre.ethers.getContractFactory("ERC20L2BridgedUpgradeable");
    const erc20 = await L2ERC20.deploy();
    await erc20.initERC20L2Bridged(owner, name, symbol, decimals, remoteToken, bridge);

    return { erc20, owner, remoteToken, bridge, users };
  }

  describe("Deployment", function () {
    it("Check init", async function () {
      const { erc20, owner, remoteToken, bridge } = await loadFixture(NFT_Mintable_Fixture);

      await expect(erc20.initERC20L2Bridged(owner, name, symbol, decimals, remoteToken, bridge)).reverted;
    });

    it("Check init data", async function () {
      const { erc20, owner, remoteToken, bridge } = await loadFixture(NFT_Mintable_Fixture);

      expect(await erc20.owner()).to.equal(owner.address);

      expect(await erc20.name()).to.equal(name);
      expect(await erc20.symbol()).to.equal(symbol);
      expect(await erc20.decimals()).to.equal(decimals);

      expect(await erc20.REMOTE_TOKEN()).to.equal(remoteToken);
      expect(await erc20.BRIDGE()).to.equal(bridge);
    });
  });

  describe("Bridged ERC20", function () {
    describe("Mint", function () {
      it("mint", async function () {
        const { erc20, owner, remoteToken, bridge, users } = await loadFixture(NFT_Mintable_Fixture);

        const amountBig = 1000000n;
        const amount = 10000n;

        await expect(erc20.connect(users[0]).mint(users[0], amount)).reverted;
        await expect(erc20.mint(users[0], amount)).not.reverted;
        await expect(erc20.connect(bridge).mint(users[0], amount)).not.reverted;
      });

      it("Shouldn't fail mint with the right role access account", async function () {
        const { erc20, users } = await loadFixture(NFT_Mintable_Fixture);

        await expect(erc20.grantSelectorRole(getSelector(erc20.mint), users[0])).not.reverted;

        const user_connected_nft = erc20.connect(users[0]);
        await expect(user_connected_nft.mint(users[0], amount)).not.reverted;

        await expect(erc20.revokeSelectorRole(getSelector(erc20.mint), users[0])).not.reverted;
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

        await erc20.connect(users[0]).approve(owner, hre.ethers.MaxUint256);
        await expect(erc20.transferFrom(users[0], users[1], await erc20.balanceOf(users[0]))).not.reverted;
        await expect(erc20.transferFrom(users[0], users[1], amount)).reverted;
        await expect(erc20.connect(users[1]).transferFrom(users[1], users[0], await erc20.balanceOf(users[1])))
          .reverted;
        await erc20.connect(users[1]).approve(owner, hre.ethers.MaxUint256);
        await expect(erc20.burnFrom(users[1], await erc20.balanceOf(users[1]))).not.reverted;
      });
    });
  });
});
