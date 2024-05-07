import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { MaxUint256, ZeroAddress } from "ethers";
import hre from "hardhat";

import { getSelector } from "../../helper";

export const unitAmount = hre.ethers.parseEther("100");

export const erc1155BaseURI = "https://meta.kroma.network/";

export async function ERC1155_Mintable_Fixture() {
  const [owner, ...users] = await hre.ethers.getSigners();

  const ERC1155 = await hre.ethers.getContractFactory("EcoERC1155Upgradeable");
  const erc1155 = await ERC1155.deploy();
  await erc1155.initEcoERC1155(owner, erc1155BaseURI);

  return { erc1155, owner, users };
}