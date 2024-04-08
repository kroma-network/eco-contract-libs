// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (proxy/transparent/ProxyAdmin.sol)

pragma solidity ^0.8.20;

import { EcoProxyAdmin } from "./admin.sol";

contract Mock_TestProxyAdminFail is EcoProxyAdmin {
    constructor() EcoProxyAdmin(_msgSender()) {}

    function command(address to, uint256 value, bytes memory data) public payable returns (bytes memory) {
        bool success;
        (success, data) = to.call{ value: value }(data);
        require(success, "call fail");
        return data;
    }
}