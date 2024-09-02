import * as chain from "./chain-list";

interface InterfaceAuthorizedAddress {
  wek_signer?: string;
  wek_fee?: string;

  oracle_feeder?: string;

  kgh_vault?: string;
  kgh_premint?: string;

  galaxeQuest?: string;

  questMasterVault?: string;
  questMasterSigner?: string;
}

export const MainnetAuthorizedAddress: InterfaceAuthorizedAddress = {
  oracle_feeder: "0xbb8A213b847C316B387CDF643d5Aa2f451c5cFc6",

  galaxeQuest: "0x1f9F76D4465B6Be61c84D068ec0Ce599A3F67145",

  questMasterVault: "0x83A0Cde8ED986A080Bfee9a6c466098a60882758",
  questMasterSigner: "0xcB9E7b777a7dEE9fC460Cde767898FdCE9800119",
  kgh_vault: "0xB83F38bF7aB3Df8121846a611F97775400212a09",
};

export const HHnetAuthorizedAddress: InterfaceAuthorizedAddress = {
  oracle_feeder: "0xfFf95F4bD1D4521927aFb8E6757E7E9bf6851045",

  galaxeQuest: "0x994AAf2Ab13270B66f4824283264b5Fd02ddaFe8",

  questMasterVault: "0x35e324007188C692795f9Ce5a7B781dcAA7B07e3",
  questMasterSigner: "0xE5467B25FA484887206aDEa844fe121d27238DF2",
};

export const DevnetAuthorizedAddress: InterfaceAuthorizedAddress = {
  oracle_feeder: undefined,
};

export function AuthorizedAddress(chainId: bigint): InterfaceAuthorizedAddress {
  return chain.isDevnet(chainId)
    ? DevnetAuthorizedAddress
    : chain.isTestnet(chainId)
      ? TestnetAuthorizedAddress
      : chain.isMainnet(chainId)
        ? MainnetAuthorizedAddress
        : (undefined as unknown as InterfaceAuthorizedAddress);
}
