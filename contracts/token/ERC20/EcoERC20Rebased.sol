// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC721/ERC721.sol)

pragma solidity ^0.8.0;

import { ERC20RebasedUpgradeable } from "./ERC20RebasedUpgradeable.sol";
import { IERC20, IERC20Stake } from "./IERC20.sol";

import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract EcoERC20RebasedWithToken is IERC20Stake, ERC20RebasedUpgradeable {
    function stake(uint256 value) public {
        ERC20RebasedUpgradeableStorage storage $ = _getERC20RebasedUpgradeableStorage();
        SafeERC20.safeTransferFrom(IERC20($.underlying), _msgSender(), address(this), value);
        _mint(_msgSender(), value);
    }

    function unstake(uint256 value) public {
        ERC20RebasedUpgradeableStorage storage $ = _getERC20RebasedUpgradeableStorage();
        _burn(_msgSender(), value);
        SafeERC20.safeTransfer(IERC20($.underlying), _msgSender(), value);
    }

    function _totalSupply() internal view virtual override returns (uint256) {
        ERC20RebasedUpgradeableStorage storage $ = _getERC20RebasedUpgradeableStorage();
        return IERC20($.underlying).totalSupply();
    }

    function _checkRebaseUnderlying(address _underlying) internal virtual override {
        require(_underlying != address(0));
        require(IERC20(_underlying).totalSupply() != 0);
    }
}

contract EcoERC20RebasedWithNative is ERC20RebasedUpgradeable {
    receive() external payable {}

    function stake(uint256 value) public payable {
        require(msg.value == value);
        _mint(_msgSender(), value);
    }

    function unstake(uint256 value) public {
        _burn(_msgSender(), value);
        Address.sendValue(payable(_msgSender()), value);
    }

    function _totalSupply() internal view virtual override returns (uint256) {
        return address(this).balance;
    }

    function _checkRebaseUnderlying(address _underlying) internal virtual override {
        if (_underlying != address(0)) revert InvalidInitialization();
        if (decimals() != 18) revert InvalidInitialization();
    }
}
