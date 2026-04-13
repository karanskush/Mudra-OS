import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Database, CreditCard, Shield, TrendingUp, Zap, Code, Building, Sparkles, Activity, ChevronDown } from 'lucide-react';
import LoginForm from './LoginForm';
import RegistrationForm from './RegistrationForm';

const MARQUEE_NAMES = ['VeloCapital', 'NexoPay', 'Horizon Bank', 'Stark Systems', 'EtherFlow', 'GlobalLedger'];

const PLATFORM_ITEMS = [
  { name: 'Core Ledger',          href: '/ledger',    icon: Database,    description: 'Double-entry accounting system',           badge: 'Core'     },
  { name: 'Payment Rails',        href: '/payments',  icon: CreditCard,  description: 'Smart payment routing & processing',       badge: 'Popular'  },
  { name: 'KYC & Compliance',     href: '/kyc',       icon: Shield,      description: 'Identity verification & compliance',       badge: 'Enhanced' },
  { name: 'Analytics & Insights', href: '/status',    icon: TrendingUp,  description: 'Real-time business intelligence',          badge: 'Pro'      },
  { name: 'gRPC Streaming Demo',  href: '/grpc-demo', icon: Zap,         description: 'Real-time bidirectional streaming APIs',   badge: 'New'      },
];

const DEVELOPER_ITEMS = [
  { name: 'Explore API',      href: '/developers/api-explorer', icon: Code,     description: 'Interactive API testing & exploration', badge: 'Interactive' },
  { name: 'Documentation',    href: '/developers',              icon: Database, description: 'Comprehensive API docs',                badge: 'Complete'    },
  { name: 'gRPC Demo',        href: '/grpc-demo',               icon: Zap,      description: 'Bidirectional streaming APIs',          badge: 'New'         },
  { name: 'Quick Start',      href: '/developers',              icon: Sparkles, description: 'Get started in minutes',                badge: 'Guide'       },
  { name: 'SDKs & Libraries', href: '/developers',              icon: Building, description: 'Client libraries for Python, Go, Node', badge: 'Multi-Lang'  },
];

const BADGE_COLORS: Record<string, string> = {
  Core:        'bg-blue-50 text-blue-600',
  Popular:     'bg-purple-50 text-purple-600',
  Enhanced:    'bg-emerald-50 text-emerald-600',
  Pro:         'bg-amber-50 text-amber-700',
  New:         'bg-accent/10 text-secondary',
  Interactive: 'bg-cyan-50 text-cyan-700',
  Complete:    'bg-slate-100 text-slate-600',
  Guide:       'bg-orange-50 text-orange-600',
  'Multi-Lang':'bg-pink-50 text-pink-600',
};

const LandingPage: React.FC = () => {
  const [activeDropdown, setActiveDropdown]   = useState<string | null>(null);
  const [loginOpen, setLoginOpen]             = useState(false);
  const [registerOpen, setRegisterOpen]       = useState(false);
  const navRef   = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (name: string) =>
    setActiveDropdown(prev => (prev === name ? null : name));

  return (
    <div className="bg-surface text-on-surface font-body antialiased selection:bg-accent/30">

      {/* ── Top Navigation Bar ─────────────────────────────────────────── */}
      <header ref={navRef} className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-outline-variant/50">
        <div className="flex justify-between items-center h-16 px-8 max-w-[1440px] mx-auto">
          {/* Logo */}
          <div className="text-xl font-black tracking-tighter text-primary font-headline uppercase flex items-center gap-2">
            <span className="w-6 h-6 bg-accent rounded-sm inline-block" />
            MudraCore OS
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Platform dropdown */}
            <div className="relative">
              <button
                onClick={() => toggle('platform')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[0.875rem] font-semibold transition-colors ${
                  activeDropdown === 'platform'
                    ? 'bg-surface text-primary'
                    : 'text-primary/70 hover:text-primary hover:bg-surface'
                }`}
              >
                Platform
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${activeDropdown === 'platform' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'platform' && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-outline-variant rounded-2xl shadow-premium overflow-hidden z-50">
                  <div className="p-2">
                    {PLATFORM_ITEMS.map(item => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-start gap-3 px-4 py-3 rounded-xl hover:bg-surface transition-colors group"
                      >
                        <div className="w-9 h-9 bg-surface rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white transition-colors mt-0.5">
                          <item.icon className="h-4 w-4 text-secondary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[0.875rem] font-bold text-primary truncate">{item.name}</span>
                            <span className={`text-[0.65rem] font-black px-1.5 py-0.5 rounded-md flex-shrink-0 ${BADGE_COLORS[item.badge] ?? 'bg-slate-100 text-slate-600'}`}>
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-[0.75rem] text-slate-500 leading-snug">{item.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="px-4 py-3 border-t border-outline-variant/50 bg-surface">
                    <Link to="/status" onClick={() => setActiveDropdown(null)} className="inline-flex items-center gap-1.5 text-[0.75rem] font-bold text-secondary hover:text-primary transition-colors">
                      <Activity className="h-3.5 w-3.5" /> View system status
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Developers dropdown */}
            <div className="relative">
              <button
                onClick={() => toggle('developers')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[0.875rem] font-semibold transition-colors ${
                  activeDropdown === 'developers'
                    ? 'bg-surface text-primary'
                    : 'text-primary/70 hover:text-primary hover:bg-surface'
                }`}
              >
                Developers
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${activeDropdown === 'developers' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'developers' && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-outline-variant rounded-2xl shadow-premium overflow-hidden z-50">
                  <div className="p-2">
                    {DEVELOPER_ITEMS.map(item => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-start gap-3 px-4 py-3 rounded-xl hover:bg-surface transition-colors group"
                      >
                        <div className="w-9 h-9 bg-surface rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white transition-colors mt-0.5">
                          <item.icon className="h-4 w-4 text-secondary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[0.875rem] font-bold text-primary truncate">{item.name}</span>
                            <span className={`text-[0.65rem] font-black px-1.5 py-0.5 rounded-md flex-shrink-0 ${BADGE_COLORS[item.badge] ?? 'bg-slate-100 text-slate-600'}`}>
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-[0.75rem] text-slate-500 leading-snug">{item.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Status — direct link */}
            <Link
              to="/status"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[0.875rem] font-medium text-primary/70 hover:text-primary hover:bg-surface transition-colors"
            >
              <Activity className="h-3.5 w-3.5" /> Status
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLoginOpen(true)}
              className="text-[0.875rem] font-medium text-primary/70 hover:text-primary transition-colors"
            >
              Login
            </button>
            <Link
              to="/ledger"
              className="bg-primary text-white px-5 py-2.5 rounded-lg text-[0.875rem] font-semibold active:scale-95 transition-all hover:shadow-lg hover:shadow-primary/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Auth Modals ─────────────────────────────────────────────────── */}
      <LoginForm
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={() => { setLoginOpen(false); navigate('/ledger'); }}
        onRegisterClick={() => { setLoginOpen(false); setRegisterOpen(true); }}
      />
      <RegistrationForm
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSuccess={() => { setRegisterOpen(false); navigate('/ledger'); }}
        onLoginClick={() => { setRegisterOpen(false); setLoginOpen(true); }}
      />

      <main>
        {/* ── Hero Section ───────────────────────────────────────────────── */}
        <section className="relative bg-surface px-8 pt-20 pb-16 max-w-[1440px] mx-auto overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Left */}
            <div className="lg:col-span-6 z-10">
              <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[0.75rem] font-bold tracking-wider uppercase text-secondary">System Nominal • V4.2 Live</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-black tracking-tight text-primary mb-8 leading-[0.95] font-headline">
                The Engine of{' '}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-accent">
                  Modern Finance.
                </span>
              </h1>
              <p className="text-xl text-slate-600 mb-12 max-w-xl leading-relaxed">
                Scale your financial operations on a secure, compliant, and hyper-scalable infrastructure.
                Engineered for institutional precision, built for startup speed.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/ledger"
                  className="bg-primary text-white px-10 py-4 rounded-xl font-bold text-base active:scale-95 transition-all hover:shadow-xl hover:shadow-primary/25"
                >
                  Deploy Core Now
                </Link>
                <Link
                  to="/developers"
                  className="bg-white border border-outline-variant text-primary px-10 py-4 rounded-xl font-bold text-base active:scale-95 transition-all hover:bg-slate-50"
                >
                  View Documentation
                </Link>
              </div>
            </div>

            {/* Right — Data Viz Card */}
            <div className="lg:col-span-6 relative">
              <div className="bg-white p-8 rounded-3xl border border-outline-variant/50 shadow-premium relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <span className="text-[0.75rem] font-bold uppercase text-slate-400 tracking-widest block mb-2">Network Throughput</span>
                    <span className="text-4xl font-black text-primary tracking-tighter">$14,289,402.00</span>
                  </div>
                  <div className="bg-accent/10 text-secondary px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    +12.4%{' '}
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>trending_up</span>
                  </div>
                </div>
                {/* Pulse SVG */}
                <div className="h-56 relative">
                  <svg
                    className="w-full h-full drop-shadow-[0_0_8px_rgba(0,255,148,0.4)]"
                    preserveAspectRatio="none"
                    viewBox="0 0 400 150"
                  >
                    <path
                      className="pulse-line"
                      d="M0,120 Q50,110 80,130 T150,80 T220,100 T300,40 T400,60"
                      fill="none"
                      stroke="#00FF94"
                      strokeWidth="4"
                    />
                    <path
                      d="M0,120 Q50,110 80,130 T150,80 T220,100 T300,40 T400,60 V150 H0 Z"
                      fill="url(#gradientPulse)"
                      opacity="0.1"
                    />
                    <defs>
                      <linearGradient id="gradientPulse" x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="#00FF94" />
                        <stop offset="100%" stopColor="#00FF94" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-3 gap-8">
                  <div>
                    <span className="block text-[0.75rem] text-slate-400 font-bold uppercase mb-2">API Latency</span>
                    <span className="text-lg font-black text-primary">14.2ms</span>
                  </div>
                  <div>
                    <span className="block text-[0.75rem] text-slate-400 font-bold uppercase mb-2">Settlement</span>
                    <span className="text-lg font-black text-accent">INSTANT</span>
                  </div>
                  <div>
                    <span className="block text-[0.75rem] text-slate-400 font-bold uppercase mb-2">Uptime</span>
                    <span className="text-lg font-black text-primary">100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Trusted By Marquee ─────────────────────────────────────────── */}
        <section className="py-12 border-y border-outline-variant/30 bg-surface">
          <div className="marquee">
            <div className="marquee-content">
              {MARQUEE_NAMES.map(name => (
                <span key={name} className="text-xl font-black text-primary/20 tracking-tighter uppercase">{name}</span>
              ))}
            </div>
            <div aria-hidden className="marquee-content">
              {MARQUEE_NAMES.map(name => (
                <span key={`${name}-dup`} className="text-xl font-black text-primary/20 tracking-tighter uppercase">{name}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Core Modules Bento Grid ────────────────────────────────────── */}
        <section className="bg-white py-32 px-8">
          <div className="max-w-[1440px] mx-auto">
            <div className="mb-20 text-center">
              <span className="text-[0.75rem] font-black text-accent uppercase tracking-[0.3em] block mb-4">The Infrastructure</span>
              <h2 className="text-5xl font-black tracking-tight text-primary mb-6">Built for Modular Scale</h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                Six independent, interoperable pillars designed to handle the most complex financial logic with zero friction.
              </p>
            </div>
            <div className="bento-grid">
              {/* Ledger */}
              <div className="col-span-12 md:col-span-4 bg-surface p-10 border border-outline-variant/50 rounded-3xl hover:shadow-premium transition-all group hover:-translate-y-1">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 group-hover:bg-primary transition-colors">
                  <span className="material-symbols-outlined text-accent" style={{ fontSize: '28px' }}>account_balance_wallet</span>
                </div>
                <h3 className="text-2xl font-black mb-4 text-primary">Immutable Ledger</h3>
                <p className="text-slate-600 leading-relaxed">Double-entry accounting engine with cryptographic verification for every transaction entry.</p>
              </div>

              {/* Compliance — wide dark card */}
              <div className="col-span-12 md:col-span-8 bg-primary p-10 rounded-3xl hover:shadow-2xl transition-all group overflow-hidden relative border border-white/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                <div className="flex h-full gap-12 relative z-10">
                  <div className="flex-1">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
                      <span className="material-symbols-outlined text-accent" style={{ fontSize: '28px' }}>verified_user</span>
                    </div>
                    <h3 className="text-2xl font-black mb-4 text-white">Global Compliance</h3>
                    <p className="text-slate-300 leading-relaxed mb-8">
                      Real-time KYC/AML screening with automated reporting across 140+ jurisdictions. Pre-configured for speed.
                    </p>
                    <div className="flex gap-3">
                      <span className="px-3 py-1 bg-white/5 border border-white/10 text-[0.75rem] font-bold text-accent rounded-lg">SOC2 TYPE II</span>
                      <span className="px-3 py-1 bg-white/5 border border-white/10 text-[0.75rem] font-bold text-accent rounded-lg">GDPR</span>
                      <span className="px-3 py-1 bg-white/5 border border-white/10 text-[0.75rem] font-bold text-accent rounded-lg">PCI-DSS L1</span>
                    </div>
                  </div>
                  <div className="hidden lg:block w-64 -mr-10 -mb-10 opacity-40 group-hover:opacity-80 transition-opacity">
                    <img
                      alt="Security Circuit"
                      className="w-full h-full object-cover rounded-tl-3xl grayscale brightness-200"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdXcayzUpx8hMN9bYaHrZjxgay7mguKtmOvt4DwfX3-HJ8Tm_UZ9V1iirNGVYYqURiCAWVp7DbGBc74we9XGsCzTCqYgCXA0rhp_OGzQTu1qCLS1cMjDd9gt6wMk3gkQPOYekiOSrNB8VtcnQI0AhqgwlEFunqe3nLJAUnK3-9Vd1hE5Dl03fL2pm6-n6eqU4NJWV6reg0R9aNdEvGKFrL2sEFwrLR5yCo8fPlIW6zw3xtHKnhfGf43D_4u5DQfzALECQFNCcW4g"
                    />
                  </div>
                </div>
              </div>

              {/* Smart Payment Engine */}
              <div className="col-span-12 md:col-span-4 bg-surface p-10 border border-outline-variant/50 rounded-3xl hover:shadow-premium transition-all group hover:-translate-y-1">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 group-hover:bg-primary transition-colors">
                  <span className="material-symbols-outlined text-accent" style={{ fontSize: '28px' }}>alt_route</span>
                </div>
                <h3 className="text-2xl font-black mb-4 text-primary">Smart Payment Engine</h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Adaptive rail selection scores every transfer in real time against cost, speed, and availability — automatically choosing ACH, RTP, SEPA, SWIFT, or on-chain.
                </p>
                {/* Rail mini-widget */}
                <div className="bg-white rounded-2xl border border-outline-variant/60 overflow-hidden">
                  {[
                    { rail: 'RTP',   speed: 'Instant', bar: 100, best: true  },
                    { rail: 'SEPA',  speed: '2 hrs',   bar: 75,  best: false },
                    { rail: 'ACH',   speed: '1 day',   bar: 55,  best: false },
                    { rail: 'SWIFT', speed: 'T+2',     bar: 18,  best: false },
                  ].map(r => (
                    <div key={r.rail} className={`px-4 py-2.5 flex items-center gap-3 ${r.best ? 'bg-accent/5' : ''}`}>
                      <span className={`text-[0.7rem] font-black w-10 flex-shrink-0 ${r.best ? 'text-secondary' : 'text-slate-500'}`}>{r.rail}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-outline-variant overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${r.bar}%`, background: r.best ? '#00FF94' : '#CBD5E1' }} />
                      </div>
                      <span className={`text-[0.65rem] font-bold flex-shrink-0 ${r.best ? 'text-secondary' : 'text-slate-400'}`}>{r.speed}</span>
                      {r.best && <span className="material-symbols-outlined text-accent flex-shrink-0" style={{ fontSize: '14px' }}>check_circle</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Orchestration */}
              <div className="col-span-12 md:col-span-4 bg-surface p-10 border border-outline-variant/50 rounded-3xl hover:shadow-premium transition-all group hover:-translate-y-1">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 group-hover:bg-primary transition-colors">
                  <span className="material-symbols-outlined text-accent" style={{ fontSize: '28px' }}>account_balance</span>
                </div>
                <h3 className="text-2xl font-black mb-4 text-primary">Payment Orchestration</h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Connect any bank account and initiate transfers to any destination worldwide. One unified API abstracts every bank, network, and currency behind a single integration.
                </p>
                {/* Bank connection mini-widget */}
                <div className="bg-white rounded-2xl border border-outline-variant/60 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-outline-variant/40 flex items-center justify-between">
                    <span className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400">Connected Banks</span>
                    <span className="text-[0.65rem] font-black text-secondary">10,000+</span>
                  </div>
                  {[
                    { name: 'Chase',       flag: '🇺🇸', status: 'live'    },
                    { name: 'Barclays',    flag: '🇬🇧', status: 'live'    },
                    { name: 'DBS Bank',    flag: '🇸🇬', status: 'live'    },
                    { name: 'Your Bank →', flag: '＋',  status: 'connect' },
                  ].map(b => (
                    <div key={b.name} className="px-4 py-2.5 flex items-center gap-3">
                      <span className="text-base w-6 text-center flex-shrink-0">{b.flag}</span>
                      <span className={`text-[0.8rem] font-bold flex-1 ${b.status === 'connect' ? 'text-secondary' : 'text-primary'}`}>{b.name}</span>
                      {b.status === 'live' ? (
                        <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                      ) : (
                        <span className="text-[0.65rem] font-black text-secondary border border-accent/30 px-2 py-0.5 rounded-full">Add</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Auto-Reconcile + Observability stacked */}
              <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
                <div className="bg-surface p-10 border border-outline-variant/50 rounded-3xl hover:shadow-premium transition-all group hover:-translate-y-1 flex-1">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:bg-primary transition-colors">
                    <span className="material-symbols-outlined text-accent" style={{ fontSize: '28px' }}>task_alt</span>
                  </div>
                  <h3 className="text-2xl font-black mb-3 text-primary">Auto-Reconcile</h3>
                  <p className="text-slate-600 leading-relaxed">AI-driven matching logic eliminates manual back-office tasks and reduces error rates to &lt;1%.</p>
                </div>
                <div className="bg-surface p-10 border border-outline-variant/50 rounded-3xl hover:shadow-premium transition-all group hover:-translate-y-1 flex-1">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:bg-primary transition-colors">
                    <span className="material-symbols-outlined text-accent" style={{ fontSize: '28px' }}>monitor_heart</span>
                  </div>
                  <h3 className="text-2xl font-black mb-3 text-primary">Observability</h3>
                  <p className="text-slate-600 leading-relaxed">End-to-end tracing, structured logs, and real-time metrics across every transaction, API call, and service boundary.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Platform Capabilities ──────────────────────────────────────── */}
        <section className="py-32 px-8 bg-surface-dark text-white relative overflow-hidden">
          <div
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ background: 'radial-gradient(circle at 30% 20%, rgba(0,255,148,0.05) 0%, transparent 50%)' }}
          />
          <div className="max-w-[1440px] mx-auto relative z-10">
            <div className="grid md:grid-cols-2 gap-24 items-start">
              <div>
                <span className="text-[0.75rem] font-black text-accent uppercase tracking-[0.3em] block mb-6">Optimization</span>
                <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-12">
                  Engineered for<br />Absolute Peak.
                </h2>
                <div className="space-y-12">
                  <div className="flex gap-8 group">
                    <div className="bg-accent/10 w-16 h-16 flex items-center justify-center rounded-2xl flex-shrink-0 border border-accent/20 transition-all group-hover:bg-accent group-hover:text-primary text-accent">
                      <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>security</span>
                    </div>
                    <div>
                      <h4 className="font-black text-2xl mb-3">Bank-Grade Hardening</h4>
                      <p className="text-slate-400 leading-relaxed">
                        Hardware Security Modules (HSM) and multi-party computation (MPC) protect all key material and sensitive data at rest and in transit.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-8 group">
                    <div className="bg-accent/10 w-16 h-16 flex items-center justify-center rounded-2xl flex-shrink-0 border border-accent/20 transition-all group-hover:bg-accent group-hover:text-primary text-accent">
                      <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>insights</span>
                    </div>
                    <div>
                      <h4 className="font-black text-2xl mb-3">Sub-Second Intelligence</h4>
                      <p className="text-slate-400 leading-relaxed">
                        Stream transaction data directly to your BI tools with sub-second latency via dedicated real-time webhooks and gRPC streams.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benchmarks Table */}
              <div className="bg-primary border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                  <h5 className="text-[0.75rem] font-black uppercase tracking-widest text-accent">Operational Benchmarks</h5>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-white/20" />
                    <div className="w-2 h-2 rounded-full bg-white/20" />
                    <div className="w-2 h-2 rounded-full bg-white/20" />
                  </div>
                </div>
                <div className="p-2">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr>
                        <th className="px-8 py-5 text-[0.75rem] font-black uppercase tracking-wider text-slate-500">Metric</th>
                        <th className="px-8 py-5 text-[0.75rem] font-black uppercase tracking-wider text-accent">MudraCore</th>
                        <th className="px-8 py-5 text-[0.75rem] font-black uppercase tracking-wider text-slate-500">Legacy</th>
                      </tr>
                    </thead>
                    <tbody className="text-base">
                      {[
                        { metric: 'Throughput',  ours: '50k+ TPS', legacy: '~800 TPS' },
                        { metric: 'Settlement',  ours: 'INSTANT',  legacy: 'T+2 Days'  },
                        { metric: 'Availability',ours: '99.999%',  legacy: '99.9%'     },
                        { metric: 'API Latency', ours: '< 15ms',   legacy: '~200ms'    },
                      ].map((row, i, arr) => (
                        <tr
                          key={row.metric}
                          className={`hover:bg-white/5 transition-colors ${i < arr.length - 1 ? 'border-b border-white/5' : ''}`}
                        >
                          <td className="px-8 py-6 font-bold">{row.metric}</td>
                          <td className="px-8 py-6 text-accent font-black">{row.ours}</td>
                          <td className="px-8 py-6 text-slate-500">{row.legacy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Developer Terminal ─────────────────────────────────────────── */}
        <section className="py-32 bg-white">
          <div className="max-w-[1440px] mx-auto px-8 grid md:grid-cols-2 gap-24 items-center">
            {/* Terminal */}
            <div className="order-2 md:order-1">
              <div className="bg-[#020617] rounded-2xl border border-slate-800 overflow-hidden font-mono text-[14px] shadow-2xl relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 to-transparent pointer-events-none" />
                <div className="flex items-center justify-between px-5 py-3.5 bg-[#0F172A] border-b border-slate-800">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                  </div>
                  <span className="text-slate-500 text-xs font-semibold">mudracore-ledger-api — zsh</span>
                </div>
                <pre className="p-8 overflow-x-auto leading-relaxed text-slate-300 text-sm m-0 bg-transparent">
{''}<span className="text-accent">curl</span>{` -X POST https://api.mudracore.os/v1/ledger \\
  -H `}<span className="text-cyan-400">{'"Authorization: Bearer $MC_API_KEY"'}</span>{` \\
  -d `}<span className="text-cyan-400">{"'{\n    \"account_id\": \"acc_78x92\",\n    \"amount\": \"15000.00\",\n    \"currency\": \"USD\",\n    \"metadata\": {\n      \"reference\": \"tx_2209\",\n      \"origin\": \"web_portal\"\n    }\n  }'"}</span>{'\n\n'}<span className="text-slate-500 italic"># Response 201 Created</span>{`
{
  `}<span className="text-accent">"id"</span>{`: `}<span className="text-cyan-400">"ent_882j91"</span>{`,
  `}<span className="text-accent">"status"</span>{`: `}<span className="text-cyan-400">"committed"</span>{`,
  `}<span className="text-accent">"balance_snapshot"</span>{`: `}<span className="text-cyan-400">"125900.00"</span>{`
}`}
                </pre>
              </div>
            </div>

            {/* Copy */}
            <div className="order-1 md:order-2">
              <span className="text-[0.75rem] font-black text-secondary uppercase tracking-[0.3em] block mb-6">Developer First</span>
              <h2 className="text-5xl font-black tracking-tight text-primary mb-8 leading-[1.1]">
                Build on a platform<br />that speaks code.
              </h2>
              <p className="text-slate-600 mb-12 text-lg leading-relaxed">
                Our API is designed for clarity and robustness. With comprehensive SDKs for Python, Node.js, and Go,
                move from local sandbox to institutional scale in minutes.
              </p>
              <ul className="space-y-6">
                {[
                  { icon: 'code_blocks', label: 'Type-safe SDKs & Real-time Docs'           },
                  { icon: 'webhook',     label: 'Zero-loss Webhooks & Event Streams'         },
                  { icon: 'terminal',    label: 'Sandbox Environments for Every Module'      },
                ].map(({ icon, label }) => (
                  <li key={icon} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent transition-colors">
                      <span className="material-symbols-outlined text-secondary group-hover:text-primary" style={{ fontSize: '20px' }}>{icon}</span>
                    </div>
                    <span className="font-bold text-primary">{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Newsletter CTA ─────────────────────────────────────────────── */}
        <section className="py-32 px-8 bg-surface">
          <div className="max-w-[1440px] mx-auto bg-primary border border-white/10 rounded-[3rem] p-16 md:p-24 text-center relative overflow-hidden shadow-2xl">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(circle at center, rgba(0,255,148,0.1) 0%, transparent 70%)' }}
            />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-white">Scale your vision today.</h2>
              <p className="text-slate-400 mb-12 max-w-xl mx-auto text-lg">
                Join 500+ institutional partners receiving our monthly intelligence report on fintech infrastructure.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto bg-white/5 p-2 rounded-2xl border border-white/10">
                <input
                  className="flex-grow bg-transparent border-none rounded-xl px-6 py-4 text-white focus:ring-0 outline-none text-base placeholder:text-slate-500"
                  placeholder="work@company.com"
                  type="email"
                />
                <button className="bg-accent text-primary px-10 py-4 rounded-xl font-black text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent/20">
                  Subscribe Now
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="w-full pt-24 pb-12 bg-surface text-primary border-t border-outline-variant/30">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 px-8 max-w-[1440px] mx-auto">
          <div className="col-span-2">
            <div className="text-2xl font-black tracking-tighter uppercase mb-6 flex items-center gap-2">
              <span className="w-6 h-6 bg-accent rounded-sm inline-block" />
              MudraCore OS
            </div>
            <p className="text-slate-500 max-w-xs leading-relaxed text-base font-medium">
              The bedrock of modern financial services. Providing institutional-grade ledgering, payments, and compliance modules globally.
            </p>
          </div>
          <div>
            <h5 className="text-[0.75rem] uppercase tracking-widest font-black text-slate-400 mb-8">Product</h5>
            <ul className="space-y-4 font-bold text-[0.875rem]">
              <li><a className="text-primary hover:text-accent transition-colors" href="#">Ledger Engine</a></li>
              <li><a className="text-primary hover:text-accent transition-colors" href="#">Compliance OS</a></li>
              <li><a className="text-primary hover:text-accent transition-colors" href="#">Wallets API</a></li>
              <li><a className="text-primary hover:text-accent transition-colors" href="#">Global Payments</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-[0.75rem] uppercase tracking-widest font-black text-slate-400 mb-8">Resources</h5>
            <ul className="space-y-4 font-bold text-[0.875rem]">
              <li><a className="text-primary hover:text-accent transition-colors" href="#">API Reference</a></li>
              <li><a className="text-primary hover:text-accent transition-colors" href="#">Whitepapers</a></li>
              <li><a className="text-primary hover:text-accent transition-colors" href="#">Security Posture</a></li>
              <li><a className="text-primary hover:text-accent transition-colors" href="#">Network Status</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-[0.75rem] uppercase tracking-widest font-black text-slate-400 mb-8">Legal</h5>
            <ul className="space-y-4 font-bold text-[0.875rem]">
              <li><a className="text-primary hover:text-accent transition-colors" href="#">Privacy</a></li>
              <li><a className="text-primary hover:text-accent transition-colors" href="#">Terms</a></li>
              <li><a className="text-primary hover:text-accent transition-colors" href="#">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-24 pt-8 border-t border-outline-variant/30 px-8 max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[0.75rem] font-bold text-slate-400 uppercase tracking-widest">
            © 2025 MudraCore OS. Built for the future of finance.
          </div>
          <div className="flex gap-8">
            <span className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-accent transition-colors" style={{ fontSize: '24px' }}>public</span>
            <span className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-accent transition-colors" style={{ fontSize: '24px' }}>terminal</span>
            <span className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-accent transition-colors" style={{ fontSize: '24px' }}>podcasts</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
