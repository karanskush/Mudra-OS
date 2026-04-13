import React from 'react';
import { Database, Zap, Shield, TrendingUp, Globe, Code, Users, BarChart3, Lock, Cpu, Webhook, Eye, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: Database,
    title: 'Core Ledger System',
    description: 'Double-entry, multi-currency accounts with idempotent journal posting and point-in-time balance queries.',
    category: 'Foundation',
    accent: 'blue',
    action: 'ledger',
  },
  {
    icon: Zap,
    title: 'Payment Orchestration',
    description: 'Full funds-flow API with UPI, SEPA, and Crypto rails. Asynchronous status lifecycle with real-time updates.',
    category: 'Payments',
    accent: 'violet',
  },
  {
    icon: TrendingUp,
    title: 'Smart Routing Optimizer',
    description: 'Intelligent cost and SLA analysis. Chooses optimal rails and tracks savings per transaction.',
    category: 'Optimization',
    accent: 'brand',
  },
  {
    icon: Shield,
    title: 'KYC & Risk Engine',
    description: 'Automated compliance with synthetic profiles and hot-reload policy rules via JSONLogic.',
    category: 'Compliance',
    accent: 'red',
    action: 'kyc',
  },
  {
    icon: BarChart3,
    title: 'Reconciliation Engine',
    description: 'Automated nightly jobs import settlement CSVs, compare against ledger, and flag variances.',
    category: 'Operations',
    accent: 'amber',
  },
  {
    icon: Globe,
    title: 'Treasury & FX',
    description: 'Daily rate imports with configurable spreads. Books FX margins into revenue accounts.',
    category: 'Treasury',
    accent: 'cyan',
  },
  {
    icon: Webhook,
    title: 'Self-Serve APIs',
    description: 'HMAC-signed webhooks with retry logic. Auto-generated SDKs for Go and TypeScript.',
    category: 'Integration',
    accent: 'indigo',
  },
  {
    icon: Code,
    title: 'Dual API Surface',
    description: 'gRPC with Protobuf and REST mirror. Streaming endpoints for real-time payment events.',
    category: 'Developer',
    accent: 'pink',
  },
  {
    icon: Eye,
    title: 'Ops Console',
    description: 'HTMX-powered dashboard with live payment tables, SSE updates, and comprehensive analytics.',
    category: 'Operations',
    accent: 'teal',
  },
  {
    icon: Lock,
    title: 'Security & Observability',
    description: 'Rate limiting, CSRF protection, structured logging, and Prometheus metrics integration.',
    category: 'Security',
    accent: 'slate',
  },
  {
    icon: Users,
    title: 'Compliance Reporting',
    description: 'One-click SAR/CTR generation and GST reports. PDF/CSV exports for regulatory requirements.',
    category: 'Compliance',
    accent: 'violet',
  },
  {
    icon: Cpu,
    title: 'One-Command Setup',
    description: 'Complete environment with make run. Includes SQLite migration, seed data, and browser launch.',
    category: 'Developer',
    accent: 'brand',
  },
] as const;

type Accent = typeof features[number]['accent'];

const ACCENT_MAP: Record<Accent, { bg: string; icon: string; border: string; glow: string; badge: string }> = {
  blue:    { bg: 'bg-blue-500/10',    icon: 'text-blue-400',    border: 'border-blue-500/20',    glow: 'group-hover:shadow-blue-500/20',    badge: 'bg-blue-500/10 text-blue-400'    },
  violet:  { bg: 'bg-violet-500/10',  icon: 'text-violet-400',  border: 'border-violet-500/20',  glow: 'group-hover:shadow-violet-500/20',  badge: 'bg-violet-500/10 text-violet-400'  },
  brand: { bg: 'bg-brand-500/15', icon: 'text-brand-300', border: 'border-brand-500/25', glow: 'group-hover:shadow-brand-500/20', badge: 'bg-brand-500/15 text-brand-300' },
  red:     { bg: 'bg-red-500/10',     icon: 'text-red-400',     border: 'border-red-500/20',     glow: 'group-hover:shadow-red-500/20',     badge: 'bg-red-500/10 text-red-400'      },
  amber:   { bg: 'bg-amber-500/10',   icon: 'text-amber-400',   border: 'border-amber-500/20',   glow: 'group-hover:shadow-amber-500/20',   badge: 'bg-amber-500/10 text-amber-400'    },
  cyan:    { bg: 'bg-cyan-500/10',    icon: 'text-cyan-400',    border: 'border-cyan-500/20',    glow: 'group-hover:shadow-cyan-500/20',    badge: 'bg-cyan-500/10 text-cyan-400'    },
  indigo:  { bg: 'bg-indigo-500/10',  icon: 'text-indigo-400',  border: 'border-indigo-500/20',  glow: 'group-hover:shadow-indigo-500/20',  badge: 'bg-indigo-500/10 text-indigo-400'  },
  pink:    { bg: 'bg-pink-500/10',    icon: 'text-pink-400',    border: 'border-pink-500/20',    glow: 'group-hover:shadow-pink-500/20',    badge: 'bg-pink-500/10 text-pink-400'    },
  teal:    { bg: 'bg-teal-500/10',    icon: 'text-brand-300',    border: 'border-teal-500/20',    glow: 'group-hover:shadow-teal-500/20',    badge: 'bg-teal-500/10 text-brand-300'    },
  slate:   { bg: 'bg-slate-500/10',   icon: 'text-slate-400',   border: 'border-slate-500/20',   glow: 'group-hover:shadow-slate-500/20',   badge: 'bg-slate-500/10 text-slate-400'    },
};

const Features: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="features" className="py-28 bg-slate-950">
      {/* Top separator line */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6 text-sm font-medium text-blue-400"
          >
            <Database className="h-3.5 w-3.5" />
            Complete Feature Matrix
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-[clamp(2rem,5vw,3.25rem)] font-extrabold text-white mb-5 leading-tight tracking-tight"
          >
            Ultra-Lean MudraCore OS
            <span className="block bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent"
                  style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Production-Ready Components
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            A comprehensive platform demonstrating enterprise-grade capabilities — from core ledger
            systems to compliance automation, everything you need to build modern financial applications.
          </motion.p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => {
            const a = ACCENT_MAP[feature.accent];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.07 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                onClick={() => {
                  if (feature.action === 'ledger') navigate('/ledger');
                  if (feature.action === 'kyc')    navigate('/kyc');
                }}
                className={`group relative p-6 rounded-2xl border border-white/[0.07] bg-white/[0.03]
                           hover:bg-white/[0.055] hover:border-white/[0.12]
                           hover:shadow-2xl ${a.glow}
                           transition-all duration-300
                           ${feature.action ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {/* Subtle gradient overlay on hover */}
                <div className={`absolute inset-0 rounded-2xl ${a.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                {/* Category badge */}
                <span className={`absolute top-4 right-4 text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full ${a.badge}`}>
                  {feature.category}
                </span>

                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-11 h-11 ${a.bg} border ${a.border} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-5 w-5 ${a.icon}`} />
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-white mb-2.5 leading-snug">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Action cue */}
                  {feature.action && (
                    <div className={`mt-4 flex items-center gap-1.5 text-xs font-medium ${a.icon} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                      <span>Try it live</span>
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  )}
                </div>

                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-current to-transparent ${a.icon} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center`} />
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-blue-600/20 via-violet-600/20 to-cyan-600/20 p-10 text-center">
            {/* Background shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-violet-600/5 to-cyan-600/5" />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-3">
                Ready to explore the complete platform?
              </h3>
              <p className="text-slate-400 mb-7 max-w-xl mx-auto text-base">
                Experience all 14 domains in action with our interactive demo. See how enterprise fintech is built.
              </p>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/ledger')}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white text-sm
                           bg-gradient-to-r from-blue-600 to-violet-600
                           hover:from-blue-500 hover:to-violet-500
                           shadow-[0_0_28px_rgba(99,102,241,0.35)]
                           hover:shadow-[0_0_44px_rgba(99,102,241,0.55)]
                           transition-all duration-200"
              >
                Launch Interactive Demo
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Features;
