import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import "./eco-tasks/utils";

import "hardhat-tracer";
import "solidity-coverage";
import "hardhat-contract-sizer";

import "./eco-tasks/namespace-slot";

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
      // chainId: 2358,
      // forking: {
      //   url: "https://api.sepolia.kroma.network/", // sepolia
      //   url: "http://apne2a-sail-proposer01.kroma.cc:8545", // sail
      //   url: "https://api.kroma.network", // kroma
      //   url: "http://20.214.181.154:8588", // kroma
      // },

      hardfork: "london",
      // base fee of 0 allows use of 0 gas price when testing
      initialBaseFeePerGas: 0,
      // brownie expects calls and transactions to throw on revert
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
    },
  },
};

export default config;
