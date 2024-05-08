// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "hardhat/console.sol";

struct Data {
    uint256 value;
}

abstract contract PointerOptimizations {
    function outer() public pure returns (uint256) {
        Data memory outData;
        outData.value = 1;
        console.log("outer before", outData.value);
        inner(outData);
        console.log("outer after", outData.value);

        return outData.value;
    }

    function inner(Data memory fromOut) public pure {
        fromOut.value = 2;
        console.log("inner", fromOut.value);
    }

    function outerPtr() public pure returns (uint256) {
        Data memory outData;
        outData.value = 1;

        bytes32 ptr;
        assembly {
            ptr := outData
        }
        console.log("outerPtr before", outData.value);
        innerPtr(ptr);
        console.log("outerPtr after", outData.value);

        return outData.value;
    }

    function innerPtr(bytes32 ptr) public pure {
        Data memory pointingOut;
        assembly {
            pointingOut := ptr
        }
        pointingOut.value = 2;
        console.log("innerPtr", pointingOut.value);
        console.log("innerPtr addr", uint256(ptr));
    }
}
