// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { ISelectorRoleControl } from "../../access/SelectorRoleControlUpgradeable.sol";

import { IERC1155 } from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import { IERC1155Receiver } from "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import { IERC1155MetadataURI } from "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";

interface IERC1155Mintable is ISelectorRoleControl, IERC1155 {
    function mint(address to, uint256 id, uint256 value, bytes calldata data) external;

    function mintBatch(address to, uint256[] calldata ids, uint256[] calldata values, bytes calldata data) external;
}

interface IEcoERC1155 is IERC1155Mintable {}
