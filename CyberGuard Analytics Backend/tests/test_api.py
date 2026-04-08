import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_simulate_validation_rejects_non_positive(client):
    r = client.post(
        "/simulate",
        json={
            "lambda_rate": -1,
            "alpha": 1,
            "beta": 1,
            "gamma": 1,
            "delta": 1,
            "sim_time": 100,
        },
    )
    assert r.status_code == 422


def test_montecarlo_requires_valid_body(client):
    r = client.post("/montecarlo", json={"lambda_rate": 1})
    assert r.status_code == 422


def test_reliability_defaults(client):
    r = client.post("/reliability", json={})
    assert r.status_code == 200
    j = r.json()
    assert "mtbf" in j and "availability" in j
