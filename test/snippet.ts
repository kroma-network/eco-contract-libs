import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("Snippet", function () {

  async function Snippet_Fixture() {
    const [owner, ...users] = await hre.ethers.getSigners();

    const Snippet = await hre.ethers.getContractFactory("Snippet");
    const snippet = await Snippet.deploy();

    return { snippet, owner, users };
  }

  describe("Pointer", function () {
    it("inner call by copy", async function () {
      const { snippet, owner, users } = await loadFixture(Snippet_Fixture);

      expect(await snippet.outer()).eq(2n);
      console.log("gas:", await snippet.outer.estimateGas());
    });

    it("inner call by pointer", async function () {
      const { snippet, owner, users } = await loadFixture(Snippet_Fixture);
      expect(await snippet.outerPtr()).eq(2n);
      console.log("gas:", await snippet.outerPtr.estimateGas());
    });
  });
});
