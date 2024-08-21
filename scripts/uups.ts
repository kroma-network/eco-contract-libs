import { ZeroHash } from "ethers";

import { EcoUUPS } from "../helper/eco-base";
import { TestPRNG__factory } from "../typechain-types";

async function main() {
  const test = await new EcoUUPS(TestPRNG__factory);
  await test.use();
  console.log(await test.inst.testBytes32Keccak(ZeroHash));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
