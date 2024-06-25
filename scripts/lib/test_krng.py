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

seed_count = 10
rng_count = 256 * 1000

total_krng = {v:0 for v in range(10000)}
for i in range(seed_count):
    seed = web3.keccak(i)
    krng = KeccakRNG(seed)
    lcg = LCG(seed)
    for _ in range(rng_count):
        total_krng[krng.yield10000()] += 1

fig, ax = plt.subplots(2)

print("len(total_krng)", len(total_krng))
chisquare_test_for_uniform_distribution(total_krng)
# high_data = []
# for k, v in total_krng.items():
#     if v > 55:
#         high_data.append(k)
#     if v<25:
#         print(k)

# print([int_to_2byte_binary(i) for i in high_data])

ax[0].bar(total_krng.keys(), total_krng.values(), color='gray', width=1)
ax[0].set_title('KRNG')
ax[0].set_xlabel('KRNG Value')
ax[0].set_ylabel('Count of KRNG value')

plt.show()