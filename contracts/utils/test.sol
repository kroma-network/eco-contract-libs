// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./prng.sol";

using Keccak256RG for Keccak256RG.KeccakRGState;
using LCG10000 for LCG10000.LCGState;

contract TestPRNG {
    function keccakBytes32(bytes32 word) public pure returns (bytes32) {
        return keccak256(abi.encode(word));
    }

    function keccakNumber(uint256 number) public pure returns (bytes32) {
        return keccak256(abi.encode(number));
    }

    function reduceXOR64(bytes32 data) public pure returns (bytes32) {
        return bytes32ReduceXOR64(data);
    }

    function reduceXORbits(bytes32 data, uint256 bits) public pure returns (bytes32) {
        return reduceXOR(data, bits);
    }

    function genKeccak(bytes32 seed, uint256 count) public pure returns (uint256[] memory randoms) {
        randoms = new uint256[](count);

        Keccak256RG.KeccakRGState memory kst = Keccak256RG.init(seed, 16);
        for (uint256 i; i < count; i++) {
            randoms[i] = kst.yield10000();
        }
    }

    function genLCG(bytes32 seed, uint256 count) public pure returns (uint256[] memory randoms) {
        randoms = new uint256[](count);

        LCG10000.LCGState memory lcg = LCG10000.init(seed, 10000);
        for (uint256 i; i < count; i++) {
            randoms[i] = lcg.yield10000();
        }
    }
}
