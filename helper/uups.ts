import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { AsyncConstructor } from "async-constructor";
import { BaseContract, Signer, BytesLike, Addressable, ContractFactory, AddressLike } from "ethers";
import hre from "hardhat";

import {
  ERC1967Proxy__factory,
} from "../typechain-types";
import { UUPSFactory } from "./uups-factory";

export class EcoUUPSInstance<T> extends AsyncConstructor {
  uupsFactory!: UUPSFactory;
  inst!: T
  address!: string

  constructor(deployer?: HardhatEthersSigner) {
    super(async () => {
      this.uupsFactory = await UUPSFactory.getInstance();
      this.deployer = deployer ? deployer : (await hre.ethers.getSigners())[0];
      this.factoryERC1967Proxy = (await hre.ethers.getContractFactory("ERC1967Proxy")).connect(this.deployer);
    });
  }

async function test() {
  const implFactory = await hre.ethers.getContractFactory("EcoERC20Upgradeable");
  const factoryERC1967Proxy = new UUPSFactory();
  const impl = await implFactory.deploy();

  const input = impl.interface.encodeFunctionData("initEcoERC20", [impl.runner, "name", "symbol", 18n]);

  const instByLogic = await factoryERC1967Proxy.deployWithImpl(impl, input);
  const instByFactory = await factoryERC1967Proxy.deployWithFactory(implFactory, [], input);
  const instByAttachLogic = await factoryERC1967Proxy.attachWithImpl(impl, instByLogic);
  const instByAttachFactory = await factoryERC1967Proxy.attachWithFactory(implFactory, instByLogic);

  await instByLogic.decimals();
  await instByFactory.decimals();
  await instByAttachLogic.decimals();
  await instByAttachFactory.decimals();
}

class BaseClass {
  name: string
  constructor(name:string) {
    this.name = name;
  }
}

class UtilClass extends BaseClass {
  constructor(name:string) {
    super(name)
  }
}