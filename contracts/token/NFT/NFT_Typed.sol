// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC721/ERC721.sol)

pragma solidity ^0.8.0;

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IERC721Metadata, IERC721Burnable, IERC721Typed } from "../ERC721/IERC721.sol";
import { INFT_Mintable, NFT_Mintable } from "./NFT_Mintable.sol";

import { SelectorRoleControlUpgradeable } from "../../access/SelectorRoleControlUpgradeable.sol";

import { ERC721Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import { ERC721SequencialMintUpbradeable } from "../ERC721/ERC721SequencialMintUpbradeable.sol";
import { ERC721TypedUpgradeable } from "../ERC721/ERC721TypedUpgradeable.sol";

interface INFT_Typed is INFT_Mintable, IERC721Typed {}

contract NFT_Typed is INFT_Typed, NFT_Mintable, ERC721TypedUpgradeable {
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721SequencialMintUpbradeable, IERC165) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _baseURI()
        internal
        view
        virtual
        override(ERC721TypedUpgradeable, ERC721Upgradeable)
        returns (string memory)
    {
        return super._baseURI();
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override(IERC721Metadata, ERC721Upgradeable, ERC721TypedUpgradeable) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function _nextMint(
        address to
    ) internal virtual override(ERC721SequencialMintUpbradeable, ERC721TypedUpgradeable) returns (uint256) {
        return super._nextMint(to);
    }

    function burn(uint256 tokenId) public virtual override(ERC721TypedUpgradeable, IERC721Burnable, NFT_Mintable) {
        return super.burn(tokenId);
    }
}
