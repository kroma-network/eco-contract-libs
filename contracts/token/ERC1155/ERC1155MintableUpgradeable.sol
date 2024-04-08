// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// import { ISelectorRoleControl, IPausable, IEcoOwnable,
import { AccessControlEnumerableUpgradeable, SelectorRoleControlUpgradeable } from "../../access/SelectorRoleControlUpgradeable.sol";

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import { ERC1155Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import { ERC1155BurnableUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import { ERC1155PausableUpgradeable } from "./ERC1155PausableUpgradeable.sol";

import { IERC1155Mintable } from "./IERC1155.sol";

abstract contract ERC1155MintableUpgradeable is
    SelectorRoleControlUpgradeable,
    IERC1155Mintable,
    ERC1155Upgradeable,
    ERC1155BurnableUpgradeable,
    ERC1155PausableUpgradeable
{
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(IERC165, AccessControlEnumerableUpgradeable, ERC1155Upgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal virtual override(ERC1155Upgradeable, ERC1155PausableUpgradeable) whenNotPaused {
        super._update(from, to, ids, values);
    }

    function mint(address to, uint256 id, uint256 value, bytes calldata data) external onlyAdmin {
        _mint(to, id, value, data);
    }

    function mintBatch(
        address to,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external onlyAdmin {
        _mintBatch(to, ids, values, data);
    }
}
