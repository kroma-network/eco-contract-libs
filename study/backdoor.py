from brownie import *
import matplotlib.pyplot as plt
from lcg import LCGState

import random

from chisquare import test_uniform_distribution
from hashgen import KeccakGen2, KeccakSeeding, reduce_xor, KeccakGen

flag = '1'


bytes2_len = 2
bits16_len = 16

probability_space = 10000

word_len = 256

pending_size = 1000

lcg_filter = {i:0 for i in range(probability_space)}

lcg_10 = {i:0 for i in range(pending_size)}
lcg_100 = {i:0 for i in range(pending_size)}
lcg_1000 = {i:0 for i in range(pending_size)}

print("hashing")
for i in range(256):
    print("process:", i)
    digest = web3.keccak(i)
    xorSeed = reduce_xor(digest)


    seeding = KeccakSeeding(xorSeed)
    for i in range(256):
        lcg = LCGState(seeding.gen())

        for i in range(pending_size):
            rand = lcg.gen()
            if rand < 10:  # 0.1%
                lcg_10[i] += 1
            if rand < 100: # 1%
                lcg_100[i] += 1
            if rand < 1000: # 10%
                lcg_1000[i] += 1

# 그래프 그리기
fig, ax = plt.subplots(2, 3, figsize=(20, 8))

ax[0][0].bar(lcg_10.keys(), lcg_10.values(), color='blue', width=1)
ax[0][0].set_title('Counting Bit Index Report')
ax[0][0].set_xlabel('Index Of Bit')
ax[0][0].set_ylabel('Count of Event')

ax[0][1].bar(lcg_100.keys(), lcg_100.values(), color='blue', width=1)
ax[0][1].set_title('Count Bits in Digest')
ax[0][1].set_xlabel('Count of Bits')
ax[0][1].set_ylabel('Count of Event')

ax[0][2].bar(lcg_1000.keys(), lcg_1000.values(), color='magenta', width=1)
ax[0][2].set_title('Digest2 Probability')
ax[0][2].set_xlabel('Value in 10000')
ax[0][2].set_ylabel('Count')

# 전체 그래프 표시
plt.tight_layout()
plt.show()