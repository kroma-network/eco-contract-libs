// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IERC20, IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract ERC165 {
    bytes4 public erc20 = type(IERC20).interfaceId;
    bytes4 public erc20Metadata = type(IERC20Metadata).interfaceId;
    bytes4 public erc721 = type(IERC721).interfaceId;
}
