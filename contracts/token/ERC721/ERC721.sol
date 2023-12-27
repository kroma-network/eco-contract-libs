// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC721/ERC721.sol)

pragma solidity ^0.8.0;

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IERC721Metadata } from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import { SelectorRoleControlUpgradeable } from "../../access/SelectorRoleControlUpgradeable.sol";

import { ERC721Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import { ERC721URIStorageUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";

import { ERC721IdenticalResourceUpgradeable } from "./ERC721IdenticalResourceUpgradeable.sol";
import { ERC721PausableUpgradeable } from "./ERC721PausableUpgradeable.sol";
import { IERC721Queryable, ERC721QueryableUpgradeable } from "./ERC721QueryableUpgradeable.sol";
import { IERC721SequencialMintUpbradeable, ERC721SequencialMintUpbradeable } from "./ERC721SequencialMintUpbradeable.sol";
import { ERC721TypedUpgradeable } from "./ERC721TypedUpgradeable.sol";

interface INFT_Mintable is IERC721SequencialMintUpbradeable, IERC721Queryable {

}

contract NFT_Mintable is
    INFT_Mintable,
    ERC721SequencialMintUpbradeable,
    ERC721QueryableUpgradeable,
    ERC721PausableUpgradeable
{
    constructor(string memory name, string memory symbol) {
        initNFT_Mintable(_msgSender(), name, symbol);
    }

    function initNFT_Mintable(address initialOwner, string memory name, string memory symbol) public initializer {
        __Ownable_init(initialOwner);
        __ERC721_init(name, symbol);
    }

    function paused() public view virtual override(PausableUpgradeable, SelectorRoleControlUpgradeable) returns (bool) {
        return super.paused();
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual
    override(IERC165, ERC721Upgradeable, ERC721SequencialMintUpbradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _increaseBalance(address account, uint128 amount) internal virtual
    override(ERC721Upgradeable, ERC721SequencialMintUpbradeable) {
        return super._increaseBalance(account, amount);
    }

    function _update(address to, uint256 tokenId, address auth) internal virtual
    override(ERC721PausableUpgradeable, ERC721SequencialMintUpbradeable) returns (address) {
        return super._update(to, tokenId, auth);
    }
}

interface INFT_Identical is INFT_Mintable {}

contract NFT_Identical is
    INFT_Identical,
    NFT_Mintable,
    ERC721IdenticalResourceUpgradeable
{
    constructor(string memory name, string memory symbol)
    NFT_Mintable(name, symbol) {}

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual
    override(IERC165, ERC721URIStorageUpgradeable, NFT_Mintable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual
    override(IERC721Metadata, ERC721Upgradeable, ERC721IdenticalResourceUpgradeable) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function _increaseBalance(address account, uint128 amount) internal virtual
    override(ERC721Upgradeable, NFT_Mintable) {
        return super._increaseBalance(account, amount);
    }

    function _update(address to, uint256 tokenId, address auth) internal virtual
    override(ERC721Upgradeable, NFT_Mintable) returns (address) {
        return super._update(to, tokenId, auth);
    }
}

contract NFT_Typed is
    NFT_Mintable,
    ERC721TypedUpgradeable
{
    constructor(string memory name, string memory symbol)
    NFT_Mintable(name, symbol) {}

    function paused() public view virtual
    override(SelectorRoleControlUpgradeable, NFT_Mintable) returns (bool) {
        return super.paused();
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual
    override(IERC165, ERC721SequencialMintUpbradeable, NFT_Mintable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual
    override(IERC721Metadata, ERC721Upgradeable, ERC721TypedUpgradeable) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function _increaseBalance(address account, uint128 amount) internal virtual
    override(ERC721SequencialMintUpbradeable, NFT_Mintable) {
        return super._increaseBalance(account, amount);
    }

    function _nextMint(address to) internal virtual
    override(ERC721SequencialMintUpbradeable, ERC721TypedUpgradeable) returns (uint256 tokenId) {
        tokenId = super._nextMint(to);
        emit TokenType(tokenId, 0);
    }

    function _update(address to, uint256 tokenId, address auth) internal virtual
    override(ERC721SequencialMintUpbradeable, NFT_Mintable) returns (address) {
        return super._update(to, tokenId, auth);
    }
}