// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

uint32 constant BaseRateValue = 10000;

type Rate is uint32;

library RateMath {
    function rateApply(Rate rate, uint value) internal pure returns (uint) {
        assembly {
            value := div(mul(value, rate), BaseRateValue)
        }
        return value;
    }

    function rateAdd(Rate rate, uint value) internal pure returns (uint) {
        assembly {
            value := add(value, div(mul(value, rate), BaseRateValue))
        }
        return value;
    }

    function rateSub(Rate rate, uint value) internal pure returns (uint) {
        assembly {
            value := sub(value, div(mul(value, rate), BaseRateValue))
        }
        return value;
    }
}
