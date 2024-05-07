import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { MaxUint256, ZeroAddress } from "ethers";
import hre from "hardhat";

import { getSelector } from "../../helper";

export const erc20Name = "Mintable Token";
export const erc20Symbol = "M ERC20";
export const erc20Decimals = 18;

export const unitAmount = hre.ethers.parseEther("100");

export async function ERC20_Mintable_Fixture() {
  const [owner, ...users] = await hre.ethers.getSigners();

  const ERC20 = await hre.ethers.getContractFactory("EcoERC20Upgradeable");
  const erc20 = await ERC20.deploy();
  await erc20.initEcoERC20(owner, erc20Name, erc20Symbol, erc20Decimals);

  return { erc20, owner, users };
}

export const erc20RebasedNativeName = "Rebase Native Token";
export const erc20RebasedNativeSymbol = "M ERC20";

export async function ERC20_Rebase_Native_Base_Fixture() {
  const [owner, ...users] = await hre.ethers.getSigners();

  const ERC20 = await hre.ethers.getContractFactory("EcoERC20RebasedWithNative");
  const erc20Rebased = await ERC20.deploy();

  return { erc20Rebased, owner, users };
}

export async function ERC20_Rebase_Native_Fixture() {
  const { erc20Rebased, owner, users } = await loadFixture(ERC20_Rebase_Native_Base_Fixture);

  await erc20Rebased.initEcoERC20Rebase(ZeroAddress, erc20RebasedNativeName, erc20RebasedNativeSymbol, erc20Decimals);

  return { erc20Rebased, owner, users };
}

export const erc20RebasedTokenName = "Rebase Token";
export const erc20RebasedTokenSymbol = "M ERC20";

export async function ERC20_Rebase_Token_Base_Fixture() {
  const [owner, ...users] = await hre.ethers.getSigners();

  const ERC20underlying = await hre.ethers.getContractFactory("EcoERC20Upgradeable");
  const erc20Underlying = await ERC20underlying.deploy();
  await expect(erc20Underlying.initEcoERC20(owner, erc20RebasedTokenName, erc20RebasedTokenSymbol, erc20Decimals)).not.reverted;

  const ERC20Rebased = await hre.ethers.getContractFactory("EcoERC20RebasedWithToken");
  const erc20Rebased = await ERC20Rebased.deploy();

  return { erc20Underlying, erc20Rebased, owner, users };
}

export async function ERC20_Rebase_Token_Fixture() {
  const { erc20Underlying, erc20Rebased, owner, users } = await loadFixture(ERC20_Rebase_Token_Base_Fixture);

  await expect(erc20Rebased.initEcoERC20Rebase(erc20Underlying, erc20RebasedTokenName, erc20RebasedTokenSymbol, erc20Decimals)).not.reverted;

  await expect(erc20Underlying.mint(owner, 10n*unitAmount)).not.reverted;
  await expect(erc20Underlying.approve(erc20Rebased, MaxUint256)).not.reverted;
  await Promise.all(users.slice(0, 4).map(user => expect(erc20Underlying.mint(user, 10n*unitAmount)).not.reverted));
  await Promise.all(users.slice(0, 4).map(user => expect(erc20Underlying.connect(user).approve(erc20Rebased, MaxUint256)).not.reverted));

  return { erc20Underlying, erc20Rebased, owner, users };
}

export const erc4626TokenName = "Rebase Token";
export const erc4626TokenSymbol = "M ERC20";

export async function ERC4626_with_Token_Fixture() {
  const { erc20, owner, users } = await loadFixture(ERC20_Mintable_Fixture);

  const ERC4626Token = await hre.ethers.getContractFactory("EcoERC4626Upgradeable");
  const erc4626Token = await ERC4626Token.deploy();
  await expect(erc4626Token.initEcoERC4626(erc20, erc4626TokenName, erc4626TokenSymbol)).not.reverted;

  await expect(erc20.mint(owner, 10n*unitAmount)).not.reverted;
  await expect(erc20.approve(erc4626Token, MaxUint256)).not.reverted;
  await Promise.all(users.slice(0, 4).map(user => expect(erc20.mint(user, 10n*unitAmount)).not.reverted));
  await Promise.all(users.slice(0, 4).map(user => expect(erc20.connect(user).approve(erc4626Token, MaxUint256)).not.reverted));

  return { erc4626Token, erc20, owner, users };
}