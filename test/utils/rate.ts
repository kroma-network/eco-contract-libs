import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

import { getSelector } from "../helper";

describe("Rate Math in utils", function () {
  async function RateMath_Fixture() {
    const [owner, ...users] = await hre.ethers.getSigners();

    const rateMathFactory = await hre.ethers.getContractFactory("TestRate");
    const rateMath = await rateMathFactory.deploy();

    return { rateMath };
  }

  describe("Bits Utils", function () {
    it("keccak", async function () {
      const { rateMath } = await loadFixture(RateMath_Fixture);
      const defaultRate = 10000;
      const defaultValue = 1000;

      expect(await rateMath.rateApply(defaultRate, defaultValue)).eq(1000n);
      expect(await rateMath.rateAdd(defaultRate, defaultValue)).eq(2000n);
      expect(await rateMath.rateSub(defaultRate, defaultValue)).eq(0n);
      expect(await rateMath.down(defaultRate, defaultValue)).eq(9000n);
      expect(await rateMath.up(defaultRate, defaultValue)).eq(11000n);
    });
  });
});
