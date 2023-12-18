// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC721/ERC721.sol)

pragma solidity ^0.8.0;

import { ERC721URIStorageUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";

abstract contract ERC721IdenticalResourceUpgradeable is ERC721URIStorageUpgradeable {
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireOwned(tokenId);

        bytes memory base = bytes(_baseURI());

        if (base[base.length - 1] != "/") {
            return string(base);
        }

        return super.tokenURI(tokenId);
    }
}