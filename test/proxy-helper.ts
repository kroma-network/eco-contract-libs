import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";

import { expect } from "chai";
import { ethers } from "hardhat";
import { Addressable, ContractFactory, BaseContract, ContractMethodArgs, ContractTransactionResponse, Signer } from "ethers";
import { EcoERC20Mintable } from "../typechain-types";
import { EcoProxyAdmin__factory, EcoProxyAdmin } from "../typechain-types";

import { AsyncConstructor } from 'async-constructor'
import { any } from "hardhat/internal/core/params/argumentTypes";
import { FactoryOptions } from "hardhat/types";

type LogicType<LF> = LF extends { deploy(...args: ContractMethodArgs<any[]>): Promise<infer L> } ? L : never;

// Deployable 인터페이스 정의
interface Deployable {
  deploy(...args: any): Promise<any>;
}

// LF가 Deployable을 상속받도록 강제합니다.
class ProxyHelperTest<LF extends Deployable> extends AsyncConstructor {
  logicFactory!: LF;
  logic!: LogicType<LF>;

  constructor(logicFactory: LF, ...args: any) {
    super(async () => {
        this.logicFactory = logicFactory;
        this.logic = await this.logicFactory.deploy(...args);
    });
  }
}

describe("Proxy Helper", function () {
  const name = "Mintable Token";
  const symbol = "M ERC20";

  const amount = ethers.parseEther("100");

    async function Proxy_Helper_Fixture() {
      const [owner, ...users] = await ethers.getSigners();
        const helper = await new ProxyHelperTest(await ethers.getContractFactory("EcoERC20Mintable"), name, symbol);
        return {helper}
    }

    it("testing", async function () {
      const { helper } = await loadFixture(Proxy_Helper_Fixture);
      expect(await helper.logic.symbol()).equal(symbol);
    });
});
