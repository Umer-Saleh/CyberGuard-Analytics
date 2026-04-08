import { Shield, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm" role="contentinfo">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
              <span className="font-bold gradient-text">CyberIDS Platform</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Stochastic Intrusion Detection Simulation & Analytics
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-sm">Project Information</h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>Group Members: 
                <br/>1. Ahmed baig (SE-22068)
                <br/>2. Syed Noor Ul Talha (SE-22072)
                <br/>3. Muhammad Umer Saleh (SE-22076)
                <br/>4. Syed Muhammad Reyan Imam (SE-22091)
              </li>
              <li>Course: Stochastic process (SE-410)</li>
              <li>University: NED University of Engineering and Technology</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-sm">Links</h3>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              aria-label="GitHub repository (opens in new tab)"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              GitHub Repository
            </a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border/50 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} CyberIDS Platform. Built for academic demonstration.
        </div>
      </div>
    </footer>
  );
}
