// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {ISelectorRoleControl, SelectorRoleControlUpgradeable} from "../access/SelectorRoleControlUpgradeable.sol";

import {IKromaBridge} from "./interfaces.sol";
import {IEcoERC20} from "../token/ERC20/IERC20.sol";
import {IL2BridgeERC20} from "../token/ERC20/ERC20L2BridgedUpgradeable.sol";

interface IHHKromaBridge is IKromaBridge, ISelectorRoleControl {
    function remoteBridge() external view returns (IKromaBridge);

    function setRemoteBridge(IKromaBridge _remoteBridge) external;
}

abstract contract HHKromaBridgeBase is IHHKromaBridge, SelectorRoleControlUpgradeable {
    error MockNotImplemented();

    IKromaBridge public override remoteBridge;

    function setRemoteBridge(IKromaBridge _remoteBridge) public override onlyAdmin {
        remoteBridge = _remoteBridge;
        grantSelectorRole(this.finalizeBridgeERC20.selector, address(remoteBridge));
    }

    function bridgeETHTo(address, uint32, bytes calldata) public payable {
        revert MockNotImplemented();
    }

    function bridgeETH(uint32, bytes calldata) public payable {
        revert MockNotImplemented();
    }

    function finalizeBridgeETH(address, address, uint256, bytes calldata) public payable {
        revert MockNotImplemented();
    }

    receive() external payable {
        revert MockNotImplemented();
    }
}

contract HHL1KromaBridge is HHKromaBridgeBase {
    function bridgeERC20(
        address _localToken,
        address _remoteToken,
        uint256 _amount,
        uint32 _minGasLimit,
        bytes memory _extraData
    ) public {
        bridgeERC20To(_localToken, _remoteToken, _msgSender(), _amount, _minGasLimit, _extraData);
    }

    function bridgeERC20To(
        address _localToken,
        address _remoteToken,
        address _to,
        uint256 _amount,
        uint32,
        bytes memory _extraData
    ) public {
        // only test: should check liquidity..
        address _from = _msgSender();
        IEcoERC20(_localToken).transferFrom(_from, address(this), _amount);
        remoteBridge.finalizeBridgeERC20(_localToken, _remoteToken, _from, _to, _amount, _extraData);
    }

    function finalizeBridgeERC20(address, address _remoteToken, address, address _to, uint256 _amount, bytes calldata)
        public
        onlyAdmin
    {
        // caller's remote == local
        IEcoERC20(_remoteToken).transfer(_to, _amount);
    }
}

contract HHL2KromaBridge is HHKromaBridgeBase {
    function bridgeERC20(
        address _localToken,
        address _remoteToken,
        uint256 _amount,
        uint32 _minGasLimit,
        bytes memory _extraData
    ) public {
        bridgeERC20To(_localToken, _remoteToken, _msgSender(), _amount, _minGasLimit, _extraData);
    }

    function bridgeERC20To(
        address _localToken,
        address _remoteToken,
        address _to,
        uint256 _amount,
        uint32,
        bytes memory _extraData
    ) public {
        // only test: should check liquidity..
        address _from = _msgSender();
        IL2BridgeERC20(_localToken).burn(_from, _amount);
        remoteBridge.finalizeBridgeERC20(_localToken, _remoteToken, _from, _to, _amount, _extraData);
    }

    function finalizeBridgeERC20(address, address _remoteToken, address, address _to, uint256 _amount, bytes calldata)
        public
        onlyAdmin
    {
        // caller's remote == local
        IEcoERC20(_remoteToken).mint(_to, _amount);
    }
}
