import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("Echidna", function () {
  async function Scribble_Fixture() {
    const [owner, ...users] = await hre.ethers.getSigners();

    const scribbleFactory = await hre.ethers.getContractFactory("Scribble");
    const scribble = await scribbleFactory.deploy();

    return { scribble };
  }

  describe("Basic", function () {
    it("test", async function () {
      const { scribble } = await loadFixture(Scribble_Fixture);
      expect(await scribble.inc(1)).eq(2);
    });
  });
});