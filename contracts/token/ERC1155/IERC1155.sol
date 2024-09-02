// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {ISelectorRoleControl} from "../../access/SelectorRoleControlUpgradeable.sol";

import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {IERC1155MetadataURI} from "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";

import {IERC1155Receiver} from "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";

interface IERC1155Burnable is IERC1155 {
    function burn(address account, uint256 id, uint256 value) external;

    function burnBatch(address account, uint256[] memory ids, uint256[] memory values) external;
}

interface IERC1155Supply is IERC1155 {
    function totalSupply(uint256 id) external view returns (uint256);

    function totalSupply() external view returns (uint256);

    function exists(uint256 id) external view returns (bool);
}

interface IERC1155Mintable is ISelectorRoleControl, IERC1155 {
    function mint(address to, uint256 id, uint256 value, bytes calldata data) external;

    function mintBatch(address to, uint256[] calldata ids, uint256[] calldata values, bytes calldata data) external;
}

interface IERC1155URIControl is ISelectorRoleControl, IERC1155MetadataURI {
    function setURI(uint256 tokenId, string memory tokenURI) external;

    function setBaseURI(string memory baseURI) external;
}

interface IEcoERC1155 is IERC1155Burnable, IERC1155Supply, IERC1155Mintable, IERC1155URIControl {}
