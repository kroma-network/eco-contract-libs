// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IEcoERC721, IERC721Burnable, IERC721Queryable } from "../ERC721/IERC721.sol";
import { ERC721SequencialMintUpbradeable } from "../ERC721/ERC721SequencialMintUpbradeable.sol";
import { ERC721QueryableUpgradeable } from "../ERC721/ERC721QueryableUpgradeable.sol";

interface INFT_Mintable is IEcoERC721 {}

// INFT_Mintable,
contract NFT_Mintable is INFT_Mintable, ERC721SequencialMintUpbradeable, ERC721QueryableUpgradeable {
    function initNFT_Mintable(address initialOwner, string memory name, string memory symbol) public initializer {
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

    function burn(
        uint256 tokenId
    ) public virtual override(ERC721QueryableUpgradeable, ERC721SequencialMintUpbradeable, IERC721Burnable) {
        return super.burn(tokenId);
    }
}
