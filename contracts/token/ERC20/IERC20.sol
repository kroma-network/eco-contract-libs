// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (interfaces/IERC20.sol)

pragma solidity ^0.8.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import { ISelectorRoleControl } from "../../access/SelectorRoleControlUpgradeable.sol";

interface IWETH is IERC20, IERC20Metadata {
    function deposit() external payable;
    function withdraw(uint256 amount) external;
}

interface IERC20Burnable is IERC20, IERC20Metadata {
    function burn(uint256 amount) external;
    function burnFrom(address account, uint256 amount) external;
}

interface IERC20Mintable is ISelectorRoleControl, IERC20, IERC20Metadata {
    function initERC20Mintable(address owner) external;
    function mint(address to, uint256 amount) external;
}

interface IERC20MetadataInitializable is ISelectorRoleControl, IERC20, IERC20Metadata {
    function initERC20MetadataInitializable(string memory name_, string memory symbol_, uint8 decimals_) external;
}

interface IEcoERC20 is IERC20Mintable, IERC20Burnable, IERC20MetadataInitializable {}
interface IEcoERC20Pausable is IEcoERC20 {}