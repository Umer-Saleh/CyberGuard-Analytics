import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/ui/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { defaultParams } from "@/lib/mockData";
import {
  fetchSensitivity,
  fetchMonteCarloRuns,
  histogramCompromised,
  SIM_RESULTS_STORAGE_KEY,
  type SimParams,
} from "@/lib/api";
import { computeSteadyState } from "@/lib/markov";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart,
  Tooltip as RTooltip, ResponsiveContainer, BarChart, Bar, Legend,
  ScatterChart, Scatter, ZAxis,
} from "recharts";
import { Activity, Dice5, TrendingUp, GitCompare, Gauge, Grid3X3, Loader2, AlertCircle } from "lucide-react";

function loadSimParams(): SimParams {
  try {
    const raw = localStorage.getItem("ids-sim-params");
    if (raw) return { ...defaultParams, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...defaultParams };
}

function loadStoredMetrics() {
  try {
    const raw = sessionStorage.getItem(SIM_RESULTS_STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as { metrics?: { availability: number; mtbf: number; failureRate: number } };
    return p.metrics ?? null;
  } catch { return null; }
}

function metricsFromRates(gamma: number, delta: number) {
  return { availability: delta / (gamma + delta), mtbf: 1 / gamma, failureRate: gamma };
}

function GaugeDisplay({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="text-center">
      <div className="relative w-28 h-28 mx-auto mb-2">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90" aria-hidden="true">
          <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
          <circle cx="60" cy="60" r="50" fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={`${pct * 3.14} 314`} strokeLinecap="round" className="transition-all duration-700" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">
            {label === "Availability" ? `${(value * 100).toFixed(1)}%` : value.toFixed(3)}
          </span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

function ChartLoading() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
    </div>
  );
}

function ChartError({ msg }: { msg: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-2 text-muted-foreground text-sm">
      <AlertCircle className="h-6 w-6 text-destructive" />
      <span className="text-center max-w-xs">{msg}</span>
    </div>
  );
}

export default function AnalysisPage() {
  const location = useLocation();
  const params = useMemo(() => loadSimParams(), [location.key]);

  const [lambdaSlider, setLambdaSlider] = useState([Math.min(10, Math.max(1, params.lambda))]);
  const [sensitivityData, setSensitivityData] = useState<{ lambda: number; breachProb: number }[]>([]);
  const [sensLoading, setSensLoading] = useState(true);
  const [sensError, setSensError] = useState<string | null>(null);

  const [monteCarloHist, setMonteCarloHist] = useState<{ bin: string; frequency: number }[]>([]);
  const [mcLoading, setMcLoading] = useState(true);
  const [mcError, setMcError] = useState<string | null>(null);

  const paramKey = useMemo(
    () => JSON.stringify([params.lambda, params.alpha, params.beta, params.gamma, params.delta, params.simulationTime]),
    [params.lambda, params.alpha, params.beta, params.gamma, params.delta, params.simulationTime],
  );

  useEffect(() => {
    let cancelled = false;
    setSensLoading(true);
    setSensError(null);
    (async () => {
      try {
        const sens = await fetchSensitivity(params, { lambda_start: 0.5, lambda_end: 10, steps: 36 });
        if (!cancelled) setSensitivityData(sens);
      } catch (e) {
        if (!cancelled) setSensError(e instanceof Error ? e.message : "Sensitivity request failed");
      } finally {
        if (!cancelled) setSensLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [paramKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let cancelled = false;
    setMcLoading(true);
    setMcError(null);
    (async () => {
      try {
        const runs = await fetchMonteCarloRuns(params);
        if (!cancelled) setMonteCarloHist(histogramCompromised(runs, 30));
      } catch (e) {
        if (!cancelled) setMcError(e instanceof Error ? e.message : "Monte Carlo request failed");
      } finally {
        if (!cancelled) setMcLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [paramKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLambdaSlider([Math.min(10, Math.max(1, params.lambda))]);
  }, [params.lambda]);

  const filteredSensitivity = useMemo(
    () => sensitivityData.filter((d) => d.lambda <= lambdaSlider[0]),
    [sensitivityData, lambdaSlider],
  );

  const scenarioData = useMemo(() => {
    const { lambda, beta, gamma, delta } = params;
    const lowAlpha = params.alpha * 0.45;
    const highAlpha = params.alpha * 2.2;
    const piA = computeSteadyState(lambda, lowAlpha, beta, gamma, delta);
    const piB = computeSteadyState(lambda, highAlpha, beta, gamma, delta);
    return [
      { state: "Safe", A: +(piA[0] * 100).toFixed(1), B: +(piB[0] * 100).toFixed(1) },
      { state: "Attack", A: +(piA[1] * 100).toFixed(1), B: +(piB[1] * 100).toFixed(1) },
      { state: "Compromised", A: +(piA[2] * 100).toFixed(1), B: +(piB[2] * 100).toFixed(1) },
      { state: "Recovery", A: +(piA[3] * 100).toFixed(1), B: +(piB[3] * 100).toFixed(1) },
    ];
  }, [params]);

  const riskTrendData = useMemo(() => {
    const { alpha, beta, gamma, delta } = params;
    return Array.from({ length: 25 }, (_, hour) => {
      const lam = params.lambda * (0.65 + (0.7 * hour) / 24);
      const pi = computeSteadyState(lam, alpha, beta, gamma, delta);
      return { hour, risk: +pi[2].toFixed(4) };
    });
  }, [params]);

  const heatmapData = useMemo(() => {
    const { beta, gamma, delta } = params;
    const pts: { lambda: number; alpha: number; risk: number }[] = [];
    for (let l = 1; l <= 10; l++) {
      for (let a = 1; a <= 10; a++) {
        const pi = computeSteadyState(l, a, beta, gamma, delta);
        pts.push({ lambda: l, alpha: a, risk: +pi[2].toFixed(4) });
      }
    }
    return pts;
  }, [params]);

  const metrics = useMemo(() => {
    const stored = loadStoredMetrics();
    if (stored) return stored;
    return metricsFromRates(params.gamma, params.delta);
  }, [params.gamma, params.delta, location.key]);

  const gaugeMax = {
    availability: 1,
    mtbf: Math.max(metrics.mtbf * 2, 1),
    failureRate: Math.max(metrics.failureRate * 1.25, 0.01),
  };

  return (
    <PageTransition>
      <div className="container py-8 md:py-12">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-3xl font-bold mb-2">Advanced Analysis</h1>
          <p className="text-muted-foreground mb-8">
            All charts respond to the parameters you last saved on the Simulation page.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-primary" aria-hidden="true" />
                Sensitivity Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label className="text-sm text-muted-foreground mb-2 block">
                  Attack Rate (λ): <Badge variant="secondary" className="ml-1 font-mono">{lambdaSlider[0]}</Badge>
                </label>
                <Slider value={lambdaSlider} onValueChange={setLambdaSlider} min={1} max={10} step={0.5} aria-label="Attack rate slider" />
              </div>
              <div className="h-56" role="img" aria-label="Sensitivity analysis chart">
                {sensLoading ? <ChartLoading /> : sensError ? <ChartError msg={sensError} /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredSensitivity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="lambda" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                      <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                      <RTooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                      <Line type="monotone" dataKey="breachProb" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 3 }} name="Breach Probability" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Dice5 className="h-5 w-5 text-violet-500" aria-hidden="true" />
                Monte Carlo Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72" role="img" aria-label="Monte Carlo histogram">
                {mcLoading ? <ChartLoading /> : mcError ? <ChartError msg={mcError} /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monteCarloHist}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="bin" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} interval={4} />
                      <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                      <RTooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                      <Bar dataKey="frequency" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} name="Frequency" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-amber-500" aria-hidden="true" />
                Risk Trend Forecasting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56" role="img" aria-label="Risk trend over time">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={riskTrendData}>
                    <defs>
                      <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="hour" interval={0} tick={{ fontSize: 10 }} label={{ value: "Hour", position: "insideBottom", offset: -5 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <RTooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                      formatter={(value: number) => [value.toFixed(4), "Compromise Risk (π₂)"]}
                    />
                    <Area type="monotone" dataKey="risk" stroke="#f59e0b" strokeWidth={2.5} fill="url(#riskGradient)" dot={false} name="Compromise Risk" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                π₂ as λ sweeps {(params.lambda * 0.65).toFixed(1)} → {(params.lambda * 1.35).toFixed(1)} over 24 hours.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GitCompare className="h-5 w-5 text-green-500" aria-hidden="true" />
                Scenario Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: "#ef4444" }} />
                  <span className="text-muted-foreground">Low Defense (α×0.45)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: "#22c55e" }} />
                  <span className="text-muted-foreground">High Defense (α×2.2)</span>
                </div>
              </div>
              <div className="h-56" role="img" aria-label="Scenario comparison chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scenarioData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="state" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" unit="%" />
                    <RTooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                      formatter={(value: number) => [`${value}%`]}
                    />
                    <Bar dataKey="A" fill="#ef4444" name="Low Defense (α×0.45)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="B" fill="#22c55e" name="High Defense (α×2.2)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Gauge className="h-5 w-5 text-primary" aria-hidden="true" />
                Reliability Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-around gap-4">
                <GaugeDisplay label="Availability" value={metrics.availability} max={gaugeMax.availability} color="hsl(142,71%,45%)" />
                <GaugeDisplay label="MTBF (hrs)" value={metrics.mtbf} max={gaugeMax.mtbf} color="hsl(217,91%,60%)" />
                <GaugeDisplay label="Failure Rate" value={metrics.failureRate} max={gaugeMax.failureRate} color="hsl(0,72%,51%)" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Grid3X3 className="h-5 w-5 text-destructive" aria-hidden="true" />
                Risk Heatmap (λ vs α)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56" role="img" aria-label="Risk heatmap of lambda vs alpha">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" dataKey="lambda" name="λ" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                    <YAxis type="number" dataKey="alpha" name="α" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                    <ZAxis type="number" dataKey="risk" range={[20, 200]} name="Risk" />
                    <RTooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Scatter data={heatmapData} fill="hsl(var(--destructive))" fillOpacity={0.65} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                π₂ (β={params.beta}, γ={params.gamma}, δ={params.delta} fixed).
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
