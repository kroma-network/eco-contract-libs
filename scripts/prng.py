from uu import Error
from brownie import *
from hexbytes import HexBytes
import math

import json

from scripts.lib.math_utils import reduceXOR
from scripts.lib.prng import LCG, KeccakRNG

def main():
    accounts.default = accounts[0]

    sol_prng = TestPRNG.deploy()

    call_count = 10
    call_work_unit = 256

    keccaks = []
    lcgs = []

    for i in range(call_count):
        if i % 10 == 0:
            print("done:", i)

        hashed_seed = web3.keccak(i)
        py_krng = KeccakRNG(hashed_seed)
        py_lcg = LCG(hashed_seed)

        if list(sol_prng.genKeccak(hashed_seed, call_work_unit)) != [py_krng.yield10000() for i in range(call_work_unit)]:
            print("krng:", i, hashed_seed.hex())
        if list(sol_prng.genLCG(hashed_seed, call_work_unit)) != [py_lcg.yield10000() for i in range(call_work_unit)]:
            print("lcg:", i, hashed_seed.hex())