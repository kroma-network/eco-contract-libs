// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IERC721Receiver } from "./IERC721.sol";

abstract contract ERC721Receiver is IERC721Receiver {
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure virtual override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}

contract TestERC721Receiver is ERC721Receiver {}
