// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { IEcoOwnable, EcoOwnable } from "./EcoOwnable.sol";
import { AccessControlEnumerableUpgradeable, AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/extensions/AccessControlEnumerableUpgradeable.sol";
import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

import {IAccessControlEnumerable, IAccessControl} from "@openzeppelin/contracts/access/extensions/IAccessControlEnumerable.sol";

interface IPausable {
    function paused() external view returns (bool);

    function pause() external ;
    function unpause() external ;
}

interface IMulticall {
    function multicall(bytes[] calldata data) external returns (bytes[] memory results);
}

interface ISelectorRoleControl is
    IEcoOwnable,
    IPausable,
    IAccessControlEnumerable
{}

contract SelectorRoleControlUpgradeable is
    Initializable,
    ISelectorRoleControl,
    EcoOwnable,
    PausableUpgradeable,
    AccessControlEnumerableUpgradeable
{
    function __RoleAdmin_init() internal onlyInitializing {
    }

    modifier onlyAdmin {
        if (owner() != _msgSender()) { // owner ok
            _checkRole(msg.sig, _msgSender());
        }
        _;
    }

    function grantRole(bytes32 role, address account) public virtual onlyAdmin
    override(IAccessControl, AccessControlUpgradeable) {
        _grantRole(role, account);
    }

    function revokeRole(bytes32 role, address account) public virtual onlyAdmin
    override(IAccessControl, AccessControlUpgradeable) {
        _revokeRole(role, account);
    }
    function owner() public view virtual override(IEcoOwnable, EcoOwnable) returns (address) {
        return super.owner();
    }

    function renounceOwnership() public virtual override(IEcoOwnable, EcoOwnable) {
        return super.renounceOwnership();
    }

    function pendingOwner() public view virtual override(IEcoOwnable, EcoOwnable) returns (address) {
        return super.pendingOwner();
    }

    function transferOwnership(address newOwner) public virtual override(IEcoOwnable, EcoOwnable) {
        return super.transferOwnership(newOwner);
    }

    function acceptOwnership() public virtual override(IEcoOwnable, EcoOwnable) {
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