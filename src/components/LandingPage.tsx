import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Zap, Shield, TrendingUp, CreditCard, Database, Globe,
  CheckCircle, ArrowRight, Lock, Activity, Layers, GitBranch,
  Terminal, ChevronRight,
} from 'lucide-react';

/* ─── design tokens ──────────────────────────────────────────────────── */
const C = {
  bg:        '#04060F',
  surface:   '#070A16',
  border:    'rgba(255,255,255,0.07)',
  blue:      '#3B6EFF',
  blueHover: '#4A7AFF',
  blueLight: '#7EB8FF',
  blueIce:   '#C7DEFF',
  blueDim:   'rgba(59,110,255,0.10)',
  blueMid:   'rgba(59,110,255,0.20)',
  blueGlow:  'rgba(59,110,255,0.35)',
  blueBorder:'rgba(59,110,255,0.22)',
  text:      '#EEF2FF',
  muted:     'rgba(238,242,255,0.44)',
  subtle:    'rgba(238,242,255,0.24)',
};

/* ─── helpers ────────────────────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 20 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.54, delay, ease: [0.16, 1, 0.3, 1] },
});

const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children, delay = 0, className,
}) => {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.54, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ─── data ───────────────────────────────────────────────────────────── */
const STATS = [
  { value: '50K+',   label: 'Transactions / sec' },
  { value: '99.99%', label: 'Platform uptime' },
  { value: '180+',   label: 'Countries supported' },
  { value: '2.4B',   label: 'API calls / day' },
];

const FEATURES = [
  { icon: Shield,    title: 'Bank-Grade Security',    description: 'End-to-end encryption, SOC 2 Type II certified, and real-time threat monitoring built in by default.' },
  { icon: Zap,       title: 'High-Throughput Ledger', description: 'Double-entry accounting engine at 50 000+ TPS with full ACID guarantees and immutable audit trails.' },
  { icon: Globe,     title: 'Multi-Rail Payments',    description: 'ACH, SWIFT, SEPA, and card rails unified behind a single API with automatic failover.' },
  { icon: Activity,  title: 'Real-Time Analytics',    description: 'Sub-second dashboards, custom alert thresholds, and exportable reporting across all entities.' },
  { icon: Layers,    title: 'KYC & Compliance',       description: 'Automated identity verification, AML screening, and jurisdiction-aware compliance workflows.' },
  { icon: GitBranch, title: 'Developer-First APIs',   description: 'gRPC and REST, OpenAPI 3.1 spec, interactive explorer, and SDKs for Go, Python, and Node.' },
];

const BENEFITS = [
  'Cut operational costs by up to 60%',
  'Launch new products 10× faster',
  '99.99% uptime SLA',
  '24/7 engineering support',
  'Global regulatory compliance',
  'Horizontally scalable infrastructure',
];

const TRANSACTIONS = [
  { type: 'Payment',  amount: '$2,450.00', status: 'Completed',  color: C.blue },
  { type: 'Transfer', amount: '$890.50',   status: 'Processing', color: '#F59E0B' },
  { type: 'Payout',   amount: '$5,230.00', status: 'Completed',  color: C.blue },
  { type: 'Refund',   amount: '$120.00',   status: 'Completed',  color: C.blue },
];

/* ─── component ──────────────────────────────────────────────────────── */
const LandingPage: React.FC<{ hideHero?: boolean }> = ({ hideHero = false }) => (
  <div style={{ background: C.bg, minHeight: '100vh' }}>

    {/* ════════════ HERO ════════════ */}
    {!hideHero && <section className="relative overflow-hidden" style={{ paddingTop: '7rem', paddingBottom: '5rem' }}>

      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59,110,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,110,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 75% 70% at 50% 0%, black 30%, transparent 100%)',
        }}
      />

      {/* Blue radial spotlight */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: -200,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 1000,
          height: 700,
          background: 'radial-gradient(ellipse at 50% 0%, rgba(59,110,255,0.15) 0%, transparent 65%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8 text-center">

        {/* Headline */}
        <motion.h1
          {...fadeUp(0.04)}
          className="font-bold leading-tight mb-6"
          style={{
            fontSize: 'clamp(2.4rem, 5vw, 4.4rem)',
            letterSpacing: '-0.03em',
            color: C.text,
          }}
        >
          The Infrastructure
          <br />
          <span
            style={{
              background: `linear-gradient(110deg, ${C.blueIce} 10%, ${C.blueLight} 50%, ${C.blue} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            for Modern Finance
          </span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          {...fadeUp(0.10)}
          className="mx-auto mb-9 max-w-2xl"
          style={{ color: C.muted, fontSize: '1.05rem', lineHeight: 1.7 }}
        >
          Build production-ready fintech applications with enterprise-grade security.
          Core ledger, payment orchestration, KYC compliance — shipped as one platform.
        </motion.p>

        {/* Feature pills */}
        <motion.div {...fadeUp(0.15)} className="flex flex-wrap justify-center gap-2.5 mb-9">
          {[
            { icon: Shield,   label: 'SOC 2 Type II' },
            { icon: Zap,      label: '50K+ TPS' },
            { icon: Database, label: 'Multi-currency' },
            { icon: Terminal, label: 'gRPC + REST' },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium"
              style={{
                background: 'rgba(238,242,255,0.04)',
                border: '1px solid rgba(238,242,255,0.09)',
                color: C.subtle,
              }}
            >
              <Icon style={{ width: 11, height: 11, color: C.blueLight }} />
              {label}
            </span>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div {...fadeUp(0.19)} className="flex flex-wrap gap-3 justify-center mb-16">
          <Link
            to="/ledger"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200"
            style={{
              background: C.blue,
              boxShadow: `0 0 0 1px ${C.blueBorder}, 0 4px 22px ${C.blueGlow}`,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = C.blueHover;
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 1px rgba(59,110,255,0.5), 0 6px 30px rgba(59,110,255,0.50)`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = C.blue;
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 1px ${C.blueBorder}, 0 4px 22px ${C.blueGlow}`;
            }}
          >
            Explore Platform
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200"
            style={{ background: 'rgba(238,242,255,0.04)', border: `1px solid ${C.border}`, color: C.muted }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(238,242,255,0.07)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,110,255,0.30)';
              (e.currentTarget as HTMLElement).style.color = C.text;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(238,242,255,0.04)';
              (e.currentTarget as HTMLElement).style.borderColor = C.border;
              (e.currentTarget as HTMLElement).style.color = C.muted;
            }}
          >
            View Documentation
          </button>
        </motion.div>

        {/* ── Dashboard preview card ── */}
        <motion.div
          initial={{ opacity: 0, y: 44 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.70, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mx-auto rounded-2xl overflow-hidden"
          style={{
            background: C.surface,
            border: `1px solid rgba(59,110,255,0.16)`,
            boxShadow: `0 40px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(59,110,255,0.06), inset 0 1px 0 rgba(255,255,255,0.04)`,
          }}
        >
          {/* Window chrome */}
          <div
            className="flex items-center gap-2 px-4 py-3 border-b"
            style={{ borderColor: 'rgba(59,110,255,0.10)', background: 'rgba(59,110,255,0.04)' }}
          >
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FEBC2E' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
            <span className="ml-2 text-xs font-medium font-mono" style={{ color: C.subtle }}>
              MudraCore OS — Live Dashboard
            </span>
          </div>

          {/* Stat tiles */}
          <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b" style={{ borderColor: 'rgba(59,110,255,0.10)' }}>
            {STATS.map(({ value, label }) => (
              <div
                key={label}
                className="rounded-xl px-4 py-3 text-center"
                style={{ background: C.blueDim, border: `1px solid rgba(59,110,255,0.14)` }}
              >
                <div
                  className="text-xl font-bold mb-0.5 tabular-nums"
                  style={{ color: C.blueIce, letterSpacing: '-0.02em' }}
                >
                  {value}
                </div>
                <div className="text-[10px] font-medium uppercase tracking-wider" style={{ color: C.muted }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Transaction rows */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-3 text-xs font-medium" style={{ color: C.subtle }}>
              <span>Recent Transactions</span>
              <span className="flex items-center gap-1.5" style={{ color: C.blueLight }}>
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: C.blue, boxShadow: `0 0 6px ${C.blue}` }}
                />
                Live
              </span>
            </div>
            <div className="space-y-2">
              {TRANSACTIONS.map((tx, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center justify-between rounded-lg px-3.5 py-2.5"
                  style={{ background: 'rgba(238,242,255,0.025)' }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: tx.color }} />
                    <span className="text-sm font-medium" style={{ color: C.text }}>{tx.type}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold tabular-nums" style={{ color: C.text }}>{tx.amount}</span>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={
                        tx.status === 'Completed'
                          ? { background: C.blueDim, color: C.blueLight }
                          : { background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }
                      }
                    >
                      {tx.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>}

    {/* ════════════ STATS BAR ════════════ */}
    <div style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {STATS.map(({ value, label }, i) => (
            <Reveal
              key={label}
              delay={i * 0.07}
              className="py-10 text-center"
              style={i < STATS.length - 1 ? { borderRight: `1px solid ${C.border}` } as any : undefined}
            >
              <div
                className="font-bold mb-1.5 tabular-nums"
                style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: C.blueIce, letterSpacing: '-0.03em' }}
              >
                {value}
              </div>
              <div className="text-xs font-medium uppercase tracking-widest" style={{ color: C.muted }}>
                {label}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>

    {/* ════════════ FEATURES ════════════ */}
    <section style={{ padding: 'clamp(5rem, 9vw, 8rem) 0' }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">

        <Reveal className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div style={{ width: 20, height: 1, background: C.blue }} />
            <span className="text-xs font-mono font-medium uppercase tracking-widest" style={{ color: C.blueLight }}>
              Platform Capabilities
            </span>
            <div style={{ width: 20, height: 1, background: C.blue }} />
          </div>
          <h2
            className="font-bold tracking-tight mb-4"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: C.text, letterSpacing: '-0.025em', lineHeight: 1.14 }}
          >
            Everything you need to build
            <span
              className="block"
              style={{
                background: `linear-gradient(110deg, ${C.blueIce} 10%, ${C.blueLight} 60%, ${C.blue} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              financial infrastructure
            </span>
          </h2>
          <p className="max-w-xl mx-auto text-sm" style={{ color: C.muted, lineHeight: 1.7 }}>
            Production-hardened modules that integrate seamlessly — no stitching together multiple vendors.
          </p>
        </Reveal>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* ── 01 Security — wide ── */}
          <Reveal delay={0} className="md:col-span-2">
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.18 }}
              className="relative rounded-2xl overflow-hidden p-7 h-full cursor-default"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = C.blueBorder}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = C.border}
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${C.blue}, ${C.blueLight}, transparent)` }} />
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: C.blueDim, border: `1px solid rgba(59,110,255,0.25)` }}>
                    <Shield style={{ width: 20, height: 20, color: C.blueLight }} />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest mb-0.5" style={{ color: C.muted }}>01 · Security</div>
                    <h3 className="text-base font-bold" style={{ color: C.text }}>Bank-Grade Security</h3>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.12)', color: '#34D399' }}>SOC 2 ✓</span>
              </div>
              <p className="text-sm mb-6" style={{ color: C.muted, lineHeight: 1.7 }}>
                End-to-end encryption, SOC 2 Type II certified, and real-time threat monitoring built in by default.
              </p>
              {/* Mini visual — compliance badges */}
              <div className="flex flex-wrap gap-2">
                {['AES-256', 'TLS 1.3', 'ISO 27001', 'PCI DSS', 'SOC 2 Type II'].map(b => (
                  <span key={b} className="text-[10px] font-mono px-2.5 py-1 rounded-md" style={{ background: 'rgba(59,110,255,0.10)', border: `1px solid rgba(59,110,255,0.18)`, color: C.blueLight }}>
                    {b}
                  </span>
                ))}
              </div>
            </motion.div>
          </Reveal>

          {/* ── 02 Ledger ── */}
          <Reveal delay={0.06}>
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.18 }}
              className="relative rounded-2xl overflow-hidden p-7 h-full cursor-default"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = C.blueBorder}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = C.border}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${C.blue}, transparent)` }} />
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: C.blueDim, border: `1px solid rgba(59,110,255,0.25)` }}>
                  <Zap style={{ width: 20, height: 20, color: C.blueLight }} />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest mb-0.5" style={{ color: C.muted }}>02 · Ledger</div>
                  <h3 className="text-base font-bold" style={{ color: C.text }}>High-Throughput</h3>
                </div>
              </div>
              <p className="text-sm mb-5" style={{ color: C.muted, lineHeight: 1.7 }}>Double-entry engine at 50 000+ TPS with ACID guarantees and immutable audit trails.</p>
              {/* Mini TPS bar chart */}
              <div className="flex items-end gap-1 h-10">
                {[40, 55, 48, 70, 62, 85, 78, 95, 88, 100].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{ height: `${h}%`, background: i === 9 ? C.blue : `rgba(59,110,255,${0.15 + i * 0.07})` }}
                  />
                ))}
              </div>
              <div className="text-[10px] font-mono mt-2" style={{ color: C.muted }}>50K+ TPS · live throughput</div>
            </motion.div>
          </Reveal>

          {/* ── 03 Payments ── */}
          <Reveal delay={0.08}>
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.18 }}
              className="relative rounded-2xl overflow-hidden p-7 h-full cursor-default"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = C.blueBorder}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = C.border}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${C.blue}, transparent)` }} />
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: C.blueDim, border: `1px solid rgba(59,110,255,0.25)` }}>
                  <Globe style={{ width: 20, height: 20, color: C.blueLight }} />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest mb-0.5" style={{ color: C.muted }}>03 · Payments</div>
                  <h3 className="text-base font-bold" style={{ color: C.text }}>Multi-Rail</h3>
                </div>
              </div>
              <p className="text-sm mb-5" style={{ color: C.muted, lineHeight: 1.7 }}>ACH, SWIFT, SEPA, and card rails unified behind a single API with automatic failover.</p>
              {/* Rail status */}
              <div className="space-y-2">
                {[['ACH', '99.99%'], ['SWIFT', '99.97%'], ['SEPA', '99.98%'], ['Card', '99.99%']].map(([rail, uptime]) => (
                  <div key={rail} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#34D399' }} />
                      <span className="text-xs font-mono" style={{ color: C.subtle }}>{rail}</span>
                    </div>
                    <span className="text-[10px] font-mono" style={{ color: '#34D399' }}>{uptime}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </Reveal>

          {/* ── 04 Analytics ── */}
          <Reveal delay={0.10}>
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.18 }}
              className="relative rounded-2xl overflow-hidden p-7 h-full cursor-default"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = C.blueBorder}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = C.border}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${C.blue}, transparent)` }} />
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: C.blueDim, border: `1px solid rgba(59,110,255,0.25)` }}>
                  <Activity style={{ width: 20, height: 20, color: C.blueLight }} />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest mb-0.5" style={{ color: C.muted }}>04 · Analytics</div>
                  <h3 className="text-base font-bold" style={{ color: C.text }}>Real-Time Insights</h3>
                </div>
              </div>
              <p className="text-sm mb-5" style={{ color: C.muted, lineHeight: 1.7 }}>Sub-second dashboards, custom alert thresholds, and exportable reporting across all entities.</p>
              {/* Sparkline */}
              <svg viewBox="0 0 120 36" className="w-full" style={{ height: 36 }}>
                <polyline
                  points="0,28 12,22 24,26 36,16 48,20 60,10 72,14 84,8 96,12 108,4 120,6"
                  fill="none"
                  stroke={C.blue}
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <polyline
                  points="0,28 12,22 24,26 36,16 48,20 60,10 72,14 84,8 96,12 108,4 120,6 120,36 0,36"
                  fill="url(#sparkGrad)"
                />
                <defs>
                  <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.blue} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={C.blue} stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="text-[10px] font-mono mt-1" style={{ color: C.muted }}>Transaction volume · 7d</div>
            </motion.div>
          </Reveal>

          {/* ── 05 KYC ── */}
          <Reveal delay={0.12}>
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.18 }}
              className="relative rounded-2xl overflow-hidden p-7 h-full cursor-default"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = C.blueBorder}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = C.border}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${C.blue}, transparent)` }} />
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: C.blueDim, border: `1px solid rgba(59,110,255,0.25)` }}>
                  <Layers style={{ width: 20, height: 20, color: C.blueLight }} />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest mb-0.5" style={{ color: C.muted }}>05 · Compliance</div>
                  <h3 className="text-base font-bold" style={{ color: C.text }}>KYC & AML</h3>
                </div>
              </div>
              <p className="text-sm mb-5" style={{ color: C.muted, lineHeight: 1.7 }}>Automated identity verification, AML screening, and jurisdiction-aware compliance workflows.</p>
              {/* Verification steps */}
              <div className="space-y-2">
                {[
                  { step: 'Identity Check', done: true },
                  { step: 'AML Screening', done: true },
                  { step: 'Risk Scoring', done: true },
                  { step: 'Jurisdiction Review', done: false },
                ].map(({ step, done }) => (
                  <div key={step} className="flex items-center gap-2.5">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: done ? 'rgba(16,185,129,0.15)' : 'rgba(238,242,255,0.06)', border: `1px solid ${done ? 'rgba(52,211,153,0.4)' : 'rgba(238,242,255,0.12)'}` }}
                    >
                      {done && <CheckCircle style={{ width: 10, height: 10, color: '#34D399' }} />}
                    </div>
                    <span className="text-[11px] font-mono" style={{ color: done ? 'rgba(238,242,255,0.65)' : C.muted }}>{step}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </Reveal>

          {/* ── 06 Developer APIs — wide ── */}
          <Reveal delay={0.14} className="md:col-span-1">
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.18 }}
              className="relative rounded-2xl overflow-hidden p-7 h-full cursor-default"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = C.blueBorder}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = C.border}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${C.blue}, transparent)` }} />
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: C.blueDim, border: `1px solid rgba(59,110,255,0.25)` }}>
                  <GitBranch style={{ width: 20, height: 20, color: C.blueLight }} />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest mb-0.5" style={{ color: C.muted }}>06 · APIs</div>
                  <h3 className="text-base font-bold" style={{ color: C.text }}>Developer-First</h3>
                </div>
              </div>
              <p className="text-sm mb-5" style={{ color: C.muted, lineHeight: 1.7 }}>gRPC and REST, OpenAPI 3.1 spec, interactive explorer, and SDKs for Go, Python, and Node.</p>
              {/* Mini code line */}
              <div
                className="rounded-lg px-4 py-3 font-mono text-[11px]"
                style={{ background: '#020409', border: `1px solid rgba(59,110,255,0.14)` }}
              >
                <span style={{ color: C.blue }}>POST</span>
                <span style={{ color: C.blueIce }}> /v1/payments</span>
                <span className="ml-3 px-1.5 py-0.5 rounded text-[9px]" style={{ background: 'rgba(16,185,129,0.14)', color: '#34D399' }}>201 · 44ms</span>
              </div>
            </motion.div>
          </Reveal>

        </div>
      </div>
    </section>

    {/* ════════════ CODE SNIPPET ════════════ */}
    <section style={{ padding: 'clamp(4rem, 8vw, 7rem) 0', borderTop: `1px solid ${C.border}` }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <Reveal className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div style={{ width: 20, height: 1, background: C.blue }} />
            <span className="text-xs font-mono font-medium uppercase tracking-widest" style={{ color: C.blueLight }}>
              Developer-First
            </span>
            <div style={{ width: 20, height: 1, background: C.blue }} />
          </div>
          <h2
            className="font-bold tracking-tight mb-4"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: C.text, letterSpacing: '-0.025em', lineHeight: 1.14 }}
          >
            Ship in minutes,
            <span
              className="block"
              style={{
                background: `linear-gradient(110deg, ${C.blueIce} 10%, ${C.blueLight} 60%, ${C.blue} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              not months
            </span>
          </h2>
          <p className="max-w-xl mx-auto text-sm" style={{ color: C.muted, lineHeight: 1.7 }}>
            Idiomatic SDKs and an interactive API explorer. Go from zero to live transactions in a single afternoon.
          </p>
        </Reveal>

        {/* Feature pills row */}
        <Reveal className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            { label: 'OpenAPI 3.1', sub: 'Live playground' },
            { label: 'gRPC Streaming', sub: 'Real-time events' },
            { label: 'Webhooks', sub: 'Auto retry & signing' },
            { label: 'SDKs', sub: 'Go · Python · Node' },
          ].map(({ label, sub }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: C.blueDim, border: `1px solid rgba(59,110,255,0.20)` }}
            >
              <CheckCircle style={{ width: 15, height: 15, color: C.blue, flexShrink: 0 }} />
              <div>
                <div className="text-xs font-semibold" style={{ color: C.text }}>{label}</div>
                <div className="text-[10px]" style={{ color: C.muted }}>{sub}</div>
              </div>
            </div>
          ))}
        </Reveal>

        {/* Main code card */}
        <Reveal>
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: '#03050E',
              border: `1px solid rgba(59,110,255,0.22)`,
              boxShadow: `0 0 80px rgba(59,110,255,0.10), 0 40px 60px rgba(0,0,0,0.5)`,
            }}
          >
            {/* Blue ambient glow top */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
              style={{
                width: 600,
                height: 180,
                background: 'radial-gradient(ellipse at 50% 0%, rgba(59,110,255,0.18) 0%, transparent 70%)',
              }}
            />

            <div className="relative grid lg:grid-cols-2">
              {/* ── Left: copy ── */}
              <div className="p-8 lg:p-12 flex flex-col justify-center border-b lg:border-b-0 lg:border-r" style={{ borderColor: 'rgba(59,110,255,0.12)' }}>
                <div
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-8 w-fit text-[10px] font-mono font-semibold uppercase tracking-widest"
                  style={{ background: 'rgba(59,110,255,0.12)', border: `1px solid rgba(59,110,255,0.28)`, color: C.blueLight }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.blue, boxShadow: `0 0 6px ${C.blue}` }} />
                  REST · gRPC · Webhooks
                </div>

                <div className="space-y-6 mb-10">
                  {[
                    { method: 'POST', path: '/v1/payments', ms: '44ms', status: 201 },
                    { method: 'GET',  path: '/v1/ledger/entries', ms: '12ms', status: 200 },
                    { method: 'POST', path: '/v1/kyc/verify', ms: '230ms', status: 202 },
                  ].map(({ method, path, ms, status }) => (
                    <div key={path} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className="text-[10px] font-bold font-mono px-2 py-0.5 rounded"
                          style={{
                            background: method === 'GET' ? 'rgba(16,185,129,0.14)' : 'rgba(59,110,255,0.14)',
                            color: method === 'GET' ? '#34D399' : C.blueLight,
                          }}
                        >
                          {method}
                        </span>
                        <span className="text-sm font-mono" style={{ color: C.blueIce }}>{path}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] font-mono" style={{ color: C.muted }}>{ms}</span>
                        <span
                          className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(16,185,129,0.12)', color: '#34D399' }}
                        >
                          {status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  to="/developers"
                  className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold w-fit transition-all duration-200"
                  style={{
                    background: C.blue,
                    color: '#fff',
                    boxShadow: `0 0 0 1px ${C.blueBorder}, 0 4px 16px ${C.blueGlow}`,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.blueHover; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.blue; }}
                >
                  Explore API docs
                  <ChevronRight style={{ width: 15, height: 15 }} className="group-hover:translate-x-0.5 transition-transform duration-150" />
                </Link>
              </div>

              {/* ── Right: terminal ── */}
              <div className="flex flex-col">
                {/* Tab bar */}
                <div
                  className="flex items-center gap-0 border-b px-4"
                  style={{ borderColor: 'rgba(59,110,255,0.12)', background: 'rgba(59,110,255,0.04)' }}
                >
                  {['Request', 'Response'].map((tab, i) => (
                    <div
                      key={tab}
                      className="px-4 py-3 text-xs font-mono font-medium cursor-default border-b-2 -mb-px"
                      style={
                        i === 0
                          ? { color: C.blueLight, borderColor: C.blue }
                          : { color: C.muted, borderColor: 'transparent' }
                      }
                    >
                      {tab}
                    </div>
                  ))}
                  <div className="ml-auto flex items-center gap-1.5 py-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: '#FF5F57' }} />
                    <div className="w-2 h-2 rounded-full" style={{ background: '#FEBC2E' }} />
                    <div className="w-2 h-2 rounded-full" style={{ background: '#28C840' }} />
                  </div>
                </div>

                {/* Code body */}
                <div
                  className="p-6 font-mono text-[13px] leading-[1.8] overflow-auto flex-1"
                  style={{ color: 'rgba(238,242,255,0.55)', minHeight: 280 }}
                >
                  {/* Line numbers + code */}
                  <div className="flex gap-5">
                    {/* Line nums */}
                    <div className="select-none text-right shrink-0" style={{ color: 'rgba(59,110,255,0.30)', lineHeight: '1.8' }}>
                      {Array.from({ length: 11 }, (_, i) => (
                        <div key={i}>{i + 1}</div>
                      ))}
                    </div>
                    {/* Code */}
                    <div>
                      <div style={{ color: 'rgba(238,242,255,0.22)' }}>{'// POST /v1/payments'}</div>
                      <div><span style={{ color: '#C792EA' }}>{'fetch'}</span><span style={{ color: C.blueIce }}>{'("https://api.mudracore.io/v1/payments", {'}</span></div>
                      <div className="ml-4"><span style={{ color: C.blueLight }}>{'method'}</span>{': '}<span style={{ color: '#C3E88D' }}>{'"POST"'}</span>{','}</div>
                      <div className="ml-4"><span style={{ color: C.blueLight }}>{'headers'}</span>{': {'}</div>
                      <div className="ml-8"><span style={{ color: C.blueLight }}>{'Authorization'}</span>{': '}<span style={{ color: '#C3E88D' }}>{'"Bearer sk_live_..."'}</span>{','}</div>
                      <div className="ml-4">{'  },'}</div>
                      <div className="ml-4"><span style={{ color: C.blueLight }}>{'body'}</span>{': '}<span style={{ color: '#C792EA' }}>{'JSON.stringify'}</span>{'({'}</div>
                      <div className="ml-8"><span style={{ color: C.blueLight }}>{'amount'}</span>{': '}<span style={{ color: '#F78C6C' }}>{'250000'}</span>{', '}<span style={{ color: C.blueLight }}>{'currency'}</span>{': '}<span style={{ color: '#C3E88D' }}>{'"USD"'}</span>{','}</div>
                      <div className="ml-8"><span style={{ color: C.blueLight }}>{'rail'}</span>{': '}<span style={{ color: '#C3E88D' }}>{'"ACH"'}</span>{', '}<span style={{ color: C.blueLight }}>{'destination'}</span>{': '}<span style={{ color: '#C3E88D' }}>{'"acc_9xKz..."'}</span></div>
                      <div className="ml-4">{'  })'}</div>
                      <div>{'});'}</div>
                    </div>
                  </div>

                  {/* Response badge */}
                  <div
                    className="mt-6 pt-5 flex items-center gap-2"
                    style={{ borderTop: '1px solid rgba(59,110,255,0.10)' }}
                  >
                    <span
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                      style={{ background: 'rgba(16,185,129,0.14)', color: '#34D399' }}
                    >
                      201 Created
                    </span>
                    <span className="text-[10px] font-mono" style={{ color: C.muted }}>44ms · application/json</span>
                  </div>
                  <div className="mt-3 flex gap-5">
                    <div className="select-none text-right shrink-0" style={{ color: 'rgba(59,110,255,0.30)', lineHeight: '1.8' }}>
                      {Array.from({ length: 6 }, (_, i) => <div key={i}>{i + 1}</div>)}
                    </div>
                    <div>
                      <div>{'{'}</div>
                      {[
                        ['"id"', '"pay_01HY9xKz..."'],
                        ['"status"', '"processing"'],
                        ['"ledger_entry"', '"le_03AB..."'],
                        ['"amount"', '250000'],
                        ['"estimated_settlement"', '"2026-04-14"'],
                      ].map(([k, v]) => (
                        <div key={k} className="ml-4">
                          <span style={{ color: C.blueLight }}>{k}</span>
                          {': '}
                          <span style={{ color: k === '"amount"' ? '#F78C6C' : '#C3E88D' }}>{v}</span>
                          {','}
                        </div>
                      ))}
                      <div>{'}'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>

    {/* ════════════ CTA ════════════ */}
    <section style={{ padding: 'clamp(5rem, 9vw, 7rem) 0', borderTop: `1px solid ${C.border}` }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <Reveal>
          <div
            className="relative rounded-2xl overflow-hidden px-8 py-16 text-center"
            style={{
              background: C.surface,
              border: `1px solid rgba(59,110,255,0.20)`,
              boxShadow: `inset 0 0 100px rgba(59,110,255,0.06)`,
            }}
          >
            {/* Grid inside CTA */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(59,110,255,0.05) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(59,110,255,0.05) 1px, transparent 1px)
                `,
                backgroundSize: '48px 48px',
                maskImage: 'radial-gradient(ellipse 70% 100% at 50% 50%, black 30%, transparent 100%)',
              }}
            />
            {/* Blue glow at bottom */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
              style={{
                width: 700,
                height: 220,
                background: `radial-gradient(ellipse at 50% 100%, rgba(59,110,255,0.16) 0%, transparent 70%)`,
              }}
            />

            <div className="relative">
              <h2
                className="font-bold tracking-tight mb-4"
                style={{ fontSize: 'clamp(1.7rem, 4vw, 3rem)', color: C.text, letterSpacing: '-0.03em', lineHeight: 1.13 }}
              >
                Ready to modernize your
                <span
                  className="block"
                  style={{
                    background: `linear-gradient(110deg, ${C.blueIce} 10%, ${C.blueLight} 50%, ${C.blue} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  financial stack?
                </span>
              </h2>
              <p className="text-sm mb-10 max-w-md mx-auto" style={{ color: C.muted, lineHeight: 1.7 }}>
                Join hundreds of financial institutions already using MudraCore OS to build
                the next generation of financial products.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  to="/ledger"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200"
                  style={{
                    background: C.blue,
                    boxShadow: `0 0 0 1px ${C.blueBorder}, 0 4px 22px ${C.blueGlow}`,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.blueHover; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.blue; }}
                >
                  Start Building Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200"
                  style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.muted }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,110,255,0.35)';
                    (e.currentTarget as HTMLElement).style.color = C.text;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = C.border;
                    (e.currentTarget as HTMLElement).style.color = C.muted;
                  }}
                >
                  Schedule a Demo
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>

  </div>
);

export default LandingPage;
