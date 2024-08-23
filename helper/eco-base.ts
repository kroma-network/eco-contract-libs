import fs from "fs";
import path from "path";

import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { AsyncConstructor } from "async-constructor";
import { AddressLike, BaseContract, BytesLike, ContractFactory, ContractTransactionResponse } from "ethers";
import hre from "hardhat";

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

export type EcoContractFactory<CT> = {
  deploy(...args: any[]): Promise<CT>;
  attach(...args: any[]): CT;
  connect(...args: any[]): EcoContractFactory<CT>;
};

export type EcoCF<CF extends EcoContractFactory<EcoContract<CF>>> = EcoContractFactory<EcoContract<CF>>;

interface ContractVerbose {
  deployedBlockNumber: number;
  address: string;
}

interface IEcoUUPSUpgradeable {
  upgradeToAndCall(newImplementation: AddressLike, data: BytesLike): Promise<void>;
}
export type EcoContract<CF extends EcoContractFactory<EcoContract<CF>>> = Awaited<ReturnType<CF["deploy"]>> & {
  waitForDeployment(): Promise<EcoContract<CF>>;
} & { deploymentTransaction(): ContractTransactionResponse } & BaseContract &
  IEcoUUPSUpgradeable &
  ContractVerbose;
type CFConstructor<CF> = new (...args: any[]) => CF | ContractFactory;

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

  private async _deployProxy<CF extends EcoContractFactory<EcoContract<CF>>>(
    impl: EcoContract<CF>,
    initData: BytesLike,
    deployer?: HardhatEthersSigner,
  ) {
    const _deployer = deployer ?? this.deployer;
    const proxy = await this.factory.connect(_deployer).deploy(impl, initData);
    const inst = (await proxy.waitForDeployment()) as EcoContract<CF>;
    inst.address = await proxy.getAddress();
    inst.deployedBlockNumber = proxy.deploymentTransaction()!.blockNumber!;
    return inst;
  }

  // async deployInstance(deployer?:HardhatEthersSigner) {
  //   const _deployer = deployer ? deployer : this.deployer;
  //   const proxy = this._deployProxy()
  //   // await proxy.waitForDeployment();
  //   // proxy.deploymentTransaction()!.blockNumber;
  // }

  async _deployImpl<CF extends EcoContractFactory<EcoContract<CF>>>(
    implFactory: CF,
    implConstructArgs?: unknown[],
    deployer?: HardhatEthersSigner,
  ): Promise<EcoContract<CF>> {
    const _deployer = deployer ?? this.deployer;
    const _implFactory = implFactory.connect(_deployer);
    const impl = implConstructArgs ? await _implFactory.deploy(implConstructArgs) : await _implFactory.deploy();
    await impl.waitForDeployment();

    impl.address = await impl.getAddress();
    impl.deployedBlockNumber = impl.deploymentTransaction()!.blockNumber!;
    return impl;
  }

  async deployWithImpl<CF extends EcoContractFactory<EcoContract<CF>>>(
    implFactory: CF,
    proxyInitData: BytesLike,
    implConstructArgs?: unknown[],
    deployer?: HardhatEthersSigner,
  ) {
    const _deployer = deployer ?? this.deployer;
    const impl = await this._deployImpl(implFactory, implConstructArgs, _deployer);
    const inst = await this._deployProxy(impl, proxyInitData, _deployer);
    return inst;
  }

  // async reuse(deployer?:HardhatEthersSigner) {
  //   const _deployer = deployer ? deployer : this.deployer;
  //   const proxy = await this.factory.connect(_deployer).deploy(impl, initData);
  // }

  // async upgrade
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
  inst!: EcoContract<CF>;
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

  async use(inputBuilder?: () => Promise<string>, implArgs?: unknown[]) {
    this.checkUnbind();

    const input = inputBuilder ? await inputBuilder() : "0x";
    this.inst = await this.proxyFactory.deployWithImpl(this.factory, input, implArgs, this.deployer);
    this._bindingDeployInfo(this.inst.address, this.inst.deployedBlockNumber);
  }

  async upgrade(inputBuilder?: () => Promise<string>, implArgs?: unknown[]) {
    this.checkBind();

    const impl = await this.proxyFactory._deployImpl(this.factory, implArgs, this.deployer);
    const input = inputBuilder ? await inputBuilder() : "0x";
    await this.inst.upgradeToAndCall(impl, input);
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
