import math

class LCG:
    def __init__(self, state=0):
        self.a = 41     # 곱셈 상수 조건: a-1이 m의 소인수로 나누어 떨어져야한다.
        self.c = 1      # 증가 상수 조건: m과 서로소
        self.m = 10000  # 0.00% ~ 100% 범위를 표현하기 위한 값
        self.state = state % self.m

    def gen(self) -> int:
        self.state = (self.a * self.state + self.c) % self.m
        return self.state