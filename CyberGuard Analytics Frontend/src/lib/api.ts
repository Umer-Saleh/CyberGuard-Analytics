import { defaultParams } from "@/lib/mockData";

/** Base URL for the FastAPI backend (override with VITE_API_URL). */
export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "http://127.0.0.1:8000";

export type SimulationStateRow = {
  state: string;
  theoretical: number;
  simulated: number;
};

export type SimulationResultsPayload = {
  states: SimulationStateRow[];
  metrics: {
    availability: number;
    mtbf: number;
    failureRate: number;
  };
};

export const SIM_RESULTS_STORAGE_KEY = "ids-sim-results";

export type SimParams = {
  lambda: number;
  alpha: number;
  beta: number;
  gamma: number;
  delta: number;
  simulationTime: number;
};

/** Sanitize values from form state / localStorage so malformed input cannot reach the API. */
export function coerceSimParams(raw: Record<string, unknown>): SimParams {
  const d = defaultParams;
  const pick = (key: keyof typeof defaultParams): number => {
    const v = Number(raw[key]);
    return Number.isFinite(v) && v > 0 ? v : d[key];
  };
  return {
    lambda: pick("lambda"),
    alpha: pick("alpha"),
    beta: pick("beta"),
    gamma: pick("gamma"),
    delta: pick("delta"),
    simulationTime: pick("simulationTime"),
  };
}

/** Fetch with an AbortController timeout (default 30s). */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 30_000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new Error(`Request timed out after ${(timeoutMs / 1000).toFixed(0)}s`);
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

type SimulateRequestBody = {
  lambda_rate: number;
  alpha: number;
  beta: number;
  gamma: number;
  delta: number;
  sim_time: number;
};

export async function runSimulation(
  params: SimParams | Record<string, unknown>,
): Promise<SimulationResultsPayload> {
  const p = coerceSimParams(params as Record<string, unknown>);
  const body: SimulateRequestBody = {
    lambda_rate: p.lambda,
    alpha: p.alpha,
    beta: p.beta,
    gamma: p.gamma,
    delta: p.delta,
    sim_time: p.simulationTime,
  };

  const res = await fetchWithTimeout(`${API_BASE}/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Simulation failed (${res.status})`);
  }

  const data = (await res.json()) as {
    states?: SimulationStateRow[];
    metrics?: SimulationResultsPayload["metrics"];
  };

  if (!data.states || !data.metrics) {
    throw new Error("Invalid response from server");
  }

  return { states: data.states, metrics: data.metrics };
}

export type SensitivityPoint = { lambda: number; breachProb: number };

export async function fetchSensitivity(
  params: SimParams | Record<string, unknown>,
  opts: { lambda_start: number; lambda_end: number; steps: number },
): Promise<SensitivityPoint[]> {
  const p = coerceSimParams(params as Record<string, unknown>);
  const res = await fetchWithTimeout(`${API_BASE}/sensitivity`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lambda_start: opts.lambda_start,
      lambda_end: opts.lambda_end,
      steps: opts.steps,
      alpha: p.alpha,
      beta: p.beta,
      gamma: p.gamma,
      delta: p.delta,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Sensitivity failed (${res.status})`);
  }
  const data = (await res.json()) as { lambdas?: number[]; results?: number[][] };
  if (!data.lambdas?.length || !data.results?.length) {
    throw new Error("Invalid sensitivity response");
  }
  if (data.lambdas.length !== data.results.length) {
    throw new Error("Sensitivity lambdas/results length mismatch");
  }
  return data.lambdas.map((lambda, i) => ({
    lambda,
    breachProb: data.results![i][2] ?? 0,
  }));
}

export async function fetchMonteCarloRuns(
  params: SimParams | Record<string, unknown>,
  simTimeOverride?: number,
): Promise<number[][]> {
  const p = coerceSimParams(params as Record<string, unknown>);
  const res = await fetchWithTimeout(
    `${API_BASE}/montecarlo`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lambda_rate: p.lambda,
        alpha: p.alpha,
        beta: p.beta,
        gamma: p.gamma,
        delta: p.delta,
        sim_time: simTimeOverride ?? Math.min(p.simulationTime, 500),
      }),
    },
    60_000,
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Monte Carlo failed (${res.status})`);
  }
  const data = (await res.json()) as { results?: number[][] };
  if (!data.results?.length) {
    throw new Error("Invalid Monte Carlo response");
  }
  return data.results;
}

/** Histogram of compromised-state probability (index 2) per Monte Carlo run. */
export function histogramCompromised(runs: number[][], binCount = 30): { bin: string; frequency: number }[] {
  const emptyBins = () =>
    Array.from({ length: binCount }, (_, i) => ({
      bin: ((i + 0.5) / binCount).toFixed(2),
      frequency: 0,
    }));

  if (!runs.length) return emptyBins();

  const values = runs.map((r) => (Array.isArray(r) && r.length > 2 ? r[2] : 0));
  const counts = new Array(binCount).fill(0);
  for (const v of values) {
    const clamped = Math.max(0, Math.min(0.999999, Number.isFinite(v) ? v : 0));
    const i = Math.min(binCount - 1, Math.floor(clamped * binCount));
    counts[i] += 1;
  }
  return counts.map((frequency, i) => ({
    bin: ((i + 0.5) / binCount).toFixed(2),
    frequency,
  }));
}
