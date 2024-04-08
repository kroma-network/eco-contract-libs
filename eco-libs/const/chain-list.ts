export const Mainnet = {
  Ethereum: 1n,
  Wemix: 1111n,

  Kroma: 255n,
};

export const Testnet = {
  Sepolia: 11155111n,
  testWemix: 1112n,
  Easel: 7789n,

  sepoliaKroma: 2358n,
  Sail: 7791n,
};

export const Devnet = {
  Hardhat: 31337n,
  Default: 1337n,
};

export const Layer1 = {
  Ethereum: 1n,
  Wemix: 1111n,
  Sepolia: 11155111n,
  testWemix: 1112n,
  Easel: 7789n,
};

export const Layer2 = {
  Kroma: 255n,
  sepoliaKroma: 2358n,
  Sail: 7791n,
};

const mainnetValues = Object.values(Mainnet).map((value) => value);
const testnetValues = Object.values(Testnet).map((value) => value);
const devnetValues = Object.values(Devnet).map((value) => value);

export function isMainnet(id: bigint): boolean {
  return mainnetValues.includes(id);
}

export function isTestnet(id: bigint): boolean {
  return testnetValues.includes(id);
}

export function isDevnet(id: bigint): boolean {
  return devnetValues.includes(id);
}

const layer1Values = Object.values(Layer1).map((value) => value);
const layer2Values = Object.values(Layer2).map((value) => value);

export function isLayer1(id: bigint): boolean {
  return layer1Values.includes(id);
}
export function isLayer2(id: bigint): boolean {
  return layer2Values.includes(id);
}

export function bridgeAddresss(id:bigint) {
  switch(id) {
  case 1n: return "0x827962404D7104202C5aaa6b929115C8211d9596";
  case 11155111n: return "0x38C9a0a694AA0f92c05238484C3a9bdE1e85ddE4";
  case 7789n: return "0x9a8164cA007ff0899140719E9aEC9a9C889CbF1E";

  case 255n:
  case 2358n:
  case 7791n:
    return "0x4200000000000000000000000000000000000009";

  default:
    throw "not exist: bridge";

  }
}