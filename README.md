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
