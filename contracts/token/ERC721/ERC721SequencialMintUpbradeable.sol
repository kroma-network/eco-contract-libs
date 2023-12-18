// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC721/ERC721.sol)

pragma solidity ^0.8.0;

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { IERC4906 } from "@openzeppelin/contracts/interfaces/IERC4906.sol";
import { IERC721Metadata } from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import { IERC721Errors } from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";

import { RoleAdminUpgradeable, AccessControlEnumerableUpgradeable } from "../../access/RoleAdminUpgradeable.sol";

import { ERC721Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import { ERC721BurnableUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import { ERC721EnumerableUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";

interface IERC721SequencialMintUpbradeable is // Seq == Sequencial
    IERC165,
    IERC721,
    IERC4906,
    IERC721Metadata,
    IERC721Errors
{
    function nextMintId() external view returns (uint256 tokeId);
    function nextMint(address to) external returns (uint256 tokenId);
}

abstract contract ERC721SequencialMintUpbradeable is
    IERC721SequencialMintUpbradeable,
    RoleAdminUpgradeable,
    ERC721Upgradeable,
    ERC721BurnableUpgradeable,
    ERC721EnumerableUpgradeable
{
    struct ERC721SequencialMintStorage {
        uint256 count;
    }
    // keccak256(abi.encode(uint256(keccak256("eco.storage.ERC721SequencialMintUpbradeable")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant ERC721SequencialMintStorageLocation = 0x80bb2b638cc20bc4d0a60d66940f3ab4a00c1d7b313497ca82fb0b4ab00793ff; // TODO: check

    function _getERC721SequencialMintStorage() private pure returns (ERC721SequencialMintStorage storage $) {
        assembly {
            $.slot := ERC721SequencialMintStorageLocation
        }
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(IERC165, AccessControlEnumerableUpgradeable, ERC721Upgradeable, ERC721EnumerableUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function nextMintId() public view override returns (uint256 tokeId) {
        unchecked{ return _getERC721SequencialMintStorage().count + 1; }
    }

    function nextMint(address to) public override virtual onlyAdmin returns (uint256 tokenId) {
        return _nextMint(to);
    }

    function _nextMint(address to) internal virtual returns (uint256 tokenId) {
        // token id start from 1
        unchecked { tokenId = ++_getERC721SequencialMintStorage().count; }
        _safeMint(to, tokenId);
        return tokenId;
    }

    function _update(address to, uint256 tokenId, address auth) internal virtual override(ERC721EnumerableUpgradeable, ERC721Upgradeable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 amount) internal virtual override(ERC721EnumerableUpgradeable, ERC721Upgradeable) {
        return super._increaseBalance(account, amount);
    }
}