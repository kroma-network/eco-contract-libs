// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC721/ERC721.sol)

pragma solidity ^0.8.0;

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { IERC721Metadata } from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import { IERC721Errors } from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";

import { ERC721Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";

import { ISelectorRoleControl, SelectorRoleControlUpgradeable, AccessControlEnumerableUpgradeable } from "../../access/SelectorRoleControlUpgradeable.sol";

interface IERC721Identical is ISelectorRoleControl, IERC721, IERC721Metadata, IERC721Errors {
    function setBaseURI(string memory baseURI) external;
}

abstract contract ERC721IdenticalUpgradeable is SelectorRoleControlUpgradeable, IERC721Identical, ERC721Upgradeable {
    struct ERC721IdenticalStorage {
        string baseURI;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(AccessControlEnumerableUpgradeable, ERC721Upgradeable, IERC165) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // TODO:
    // keccak256(abi.encode(uint256(keccak256("eco.storage.ERC721Identical")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant ERC721IdenticalStorageLocation =
        0x8d4bbecbfaa48076d44e155f6e7e8e1e4cfd5ce5358defbb8ec3a345ed7c1900;

    function _getERC721IdenticalStorage() private pure returns (ERC721IdenticalStorage storage $) {
        assembly {
            $.slot := ERC721IdenticalStorageLocation
        }
    }

    function setBaseURI(string memory baseURI) public override onlyAdmin {
        _getERC721IdenticalStorage().baseURI = baseURI;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _getERC721IdenticalStorage().baseURI;
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override(ERC721Upgradeable, IERC721Metadata) returns (string memory) {
        _requireOwned(tokenId);

        bytes memory base = bytes(_baseURI());

        if (base[base.length - 1] != "/") {
            return string(base);
        }

        return super.tokenURI(tokenId);
    }
}
