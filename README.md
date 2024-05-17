# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
yarn hardhat help
yarn hardhat test
REPORT_GAS=true yarn hardhat test
yarn hardhat node
yarn hardhat run scripts/deploy.ts
```

# Solidity Tools

1. [slither](https://github.com/crytic/slither)

   `pip install -r requirements.txt`

   `slither .`

2. [echidna](https://github.com/crytic/echidna?tab=readme-ov-file)

   `brew install echidna`

   `echidna contracts/echidna.sol`

3. [scribble](https://github.com/Consensys/scribble])

   `npm install -g eth-scribble`

   `scribble contracts/test/scribble.sol --output-mode files --arm --instrumentation-metadata-file md.json`

   `scribble contracts/test/scribble.sol --output-mode files --disarm --instrumentation-metadata-file md.json`

# scan verification
```
# at f9acea4b8a5efbd23d0669d5762780206b18308f
yarn hardhat --network ethereum verify --contract contracts/proxy/admin.sol:EcoProxyAdmin 0x0114fd85c342F39e22E2c8e1Be512ade856309C0 0x7D76Ae60dcc2FdB57d3924024E2Ad940B76Ef81f
yarn hardhat --network kroma verify --contract contracts/proxy/admin.sol:EcoProxyAdmin 0xF3596b61D9999A2384BBE72e75d5c59Dda7F2774 0x7D76Ae60dcc2FdB57d3924024E2Ad940B76Ef81f

# at 7ad1f0242cdf4ab5231aadfd0f2ddf94a4607618
yarn hardhat --network kroma verify --contract contracts/eco-libs/proxy/admin.sol:EcoProxyForProxyAdmin 0xbFCC9a85e89Ea9479E18C14050a063185FBd94e0 0xF3596b61D9999A2384BBE72e75d5c59Dda7F2774 0x7D76Ae60dcc2FdB57d3924024E2Ad940B76Ef81f
```