import hre from "hardhat";

export function getSelector(contractMethod: { fragment: { selector: string } }): string {
  return hre.ethers.zeroPadBytes(contractMethod.fragment.selector, 32);
}
