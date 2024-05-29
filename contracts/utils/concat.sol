// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC721/ERC721.sol)

pragma solidity ^0.8.0;

library StringConcat {
    function concat(string memory self, string memory other) internal pure returns (string memory) {
        return string.concat(self, other);
    }
}
