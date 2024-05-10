// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { EcoOwnable } from "./EcoOwnable.sol";
import { SelectorRoleControlUpgradeable } from "./SelectorRoleControlUpgradeable.sol";

contract Mock_TestEcoOwnable is EcoOwnable {
    constructor() {
        initMock_TestEcoOwnable(_msgSender());
    }

    function initMock_TestEcoOwnable(address initalOwner) public initializer {
        _initEcoOwnable(initalOwner);
    }

    function initEcoOwnableFail(address initalOwner) public {
        _initEcoOwnable(initalOwner);
    }
}

contract Test_SelectorRoleControlUpgradeable is SelectorRoleControlUpgradeable {
    constructor(address initialOnwer) {
        initSelectorRoleControl(initialOnwer);
    }
}
