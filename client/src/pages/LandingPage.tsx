import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getLoginUrl } from '@/const';
import {
  Brain,
  FileText,
  Users,
  Zap,
  Shield,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Intelligent contract analysis, risk assessment, and legal research powered by advanced LLMs',
    },
    {
      icon: FileText,
      title: 'Document Management',
      description: 'Centralized repository for contracts, briefs, and legal documents with version control',
    },
    {
      icon: Users,
      title: 'Real-Time Collaboration',
      description: 'Work together seamlessly with WebSocket-powered live editing and presence awareness',
    },
    {
      icon: Zap,
      title: 'Automation',
      description: 'Automate document generation, filing, and workflow processes to save time',
    },
    {
      icon: Shield,
      title: 'Security & Compliance',
      description: 'Enterprise-grade security with audit logging and firm-based data isolation',
    },
    {
      icon: TrendingUp,
      title: 'Analytics & Insights',
      description: 'Predictive analytics for case outcomes and litigation strategy recommendations',
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$99',
      period: '/month',
      description: 'Perfect for solo practitioners',
      features: [
        'Up to 50 contracts',
        'Basic AI analysis',
        'Document storage (10GB)',
        'Email support',
      ],
    },
    {
      name: 'Professional',
      price: '$299',
      period: '/month',
      description: 'For growing law firms',
      features: [
        'Unlimited contracts',
        'Advanced AI features',
        'Document storage (100GB)',
        'Real-time collaboration',
        'Priority support',
      ],
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'For large organizations',
      features: [
        'Everything in Professional',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantee',
        'On-premise option',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-teal-400 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <span className="text-xl font-bold text-white">Legal OS</span>
          </div>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            AI-Powered Legal Practice Management
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Streamline your legal workflow with intelligent contract analysis, real-time collaboration, and predictive analytics. Built for modern law firms.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-6 text-lg gap-2"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              className="border-slate-600 text-slate-200 hover:bg-slate-800 px-8 py-6 text-lg"
            >
              Watch Demo
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-slate-400 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span>SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span>99.9% Uptime SLA</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4 text-center">
            Powerful Features for Modern Law Firms
          </h2>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            Everything you need to manage your legal practice efficiently
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={idx}
                  className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors p-6"
                >
                  <Icon className="w-12 h-12 text-blue-400 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4 text-center">
            Simple, Transparent Pricing
          </h2>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            Choose the plan that fits your firm's needs
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, idx) => (
              <Card
                key={idx}
                className={`p-8 transition-all ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500 shadow-xl scale-105'
                    : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-white'}`}>
                  {plan.name}
                </h3>
                <p className={`mb-4 ${plan.highlighted ? 'text-blue-100' : 'text-slate-400'}`}>
                  {plan.description}
                </p>

                <div className="mb-6">
                  <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-white'}`}>
                    {plan.price}
                  </span>
                  <span className={plan.highlighted ? 'text-blue-100' : 'text-slate-400'}>
                    {' '}{plan.period}
                  </span>
                </div>

                <Button
                  onClick={() => (window.location.href = getLoginUrl())}
                  className={`w-full mb-6 ${
                    plan.highlighted
                      ? 'bg-white text-blue-600 hover:bg-slate-100'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Get Started
                </Button>

                <ul className="space-y-3">
                  {plan.features.map((feature, fidx) => (
                    <li
                      key={fidx}
                      className={`flex items-center gap-2 ${
                        plan.highlighted ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-teal-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Legal Practice?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join hundreds of law firms using Legal OS to work smarter
          </p>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-6 text-lg font-semibold"
          >
            Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Compliance</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition">API Docs</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-teal-400 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-slate-950" />
              </div>
              <span className="text-white font-semibold">Legal OS</span>
            </div>
            <p className="text-slate-400 text-sm">
              © 2026 Legal OS. All rights reserved. Powered by SpiderNetOS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
