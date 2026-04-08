"""
Six automated scenarios aligned with the manual integration checklist:

1. API health
2. Default parameters — theoretical π and γ/δ metrics
3. All-rates-equal 1 — steady state 40% / 20% / 20% / 20%
4. Invalid input rejected (422)
5. Full /simulate contract (keys, shapes, camelCase metrics)
6. Stochastic output: probabilities sum to 1; reproducible with numpy seed
"""

import numpy as np
import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_1_health_running(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "running"}


def test_2_default_parameters_theoretical_and_metrics(client):
    """λ=5, α=3, β=1, γ=2, δ=4 — match closed-form steady state and 2-state repair metrics."""
    r = client.post(
        "/simulate",
        json={
            "lambda_rate": 5,
            "alpha": 3,
            "beta": 1,
            "gamma": 2,
            "delta": 4,
            "sim_time": 1000,
        },
    )
    assert r.status_code == 200
    data = r.json()
    th = data["theoretical"]
    assert abs(th[0] - 0.3137254901960784) < 1e-9
    assert abs(th[1] - 0.39215686274509803) < 1e-9
    assert abs(th[2] - 0.19607843137254902) < 1e-9
    assert abs(th[3] - 0.09803921568627451) < 1e-9
    m = data["metrics"]
    assert abs(m["availability"] - (4 / 6)) < 1e-12
    assert abs(m["mtbf"] - 0.5) < 1e-12
    assert abs(m["failureRate"] - 2.0) < 1e-12


def test_3_all_ones_forty_twenty_partition(client):
    r = client.post(
        "/simulate",
        json={
            "lambda_rate": 1,
            "alpha": 1,
            "beta": 1,
            "gamma": 1,
            "delta": 1,
            "sim_time": 5000,
        },
    )
    assert r.status_code == 200
    th = r.json()["theoretical"]
    assert abs(th[0] - 0.4) < 1e-12
    assert abs(th[1] - 0.2) < 1e-12
    assert abs(th[2] - 0.2) < 1e-12
    assert abs(th[3] - 0.2) < 1e-12


def test_4_validation_rejects_non_positive_rates(client):
    r = client.post(
        "/simulate",
        json={
            "lambda_rate": 5,
            "alpha": 3,
            "beta": 1,
            "gamma": 2,
            "delta": 4,
            "sim_time": 0,
        },
    )
    assert r.status_code == 422


def test_5_simulate_response_contract(client):
    """Response matches the documented SPA contract."""
    r = client.post(
        "/simulate",
        json={
            "lambda_rate": 5,
            "alpha": 3,
            "beta": 1,
            "gamma": 2,
            "delta": 4,
            "sim_time": 1000,
        },
    )
    assert r.status_code == 200
    data = r.json()
    assert set(data.keys()) >= {"theoretical", "simulation", "states", "metrics"}
    assert len(data["theoretical"]) == 4
    assert len(data["simulation"]) == 4
    assert len(data["states"]) == 4
    for row in data["states"]:
        assert set(row.keys()) == {"state", "theoretical", "simulated"}
    m = data["metrics"]
    assert set(m.keys()) == {"availability", "mtbf", "failureRate"}
    assert abs(sum(data["theoretical"]) - 1.0) < 1e-9
    assert abs(sum(data["simulation"]) - 1.0) < 1e-9


def test_6_stochastic_sums_to_one_and_seed_reproducible(client):
    body = {
        "lambda_rate": 5,
        "alpha": 3,
        "beta": 1,
        "gamma": 2,
        "delta": 4,
        "sim_time": 1000,
    }
    np.random.seed(42)
    a = client.post("/simulate", json=body).json()["simulation"]
    assert abs(sum(a) - 1.0) < 1e-9

    np.random.seed(42)
    b = client.post("/simulate", json=body).json()["simulation"]
    assert a == b
