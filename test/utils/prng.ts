import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ZeroHash } from "ethers";
import hre, { ethers } from "hardhat";

describe("Pseudo Random Generator", function () {
  async function PRNG_Fixture() {
    const [owner, ...users] = await hre.ethers.getSigners();

    const prngFactory = await hre.ethers.getContractFactory("HHPRNG");
    const prng = await prngFactory.deploy();

    return { prng };
  }

  describe("Bits/Bytes/Utils", function () {
    it("hashes and reduces", async function () {
      const { prng } = await loadFixture(PRNG_Fixture);

      const hashedZeroHash = ethers.keccak256(ZeroHash);
      expect(await prng.hhBytes32Keccak(ZeroHash)).eq(hashedZeroHash);

      expect(await prng.hhReduceXOR32(hashedZeroHash)).eq(
        "0x1887660600000000000000000000000000000000000000000000000000000000",
      );

      await expect(prng.hhReduceXOR(hashedZeroHash, 127)).reverted;
      const reducedHashes = await Promise.all(
        [...Array(9).keys()].map(
          async (i) => await prng.hhReduceXOR(hashedZeroHash, 2 ** i),
        ),
      );
      expect(reducedHashes).deep.eq([
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0xff00000000000000000000000000000000000000000000000000000000000000",
        "0x7e81000000000000000000000000000000000000000000000000000000000000",
        "0x1887660600000000000000000000000000000000000000000000000000000000",
        "0x828786f39a00e0f5000000000000000000000000000000000000000000000000",
        "0x62ab504c1ccb6a5ee02cd6bf86cb8aab00000000000000000000000000000000",
        "0x290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e563",
      ]);
      expect(reducedHashes.at(-1)!).eq(hashedZeroHash);
    });
  });

  describe("Keccak RNG", function () {
    it("Simple Test", async function () {
      const { prng } = await loadFixture(PRNG_Fixture);
      const hashedZeroHash = ethers.keccak256(ZeroHash);
      expect(await prng.genKeccak(hashedZeroHash, 32)).deep.eq([
        3166n,
        3065n,
        318n,
        8661n,
        4979n,
        26n,
        25n,
        9635n,
        6855n,
        7533n,
        6124n,
        3715n,
        5089n,
        7591n,
        5788n,
        3822n,
        2087n,
        3522n,
        7574n,
        6268n,
        8996n,
        6736n,
        4530n,
        7977n,
        5826n,
        2763n,
        1806n,
        6020n,
        504n,
        479n,
        1164n,
        1375n,
      ]);
    });

    it("Branch Coverage(revert)", async function () {
      const { prng } = await loadFixture(PRNG_Fixture);
      const hashedZeroHash = ethers.keccak256(ZeroHash);
      await expect(
        prng.updateWeed({
          seed: hashedZeroHash,
          weed: hashedZeroHash,
          yieldSize: 16,
          weedBitShifter: 0,
        }),
      ).reverted;
      await expect(
        prng.updateWeed({
          seed: hashedZeroHash,
          weed: ZeroHash,
          yieldSize: 16,
          weedBitShifter: 256,
        }),
      ).reverted;
      await expect(
        prng.yield16({
          seed: hashedZeroHash,
          weed: hashedZeroHash,
          yieldSize: 0,
          weedBitShifter: 256,
        }),
      ).reverted;
    });
  });

  describe("Linear congruential", function () {
    it("Simple Test", async function () {
      const { prng } = await loadFixture(PRNG_Fixture);
      const hashedZeroHash = ethers.keccak256(ZeroHash);
      expect(await prng.genLCGYield(hashedZeroHash, 10)).deep.eq([
        3927n,
        9870n,
        5793n,
        1701n,
        7788n,
        8950n,
        4355n,
        8848n,
        2711n,
        3691n,
      ]);
      expect(await prng.genLCGYield10000(hashedZeroHash, 10)).deep.eq([
        3927n,
        9870n,
        5793n,
        1701n,
        7788n,
        8950n,
        4355n,
        8848n,
        2711n,
        3691n,
      ]);
      expect(await prng.genLCGByState(100, 10)).deep.eq([
        2748n,
        3489n,
        2903n,
        3695n,
        307n,
        3928n,
        4474n,
        2553n,
        3792n,
        3266n,
      ]);
    });
  });
});
