// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { Ownable2StepUpgradeable } from "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";

interface IEcoOwnable {
    function initEcoOwnable(address initialOwner) external ;

    function owner() external view returns (address);
    function renounceOwnership() external ;
    function transferOwnership(address newOwner) external ;

    function pendingOwner() external view returns (address);
    function registerPendingOwner(address pendingOwner) external ;
    function acceptOwnership() external ;
}

contract EcoOwnable is
    IEcoOwnable,
    Initializable,
    Ownable2StepUpgradeable
{
    constructor() {
        // prevent owner setting attack
        // avoid initialize for simple test
        initEcoOwnable(_msgSender());
    }

    function initEcoOwnable(address initialOwner) public initializer {
        __Ownable_init(initialOwner);
    }

    function owner() public view virtual override(IEcoOwnable, OwnableUpgradeable) returns (address) {
        return OwnableUpgradeable.owner();
    }

    function renounceOwnership() public virtual override(IEcoOwnable, OwnableUpgradeable) {
        return OwnableUpgradeable.renounceOwnership();
    }

    function transferOwnership(address newOwner) public virtual override(IEcoOwnable, Ownable2StepUpgradeable) {
        return OwnableUpgradeable.transferOwnership(newOwner);
    }

    function pendingOwner() public view virtual override(IEcoOwnable, Ownable2StepUpgradeable) returns (address) {
        return Ownable2StepUpgradeable.pendingOwner();
    }

    function registerPendingOwner(address nextPendingOwner) external override {
        return Ownable2StepUpgradeable.transferOwnership(nextPendingOwner);
    }

    function acceptOwnership() public virtual override(IEcoOwnable, Ownable2StepUpgradeable) {
        return Ownable2StepUpgradeable.acceptOwnership();
    }
}