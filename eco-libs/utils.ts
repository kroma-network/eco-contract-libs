import { ethers } from "hardhat";

export async function getTimestamp(): Promise<number> {
  return (await ethers.provider.getBlock("latest"))?.timestamp as number;
}
