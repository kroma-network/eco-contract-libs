// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { SafeCast } from "@openzeppelin/contracts/utils/math/SafeCast.sol";

/*
 1000000 = 1.0 = 100%
 10000 = 0.01 = 1%
 100 = 0.0001 = 0.01%
*/

uint256 constant UintBase = 1e18;
uint32 constant UbpBase = 10000;

type Ubp is uint32;

int256 constant IntBase = 1e18;
int32 constant IbpBase = 10000;

type Ibp is int32;

error ZeroDivision();

library UbpMath {
    function base() internal pure returns (Ubp) {
        return Ubp.wrap(UbpBase);
    }

    function wrap(Ibp bp) internal pure returns (Ubp) {
        return Ubp.wrap(SafeCast.toUint32(SafeCast.toUint256(Ibp.unwrap(bp))));
    }

    function add(Ubp a, Ubp b) internal pure returns (Ubp) {
        assembly {
            b := add(a, b)
        }
        return b;
    }

    function sub(Ubp a, Ubp b) internal pure returns (Ubp) {
        assembly {
            b := sub(a, b)
        }
        return b;
    }

    function mul(Ubp a, Ubp b) internal pure returns (Ubp) {
        assembly {
            b := div(mul(a, b), UbpBase)
        }
        return b;
    }

    function mul(Ubp a, uint b) internal pure returns (uint) {
        assembly {
            b := div(mul(a, b), UbpBase)
        }
        return b;
    }

    function div(Ubp a, Ubp b) internal pure returns (Ubp) {
        if (isZero(b)) revert ZeroDivision();
        assembly {
            b := div(mul(a, UbpBase), b)
        }
        return b;
    }

    function div(uint a, Ubp b) internal pure returns (uint) {
        if (isZero(b)) revert ZeroDivision();
        assembly {
            a := div(mul(a, UbpBase), b)
        }
        return a;
    }

    function isZero(Ubp a) internal pure returns (bool result) {
        assembly {
            result := eq(a, 0)
        }
    }

    function lt(Ubp a, Ubp b) internal pure returns (bool result) {
        assembly {
            result := lt(a, b)
        }
    }

    function toUbp(uint numerator, uint denominator) internal pure returns (Ubp bp) {
        if (denominator == 0) revert ZeroDivision();
        assembly {
            bp := div(mul(numerator, UbpBase), denominator)
        }
    }
}

library IbpMath {
    function base() internal pure returns (int256) {
        return IntBase;
    }

    function wrap(uint256 underlying) internal pure returns (Ibp) {
        return wrap(SafeCast.toInt256(underlying));
    }

    function wrap(int256 underlying) internal pure returns (Ibp) {
        return Ibp.wrap(SafeCast.toInt32(underlying));
    }

    function unwrap(Ibp bp) internal pure returns (int256) {
        return Ibp.unwrap(bp);
    }

    function unwrap(Ubp bp) internal pure returns (int32) {
        return SafeCast.toInt32(SafeCast.toInt256(Ubp.unwrap(bp)));
    }

    function add(Ibp a, Ibp b) internal pure returns (Ibp) {
        unchecked {
            return wrap(unwrap(a) + unwrap(b));
        }
    }

    function sub(Ibp a, Ibp b) internal pure returns (Ibp) {
        unchecked {
            return wrap(unwrap(a) - unwrap(b));
        }
    }

    function mul(Ibp a, Ibp b) internal pure returns (Ibp) {
        unchecked {
            return wrap((unwrap(a) * unwrap(b)) / IbpBase);
        }
    }

    function mul(Ibp a, Ubp b) internal pure returns (Ibp) {
        unchecked {
            return wrap((unwrap(a) * unwrap(b)) / IbpBase);
        }
    }

    function mul(Ibp a, uint b) internal pure returns (int256) {
        unchecked {
            return (unwrap(a) * SafeCast.toInt256(b)) / IbpBase;
        }
    }

    function mul(Ibp a, int b) internal pure returns (int) {
        unchecked {
            return (unwrap(a) * b) / IbpBase;
        }
    }

    function div(Ibp a, Ibp b) internal pure returns (Ibp) {
        if (isZero(b)) revert ZeroDivision();
        unchecked {
            return wrap((unwrap(a) * IbpBase) / unwrap(b));
        }
    }

    function isZero(Ibp a) internal pure returns (bool result) {
        return unwrap(a) == 0;
    }

    function lt(Ibp a, Ibp b) internal pure returns (bool result) {
        return unwrap(a) < unwrap(b);
    }

    function lt(Ibp a, int32 b) internal pure returns (bool result) {
        return unwrap(a) < b;
    }

    function toIbp(int256 numerator, int256 denominator) internal pure returns (Ibp bp) {
        if (denominator == 0) revert ZeroDivision();
        unchecked {
            return wrap((numerator * IbpBase) / denominator);
        }
    }
}
