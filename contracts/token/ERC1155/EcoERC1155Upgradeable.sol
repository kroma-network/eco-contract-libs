// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IERC1155MetadataURI, IEcoERC1155 } from "./IERC1155.sol";
import { ERC1155MintableUpgradeable } from "./ERC1155MintableUpgradeable.sol";
import { EcoERC1155URIControl } from "./EcoERC1155URIControl.sol";

import { ERC1155URIStorageUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155URIStorageUpgradeable.sol";

import { ERC1155Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";

contract EcoERC1155Upgradeable is ERC1155MintableUpgradeable, EcoERC1155URIControl {
    function initEcoERC1155(address initialOwner, string memory baseURI) public initializer {
        _initEcoOwnable(initialOwner);
        __ERC1155_init(baseURI);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC1155MintableUpgradeable, EcoERC1155URIControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal virtual override(ERC1155MintableUpgradeable, ERC1155Upgradeable) {
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
}
