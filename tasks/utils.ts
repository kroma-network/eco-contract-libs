import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "ethers";


task("calc-slot", "calc slot value from string(ERC7201)")
    .addParam("string", "ERC7201 string for slot")
    .setAction(async (args, hre: HardhatRuntimeEnvironment) => {
        await namespaceSlot(args.string)
    });
task("slots", "calc slot value from string(ERC7201)")
    .setAction(async (_, hre: HardhatRuntimeEnvironment) => {
        const namespaces = [
            "eco.storage.ERC721TypedUpgradeable",
            "eco.storage.ERC721SequencialMintUpbradeable",
        ]
        namespaces.map(async (namespace) => console.log(await namespaceSlot(namespace), namespace))
    });

async function namespaceSlot(namespace:string) {
    // keccak256(abi.encode(uint256(keccak256(namespace)) - 1)) & ~bytes32(uint256(0xff))
    let hashNamespace = ethers.keccak256(ethers.toUtf8Bytes(namespace));

    let number = ethers.toBigInt(hashNamespace) -1n;

    let hash_second = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256"], [number]));

    let finalMasked = (ethers.toBigInt(hash_second) & (ethers.MaxUint256 - 255n)).toString(16);

    return finalMasked;
}