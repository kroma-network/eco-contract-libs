import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

import { getSelector } from "../helper";

describe("Pseudo Random Generator", function () {
  async function PRNG_Fixture() {
    const [owner, ...users] = await hre.ethers.getSigners();

    const prngFactory = await hre.ethers.getContractFactory("TestPRNG");
    const prng = await prngFactory.deploy();

    return { prng };
  }

  describe("Bits Utils", function () {
    it("keccak", async function () {
      const { prng } = await loadFixture(PRNG_Fixture);
      const inputNumber = 5n;
      const inputHexstring = ethers.hexlify(ethers.toBeHex(inputNumber, 32));
      const hashedInput = ethers.keccak256(inputHexstring);

      expect(await prng.keccakNumber(inputNumber)).eq(hashedInput);
      expect(await prng.keccakBytes32(inputHexstring)).eq(hashedInput);

      for(let i=0n; i<10; i++) {
        const inputHash = ethers.keccak256(ethers.hexlify(ethers.toBeHex(i, 32)));
        expect((await prng.reduceXOR64(inputHash)).slice(0, 18)).eq((await prng.reduceXORbits(inputHash, 64)).slice(0, 18));
      }
    });
  });
});
