import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import "./eco-tasks/utils";

import "hardhat-tracer";
import "solidity-coverage";
import "hardhat-contract-sizer";

import "./eco-tasks/namespace-slot";
const { ALCHEMY_ETHEREUM_RPC, ALCHEMY_SEPOLIA_RPC } = process.env;

const { TEST_PRIVATE, MAIN_PRIVATE, ETHERSCAN_API, KROMASCAN_API } = process.env;

const MAINNET_ACCOUNTS = [MAIN_PRIVATE ? MAIN_PRIVATE : "a".repeat(64)];
const TESTNET_ACCOUNTS = [TEST_PRIVATE ? TEST_PRIVATE : "a".repeat(64)];

const ETHERSCAN_API_KROMAECO = ETHERSCAN_API as string;
const KROMASCAN_API_KROMAECO = KROMASCAN_API as string;

const config: HardhatUserConfig = {
  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false,
    gasPrice: 1,
  },
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
      // allowUnlimitedContractSize: true,
      // chainId: 7777,
      // chainId: 7791,
      // forking: {
      //   url: "http://apne2a-sail-proposer01.kroma.cc:8545",
      //   // url: "https://api.kroma.network",
      //   // url: "http://20.214.181.154:8588",
      // },
      // accounts: TESTNET_ACCOUNTS.map(
      //   (key) => {return {privateKey: key, balance: "1000" + "0".repeat(18)};}
      // )
      // chainId: 255, // kroma
      // forking: {
      //   url: "https://api-debug.kroma.network",
      // },
      // accounts: MAINNET_ACCOUNTS.map((acc) => {
      //   return { privateKey: acc, balance: "1000" + "0".repeat(18) };
      // }),
      // chainId: 2358, // testKroma
      // forking: {
      //   url: "https://api-debug.sepolia.kroma.network/",
      // },
      // accounts: TESTNET_ACCOUNTS.map((acc) => {
      //   return { privateKey: acc, balance: "1000" + "0".repeat(18) };
      // }),
      // chainId: 1, // ethereum
      // forking: {
      //   url: ALCHEMY_ETHEREUM_RPC as string,
      // },
      // accounts: MAINNET_ACCOUNTS.map((acc) => {
      //   return { privateKey: acc, balance: "1000" + "0".repeat(18) };
      // }),
      // chainId: 11155111, // sepolia
      // forking: {
      //   url: ALCHEMY_SEPOLIA_RPC as string
      // },
      // accounts: TESTNET_ACCOUNTS.map(acc => {
      //   return {privateKey: acc, balance: "1000" + "0".repeat(18)};
      // }),
      // accounts: {
      //   accountsBalance: "1" + "0".repeat(6+18)
      // },
    },

    // mainnet L1
    ethereum: {
      chainId: 1,
      url: ALCHEMY_ETHEREUM_RPC ?? "",
      accounts: MAINNET_ACCOUNTS,
    },

    wemix: {
      chainId: 1111,
      url: "http://20.214.181.154:8588/",
      accounts: MAINNET_ACCOUNTS,
    },

    // mainnet L2
    kroma: {
      chainId: 255,
      url: "https://api-debug.kroma.network",
      accounts: MAINNET_ACCOUNTS,
    },

    // testnet L1
    sepolia: {
      chainId: 11155111,
      url: ALCHEMY_SEPOLIA_RPC ?? "",
      accounts: TESTNET_ACCOUNTS,
    },
    testWemix: {
      chainId: 1112,
      url: "https://api.test.wemix.com/",
      accounts: TESTNET_ACCOUNTS,
    },
    easel: {
      chainId: 7789,
      url: "https://api.easel.kroma.cc/",
      accounts: TESTNET_ACCOUNTS,
    },

    // testnet L2
    testKroma: {
      chainId: 2358,
      url: "https://api-debug.sepolia.kroma.network/",
      accounts: TESTNET_ACCOUNTS,
    },
    sail: {
      chainId: 7791,
      url: "https://api.sail.kroma.cc/",
      // url: "http://apne2a-sail-proposer01.kroma.cc:8545",
      accounts: TESTNET_ACCOUNTS,
    },
  },
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KROMAECO,
      ethereum: ETHERSCAN_API_KROMAECO,
      sepolia: ETHERSCAN_API_KROMAECO,

      kroma: KROMASCAN_API_KROMAECO,
      testKroma: ETHERSCAN_API_KROMAECO,
    },
    customChains: [
      {
        network: "kroma",
        chainId: 255,
        urls: {
          apiURL: "https://api.kromascan.com/api",
          browserURL: "https://kromascan.com/"
        }
      }
    ]
  }
};

export default config;
