// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC721/ERC721.sol)

pragma solidity ^0.8.0;

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import { IERC721Burnable } from "./IERC721.sol";

import { ERC721Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import { ERC721BurnableUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import { ERC721EnumerableUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import { ERC721PausableUpgradeable } from "./ERC721PausableUpgradeable.sol";

abstract contract EcoERC721Base is
    IERC721Burnable,
    ERC721Upgradeable,
    ERC721BurnableUpgradeable,
    ERC721EnumerableUpgradeable,
    ERC721PausableUpgradeable
{
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721EnumerableUpgradeable, ERC721Upgradeable, IERC165) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function burn(uint256 tokenId) public virtual override(ERC721BurnableUpgradeable, IERC721Burnable) {
        return super.burn(tokenId);
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    )
        internal
        virtual
        override(ERC721EnumerableUpgradeable, ERC721PausableUpgradeable, ERC721Upgradeable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 amount
    ) internal virtual override(ERC721EnumerableUpgradeable, ERC721Upgradeable) {
        return super._increaseBalance(account, amount);
    }
}
