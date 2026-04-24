import { useEffect } from 'react';
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import {
  Zap,
  Brain,
  FileText,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Shield,
  Clock,
  Loader2,
} from "lucide-react";
import { getLoginUrl } from "@/const";

/**
 * Home Page - Landing/Dashboard Router
 * Shows landing page for unauthenticated users
 * Redirects authenticated users to dashboard
 */
export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, loading, setLocation]);

  if (isAuthenticated && !loading) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Analysis",
      description: "Instant contract analysis, risk assessment, and clause extraction",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Automated Redlining",
      description: "Generate optimized contract revisions in minutes, not hours",
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Due Diligence Automation",
      description: "Comprehensive document review and compliance checking",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Intelligence Insights",
      description: "Predictive analytics and case outcome forecasting",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Risk Management",
      description: "Identify and mitigate legal risks before they escalate",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Time Savings",
      description: "Reduce contract review time from hours to minutes",
    },
  ];

  const benefits = [
    "Reduce junior lawyer workload by 70%",
    "Improve contract quality and consistency",
    "Accelerate deal closing timelines",
    "Minimize legal exposure and risk",
    "Increase billable hours and profitability",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url('https://d2xsxph8kpxj0f.cloudfront.net/310519663528248010/6hjpNvzaSJkXq3R8betM7U/legal-os-hero-1-FmP5WQ6mCYs3PbvvZW2XNL.webp')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Legal OS
              <span className="block text-accent mt-2">Powered by SpiderNetOS</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              An AI operating system for law firms that automates analysis, drafting, due diligence, and litigation preparation.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Try Demo <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Powerful Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything your law firm needs to automate legal operations and increase efficiency
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 text-accent">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Why Law Firms Choose Legal OS</h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <p className="text-foreground">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-secondary/50 rounded-lg p-8 border border-border">
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Average Time Savings</p>
                  <p className="text-3xl font-bold text-accent">5 minutes</p>
                  <p className="text-xs text-muted-foreground">per contract review (vs. 6 hours)</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Risk Reduction</p>
                  <p className="text-3xl font-bold text-success">70%</p>
                  <p className="text-xs text-muted-foreground">fewer missed legal issues</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Productivity Increase</p>
                  <p className="text-3xl font-bold text-accent">3x</p>
                  <p className="text-xs text-muted-foreground">more contracts processed daily</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Simple Pricing</h2>
            <p className="text-muted-foreground">Choose the plan that fits your firm</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                name: "Associate",
                price: "$79",
                description: "For solo lawyers and small firms",
                features: ["Contract analysis", "Clause extraction", "Risk scoring", "50 AI credits/month"],
              },
              {
                name: "Firm",
                price: "$299",
                description: "For boutique firms (5-25 lawyers)",
                features: ["Everything in Associate", "Due diligence automation", "Team collaboration", "300 AI credits/month"],
                highlighted: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "For large firms and corporations",
                features: ["Full SpiderNet OS", "Custom deployment", "Private memory graph", "Unlimited credits"],
              },
            ].map((plan, index) => (
              <Card key={index} className={plan.highlighted ? "border-accent border-2 shadow-lg" : ""}>
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                    {plan.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex gap-2 items-start text-sm">
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                    onClick={() => window.location.href = getLoginUrl()}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Transform Your Law Practice?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join law firms using Legal OS to automate legal operations and increase profitability
          </p>
          <Button
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={() => window.location.href = getLoginUrl()}
          >
            Start Free Demo <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 Legal OS. Powered by SpiderNetOS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
