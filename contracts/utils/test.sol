// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { Ubp, Ibp, UbpMath, IbpMath } from "./BasisPointRateMath.sol";

contract TestUbpMath {
    using UbpMath for Ubp;
    using UbpMath for Ibp;

    function wrap(Ibp bp) public pure returns (Ubp) {
        return UbpMath.wrap(bp);
    }

    function add(Ubp a, Ubp b) public pure returns (Ubp) {
        return a.add(b);
    }

    function sub(Ubp a, Ubp b) public pure returns (Ubp) {
        return a.sub(b);
    }

    function mul(Ubp a, Ubp b) public pure returns (Ubp) {
        return a.mul(b);
    }

    function mul(Ubp a, uint b) public pure returns (uint) {
        return a.mul(b);
    }

    function div(Ubp a, Ubp b) public pure returns (Ubp) {
        return a.div(b);
    }

    function div(uint a, Ubp b) public pure returns (uint) {
        return UbpMath.div(a, b);
    }

    function isZero(Ubp a) public pure returns (bool result) {
        return a.isZero();
    }

    function lt(Ubp a, Ubp b) public pure returns (bool result) {
        return a.lt(b);
    }

    function toUbp(uint numerator, uint denominator) public pure returns (Ubp bp) {
        return UbpMath.toUbp(numerator, denominator);
    }
}

contract TestIbpMath {
    using IbpMath for Ibp;
    using IbpMath for Ubp;

    function wrap(uint256 underlying) public pure returns (Ibp) {
        return IbpMath.wrap(underlying);
    }

    function wrap(int256 underlying) public pure returns (Ibp) {
        return IbpMath.wrap(underlying);
    }

    function unwrap(Ibp bp) public pure returns (int256) {
        return bp.unwrap();
    }

    function unwrap(Ubp bp) public pure returns (int32) {
        return bp.unwrap();
    }

    function add(Ibp a, Ibp b) public pure returns (Ibp) {
        return a.add(b);
    }

    function sub(Ibp a, Ibp b) public pure returns (Ibp) {
        return a.sub(b);
    }

    function mul(Ibp a, Ibp b) public pure returns (Ibp) {
        return a.mul(b);
    }

    function mul(Ibp a, Ubp b) public pure returns (Ibp) {
        return a.mul(b);
    }

    function mul(Ibp a, uint b) public pure returns (int256) {
        return a.mul(b);
    }

    function mul(Ibp a, int b) public pure returns (int) {
        return a.mul(b);
    }

    function div(Ibp a, Ibp b) public pure returns (Ibp) {
        return a.div(b);
    }

    function isZero(Ibp a) public pure returns (bool result) {
        return a.isZero();
    }

    function lt(Ibp a, Ibp b) public pure returns (bool result) {
        return a.lt(b);
    }

    function lt2(Ibp a, int32 b) public pure returns (bool result) {
        return a.lt(b);
    }

    function toIbp(int256 numerator, int256 denominator) public pure returns (Ibp bp) {
        return IbpMath.toIbp(numerator, denominator);
    }
}
