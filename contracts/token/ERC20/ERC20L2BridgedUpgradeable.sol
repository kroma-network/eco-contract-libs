// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {IERC20Burnable, IERC20Mintable, IERC20Permit, IEcoERC20} from "./IERC20.sol";
import {EcoERC20MintableUpgradeable} from "./EcoERC20MintableUpgradeable.sol";
import {EcoERC20Upgradeable} from "./EcoERC20Upgradeable.sol";
import {ERC20PermitUpgradeable} from
    "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {AccessControlEnumerableUpgradeable} from
    "@openzeppelin/contracts-upgradeable/access/extensions/AccessControlEnumerableUpgradeable.sol";

interface IL2BridgeERC20 is IEcoERC20 {
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

contract ERC20L2BridgedUpgradeable is IL2BridgeERC20, EcoERC20Upgradeable {
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
        uint8 decimals,
        address remoteToken,
        address bridge
    ) public initializer {
        _initEcoOwnable(_msgSender());
        _initEcoERC20Metadata(name, symbol, decimals);

        ERC20L2BridgedStorage storage $ = _getERC20L2BridgedStorage();
        $.REMOTE_TOKEN = remoteToken;
        $.BRIDGE = bridge;
        grantSelectorRole(IERC20Mintable.mint.selector, bridge);
        grantSelectorRole(IKromaBridgedERC20.burn.selector, bridge);
        if (_msgSender() != initialOwner) _initEcoOwnable(initialOwner);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControlEnumerableUpgradeable)
        returns (bool)
    {
        return interfaceId == type(IKromaBridgedERC20).interfaceId || super.supportsInterface(interfaceId);
    }

    function burn(uint256 amount) public override(EcoERC20Upgradeable, IERC20Burnable) {
        super.burn(amount);
    }

    function burnFrom(address account, uint256 amount) public override(EcoERC20Upgradeable, IERC20Burnable) {
        super.burnFrom(account, amount);
    }

    function mint(address to, uint256 amount) public override(EcoERC20MintableUpgradeable, IERC20Mintable) {
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

    function nonces(address owner) public view virtual override(EcoERC20Upgradeable, IERC20Permit) returns (uint256) {
        return super.nonces(owner);
    }
}
