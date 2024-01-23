import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import "./tasks/utils";

import "hardhat-tracer";
import "solidity-coverage";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.22",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000000,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      hardfork: "london",
      // base fee of 0 allows use of 0 gas price when testing
      initialBaseFeePerGas: 0,
      // brownie expects calls and transactions to throw on revert
      throwOnTransactionFailures: true,
      throwOnCallFailures: true
    }
  }
};

export default config;
