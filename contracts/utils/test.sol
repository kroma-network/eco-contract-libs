// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./prng.sol";

using Keccak256RG for Keccak256RG.KeccakRGState;
using LCG10000 for LCG10000.LCGState;

contract TestPRNG {
    function testBytes32Keccak(bytes32 data) public pure returns (bytes32) {
        return bytes32Keccak(data);
    }

    function testReduceXOR32(bytes32 word) public pure returns (bytes32) {
        return reduceXOR32(word);
    }

    function testReduceXOR(bytes32 word, uint256 out_bits) public pure returns (bytes32) {
        return reduceXOR(word, out_bits);
    }

    function genKeccak(bytes32 seed, uint256 count) public pure returns (uint256[] memory randoms) {
        randoms = new uint256[](count);

        Keccak256RG.KeccakRGState memory kst = Keccak256RG.init(seed, 16);
        for (uint256 i; i < count; i++) {
            randoms[i] = kst.yield10000();
        }
    }

    function genLCGYield(bytes32 seed, uint256 count) public pure returns (uint256[] memory randoms) {
        randoms = new uint256[](count);

        LCG10000.LCGState memory lcg = LCG10000.init(seed, 10000);
        for (uint256 i; i < count; i++) {
            randoms[i] = lcg.yield();
        }
    }

    function genLCGYield10000(bytes32 seed, uint256 count) public pure returns (uint256[] memory randoms) {
        randoms = new uint256[](count);

        LCG10000.LCGState memory lcg = LCG10000.init(seed, 10000);
        for (uint256 i; i < count; i++) {
            randoms[i] = lcg.yield10000();
        }
    }

    function genLCGByState(uint128 state, uint256 count) public pure returns (uint256[] memory randoms) {
        randoms = new uint256[](count);

        LCG10000.LCGState memory lcg = LCG10000.init10000ByState(state);
        for (uint256 i; i < count; i++) {
            randoms[i] = lcg.yield10000();
        }
    }

    // for branch coverage
    function updateWeed(Keccak256RG.KeccakRGState memory kst) public pure {
        return Keccak256RG.updateWeed(kst);
    }

    function yield16(Keccak256RG.KeccakRGState memory kst) public pure returns (uint16 value) {
        return Keccak256RG.yield16(kst);
    }
}

import "./rate.sol";

contract TestRate {
    function rateApply(Rate rate, uint256 value) public pure returns (uint256) {
        return RateMath.rateApply(rate, value);
    }

    function rateAdd(Rate rate, uint256 value) public pure returns (uint256) {
        return RateMath.rateAdd(rate, value);
    }

    function rateSub(Rate rate, uint256 value) public pure returns (uint256) {
        return RateMath.rateSub(rate, value);
    }

    function down(Rate rate, Rate basisPoint) public pure returns (Rate result) {
        return RateMath.down(rate, basisPoint);
    }

    function up(Rate rate, Rate basisPoint) public pure returns (Rate result) {
        return RateMath.up(rate, basisPoint);
    }
}
