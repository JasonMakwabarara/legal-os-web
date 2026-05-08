import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getLoginUrl } from '@/const';
import InteractiveDemo from '@/components/InteractiveDemo';
import {
  Brain,
  FileText,
  Users,
  Zap,
  Shield,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lock,
  Gauge,
  AlertTriangle,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8 },
  },
};

const floatingVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
    },
  },
};

export default function LandingPage() {
  const demoRef = useRef<HTMLDivElement>(null);
  const [pricingBillingCycle, setPricingBillingCycle] = useState('monthly');

  const scrollToDemo = () => {
    demoRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Intelligent contract analysis, risk assessment, and legal research powered by advanced LLMs',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FileText,
      title: 'Document Management',
      description: 'Centralized repository for contracts, briefs, and legal documents with version control',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Users,
      title: 'Real-Time Collaboration',
      description: 'Work together seamlessly with WebSocket-powered live editing and presence awareness',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Zap,
      title: 'Automation',
      description: 'Automate document generation, filing, and workflow processes to save time',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Shield,
      title: 'Security & Compliance',
      description: 'Enterprise-grade security with audit logging and firm-based data isolation',
      color: 'from-red-500 to-rose-500',
    },
    {
      icon: TrendingUp,
      title: 'Analytics & Insights',
      description: 'Predictive analytics for case outcomes and litigation strategy recommendations',
      color: 'from-indigo-500 to-blue-500',
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: pricingBillingCycle === 'monthly' ? '99' : '990',
      period: pricingBillingCycle === 'monthly' ? '/month' : '/year',
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
      price: pricingBillingCycle === 'monthly' ? '299' : '2990',
      period: pricingBillingCycle === 'monthly' ? '/month' : '/year',
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

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Managing Partner, Chen & Associates',
      content: 'Legal OS transformed how we manage contracts. We\'ve reduced review time by 60%.',
      avatar: '👩‍⚖️',
    },
    {
      name: 'Michael Rodriguez',
      role: 'Senior Counsel, Fortune 500 Tech',
      content: 'The AI-powered analysis is incredibly accurate. It\'s like having an extra legal team.',
      avatar: '👨‍💼',
    },
    {
      name: 'Emily Watson',
      role: 'Founder, Watson Legal Group',
      content: 'Best investment we made. The ROI was immediate and the support team is fantastic.',
      avatar: '👩‍💻',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"
        animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
        animate={{ y: [0, -50, 0], x: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
        animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      {/* Navigation */}
      <motion.nav
        className="fixed top-0 w-full bg-slate-950/40 backdrop-blur-xl border-b border-slate-800/50 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.05 }}>
            <img src="/manus-storage/logo_2d94c86e.png" alt="Legal OS" className="w-10 h-10" />
            <span className="text-xl font-bold text-white">
              Legal OS
            </span>
          </motion.div>
          <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }}>
            <Button
              variant="outline"
              onClick={() => (window.location.href = getLoginUrl() + '&signup=true')}
              className="border-slate-600 text-slate-200 hover:bg-slate-800/50 font-semibold"
            >
              Create Account
            </Button>
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-blue-500/50"
            >
              Sign In
            </Button>
          </motion.div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-4">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/50 rounded-full text-blue-300 text-sm font-semibold backdrop-blur">
              ✨ Powered by Advanced AI
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight"
          >
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              AI-Powered Legal Practice
            </span>
            <br />
            <span className="text-slate-100">Management Platform</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg text-slate-300 mb-6 max-w-3xl mx-auto leading-relaxed"
          >
            Streamline your legal workflow with intelligent contract analysis, real-time collaboration, and predictive analytics. Built for modern law firms that demand excellence.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-7 text-lg font-semibold gap-2 shadow-xl shadow-blue-500/50"
              >
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={scrollToDemo}
                variant="outline"
                className="border-slate-600 text-slate-200 hover:bg-slate-800/50 px-8 py-7 text-lg font-semibold backdrop-blur"
              >
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-8 text-slate-400 text-sm"
          >
            <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.1 }}>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Enterprise Security</span>
            </motion.div>
            <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.1 }}>
              <Lock className="w-5 h-5 text-emerald-400" />
              <span>SOC 2 Compliant</span>
            </motion.div>
            <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.1 }}>
              <Gauge className="w-5 h-5 text-emerald-400" />
              <span>99.9% Uptime SLA</span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Floating Card Preview */}
        <motion.div
          className="mt-12 max-w-4xl mx-auto"
          variants={floatingVariants}
          animate="animate"
        >
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-xl shadow-2xl">
            <div className="grid grid-cols-3 gap-3">
              {[
                { title: 'Smart Analysis', Icon: Brain },
                { title: 'Risk Detection', Icon: AlertTriangle },
                { title: 'Recommendations', Icon: Sparkles },
              ].map((item, i) => {
                const Icon = item.Icon;
                return (
                  <motion.div
                    key={i}
                    className="h-20 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-500/30 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/60 transition-colors"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Icon className="w-6 h-6 text-blue-400 mb-2" />
                    <span className="text-xs text-slate-300 font-medium text-center px-2">{item.title}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants} className="text-center mb-10">
            <h2 className="text-4xl font-bold text-white mb-3">
              Powerful Features for Modern Law Firms
            </h2>
            <p className="text-slate-400 text-base max-w-2xl mx-auto">
              Everything you need to manage your legal practice efficiently and securely
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className="group"
                >
                  <Card className="bg-slate-800/30 border-slate-700/50 hover:border-blue-500/50 backdrop-blur-xl p-4 h-full transition-all duration-300">
                    <motion.div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} p-2 mb-3 shadow-lg`}
                         whileHover={{ rotate: 10, scale: 1.1 }}
                    >
                      <Icon className="w-full h-full text-white" />
                    </motion.div>
                    <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Interactive Demo Section */}
      <section ref={demoRef} className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants} className="text-center mb-10">
            <h2 className="text-4xl font-bold text-white mb-3">
              Experience Legal OS in Action
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Watch how Legal OS transforms your legal workflow with intelligent contract analysis,
              real-time collaboration, and AI-powered insights
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <InteractiveDemo />
          </motion.div>
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-900/50 to-blue-900/30 relative">
        <motion.div
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl font-bold text-white mb-10 text-center"
          >
            Trusted by Leading Law Firms
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 backdrop-blur-xl"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{testimonial.avatar}</span>
                  <div>
                    <p className="font-semibold text-white text-sm">{testimonial.name}</p>
                    <p className="text-xs text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">"{testimonial.content}"</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-2">Simple, Transparent Pricing</h2>
            <p className="text-slate-400 text-base mb-6">Choose the plan that fits your firm's needs</p>

            {/* Billing Toggle */}
            <div className="flex justify-center gap-4 mb-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPricingBillingCycle('monthly')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  pricingBillingCycle === 'monthly'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPricingBillingCycle('yearly')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  pricingBillingCycle === 'yearly'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white'
                }`}
              >
                Yearly <span className="text-xs ml-1">(Save 20%)</span>
              </motion.button>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {pricingPlans.map((plan, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -6 }}
                className="group"
              >
                <Card
                  className={`p-5 transition-all duration-300 relative overflow-hidden h-full ${
                    plan.highlighted
                      ? 'bg-gradient-to-br from-blue-600/40 to-cyan-600/40 border-blue-500/50 shadow-2xl shadow-blue-500/30 scale-105'
                      : 'bg-slate-800/30 border-slate-700/50 hover:border-blue-500/50 backdrop-blur-xl'
                  }`}
                >
                  {plan.highlighted && (
                    <motion.div
                      className="absolute top-0 right-0 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold rounded-bl-lg"
                      animate={{ y: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      POPULAR
                    </motion.div>
                  )}

                  <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                  <p className={`mb-4 text-sm ${plan.highlighted ? 'text-blue-100' : 'text-slate-400'}`}>
                    {plan.description}
                  </p>

                  <div className="mb-4">
                    <span className="text-3xl font-bold text-white">${plan.price}</span>
                    <span className={`text-xs ${plan.highlighted ? 'text-blue-100' : 'text-slate-400'}`}>
                      {' '}{plan.period}
                    </span>
                  </div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mb-4">
                    <Button
                      onClick={() => (window.location.href = getLoginUrl())}
                      className={`w-full font-semibold ${
                        plan.highlighted
                          ? 'bg-white text-blue-600 hover:bg-slate-100 shadow-lg'
                          : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'
                      }`}
                    >
                      Get Started
                    </Button>
                  </motion.div>

                  <ul className="space-y-2">
                    {plan.features.map((feature, fidx) => (
                      <motion.li
                        key={fidx}
                        className={`flex items-center gap-2 text-sm ${
                          plan.highlighted ? 'text-white' : 'text-slate-300'
                        }`}
                        whileHover={{ x: 5 }}
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 blur-3xl" />
        <motion.div
          className="max-w-4xl mx-auto text-center relative z-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2
            variants={itemVariants}
            className="text-5xl font-bold text-white mb-6"
          >
            Ready to Transform Your Legal Practice?
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-blue-100 mb-10 text-xl leading-relaxed"
          >
            Join hundreds of law firms using Legal OS to work smarter, faster, and with greater confidence. Start your free trial today—no credit card required.
          </motion.p>
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="bg-white text-blue-600 hover:bg-slate-100 px-10 py-7 text-lg font-bold shadow-xl shadow-white/20"
            >
              Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-xl py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
              <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                Product
              </h4>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    Security
                  </a>
                </li>
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
              <h4 className="text-white font-bold mb-6">Company</h4>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    Contact
                  </a>
                </li>
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
              <h4 className="text-white font-bold mb-6">Legal</h4>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    Compliance
                  </a>
                </li>
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
              <h4 className="text-white font-bold mb-6">Support</h4>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    API Docs
                  </a>
                </li>
              </ul>
            </motion.div>
          </div>

          <div className="border-t border-slate-800/50 pt-8 flex flex-col md:flex-row justify-between items-center">
            <motion.div className="flex items-center gap-3 mb-4 md:mb-0" whileHover={{ scale: 1.05 }}>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg">
                <FileText className="w-5 h-5 text-slate-950 font-bold" />
              </div>
              <span className="text-white font-bold">Legal OS</span>
            </motion.div>
            <p className="text-slate-400 text-sm">
              © 2026 Legal OS. All rights reserved. Powered by SpiderNetOS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
