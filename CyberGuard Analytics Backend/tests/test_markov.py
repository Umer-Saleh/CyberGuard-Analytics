import pytest

from services.markov_model import compute_steady_state


def test_steady_state_probabilities_sum_to_one():
    pi = compute_steady_state(5, 3, 1, 2, 4)
    assert len(pi) == 4
    assert abs(sum(pi) - 1.0) < 1e-12


def test_steady_state_known_case_all_ones():
    pi = compute_steady_state(1, 1, 1, 1, 1)
    assert abs(pi[0] - 0.4) < 1e-12
    assert abs(pi[1] - 0.2) < 1e-12
    assert abs(pi[2] - 0.2) < 1e-12
    assert abs(pi[3] - 0.2) < 1e-12


def test_steady_state_matches_frontend_reference():
    """Same numeric check as TypeScript computeSteadyState for defaults."""
    pi = compute_steady_state(5, 3, 1, 2, 4)
    assert abs(pi[0] - 0.3137254901960784) < 1e-9
