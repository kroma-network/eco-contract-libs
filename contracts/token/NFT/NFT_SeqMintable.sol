// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {EcoERC721Base} from "../ERC721/EcoERC721Base.sol";
import {
    IERC721Metadata, IERC721SequencialMintUpbradeable, IERC721Queryable, IERC721Burnable
} from "../ERC721/IERC721.sol";
import {ERC721SequencialMintUpbradeable} from "../ERC721/ERC721SequencialMintUpbradeable.sol";
import {EcoERC721SequencialQueryable} from "../ERC721/EcoERC721Queryable.sol";

import {
    IEcoERC721URIStorage,
    EcoERC721URIStorageUpgradeable,
    EcoERC721IdenticalURIUpgradeable
} from "../ERC721/EcoERC721URIStorageUpgradeable.sol";

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

contract NFT_SeqMintableIdenticalURI is NFT_SeqMintable, EcoERC721IdenticalURIUpgradeable {
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721SequencialMintUpbradeable, EcoERC721URIStorageUpgradeable, IERC165)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function burn(uint256 tokenId) public virtual override {
        return super.burn(tokenId);
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        virtual
        override(ERC721Upgradeable, EcoERC721Base)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 amount)
        internal
        virtual
        override(ERC721Upgradeable, EcoERC721Base)
    {
        return super._increaseBalance(account, amount);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(EcoERC721Base, EcoERC721IdenticalURIUpgradeable, IERC721Metadata)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function setTokenURI(uint256 tokenId, string memory _tokenURI)
        public
        virtual
        override(EcoERC721IdenticalURIUpgradeable, EcoERC721URIStorageUpgradeable, IEcoERC721URIStorage)
    {
        super.setTokenURI(tokenId, _tokenURI);
    }
}
