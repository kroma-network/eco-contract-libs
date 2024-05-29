// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC721/ERC721.sol)

pragma solidity ^0.8.0;

import { IERC721Queryable } from "./IERC721.sol";
import { ERC721SequencialMintUpbradeable } from "./ERC721SequencialMintUpbradeable.sol";

abstract contract ERC721QueryableUpgradeable is IERC721Queryable, ERC721SequencialMintUpbradeable {
    function tokensOfOwnerIn(
        address owner,
        uint256 start,
        uint256 stop
    ) public view virtual override returns (uint256[] memory tokenIds) {
        tokenIds = tokensOfOwner(owner);
        uint256 len = tokenIds.length;

        uint256 _tmp = nextMintId();
        if (stop > _tmp) stop = _tmp;
        if (stop < start) revert InvalidQueryRange();

        unchecked {
            for (uint256 i; i < len; ) {
                if (tokenIds[i] < start || stop < tokenIds[i]) {
                    len--;
                    (tokenIds[i], tokenIds[len]) = (tokenIds[len], tokenIds[i]);
                } else {
                    i++;
                }
            }
        }

        assembly {
            mstore(tokenIds, len)
        }

        return tokenIds;
    }

    function tokensOfOwner(address owner) public view virtual override returns (uint256[] memory tokens) {
        tokens = new uint256[](balanceOf(owner));
        unchecked {
            for (uint256 i; i < tokens.length; i++) {
                tokens[i] = tokenOfOwnerByIndex(owner, i);
            }
        }
    }
}
