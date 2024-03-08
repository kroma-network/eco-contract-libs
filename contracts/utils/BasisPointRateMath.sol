// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

uint256 constant UintBase = 1e18;
uint32 constant UbpBase = 10000;

type Ubp is uint32;

int256 constant IntBase = 1e18;
int32 constant IbpBase = 10000;

type Ibp is int32;

library UbpMath {
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
        assembly {
            b := div(mul(a, UbpBase), b)
        }
        return b;
    }

    function div(uint a, Ubp b) internal pure returns (uint) {
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
        assembly {
            bp := div(mul(numerator, UintBase), denominator)
        }
    }
}

library IbpMath {
    function wrap(uint256 underlying) internal pure returns (Ibp) {
        return Ibp.wrap(int32(uint32(underlying)));
    }

    function wrap(int256 underlying) internal pure returns (Ibp) {
        return Ibp.wrap(int32(underlying));
    }

    function unwrap(Ibp bp) internal pure returns (int256) {
        return Ibp.unwrap(bp);
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
            return wrap((unwrap(a) * unwrap(b)) / IntBase);
        }
    }

    function mul(Ibp a, uint b) internal pure returns (int256) {
        unchecked {
            return (unwrap(a) * int256(b)) / IntBase;
        }
    }

    function mul(Ibp a, int b) internal pure returns (int) {
        unchecked {
            return (unwrap(a) * b) / IntBase;
        }
    }

    function div(Ibp a, Ibp b) internal pure returns (Ibp) {
        unchecked {
            return wrap((unwrap(a) * IntBase) / unwrap(b));
        }
    }

    function isZero(Ibp a) internal pure returns (bool result) {
        return unwrap(a) == 0;
    }

    function lt(Ibp a, Ibp b) internal pure returns (bool result) {
        return unwrap(a) < unwrap(b);
    }

    function toIbp(uint numerator, uint denominator) internal pure returns (Ibp bp) {
        unchecked {
            return wrap((numerator * UintBase) / denominator);
        }
    }
}
