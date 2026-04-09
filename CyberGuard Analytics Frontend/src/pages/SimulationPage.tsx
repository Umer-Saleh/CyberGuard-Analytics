import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/ui/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Play, RotateCcw, Loader2, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { defaultParams } from "@/lib/mockData";
import { runSimulation, SIM_RESULTS_STORAGE_KEY } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const fields = [
  { key: "lambda", label: "Attack Arrival Rate (λ)", tooltip: "Rate at which cyber attacks arrive (Poisson parameter).", unit: "events/hr", placeholder: "5.0" },
  { key: "alpha", label: "Defense Success Rate (α)", tooltip: "Rate at which threats are successfully neutralized.", unit: "rate", placeholder: "3.0" },
  { key: "beta", label: "Breach Success Rate (β)", tooltip: "Probability rate of successful system compromise.", unit: "rate", placeholder: "1.0" },
  { key: "gamma", label: "Recovery Rate (γ)", tooltip: "Rate at which compromised systems begin recovery.", unit: "rate", placeholder: "2.0" },
  { key: "delta", label: "Patch Completion Rate (δ)", tooltip: "Rate at which recovery finishes.", unit: "rate", placeholder: "4.0" },
  { key: "simulationTime", label: "Simulation Time", tooltip: "Total simulation duration in time units.", unit: "units", placeholder: "1000" },
] as const;

const tips = [
  "Higher λ means more frequent attacks.",
  "Increase α to improve defense effectiveness.",
  "Lower β reduces breach probability.",
  "Default values represent a moderate threat scenario.",
];

export default function SimulationPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [params, setParams] = useState(() => {
    try {
      const stored = localStorage.getItem("ids-sim-params");
      return stored ? JSON.parse(stored) : { ...defaultParams };
    } catch {
      return { ...defaultParams };
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("ids-sim-params", JSON.stringify(params));
  }, [params]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    for (const f of fields) {
      const v = params[f.key];
      if (v === undefined || v === null || isNaN(v)) {
        newErrors[f.key] = "Required";
      } else if (v <= 0) {
        newErrors[f.key] = "Must be > 0";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRun = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = await runSimulation(params);
      sessionStorage.setItem(SIM_RESULTS_STORAGE_KEY, JSON.stringify(payload));
      navigate("/results");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not reach the simulation server.";
      toast({
        title: "Simulation failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setParams({ ...defaultParams });
    setErrors({});
  };

  return (
    <PageTransition>
      <div className="container py-8 md:py-12">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-3xl font-bold mb-2">Simulation Parameters</h1>
          <p className="text-muted-foreground mb-8">Configure stochastic model parameters and run the simulation.</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" aria-hidden="true" />
                  Parameter Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-6">
                  {fields.map((f) => (
                    <div key={f.key} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={f.key} className="font-medium text-sm">{f.label}</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" aria-label={`Info about ${f.label}`}>
                              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent><p className="max-w-xs text-xs">{f.tooltip}</p></TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="relative">
                        <Input
                          id={f.key}
                          type="number"
                          step="0.1"
                          min="0.01"
                          placeholder={f.placeholder}
                          value={params[f.key]}
                          onChange={(e) => {
                            setParams((p: typeof params) => ({ ...p, [f.key]: parseFloat(e.target.value) || 0 }));
                            setErrors((prev) => { const n = { ...prev }; delete n[f.key]; return n; });
                          }}
                          className={errors[f.key] ? "border-destructive" : ""}
                          aria-invalid={!!errors[f.key]}
                          aria-describedby={errors[f.key] ? `${f.key}-error` : undefined}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                          {f.unit}
                        </span>
                      </div>
                      {errors[f.key] && (
                        <p id={`${f.key}-error`} className="text-xs text-destructive" role="alert">{errors[f.key]}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-8">
                  <Button onClick={handleRun} disabled={loading} className="font-semibold gap-2">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    {loading ? "Running..." : "Run Simulation"}
                  </Button>
                  <Button variant="outline" onClick={handleReset} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-5 w-5 text-cyan-500" aria-hidden="true" />
                  Quick Help
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm mb-2">Default Values</h3>
                  <div className="space-y-1">
                    {fields.map((f) => (
                      <div key={f.key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{f.label.split("(")[0].trim()}</span>
                        <Badge variant="secondary" className="font-mono text-xs">{f.placeholder}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-2">Tips</h3>
                  <ul className="space-y-2">
                    {tips.map((t) => (
                      <li key={t} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
