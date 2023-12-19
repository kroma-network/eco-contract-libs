// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC721/ERC721.sol)

pragma solidity ^0.8.0;

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IERC721Metadata } from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

import { ERC721Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import { ERC721URIStorageUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";

import { IERC721SequencialMintUpbradeable, ERC721SequencialMintUpbradeable } from "./ERC721SequencialMintUpbradeable.sol";

interface IERC721TypedResource is IERC721SequencialMintUpbradeable {
    event TokenType(uint256 indexed tokenId, uint256 indexed tokenType);

    function tokenTypes(uint256 tokenId) external returns(uint256);
    function typeURIs(uint256 tokenType) external returns(string memory);
    function setTypeURI(uint256 tokenType, string memory typedURI) external;
    function typedMint(address to, uint256 tokenType) external returns (uint256 tokenId);
}

abstract contract ERC721TypedUpgradeable is
    IERC721TypedResource,
    ERC721SequencialMintUpbradeable,
    ERC721URIStorageUpgradeable
{
    struct ERC721TypedUpgradeableStorage {
        mapping (uint256 tokenId => uint256 types) tokenTypes;
        mapping (uint256 tokenId => string uris) typeURIs;
    }
    // keccak256(abi.encode(uint256(keccak256("eco.storage.ERC721TypedUpgradeable")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant ERC721TypedUpgradeableStorageLocation = 0xe33ef228a2d38ea28a4d3727ab6a50a7774dfc78e3d917d05bbe05c960da6100;

    function _getERC721TypedUpgradeable() private pure returns (ERC721TypedUpgradeableStorage storage $) {
        assembly {
            $.slot := ERC721TypedUpgradeableStorageLocation
        }
    }

    function setTypeURI(uint256 tokenType, string memory typedURI) public override onlyAdmin {
        require(tokenType != 0, "default type");
        require(bytes(typedURI).length != 0, "URI length");
        _getERC721TypedUpgradeable().typeURIs[tokenType] = typedURI;
    }

    function tokenURI(uint256 tokenId) public view virtual override(ERC721Upgradeable, ERC721URIStorageUpgradeable, IERC721Metadata) returns (string memory typedURI) {
        _requireOwned(tokenId);

        ERC721TypedUpgradeableStorage storage $ = _getERC721TypedUpgradeable();

        uint256 tokenType = $.tokenTypes[tokenId];
        if(tokenType == 0) return super.tokenURI(tokenId);

        typedURI = $.typeURIs[tokenType];
        require(bytes(typedURI).length != 0, "None URI");
    }

    function _setTokenType(uint256 tokenId, uint256 tokenType) internal virtual {
        ERC721TypedUpgradeableStorage storage $ = _getERC721TypedUpgradeable();

        require(tokenType != 0, "default type");
        require(bytes($.typeURIs[tokenType]).length != 0, "None URI");
        require($.tokenTypes[tokenId] == 0, "type immutable");
        $.tokenTypes[tokenId] = tokenType;

        emit TokenType(tokenId, tokenType);
    }

    function _nextMint(address to) internal virtual override returns (uint256 tokenId) {
        tokenId = super._nextMint(to);
        emit TokenType(tokenId, 0);
    }

    function _typedMint(address to, uint256 tokenType) internal virtual returns (uint256 tokenId) {
        tokenId = super._nextMint(to);
        _setTokenType(tokenId, tokenType);
    }

    function typedMint(address to, uint256 tokenType) public override onlyAdmin returns (uint256 tokenId) {
        tokenId = _typedMint(to, tokenType);
    }

    function _increaseBalance(address account, uint128 amount) internal virtual override(ERC721Upgradeable, ERC721SequencialMintUpbradeable) {
        return super._increaseBalance(account, amount);
    }

    function _update(address to, uint256 tokenId, address auth) internal virtual override(ERC721Upgradeable, ERC721SequencialMintUpbradeable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(IERC165, ERC721SequencialMintUpbradeable, ERC721URIStorageUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}