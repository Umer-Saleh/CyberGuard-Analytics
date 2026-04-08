export const defaultParams = {
  lambda: 5.0,
  alpha: 3.0,
  beta: 1.0,
  gamma: 2.0,
  delta: 4.0,
  simulationTime: 1000,
};

export const mockResults = {
  states: [
    { state: "Safe", theoretical: 0.52, simulated: 0.50 },
    { state: "Under Attack", theoretical: 0.25, simulated: 0.27 },
    { state: "Compromised", theoretical: 0.13, simulated: 0.14 },
    { state: "Recovery", theoretical: 0.10, simulated: 0.09 },
  ],
  metrics: {
    availability: 0.952,
    mtbf: 245.3,
    failureRate: 0.0041,
  },
};

export const mockSensitivityData = Array.from({ length: 20 }, (_, i) => {
  const lambda = 0.5 + i * 0.5;
  return {
    lambda,
    breachProb: Math.min(0.95, 0.05 + lambda * 0.08 + Math.random() * 0.02),
  };
});

export const mockMonteCarloData = Array.from({ length: 30 }, (_, i) => ({
  bin: (i * 0.033).toFixed(2),
  frequency: Math.floor(Math.random() * 50 + 10 + Math.exp(-((i - 15) ** 2) / 50) * 80),
}));

export const mockTrendData = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  risk: 0.1 + 0.05 * Math.sin(i / 3) + Math.random() * 0.03,
}));

export const mockScenarioA = {
  name: "Scenario A (Low Defense)",
  safe: 0.35,
  attack: 0.30,
  compromised: 0.25,
  recovery: 0.10,
};

export const mockScenarioB = {
  name: "Scenario B (High Defense)",
  safe: 0.62,
  attack: 0.20,
  compromised: 0.08,
  recovery: 0.10,
};

export const mockHeatmapData: { lambda: number; alpha: number; risk: number }[] = [];
for (let l = 1; l <= 10; l++) {
  for (let a = 1; a <= 10; a++) {
    mockHeatmapData.push({
      lambda: l,
      alpha: a,
      risk: Math.min(1, Math.max(0, l / (l + a) + (Math.random() - 0.5) * 0.1)),
    });
  }
}
