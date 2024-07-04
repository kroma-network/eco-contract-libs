// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { EcoERC721Base } from "../ERC721/EcoERC721Base.sol";

import { NFT_Mintable } from "./NFT_Mintable.sol";
import { NFT_Typed } from "./NFT_Typed.sol";
import { SBT } from "./SBT.sol";

contract Test_NFT_Mintable is NFT_Mintable {
    function _baseURI() internal pure override returns (string memory) {
        return "https://test.com/";
    }
}

contract Test_NFT_Typed is NFT_Typed {

} // already provide base uri

contract Test_SBT is SBT {
    function _baseURI() internal pure override returns (string memory) {
        return "https://test.com/";
    }
}
