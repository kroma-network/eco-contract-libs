// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {
    AccessControlEnumerableUpgradeable,
    SelectorRoleControlUpgradeable
} from "../../access/SelectorRoleControlUpgradeable.sol";

import {ERC1155Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import {ERC1155URIStorageUpgradeable} from
    "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155URIStorageUpgradeable.sol";

import {IERC1155URIControl} from "./IERC1155.sol";

abstract contract EcoERC1155URIControl is
    SelectorRoleControlUpgradeable,
    IERC1155URIControl,
    ERC1155URIStorageUpgradeable
{
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(IERC165, AccessControlEnumerableUpgradeable, ERC1155Upgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function __EcoERC1155URIControl_init(string memory baseURI) internal onlyInitializing {
        __ERC1155_init("");
        _setBaseURI(baseURI);
    }

    function setURI(uint256 tokenId, string memory tokenURI) external onlyAdmin {
        _setURI(tokenId, tokenURI);
    }

    function setBaseURI(string memory baseURI) external onlyAdmin {
        _setBaseURI(baseURI);
    }

    function setInitURI(string memory initURI) external onlyAdmin {
        _setURI(initURI);
    }
}

contract TestEcoERC1155URIControl is EcoERC1155URIControl {
    function EcoERC1155URIControl_init() public {
        __EcoERC1155URIControl_init("");
    }
}
