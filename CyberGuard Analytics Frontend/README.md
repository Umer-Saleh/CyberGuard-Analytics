# CyberIDS Analytics Platform — Frontend

A modern, interactive web dashboard for cybersecurity intrusion detection simulation and risk analysis, built with React, TypeScript, and Recharts.

## Overview

This is the frontend of the **CyberIDS Analytics Platform** — a stochastic modeling tool that uses Poisson Processes and Markov Chains to simulate, analyze, and visualize cybersecurity risk scenarios. Users configure attack/defense parameters, run simulations against the Python backend, and explore results through interactive charts and dashboards.

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 18** | Component-based UI framework |
| **TypeScript** | Type-safe JavaScript |
| **Vite** | Fast build tool and dev server |
| **Tailwind CSS** | Utility-first styling |
| **Recharts** | Interactive charts (bar, line, pie, scatter) |
| **Framer Motion** | Page transitions and animations |
| **shadcn/ui + Radix UI** | Accessible, styled UI components |
| **React Router** | Client-side routing (SPA) |
| **TanStack Query** | Server state management |
| **Vitest** | Unit testing |
| **Playwright** | End-to-end browser testing |

## Pages

| Page | Route | Description |
|------|-------|-------------|
| **Landing** | `/` | Hero section, system overview, feature highlights, tech stack |
| **Simulation** | `/simulation` | Parameter input form (λ, α, β, γ, δ, T) with validation |
| **Results** | `/results` | Bar chart, pie chart, line chart, data table, CSV export |
| **Analysis** | `/analysis` | Sensitivity analysis, Monte Carlo histogram, risk heatmap, scenario comparison, reliability gauges, trend forecasting |
| **Documentation** | `/documentation` | Mathematical model reference (Poisson, CTMC, generator matrix) |
| **Settings** | `/settings` | Theme (dark/light/system), accessibility, font scaling |
| **Help** | `/help` | Searchable FAQ with 15+ questions |

## Getting Started

### Prerequisites

- **Node.js 18+** and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:8080`. Requires the [backend](https://github.com/Umer-Saleh/CyberIDS-Backend) running on port 8000 for live simulation.

### Build

```bash
npm run build
npm run preview
```

### Testing

```bash
# Unit tests
npm run test

# End-to-end tests (installs browsers on first run)
npx playwright install
npm run test:e2e

# All tests (frontend + backend + e2e)
npm run test:all
```

## Project Structure

```
src/
├── pages/                  # 8 page components
│   ├── LandingPage.tsx     # Home page with overview
│   ├── SimulationPage.tsx  # Parameter input form
│   ├── ResultsPage.tsx     # Simulation results dashboard
│   ├── AnalysisPage.tsx    # Advanced analysis (6 chart panels)
│   ├── DocumentationPage.tsx
│   ├── SettingsPage.tsx
│   ├── HelpPage.tsx
│   └── NotFound.tsx
├── components/
│   ├── layout/             # Header, Footer, Layout
│   └── ui/                 # ~50 reusable UI components (shadcn/ui)
├── context/
│   ├── ThemeContext.tsx     # Dark/light/system theme provider
│   └── AccessibilityContext.tsx  # High contrast, font scale, reduced motion
├── hooks/
│   ├── useTheme.ts         # Theme detection and persistence
│   └── use-toast.ts        # Toast notification hook
├── lib/
│   ├── api.ts              # Backend HTTP client (fetch + timeout)
│   ├── markov.ts           # Client-side steady-state computation
│   ├── mockData.ts         # Fallback demo data
│   └── utils.ts            # Tailwind class merge utility
└── test/                   # Test setup
```

## Backend API

The frontend communicates with a FastAPI backend via these endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/simulate` | POST | Run one theoretical + simulated analysis |
| `/montecarlo` | POST | Run 200 batch simulations |
| `/sensitivity` | POST | Sweep λ across a range |
| `/reliability` | POST | Compute MTBF, availability, failure rate |

Backend code: [`CyberGuard Analytics Backend/`](../CyberGuard%20Analytics%20Backend/)

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
