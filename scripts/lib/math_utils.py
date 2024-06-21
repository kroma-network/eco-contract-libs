import math
import hexbytes

def coprime_list(n):
    return [i for i in range(1, n) if math.gcd(i, n) == 1]

def prime_factors(n):
    factors = set()

    # Check for the number of 2s that divide n
    while n % 2 == 0:
        factors.add(2)
        n //= 2

    # n must be odd at this point, so we can skip even numbers
    for i in range(3, int(n**0.5) + 1, 2):
        while (n % i == 0):
            factors.add(i)
            n //= i

    # This condition is to check if n is a prime number
    # greater than 2
    if n > 2:
        factors.add(n)

    return list(factors)

def divisible_by_prime_factors(factors, max_value):
    result = []
    for i in range(1, max_value):
        if any(i % factor == 0 for factor in factors):
            result.append(i)
    return result

def generate_possible_a(m):
    factors = set()
    num = m
    i = 2
    while i * i <= num:
        if num % i:
            i += 1
        else:
            num //= i
            factors.add(i)
    if num > 1:
        factors.add(num)

    possible_a = [a for a in range(1, m) if all((a - 1) % factor == 0 for factor in factors)]
    return possible_a

def generate_possible_c(m):
    possible_c = [c for c in range(1, m) if math.gcd(c, m) == 1]
    return possible_c

def reduceXOR(data: hexbytes.main.HexBytes):
    # HexBytes를 정수로 변환
    data_int = int.from_bytes(data, byteorder='big')

    # 비트 연산 수행
    result = (data_int ^ (data_int >> 64)) ^ ((data_int >> 128) ^ (data_int >> 192))

    # 결과를 다시 HexBytes로 변환
    result_bytes = result.to_bytes((result.bit_length() + 7) // 8, byteorder='big')
    return hexbytes.HexBytes(result_bytes[32-8:32])
