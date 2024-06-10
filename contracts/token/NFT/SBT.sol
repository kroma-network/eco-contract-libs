// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC721/ERC721.sol)

pragma solidity ^0.8.0;

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import { ERC721Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";

import { EcoERC721Base } from "../ERC721/EcoERC721Base.sol";
import { ERC721SequencialMintUpbradeable } from "../ERC721/ERC721SequencialMintUpbradeable.sol";
import { ERC721SoulBoundUpgradeable } from "../ERC721/ERC721SoulBoundUpgradeable.sol";

import { NFT_Mintable } from "./NFT_Mintable.sol";

contract SBT is NFT_Mintable, ERC721SoulBoundUpgradeable {
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721SequencialMintUpbradeable, ERC721Upgradeable, IERC165) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _increaseBalance(
        address account,
        uint128 amount
    ) internal virtual override(ERC721Upgradeable, EcoERC721Base) {
        return super._increaseBalance(account, amount);
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override(ERC721SoulBoundUpgradeable, EcoERC721Base) returns (address) {
        return super._update(to, tokenId, auth);
    }
}
