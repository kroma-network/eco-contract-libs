// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC721/ERC721.sol)

pragma solidity ^0.8.0;

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IERC721Metadata } from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

import { SelectorRoleControlUpgradeable } from "../../access/SelectorRoleControlUpgradeable.sol";

import { ERC721Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";

import { ERC721SequencialMintUpbradeable } from "../ERC721/ERC721SequencialMintUpbradeable.sol";
import { ERC721TypedUpgradeable } from "../ERC721/ERC721TypedUpgradeable.sol";

import { INFT_Mintable, NFT_Mintable } from "./NFT_Mintable.sol";

contract NFT_Typed is NFT_Mintable, ERC721TypedUpgradeable {
    constructor(string memory name, string memory symbol) NFT_Mintable(name, symbol) {}

    function paused() public view virtual override(SelectorRoleControlUpgradeable, NFT_Mintable) returns (bool) {
        return super.paused();
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(IERC165, ERC721SequencialMintUpbradeable, NFT_Mintable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override(IERC721Metadata, ERC721Upgradeable, ERC721TypedUpgradeable) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function _increaseBalance(
        address account,
        uint128 amount
    ) internal virtual override(ERC721SequencialMintUpbradeable, NFT_Mintable) {
        return super._increaseBalance(account, amount);
    }

    function _nextMint(
        address to
    ) internal virtual override(ERC721SequencialMintUpbradeable, ERC721TypedUpgradeable) returns (uint256 tokenId) {
        tokenId = super._nextMint(to);
        emit TokenType(tokenId, 0);
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override(ERC721SequencialMintUpbradeable, NFT_Mintable) returns (address) {
        return super._update(to, tokenId, auth);
    }
}
