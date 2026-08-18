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
      title: 'AI Contract Analysis',
      description: 'Upload an agreement and get clause extraction, plain-English explanations, and a structured risk summary in minutes',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FileText,
      title: 'Automated Redlines',
      description: 'Suggested rewrites that cap liability, narrow indemnities, and fix termination gaps — ready to accept or edit',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Gauge,
      title: 'Risk Scoring',
      description: 'Every contract scored high, medium, or low with estimated exposure, so you triage the dangerous ones first',
      color: 'from-red-500 to-rose-500',
    },
    {
      icon: Users,
      title: 'Matters & Clients Built In',
      description: 'Light practice management included: link every review to a client and matter without a second subscription',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Sparkles,
      title: 'Grounded Assistant',
      description: 'Ask questions and get answers grounded in the contracts in your workspace — not generic chatbot output',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Zap,
      title: 'Playbooks',
      description: 'Encode your firm\'s standard positions once, and every review redlines to the same standard',
      color: 'from-indigo-500 to-blue-500',
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: pricingBillingCycle === 'monthly' ? '99' : '990',
      period: pricingBillingCycle === 'monthly' ? '/firm/month' : '/firm/year',
      description: 'Solo and 2–5 lawyer shops',
      features: [
        'Firm-wide cockpit (not per seat)',
        '50 contract reviews / month',
        'Risk scoring + redlines',
        'Matters and clients',
        'Grounded assistant',
      ],
    },
    {
      name: 'Professional',
      price: pricingBillingCycle === 'monthly' ? '299' : '2990',
      period: pricingBillingCycle === 'monthly' ? '/firm/month' : '/firm/year',
      description: 'Growing firms up to 25 lawyers',
      features: [
        'Unlimited contract reviews',
        'Playbooks and clause library',
        'Team roles and audit trail',
        'Priority support',
        'Coming: Word add-in',
      ],
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'per firm',
      description: 'Private inference and data residency',
      features: [
        'Everything in Professional',
        'SpiderNet inference plane',
        'Dedicated tenant',
        'SLA',
        'No per-seat Am Law pricing',
      ],
    },
  ];

  const useCases = [
    {
      name: 'Solo practitioner',
      role: 'Triage NDAs in minutes',
      content: 'Upload an NDA, see the three clauses that matter, and send back a redline the same afternoon — without hiring a second pair of eyes.',
      avatar: '⚖️',
    },
    {
      name: 'Small firm, 2–5 lawyers',
      role: 'One price for the whole firm',
      content: 'Everyone reviews under one flat plan. No per-seat maths when a paralegal or a new associate joins the matter.',
      avatar: '🤝',
    },
    {
      name: 'Growing practice, up to 25',
      role: 'Consistent positions with playbooks',
      content: 'Encode the firm\'s standard positions once; every associate redlines to the same standard, with an audit trail.',
      avatar: '📚',
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
            <img src="/logo.svg" alt="Legal OS" className="w-10 h-10" />
            <span className="text-xl font-bold text-white">
              Legal OS
            </span>
          </motion.div>
          <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }}>
            <Button
              variant="outline"
              onClick={() => (window.location.href = getLoginUrl())}
              className="border-slate-600 text-slate-200 hover:bg-slate-800/50 font-semibold"
            >
              Sign In
            </Button>
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-blue-500/50"
            >
              Open Demo
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
              ✨ Priced per firm, not per seat
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight"
          >
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              AI Contract Review
            </span>
            <br />
            <span className="text-slate-100">for Firms of 1–25 Lawyers</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg text-slate-300 mb-6 max-w-3xl mx-auto leading-relaxed"
          >
            Upload an agreement, see risks and redlines, attach it to a matter and client, then ask a grounded assistant — with light practice management built in. One flat price for the whole firm.
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
                Start demo <ArrowRight className="w-5 h-5" />
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
              <Lock className="w-5 h-5 text-emerald-400" />
              <span>Private by design — demo data never leaves your browser</span>
            </motion.div>
            <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.1 }}>
              <Shield className="w-5 h-5 text-emerald-400" />
              <span>Your documents are never used to train AI models</span>
            </motion.div>
            <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.1 }}>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Transparent pricing — no sales call required</span>
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
              risk scoring, and AI-powered insights
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
            Built for Firms Like Yours
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-4">
            {useCases.map((useCase, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 backdrop-blur-xl"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{useCase.avatar}</span>
                  <div>
                    <p className="font-semibold text-white text-sm">{useCase.name}</p>
                    <p className="text-xs text-blue-300">{useCase.role}</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{useCase.content}</p>
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
            <p className="text-slate-400 text-base mb-6">No sales call. No quote gate. Prices on the page — one flat rate for your whole firm.</p>

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
                      Start demo
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

      {/* Per-Firm Pricing Comparison */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          className="max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants} className="text-center mb-10">
            <h2 className="text-4xl font-bold text-white mb-3">Why Per-Firm Pricing</h2>
            <p className="text-slate-400 text-base max-w-2xl mx-auto">
              Legal AI is usually priced per seat. For a small firm, the seats add up faster than the value does.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              variants={itemVariants}
              className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 backdrop-blur-xl"
            >
              <h3 className="text-lg font-bold text-slate-200 mb-4">The per-seat stack (3-lawyer firm)</h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex justify-between gap-4">
                  <span>Contract AI, per seat</span>
                  <span className="text-slate-400">~$99–160 × 3 seats</span>
                </li>
                <li className="flex justify-between gap-4">
                  <span>Practice management, per seat</span>
                  <span className="text-slate-400">~$39–139 × 3 seats</span>
                </li>
                <li className="flex justify-between gap-4">
                  <span>AI add-on for the PM tool, per seat</span>
                  <span className="text-slate-400">~$49–59 × 3 seats</span>
                </li>
                <li className="flex justify-between gap-4 border-t border-slate-700/50 pt-3 font-semibold text-white">
                  <span>Typical total</span>
                  <span>$400–500+/month, climbing per hire</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-blue-600/30 to-cyan-600/30 border border-blue-500/50 rounded-xl p-6 backdrop-blur-xl"
            >
              <h3 className="text-lg font-bold text-white mb-4">Legal OS</h3>
              <ul className="space-y-3 text-sm text-blue-50">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>$99–299/month flat for the whole firm</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Contract review, redlines, and matters in one product</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Add a lawyer or paralegal — the price stays the same</span>
                </li>
                <li className="flex items-center gap-2 border-t border-blue-500/30 pt-3 font-semibold text-white">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>One subscription. One number in the budget.</span>
                </li>
              </ul>
            </motion.div>
          </div>

          <motion.p variants={itemVariants} className="text-xs text-slate-500 text-center mt-6 max-w-3xl mx-auto">
            Comparison based on publicly reported per-seat prices for leading contract-AI and practice-management tools as of mid-2026.
            Most vendors quote pricing privately, so figures vary by source and firm size.
          </motion.p>
        </motion.div>
      </section>

      {/* Roadmap Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-900/50 to-blue-900/30 relative">
        <motion.div
          className="max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants} className="text-center mb-10">
            <h2 className="text-4xl font-bold text-white mb-3">What We're Building Next</h2>
            <p className="text-slate-400 text-base max-w-2xl mx-auto">
              We'd rather show you the roadmap than claim it's already done.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            <motion.div variants={itemVariants} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 backdrop-blur-xl">
              <FileText className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-base font-bold text-white mb-2">Microsoft Word Add-in</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Review and redline without leaving Word — where contracts actually live. In development for Professional plans.
              </p>
            </motion.div>
            <motion.div variants={itemVariants} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 backdrop-blur-xl">
              <Zap className="w-8 h-8 text-cyan-400 mb-3" />
              <h3 className="text-base font-bold text-white mb-2">Hosted AI Backend</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Live inference for uploads at scale, with per-firm data isolation. Today's demo runs entirely in your browser.
              </p>
            </motion.div>
            <motion.div variants={itemVariants} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 backdrop-blur-xl">
              <Shield className="w-8 h-8 text-emerald-400 mb-3" />
              <h3 className="text-base font-bold text-white mb-2">SOC 2 Readiness Program</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                A published security page, audit trail, and our no-training-on-your-data pledge in writing — launching alongside hosted plans.
              </p>
            </motion.div>
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
            Open the contract cockpit demo — no credit card, no sign-up, no server required. Data stays in this browser.
            Then try it on your own NDA: the upload flow works right inside the demo.
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
              Open demo <ArrowRight className="w-5 h-5 ml-2" />
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
