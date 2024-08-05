import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { AsyncConstructor } from "async-constructor";
import { BaseContract, Signer, BytesLike, Addressable, ContractFactory, AddressLike } from "ethers";
import hre from "hardhat";

import {
  ERC1967Proxy__factory,
} from "../typechain-types";

export interface IContractFactory<CT extends BaseContract> {
  deploy(...deployArgs: unknown[]): Promise<CT>;
  attach(target: string | Addressable): unknown;
}

type TContractFactory<CT extends BaseContract> = IContractFactory<CT> & ContractFactory;

export interface IUUPSInstance<CT> {
  impl: CT;
}

export interface IUUPSWithFactoryInstance<CT extends BaseContract> extends IUUPSInstance<CT> {
  implFactory: TContractFactory<CT>;
}

export type UUPSInstance<CT extends BaseContract> = CT & IUUPSInstance<CT>;
export type UUPSInstanceWithFactory<CT extends BaseContract> = CT & IUUPSWithFactoryInstance<CT>;


export class UUPSFactory extends AsyncConstructor {
  IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
  ADMIN_SLOT = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";

  deployer!: Signer;
  factoryERC1967Proxy!: ERC1967Proxy__factory;

  constructor(deployer?: HardhatEthersSigner) {
    super(async () => {
      this.deployer = deployer ? deployer : (await hre.ethers.getSigners())[0];
      this.factoryERC1967Proxy = (await hre.ethers.getContractFactory("ERC1967Proxy")).connect(this.deployer);
    });
  }

  async deployWithImpl<CT extends BaseContract>(impl: CT, input: BytesLike): Promise<UUPSInstance<CT>> {
    const proxy = await this.factoryERC1967Proxy.deploy(impl, input);
    const inst = impl.attach(proxy) as UUPSInstance<CT>;

    inst.impl = impl;

    return inst;
  }

  async deployWithFactory<CT extends BaseContract>(
    factory: TContractFactory<CT>,
    deployArgs: unknown[],
    input: BytesLike,
  ): Promise<UUPSInstanceWithFactory<CT>> {
    const impl = await factory.deploy(deployArgs);
    const proxy = await this.factoryERC1967Proxy.deploy(impl, input);
    const inst = impl.attach(proxy) as UUPSInstanceWithFactory<CT>;

    inst.impl = impl;
    inst.implFactory = factory;

    return inst;
  }

  async attachWithImpl<CT extends BaseContract>(
    impl: CT,
    address: AddressLike,
  ): Promise<UUPSInstance<CT>> {
    const inst = impl.attach(await address) as UUPSInstance<CT>;

    inst.impl = impl;

    return inst;
  }

  async attachWithFactory<CT extends BaseContract>(
    factory: TContractFactory<CT>,
    address: AddressLike,
  ): Promise<UUPSInstanceWithFactory<CT>> {
    const inst = factory.attach(await address) as UUPSInstanceWithFactory<CT>;

    inst.impl = factory.attach(await this.getImplAddress(inst)) as CT;
    inst.implFactory = factory;

    return inst;
  }

  async getImplAddress<CT extends BaseContract>(impl: CT) {
    const slotData = await hre.ethers.provider.getStorage(impl, this.IMPLEMENTATION_SLOT);
    return hre.ethers.getAddress("0x" + slotData.slice(-40));
  }

  async getAdminAddress<CT extends BaseContract>(impl: CT) {
    const slotData = await hre.ethers.provider.getStorage(impl, this.ADMIN_SLOT);
    return hre.ethers.getAddress("0x" + slotData.slice(-40));
  }
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
