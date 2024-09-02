import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { AsyncConstructor } from "async-constructor";
import { BaseContract, Addressable, ZeroAddress } from "ethers";
import hre from "hardhat";

import {
  EcoTUPWithAdminLogic__factory,
  EcoProxyAdmin__factory,
  EcoProxyAdmin,
  EcoTUPWithAdminLogic,
} from "../typechain-types";

export interface TraitCF<CT> {
  deploy(...deployArgs: unknown[]): Promise<CT>;
  attach(target: string | Addressable): any;
}

import { exportContractInfo, importContractInfo } from "./helper";

export class BaseInstance extends AsyncConstructor {
  deployer!: HardhatEthersSigner;

  constructor(asyncContructor: () => Promise<void>, deployer?: HardhatEthersSigner) {
    super(async () => {
      this.deployer = deployer ? deployer : (await hre.ethers.getSigners())[0];
      await asyncContructor();
    });
  }

  getSelector(contractMethod: { fragment: { selector: string } }): string {
    return contractMethod.fragment.selector;
  }
}

// Contract Factory Constructor Type
// type CFConstructor<CF> = new (...args: any) => CF;
type CFConstructor<CF extends TraitCF<any>> = new (...args: any) => CF;

export class ContractInstance<CF extends TraitCF<CT>, CT extends BaseContract> extends BaseInstance {
  deployer!: HardhatEthersSigner;

  domain!: string;
  label!: string;

  factory!: CF;
  inst!: Awaited<ReturnType<CF["deploy"]>>;

  constructor(
    domain: string,
    factoryType: CFConstructor<CF>,
    deployer?: HardhatEthersSigner, // eslint-disable-next-line @typescript-eslint/no-empty-function
    asyncContructor: () => Promise<void> = async () => {},
  ) {
    super(async () => {
      this.domain = domain;
      this.label = factoryType.name.replace("__factory", "");

      this.factory = (await hre.ethers.getContractFactory(this.label)) as unknown as CF;
      await asyncContructor();
    }, deployer);
  }

  async deploy(...deployArgs: unknown[]) {
    this.inst = (await this.factory.deploy(...deployArgs)) as Awaited<ReturnType<CF["deploy"]>>;
    await this.inst.waitForDeployment();
  }

  async attach(address: string) {
    this.inst = (await this.factory.attach(address)) as Awaited<ReturnType<CF["deploy"]>>;
  }

  async load(address?: string) {
    const info = await importContractInfo(this.domain, this.label);
    if (address) {
      this.inst = this.factory.attach(address) as Awaited<ReturnType<CF["deploy"]>>;
    } else if (info.address && info.address != ZeroAddress) {
      this.inst = this.factory.attach(info.address) as Awaited<ReturnType<CF["deploy"]>>;
    } else {
      throw "load: " + this.domain + "/" + this.label;
    }
  }

  async use(...deployArgs: unknown[]) {
    if (!this.inst) {
      await this.deploy(deployArgs);
    }
  }

  async exportInstanceInfo() {
    if (this.inst) {
      await exportContractInfo(this.domain, this.label, this.inst);
    } else {
      throw "exportInstanceInfo: not deployed";
    }
  }
}

// class ProxyFactory<CF extends TraitCF<CT> & typeof EcoProxyAdmin__factory, CT extends BaseContract> extends ContractInstance<CF, CT> {
export class ProxyFactory extends ContractInstance<EcoProxyAdmin__factory, EcoProxyAdmin> {
  readonly IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
  readonly ADMIN_SLOT = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";
  private static instance: ProxyFactory;

  chainId!: bigint;

  EcoTUPFactory!: EcoTUPWithAdminLogic__factory;

  private constructor() {
    super("admin", EcoProxyAdmin__factory, undefined, async () => {
      this.chainId = (await hre.ethers.provider.getNetwork()).chainId;
      this.EcoTUPFactory = await hre.ethers.getContractFactory("EcoTUPWithAdminLogic");
      try {
        await this.load();
      } catch (e) {
        console.log("deploy ProxyAdmin", e);
        await this.deploy(this.deployer.address);
        await this.inst.waitForDeployment();
        try {
          await this.exportInstanceInfo();
        } catch (e) {
          console.log(e);
        }
      }
    });
  }

  public static async getInstance(): Promise<ProxyFactory> {
    if (!ProxyFactory.instance) {
      ProxyFactory.instance = await new ProxyFactory();
    }
    return ProxyFactory.instance;
  }

  async attachWithFactory<CF extends TraitCF<CT>, CT extends BaseContract>(factory: CF, address: string) {
    const inst = (await factory.attach(address)) as CT;
    const proxy = await this.EcoTUPFactory.attach(address);
    const logic = await this.getImpl(inst);
    const admin = await this.getAdmin(inst);
    return { logic, proxy, admin, inst };
  }

  async deployWithFactory<CF extends TraitCF<CT>, CT extends BaseContract>(factory: CF, input: string) {
    const logic = await factory.deploy();
    await logic.waitForDeployment();
    return this.deployWithLogic(logic, input);
  }

  async deployWithLogic<CT extends BaseContract>(logic: CT, input: string) {
    const proxy = await this.EcoTUPFactory.deploy(await this.inst.getAddress(), await logic.getAddress(), input);
    const inst = logic.attach(proxy);
    await inst.waitForDeployment();
    const admin = await this.getAdmin(inst);
    return { logic, proxy, admin, inst };
  }

  async getImpl<CT extends BaseContract>(logic: CT) {
    const slotData = await hre.ethers.provider.getStorage(logic, this.IMPLEMENTATION_SLOT);
    const address = hre.ethers.getAddress("0x" + slotData.slice(-40));
    return logic.attach(address) as CT;
  }

  async getAdmin<CT extends BaseContract>(logic: CT) {
    const slotData = await hre.ethers.provider.getStorage(logic, this.ADMIN_SLOT);
    const address = hre.ethers.getAddress("0x" + slotData.slice(-40));
    return this.factory.attach(address);
  }
}

export class ProxiedInstance<
  CF extends TraitCF<Awaited<ReturnType<CF["deploy"]>>>,
  CT extends Awaited<ReturnType<CF["deploy"]>>,
> extends ContractInstance<CF, CT> {
  proxyFactory!: ProxyFactory;

  logic!: Awaited<ReturnType<CF["deploy"]>>;
  proxy!: EcoTUPWithAdminLogic;
  admin!: EcoProxyAdmin;

  constructor(domain: string, factoryType: CFConstructor<CF>, deployer?: HardhatEthersSigner) {
    super(domain, factoryType, deployer, async () => {
      this.proxyFactory = await ProxyFactory.getInstance();
    });
  }

  async assign(info: {
    logic: Awaited<ReturnType<CF["deploy"]>>;
    inst: Awaited<ReturnType<CF["deploy"]>>;
    admin: EcoProxyAdmin;
    proxy: EcoTUPWithAdminLogic;
  }) {
    this.logic = info.logic;
    this.proxy = info.proxy;
    this.admin = info.admin;
    this.inst = info.inst;
  }

  async deployLogic(...deployArgs: unknown[]) {
    this.logic = await this.factory.deploy(...deployArgs);
    await this.logic.waitForDeployment();
  }

  async deployWithInputBuilder(inputBuilder: () => Promise<string>) {
    if (!this.logic) {
      await this.deployLogic();
    }

    const info = await this.proxyFactory.deployWithLogic(this.logic, await inputBuilder());
    await this.assign(info);
  }

  async deploy(input: string) {
    if (!this.logic) {
      await this.deployLogic();
    }

    const info = await this.proxyFactory.deployWithLogic(this.logic, input);
    await this.assign(info);
  }

  async attach(address: string) {
    this.assign({ ...(await this.proxyFactory.attachWithFactory(this.factory, address)) });
  }

  async load(address?: string) {
    const info = await importContractInfo(this.domain, this.label);
    if (address) {
      await this.attach(address);
    } else if (info.address) {
      await this.attach(info.address);
    } else {
      throw "error in load: " + this.domain + "/" + this.label;
    }
  }

  async use(input: string) {
    if (!this.inst) {
      await this.deploy(input);
    }
  }

  async upgrade(address?: string) {
    if (!this.inst) {
      throw "not deployed";
    }
    if (!address) {
      await this.deployLogic();
      address = await this.logic.getAddress();
    }
    await this.admin.upgradeAndCall(await this.proxy.getAddress(), address, "0x");
    await this.attach(await this.inst.getAddress());
  }

  async exportInstanceInfo() {
    if (this.inst) {
      await exportContractInfo(this.domain, this.label, this.proxy);
    } else {
      throw "exportInstanceInfo: not deployed";
    }
  }
}
