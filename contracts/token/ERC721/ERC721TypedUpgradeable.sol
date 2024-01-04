// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC721/ERC721.sol)

pragma solidity ^0.8.0;

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IERC721Metadata } from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

import { ERC721Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import { ERC721URIStorageUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";

import { IERC721SequencialMintUpbradeable, ERC721SequencialMintUpbradeable } from "./ERC721SequencialMintUpbradeable.sol";

interface IERC721TypedResource is IERC721SequencialMintUpbradeable {
    event TokenType(uint256 indexed tokenId, uint256 indexed _tokenType);

    function tokenType(uint256 tokenId) external view returns (uint256);
    function setTokenType(uint256 tokenId, uint256 _tokenType) external;

    function setTypeURI(uint256 _tokenType, string memory typedURI) external;
    function typedMint(address to, uint256 _tokenType) external returns (uint256 tokenId);
}

abstract contract ERC721TypedUpgradeable is
    IERC721TypedResource,
    ERC721SequencialMintUpbradeable
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

    function tokenType(uint256 tokenId) public view override returns (uint256) {
        _requireOwned(tokenId);
        return _getERC721TypedUpgradeable().tokenTypes[tokenId];
    }

    function tokenURI(uint256 tokenId) public view virtual override(IERC721Metadata, ERC721Upgradeable) returns (string memory uri) {
        _requireOwned(tokenId);
        ERC721TypedUpgradeableStorage storage $ = _getERC721TypedUpgradeable();

        uri = $.typeURIs[ $.tokenTypes[tokenId] ];
        require(bytes(uri).length != 0, "None URI");
    }

    function _setTokenType(uint256 tokenId, uint256 _tokenType) internal virtual {
        ERC721TypedUpgradeableStorage storage $ = _getERC721TypedUpgradeable();

        require(bytes($.typeURIs[_tokenType]).length != 0, "None URI");
        require($.tokenTypes[tokenId] != _tokenType, "token type");
        $.tokenTypes[tokenId] = _tokenType;

        emit TokenType(tokenId, _tokenType);
    }

    function _nextMint(address to) internal virtual override returns (uint256 tokenId) {
        tokenId = super._nextMint(to);
        emit TokenType(tokenId, 0);
    }

    function _typedMint(address to, uint256 _tokenType) internal virtual returns (uint256 tokenId) {
        tokenId = super._nextMint(to);
        _setTokenType(tokenId, _tokenType);
    }

    function setTypeURI(uint256 _tokenType, string memory typedURI) public override onlyAdmin {
        require(bytes(typedURI).length != 0, "URI length");
        _getERC721TypedUpgradeable().typeURIs[_tokenType] = typedURI;
    }

    function typedMint(address to, uint256 _tokenType) public override onlyAdmin returns (uint256 tokenId) {
        tokenId = _typedMint(to, _tokenType);
    }

    function setTokenType(uint256 tokenId, uint256 _tokenType) public override onlyAdmin {
        return _setTokenType(tokenId, _tokenType);
    }
}