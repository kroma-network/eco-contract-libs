import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { getSelector } from "../helper";

describe("Bp Math", function () {
  const zero = 0n;
  const uint256Max = (2n**256n)-1n;
  const int256Max = (2n**255n)-1n;
  const uint32Max = (2n**32n)-1n;
  const int32Max = (2n**31n)-1n;
  const uint256Min = zero;
  const int256Min = -(2n**255n);
  const uint32Min = zero;
  const int32Min = -(2n**31n);


  async function Utils_Fixture() {
    const [owner] = await hre.ethers.getSigners();

    const factoryTestUbpMath = await hre.ethers.getContractFactory("TestUbpMath");
    const factoryTestIbpMath = await hre.ethers.getContractFactory("TestIbpMath");
    const ubp = await factoryTestUbpMath.deploy();
    const ibp = await factoryTestIbpMath.deploy();


    return { ubp, ibp };
  }

  describe("Ubp", function () {
    it("test ubp", async function () {
      const {ubp, ibp} = await loadFixture(Utils_Fixture);

      // await expect(await ubp.wrap(uint256Max)).rejected;
      // await expect(await ubp.wrap(int256Max)).rejected;
      // await expect(await ubp.wrap(uint32Max)).reverted;
      expect(await ubp.wrap(int32Max)).eq(int32Max);

      // expect(await ubp.wrap(uint256Min)).eq(uint256Min);
      // await expect(await ubp.wrap(int256Min)).reverted;
      // expect(await ubp.wrap(uint32Min)).eq(uint32Min);
      // await expect(await ubp.wrap(int32Min)).reverted;
    });
  });

  describe("Ibp", function () {
    it("test ibp", async function () {
      const {ubp, ibp} = await loadFixture(Utils_Fixture);
    });
  });
});