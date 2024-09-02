import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { AsyncConstructor } from "async-constructor";
import { BaseContract, Signer, BytesLike, Addressable, ContractFactory } from "ethers";
import hre from "hardhat";

import {
  EcoTUPWithAdmin,
  EcoTUPWithAdminLogic__factory,
  EcoProxyAdmin__factory,
  EcoProxyAdmin,
  EcoTUPWithAdminLogic,
} from "../typechain-types";

import * as reuseAddress from "./const/reuse-logic-address";
import { exportContractInfo, importContractInfo } from "./helper";

export interface ContractFactoryTypeSupporter<CT extends BaseContract> {
  deploy(...deployArgs: unknown[]): Promise<CT>;
  attach(target: string | Addressable): unknown;
}

export type EcoContractFactory<CT extends BaseContract> = ContractFactoryTypeSupporter<CT> & ContractFactory;

export interface EcoProxyBaseProperties<CT> {
  // Generic for Contract logic type CT
  ecoProxy: EcoTUPWithAdmin;
  ecoProxyAdmin: EcoProxyAdmin;
  ecoLogic: CT;
}

export interface EcoProxyPropertiesWithFactory<CT extends BaseContract> extends EcoProxyBaseProperties<CT> {
  ecoLogicFactory: EcoContractFactory<CT>;
}

export type EcoProxiedInstance<CT extends BaseContract> = CT & EcoProxyBaseProperties<CT>;
export type EcoProxiedInstanceWithFactory<CT extends BaseContract> = CT & EcoProxyPropertiesWithFactory<CT>;
// Contract logic type CT inherit? BaseContract, and inherit? Eco custom proxy property

export class ProxyInstanceFactory extends AsyncConstructor {
  IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
  ADMIN_SLOT = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";

  deployer!: HardhatEthersSigner;
  proxyAdminLogic!: EcoProxyAdmin;
  proxyAdminFactory!: EcoProxyAdmin__factory;

  EcoTUPFactory!: EcoTUPWithAdminLogic__factory;

  constructor(deployer?: HardhatEthersSigner, proxyAdminLogic?: EcoProxyAdmin) {
    super(async () => {
      this.deployer = deployer ? deployer : (await hre.ethers.getSigners())[0];
      this.proxyAdminFactory = await hre.ethers.getContractFactory("EcoProxyAdmin");

      await this.load(proxyAdminLogic);

      this.EcoTUPFactory = await hre.ethers.getContractFactory("EcoTUPWithAdminLogic");
    });
  }

  async load(proxyAdminLogic?: EcoProxyAdmin) {
    const chainId = (await hre.ethers.provider.getNetwork()).chainId;
    const reuseLogicAddress = reuseAddress.LogicAddress(chainId).proxyAdmin;

    if (proxyAdminLogic !== undefined) {
      this.proxyAdminLogic = proxyAdminLogic;
    } else if (reuseLogicAddress !== undefined && reuseLogicAddress !== hre.ethers.ZeroAddress) {
      this.proxyAdminLogic = this.proxyAdminFactory.attach(
        reuseAddress.LogicAddress(chainId).proxyAdmin as string,
      ) as EcoProxyAdmin;
    } else {
      this.proxyAdminLogic = await this.loadByServiceInfo();
    }
  }

  async loadByServiceInfo() {
    const logicInfo = await importContractInfo("admin", "EcoProxyAdmin");
    if (logicInfo.address !== hre.ethers.ZeroAddress) {
      return this.proxyAdminFactory.attach(logicInfo.address) as EcoProxyAdmin;
    } else {
      const deployedLogic = await this.proxyAdminFactory.deploy(this.deployer);
      await exportContractInfo("admin", "EcoProxyAdmin", deployedLogic);
      return deployedLogic;
    }
  }

  async exportService() {
    await exportContractInfo("admin", "EcoProxyAdmin", this.proxyAdminLogic);
  }

  async deployWithLogic<CT extends BaseContract>(logic: CT, input: BytesLike): Promise<EcoProxiedInstance<CT>> {
    await logic.waitForDeployment();
    const proxy = await this.EcoTUPFactory.deploy(this.proxyAdminLogic, logic, input);
    await proxy.waitForDeployment();
    const inst = (await logic.attach(proxy)) as EcoProxiedInstance<CT>;

    inst.ecoProxy = proxy;
    inst.ecoProxyAdmin = this.proxyAdminFactory.attach(await this.getAdminAddress(inst)) as EcoProxyAdmin;
    inst.ecoLogic = logic;

    return inst;
  }

  async deployWithFactory<CT extends BaseContract>(
    factory: EcoContractFactory<CT>,
    deployArgs: unknown[],
    input: BytesLike,
  ): Promise<EcoProxiedInstanceWithFactory<CT>> {
    const logic = await factory.deploy(deployArgs);
    const proxy = await this.EcoTUPFactory.deploy(this.proxyAdminLogic, logic, input);
    const inst = logic.attach(proxy) as EcoProxiedInstanceWithFactory<CT>;

    inst.ecoProxy = proxy;
    inst.ecoProxyAdmin = this.proxyAdminFactory.attach(await this.getAdminAddress(inst)) as EcoProxyAdmin;
    inst.ecoLogic = logic;
    inst.ecoLogicFactory = factory;

    return inst;
  }

  async attachWithLogic<CT extends BaseContract>(
    logic: CT,
    address: string | Addressable,
  ): Promise<EcoProxiedInstance<CT>> {
    const inst = logic.attach(address) as EcoProxiedInstance<CT>;

    inst.ecoProxy = this.EcoTUPFactory.attach(address) as EcoTUPWithAdminLogic;
    inst.ecoProxyAdmin = this.proxyAdminFactory.attach(await this.getAdminAddress(inst)) as EcoProxyAdmin;
    inst.ecoLogic = logic.attach(await this.getAdminAddress(inst)) as CT;

    return inst;
  }

  async attachWithFactory<CT extends BaseContract>(
    factory: EcoContractFactory<CT>,
    address: string | Addressable,
  ): Promise<EcoProxiedInstanceWithFactory<CT>> {
    const inst = factory.attach(address) as EcoProxiedInstanceWithFactory<CT>;

    inst.ecoProxy = this.EcoTUPFactory.attach(address) as EcoTUPWithAdminLogic;
    inst.ecoProxyAdmin = this.proxyAdminFactory.attach(await this.getAdminAddress(inst)) as EcoProxyAdmin;
    inst.ecoLogic = factory.attach(await this.getAdminAddress(inst)) as CT;
    inst.ecoLogicFactory = factory;

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
  const logicFactory = await hre.ethers.getContractFactory("EcoERC20MintableUpgradeable");
  const EcoTUPFactory = new ProxyInstanceFactory();
  const logic = await logicFactory.deploy("a", "a");

  const input = logic.interface.encodeFunctionData("initEcoERC20Mintable", [logic, "a", "a"]);

  const instByLogic = await EcoTUPFactory.deployWithLogic(logic, input);
  const instByFactory = await EcoTUPFactory.deployWithFactory(logicFactory, ["a", "a"], input);
  const instByAttachLogic = await EcoTUPFactory.attachWithLogic(logic, instByLogic);
  const instByAttachFactory = await EcoTUPFactory.attachWithFactory(logicFactory, instByLogic);

  await instByLogic.decimals();
  await instByFactory.decimals();
  await instByAttachLogic.decimals();
  await instByAttachFactory.decimals();
}
