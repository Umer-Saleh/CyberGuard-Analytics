# CyberIDS Analytics Platform — Backend

A Python FastAPI backend that provides stochastic simulation and analysis APIs for cybersecurity intrusion detection modeling using Poisson Processes and Continuous-Time Markov Chains.

## Overview

This is the backend of the **CyberIDS Analytics Platform**. It receives simulation parameters from the React frontend, runs mathematical computations and stochastic simulations, and returns results as JSON. The core engine models a network's security state transitions using a 4-state CTMC with a Gillespie-style exact simulation algorithm.

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Python 3.10+** | Core language |
| **FastAPI** | Async web framework for REST APIs |
| **Uvicorn** | ASGI server |
| **NumPy** | Random number generation and numerical computation |
| **Pandas** | Data export to CSV |
| **Matplotlib** | Server-side chart generation |
| **SciPy** | Scientific computing utilities |
| **Pydantic** | Request/response validation |
| **pytest** | Testing framework |
| **httpx** | HTTP client for API tests |

## Mathematical Model

### Four-State CTMC

The system transitions between four states:

```
        λ               β               γ               δ
Safe ──────→ Under ──────→ Compromised ──────→ Recovery ──────→ Safe
  ↑         Attack                                              │
  └──── α ────┘                                                 │
  (defense succeeds)                               (cycle repeats)
```

| Parameter | Symbol | Description |
|-----------|--------|-------------|
| Attack Arrival Rate | λ | Poisson process rate for attack events |
| Defense Success Rate | α | Rate of successful threat neutralization |
| Breach Success Rate | β | Rate of successful system compromise |
| Recovery Rate | γ | Rate of recovery initiation |
| Patch Completion Rate | δ | Rate of restoration completion |

### Computations

- **Steady-State Probabilities** — Closed-form solution of πQ = 0
- **Gillespie Simulation** — Exact stochastic simulation with horizon clamping
- **Monte Carlo Analysis** — 200 independent simulation runs
- **Sensitivity Analysis** — λ sweep with steady-state computation at each point
- **Reliability Metrics** — MTBF (1/γ), Availability (δ/(γ+δ)), Failure Rate (γ)

## API Endpoints

| Endpoint | Method | Description | Request Body |
|----------|--------|-------------|-------------|
| `/simulate` | POST | Theoretical + simulated probabilities and reliability metrics | `{lambda_rate, alpha, beta, gamma, delta, sim_time}` |
| `/montecarlo` | POST | 200 independent Gillespie simulation runs | `{lambda_rate, alpha, beta, gamma, delta, sim_time}` |
| `/sensitivity` | POST | Steady-state probabilities across a λ range | `{lambda_start, lambda_end, steps, alpha, beta, gamma, delta}` |
| `/reliability` | POST | MTBF, availability, and failure rate | `{gamma, delta}` |
| `/health` | GET | Server health check | — |

All POST endpoints validate that rate parameters are strictly positive (`> 0`). Invalid input returns HTTP 422.

### Example Request

```bash
curl -X POST http://localhost:8000/simulate \
  -H "Content-Type: application/json" \
  -d '{"lambda_rate":5,"alpha":3,"beta":1,"gamma":2,"delta":4,"sim_time":1000}'
```

### Example Response

```json
{
  "theoretical": [0.3137, 0.3922, 0.1961, 0.0980],
  "simulation": [0.3193, 0.4083, 0.1770, 0.0954],
  "states": [
    {"state": "Safe", "theoretical": 0.3137, "simulated": 0.3193},
    {"state": "Under Attack", "theoretical": 0.3922, "simulated": 0.4083},
    {"state": "Compromised", "theoretical": 0.1961, "simulated": 0.1770},
    {"state": "Recovery", "theoretical": 0.0980, "simulated": 0.0954}
  ],
  "metrics": {
    "availability": 0.6667,
    "mtbf": 0.5,
    "failureRate": 2.0
  }
}
```

## Getting Started

### Prerequisites

- **Python 3.10+** with pip

### Installation

```bash
pip install -r requirements.txt
```

### Run the Server

```bash
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The API is now live at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs` (Swagger UI).

### Testing

```bash
python -m pytest tests -v
```

**Test suite (13 tests across 4 files):**
- `test_markov.py` — Steady-state formula correctness (sum to 1, known cases, cross-platform match)
- `test_simulation.py` — Gillespie simulation accuracy (proportions sum to 1, horizon clamping, reproducibility)
- `test_api.py` — Endpoint validation (reject invalid input, default fallbacks)
- `test_six_scenarios.py` — 6 comprehensive integration tests (health, default params, all-ones partition, validation, response contract, stochastic reproducibility)

## Project Structure

```
├── main.py                  # FastAPI app, CORS, router registration
├── config.py                # Constants (SIMULATION_RUNS=200, STATES)
├── models/
│   └── schemas.py           # Pydantic input/output validation models
├── routes/
│   ├── simulation.py        # POST /simulate
│   └── analysis.py          # POST /montecarlo, /sensitivity, /reliability
├── services/
│   ├── markov_model.py      # Closed-form steady-state solver
│   ├── poisson_process.py   # Poisson arrival time generator
│   ├── simulation.py        # Gillespie CTMC simulation engine
│   └── analysis.py          # Monte Carlo, sensitivity, reliability
├── utils/
│   ├── graph_generator.py   # Matplotlib bar chart utility
│   └── export.py            # Pandas CSV export utility
├── tests/
│   ├── test_markov.py
│   ├── test_simulation.py
│   ├── test_api.py
│   └── test_six_scenarios.py
└── requirements.txt
```

## Frontend

The React frontend that consumes this API: [`CyberGuard Analytics Frontend/`](../CyberGuard%20Analytics%20Frontend/)

## Team

| Name | Roll Number |
|------|-------------|
| Ahmed Baig | SE-22068 |
| Syed Noor Ul Talha | SE-22072 |
| Muhammad Umer Saleh | SE-22076 |
| Syed Muhammad Reyan Imam | SE-22091 |

**Course:** Stochastic Process (SE-410)
**University:** NED University of Engineering and Technology

## License

This project is built for academic demonstration purposes.
