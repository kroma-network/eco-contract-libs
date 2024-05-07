// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Echidna {
    function echidna_check_balance() public view returns (bool) {
        return (address(this).balance >= 20);
    }
}
