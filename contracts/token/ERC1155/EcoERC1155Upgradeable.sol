// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IERC1155MetadataURI, IEcoERC1155, IERC1155Supply } from "./IERC1155.sol";

import { ERC1155Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import { ERC1155MintableUpgradeable } from "./ERC1155MintableUpgradeable.sol";

import { ERC1155URIStorageUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155URIStorageUpgradeable.sol";
import { EcoERC1155URIControl } from "./EcoERC1155URIControl.sol";

import { ERC1155BurnableUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import { ERC1155SupplyUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import { ERC1155PausableUpgradeable } from "./ERC1155PausableUpgradeable.sol";

contract EcoERC1155Upgradeable is
    IEcoERC1155,
    ERC1155MintableUpgradeable,
    EcoERC1155URIControl,
    ERC1155BurnableUpgradeable,
    ERC1155PausableUpgradeable,
    ERC1155SupplyUpgradeable
{
    function initEcoERC1155(address initialOwner, string memory baseURI) public initializer {
        _initEcoOwnable(initialOwner);
        __ERC1155_init(baseURI);
        _setBaseURI(baseURI);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC1155MintableUpgradeable, ERC1155Upgradeable, EcoERC1155URIControl, IERC165)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal virtual override(ERC1155PausableUpgradeable, ERC1155SupplyUpgradeable, ERC1155Upgradeable) {
        super._update(from, to, ids, values);
    }

    function uri(
        uint256 id
    )
        public
        view
        virtual
        override(ERC1155URIStorageUpgradeable, ERC1155Upgradeable, IERC1155MetadataURI)
        returns (string memory)
    {
        return super.uri(id);
    }

    function totalSupply(uint256 id) public view override(ERC1155SupplyUpgradeable, IERC1155Supply) returns (uint256) {
        return super.totalSupply(id);
    }

    function totalSupply() public view override(ERC1155SupplyUpgradeable, IERC1155Supply) returns (uint256) {
        return super.totalSupply();
    }

    function exists(uint256 id) public view override(ERC1155SupplyUpgradeable, IERC1155Supply) returns (bool) {
        return super.exists(id);
    }
}
