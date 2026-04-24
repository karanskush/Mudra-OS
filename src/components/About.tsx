import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Github, Mail, Linkedin, Code2, Database, Shield,
  Zap, CreditCard, Layers, Globe, Cpu, GitBranch, Sparkles,
  Workflow, Network, LineChart, Lock, ExternalLink, Rocket,
  CheckCircle2, Terminal, Repeat, Scale, Route, KeyRound,
  Radio, RefreshCw, Target,
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { ConsistentBackground } from './ui/ConsistentBackground';

// ─── Capability data ──────────────────────────────────────────────────

const CAPABILITIES = [
  {
    icon: Database,
    title: 'Backend & APIs',
    color: 'bg-[#0A1128]',
    items: ['Go · Node.js · Python', 'REST + gRPC services', 'PostgreSQL, Redis, GORM', 'Auth, JWT, RBAC'],
  },
  {
    icon: Code2,
    title: 'Frontend Engineering',
    color: 'bg-[#006d43]',
    items: ['React 18 + TypeScript', 'Next.js App Router', 'Tailwind, Framer Motion', 'Design systems & UX'],
  },
  {
    icon: CreditCard,
    title: 'Fintech Domain',
    color: 'bg-[#0A1128]',
    items: ['Double-entry ledgers', 'Multi-rail payments', 'KYC / AML flows', 'Financial reporting'],
  },
  {
    icon: Shield,
    title: 'Security & Compliance',
    color: 'bg-[#006d43]',
    items: ['OWASP hardening', 'Secret hygiene', 'Audit trails', 'PII handling'],
  },
  {
    icon: Network,
    title: 'Infra & DevOps',
    color: 'bg-[#0A1128]',
    items: ['Docker · Vercel · Railway', 'CI/CD pipelines', 'Neon · Supabase', 'Observability'],
  },
  {
    icon: Sparkles,
    title: 'Product Craft',
    color: 'bg-[#006d43]',
    items: ['0 → 1 product thinking', 'Rapid prototyping', 'Developer experience', 'Clean API design'],
  },
];

const STACK = [
  'Go', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Python',
  'PostgreSQL', 'gRPC', 'Tailwind', 'Docker', 'Vercel', 'Neon',
  'Framer Motion', 'Vite', 'GORM', 'JWT',
];

const HIGHLIGHTS = [
  {
    icon: Workflow,
    label: 'Double-entry Ledger',
    desc: 'Accounts, transactions, journals, reversals — balance sheet, P&L, cash flow, trial balance.',
  },
  {
    icon: Globe,
    label: '8 Payment Rails',
    desc: 'UPI, SEPA, ACH, SWIFT, PIX, Faster Payments, Interac, Crypto — routed by currency & country.',
  },
  {
    icon: Lock,
    label: 'KYC & Risk Scoring',
    desc: 'Identity verification, risk-based priority, audit-ready compliance trail.',
  },
  {
    icon: Zap,
    label: 'gRPC Streaming',
    desc: 'Bidirectional streaming services + REST bridge for browser clients.',
  },
];

const PROCESS = [
  { n: '01', title: 'Understand', desc: 'Map the domain, constraints, and what actually matters to users.' },
  { n: '02', title: 'Architect',  desc: 'Pick boring tech. Keep modules small. Design for change, not perfection.' },
  { n: '03', title: 'Ship',       desc: 'Working software fast. Iterate with real feedback, not assumptions.' },
  { n: '04', title: 'Harden',     desc: 'Tests, observability, security reviews — make it production-ready.' },
];

// ─── Motion helpers ───────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ─── Page ─────────────────────────────────────────────────────────────

const About: React.FC = () => {
  return (
    <ConsistentBackground>
      <Navbar />

      <main className="pt-24 pb-24">
        {/* ── Hero ───────────────────────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <motion.div
              initial="hidden" animate="visible" variants={fadeUp}
              className="lg:col-span-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-[11px] font-black tracking-wider uppercase text-secondary">
                  Available for fintech work
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-primary leading-[1.02]">
                I build <span className="relative inline-block">
                  <span className="relative z-10">fintech</span>
                  <span className="absolute left-0 right-0 bottom-1 h-3 bg-accent/40 -z-0" />
                </span>{' '}
                that moves<br className="hidden md:block" /> real money.
              </h1>

              <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed">
                Full-stack engineer focused on payments, ledgers, and compliance.
                Go &amp; TypeScript. APIs that behave under load. Interfaces people actually enjoy.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/"
                  className="group inline-flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl text-sm font-bold active:scale-95 transition-all hover:shadow-lg hover:shadow-primary/20"
                >
                  See the live project
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="mailto:karansinghkachwah@gmail.com"
                  className="inline-flex items-center gap-2 bg-white border border-outline-variant text-primary px-5 py-3 rounded-xl text-sm font-bold hover:bg-surface transition-all"
                >
                  <Mail className="h-4 w-4" />
                  Get in touch
                </a>
              </div>

              <div className="mt-6 flex items-center gap-4 text-slate-500">
                <a href="https://github.com/karanskush" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors inline-flex items-center gap-1.5 text-xs font-semibold">
                  <Github className="h-4 w-4" /> GitHub
                </a>
                <span className="text-outline-variant">·</span>
                <a href="https://www.linkedin.com/in/karanskush/" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors inline-flex items-center gap-1.5 text-xs font-semibold">
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </a>
                <span className="text-outline-variant">·</span>
                <a href="mailto:karansinghkachwah@gmail.com" className="hover:text-primary transition-colors inline-flex items-center gap-1.5 text-xs font-semibold">
                  <Mail className="h-4 w-4" /> Email
                </a>
              </div>
            </motion.div>

            {/* Stats card */}
            <motion.div
              initial="hidden" animate="visible" variants={fadeUp} custom={2}
              className="lg:col-span-4"
            >
              <div className="relative">
                {/* Currently building pill */}
                <div className="absolute -top-3 left-5 z-10 inline-flex items-center gap-1.5 px-3 py-1 bg-primary text-white rounded-full text-[10px] font-black tracking-wider uppercase shadow-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  Currently shipping
                </div>

                <div className="bg-gradient-to-br from-white to-surface border border-outline-variant rounded-3xl p-5 shadow-premium relative overflow-hidden">
                  <div className="absolute -top-20 -right-20 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
                  <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />

                  {/* 2x2 stat grid */}
                  <div className="relative grid grid-cols-2 gap-3">
                    {[
                      { k: 'Projects shipped',    v: '20+', icon: Rocket,    accent: 'text-accent',    bg: 'bg-accent/10' },
                      { k: 'Years of dev',        v: '6+',  icon: GitBranch, accent: 'text-secondary', bg: 'bg-secondary/10' },
                      { k: '0 → 1 Engineer',      v: '4×',  icon: Sparkles,  accent: 'text-primary',   bg: 'bg-primary/10' },
                      { k: 'Coding since age',    v: '6',   icon: Code2,     accent: 'text-accent',    bg: 'bg-accent/10' },
                    ].map((s) => (
                      <div
                        key={s.k}
                        className="group bg-white border border-outline-variant/80 rounded-2xl p-4 hover:border-accent/50 hover:-translate-y-0.5 transition-all"
                      >
                        <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center mb-2.5`}>
                          <s.icon className={`h-4 w-4 ${s.accent}`} />
                        </div>
                        <div className="text-2xl font-black text-primary leading-none tracking-tight">{s.v}</div>
                        <div className="text-[11px] text-slate-500 mt-1.5 font-medium">{s.k}</div>
                      </div>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="relative mt-5 pt-4 border-t border-outline-variant/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1">
                          <span className="w-2 h-2 rounded-full bg-accent ring-2 ring-white" />
                          <span className="w-2 h-2 rounded-full bg-secondary ring-2 ring-white" />
                          <span className="w-2 h-2 rounded-full bg-primary ring-2 ring-white" />
                        </div>
                        <span className="text-[11px] font-bold text-primary">MudraCore OS</span>
                      </div>
                      <span className="text-[10px] font-black text-secondary tracking-wider uppercase">v1.0 · live</span>
                    </div>
                    <div className="mt-2 h-1 bg-outline-variant/60 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '92%' }}
                        transition={{ duration: 1.4, delay: 0.6, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-accent to-secondary rounded-full"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5">Ledger · Rails · KYC · gRPC — 92% complete</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── What I can do (capabilities) ──────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 lg:px-8 mt-28">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <p className="text-[11px] font-black tracking-wider uppercase text-secondary mb-2">
                What I can do
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tight">
                Full-stack, end-to-end.
              </h2>
            </div>
            <p className="text-sm text-slate-500 max-w-sm">
              From database schema to pixel — I&apos;m comfortable owning the whole slice.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CAPABILITIES.map((c, i) => (
              <motion.div
                key={c.title}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
                variants={fadeUp} custom={i}
                className="group bg-white border border-outline-variant rounded-2xl p-6 hover:shadow-premium hover:-translate-y-0.5 transition-all"
              >
                <div className={`w-11 h-11 ${c.color} rounded-xl flex items-center justify-center mb-5 shadow-sm`}>
                  <c.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-3">{c.title}</h3>
                <ul className="space-y-1.5">
                  {c.items.map((it) => (
                    <li key={it} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="h-3.5 w-3.5 text-secondary flex-shrink-0" />
                      {it}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Product Vision (The Why) ──────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 lg:px-8 mt-28">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            {/* Left — the problem statement */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 mb-5">
                <Target className="h-3.5 w-3.5 text-secondary" />
                <span className="text-[11px] font-black tracking-wider uppercase text-secondary">
                  The Why — Product Vision
                </span>
              </div>

              <h2 className="text-3xl md:text-5xl font-black text-primary tracking-tight leading-[1.05]">
                Every fintech team{' '}
                <span className="relative inline-block">
                  <span className="relative z-10">rebuilds</span>
                  <span className="absolute left-0 right-0 bottom-1 h-3 bg-accent/40 -z-0" />
                </span>{' '}
                the same stack.
              </h2>

              <p className="mt-5 text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Companies burn months re-inventing KYC, wiring payment rails, and bolting on ledgers
                — every team in a silo, every time. I built this to make fintech primitives
                <span className="text-primary font-semibold"> interoperable and reusable</span>:
                verify a customer once, move money on the cheapest rail, keep books that actually balance.
              </p>
            </div>

            {/* Right — 3 pillars */}
            <div className="lg:col-span-5 space-y-3">
              {[
                { icon: Repeat, title: 'Reuse, don\'t rebuild', desc: 'KYC verified once, portable across products.' },
                { icon: Route,  title: 'Cheapest path wins',    desc: 'Rail orchestrator picks the best route by currency & country.' },
                { icon: Scale,  title: 'Books that balance',    desc: 'Double-entry by default — every debit has a credit, always.' },
              ].map((p, i) => (
                <motion.div
                  key={p.title}
                  initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={fadeUp} custom={i}
                  className="group flex gap-4 bg-white border border-outline-variant rounded-2xl p-5 hover:border-accent/50 hover:shadow-premium transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                    <p.icon className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">{p.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Tech Vision (The How) ─────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 lg:px-8 mt-28">
          <div className="bg-[#050914] rounded-[32px] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/10 rounded-full blur-3xl -translate-y-1/2" />
            {/* Grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />

            <div className="relative">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-5">
                  <Cpu className="h-3.5 w-3.5 text-accent" />
                  <span className="text-[11px] font-black tracking-wider uppercase text-accent">
                    The How — Tech Vision
                  </span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                  Built like real{' '}
                  <span className="text-accent">infrastructure.</span>
                </h2>
                <p className="mt-4 text-slate-400 text-base max-w-xl mx-auto">
                  Opinionated defaults. Boring-tech core. Every decision earns its place.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { icon: Lock,      title: 'Security first',        desc: 'OWASP-hardened, JWT + bcrypt, PII isolated, audit trails on by default.' },
                  { icon: Radio,     title: 'gRPC streaming',        desc: 'Bidirectional streams for real-time payments, reconciliation, and webhooks.' },
                  { icon: Database,  title: 'Double-entry core',     desc: 'Every transaction is a balanced journal — the ledger is the source of truth.' },
                  { icon: KeyRound,  title: 'Zero-trust auth',       desc: 'Short-lived tokens, RBAC, and protected routes — no implicit trust.' },
                  { icon: LineChart, title: 'Observable by default', desc: 'Structured logs, health endpoints, tracing — debug production, not hope.' },
                  { icon: RefreshCw, title: 'Idempotent APIs',       desc: 'Safe retries on every money-moving endpoint. Replays never double-spend.' },
                ].map((t, i) => (
                  <motion.div
                    key={t.title}
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
                    variants={fadeUp} custom={i * 0.6}
                    className="group bg-white/[0.04] border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] hover:border-accent/40 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                        <t.icon className="h-4 w-4 text-accent" />
                      </div>
                      <p className="text-sm font-bold text-white">{t.title}</p>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{t.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Featured build ────────────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 lg:px-8 mt-28">
          <div className="bg-[#050914] rounded-[32px] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

            <div className="relative grid lg:grid-cols-12 gap-10">
              <div className="lg:col-span-5">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-6">
                  <Rocket className="h-3.5 w-3.5 text-accent" />
                  <span className="text-[11px] font-black tracking-wider uppercase text-accent">
                    Featured build
                  </span>
                </div>

                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                  MudraCore OS
                </h2>
                <p className="mt-4 text-slate-300 text-base md:text-lg leading-relaxed">
                  A runnable fintech operating system — ledger, payments, KYC, and gRPC
                  streaming in a single clone-and-run project.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link to="/" className="inline-flex items-center gap-2 bg-accent text-primary px-5 py-3 rounded-xl text-sm font-bold hover:bg-accent/90 transition-all">
                    Open live demo
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/developers" className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-white/15 transition-all">
                    <Terminal className="h-4 w-4" />
                    API docs
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7 grid sm:grid-cols-2 gap-3">
                {HIGHLIGHTS.map((h, i) => (
                  <motion.div
                    key={h.label}
                    initial="hidden" whileInView="visible" viewport={{ once: true }}
                    variants={fadeUp} custom={i}
                    className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm hover:bg-white/10 transition-all"
                  >
                    <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center mb-3">
                      <h.icon className="h-4 w-4 text-accent" />
                    </div>
                    <p className="text-sm font-bold text-white mb-1">{h.label}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{h.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Tech stack ────────────────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 lg:px-8 mt-28">
          <div className="text-center mb-10">
            <p className="text-[11px] font-black tracking-wider uppercase text-secondary mb-2">
              Tools of the trade
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tight">
              Opinionated, not dogmatic.
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-2.5">
            {STACK.map((t, i) => (
              <motion.span
                key={t}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i * 0.3}
                className="px-4 py-2 bg-white border border-outline-variant rounded-full text-sm font-semibold text-primary hover:border-accent hover:text-secondary transition-colors"
              >
                {t}
              </motion.span>
            ))}
          </div>
        </section>

        {/* ── Process ───────────────────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 lg:px-8 mt-28">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <p className="text-[11px] font-black tracking-wider uppercase text-secondary mb-2">
                How I work
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tight">
                Simple playbook.
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {PROCESS.map((p, i) => (
              <motion.div
                key={p.n}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className="bg-white border border-outline-variant rounded-2xl p-6 hover:border-accent/40 transition-colors"
              >
                <p className="text-xs font-black text-accent tracking-wider mb-3">{p.n}</p>
                <h3 className="text-lg font-bold text-primary mb-2">{p.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 lg:px-8 mt-28">
          <div className="bg-white border border-outline-variant rounded-3xl p-10 md:p-14 text-center relative overflow-hidden shadow-premium">
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-black text-primary tracking-tight">
                Have something to build?
              </h2>
              <p className="mt-4 text-slate-500 max-w-xl mx-auto">
                I take on a handful of fintech, infra, and 0→1 projects each quarter.
                Tell me what you&apos;re working on.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <a
                  href="mailto:karansinghkachwah@gmail.com"
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3.5 rounded-xl text-sm font-bold active:scale-95 transition-all hover:shadow-lg hover:shadow-primary/20"
                >
                  <Mail className="h-4 w-4" />
                  karansinghkachwah@gmail.com
                </a>
                <Link
                  to="/developers"
                  className="inline-flex items-center gap-2 bg-white border border-outline-variant text-primary px-6 py-3.5 rounded-xl text-sm font-bold hover:bg-surface transition-all"
                >
                  Browse the build
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </ConsistentBackground>
  );
};

export default About;
