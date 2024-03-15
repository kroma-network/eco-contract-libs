// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { EcoOwnable } from "./EcoOwnable.sol";
import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { StorageSlot } from "@openzeppelin/contracts/utils/StorageSlot.sol";

interface ICallAccess {
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value
    ) external payable returns (bytes memory);

    function functionMultiCallWithValue(
        address target,
        bytes[] memory data,
        uint256[] memory value
    ) external payable returns (bytes[] memory);

    function functionDelegateCall(address target, bytes memory data) external payable returns (bytes memory);

    function setSlot(bytes32 slot, bytes32 value) external;

    function getSlot(bytes32 slot) external view returns (bytes32 value);
}

abstract contract CallAccess is ICallAccess, EcoOwnable {
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value
    ) public payable override onlyOwner returns (bytes memory) {
        return Address.functionCallWithValue(target, data, value);
    }

    function functionMultiCallWithValue(
        address target,
        bytes[] memory data,
        uint256[] memory value
    ) public payable override onlyOwner returns (bytes[] memory) {
        require(data.length == value.length, "call count");
        uint256 valueSum;
        unchecked {
            for (uint256 i; i < data.length; i++) {
                data[i] = Address.functionCallWithValue(target, data[i], value[i]);
                valueSum += value[i];
            }
        }
        require(valueSum == msg.value, "value sum");
        return data;
    }

    function functionDelegateCall(
        address target,
        bytes memory data
    ) public payable override onlyOwner returns (bytes memory) {
        return Address.functionDelegateCall(target, data);
    }

    function setSlot(bytes32 slot, bytes32 value) public override onlyOwner {
        StorageSlot.getBytes32Slot(slot).value = value;
    }

    function getSlot(bytes32 slot) external view override onlyOwner returns (bytes32 value) {
        return StorageSlot.getBytes32Slot(slot).value;
    }
}
