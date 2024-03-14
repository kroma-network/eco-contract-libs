// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC721/ERC721.sol)

pragma solidity ^0.8.0;

import { ISelectorRoleControl, IPausable, IEcoOwnable, SelectorRoleControlUpgradeable } from "../../access/SelectorRoleControlUpgradeable.sol";

import { ERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import { ERC20BurnableUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";

import { IERC20Metadata, IERC20Burnable, IEcoERC20Mintable } from "./IERC20.sol";

import { ERC20MintableUpgradeable } from "./ERC20MintableUpgradeable.sol";

abstract contract ERC20MintableUpgradeable is
    IEcoERC20Mintable,
    SelectorRoleControlUpgradeable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable
{
    function mint(address to, uint256 amount) public virtual override onlyAdmin {
        _mint(to, amount);
    }

    function burn(uint256 amount) public virtual override(IERC20Burnable, ERC20BurnableUpgradeable) {
        return super.burn(amount);
    }

    function burnFrom(
        address account,
        uint256 amount
    ) public virtual override(IERC20Burnable, ERC20BurnableUpgradeable) {
        return super.burnFrom(account, amount);
    }
}
