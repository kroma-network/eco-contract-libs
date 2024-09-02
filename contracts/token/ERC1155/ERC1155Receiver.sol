// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {IERC1155Receiver} from "./IERC1155.sol";

abstract contract ERC1155Receiver is IERC1155Receiver {
    function supportsInterface(bytes4 interfaceId) public pure virtual override returns (bool) {
        return interfaceId == type(IERC1155Receiver).interfaceId;
    }

    function onERC1155Received(address, address, uint256, uint256, bytes calldata)
        external
        pure
        virtual
        override
        returns (bytes4)
    {
        return IERC1155Receiver.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(address, address, uint256[] calldata, uint256[] calldata, bytes calldata)
        external
        pure
        virtual
        override
        returns (bytes4)
    {
        return IERC1155Receiver.onERC1155BatchReceived.selector;
    }
}

contract TestERC1155Receiver is ERC1155Receiver {
    function IERC1155ReceiverInterfaceId() public pure returns (bytes4) {
        return type(IERC1155Receiver).interfaceId;
    }
}
