// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { IEcoOwnable, EcoOwnable } from "./EcoOwnable.sol";
import { AccessControlEnumerableUpgradeable, AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/extensions/AccessControlEnumerableUpgradeable.sol";
import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

import {IAccessControlEnumerable, IAccessControl} from "@openzeppelin/contracts/access/extensions/IAccessControlEnumerable.sol";

interface IPausable {
    // function paused() external view returns (bool); already defined & implemented

    function pause() external ;
    function unpause() external ;
}

interface IMulticall {
    function multicall(bytes[] calldata data) external returns (bytes[] memory results);
}

interface ISelectorRoleControl is
    // IEcoOwnable, TODO: check redundant override, already defined & implemented
    IAccessControlEnumerable,
    IPausable
{
    function pause() external ;
    function unpause() external ;
}

contract SelectorRoleControlUpgradeable is
    Initializable,
    ISelectorRoleControl,
    EcoOwnable,
    PausableUpgradeable,
    AccessControlEnumerableUpgradeable
{
    modifier onlyAdmin {
        _onlyAdmin(_msgSender());
        _;
    }

    // owner or hash role
    function _onlyAdmin(address account) internal view {
        if (owner() != account) _checkRole(msg.sig, account);
    }

    function grantRole(bytes32 role, address account) public virtual onlyAdmin
    override(IAccessControl, AccessControlUpgradeable) {
        _grantRole(role, account);
    }

    function revokeRole(bytes32 role, address account) public virtual onlyAdmin
    override(IAccessControl, AccessControlUpgradeable) {
        _revokeRole(role, account);
    }

    function paused() public view virtual override returns (bool) {
        return super.paused();
    }

    // IPausable
    function pause() public virtual override onlyAdmin {
        _pause();
    }

    function unpause() public virtual override onlyAdmin {
        _unpause();
    }
}