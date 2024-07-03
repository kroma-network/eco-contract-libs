import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("Echidna", function () {
  async function Echidna_Fixture() {
    const [owner, ...users] = await hre.ethers.getSigners();

    const echidnaFactory = await hre.ethers.getContractFactory("Echidna");
    const echidna = await echidnaFactory.deploy();

    return { echidna };
  }

  describe("Basic", function () {
    it("test", async function () {
      const { echidna } = await loadFixture(Echidna_Fixture);
      expect(await echidna.echidna_check_balance()).eq(false);
    });
  });
});