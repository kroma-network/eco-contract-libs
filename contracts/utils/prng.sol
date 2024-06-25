// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

function bytes32ReduceXOR64(bytes32 data) pure returns (bytes8) {
    return bytes8(data ^ (data << 64) ^ (data << 128) ^ (data << 192));
}

function reduceXOR32(bytes32 data) pure returns (bytes4) {
    return bytes4(reduceXOR(data, 32));
}

function reduceXOR(bytes32 data, uint256 out_bits) pure returns (bytes32) {
    require(256 % out_bits == 0);
    bytes32 tmp;
    for (uint256 bit_shift; bit_shift < 256; bit_shift += out_bits) {
        tmp ^= data << bit_shift;
    }
    return tmp;
}

function uint256Keccak(uint256 data) pure returns (bytes32) {
    return bytes32Keccak(bytes32(data));
}

function bytes32Keccak(bytes32 data) pure returns (bytes32) {
    assembly {
        mstore(0x00, data)
        data := keccak256(0x00, 0x20)
    }
    return data;
}

function nomalize(uint256 value, uint256 nomalizeRange, uint256 valueRange) pure returns (uint128) {
    return uint128((value * nomalizeRange) / valueRange);
}

// Keccak256 Random Gnerator
library Keccak256RG {
    uint128 constant keccak16Max = 2 ** 16;
    struct KeccakRGState {
        bytes32 seed;
        bytes32 weed;
        uint64 yieldSize;
        uint64 weedBitShifter;
    }

    function init(bytes32 seed, uint64 yieldSize) internal pure returns (KeccakRGState memory kst) {
        kst.seed = seed;
        kst.weed = bytes32Keccak(kst.seed);
        kst.yieldSize = yieldSize;
    }

    function updateWeed(KeccakRGState memory kst) internal pure {
        require(kst.weedBitShifter == 256 && kst.weed != bytes32(0));
        kst.weed = bytes32Keccak(kst.weed);
        kst.weedBitShifter = 0;
    }

    function yield16(KeccakRGState memory kst) internal pure returns (uint16 value) {
        require(kst.yieldSize == 16);
        unchecked {
            if (kst.weedBitShifter == 256) updateWeed(kst);
            value = uint16(bytes2(kst.weed << kst.weedBitShifter));
            kst.weedBitShifter += kst.yieldSize;
        }
    }

    function yield10000(KeccakRGState memory kst) internal pure returns (uint16) {
        return uint16(nomalize(yield16(kst), 10000, keccak16Max));
    }
}

// Linear Congruential Generator
library LCG10000 {
    uint128 constant lcgMax = 2 ** 32;

    struct LCGState {
        uint128 state;
        uint128 normalizeRange;
    }

    function init(bytes32 seedLikeHash, uint128 normalizeRange) internal pure returns (LCGState memory lcg) {
        lcg.normalizeRange = normalizeRange;
        unchecked {
            // lcg.state = nomalize(uint64(bytes32ReduceXOR64(seedLikeHash)), normalizeRange, 2 ** 64);
            lcg.state = uint32(reduceXOR32(seedLikeHash));
        }
    }

    function init10000ByState(uint128 state) internal pure returns (LCGState memory lcg) {
        lcg.state = state;
        lcg.normalizeRange = 10000;
    }

    function yield(LCGState memory lcg) internal pure returns (uint16) {
        unchecked {
            lcg.state = (1664525 * lcg.state + 1013904223) % lcgMax;
        }
        return uint16(nomalize(lcg.state, lcg.normalizeRange, lcgMax));
    }

    function yield10000(LCGState memory lcg) internal pure returns (uint16) {
        unchecked {
            lcg.state = (1664525 * lcg.state + 1013904223) % lcgMax;
        }
        return uint16(nomalize(lcg.state, 10000, lcgMax));
    }
}
