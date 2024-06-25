from brownie import *
from prng import LCG, KeccakRNG
import matplotlib.pyplot as plt

import struct

def int_to_2byte_binary(n):
    # int를 2바이트로 변환 (big endian)
    packed_data = struct.pack('>H', n)
    # 각 바이트를 8자리의 이진수로 변환하고 연결
    binary_str = ''.join(f'{byte:08b}' for byte in packed_data)
    return binary_str

from math_utils import chisquare_test_for_uniform_distribution

seed_count = 100000
rng_count = 3

total_lcg = {v:0 for v in range(10000)}
for i in range(seed_count):
    seed = web3.keccak(i)
    lcg = LCG(seed)
    for _ in range(rng_count):
        total_lcg[lcg.yield10000()] += 1

fig, ax = plt.subplots(2)

print("len(total_lcg)", len(total_lcg))
chisquare_test_for_uniform_distribution(total_lcg)
# high_data = []
# for k, v in total_lcg.items():
#     if v > 55:
#         high_data.append(k)
#     if v<25:
#         print(k)

# print([int_to_2byte_binary(i) for i in high_data])

ax[0].bar(total_lcg.keys(), total_lcg.values(), color='gray', width=1)
ax[0].set_title('LCG')
ax[0].set_xlabel('LCG Value')
ax[0].set_ylabel('Count of LCG value')

plt.show()