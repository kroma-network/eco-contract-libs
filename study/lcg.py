import math

class LCG:
    def __init__(self, state=0):
        self.a = 41  # 개선된 곱셈 상수
        self.c = 1       # 개선된 증가 상수
        self.m = 10000  # 2**31 - 1    # 개선된 모듈로 값
        self.state = state % self.m

    def gen(self) -> int:
        self.state = (self.a * self.state + self.c) % self.m
        return self.state