// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { EcoOwnable } from "./EcoOwnable.sol";
import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { StorageSlot } from "@openzeppelin/contracts/utils/StorageSlot.sol";

interface ICallOrder {
    error CallCount();
    error ValueSum();

    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value
    ) external payable returns (bytes memory);

    function functionMultiCallWithValue(
        address[] memory target,
        bytes[] memory data,
        uint256[] memory value
    ) external payable returns (bytes[] memory);

    function functionDelegateCall(address target, bytes memory data) external payable returns (bytes memory);
}

abstract contract CallOrder is ICallOrder, EcoOwnable {
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value
    ) public payable override onlyOwner returns (bytes memory) {
        return Address.functionCallWithValue(target, data, value);
    }

    function functionMultiCallWithValue(
        address[] memory target,
        bytes[] memory data,
        uint256[] memory value
    ) public payable override onlyOwner returns (bytes[] memory) {
        if (target.length != data.length || target.length != value.length) revert CallCount();

        uint256 valueSum;
        unchecked {
            for (uint256 i; i < target.length; i++) {
                data[i] = Address.functionCallWithValue(target[i], data[i], value[i]);
                valueSum += value[i];
            }
        }

        if (valueSum != msg.value) revert ValueSum();
        return data;
    }

    function functionDelegateCall(
        address target,
        bytes memory data
    ) public payable override onlyOwner returns (bytes memory) {
        return Address.functionDelegateCall(target, data);
    }
}
