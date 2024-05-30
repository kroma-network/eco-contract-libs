// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { EcoOwnable } from "./EcoOwnable.sol";
import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { StorageSlot } from "@openzeppelin/contracts/utils/StorageSlot.sol";

interface ICallOrder {
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value
    ) external payable returns (bytes memory);

    function functionDelegateCall(address target, bytes memory data) external payable returns (bytes memory);
}

abstract contract CallOrder is ICallOrder, EcoOwnable {
    function functionCallWithValue(
        address target,
        bytes calldata data,
        uint256 value
    ) external payable override onlyOwner returns (bytes memory) {
        return Address.functionCallWithValue(target, data, value);
    }

    function functionDelegateCall(
        address target,
        bytes calldata data
    ) external payable override onlyOwner returns (bytes memory) {
        return Address.functionDelegateCall(target, data);
    }
}
