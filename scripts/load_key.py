from brownie import *

from .defaults import *

import os

def main():
    if is_localnet(): # localnet
        accounts.default = accounts[0]

    elif is_testnet():
        accounts.default = accounts.add( os.getenv("TEST_PRIVATE") )

    elif is_mainnet():
        accounts.default = accounts.add( os.getenv("MAIN_PRIVATE") )

    else:
        accounts.default = accounts.add( os.getenv("DEFAULT_PRIVATE") )