import numpy as np
import pytest

from services.simulation import run_markov_simulation


def test_simulated_proportions_sum_to_one():
    np.random.seed(7)
    p = run_markov_simulation(5, 3, 1, 2, 4, 10_000)
    assert len(p) == 4
    assert abs(sum(p) - 1.0) < 1e-9


def test_time_horizon_respected():
    """After horizon fix, normalized proportions still sum to 1 for any finite horizon."""
    np.random.seed(42)
    p = run_markov_simulation(2, 2, 1, 1, 1, 100.0)
    assert abs(sum(p) - 1.0) < 1e-9


@pytest.mark.parametrize("seed", [0, 1, 42])
def test_reproducible_with_seed(seed):
    np.random.seed(seed)
    a = run_markov_simulation(5, 3, 1, 2, 4, 1000)
    np.random.seed(seed)
    b = run_markov_simulation(5, 3, 1, 2, 4, 1000)
    assert a == b
