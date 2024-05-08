// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Scribble {
    /// #if_succeeds {:msg "P1"} y == x + 1;
    function inc(uint x) public pure returns (uint y) {
        return x + 1;
    }
}
