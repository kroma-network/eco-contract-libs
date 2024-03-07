// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { ERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import { ERC20BurnableUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";

import { IERC20, IWETH, IERC20Burnable } from "./IERC20.sol";
import { Address } from "@openzeppelin/contracts/utils/Address.sol";

contract WrappingNativeCoin is IWETH, ERC20Upgradeable, IERC20Burnable, ERC20BurnableUpgradeable {
    constructor(string memory name, string memory symbol) {
        initWrappingNativeCoin(name, symbol);
    }

    function initWrappingNativeCoin(string memory name, string memory symbol) public initializer {
        __ERC20_init(name, symbol);
    }

    receive() external payable {
        deposit();
    }

    function deposit() public payable override {
        _mint(_msgSender(), msg.value);
        emit Deposit(_msgSender(), msg.value);
    }

    function withdraw(uint256 amount) public override {
        _burn(_msgSender(), amount);
        emit Withdrawal(_msgSender(), amount);
        Address.sendValue(payable(_msgSender()), amount);
    }

    function burn(uint256 amount) public virtual override(IERC20Burnable, ERC20BurnableUpgradeable) {
        super.burn(amount);
        Address.sendValue(payable(address(0)), amount);
    }

    function burnFrom(
        address account,
        uint256 amount
    ) public virtual override(IERC20Burnable, ERC20BurnableUpgradeable) {
        super.burnFrom(account, amount);
        Address.sendValue(payable(address(0)), amount);
    }
}

contract WETH is WrappingNativeCoin {
    constructor() WrappingNativeCoin("Wrapped Ether", "WETH") {}
}
