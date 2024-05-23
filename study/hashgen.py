from brownie import *

from functools import reduce
from operator import xor

def reduce_xor(digest: bytes):
    return reduce(xor,[int(digest[i:i+2].hex(), 16) for i in range(0, len(digest), 2)])

class KeccakGen:
    def __init__(self, state=web3.keccak(0)):
        self.state = state
        self.i = 0

    def gen(self) -> int:
        if self.i == 32:
            self.i=0
            self.state = web3.keccak(self.state)
        data = int(self.state[self.i:self.i+2].hex(), 16)
        self.i+=2
        return data % 10000