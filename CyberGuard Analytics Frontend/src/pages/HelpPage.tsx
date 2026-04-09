import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/ui/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, HelpCircle, BookOpen, Wrench, AlertTriangle, ArrowLeft, Home } from "lucide-react";

const faqData = [
  {
    category: "General",
    items: [
      { q: "What is this platform?", a: "CyberIDS is a stochastic modeling platform for cybersecurity intrusion detection simulation, using Poisson Processes and Continuous-Time Markov Chains to model attack scenarios and system resilience." },
      { q: "Who is this platform for?", a: "Security analysts, researchers, and students studying stochastic models applied to cybersecurity risk analysis." },
      { q: "Is the simulation real-time?", a: "Currently, the simulation uses precomputed mock data. When connected to a backend API, it will process parameters in real time." },
    ],
  },
  {
    category: "Parameters",
    items: [
      { q: "What is Attack Arrival Rate (λ)?", a: "Lambda (λ) represents the rate at which cyber attacks arrive, modeled as a Poisson process parameter. Higher values mean more frequent attacks." },
      { q: "What is Defense Success Rate (α)?", a: "Alpha (α) is the rate at which active threats are successfully neutralized by the defense system, transitioning from Under Attack back to Safe state." },
      { q: "What is Breach Success Rate (β)?", a: "Beta (β) represents the probability rate at which an attack successfully compromises the system, transitioning from Under Attack to Compromised." },
      { q: "What is Recovery Rate (γ)?", a: "Gamma (γ) is the rate at which compromised systems begin the recovery process." },
      { q: "What is Patch Completion Rate (δ)?", a: "Delta (δ) is the rate at which system recovery completes and the system returns to Safe state." },
    ],
  },
  {
    category: "Troubleshooting",
    items: [
      { q: "The simulation won't run", a: "Ensure all parameter fields have valid positive numbers. Check for error messages under each input field. All values must be greater than zero." },
      { q: "Charts are not displaying", a: "Try refreshing the page. Ensure your browser supports modern JavaScript. If using an ad blocker, try disabling it temporarily." },
      { q: "Theme won't change", a: "Theme preferences are saved in localStorage. Try clearing your browser's site data and refreshing." },
      { q: "Results seem incorrect", a: "The current version uses mock data for demonstration. Actual results will vary when connected to the simulation backend." },
    ],
  },
  {
    category: "Tools & Features",
    items: [
      { q: "What is Sensitivity Analysis?", a: "It shows how changing the attack rate (λ) affects breach probability, helping identify critical threshold values." },
      { q: "What is Monte Carlo Simulation?", a: "A statistical method that runs many simulation iterations to produce a distribution of possible outcomes for breach probability." },
      { q: "What is the Risk Heatmap?", a: "A visualization showing risk intensity across different combinations of attack rate (λ) and defense rate (α)." },
      { q: "How do I export results?", a: "Click the 'Download Results' button on the Results page to export data as a CSV file." },
    ],
  },
];

export default function HelpPage() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return faqData;
    const q = search.toLowerCase();
    return faqData
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [search]);

  return (
    <PageTransition>
      <div className="container py-8 md:py-12 max-w-3xl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
          <p className="text-muted-foreground mb-6">Find answers to common questions and platform guidance.</p>
        </motion.div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input placeholder="Search help topics..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" aria-label="Search help topics" />
        </div>

        {filtered.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No results found for "{search}". Try a different search term.</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((cat) => (
            <Card key={cat.category} className="glass-card mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {cat.category === "General" && <HelpCircle className="h-5 w-5 text-primary" aria-hidden="true" />}
                  {cat.category === "Parameters" && <BookOpen className="h-5 w-5 text-cyan-500" aria-hidden="true" />}
                  {cat.category === "Troubleshooting" && <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />}
                  {cat.category === "Tools & Features" && <Wrench className="h-5 w-5 text-green-500" aria-hidden="true" />}
                  {cat.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {cat.items.map((item, i) => (
                    <AccordionItem key={i} value={`${cat.category}-${i}`}>
                      <AccordionTrigger className="text-sm text-left">{item.q}</AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))
        )}

        <div className="flex flex-wrap gap-3 mt-8">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/simulation"><ArrowLeft className="h-4 w-4" /> Back to Simulation</Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/"><Home className="h-4 w-4" /> Back to Home</Link>
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
