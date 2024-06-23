from brownie import *
from prng import LCG, KeccakRNG
import matplotlib.pyplot as plt

from math_utils import chisquare_test_for_uniform_distribution

seed_count = 10
rng_count = 256 * 1000

total_krng = {v:0 for v in range(10000)}
total_lcg = {v:0 for v in range(10000)}
for i in range(seed_count):
    seed = web3.keccak(i)
    krng = KeccakRNG(seed)
    lcg = LCG(seed)
    for _ in range(rng_count):
        total_krng[krng.yield10000()] += 1
        total_lcg[lcg.yield10000()] += 1

fig, ax = plt.subplots(3)

print("len(total_krng)", len(total_krng))
chisquare_test_for_uniform_distribution(total_krng)
print("len(total_lcg)", len(total_lcg))
chisquare_test_for_uniform_distribution(total_lcg)

ax[0].bar(total_krng.keys(), total_krng.values(), color='gray', width=1)
ax[0].set_title('KRNG')
ax[0].set_xlabel('KRNG Value')
ax[0].set_ylabel('Count of KRNG value')

ax[1].bar(total_lcg.keys(), total_lcg.values(), color='gray', width=1)
ax[1].set_title('LCG')
ax[1].set_xlabel('LCG Value')
ax[1].set_ylabel('Count of LCG value')

plt.show()