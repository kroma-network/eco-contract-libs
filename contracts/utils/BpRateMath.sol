// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

uint256 constant UintBase = 1e18;
uint32 constant BpBase = 10000;

type Bp is uint32;

library BpMath {
    function add(Bp a, Bp b) internal pure returns (Bp) {
        assembly {
            b := add(a, b)
        }
        return b;
    }

    function sub(Bp a, Bp b) internal pure returns (Bp) {
        assembly {
            b := sub(a, b)
        }
        return b;
    }

    function mul(Bp a, Bp b) internal pure returns (Bp) {
        assembly {
            b := div(mul(a, b), BpBase)
        }
        return b;
    }

    function mul(Bp a, uint b) internal pure returns (uint) {
        assembly {
            b := div(mul(a, b), BpBase)
        }
        return b;
    }

    function div(Bp a, Bp b) internal pure returns (Bp) {
        assembly {
            b := div(mul(a, BpBase), b)
        }
        return b;
    }

    function div(Bp a, uint b) internal pure returns (uint) {
        assembly {
            b := div(mul(a, BpBase), b)
        }
        return b;
    }

    function lt(Bp a, Bp b) internal pure returns (bool result) {
        assembly {
            result := lt(a, b)
        }
    }

    function toBp(uint numerator, uint denominator) internal pure returns (Bp bp) {
        assembly {
            bp := div(mul(numerator, UintBase), denominator)
        }
    }
}
