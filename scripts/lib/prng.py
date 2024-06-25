from brownie import *
import math
from hexbytes import HexBytes
from math_utils import reduceXOR, reduceXOR64

def coprime_list(n):
    return [i for i in range(1, n) if math.gcd(i, n) == 1]

def nomalize(value:int, nomalizeRange:int, valueRange:int):
    return value * nomalizeRange // valueRange

class KeccakRNG:
    max = 2**16
    def __init__(
        self,
        seed:HexBytes,
        yieldSize=16
    ) -> None:
        self.seed = seed
        self.weed = web3.keccak(seed)
        self.yieldSize = yieldSize
        self.weedBitShifter = 0

    def updateWeed(self):
        if self.weedBitShifter != 256 or self.weed == HexBytes(0): raise RuntimeError(self.weedBitShifter, self.weed)
        self.weed = web3.keccak(self.weed)
        self.weedBitShifter = 0

    def yield16(self):
        if self.weedBitShifter == 256:
            self.updateWeed()

        pos = self.weedBitShifter//8
        self.weedBitShifter += self.yieldSize
        return self.weed[pos:pos+self.yieldSize//8]

    def yieldUint16(self):
        return int(self.yield16().hex(), 16)

    def yield10000(self):
        return nomalize(int(self.yield16().hex(), 16), 10000, self.max)

    def yield1000(self):
        return nomalize(int(self.yield16().hex(), 16), 1000, self.max)

class LCG: # Linear Congruential Generator
    max = 2**32
    def __init__(
        self,
        state:HexBytes,
        nomalizeRange = 10000,
    ) -> None:
        self.nomalizeRange = nomalizeRange
        self.state = nomalize(int(reduceXOR64(state).hex(), 16), self.nomalizeRange, 2**64)
        # self.state = int(reduceXOR(state, 32).hex(), 16)

    def yield10000(self):
        self.state = (1664525 * self.state + 1013904223) % self.max
        return nomalize(self.state, self.nomalizeRange, self.max)