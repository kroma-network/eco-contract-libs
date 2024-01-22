from brownie import *
from brownie.convert.datatypes import Wei, HexString, EthAddress
from brownie.network.transaction import TransactionReceipt

from typing import Any
from hexbytes import HexBytes
import rlp

class EvmAddress(EthAddress): pass

class HexBytes32(HexString):
    def __new__(cls, value):
        return super().__new__(cls, value, 'bytes32')

def bytes32_to_address(data):
    if isinstance(data, HexBytes) and len(data) == 32: return EvmAddress( data[12:] )
    if len(data) == 0: return EvmAddress(ZERO_ADDRESS)
    raise RuntimeError("bytes32_to_address")

def contract_addr_at_tx(tx: TransactionReceipt):
    return EvmAddress( web3.sha3( rlp.encode([HexBytes(tx.sender.address), tx.nonce]) )[12:] )

class Ether(Wei):
    def __new__(cls, value:Any=1) -> Any:
        return super().__new__(cls, value*10**18)

class Gwei(Wei):
    def __new__(cls, value:Any=1) -> Any:
        return super().__new__(cls, value*10**9)

DEV_CHAINID = 1337
PRIVAT_CHAINID = 7789

ZERO_ADDRESS = EvmAddress(ZERO_ADDRESS)
FULL_ADDRESS = EvmAddress("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")
COIN_ADDRESS = EvmAddress("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE")

IMPL_SLOT = HexString("0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc", "bytes32")
ADMIN_SLOT = HexString("0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103", "bytes32")

MAX_UINT256 = 2**256-1

ETHER:int = Ether(1)
GWEI:int = Gwei(1)

MAINNETS = [
    1, # ethereum l1
    255, # kroma l2
    1111, # WEMIX
]

TESTNETS = [
    11155111, # sepolia l1
    2358, # kroma sepolia l2
    7789, # easel l1
    7791, # sail l2
    1112, # test Wemix
]

def is_localnet():
    return chain.id in [1337, 31337]

def is_mainnet():
    return chain.id in MAINNETS

def is_testnet():
    return chain.id in TESTNETS

async_tx_override = {"required_confs": 0}