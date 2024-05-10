// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC721/ERC721.sol)

pragma solidity ^0.8.0;

import { IERC721SequencialMintUpbradeable, ERC721SequencialMintUpbradeable } from "./ERC721SequencialMintUpbradeable.sol";

/**
 * @dev Interface of ERC721AQueryable.
 */
interface IERC721Queryable is IERC721SequencialMintUpbradeable {
    /**
     * Invalid query range (`start` >= `stop`).
     */
    error InvalidQueryRange();

    /**
     * @dev Returns an array of token IDs owned by `owner`,
     * in the range [`start`, `stop`)
     * (i.e. `start <= tokenId < stop`).
     *
     * This function allows for tokens to be queried if the collection
     * grows too big for a single call of {ERC721AQueryable-tokensOfOwner}.
     *
     * Requirements:
     *
     * - `start < stop`
     */
    function tokensOfOwnerIn(address owner, uint256 start, uint256 stop) external view returns (uint256[] memory);

    /**
     * @dev Returns an array of token IDs owned by `owner`.
     *
     * This function scans the ownership mapping and is O(`totalSupply`) in complexity.
     * It is meant to be called off-chain.
     *
     * See {ERC721AQueryable-tokensOfOwnerIn} for splitting the scan into
     * multiple smaller scans if the collection is large enough to cause
     * an out-of-gas error (10K collections should be fine).
     */
    function tokensOfOwner(address owner) external view returns (uint256[] memory);
}

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
