import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Database, Zap, Shield, TrendingUp, Globe, Code,
  Users, BarChart3, Lock, Cpu, Webhook, Eye,
  ArrowRight, Layers,
} from 'lucide-react';

/* ─── Data ──────────────────────────────────────────────────────────────── */

interface Feature {
  title: string;
  shortTitle: string;
  description: string;
  category: string;
  icon: React.ElementType;
  thumbnail: string;
  link: string;
  accent: string;
  colSpan?: 2;
}

const features: Feature[] = [
  {
    title: 'Core Ledger',
    shortTitle: 'Core Ledger',
    description: 'Double-entry, multi-currency accounts with idempotent journal posting and point-in-time balance queries.',
    category: 'Foundation',
    icon: Database,
    thumbnail: '/images/hero-images/Core Ledger.png',
    link: '/ledger',
    accent: 'from-blue-600 to-blue-400',
    colSpan: 2,
  },
  {
    title: 'KYC & Risk Stub',
    shortTitle: 'KYC & Risk',
    description: 'Automated compliance with synthetic profiles and hot-reload policy rules via JSONLogic.',
    category: 'Compliance',
    icon: Shield,
    thumbnail: '/images/hero-images/KYC & Risk Stub.png',
    link: '/kyc',
    accent: 'from-rose-600 to-pink-400',
  },
  {
    title: 'Smart Routing Optimizer',
    shortTitle: 'Smart Routing',
    description: 'Intelligent cost + SLA analysis. Chooses optimal rails and tracks savings per transaction.',
    category: 'Optimization',
    icon: TrendingUp,
    thumbnail: '/images/hero-images/Smart Routing Optimiser.png',
    link: '/routing',
    accent: 'from-brand-500 to-brand-300',
  },
  {
    title: 'Payment Orchestration',
    shortTitle: 'Payments',
    description: 'Full funds-flow API with UPI, SEPA, and Crypto rails. Asynchronous status lifecycle.',
    category: 'Payments',
    icon: Zap,
    thumbnail: '/images/hero-images/Payment Orchestration.png',
    link: '/payments',
    accent: 'from-violet-600 to-purple-400',
  },
  {
    title: 'Reconciliation Engine',
    shortTitle: 'Reconciliation',
    description: 'Automated nightly jobs import settlement CSVs, compare against ledger, flag variances.',
    category: 'Operations',
    icon: BarChart3,
    thumbnail: '/images/hero-images/Automated Reconciliation Engine.png',
    link: '/reconciliation',
    accent: 'from-amber-600 to-yellow-400',
  },
  {
    title: 'Treasury & FX',
    shortTitle: 'Treasury',
    description: 'Daily rate imports with configurable spreads. Books FX margins into revenue accounts.',
    category: 'Treasury',
    icon: Globe,
    thumbnail: '/images/hero-images/Treasury : FX Mock.png',
    link: '/treasury',
    accent: 'from-cyan-600 to-sky-400',
    colSpan: 2,
  },
  {
    title: 'Compliance Reporting',
    shortTitle: 'Compliance',
    description: 'One-click SAR/CTR + GST reports. PDF/CSV exports for regulatory requirements.',
    category: 'Compliance',
    icon: Users,
    thumbnail: '/images/hero-images/Compliance Report Generator.png',
    link: '/compliance',
    accent: 'from-rose-600 to-orange-400',
  },
  {
    title: 'Self-Serve APIs',
    shortTitle: 'Webhooks & SDKs',
    description: 'HMAC-signed webhooks with retry logic. Auto-generated SDKs for Go and TypeScript.',
    category: 'Integration',
    icon: Webhook,
    thumbnail: '/images/hero-images/Self-Serve Webhooks & SDKs.png',
    link: '/webhooks',
    accent: 'from-indigo-600 to-blue-400',
  },
  {
    title: 'Dual API Surface',
    shortTitle: 'Dual API',
    description: 'gRPC with Protobuf and REST mirror. Streaming endpoints for real-time payment events.',
    category: 'Developer',
    icon: Code,
    thumbnail: '/images/hero-images/Dual API Surface.png',
    link: '/api',
    accent: 'from-violet-600 to-fuchsia-400',
  },
  {
    title: 'Ops Console',
    shortTitle: 'Ops Console',
    description: 'HTMX-powered dashboard with live payment tables, SSE updates, and analytics.',
    category: 'Operations',
    icon: Eye,
    thumbnail: '/images/hero-images/Ops Console.png',
    link: '/ops',
    accent: 'from-brand-400 to-brand-300',
    colSpan: 2,
  },
  {
    title: 'Security Basics',
    shortTitle: 'Security',
    description: 'Rate limiting, CSRF protection, structured logging, and Prometheus metrics.',
    category: 'Security',
    icon: Lock,
    thumbnail: '/images/hero-images/Security Basics.png',
    link: '/security',
    accent: 'from-slate-500 to-slate-400',
  },
  {
    title: 'One-Command Setup',
    shortTitle: 'Quick Start',
    description: 'Complete environment with make run. SQLite migration, seed data, browser launch.',
    category: 'Developer',
    icon: Cpu,
    thumbnail: '/images/hero-images/One-Command Experience.png',
    link: '/dev-tools',
    accent: 'from-brand-500 to-brand-300',
  },
  {
    title: 'Observability',
    shortTitle: 'Observability',
    description: 'Structured logging, distributed tracing, and Prometheus metrics with Grafana.',
    category: 'Monitoring',
    icon: BarChart3,
    thumbnail: '/images/hero-images/Observability.png',
    link: '/monitoring',
    accent: 'from-blue-600 to-cyan-400',
  },
  {
    title: 'Clean Code & Docs',
    shortTitle: 'Docs',
    description: 'Well-structured codebase with auto-generated API docs and architecture diagrams.',
    category: 'Developer',
    icon: Layers,
    thumbnail: '/images/hero-images/Clean Code & Docs.png',
    link: '/analytics',
    accent: 'from-indigo-600 to-violet-400',
  },
];

/* ─── Thumbnail Strip (cinematic auto-scroll) ───────────────────────────── */

const ThumbnailStrip: React.FC = () => {
  const doubled = [...features, ...features]; // seamless loop

  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] mb-20">
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        className="flex gap-3 items-stretch w-max"
      >
        {doubled.map((f, i) => (
          <div
            key={i}
            className="relative flex-shrink-0 rounded-xl overflow-hidden border border-white/10 group"
            style={{ width: 'clamp(140px, 14vw, 220px)', height: 'clamp(88px, 9vw, 138px)' }}
          >
            <img
              src={f.thumbnail}
              alt={f.shortTitle}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
            <p className="absolute bottom-2 left-2.5 text-white/80 text-[10px] font-semibold leading-tight drop-shadow">
              {f.shortTitle}
            </p>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

/* ─── Feature card ──────────────────────────────────────────────────────── */

const FeatureCard: React.FC<{ feature: Feature; index: number }> = ({ feature, index }) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => navigate(feature.link)}
      className="group relative rounded-2xl overflow-hidden cursor-pointer select-none"
      style={{ minHeight: feature.colSpan === 2 ? '220px' : '190px' }}
      whileHover={{ scale: 1.025, transition: { duration: 0.18 } }}
    >
      {/* Screenshot */}
      <img
        src={feature.thumbnail}
        alt={feature.title}
        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
      />

      {/* Dark veil — lifts on hover */}
      <div className="absolute inset-0 bg-slate-950/50 group-hover:bg-slate-950/25 transition-opacity duration-300" />

      {/* Bottom gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

      {/* Accent sweep on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-300 pointer-events-none`} />

      {/* Hover glow border */}
      <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-white/30 transition-colors duration-300 pointer-events-none" />

      {/* Content */}
      <div className="absolute inset-0 p-5 flex flex-col justify-between pointer-events-none">
        {/* Top */}
        <div className="flex items-start justify-between">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${feature.accent} flex items-center justify-center shadow-lg flex-shrink-0`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/50 bg-black/30 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-full">
            {feature.category}
          </span>
        </div>

        {/* Bottom */}
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white mb-1.5 leading-tight drop-shadow-md">
            {feature.title}
          </h3>
          <motion.p
            initial={false}
            animate={{ opacity: hovered ? 1 : 0, maxHeight: hovered ? '80px' : '0px' }}
            transition={{ duration: 0.2 }}
            className="text-xs text-slate-300 leading-relaxed overflow-hidden mb-2"
          >
            {feature.description}
          </motion.p>
          <motion.div
            initial={false}
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.15 }}
            className={`flex items-center gap-1 text-xs font-semibold`}
          >
            <span className={`bg-gradient-to-r ${feature.accent} bg-clip-text text-transparent`}>
              Explore
            </span>
            <ArrowRight className="h-3 w-3 text-white/50" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── PlatformGrid ──────────────────────────────────────────────────────── */

const PlatformGrid: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="platform" className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-5 text-sm font-medium text-blue-400"
          >
            <Layers className="h-3.5 w-3.5" />
            14 Production Modules
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.06 }}
            className="text-[clamp(2rem,5vw,3.25rem)] font-extrabold text-white mb-4 leading-tight tracking-tight"
          >
            The Complete Platform,
            <span
              className="block bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Shipped as One
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="text-base text-slate-400 max-w-xl mx-auto"
          >
            Every module is live and interactive — click any card to explore the feature in action.
          </motion.p>
        </div>

        {/* Cinematic auto-scrolling strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <ThumbnailStrip />
        </motion.div>

        {/* Interactive bento grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={f.colSpan === 2 ? 'col-span-2' : 'col-span-1'}
            >
              <FeatureCard feature={f} index={i} />
            </div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-14"
        >
          <div className="relative overflow-hidden rounded-2xl p-px">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 via-violet-600/50 to-cyan-600/50 rounded-2xl" />
            <div className="relative bg-slate-950/95 rounded-[15px] p-10 text-center">
              <h3 className="text-2xl font-bold text-white mb-3">
                Ready to explore every module?
              </h3>
              <p className="text-slate-400 mb-7 max-w-lg mx-auto text-sm">
                Start with the core ledger or jump straight into payments.
                Every module runs live — no mocks.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/ledger')}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white text-sm
                             bg-gradient-to-r from-blue-600 to-violet-600
                             hover:from-blue-500 hover:to-violet-500
                             shadow-[0_0_28px_rgba(99,102,241,0.35)]
                             hover:shadow-[0_0_44px_rgba(99,102,241,0.55)]
                             transition-all duration-200"
                >
                  Launch Ledger
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/kyc')}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-slate-200 text-sm
                             bg-white/[0.06] border border-white/[0.10]
                             hover:bg-white/[0.10] hover:border-white/[0.18]
                             transition-all duration-200"
                >
                  Try KYC Engine
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default PlatformGrid;
