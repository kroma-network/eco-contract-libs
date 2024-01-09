// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC721/ERC721.sol)

pragma solidity ^0.8.0;

import { SelectorRoleControlUpgradeable } from "../../access/SelectorRoleControlUpgradeable.sol";

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IERC721Metadata } from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

import { ERC721Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import { ERC721URIStorageUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";

import { ERC721IdenticalUpgradeable } from "../ERC721/ERC721IdenticalUpgradeable.sol";

import { INFT_Mintable, NFT_Mintable } from "./NFT_Mintable.sol";

interface INFT_Identical is INFT_Mintable {}

contract NFT_Identical is NFT_Mintable, ERC721IdenticalUpgradeable {
    constructor(string memory name, string memory symbol) NFT_Mintable(name, symbol) {}

    function paused() public view virtual override(NFT_Mintable, SelectorRoleControlUpgradeable) returns (bool) {
        return super.paused();
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721IdenticalUpgradeable, NFT_Mintable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _baseURI()
        internal
        view
        virtual
        override(ERC721IdenticalUpgradeable, ERC721Upgradeable)
        returns (string memory)
    {
        return super._baseURI();
    }

    function tokenURI(
        uint256 tokenId
    )
        public
        view
        virtual
        override(IERC721Metadata, ERC721Upgradeable, ERC721IdenticalUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function _increaseBalance(
        address account,
        uint128 amount
    ) internal virtual override(ERC721Upgradeable, NFT_Mintable) {
        return super._increaseBalance(account, amount);
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override(ERC721Upgradeable, NFT_Mintable) returns (address) {
        return super._update(to, tokenId, auth);
    }
}
