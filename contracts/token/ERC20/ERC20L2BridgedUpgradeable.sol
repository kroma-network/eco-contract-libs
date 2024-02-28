// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC721/ERC721.sol)

pragma solidity ^0.8.0;

import { IERC20Burnable, IERC20Mintable, IEcoERC20 } from "./IERC20.sol";
import { ERC20MintableUpgradeable, ERC20MintableUpgradeableWithDecimal } from "./ERC20MintableUpgradeable.sol";

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { AccessControlEnumerableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/extensions/AccessControlEnumerableUpgradeable.sol";

interface IL2BridgeERC20 is IEcoERC20, IERC165 {
    function REMOTE_TOKEN() external view returns (address);

    function BRIDGE() external view returns (address);

    function burn(address from, uint256 amount) external;
}

interface IKromaBridgedERC20 {
    function REMOTE_TOKEN() external view returns (address);

    function BRIDGE() external view returns (address);

    function mint(address _to, uint256 _amount) external;

    function burn(address _from, uint256 _amount) external;
}

contract ERC20L2BridgedUpgradeable is IL2BridgeERC20, ERC20MintableUpgradeableWithDecimal {
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals
    ) ERC20MintableUpgradeableWithDecimal(name, symbol, decimals) {}

    // keccak256(abi.encode(uint256(keccak256("eco.storage.ERC20L2Bridged")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant ERC20L2BridgedStorageLocation =
        0x077ffeaa7eec0cfdcda90af8784697c3c22a1b5cfbafe2f9887cbd76cdb47300;

    struct ERC20L2BridgedStorage {
        address REMOTE_TOKEN;
        address BRIDGE;
    }

    function _getERC20L2BridgedStorage() private pure returns (ERC20L2BridgedStorage storage $) {
        assembly {
            $.slot := ERC20L2BridgedStorageLocation
        }
    }

    function initERC20L2Bridged(
        address initialOwner,
        string memory name,
        string memory symbol,
        uint8 _decimals,
        address remoteToken,
        address bridge
    ) public initializer {
        require(_decimals == decimals(), "decimal");
        initEcoERC20Mintable(initialOwner, name, symbol);
        ERC20L2BridgedStorage storage $ = _getERC20L2BridgedStorage();
        $.REMOTE_TOKEN = remoteToken;
        $.BRIDGE = bridge;
        grantSelectorRole(IERC20Mintable.mint.selector, bridge);
        grantSelectorRole(IL2BridgeERC20.burn.selector, bridge);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(AccessControlEnumerableUpgradeable, IERC165) returns (bool) {
        return interfaceId == type(IKromaBridgedERC20).interfaceId || super.supportsInterface(interfaceId);
    }

    function burn(uint256 amount) public override(ERC20MintableUpgradeable, IERC20Burnable) {
        super.burn(amount);
    }

    function burnFrom(address account, uint256 amount) public override(ERC20MintableUpgradeable, IERC20Burnable) {
        super.burnFrom(account, amount);
    }

    function mint(address to, uint256 amount) public override(ERC20MintableUpgradeable, IERC20Mintable) {
        super.mint(to, amount);
    }

    function REMOTE_TOKEN() public view override returns (address) {
        return _getERC20L2BridgedStorage().REMOTE_TOKEN;
    }

    function BRIDGE() public view override returns (address) {
        return _getERC20L2BridgedStorage().BRIDGE;
    }

    function burn(address from, uint256 amount) public override onlyAdmin {
        _burn(from, amount);
    }
}
