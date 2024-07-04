// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import { ERC1155Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";

/**
 * @dev ERC1155 token with pausable token transfers, minting and burning.
 *
 * Useful for scenarios such as preventing trades until the end of an evaluation
 * period, or having an emergency switch for freezing all token transfers in the
 * event of a large bug.
 *
 * IMPORTANT: This contract does not include public pause and unpause functions. In
 * addition to inheriting this contract, you must define both functions, invoking the
 * {Pausable-_pause} and {Pausable-_unpause} internal functions, with appropriate
 * access control, e.g. using {AccessControl} or {Ownable}. Not doing so will
 * make the contract pause mechanism of the contract unreachable, and thus unusable.
 */
abstract contract ERC1155PausableUpgradeable is Initializable, PausableUpgradeable, ERC1155Upgradeable {
    function __ERC1155Pausable_init() internal onlyInitializing {
        __Pausable_init_unchained();
        __ERC1155Pausable_init_unchained();
    }

    function __ERC1155Pausable_init_unchained() internal onlyInitializing {}

    /**
     * @dev See {ERC1155-_update}.
     *
     * Requirements:
     *
     * - the contract must not be paused.
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal virtual override whenNotPaused {
        super._update(from, to, ids, values);
    }
}

contract TestERC1155PausableUpgradeable is ERC1155PausableUpgradeable {
    function ERC1155Pausable_init() public {
        __ERC1155Pausable_init();
    }

    function ERC1155Pausable_init_unchained() public {
        __ERC1155Pausable_init_unchained();
    }
}
