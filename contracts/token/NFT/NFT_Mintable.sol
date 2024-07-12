// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IERC721Metadata, IERC721Burnable, IEcoERC721, IEcoERC721Mintable } from "../ERC721/IERC721.sol";
import { EcoERC721Base } from "../ERC721/EcoERC721Base.sol";
import { EcoERC721Queryable } from "../ERC721/EcoERC721Queryable.sol";

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ERC721Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import { ERC721EnumerableUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";

// INFT_MintableBase,
contract NFT_MintableBase is IEcoERC721Mintable, EcoERC721Base, EcoERC721Queryable {
    function initNFTMintableBase(address initialOwner, string memory name, string memory symbol) public initializer {
        __Ownable_init(initialOwner);
        __ERC721_init(name, symbol);
        __ERC721Burnable_init();
        __ERC721Enumerable_init();
        __Pausable_init();
        _checkBaseURI();
    }

    function _checkBaseURI() internal view virtual {
        require(bytes(_baseURI()).length != 0);
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override(ERC721EnumerableUpgradeable, EcoERC721Base) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 amount
    ) internal virtual override(ERC721EnumerableUpgradeable, EcoERC721Base) {
        return super._increaseBalance(account, amount);
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override(ERC721Upgradeable, EcoERC721Base, IERC721Metadata) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721EnumerableUpgradeable, EcoERC721Base, IERC165) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function mint(address account, uint256 tokenId) public override onlyAdmin {
        return _mint(account, tokenId);
    }

    function burn(uint256 tokenId) public virtual override(EcoERC721Base, IERC721Burnable) {
        return super.burn(tokenId);
    }
}
