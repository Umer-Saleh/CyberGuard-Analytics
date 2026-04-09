import { useState } from "react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/ui/PageTransition";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, GitBranch, Calculator, Workflow, Code, Copy, Check, ArrowUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const states = [
  { name: "Safe (S₀)", color: "bg-green-500", desc: "Normal operation" },
  { name: "Under Attack (S₁)", color: "bg-amber-500", desc: "Active intrusion attempt" },
  { name: "Compromised (S₂)", color: "bg-red-500", desc: "Successful breach" },
  { name: "Recovery (S₃)", color: "bg-blue-500", desc: "Restoring system" },
];

const equations: Record<string, string> = {
  poisson: "P(N(t) = k) = (λt)^k × e^(-λt) / k!",
  steadyState: "πQ = 0, π₀ + π₁ + π₂ + π₃ = 1",
  matrix: `Q = | -(λ)    λ      0      0   |\n    |  α   -(α+β)    β      0   |\n    |  0      0    -(γ)     γ   |\n    |  δ      0      0    -(δ)  |`,
};

export default function DocumentationPage() {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const copyEquation = (key: string) => {
    navigator.clipboard.writeText(equations[key]);
    setCopied(key);
    toast({ title: "Copied!", description: "Equation copied to clipboard." });
    setTimeout(() => setCopied(null), 2000);
  };

  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => setShowScrollTop(window.scrollY > 400), { passive: true });
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <PageTransition>
      <div className="container py-8 md:py-12 max-w-4xl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-3xl font-bold mb-2">Documentation</h1>
          <p className="text-muted-foreground mb-4">Mathematical foundations and system architecture.</p>
          <nav className="flex flex-wrap gap-2 mb-10" aria-label="Documentation sections">
            {["Poisson Process", "Markov Chain", "Math Formulation", "Workflow", "Developer Notes"].map((s) => (
              <Button key={s} variant="outline" size="sm" onClick={() => document.getElementById(s.replace(/\s+/g, "-").toLowerCase())?.scrollIntoView({ behavior: "smooth" })}>
                {s}
              </Button>
            ))}
          </nav>
        </motion.div>

        <Accordion type="multiple" defaultValue={["poisson", "markov", "math", "workflow", "dev"]} className="space-y-4">
          <AccordionItem value="poisson" id="poisson-process" className="border-none">
            <Card className="glass-card">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <CardTitle className="flex items-center gap-2 text-left">
                  <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
                  Poisson Process Model
                </CardTitle>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="space-y-4 pt-0">
                  <p className="text-sm text-muted-foreground">
                    Attack arrivals are modeled as a homogeneous Poisson process with rate parameter λ.
                    The probability of k attacks in time interval t is:
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm text-center overflow-x-auto relative group" role="math" aria-label="Poisson probability formula">
                    {equations.poisson}
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7" onClick={() => copyEquation("poisson")} aria-label="Copy equation">
                      {copied === "poisson" ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The inter-arrival times follow an exponential distribution with mean 1/λ,
                    making this a memoryless process suitable for modeling random cyber attack events.
                  </p>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="markov" id="markov-chain" className="border-none">
            <Card className="glass-card">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <CardTitle className="flex items-center gap-2 text-left">
                  <GitBranch className="h-5 w-5 text-cyan-500" aria-hidden="true" />
                  Continuous-Time Markov Chain
                </CardTitle>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="space-y-4 pt-0">
                  <p className="text-sm text-muted-foreground">
                    The system transitions between four states following a CTMC with the generator matrix Q.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {states.map((s) => (
                      <div key={s.name} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                        <span className={`h-3 w-3 rounded-full ${s.color}`} aria-hidden="true" />
                        <div>
                          <div className="text-xs font-semibold">{s.name}</div>
                          <div className="text-xs text-muted-foreground">{s.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-muted/50 rounded-lg p-6" role="img" aria-label="State transition diagram">
                    <div className="flex flex-col items-center gap-4">
                      {/* Forward path */}
                      <div className="flex flex-wrap justify-center items-center gap-3 text-sm font-mono">
                        <Badge variant="outline" className="bg-green-500/10 border-green-500 text-green-500 px-3 py-1.5">S₀ Safe</Badge>
                        <span className="text-amber-500 font-semibold">— λ →</span>
                        <Badge variant="outline" className="bg-amber-500/10 border-amber-500 text-amber-500 px-3 py-1.5">S₁ Under Attack</Badge>
                        <span className="text-red-500 font-semibold">— β →</span>
                        <Badge variant="outline" className="bg-red-500/10 border-red-500 text-red-500 px-3 py-1.5">S₂ Compromised</Badge>
                        <span className="text-blue-500 font-semibold">— γ →</span>
                        <Badge variant="outline" className="bg-blue-500/10 border-blue-500 text-blue-500 px-3 py-1.5">S₃ Recovery</Badge>
                      </div>
                      {/* Return paths */}
                      <div className="flex flex-wrap justify-center items-center gap-6 text-xs font-mono text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <span className="text-green-500 font-semibold">← α ←</span>
                          <span>S₁ → S₀ (defense success)</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="text-green-500 font-semibold">← δ ←</span>
                          <span>S₃ → S₀ (patch complete)</span>
                        </span>
                      </div>
                      {/* Visual diagram */}
                      <div className="w-full max-w-lg mt-2 p-4 rounded-lg border border-border/50 bg-background/50">
                        <pre className="text-xs sm:text-sm font-mono text-center leading-relaxed">
{`        λ           β           γ
  S₀ ------→ S₁ ------→ S₂ ------→ S₃
  ↑  ←------  ↑                      |
  |     α     |                      |
  |           |          δ           |
  └──────────────────────────────────┘`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="math" id="math-formulation" className="border-none">
            <Card className="glass-card">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <CardTitle className="flex items-center gap-2 text-left">
                  <Calculator className="h-5 w-5 text-amber-500" aria-hidden="true" />
                  Mathematical Formulation
                </CardTitle>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="space-y-4 pt-0">
                  <p className="text-sm text-muted-foreground">
                    Steady-state probabilities are found by solving πQ = 0 with Σπᵢ = 1.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs sm:text-sm overflow-x-auto relative group whitespace-pre" role="math" aria-label="Generator matrix Q">
                    <p className="font-semibold mb-2">Generator Matrix Q:</p>
                    {equations.matrix}
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7" onClick={() => copyEquation("matrix")} aria-label="Copy matrix">
                      {copied === "matrix" ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm relative group" role="math" aria-label="Steady state equations">
                    <p className="font-semibold mb-2">Solve: πQ = 0</p>
                    <p className="text-xs text-muted-foreground">{equations.steadyState}</p>
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7" onClick={() => copyEquation("steadyState")} aria-label="Copy equation">
                      {copied === "steadyState" ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="workflow" id="workflow" className="border-none">
            <Card className="glass-card">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <CardTitle className="flex items-center gap-2 text-left">
                  <Workflow className="h-5 w-5 text-green-500" aria-hidden="true" />
                  System Workflow
                </CardTitle>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {[
                      "1. User configures simulation parameters (λ, α, β, γ, δ, T)",
                      "2. Frontend sends POST request to /simulate API",
                      "3. Backend constructs CTMC generator matrix Q",
                      "4. Steady-state probabilities computed (πQ = 0)",
                      "5. Monte Carlo simulation validates theoretical results",
                      "6. JSON response with probabilities, metrics, and chart data",
                      "7. Frontend renders interactive visualizations",
                    ].map((step) => (
                      <div key={step} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <span className="mt-0.5 h-2 w-2 rounded-full bg-primary shrink-0" aria-hidden="true" />
                        <span className="text-sm">{step}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="dev" id="developer-notes" className="border-none">
            <Card className="glass-card">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <CardTitle className="flex items-center gap-2 text-left">
                  <Code className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  Developer Notes
                </CardTitle>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="space-y-3 text-sm text-muted-foreground pt-0">
                  <p>
                    <strong className="text-foreground">Simulation Logic:</strong> The CTMC simulation uses Gillespie's algorithm
                    to generate exact sample paths. At each step, the time to next transition is drawn from an exponential distribution,
                    and the next state is chosen proportionally to transition rates.
                  </p>
                  <p>
                    <strong className="text-foreground">API Integration:</strong> The frontend is designed to POST parameters to a
                    <code className="mx-1 px-1.5 py-0.5 rounded bg-muted font-mono text-xs">/simulate</code> endpoint.
                    Currently using mock data; replace with FastAPI backend for production use.
                  </p>
                  <p>
                    <strong className="text-foreground">Expected Response:</strong>
                  </p>
                  <pre className="bg-muted/50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
{`{
  "pi0": 0.50, "pi1": 0.27,
  "pi2": 0.14, "pi3": 0.09,
  "metrics": {
    "availability": 0.952,
    "mtbf": 245.3,
    "failureRate": 0.0041
  }
}`}
                  </pre>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>

        {showScrollTop && (
          <Button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg gap-2"
            size="icon"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        )}
      </div>
    </PageTransition>
  );
}
