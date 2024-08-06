
import { ethers } from "hardhat";
import * as Contracts from "../typechain-types";
import { BaseContract, ContractFactory, ContractRunner } from "ethers";
import { EcoERC721Base__factory } from "../typechain-types";

async function factoryWrapper(name: string) {
  return await ethers.getContractFactory(name);
}

// ContractFactory 타입 정의
interface IEcoContractFactory<T> {
  name:string;
  deploy(...args: any[]): T;
  attach(...args: any[]): T;
}

type EcoContractFactory<T> = {
  name:string;
  connect(...args: any[]): T;
};

async function create<T>(factoryType: EcoContractFactory<T>): Promise<T> {
  const _factoryType = factoryType as unknown as IEcoContractFactory<T>;
  const label = _factoryType.name.replace("__factory", "");
  const factory = (await ethers.getContractFactory(label)) as unknown as IEcoContractFactory<T>;

  return await factory.deploy();
}

async function main() {
  // const contract = await create(Contracts.AccessControlUpgradeable__factory);
  const contract = await create(Contracts.Mock_TestEcoOwnable__factory);
  console.log(await contract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
