import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { AsyncConstructor } from "async-constructor";
import { BaseContract, Signer, BytesLike } from "ethers";
import hre from "hardhat";

import {
  EcoTUPWithAdmin,
  EcoTUPWithAdminLogic__factory,
  EcoProxyAdmin__factory,
  EcoProxyAdmin,
} from "../typechain-types";

export interface EcoProxyProperties<CT> {
  // Generic for Contract logic type CT
  ecoProxy: EcoTUPWithAdmin;
  ecoProxyAdmin: EcoProxyAdmin;
  ecoLogic: CT;
}

export type EcoProxiedInstance<CT extends BaseContract> = CT & EcoProxyProperties<CT>;
// Contract logic type CT inherit? BaseContract, and inherit? Eco custom proxy property

export class ProxyFactory extends AsyncConstructor {
  IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
  ADMIN_SLOT = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";

  deployer!: Signer;
  proxyAdminLogic!: EcoProxyAdmin;
  proxyAdminFactory!: EcoProxyAdmin__factory;

  proxyFactory!: EcoTUPWithAdminLogic__factory;

  constructor(deployer?: HardhatEthersSigner, proxyAdminLogic?: EcoProxyAdmin) {
    super(async () => {
      this.deployer = deployer ? deployer : (await hre.ethers.getSigners())[0];
      this.proxyAdminFactory = (await hre.ethers.getContractFactory("EcoProxyAdmin")).connect(this.deployer);

      this.proxyAdminLogic = proxyAdminLogic
        ? proxyAdminLogic?.connect(deployer)
        : (await this.proxyAdminFactory.deploy(this.deployer)).connect(this.deployer);
      this.proxyFactory = (await hre.ethers.getContractFactory("EcoTUPWithAdminLogic")).connect(this.deployer);
    });
  }

  async deploy<CT extends BaseContract>(logic: CT, input: BytesLike): Promise<EcoProxiedInstance<CT>> {
    const proxy = await this.proxyFactory.deploy(this.proxyAdminLogic, logic, input);
    const inst = (await logic.attach(proxy)) as EcoProxiedInstance<CT>;

    inst.ecoProxy = proxy;
    inst.ecoProxyAdmin = this.proxyAdminFactory.attach(await this.getAdminAddress(proxy)) as EcoProxyAdmin;
    inst.ecoLogic = logic;

    return inst;
  }

  async getImplAddress<CT extends BaseContract>(logic: CT) {
    const slotData = await hre.ethers.provider.getStorage(logic, this.IMPLEMENTATION_SLOT);
    return hre.ethers.getAddress("0x" + slotData.slice(-40));
  }

  async getAdminAddress<CT extends BaseContract>(logic: CT) {
    const slotData = await hre.ethers.provider.getStorage(logic, this.ADMIN_SLOT);
    return hre.ethers.getAddress("0x" + slotData.slice(-40));
  }
}

async function test() {
  const logicFactory = await hre.ethers.getContractFactory("EcoERC20Mintable");
  const proxyFactory = new ProxyFactory();
  const logic = await logicFactory.deploy("a", "a");
  const input = logic.interface.encodeFunctionData("initEcoERC20Mintable", [logic, "a", "a"]);
  const inst = await proxyFactory.deploy(logic, input);

  await inst.symbol();
  await inst.ecoLogic.symbol();
}
