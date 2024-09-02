// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {IERC721Metadata, IERC721Burnable, IERC721Typed} from "./IERC721.sol";

import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {EcoERC721Base} from "./EcoERC721Base.sol";
import {ERC721SequencialMintUpbradeable} from "./ERC721SequencialMintUpbradeable.sol";

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

abstract contract ERC721TypedUpgradeable is IERC721Typed, ERC721SequencialMintUpbradeable {
    using Strings for uint256;

    struct ERC721TypedUpgradeableStorage {
        string baseURI;
        mapping(uint256 tokenId => uint256 types) tokenTypes;
        mapping(uint256 tokenType => uint256 amount) typeSupply;
    }

    // keccak256(abi.encode(uint256(keccak256("eco.storage.ERC721TypedUpgradeable")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant ERC721TypedUpgradeableStorageLocation =
        0xe33ef228a2d38ea28a4d3727ab6a50a7774dfc78e3d917d05bbe05c960da6100;

    function _getERC721TypedUpgradeable() private pure returns (ERC721TypedUpgradeableStorage storage $) {
        assembly {
            $.slot := ERC721TypedUpgradeableStorageLocation
        }
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _getERC721TypedUpgradeable().baseURI;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(EcoERC721Base, IERC721Metadata)
        returns (string memory)
    {
        string memory baseURI = _baseURI();

        return bytes(baseURI).length > 0
            ? string.concat(string.concat(baseURI, tokenType(tokenId).toString()), ".json")
            : "";
    }

    function tokenType(uint256 tokenId) public view override returns (uint256) {
        _requireOwned(tokenId);
        return _getERC721TypedUpgradeable().tokenTypes[tokenId];
    }

    function typeSupply(uint256 _tokenType) external view returns (uint256 supply) {
        return _getERC721TypedUpgradeable().typeSupply[_tokenType];
    }

    function _setTokenType(uint256 tokenId, uint256 typeFrom, uint256 typeTo) internal virtual {
        ERC721TypedUpgradeableStorage storage $ = _getERC721TypedUpgradeable();
        unchecked {
            $.typeSupply[typeFrom] -= 1;
            $.typeSupply[typeTo] += 1;
        }

        $.tokenTypes[tokenId] = typeTo;
        emit TokenType(tokenId, typeTo);
    }

    function _nextMint(address to) internal virtual override returns (uint256 tokenId) {
        return _typedMint(to, 0);
    }

    function _typedMint(address to, uint256 _tokenType) internal virtual returns (uint256 tokenId) {
        tokenId = super._nextMint(to);
        unchecked {
            _getERC721TypedUpgradeable().typeSupply[0] += 1;
        }
        _setTokenType(tokenId, 0, _tokenType);
    }

    function setBaseURI(string memory baseURI) public override onlyAdmin {
        require(bytes(baseURI).length != 0, "URI length");
        _getERC721TypedUpgradeable().baseURI = baseURI;
    }

    function typedMint(address to, uint256 _tokenType) public override onlyAdmin returns (uint256 tokenId) {
        tokenId = _typedMint(to, _tokenType);
    }

    function setTokenType(uint256 tokenId, uint256 _tokenType) public override onlyAdmin {
        require(tokenType(tokenId) != _tokenType, "set type");
        return _setTokenType(tokenId, tokenType(tokenId), _tokenType);
    }

    function burn(uint256 tokenId) public virtual override(ERC721SequencialMintUpbradeable, IERC721Burnable) {
        unchecked {
            _getERC721TypedUpgradeable().typeSupply[tokenType(tokenId)] -= 1;
        }
        _update(address(0), tokenId, _msgSender());
    }
}
