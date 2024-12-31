import fs from "fs";
import path from "path";

import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { AsyncConstructor } from "async-constructor";
import {
  AddressLike,
  BaseContract,
  BytesLike,
  Contract,
  ContractFactory,
  ContractTransactionResponse,
} from "ethers";
import hre from "hardhat";
import { getChainId } from "./chain";

type EcoContractInfo = {
  label: string;
  address: string;
  deployAt: number;
  abi?: string;
  openfort?: `con_${string}`;
};

type EcoDeploymentDetail = EcoContractInfo & {
  waitForDeployment(): any;
  upgradeToAndCall(
    newImplementation: AddressLike,
    data: BytesLike,
  ): Promise<void>;
  deploymentTransaction(): ContractTransactionResponse;
} & BaseContract;

// IContractFactory 인터페이스 정의
export interface IContractFactory<CT> {
  deploy(...args: any[]): Promise<CT>;
  connect(...args: any[]): IContractFactory<CT>;
  attach(...args: any[]): any;
}

// ContractFactoryType 및 ReturnCT 정의
export type ContractFactoryType<CT> = IContractFactory<CT>;
export type ReturnCT<CF extends IContractFactory<unknown>> =
  CF extends IContractFactory<infer CT> ? CT : never;

// EcoCF와 CFConstructor 타입 정의
export type EcoCF<CF extends IContractFactory<unknown>> = ContractFactoryType<
  ReturnCT<CF>
>;
export type EcoCT<CF extends IContractFactory<unknown>> = ReturnCT<CF> &
  EcoDeploymentDetail;
export type CFConstructor<CF> = new (...args: any[]) => CF;

export function filesInDirectory(
  startPath: string,
  filter = RegExp(/\.json$/),
): string[] {
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

async function getArtifact(artifactPath: string) {
  return (await import(artifactPath)) as { abi: unknown[] };
}

export async function writeAbi(
  abi: unknown[],
  abiDirectory: string,
  serviceLabel: string,
) {
  fs.writeFileSync(
    path.join(abiDirectory, serviceLabel) + ".json",
    JSON.stringify(abi, null, 2),
    "utf8",
  );
}

export function createDirectoryIfNotExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Directory created: ${dirPath}`);
  }
}

export function getSelector(contractMethod: {
  fragment: { selector: string };
}): string {
  return contractMethod.fragment.selector;
}

export class EcoProxyFactory extends AsyncConstructor {
  readonly IMPLEMENTATION_SLOT =
    "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
  readonly ADMIN_SLOT =
    "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";
  private static instance: EcoProxyFactory;

  chainId!: bigint;
  deployer!: HardhatEthersSigner;

  factory!: ContractFactory;

  private constructor(
    deployer?: HardhatEthersSigner,
    asyncContructor?: () => Promise<void>,
  ) {
    super(async () => {
      this.chainId = await getChainId();
      this.deployer = deployer ?? (await hre.ethers.getSigners())[0];
      this.factory = (
        await hre.ethers.getContractFactory("ERC1967Proxy")
      ).connect(this.deployer);
      if (asyncContructor) await asyncContructor();
    });
  }

  public static async getInstance(): Promise<EcoProxyFactory> {
    if (!EcoProxyFactory.instance) {
      EcoProxyFactory.instance = await new EcoProxyFactory();
    }
    return EcoProxyFactory.instance;
  }

  async _deployProxy<CF extends EcoCF<CF>>(
    logic: EcoCT<CF>,
    initData: BytesLike,
    deployer?: HardhatEthersSigner,
  ) {
    const _deployer = deployer ?? this.deployer;
    const proxy = await this.factory.connect(_deployer).deploy(logic, initData);
    await proxy.waitForDeployment();
    const address = await proxy.getAddress();
    const inst = logic.attach(address) as unknown as EcoCT<CF>;
    inst.address = address;
    inst.deployAt = proxy.deploymentTransaction()!.blockNumber!;
    return inst;
  }

  async _deployLogic<CF extends EcoCF<CF>>(
    implFactory: CF,
    implConstructArgs?: unknown[],
    deployer?: HardhatEthersSigner,
  ): Promise<EcoCT<CF>> {
    const _deployer = deployer ?? this.deployer;
    const _implFactory = implFactory.connect(_deployer);
    const logic = (
      implConstructArgs
        ? await _implFactory.deploy(...implConstructArgs)
        : await _implFactory.deploy()
    ) as EcoCT<CF>;
    await logic.waitForDeployment();

    logic.address = await logic.getAddress();
    logic.deployAt = logic.deploymentTransaction()!.blockNumber!;
    return logic;
  }

  async deployWithImpl<CF extends EcoCF<CF>>(
    implFactory: CF,
    proxyInitData: BytesLike,
    implConstructArgs?: unknown[],
    deployer?: HardhatEthersSigner,
  ): Promise<EcoCT<CF>> {
    const _deployer = deployer ?? this.deployer;
    const logic = await this._deployLogic(
      implFactory,
      implConstructArgs,
      _deployer,
    );
    const inst = await this._deployProxy(logic, proxyInitData, _deployer);
    return inst;
  }

  async getLogicAddress(inst: AddressLike) {
    const slotData = await hre.ethers.provider.getStorage(
      inst,
      this.IMPLEMENTATION_SLOT,
    );
    return hre.ethers.getAddress("0x" + slotData.slice(40));
  }

  async findDeployAt(contractAddress: string) {
    const latestBlock = BigInt(await hre.ethers.provider.getBlockNumber());
    let low = 0n;
    let high = latestBlock;

    while (low <= high) {
      const mid = (low + high) / 2n;
      const code = await hre.ethers.provider.getCode(contractAddress, mid);

      if (code !== "0x") {
        // Check if this is the first block where the contract was deployed
        const previousCode = await hre.ethers.provider.getCode(
          contractAddress,
          mid - 1n,
        );
        if (previousCode === "0x") {
          return Number(mid);
        }
        high = mid - 1n;
      } else {
        low = mid + 1n;
      }
    }

    throw Error("Cannot Find Deployed Block");
  }
}

export class EcoInstanceBase extends AsyncConstructor {
  proxyFactory!: EcoProxyFactory;
  chainId!: bigint;
  domain!: string;
  deployer!: HardhatEthersSigner;

  deployAt!: number;
  address!: string;

  constructor(
    domain = "test",
    asyncContructor?: () => Promise<void>,
    deployer?: HardhatEthersSigner,
  ) {
    super(async () => {
      this.proxyFactory = await EcoProxyFactory.getInstance();
      this.chainId = this.proxyFactory.chainId;
      this.domain = domain;
      this.deployer = deployer ?? (await hre.ethers.getSigners())[0];
      if (asyncContructor) await asyncContructor();
    });
  }

  async logicInput() {
    return undefined as unknown as unknown[];
  }

  async _bindingAddress(address: string) {
    this.checkUnbind();
    this.address = address;
  }
  async _bindingDeployInfo(address: string, deployAt?: number) {
    await this._bindingAddress(address);
    this.deployAt = deployAt ?? (await this.proxyFactory.findDeployAt(address));
  }

  isBind() {
    return !!this.address;
  }

  checkUnbind() {
    if (this.isBind()) throw new Error("Binded");
  }

  checkBind() {
    if (!this.isBind()) throw new Error("Unbinded");
  }

  async getAddress(): Promise<string> {
    this.checkBind();
    return this.address;
  }

  getSelector(contractMethod: { fragment: { selector: string } }): string {
    return getSelector(contractMethod);
  }
}

const DefaultInfoDir = "eco-contract-info/";
const DefaultAbiDir = DefaultInfoDir + "abi/";

export class EcoUUPS<CF extends EcoCF<CF>>
  extends EcoInstanceBase
  implements EcoContractInfo
{
  label!: string;
  factory!: CF;
  logic!: EcoCT<CF>;
  inst!: EcoCT<CF>;
  openfort?: `con_${string}`;

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
        this.factory = (await hre.ethers.getContractFactory(
          this.label,
        )) as unknown as CF;
        if (asyncContructor) await asyncContructor();
      },
      deployer,
    );
  }

  async deployLogic(implArgs?: unknown[]) {
    this.logic = await this.proxyFactory._deployLogic(
      this.factory,
      implArgs ?? (await this.logicInput()),
      this.deployer,
    );
  }

  async useLogic(implArgs?: unknown[]) {
    if (!this.logic) {
      await this.deployLogic(implArgs);
      return true;
    }
    return false;
  }

  async deploy(inputBuilder?: () => Promise<string>, implArgs?: unknown[]) {
    this.checkUnbind();
    await this.useLogic(implArgs);
    const input = inputBuilder ? await inputBuilder() : "0x";
    this.inst = await this.proxyFactory._deployProxy(
      this.logic,
      input,
      this.deployer,
    );
    await this._bindingDeployInfo(this.inst.address, this.inst.deployAt);
  }

  async use(inputBuilder?: () => Promise<string>, implArgs?: unknown[]) {
    if (!this.isBind()) {
      await this.deploy(inputBuilder, implArgs);
      return true;
    }
    return false;
  }

  async upgrade(inputBuilder?: () => Promise<string>, implArgs?: unknown[]) {
    this.checkBind();

    await this.deployLogic(implArgs);

    const input = inputBuilder ? await inputBuilder() : "0x";
    await this.inst.upgradeToAndCall(this.logic, input);
  }

  async attach(address: AddressLike) {
    this.checkUnbind();
    this.inst = (await this.factory.attach(address)) as EcoCT<CF>;
    this.logic = (await this.factory.attach(
      this.proxyFactory.getLogicAddress(this.inst),
    )) as EcoCT<CF>;
    this.logic.address = await this.logic.getAddress();
    await this._bindingAddress(this.inst.address);
  }

  async attachFromInfo(info: EcoContractInfo) {
    this.checkUnbind();
    console.log("load", this.label, info.address);
    this.inst = (await this.factory.attach(info.address)) as EcoCT<CF>;
    this.inst.address = info.address;
    this.inst.deployAt = info.deployAt;
    this.openfort = info.openfort;
    await this._bindingDeployInfo(this.inst.address, info.deployAt);
  }

  async load(address?: AddressLike) {
    if (address) {
      await this.attach(address);
    } else {
      await this.attachFromInfo(await this.importEcoContractInfo());
    }
  }

  async importEcoContractInfo() {
    this.checkUnbind();
    const instancePath = path.join(
      DefaultInfoDir,
      this.chainId.toString(),
      this.domain,
      this.label + ".json",
    );
    const jsonString = fs.readFileSync(instancePath, "utf-8");
    try {
      return JSON.parse(jsonString) as EcoContractInfo;
    } catch (error) {
      throw new Error("Contract info could not be loaded." + instancePath);
    }
  }

  artifactPath() {
    const artifactPathList = filesInDirectory(
      process.cwd() + "/artifacts/contracts/",
    );
    for (const artifactPath of artifactPathList) {
      const rmFileExt = path.basename(artifactPath, ".json");
      if (!rmFileExt.startsWith("I") && rmFileExt.endsWith(this.label)) {
        return artifactPath;
      }
    }
    throw Error(this.label + "artifactPath");
  }

  async getAbi() {
    return (await getArtifact(this.artifactPath())).abi;
  }

  async writeContractInfo() {
    const instInfo: EcoContractInfo = {
      label: this.label,
      address: this.address,
      deployAt:
        this.deployAt ?? (await this.proxyFactory.findDeployAt(this.address)),
      abi: "abi/" + this.label + ".json",
      openfort: this.openfort,
    };

    const servicePath = path.join(
      DefaultInfoDir,
      this.chainId.toString(),
      this.domain,
    );
    createDirectoryIfNotExists(servicePath);
    fs.writeFileSync(
      path.join(servicePath, this.label + ".json"),
      JSON.stringify(instInfo, null, 2),
      "utf8",
    );
  }

  async exportEcoContractInfo() {
    this.checkBind();

    await Promise.all([
      writeAbi(await this.getAbi(), DefaultAbiDir, this.label),
      this.writeContractInfo(),
    ]);
  }
}
