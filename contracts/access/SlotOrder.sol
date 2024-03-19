// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { EcoOwnable } from "./EcoOwnable.sol";
import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { StorageSlot } from "@openzeppelin/contracts/utils/StorageSlot.sol";

interface ISlotOrder {
    function setSlot(bytes32 slot, bytes32 value) external;

    function getSlot(bytes32 slot) external view returns (bytes32 value);
}

abstract contract SlotOrder is ISlotOrder, EcoOwnable {
    function setSlot(bytes32 slot, bytes32 value) public override onlyOwner {
        StorageSlot.getBytes32Slot(slot).value = value;
    }

    function getSlot(bytes32 slot) public view override onlyOwner returns (bytes32 value) {
        return StorageSlot.getBytes32Slot(slot).value;
    }
}
