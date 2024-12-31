import hre from "hardhat";

let chainId: bigint;

export async function getChainId() {
  chainId = chainId ?? (await hre.ethers.provider.getNetwork()).chainId
  return chainId;
}
