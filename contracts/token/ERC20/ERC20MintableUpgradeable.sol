// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC721/ERC721.sol)

pragma solidity ^0.8.0;

import { ISelectorRoleControl, IPausable, IEcoOwnable, SelectorRoleControlUpgradeable } from "../../access/SelectorRoleControlUpgradeable.sol";

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { IERC20Errors } from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";

import { ERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import { ERC20BurnableUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";

interface IEcoERC20 is IERC20, IERC20Metadata, IERC20Errors {}

interface IEcoERC20_Burnable is IEcoERC20 {
    function burn(uint256 amount) external;

    function burnFrom(address account, uint256 amount) external;
}

interface IEcoERC20Mintable is ISelectorRoleControl, IEcoERC20 {
    function mint(address to, uint256 amount) external returns (bool);
}

interface IWETH is IEcoERC20 {
    function deposit() external payable;

    function withdraw(uint256 amount) external;
}

abstract contract ERC20Decimal is ERC20Upgradeable {
    uint8 private immutable _decimals_;

    constructor(uint8 _decimals) {
        _decimals_ = _decimals;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals_;
    }
}

contract EcoERC20Mintable is
    IEcoERC20Mintable,
    IEcoERC20_Burnable,
    SelectorRoleControlUpgradeable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable
{
    constructor(string memory name, string memory symbol) initializer {
        initEcoERC20Mintable(_msgSender(), name, symbol);
    }

    function initEcoERC20Mintable(address initialOwner, string memory name, string memory symbol) public initializer {
        __Ownable_init(initialOwner);
        __ERC20_init(name, symbol);
    }

    function mint(address to, uint256 amount) public override onlyAdmin returns (bool) {
        _mint(to, amount);
        return true;
    }

    function burn(uint256 amount) public override(IEcoERC20_Burnable, ERC20BurnableUpgradeable) {
        return super.burn(amount);
    }

    function burnFrom(address account, uint256 amount) public override(IEcoERC20_Burnable, ERC20BurnableUpgradeable) {
        return super.burnFrom(account, amount);
    }
}

contract EcoERC20MintableDecimal is EcoERC20Mintable, ERC20Decimal {
    constructor(
        string memory name,
        string memory symbol,
        uint8 _decimals
    ) initializer EcoERC20Mintable(name, symbol) ERC20Decimal(_decimals) {}

    function decimals() public view virtual override(IERC20Metadata, ERC20Upgradeable, ERC20Decimal) returns (uint8) {
        return super.decimals();
    }
}
