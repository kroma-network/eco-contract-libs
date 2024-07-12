// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IERC721SequencialMintUpbradeable, IERC721Queryable, IERC721Burnable } from "../ERC721/IERC721.sol";
import { ERC721SequencialMintUpbradeable } from "../ERC721/ERC721SequencialMintUpbradeable.sol";
import { EcoERC721SequencialQueryable } from "../ERC721/EcoERC721Queryable.sol";

interface INFT_SeqMintable is IERC721Queryable, IERC721SequencialMintUpbradeable {}

// INFT_SeqMintable,
contract NFT_SeqMintable is INFT_SeqMintable, EcoERC721SequencialQueryable {
    function initNFT_SeqMintable(address initialOwner, string memory name, string memory symbol) public initializer {
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

    function burn(uint256 tokenId) public virtual override(EcoERC721SequencialQueryable, IERC721Burnable) {
        return super.burn(tokenId);
    }
}
