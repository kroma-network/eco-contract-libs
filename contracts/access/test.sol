// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {EcoOwnable} from "./EcoOwnable.sol";
import {SelectorRoleControlUpgradeable} from "./SelectorRoleControlUpgradeable.sol";

contract HHEcoOwnable is EcoOwnable {
    constructor() {
        initHHEcoOwnable(_msgSender());
    }

    function initHHEcoOwnable(address initalOwner) public initializer {
        _initEcoOwnable(initalOwner);
    }

    function initEcoOwnableFail(address initalOwner) public {
        _initEcoOwnable(initalOwner);
    }
}

contract HH_SelectorRoleControlUpgradeable is SelectorRoleControlUpgradeable {
    constructor(address initialOnwer) {
        initSelectorRoleControl(initialOnwer);
    }
}
