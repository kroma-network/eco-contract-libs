import fs from "fs";
import path from "path";

import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { AsyncConstructor } from "async-constructor";
import { AddressLike, BaseContract, BytesLike, ContractFactory, ContractTransactionResponse } from "ethers";
import hre from "hardhat";
import { Test_SelectorRoleControlUpgradeable__factory, Test_SelectorRoleControlUpgradeable } from "../typechain-types";

type EcoDeploymentDetail = {
  deployedBlockNumber: number;
  address: string;
} & {
  waitForDeployment(): any;
  upgradeToAndCall(newImplementation: AddressLike, data: BytesLike): Promise<void>;
  deploymentTransaction(): ContractTransactionResponse
} & BaseContract;

// IContractFactory 인터페이스 정의
export interface IContractFactory<CT> {
  deploy(...args: any[]): Promise<CT>;
  connect(...args: any[]): IContractFactory<CT>;
}

// ContractFactoryType 및 ReturnCT 정의
export type ContractFactoryType<CT> = IContractFactory<CT>;
export type ReturnCT<CF extends IContractFactory<unknown>> = (CF extends IContractFactory<infer CT> ? CT : never);

// EcoCF와 CFConstructor 타입 정의
export type EcoCF<CF extends IContractFactory<unknown>> = ContractFactoryType<ReturnCT<CF>>;
export type EcoCT<CF extends IContractFactory<unknown>> = ReturnCT<CF> & EcoDeploymentDetail;
export type CFConstructor<CF> = new (...args: any[]) => CF;

export function filesInDirectory(startPath: string, filter = RegExp(/\.json$/)): string[] {
  let results: string[] = [];

  if (!fs.existsSync(startPath)) {
    console.log("No directory", startPath);
    return results;
  }

  const files = fs.readdirSync(startPath);
  for (let i = 0; i < files.length; i++) {
    const filename = path.join(startPath, files[i]);
    const stat = fs.lstatSync(filename);

    if (stat.isDirectory()) {
      results = results.concat(filesInDirectory(filename, filter));
    } else if (filter.test(filename)) {
      results.push(filename);
    }
  }

  return results;
}

export async function writeAbiFromArtifact(serviceLabel: string, artifactPath: string, abiDirectory: string) {
  const hardhatArtifact = (await import(artifactPath)) as { abi: unknown[] };
  fs.writeFileSync(
    path.join(abiDirectory, serviceLabel) + ".json",
    JSON.stringify(hardhatArtifact.abi, null, 2),
    "utf8",
  );
}

export function createDirectoryIfNotExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Directory created: ${dirPath}`);
  }
}

export function getSelector(contractMethod: { fragment: { selector: string } }): string {
  return contractMethod.fragment.selector;
}

export class EcoProxyFactory extends AsyncConstructor {
  readonly IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
  readonly ADMIN_SLOT = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";
  private static instance: EcoProxyFactory;

  chainId!: bigint;
  deployer!: HardhatEthersSigner;

  factory!: ContractFactory;

  private constructor(deployer?: HardhatEthersSigner, asyncContructor?: () => Promise<void>) {
    super(async () => {
      this.chainId = (await hre.ethers.provider.getNetwork()).chainId;
      this.deployer = deployer ?? (await hre.ethers.getSigners())[0];
      this.factory = (await hre.ethers.getContractFactory("ERC1967Proxy")).connect(this.deployer);
      if (asyncContructor) await asyncContructor();
    });
  }

  public static async getInstance(): Promise<EcoProxyFactory> {
    if (!EcoProxyFactory.instance) {
      EcoProxyFactory.instance = await new EcoProxyFactory();
    }
    return EcoProxyFactory.instance;
  }

  async _deployProxy<CF extends EcoCF<CF>>(logic:EcoCT<CF>, initData: BytesLike, deployer?:HardhatEthersSigner) {
    const _deployer = deployer ?? this.deployer;
    const proxy = await this.factory.connect(_deployer).deploy(logic, initData);
    const inst = await proxy.waitForDeployment() as unknown as EcoCT<CF>;
    inst.address = await proxy.getAddress();
    inst.deployedBlockNumber = proxy.deploymentTransaction()!.blockNumber!;
    return inst;
  }

  async _deployLogic<CF extends EcoCF<CF>>(
    implFactory: CF,
    implConstructArgs?: unknown[],
    deployer?: HardhatEthersSigner,
  ): Promise<EcoCT<CF>> {
    const _deployer = deployer ?? this.deployer;
    const _implFactory = implFactory.connect(_deployer);
    const logic = (implConstructArgs ? await _implFactory.deploy(implConstructArgs) : await _implFactory.deploy()) as EcoCT<CF>;
    await logic.waitForDeployment();

    logic.address = await logic.getAddress();
    logic.deployedBlockNumber = logic.deploymentTransaction()!.blockNumber!;
    return logic as EcoCT<CF>;
  }

  async deployWithImpl<CF extends EcoCF<CF>>(
    implFactory: CF,
    proxyInitData: BytesLike,
    implConstructArgs?: unknown[],
    deployer?: HardhatEthersSigner
  ): Promise<EcoCT<CF>> {
    const _deployer = deployer ?? this.deployer;
    const logic = await this._deployLogic(implFactory, implConstructArgs, _deployer);
    const inst = await this._deployProxy(logic, proxyInitData, _deployer);
    return inst as EcoCT<CF>;
  }
}

export class EcoInstanceBase extends AsyncConstructor {
  proxyFactory!: EcoProxyFactory;
  chainId!: bigint;
  domain!: string;
  deployer!: HardhatEthersSigner;
  deployedBlockNumber!: number;
  address!: string;

  constructor(domain = "test", asyncContructor?: () => Promise<void>, deployer?: HardhatEthersSigner) {
    super(async () => {
      this.proxyFactory = await EcoProxyFactory.getInstance();
      this.chainId = this.proxyFactory.chainId;
      this.domain = domain;
      this.deployer = deployer ?? (await hre.ethers.getSigners())[0];
      if (asyncContructor) await asyncContructor();
    });
  }

  _bindingDeployInfo(address: string, deployedBlockNumber: number) {
    this.checkUnbind();
    this.address = address;
    this.deployedBlockNumber = deployedBlockNumber;
  }

  isBind() {
    return !!this.address && !!this.deployedBlockNumber;
  }

  checkUnbind() {
    if (this.isBind()) throw new Error("Binded");
  }
  checkBind() {
    if (!this.isBind()) throw new Error("Unbinded");
  }

  async getAddres(): Promise<string> {
    this.checkBind();
    return this.address;
  }

  getSelector(contractMethod: { fragment: { selector: string } }): string {
    return getSelector(contractMethod);
  }
}

const DefaultInfoDir = "eco-contract-info/";
const DefaultAbiDir = DefaultInfoDir + "abi/";

interface EcoContractInfo {
  label: string;
  address: string;
  deployAt: number;
  abi: string;
}

export class EcoUUPS<CF extends EcoCF<CF>> extends EcoInstanceBase {
  logic!: EcoCT<CF>;
  inst!: EcoCT<CF>;
  label!: string;
  factory!: CF;

  constructor(
    factoryType: CFConstructor<CF>,
    domain?: string,
    asyncContructor?: () => Promise<void>,
    deployer?: HardhatEthersSigner,
  ) {
    super(
      domain,
      async () => {
        this.label = factoryType.name.replace("__factory", "");
        this.factory = (await hre.ethers.getContractFactory(this.label)) as unknown as CF;
        if (asyncContructor) await asyncContructor();
      },
      deployer,
    );
  }

  async deployLogic(implArgs?:unknown[]) {
    this.logic = await this.proxyFactory._deployLogic(this.factory, implArgs, this.deployer);
  }

  async useLogic(implArgs?:unknown[]) {
    if(!this.logic) this.deployLogic(implArgs);
  }

  async deploy(inputBuilder?: () => Promise<string>, implArgs?:unknown[]) {
    await this.useLogic(implArgs);
    const input = inputBuilder ? await inputBuilder() : "0x";
    this.inst = await this.proxyFactory._deployProxy(this.logic, input, this.deployer);
    this._bindingDeployInfo(this.inst.address, this.inst.deployedBlockNumber);
  }

  async use(inputBuilder?: () => Promise<string>, implArgs?:unknown[]) {
    if(!this.isBind()) this.deploy(inputBuilder, implArgs);
  }

  async upgrade(inputBuilder?: () => Promise<string>, implArgs?:unknown[]) {
    this.checkBind();

    await this.deployLogic(implArgs);

    const input = inputBuilder ? await inputBuilder() : "0x";
    await this.inst.upgradeToAndCall!(this.logic, input);
  }

  async importContractInfo() {
    this.checkUnbind();
    try {
      const instancePath = path.join(DefaultInfoDir, this.chainId.toString(), this.domain, this.label + ".json");
      const jsonString = fs.readFileSync(instancePath, "utf-8");
      return JSON.parse(jsonString) as EcoContractInfo;
    } catch (error) {
      if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
        return { label: this.label, address: "", deployAt: 0, abi: "" } as EcoContractInfo;
      } else throw error;
    }
  }

  async exportEcoContractInfo() {
    this.checkBind();

    const contractPaths = filesInDirectory(__dirname + "/../artifacts/contracts/");
    for (const contractPath of contractPaths) {
      const baseName = path.basename(contractPath, ".json");
      if (!baseName.startsWith("I") && baseName.endsWith(this.label)) {
        await writeAbiFromArtifact(this.label, contractPath, DefaultAbiDir);
      }
    }

    const instInfo: EcoContractInfo = {
      label: this.label,
      address: this.address,
      deployAt: this.deployedBlockNumber,
      abi: "abi/" + this.label + ".json",
    };

    const servicePath = path.join(DefaultInfoDir, this.chainId.toString(), this.domain);
    createDirectoryIfNotExists(servicePath);
    fs.writeFileSync(path.join(servicePath, this.label + ".json"), JSON.stringify(instInfo, null, 2), "utf8");
  }
}

export class Testing<CF extends EcoCF<CF>> extends EcoUUPS<Test_SelectorRoleControlUpgradeable__factory> {
  constructor(
    asyncContructor?: () => Promise<void>,
    deployer?: HardhatEthersSigner
  ) {
    super(
      Test_SelectorRoleControlUpgradeable__factory,
      "test",
      asyncContructor,
      deployer
    );
  }
}

async function test() {
  const tt = await new EcoUUPS(Test_SelectorRoleControlUpgradeable__factory);
  tt.inst.owner();

  const ww = await new Testing();
  ww.inst.owner();
}