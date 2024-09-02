import * as chain from "./chain-list";

interface InterfaceLogicAddress {
  proxyAdmin?:string
}

export const MainnetLogicAddress: InterfaceLogicAddress = {
  proxyAdmin: undefined,
};

export const HHnetLogicAddress: InterfaceLogicAddress = {
  proxyAdmin: undefined,
};

export const DevnetLogicAddress: InterfaceLogicAddress = {
  proxyAdmin: undefined,
};

export function LogicAddress(chainId:bigint): InterfaceLogicAddress {
  return chain.isDevnet(chainId)
    ? DevnetLogicAddress
    : chain.isTestnet(chainId)
      ? TestnetLogicAddress
      : chain.isMainnet(chainId)
        ? MainnetLogicAddress
        : {proxyAdmin: undefined};
}