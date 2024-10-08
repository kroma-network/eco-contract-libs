// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC4906} from "@openzeppelin/contracts/interfaces/IERC4906.sol";
import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import {IERC721Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";

import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import {ISelectorRoleControl} from "../../access/SelectorRoleControlUpgradeable.sol";

interface IERC721Base is IERC165, IERC721, IERC4906, IERC721Metadata, IERC721Errors {}

interface IERC721Burnable is IERC721Base {
    function burn(uint256 tokenId) external;
}

interface IEcoERC721URIStorage is IERC721Base {
    function getBaseURI() external view returns (string memory baseURI);

    function setTokenURI(uint256 tokenId, string memory _tokenURI) external;
}

interface IEcoERC721Base is IERC721Burnable, IEcoERC721URIStorage {}

interface IERC721SequencialMintUpbradeable is ISelectorRoleControl, IEcoERC721Base {
    function nextMintId() external view returns (uint256 tokeId);

    function nextMint(address to) external returns (uint256 tokenId);

    function nextMintBatch(address to, uint256 amount) external returns (uint256[] memory tokenIds);
}

interface IERC721Typed is IERC721SequencialMintUpbradeable {
    event TokenType(uint256 indexed tokenId, uint256 indexed _tokenType);

    function tokenType(uint256 tokenId) external view returns (uint256);

    function typeSupply(uint256 _tokenType) external view returns (uint256 supply);

    function setBaseURI(string memory baseURI) external;

    function setTokenType(uint256 tokenId, uint256 _tokenType) external;

    function typedMint(address to, uint256 _tokenType) external returns (uint256 tokenId);
}

/**
 * @dev Interface of ERC721AQueryable.
 */
interface IERC721Queryable is IEcoERC721Base {
    /**
     * Invalid query range (`start` >= `stop`).
     */
    error InvalidQueryRange();

    function tokensOfOwnerIn(address owner, uint256 start, uint256 stop) external view returns (uint256[] memory);

    function tokensOfOwner(address owner) external view returns (uint256[] memory);
}

interface IEcoERC721 is IERC721SequencialMintUpbradeable, IERC721Queryable {}

interface IEcoERC721Mintable is ISelectorRoleControl, IEcoERC721Base, IERC721Queryable {
    function mint(address account, uint256 tokenId) external;

    function mints(address account, uint256[] calldata tokenIds) external;
}
