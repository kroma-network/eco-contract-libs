import * as fs from "fs";
import * as path from "path";

const DefaultInfoDir = "eco-contract-info/";
const DefaultAbiDir = DefaultInfoDir + "abi/";

const createDirectoryIfNotExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Directory created: ${dirPath}`);
  }
};

interface FileError {
  code: string;
  message: string;
}

export function getSelector(contractMethod: { fragment: { selector: string } }): string {
  return contractMethod.fragment.selector;
}

async function writeAbiFromArtifact(serviceLabel: string, artifactPath: string, abiDirectory: string) {
  const hardhatArtifact = (await import(artifactPath)) as { abi: unknown[] };
  fs.writeFileSync(
    path.join(abiDirectory, serviceLabel) + ".json",
    JSON.stringify(hardhatArtifact.abi, null, 2),
    "utf8",
  );
}

function filesInDirectory(startPath: string, filter = RegExp(/\.json$/)): string[] {
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

interface ContractInfo {
  label: string;
  address: string;
  deployAt: number;
  abi: string;
}

export async function exportContractInfo(domain: string, label: string, inst: BaseContract) {
  await inst.waitForDeployment();
  const deployTxReceipt = await inst.deploymentTransaction()?.wait();
  const _chainId = (await hre.ethers.provider.getNetwork()).chainId;
  const chainId = _chainId.toString();

  if (chain.isDevnet(_chainId)) return;

  const contractPaths = filesInDirectory(__dirname + "/../artifacts/contracts/");
  for (const contractPath of contractPaths) {
    const baseName = path.basename(contractPath, ".json");
    if (!baseName.startsWith("I") && baseName.endsWith(label)) {
      await writeAbiFromArtifact(label, contractPath, DefaultAbiDir);
    }
  }

  // todo: use deploymentTx or search algorithms!!!
  const instInfo: ContractInfo = {
    label: label,
    address: deployTxReceipt?.contractAddress as string,
    deployAt: deployTxReceipt?.blockNumber as number,
    abi: "abi/" + label + ".json",
  };

  const servicePath = path.join(DefaultInfoDir, chainId, domain);
  createDirectoryIfNotExists(servicePath);
  fs.writeFileSync(path.join(servicePath, label + ".json"), JSON.stringify(instInfo, null, 2), "utf8");
}

export async function importContractInfo(domain: string, label: string, chainId?: string): Promise<ContractInfo> {
  if (!chainId) {
    chainId = (await hre.ethers.provider.getNetwork()).chainId.toString();
  }

  try {
    const instancePath = path.join(DefaultInfoDir, chainId, domain, label + ".json");
    const jsonString = fs.readFileSync(instancePath, "utf-8");
    return JSON.parse(jsonString) as ContractInfo;
  } catch (error) {
    const err = error as FileError;
    if (err.code === "ENOENT") {
      return { address: hre.ethers.ZeroAddress } as ContractInfo;
    } else {
      throw err;
    }
  }
}

import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { AsyncConstructor } from "async-constructor";
import { BaseContract, BytesLike } from "ethers";
import hre from "hardhat";

import * as chain from "./const/chain-list";
import { ContractFactoryTypeSupporter, EcoProxiedInstanceWithFactory, ProxyInstanceFactory } from "./eco-proxy";

export class EcoServiceHelper extends AsyncConstructor {
  deployer!: HardhatEthersSigner;
  proxyInstanceFactory!: ProxyInstanceFactory;

  constructor(asyncContructor: () => Promise<void>, deployer?: HardhatEthersSigner) {
    super(async () => {
      this.deployer = deployer ? deployer : (await hre.ethers.getSigners())[0];
      this.proxyInstanceFactory = await new ProxyInstanceFactory();

      await asyncContructor();
    });
  }

  getSelector(contractMethod: { fragment: { selector: string } }): string {
    return getSelector(contractMethod);
  }
}

type Constructor<CF> = new (...args: any) => CF;

export class ContractInstance<
  CF extends ContractFactoryTypeSupporter<CT>,
  CT extends BaseContract,
> extends EcoServiceHelper {
  factory!: CF;
  inst!: Awaited<ReturnType<CF["deploy"]>> | EcoProxiedInstanceWithFactory<CT>;
  domain!: string;
  label!: string;

  constructor(domain: string, fatoryType: Constructor<CF>, deployer?: HardhatEthersSigner) {
    super(async () => {
      this.domain = domain;
      this.label = fatoryType.name.replace("__factory", "");
      this.factory = (await hre.ethers.getContractFactory(this.label)) as unknown as CF;
    }, deployer);
  }

  async load(target?: string) {
    const info = await importContractInfo("erc20", this.label);
    if (target) this.inst = this.factory.attach(target) as Awaited<ReturnType<CF["deploy"]>>;
    else if (info.address) {
      this.inst = this.factory.attach(info.address) as Awaited<ReturnType<CF["deploy"]>>;
    } else {
      throw "load: " + this.domain + "/" + this.label;
    }
  }

  async deploy(deployArgs: unknown[], input: BytesLike) {
    this.inst = await this.proxyInstanceFactory.deployWithFactory(this.factory, deployArgs, input);
  }

  getSelector(contractMethod: { fragment: { selector: string } }): string {
    return getSelector(contractMethod);
  }

  async exportInstanceInfo() {
    await exportContractInfo(this.domain, this.label, this.inst);
  }
}
