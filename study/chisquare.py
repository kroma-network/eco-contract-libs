from scipy.stats import chisquare
import numpy as np

def test_uniform_distribution(bit_index_count_in_digest_report):
    # 관측된 빈도
    observed_frequencies = np.array(list(bit_index_count_in_digest_report.values()))
    # 전체 관측치 수
    total_observations = np.sum(observed_frequencies)
    # 각 비트 인덱스에서 기대되는 빈도
    expected_frequencies = np.full(len(bit_index_count_in_digest_report), total_observations / len(bit_index_count_in_digest_report))

    # 카이제곱 검정 실행
    chi_stat, p_value = chisquare(observed_frequencies, f_exp=expected_frequencies)

    if p_value < 0.05:
        print(f"귀무 가설을 기각합니다. 데이터는 균등 분포를 따르지 않습니다. (chi^2={chi_stat}, p={p_value})")
    else:
        print(f"귀무 가설을 기각하지 않습니다. 데이터는 균등 분포를 따를 수 있습니다. (chi^2={chi_stat}, p={p_value})")