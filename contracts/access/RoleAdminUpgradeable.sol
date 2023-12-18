// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { Ownable2StepUpgradeable, OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import { AccessControlEnumerableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/extensions/AccessControlEnumerableUpgradeable.sol";
import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

import {IAccessControlEnumerable} from "@openzeppelin/contracts/access/extensions/IAccessControlEnumerable.sol";

interface IOwnable2Step {
    function owner() external view returns (address);
    function renounceOwnership() external ;
    function transferOwnership(address newOwner) external ;

    function pendingOwner() external view returns (address);
    function acceptOwnership() external ;
}

interface IPausable {
    function paused() external view returns (bool);

    function pause() external ;
    function unpause() external ;
}

interface IMulticall {
    function multicall(bytes[] calldata data) external returns (bytes[] memory results);
}

interface IRoleAdmin is
    IOwnable2Step,
    IAccessControlEnumerable,
    IPausable
{}

contract RoleAdminUpgradeable is
    Initializable,
    Ownable2StepUpgradeable,
    AccessControlEnumerableUpgradeable,
    PausableUpgradeable,
    IRoleAdmin
{
    function __RoleAdmin_init() internal onlyInitializing {
        _grantRole(grantRole.selector, owner());
        _grantRole(revokeRole.selector, owner());
    }

    modifier onlyAdmin {
        if (owner() != _msgSender()) {
            _checkRole(msg.sig, _msgSender());
        } // owner ok
        _;
    }

    // IOwnable2Step
    function owner() public view override(IOwnable2Step, OwnableUpgradeable) returns (address) {
        return super.owner();
    }

    function renounceOwnership() public virtual override(IOwnable2Step, OwnableUpgradeable) {
        return super.renounceOwnership();
    }

    function pendingOwner() public view virtual override(IOwnable2Step, Ownable2StepUpgradeable) returns (address) {
        return super.pendingOwner();
    }

    function transferOwnership(address newOwner) public virtual override(IOwnable2Step, Ownable2StepUpgradeable) {
        return super.transferOwnership(newOwner);
    }

    function acceptOwnership() public virtual override(IOwnable2Step, Ownable2StepUpgradeable) {
        return super.acceptOwnership();
    }

    // IPausable
    function paused() public view virtual override(IPausable, PausableUpgradeable) returns (bool) {
        return super.paused();
    }

    function pause() external override onlyAdmin {
        _pause();
    }

    function unpause() external override onlyAdmin {
        _unpause();
    }
}