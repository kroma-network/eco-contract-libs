// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import {
    SelectorRoleControlUpgradeable,
    AccessControlEnumerableUpgradeable
} from "../../access/SelectorRoleControlUpgradeable.sol";

import {IERC721Burnable, IERC721SequencialMintUpbradeable} from "./IERC721.sol";

import {EcoERC721Base} from "./EcoERC721Base.sol";

abstract contract ERC721SequencialMintUpbradeable is
    SelectorRoleControlUpgradeable,
    IERC721SequencialMintUpbradeable,
    EcoERC721Base
{
    struct ERC721SequencialMintStorage {
        uint256 count;
    }
    // keccak256(abi.encode(uint256(keccak256("eco.storage.ERC721SequencialMintUpbradeable")) - 1)) & ~bytes32(uint256(0xff))

    bytes32 private constant ERC721SequencialMintStorageLocation =
        0x7330e025bdbd8ee021c7588e9b33f6f89de788eeb194164646ca75a5b7284100;

    function _getERC721SequencialMintStorage() private pure returns (ERC721SequencialMintStorage storage $) {
        assembly {
            $.slot := ERC721SequencialMintStorageLocation
        }
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlEnumerableUpgradeable, EcoERC721Base, IERC165)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function burn(uint256 tokenId) public virtual override(EcoERC721Base, IERC721Burnable) {
        return super.burn(tokenId);
    }

    function nextMintId() public view override returns (uint256 tokeId) {
        unchecked {
            return _getERC721SequencialMintStorage().count + 1;
        }
    }

    function nextMint(address to) public virtual override onlyAdmin returns (uint256 tokenId) {
        return _nextMint(to);
    }

    function nextMintBatch(address to, uint256 amount)
        public
        virtual
        override
        onlyAdmin
        returns (uint256[] memory tokenIds)
    {
        tokenIds = new uint256[](amount);
        for (uint256 i; i < amount; i++) {
            tokenIds[i] = _nextMint(to);
        }
    }

    function _nextMint(address to) internal virtual returns (uint256 tokenId) {
        // token id start from 1
        unchecked {
            tokenId = ++_getERC721SequencialMintStorage().count;
        }
        _safeMint(to, tokenId);
        return tokenId;
    }
}
