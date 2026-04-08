import { Link, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/ui/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Swords, AlertTriangle, HeartPulse, Download, BarChart3, Play } from "lucide-react";
import { mockResults } from "@/lib/mockData";
import { SIM_RESULTS_STORAGE_KEY } from "@/lib/api";
import { computeSteadyState } from "@/lib/markov";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

const stateIcons = [ShieldCheck, Swords, AlertTriangle, HeartPulse];
const stateColors = ["hsl(142,71%,45%)", "hsl(38,92%,50%)", "hsl(0,72%,51%)", "hsl(217,91%,60%)"];
const pieColors = ["#22c55e", "#f59e0b", "#ef4444", "#3b82f6"];

function loadSavedParams() {
  try {
    const raw = localStorage.getItem("ids-sim-params");
    if (raw) return JSON.parse(raw) as Record<string, number>;
  } catch { /* ignore */ }
  return { lambda: 5, alpha: 3, beta: 1, gamma: 2, delta: 4 };
}

function downloadCSV(states: typeof mockResults.states) {
  const header = "State,Theoretical,Simulated,Difference\n";
  const rows = states.map((s) => {
    const diff = Math.abs(s.theoretical - s.simulated);
    return `${s.state},${(s.theoretical * 100).toFixed(2)}%,${(s.simulated * 100).toFixed(2)}%,${(diff * 100).toFixed(2)}%`;
  }).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cyberids-results.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function ResultsPage() {
  const { toast } = useToast();
  const location = useLocation();

  const results = useMemo(() => {
    try {
      const raw = sessionStorage.getItem(SIM_RESULTS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as typeof mockResults;
        if (Array.isArray(parsed?.states) && parsed.states.length > 0) return parsed;
      }
    } catch { /* ignore */ }
    return mockResults;
  }, [location.key]);

  const barData = useMemo(
    () =>
      results.states.map((s) => ({
        state: s.state,
        Theoretical: +(s.theoretical * 100).toFixed(1),
        Simulated: +(s.simulated * 100).toFixed(1),
      })),
    [results.states],
  );

  const pieData = useMemo(
    () => results.states.map((s) => ({ name: s.state, value: s.simulated })),
    [results.states],
  );

  const lineData = useMemo(() => {
    const p = loadSavedParams();
    const alpha = p.alpha ?? 3;
    const beta = p.beta ?? 1;
    const gamma = p.gamma ?? 2;
    const delta = p.delta ?? 4;
    return Array.from({ length: 20 }, (_, i) => {
      const rate = 0.5 + i * 0.5;
      const pi = computeSteadyState(rate, alpha, beta, gamma, delta);
      return { rate: +rate.toFixed(1), risk: +pi[2].toFixed(4) };
    });
  }, [location.key]);

  const handleDownload = () => {
    downloadCSV(results.states);
    toast({ title: "Download Started", description: "Results exported as CSV." });
  };

  return (
    <PageTransition>
      <div className="container py-8 md:py-12">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Simulation Results</h1>
            <p className="text-muted-foreground">Steady-state probability analysis and visualization.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleDownload} variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Download CSV
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/analysis"><BarChart3 className="h-4 w-4" /> View Analysis</Link>
            </Button>
            <Button asChild className="gap-2">
              <Link to="/simulation"><Play className="h-4 w-4" /> New Simulation</Link>
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="glass-card">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">Availability</p>
              <p className="text-2xl font-bold font-mono">{(results.metrics.availability * 100).toFixed(2)}%</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">MTBF</p>
              <p className="text-2xl font-bold font-mono">{results.metrics.mtbf.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">Failure rate</p>
              <p className="text-2xl font-bold font-mono">{results.metrics.failureRate.toFixed(4)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {results.states.map((s, i) => {
            const Icon = stateIcons[i];
            return (
              <motion.div key={s.state} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="glass-card">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4" style={{ color: stateColors[i] }} aria-hidden="true" />
                      <span className="text-xs font-medium text-muted-foreground">{s.state}</span>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold" style={{ color: stateColors[i] }}>
                      {(s.simulated * 100).toFixed(1)}%
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={s.simulated * 100} aria-valuemin={0} aria-valuemax={100}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.simulated * 100}%`, backgroundColor: stateColors[i] }} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-lg">Theory vs Simulation</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72" role="img" aria-label="Bar chart comparing theoretical and simulated probabilities">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="state" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <RTooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Legend />
                    <Bar dataKey="Theoretical" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Simulated" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader><CardTitle className="text-lg">State Distribution</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72" role="img" aria-label="Pie chart showing state distribution">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%" outerRadius={100} innerRadius={50}
                      dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {results.states.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
                    </Pie>
                    <RTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card mb-8">
          <CardHeader><CardTitle className="text-lg">Attack Rate vs Breach Risk</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72" role="img" aria-label="Line chart showing attack rate vs breach risk">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="rate" label={{ value: "Attack Rate (λ)", position: "insideBottom", offset: -5 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis label={{ value: "Breach Prob. π₂", angle: -90, position: "insideLeft" }} stroke="hsl(var(--muted-foreground))" />
                  <RTooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="risk" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Detailed Results</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">State</th>
                    <th className="text-right py-3 px-4 font-semibold">Theoretical</th>
                    <th className="text-right py-3 px-4 font-semibold">Simulated</th>
                    <th className="text-right py-3 px-4 font-semibold">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {results.states.map((s, i) => {
                    const diff = Math.abs(s.theoretical - s.simulated);
                    return (
                      <tr key={s.state} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: pieColors[i] }} aria-hidden="true" />
                          {s.state}
                        </td>
                        <td className="text-right py-3 px-4 font-mono">{(s.theoretical * 100).toFixed(2)}%</td>
                        <td className="text-right py-3 px-4 font-mono">{(s.simulated * 100).toFixed(2)}%</td>
                        <td className="text-right py-3 px-4">
                          <Badge variant={diff > 0.03 ? "destructive" : "secondary"} className="font-mono text-xs">
                            {(diff * 100).toFixed(2)}%
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
