// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (interfaces/IERC20.sol)

pragma solidity ^0.8.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { IERC20Errors } from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";

import { ISelectorRoleControl } from "../../access/SelectorRoleControlUpgradeable.sol";

interface IERC20Base is IERC20, IERC20Metadata, IERC20Errors {}

interface IEcoERC20Metadata is IERC20Base {
    function _initEcoERC20Metadata(string memory _name, string memory _symbol, uint8 _decimals) external;
}

interface IWETH is IERC20, IERC20Metadata {
    event Deposit(address indexed acc, uint256 amount);
    event Withdrawal(address indexed acc, uint256 amount);

    function deposit() external payable;

    function withdraw(uint256 amount) external;

    receive() external payable;
}

interface IERC20Burnable is IERC20Base {
    function burn(uint256 amount) external;

    function burnFrom(address account, uint256 amount) external;
}

interface IERC20Mintable is IERC20Burnable {
    function mint(address to, uint256 amount) external;
}

interface IEcoERC20Mintable is IERC20Mintable {}

interface IEcoERC20 is IEcoERC20Mintable, ISelectorRoleControl {}
