// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { SelectorRoleControlUpgradeable, AccessControlEnumerableUpgradeable } from "../../access/SelectorRoleControlUpgradeable.sol";

import { IERC165, IERC721Metadata, IEcoERC721URIStorage } from "./IERC721.sol";
import { ERC721URIStorageUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";

abstract contract EcoERC721URIStorageUpgradeable is
    IEcoERC721URIStorage,
    SelectorRoleControlUpgradeable,
    ERC721URIStorageUpgradeable
{
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(AccessControlEnumerableUpgradeable, ERC721URIStorageUpgradeable, IERC165)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override(ERC721URIStorageUpgradeable, IERC721Metadata) returns (string memory) {
        return string.concat(super.tokenURI(tokenId), ".json");
    }

    function setTokenURI(uint256 tokenId, string memory _tokenURI) public virtual override onlyAdmin {
        return _setTokenURI(tokenId, _tokenURI);
    }
}
