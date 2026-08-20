import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getLoginUrl, getRegisterUrl } from '@/const';
import InteractiveDemo from '@/components/InteractiveDemo';
import {
  Brain,
  FileText,
  Shield,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lock,
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
      title: 'Contract Intelligence',
      description: 'Every agreement dissected in minutes — clause extraction, plain-English analysis, and a structured risk picture your whole firm can act on',
    },
    {
      title: 'Counsel-Grade Redlines',
      description: 'Replacement language drafted to be accepted as-is: liability capped, indemnities narrowed, termination tightened. You remain the final word',
    },
    {
      title: 'Exposure, Quantified',
      description: 'Every contract scored with estimated financial exposure, so the dangerous ones surface first — before they cost you',
    },
    {
      title: 'Matters & Clients, Unified',
      description: 'Every review filed under the right client and matter as a matter of course. Practice management is part of the fabric, not a second subscription',
    },
    {
      title: 'An Assistant That Knows Your Files',
      description: 'Ask a question and get an answer grounded in your firm\'s own contracts — with the source named, never a chatbot\'s guess',
    },
    {
      title: 'Your Playbook, Enforced',
      description: 'Encode the firm\'s standard positions once, and every review — by every associate — lands on the same standard',
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: pricingBillingCycle === 'monthly' ? '99' : '990',
      period: pricingBillingCycle === 'monthly' ? '/firm/month' : '/firm/year',
      description: 'For solo practitioners and boutique firms',
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
      description: 'For growing practices up to 25 lawyers',
      features: [
        'Unlimited contract reviews',
        'Playbooks and clause library',
        'Team roles and audit trail',
        'Priority support',
        'Word add-in (beta)',
      ],
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'per firm',
      description: 'Private inference, data residency, white glove',
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
    },
    {
      name: 'Small firm, 2–5 lawyers',
      role: 'One price for the whole firm',
      content: 'Everyone reviews under one flat plan. No per-seat maths when a paralegal or a new associate joins the matter.',
    },
    {
      name: 'Growing practice, up to 25',
      role: 'Consistent positions with playbooks',
      content: 'Encode the firm\'s standard positions once; every associate redlines to the same standard, with an audit trail.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B1320] overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-[#C6AD7C]/10 rounded-full blur-3xl"
        animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-[#1C2A3A]/60 rounded-full blur-3xl"
        animate={{ y: [0, -50, 0], x: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-80 h-80 bg-[#C6AD7C]/5 rounded-full blur-3xl"
        animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      {/* Navigation */}
      <motion.nav
        className="fixed top-0 w-full bg-[#0B1320]/70 backdrop-blur-xl border-b border-[#2A3A4E]/70 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.05 }}>
            <img src="/logo.svg" alt="Legal OS" className="w-10 h-10 shrink-0" />
            <span className="text-xl font-bold text-[#FDFBF7]">
              Legal OS
            </span>
          </motion.div>
          <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }}>
            <Button
              variant="outline"
              onClick={() => (window.location.href = getLoginUrl())}
              className="border-[#C6AD7C]/40 bg-transparent text-[#FDFBF7] hover:bg-[#1C2A3A] hover:text-[#FDFBF7] font-semibold"
            >
              Sign In
            </Button>
            <Button
              onClick={() => (window.location.href = getRegisterUrl())}
              className="bg-[#C6AD7C] hover:bg-[#D4BE92] text-[#0B1320] font-semibold shadow-lg shadow-[#C6AD7C]/20"
            >
              Get Started
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
            <span className="inline-block px-4 py-2 bg-[#C6AD7C]/10 border border-[#C6AD7C]/50 rounded-full text-[#C6AD7C] text-sm font-semibold backdrop-blur">
              ✨ Powered by Advanced AI
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-6xl font-bold text-[#FDFBF7] mb-4 leading-tight"
          >
            <span className="bg-gradient-to-r from-[#C6AD7C] via-[#E3D3AC] to-[#C6AD7C] bg-clip-text text-transparent">
              AI-Powered Legal Practice
            </span>
            <br />
            <span className="text-[#FDFBF7]">Management Platform</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg text-[#C8CFD9] mb-6 max-w-3xl mx-auto leading-relaxed"
          >
            Streamline contract review for English-language firms of 1–25 lawyers: upload an agreement, see risks and redlines, attach it to a matter and client, then ask a grounded assistant. Priced per firm, not per Am Law seat.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => (window.location.href = getRegisterUrl())}
                className="bg-[#C6AD7C] hover:bg-[#D4BE92] text-[#0B1320] px-8 py-7 text-lg font-semibold gap-2 shadow-xl shadow-[#C6AD7C]/20"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={scrollToDemo}
                variant="outline"
                className="border-[#C6AD7C]/40 bg-transparent text-[#FDFBF7] hover:bg-[#1C2A3A] hover:text-[#FDFBF7] px-8 py-7 text-lg font-semibold backdrop-blur"
              >
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-8 text-[#A9B0BC] text-sm"
          >
            <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.1 }}>
              <Lock className="w-5 h-5 text-[#C6AD7C]" />
              <span>Private by design — per-firm data isolation</span>
            </motion.div>
            <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.1 }}>
              <Shield className="w-5 h-5 text-[#C6AD7C]" />
              <span>Your documents are never used to train AI models</span>
            </motion.div>
            <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.1 }}>
              <CheckCircle2 className="w-5 h-5 text-[#C6AD7C]" />
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
          <div className="bg-[#1C2A3A]/60 border border-[#2A3A4E] rounded-2xl p-5 backdrop-blur-xl shadow-2xl">
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
                    className="h-20 bg-[#0E1826]/80 rounded-lg border border-[#C6AD7C]/30 flex flex-col items-center justify-center cursor-pointer hover:border-[#C6AD7C]/60 transition-colors"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Icon className="w-6 h-6 text-[#C6AD7C] mb-2" />
                    <span className="text-xs text-[#C8CFD9] font-medium text-center px-2">{item.title}</span>
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
            <h2 className="text-4xl font-bold text-[#FDFBF7] mb-3">
              The Operating System for Your Practice
            </h2>
            <p className="text-[#A9B0BC] text-base max-w-2xl mx-auto">
              From first upload to final signature — contract intelligence, matter management,
              and a grounded assistant in one private workspace
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="group"
              >
                <Card className="bg-[#1C2A3A]/60 border-[#2A3A4E] hover:border-[#C6AD7C]/50 backdrop-blur-xl p-5 h-full transition-all duration-300">
                  <h3 className="text-base font-bold text-[#FDFBF7] mb-2">{feature.title}</h3>
                  <p className="text-[#A9B0BC] text-sm leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
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
            <h2 className="text-4xl font-bold text-[#FDFBF7] mb-3">
              Experience Legal OS in Action
            </h2>
            <p className="text-[#A9B0BC] text-lg max-w-2xl mx-auto">
              The review that used to take an afternoon: analysis, quantified exposure,
              and counsel-grade redlines — filed under the right matter
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <InteractiveDemo />
          </motion.div>
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0E1826]/60 relative">
        <motion.div
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl font-bold text-[#FDFBF7] mb-10 text-center"
          >
            Built for Firms Like Yours
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-4">
            {useCases.map((useCase, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="bg-[#1C2A3A]/60 border border-[#2A3A4E] rounded-xl p-4 backdrop-blur-xl"
              >
                <div className="mb-3">
                  <div className="w-8 h-px bg-[#C6AD7C] mb-3" />
                  <p className="font-semibold text-[#FDFBF7] text-sm">{useCase.name}</p>
                  <p className="text-xs text-[#C6AD7C] mt-0.5">{useCase.role}</p>
                </div>
                <p className="text-[#C8CFD9] text-sm leading-relaxed">{useCase.content}</p>
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
            <h2 className="text-4xl font-bold text-[#FDFBF7] mb-2">Simple, Transparent Pricing</h2>
            <p className="text-[#A9B0BC] text-base mb-6">No sales call. No quote gate. Prices on the page — one flat rate for your whole firm.</p>

            {/* Billing Toggle */}
            <div className="flex justify-center gap-4 mb-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPricingBillingCycle('monthly')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  pricingBillingCycle === 'monthly'
                    ? 'bg-[#C6AD7C] text-[#0B1320] shadow-lg shadow-[#C6AD7C]/20'
                    : 'bg-[#1C2A3A]/60 text-[#A9B0BC] hover:text-[#FDFBF7]'
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
                    ? 'bg-[#C6AD7C] text-[#0B1320] shadow-lg shadow-[#C6AD7C]/20'
                    : 'bg-[#1C2A3A]/60 text-[#A9B0BC] hover:text-[#FDFBF7]'
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
                      ? 'bg-[#1C2A3A] border-[#C6AD7C]/60 shadow-2xl shadow-[#C6AD7C]/20 scale-105'
                      : 'bg-[#1C2A3A]/60 border-[#2A3A4E] hover:border-[#C6AD7C]/50 backdrop-blur-xl'
                  }`}
                >
                  {plan.highlighted && (
                    <motion.div
                      className="absolute top-0 right-0 px-4 py-2 bg-[#C6AD7C] text-[#0B1320] text-xs font-bold rounded-bl-lg"
                      animate={{ y: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      POPULAR
                    </motion.div>
                  )}

                  <h3 className="text-lg font-bold text-[#FDFBF7] mb-1">{plan.name}</h3>
                  <p className={`mb-4 text-sm ${plan.highlighted ? 'text-[#D8D2C4]' : 'text-[#A9B0BC]'}`}>
                    {plan.description}
                  </p>

                  <div className="mb-4">
                    <span className="text-3xl font-bold text-[#FDFBF7]">${plan.price}</span>
                    <span className={`text-xs ${plan.highlighted ? 'text-[#D8D2C4]' : 'text-[#A9B0BC]'}`}>
                      {' '}{plan.period}
                    </span>
                  </div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mb-4">
                    <Button
                      onClick={() => (window.location.href = getRegisterUrl())}
                      className={`w-full font-semibold ${
                        plan.highlighted
                          ? 'bg-[#C6AD7C] hover:bg-[#D4BE92] text-[#0B1320] shadow-lg shadow-[#C6AD7C]/20'
                          : 'bg-transparent border border-[#C6AD7C]/40 text-[#FDFBF7] hover:bg-[#C6AD7C]/10'
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
                          plan.highlighted ? 'text-[#FDFBF7]' : 'text-[#C8CFD9]'
                        }`}
                        whileHover={{ x: 5 }}
                      >
                        <CheckCircle2 className="w-5 h-5 text-[#C6AD7C] flex-shrink-0" />
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
            <h2 className="text-4xl font-bold text-[#FDFBF7] mb-3">Why Per-Firm Pricing</h2>
            <p className="text-[#A9B0BC] text-base max-w-2xl mx-auto">
              Legal AI is usually priced per seat. For a small firm, the seats add up faster than the value does.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              variants={itemVariants}
              className="bg-[#1C2A3A]/60 border border-[#2A3A4E] rounded-xl p-6 backdrop-blur-xl"
            >
              <h3 className="text-lg font-bold text-[#D8D2C4] mb-4">The per-seat stack (3-lawyer firm)</h3>
              <ul className="space-y-3 text-sm text-[#C8CFD9]">
                <li className="flex justify-between gap-4">
                  <span>Contract AI, per seat</span>
                  <span className="text-[#A9B0BC]">~$99–160 × 3 seats</span>
                </li>
                <li className="flex justify-between gap-4">
                  <span>Practice management, per seat</span>
                  <span className="text-[#A9B0BC]">~$39–139 × 3 seats</span>
                </li>
                <li className="flex justify-between gap-4">
                  <span>AI add-on for the PM tool, per seat</span>
                  <span className="text-[#A9B0BC]">~$49–59 × 3 seats</span>
                </li>
                <li className="flex justify-between gap-4 border-t border-[#2A3A4E] pt-3 font-semibold text-[#FDFBF7]">
                  <span>Typical total</span>
                  <span>$400–500+/month, climbing per hire</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-[#1C2A3A] border border-[#C6AD7C]/50 rounded-xl p-6 backdrop-blur-xl"
            >
              <h3 className="text-lg font-bold text-[#FDFBF7] mb-4">Legal OS</h3>
              <ul className="space-y-3 text-sm text-[#D8D2C4]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C6AD7C] flex-shrink-0" />
                  <span>$99–299/month flat for the whole firm</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C6AD7C] flex-shrink-0" />
                  <span>Contract review, redlines, and matters in one product</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C6AD7C] flex-shrink-0" />
                  <span>Add a lawyer or paralegal — the price stays the same</span>
                </li>
                <li className="flex items-center gap-2 border-t border-[#C6AD7C]/30 pt-3 font-semibold text-[#FDFBF7]">
                  <CheckCircle2 className="w-5 h-5 text-[#C6AD7C] flex-shrink-0" />
                  <span>One subscription. One number in the budget.</span>
                </li>
              </ul>
            </motion.div>
          </div>

          <motion.p variants={itemVariants} className="text-xs text-[#6B7686] text-center mt-6 max-w-3xl mx-auto">
            Comparison based on publicly reported per-seat prices for leading contract-AI and practice-management tools as of mid-2026.
            Most vendors quote pricing privately, so figures vary by source and firm size.
          </motion.p>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#C6AD7C]/5 blur-3xl" />
        <motion.div
          className="max-w-4xl mx-auto text-center relative z-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2
            variants={itemVariants}
            className="text-5xl font-bold text-[#FDFBF7] mb-6"
          >
            Ready to Transform Your Legal Practice?
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-[#D8D2C4] mb-10 text-xl leading-relaxed"
          >
            A private workspace for your firm, a full review of your first agreement,
            and an assistant that knows your files — live in minutes. No credit card required.
          </motion.p>
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => (window.location.href = getRegisterUrl())}
              className="bg-[#C6AD7C] hover:bg-[#D4BE92] text-[#0B1320] px-10 py-7 text-lg font-bold shadow-xl shadow-[#C6AD7C]/20"
            >
              Get Started <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2A3A4E]/70 bg-[#0E1826]/60 backdrop-blur-xl py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
              <h4 className="text-[#FDFBF7] font-bold mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#C6AD7C]" />
                Product
              </h4>
              <ul className="space-y-3 text-[#A9B0BC] text-sm">
                <li>
                  <a href="#" className="hover:text-[#C6AD7C] transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#C6AD7C] transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#C6AD7C] transition">
                    Security
                  </a>
                </li>
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
              <h4 className="text-[#FDFBF7] font-bold mb-6">Company</h4>
              <ul className="space-y-3 text-[#A9B0BC] text-sm">
                <li>
                  <a href="#" className="hover:text-[#C6AD7C] transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#C6AD7C] transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#C6AD7C] transition">
                    Contact
                  </a>
                </li>
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
              <h4 className="text-[#FDFBF7] font-bold mb-6">Legal</h4>
              <ul className="space-y-3 text-[#A9B0BC] text-sm">
                <li>
                  <a href="#" className="hover:text-[#C6AD7C] transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#C6AD7C] transition">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#C6AD7C] transition">
                    Compliance
                  </a>
                </li>
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
              <h4 className="text-[#FDFBF7] font-bold mb-6">Support</h4>
              <ul className="space-y-3 text-[#A9B0BC] text-sm">
                <li>
                  <a href="#" className="hover:text-[#C6AD7C] transition">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#C6AD7C] transition">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#C6AD7C] transition">
                    API Docs
                  </a>
                </li>
              </ul>
            </motion.div>
          </div>

          <div className="border-t border-[#2A3A4E]/70 pt-8 flex flex-col md:flex-row justify-between items-center">
            <motion.div className="flex items-center gap-3 mb-4 md:mb-0" whileHover={{ scale: 1.05 }}>
              <div className="w-8 h-8 bg-[#C6AD7C] rounded-lg flex items-center justify-center shadow-lg">
                <FileText className="w-5 h-5 text-[#0B1320] font-bold" />
              </div>
              <span className="text-[#FDFBF7] font-bold">Legal OS</span>
            </motion.div>
            <p className="text-[#A9B0BC] text-sm">
              © 2026 Legal OS. All rights reserved. Powered by SpiderNetOS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
