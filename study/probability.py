from brownie import *
import matplotlib.pyplot as plt
from lcg import LCGState

import random

from chisquare import test_uniform_distribution
from hashgen import KeccakGen2, reduce_xor, KeccakGen

flag = '1'


bytes2_len = 2
bits16_len = 16

probability_space = 10000

word_len = 256
bit_index_count_in_digest_report = {i:0 for i in range(word_len)}
bits_count_in_digest_report = {i:0 for i in range(word_len)}

digest_probability = {i:0 for i in range(probability_space)}
digest2_probability = {i:0 for i in range(probability_space)}
lcg_probability = {i:0 for i in range(probability_space)} # lcg: Linear congruential generator
py_lib_probability = {i:0 for i in range(probability_space)}

print("hashing")
for i in range(1000):
    if i % 100 == 0: print("process:", i)
    digest = web3.keccak(i)
    bits = bin(int(digest.hex(), 16))[2:].zfill(word_len)
    for i in range(word_len):
        if(bits[i] == flag): bit_index_count_in_digest_report[i] += 1
    bits_count_in_digest_report[bits.count(flag)] +=1

    xorSeed = reduce_xor(digest)

    lcg = LCGState(xorSeed)

    keccak_gen = KeccakGen(digest)
    keccak_gen2 = KeccakGen2(digest) # regen if output > 59999

    for i in range(1000):
        digest_probability[keccak_gen.gen()] +=1
        digest2_probability[keccak_gen2.gen()] +=1
        lcg_probability[lcg.gen()] += 1
        py_lib_probability[random.randint(0,probability_space-1)] += 1

# 그래프 그리기
fig, ax = plt.subplots(2, 3, figsize=(20, 8))

ax[0][0].bar(bit_index_count_in_digest_report.keys(), bit_index_count_in_digest_report.values(), color='blue', width=1)
ax[0][0].set_title('Counting Bit Index Report')
ax[0][0].set_xlabel('Index Of Bit')
ax[0][0].set_ylabel('Count of Event')

ax[0][1].bar(bits_count_in_digest_report.keys(), bits_count_in_digest_report.values(), color='blue', width=1)
ax[0][1].set_title('Count Bits in Digest')
ax[0][1].set_xlabel('Count of Bits')
ax[0][1].set_ylabel('Count of Event')

ax[0][2].bar(digest2_probability.keys(), digest2_probability.values(), color='magenta', width=1)
ax[0][2].set_title('Digest2 Probability')
ax[0][2].set_xlabel('Value in 10000')
ax[0][2].set_ylabel('Count')

ax[1][0].bar(digest_probability.keys(), digest_probability.values(), color='magenta', width=1)
ax[1][0].set_title('Digest Probability')
ax[1][0].set_xlabel('Value in 10000')
ax[1][0].set_ylabel('Count')

ax[1][1].bar(lcg_probability.keys(), lcg_probability.values(), color='magenta', width=1)
ax[1][1].set_title('LCGState Probability')
ax[1][1].set_xlabel('Value in 10000')
ax[1][1].set_ylabel('Count')

ax[1][2].bar(py_lib_probability.keys(), py_lib_probability.values(), color='magenta', width=1)
ax[1][2].set_title('Py lib Probability')
ax[1][2].set_xlabel('Value in 10000')
ax[1][2].set_ylabel('Count')

print("################## test chi-square ##################")
test_uniform_distribution({i:10000 for i in range(probability_space)})
test_uniform_distribution({i:10000 if i<probability_space//2 else 0 for i in range(probability_space)})

print("################## check ##################")
test_uniform_distribution(digest2_probability)
test_uniform_distribution(digest_probability)
test_uniform_distribution(lcg_probability)
test_uniform_distribution(py_lib_probability)

# 전체 그래프 표시
plt.tight_layout()
plt.show()