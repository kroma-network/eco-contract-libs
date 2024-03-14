// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC721/ERC721.sol)

pragma solidity ^0.8.0;

import { ISelectorRoleControl, IPausable, IEcoOwnable, SelectorRoleControlUpgradeable } from "../../access/SelectorRoleControlUpgradeable.sol";

import { ERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import { ERC20BurnableUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";

import { IERC20, IERC20Metadata, IERC20Burnable, IEcoERC20 } from "./IERC20.sol";

import { ERC20MetadataUpgradeable } from "./ERC20MetadataUpgradeable.sol";
import { ERC20MintableUpgradeable } from "./ERC20MintableUpgradeable.sol";

contract EcoERC20Upgradeable is IEcoERC20, ERC20MetadataUpgradeable, ERC20MintableUpgradeable {
    function initEcoERC20(
        address initialOwner,
        string memory _name,
        string memory _symbol,
        uint8 _decimals
    ) public initializer {
        _initEcoOwnable(initialOwner);
        _initEcoERC20Metadata(_name, _symbol, _decimals);
    }

    function name()
        public
        view
        override(ERC20MetadataUpgradeable, ERC20Upgradeable, IERC20Metadata)
        returns (string memory)
    {
        return super.name();
    }

    function symbol()
        public
        view
        override(ERC20MetadataUpgradeable, ERC20Upgradeable, IERC20Metadata)
        returns (string memory)
    {
        return super.symbol();
    }

    function decimals()
        public
        view
        override(ERC20MetadataUpgradeable, ERC20Upgradeable, IERC20Metadata)
        returns (uint8)
    {
        return super.decimals();
    }

    function burn(uint256 amount) public virtual override(ERC20MintableUpgradeable, IERC20Burnable) {
        super.burn(amount);
    }

    function burnFrom(
        address account,
        uint256 amount
    ) public virtual override(ERC20MintableUpgradeable, IERC20Burnable) {
        super.burnFrom(account, amount);
    }

    function totalSupply() public view override(ERC20Upgradeable, IERC20) returns (uint256) {
        return super.totalSupply();
    }

    function balanceOf(address account) public view override(ERC20Upgradeable, IERC20) returns (uint256) {
        return super.balanceOf(account);
    }

    function transfer(address to, uint256 value) public virtual override(ERC20Upgradeable, IERC20) returns (bool) {
        return super.transfer(to, value);
    }

    function allowance(
        address owner,
        address spender
    ) public view override(ERC20Upgradeable, IERC20) returns (uint256) {
        return super.allowance(owner, spender);
    }

    function approve(address spender, uint256 value) public virtual override(ERC20Upgradeable, IERC20) returns (bool) {
        return super.approve(spender, value);
    }

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) public virtual override(ERC20Upgradeable, IERC20) returns (bool) {
        return super.transferFrom(from, to, value);
    }
}
