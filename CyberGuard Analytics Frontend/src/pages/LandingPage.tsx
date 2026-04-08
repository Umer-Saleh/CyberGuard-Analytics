import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/ui/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield, Activity, BarChart3, Zap, GitCompare, Eye, LineChart,
  ArrowRight,
} from "lucide-react";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay, duration: 0.5 },
});

const overviewCards = [
  {
    icon: Activity,
    title: "Poisson Process",
    desc: "Attack arrivals modeled as a Poisson process with rate λ, capturing random event occurrences.",
    link: "/documentation",
  },
  {
    icon: GitCompare,
    title: "Markov Chains",
    desc: "State transitions between Safe, Attack, Compromised, and Recovery via CTMC.",
    link: "/documentation",
  },
  {
    icon: BarChart3,
    title: "Simulation Engine",
    desc: "Monte Carlo simulation produces steady-state probabilities and risk metrics.",
    link: "/simulation",
  },
];

const features = [
  { icon: Zap, title: "Real-Time Simulation", desc: "Run stochastic simulations with live parameter tuning.", link: "/simulation" },
  { icon: Shield, title: "Threat Probability", desc: "Model attack likelihood using Poisson distributions.", link: "/results" },
  { icon: LineChart, title: "Risk Forecasting", desc: "Predict future compromise risk with trend analysis.", link: "/analysis" },
  { icon: BarChart3, title: "Performance Metrics", desc: "Track availability, MTBF, and failure rates.", link: "/results" },
  { icon: GitCompare, title: "Scenario Comparison", desc: "Compare defense strategies side by side.", link: "/analysis" },
  { icon: Eye, title: "Advanced Visualization", desc: "Interactive charts, heatmaps, and gauge displays.", link: "/analysis" },
];

const techBadges = [
  "Python", "NumPy", "Matplotlib", "FastAPI",
  "Markov Chains", "Poisson Process", "Monte Carlo Simulation",
];

export default function LandingPage() {
  return (
    <PageTransition>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 gradient-primary opacity-5" aria-hidden="true" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" aria-hidden="true" />
        <div className="container relative z-10 text-center max-w-4xl mx-auto">
          <motion.div {...fadeUp(0)}>
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-xs font-medium">
              Stochastic Modeling Platform
            </Badge>
          </motion.div>
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6"
            {...fadeUp(0.1)}
          >
            Cybersecurity Intrusion Detection{" "}
            <span className="gradient-text">Analytics Platform</span>
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            {...fadeUp(0.2)}
          >
            Advanced stochastic modeling using Poisson Processes and Markov Chains
            for predictive cybersecurity risk analysis.
          </motion.p>
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" {...fadeUp(0.3)}>
            <Button asChild size="lg" className="font-semibold gap-2">
              <Link to="/simulation">
                Start Simulation <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-semibold">
              <Link to="/documentation">View Documentation</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16 md:py-24 bg-muted/30" aria-labelledby="overview-heading">
        <div className="container max-w-5xl">
          <motion.h2 id="overview-heading" className="text-3xl font-bold text-center mb-12" {...fadeUp(0)}>
            System Overview
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {overviewCards.map((c, i) => (
              <motion.div key={c.title} {...fadeUp(i * 0.1)}>
                <Link to={c.link} className="block h-full">
                  <Card className="h-full glass-card hover:cyber-glow-sm transition-shadow duration-300 hover:-translate-y-1 cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="mx-auto mb-4 w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                        <c.icon className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
                      </div>
                      <h3 className="font-semibold mb-2">{c.title}</h3>
                      <p className="text-sm text-muted-foreground">{c.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24" aria-labelledby="features-heading">
        <div className="container max-w-5xl">
          <motion.h2 id="features-heading" className="text-3xl font-bold text-center mb-12" {...fadeUp(0)}>
            Feature Highlights
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} {...fadeUp(i * 0.08)}>
                <Link to={f.link} className="block h-full">
                  <Card className="h-full group glass-card hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                    <CardContent className="p-6">
                      <f.icon className="h-8 w-8 mb-4 text-primary group-hover:text-accent transition-colors" aria-hidden="true" />
                      <h3 className="font-semibold mb-1">{f.title}</h3>
                      <p className="text-sm text-muted-foreground">{f.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 md:py-24 bg-muted/30" aria-labelledby="tech-heading">
        <div className="container max-w-3xl text-center">
          <motion.h2 id="tech-heading" className="text-3xl font-bold mb-8" {...fadeUp(0)}>
            Technology Stack
          </motion.h2>
          <motion.div className="flex flex-wrap justify-center gap-3" {...fadeUp(0.1)}>
            {techBadges.map((t) => (
              <Badge key={t} variant="outline" className="px-4 py-2 text-sm font-medium">
                {t}
              </Badge>
            ))}
          </motion.div>
        </div>
      </section>
    </PageTransition>
  );
}
