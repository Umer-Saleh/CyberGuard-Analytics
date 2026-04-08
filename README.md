# CyberIDS Analytics Platform

A full-stack cybersecurity risk analysis platform that uses **Poisson Processes** and **Continuous-Time Markov Chains** to simulate, analyze, and visualize intrusion detection scenarios through interactive dashboards and stochastic modeling.

## Overview

Modern cyber attacks are inherently random — they don't follow fixed schedules. CyberIDS applies stochastic process theory to model this randomness and provide actionable risk metrics:

- **Poisson Process** models random attack arrivals with configurable rate λ
- **4-State Markov Chain** models system transitions: Safe → Under Attack → Compromised → Recovery
- **Gillespie Simulation** provides exact stochastic sample paths
- **Monte Carlo Analysis** runs 200 simulations for statistical validation
- **Sensitivity Analysis** sweeps attack rates to identify risk thresholds
- **Reliability Metrics** computes MTBF, availability, and failure rates

## Project Structure

```
CyberGuard Analytics/
├── CyberGuard Analytics Frontend/    # React + TypeScript SPA
│   ├── src/
│   │   ├── pages/                    # 8 page components
│   │   ├── components/               # Layout + 50 UI components
│   │   ├── lib/                      # API client, math, mock data
│   │   └── context/                  # Theme + accessibility providers
│   ├── e2e/                          # Playwright browser tests
│   └── public/                       # Static assets + favicon
│
├── CyberGuard Analytics Backend/     # Python FastAPI API
│   ├── services/                     # Markov, Poisson, simulation, analysis
│   ├── routes/                       # REST endpoints
│   ├── models/                       # Pydantic validation schemas
│   ├── utils/                        # Chart + CSV export utilities
│   └── tests/                        # pytest test suite
│
├── CyberIDS_Technical_Report.md      # 5-page submission report
└── CyberIDS_Complete_Project_Guide.md # Full code walkthrough
```

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Recharts, Framer Motion, shadcn/ui |
| **Backend** | Python 3.10+, FastAPI, NumPy, SciPy, Matplotlib, Pandas |
| **Testing** | pytest, Vitest, Playwright |
| **Math** | Poisson Process, CTMC, Gillespie Algorithm, Monte Carlo Simulation |

## Quick Start

### Backend

```bash
cd "CyberGuard Analytics Backend"
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs at `http://localhost:8000/docs`

### Frontend

```bash
cd "CyberGuard Analytics Frontend"
npm install
npm run dev
```

App at `http://localhost:8080`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/simulate` | POST | Theoretical + simulated state probabilities with reliability metrics |
| `/montecarlo` | POST | 200 independent Gillespie simulation runs |
| `/sensitivity` | POST | Steady-state probabilities across a λ range |
| `/reliability` | POST | MTBF, availability, and failure rate |
| `/health` | GET | Server health check |

## Features

- **Simulation Dashboard** — Configure 6 parameters, run simulations, compare theory vs. simulation
- **Results Visualization** — Bar charts, pie charts, line charts, data tables, CSV export
- **Advanced Analysis** — Sensitivity analysis, Monte Carlo histogram, risk heatmap, scenario comparison, reliability gauges, 24-hour trend forecasting
- **Mathematical Documentation** — In-app reference with state diagrams and formulas
- **Dark/Light Theme** — System-aware with manual toggle
- **Accessibility** — High contrast, font scaling, reduced motion, keyboard navigation
- **Full Test Suite** — 13 backend tests, frontend unit tests, 6 end-to-end browser tests

## Testing

```bash
# Backend
cd "CyberGuard Analytics Backend"
python -m pytest tests -v

# Frontend unit tests
cd "CyberGuard Analytics Frontend"
npm run test

# End-to-end browser tests
npx playwright install
npm run test:e2e
```

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

Built for academic demonstration purposes.
