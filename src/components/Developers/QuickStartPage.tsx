import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Copy, Check, ArrowRight, ChevronDown, ChevronRight,
  Rocket, Shield, CreditCard, Database, Zap, Globe,
  CheckCircle2, Lock, Key, Users, Eye, BarChart2,
  Layers, Code2, Terminal, Building2, Wallet,
  ArrowLeftRight, Activity, AlertCircle, Info,
  ExternalLink, Play, Star,
} from 'lucide-react';
import Navbar from '../Navbar';

// ─── Copy Button ─────────────────────────────────────────────────────────────

const CopyBtn: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
      className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-all"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};

const CodeBlock: React.FC<{ code: string; lang?: string; title?: string }> = ({ code, lang = 'bash', title }) => (
  <div className="rounded-xl overflow-hidden border border-slate-700 my-4">
    <div className="flex items-center justify-between px-4 py-2 bg-[#0d1424] border-b border-slate-700">
      <div className="flex items-center gap-2">
        {title && <span className="text-xs font-medium text-slate-300">{title}</span>}
        {!title && <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">{lang}</span>}
      </div>
      <CopyBtn text={code} />
    </div>
    <pre className="bg-[#070e1a] p-4 overflow-x-auto">
      <code className="text-sm font-mono text-slate-300 leading-relaxed whitespace-pre">{code}</code>
    </pre>
  </div>
);

const Callout: React.FC<{ type?: 'info' | 'tip' | 'warn'; children: React.ReactNode }> = ({ type = 'info', children }) => {
  const s = {
    info: { bg: 'bg-blue-50 border-blue-200', icon: Info, ic: 'text-blue-500', text: 'text-blue-800' },
    tip:  { bg: 'bg-accent/8 border-accent/20', icon: CheckCircle2, ic: 'text-secondary', text: 'text-secondary' },
    warn: { bg: 'bg-amber-50 border-amber-200', icon: AlertCircle, ic: 'text-amber-500', text: 'text-amber-800' },
  }[type];
  return (
    <div className={`flex gap-3 p-4 rounded-xl border my-4 ${s.bg}`}>
      <s.icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${s.ic}`} />
      <div className={`text-sm leading-relaxed ${s.text}`}>{children}</div>
    </div>
  );
};

// ─── Step Component ───────────────────────────────────────────────────────────

const Step: React.FC<{
  n: number; total: number; id: string; icon: React.ElementType;
  color: string; label: string; subtitle: string; children: React.ReactNode;
}> = ({ n, total, id, icon: Icon, color, label, subtitle, children }) => (
  <section id={id} className="scroll-mt-24">
    <div className="flex items-start gap-5 mb-6">
      <div className="flex-shrink-0 flex flex-col items-center">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {n < total && <div className="w-0.5 h-8 bg-outline-variant mt-2" />}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Step {n} of {total}</span>
        </div>
        <h2 className="text-2xl font-bold text-primary">{label}</h2>
        <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
      </div>
    </div>
    <div className="ml-17 pl-2">
      {children}
    </div>
  </section>
);

// ─── Provider Badge ───────────────────────────────────────────────────────────

const PROVIDERS = [
  { key: 'revolut',  name: 'Revolut',  emoji: '🔵', bg: 'bg-blue-50 border-blue-200',   text: 'text-blue-700',   type: 'Digital Bank',     balance: '$1,200' },
  { key: 'paypal',   name: 'PayPal',   emoji: '🅿',  bg: 'bg-blue-50 border-blue-100',   text: 'text-blue-600',   type: 'Payments',         balance: '$340' },
  { key: 'wise',     name: 'Wise',     emoji: '💱', bg: 'bg-teal-50 border-teal-200',   text: 'text-teal-700',   type: 'Transfer',         balance: '$890' },
  { key: 'chase',    name: 'Chase',    emoji: '🏦', bg: 'bg-slate-50 border-slate-200', text: 'text-slate-700',  type: 'Traditional Bank', balance: '$5,000' },
  { key: 'coinbase', name: 'Coinbase', emoji: '🟡', bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', type: 'Crypto Exchange',  balance: '$2,100' },
  { key: 'metamask', name: 'MetaMask', emoji: '🦊', bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', type: 'Self-Custody',    balance: '$450' },
  { key: 'binance',  name: 'Binance',  emoji: '🟨', bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-800', type: 'Crypto Exchange', balance: '$780' },
  { key: 'stripe',   name: 'Stripe',   emoji: '▲',  bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', type: 'Payments',        balance: '$210' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

const QuickStartPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'curl' | 'js' | 'python'>('curl');
  const [kycCountry, setKycCountry] = useState('United States');
  const [accountsSeeded, setAccountsSeeded] = useState(false);

  const TOTAL_STEPS = 6;

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(0,255,148,0.07) 0%, transparent 70%)' }} />

        <div className="max-w-4xl mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase"
              style={{ background: 'rgba(0,255,148,0.10)', border: '1px solid rgba(0,255,148,0.25)', color: '#006d43' }}>
              <Rocket className="w-3 h-3" /> Quick Start Guide
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-primary mb-6 leading-tight tracking-tight">
              The complete{' '}
              <span style={{ background: 'linear-gradient(95deg, #006d43, #00FF94)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                fintech backbone
              </span>
              <br />for your company
            </h1>

            <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-8">
              Stop rebuilding payments, ledgers, KYC, and account infrastructure from scratch.
              MudraCore OS gives every company a production-ready fintech core — so you build products, not plumbing.
            </p>

            <div className="flex flex-wrap gap-3 justify-center mb-12">
              {[
                { icon: Database, label: 'Double-Entry Ledger' },
                { icon: ArrowLeftRight, label: '19 Payment Rails' },
                { icon: Eye, label: 'KYC & Compliance' },
                { icon: Globe, label: 'Live Market Data' },
                { icon: Zap, label: 'gRPC Streaming' },
                { icon: Wallet, label: 'Account Aggregation' },
              ].map(f => (
                <span key={f.label} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-outline-variant rounded-full px-3 py-1.5 shadow-sm">
                  <f.icon className="w-3.5 h-3.5 text-secondary" /> {f.label}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── WHY MUDRACORE ──────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-primary">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-accent text-xs font-black uppercase tracking-[0.3em] mb-2">The Problem</p>
            <h2 className="text-3xl font-black text-white mb-3">Building fintech infrastructure is brutally expensive</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm">
              Every fintech company — neobank, payments startup, crypto platform, enterprise treasury team — rebuilds the same core infrastructure. MudraCore ends that.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-10">
            {/* Without column */}
            <div className="bg-red-950/40 border border-red-900/50 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                  <span className="text-red-400 text-xs font-bold">✗</span>
                </div>
                <span className="text-red-300 font-bold text-sm">Without MudraCore</span>
              </div>
              {[
                '6–18 months to build a compliant ledger',
                'Separate integrations for each payment rail',
                'Multiple KYC vendor contracts',
                'Custom double-entry accounting from scratch',
                'Individual bank/crypto API integrations',
                'No unified account aggregation layer',
                'Rebuilding FX rate and crypto price feeds',
                'Managing regulatory compliance per jurisdiction',
              ].map(item => (
                <div key={item} className="flex items-start gap-2 mb-2">
                  <span className="text-red-500 text-xs mt-0.5 flex-shrink-0">✗</span>
                  <span className="text-slate-400 text-xs">{item}</span>
                </div>
              ))}
            </div>
            {/* With column */}
            <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
                  <span className="text-secondary text-xs font-bold">✓</span>
                </div>
                <span className="text-secondary font-bold text-sm">With MudraCore OS</span>
              </div>
              {[
                'GAAP-compliant double-entry ledger in minutes',
                '19 payment rails via one unified API',
                'KYC for 30+ countries, one integration',
                'Automated journal entries on every transaction',
                'Connect Revolut, PayPal, Coinbase, MetaMask & more',
                'Unified account aggregation across all providers',
                'Live FX + crypto prices, built in',
                'Compliance layer handles regulatory requirements',
              ].map(item => (
                <div key={item} className="flex items-start gap-2 mb-2">
                  <span className="text-secondary text-xs mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-slate-300 text-xs">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Architecture visual */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-5 text-center">MudraCore OS Architecture</p>
            <div className="flex flex-col gap-3">
              {/* Your App */}
              <div className="bg-accent/10 border border-accent/30 rounded-xl p-3 text-center">
                <span className="text-accent font-bold text-sm">Your Application</span>
                <p className="text-slate-400 text-xs mt-0.5">React · Next.js · Mobile · Backend Service</p>
              </div>
              <div className="flex justify-center"><ChevronDown className="w-4 h-4 text-slate-500" /></div>
              {/* API layer */}
              <div className="bg-primary border border-white/20 rounded-xl p-3 text-center">
                <span className="text-white font-bold text-sm">MudraCore OS API</span>
                <p className="text-slate-400 text-xs mt-0.5">REST + gRPC · JWT Auth · Rate Limiting · CORS</p>
              </div>
              <div className="flex justify-center"><ChevronDown className="w-4 h-4 text-slate-500" /></div>
              {/* Core modules */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { icon: Database, label: 'Ledger', sub: 'Double-entry accounting', color: 'text-orange-400' },
                  { icon: ArrowLeftRight, label: 'Payments', sub: '19 rails, auto-select', color: 'text-secondary' },
                  { icon: Eye, label: 'KYC', sub: '30+ countries', color: 'text-pink-400' },
                  { icon: BarChart2, label: 'Market', sub: 'FX + Crypto live', color: 'text-cyan-400' },
                ].map(m => (
                  <div key={m.label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                    <m.icon className={`w-5 h-5 ${m.color} mx-auto mb-1.5`} />
                    <p className="text-white font-bold text-xs">{m.label}</p>
                    <p className="text-slate-500 text-[10px] mt-0.5">{m.sub}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-center"><ChevronDown className="w-4 h-4 text-slate-500" /></div>
              {/* Connected providers */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider text-center mb-2">Connected Providers</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {PROVIDERS.map(p => (
                    <span key={p.key} className="text-xs bg-white/10 text-slate-300 border border-white/10 rounded-full px-2.5 py-1">
                      {p.emoji} {p.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STEPS ─────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 py-20 space-y-20">

        {/* ── STEP 1: API KEYS ── */}
        <Step n={1} total={TOTAL_STEPS} id="step-keys" icon={Key} color="bg-blue-600"
          label="Get your API keys" subtitle="Register an account and retrieve your JWT bearer token — this authenticates every request.">

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {[
              { icon: Lock, title: 'JWT Bearer Token', desc: 'Stateless, 30-day expiry. No API key dashboard needed — just register and you\'re authenticated.' },
              { icon: Shield, title: 'Role-Based Access', desc: 'Tokens carry user identity and role. Every endpoint validates scope before processing.' },
              { icon: Activity, title: 'No Rate Key Setup', desc: 'Free tier: 60 req/min. Pro: 600 req/min. No key rotation ceremony — just re-login to refresh.' },
            ].map(f => (
              <div key={f.title} className="bg-white border border-outline-variant rounded-xl p-4 shadow-premium">
                <f.icon className="w-5 h-5 text-blue-500 mb-2" />
                <p className="text-sm font-semibold text-primary mb-1">{f.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-0 bg-surface border border-outline-variant rounded-xl p-1 w-fit">
            {(['curl', 'js', 'python'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === t ? 'bg-primary text-white' : 'text-slate-500 hover:text-primary'}`}>
                {t === 'js' ? 'TypeScript' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'curl' && (
              <motion.div key="curl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <CodeBlock lang="bash" title="1. Register your account" code={`curl -X POST https://api.mudracore.dev/api/v1/auth/register \\
  -H 'Content-Type: application/json' \\
  -d '{
    "email": "you@yourcompany.com",
    "password": "YourSecurePass123!",
    "first_name": "Jane",
    "last_name": "Doe",
    "phone": "+1234567890",
    "date_of_birth": "1990-01-15T00:00:00Z"
  }'`} />
                <CodeBlock lang="bash" title="2. Login and save your token" code={`curl -X POST https://api.mudracore.dev/api/v1/auth/login \\
  -H 'Content-Type: application/json' \\
  -d '{"email":"you@yourcompany.com","password":"YourSecurePass123!"}'

# Response:
# {
#   "token": "eyJhbGciOiJIUzI1NiJ9...",   <── copy this
#   "expires_at": "2026-05-14T10:30:00Z",
#   "user": { "id": "usr_abc123", "email": "you@yourcompany.com" }
# }

# Save to env:
export MUDRA_TOKEN="eyJhbGciOiJIUzI1NiJ9..."`} />
                <CodeBlock lang="bash" title="3. Verify your token works" code={`curl https://api.mudracore.dev/api/v1/me \\
  -H "Authorization: Bearer $MUDRA_TOKEN"

# Response:
# { "id": "usr_abc123", "email": "you@yourcompany.com", "role": "user" }`} />
              </motion.div>
            )}
            {activeTab === 'js' && (
              <motion.div key="js" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <CodeBlock lang="typescript" title="auth.ts — Register + Login" code={`const BASE = 'https://api.mudracore.dev';

// Register (first time only)
await fetch(\`\${BASE}/api/v1/auth/register\`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'you@yourcompany.com',
    password: 'YourSecurePass123!',
    first_name: 'Jane',
    last_name: 'Doe',
  }),
});

// Login and persist token
const { token, user } = await fetch(\`\${BASE}/api/v1/auth/login\`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'you@yourcompany.com',
    password: 'YourSecurePass123!',
  }),
}).then(r => r.json());

// Store token (localStorage for SPAs, httpOnly cookie for SSR)
localStorage.setItem('mudra_token', token);

// Use in every subsequent request
const headers = {
  'Content-Type': 'application/json',
  'Authorization': \`Bearer \${token}\`,
};`} />
              </motion.div>
            )}
            {activeTab === 'python' && (
              <motion.div key="python" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <CodeBlock lang="python" title="auth.py" code={`import requests

BASE = "https://api.mudracore.dev"

# Register (first time only)
requests.post(f"{BASE}/api/v1/auth/register", json={
    "email": "you@yourcompany.com",
    "password": "YourSecurePass123!",
    "first_name": "Jane",
    "last_name": "Doe",
})

# Login and get token
resp = requests.post(f"{BASE}/api/v1/auth/login", json={
    "email": "you@yourcompany.com",
    "password": "YourSecurePass123!",
}).json()

TOKEN = resp["token"]
HEADERS = {"Authorization": f"Bearer {TOKEN}"}

# Verify
me = requests.get(f"{BASE}/api/v1/me", headers=HEADERS).json()
print(f"Logged in as {me['email']}")`} />
              </motion.div>
            )}
          </AnimatePresence>

          <Callout type="tip">
            Your token is valid for <strong>30 days</strong>. Store it securely — use <code className="font-mono text-xs bg-accent/10 px-1 rounded">httpOnly</code> cookies for server-rendered apps and <code className="font-mono text-xs bg-accent/10 px-1 rounded">localStorage</code> for SPAs. Never expose it in client-side code or version control.
          </Callout>
        </Step>

        {/* ── STEP 2: ADD ACCOUNTS ── */}
        <Step n={2} total={TOTAL_STEPS} id="step-accounts" icon={Building2} color="bg-secondary"
          label="Add your accounts" subtitle="Create the financial accounts that will hold balances and participate in transactions. Every account maps to a double-entry ledger entry.">

          <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-premium mb-5">
            <h3 className="text-sm font-bold text-primary mb-3">Account types supported</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { type: 'checking', label: 'Checking', desc: 'Day-to-day spending', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                { type: 'savings', label: 'Savings', desc: 'Long-term storage', color: 'bg-teal-50 text-teal-700 border-teal-200' },
                { type: 'investment', label: 'Investment', desc: 'Crypto & stocks', color: 'bg-amber-50 text-amber-700 border-amber-200' },
                { type: 'credit', label: 'Credit', desc: 'Liability accounts', color: 'bg-red-50 text-red-700 border-red-200' },
              ].map(a => (
                <div key={a.type} className={`rounded-xl border p-3 ${a.color}`}>
                  <p className="text-xs font-bold">{a.label}</p>
                  <p className="text-[10px] mt-0.5 opacity-70">{a.desc}</p>
                  <code className="text-[9px] font-mono opacity-60 mt-1 block">type: "{a.type}"</code>
                </div>
              ))}
            </div>
          </div>

          <CodeBlock lang="bash" title="Create your first account" code={`curl -X POST https://api.mudracore.dev/api/v1/accounts \\
  -H "Authorization: Bearer $MUDRA_TOKEN" \\
  -H 'Content-Type: application/json' \\
  -d '{
    "type": "checking",
    "name": "Primary Operations Account",
    "description": "Main account for business operations",
    "currency": "USD",
    "initial_balance": 10000.00
  }'

# Response:
# {
#   "success": true,
#   "data": {
#     "id": "acc_abc123",              <── save this ID
#     "account_number": "8472910346",
#     "name": "Primary Operations Account",
#     "type": "bank",
#     "status": "active",
#     "balance": 10000.00,
#     "currency": "USD"
#   }
# }`} />

          <CodeBlock lang="bash" title="List all accounts" code={`curl https://api.mudracore.dev/api/v1/accounts \\
  -H "Authorization: Bearer $MUDRA_TOKEN"

# Returns all accounts with live computed balances`} />

          <Callout type="info">
            The <strong>initial_balance</strong> field automatically creates a deposit journal entry — debiting your account and crediting the system equity account. This keeps your ledger balanced from day one.
          </Callout>
        </Step>

        {/* ── STEP 3: LINK ACCOUNTS ── */}
        <Step n={3} total={TOTAL_STEPS} id="step-link" icon={Wallet} color="bg-violet-600"
          label="Link external accounts" subtitle="Connect accounts from any provider — banks, digital wallets, crypto exchanges, and payment processors — into a single unified view.">

          <p className="text-slate-500 text-sm leading-relaxed mb-5">
            MudraCore aggregates accounts from every major provider. Each connected account is a real ledger account — meaning it participates in transfers, appears in the trial balance, and has a full transaction history.
          </p>

          {/* Provider grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {PROVIDERS.map(p => (
              <div key={p.key} className={`flex items-center gap-2.5 p-3 rounded-xl border ${p.bg} ${accountsSeeded ? 'opacity-100' : 'opacity-60'} transition-opacity`}>
                <span className="text-xl flex-shrink-0">{p.emoji}</span>
                <div className="min-w-0">
                  <p className={`text-xs font-bold ${p.text}`}>{p.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{p.type}</p>
                  {accountsSeeded && <p className="text-[10px] font-semibold text-slate-600 mt-0.5">{p.balance}</p>}
                </div>
                {accountsSeeded && <CheckCircle2 className="w-3.5 h-3.5 text-secondary flex-shrink-0 ml-auto" />}
              </div>
            ))}
          </div>

          <CodeBlock lang="bash" title="Seed all 8 provider accounts at once (idempotent)" code={`curl -X POST https://api.mudracore.dev/api/v1/accounts/seed-demo \\
  -H "Authorization: Bearer $MUDRA_TOKEN"

# Response:
# {
#   "success": true,
#   "message": "Seeded 8 demo accounts (0 already existed)",
#   "created": 8,
#   "skipped": 0
# }
#
# Calling this again is safe — it skips any accounts that already exist.`} />

          <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-premium mb-4">
            <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-secondary" /> Or create provider accounts individually
            </h3>
            <CodeBlock lang="bash" title="" code={`# Connect a specific provider account
curl -X POST https://api.mudracore.dev/api/v1/accounts \\
  -H "Authorization: Bearer $MUDRA_TOKEN" \\
  -H 'Content-Type: application/json' \\
  -d '{
    "type": "revolut",
    "name": "Revolut Business Account",
    "description": "EUR operations account",
    "currency": "USD",
    "initial_balance": 5000.00
  }'

# Supported provider types:
# Fiat:   revolut, paypal, wise, chase, stripe
# Crypto: coinbase, metamask, binance`} />
          </div>

          <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-violet-800 mb-1">OAuth connection flow — coming soon</p>
                <p className="text-xs text-violet-600 leading-relaxed">
                  The current API creates ledger accounts that represent external accounts. The full OAuth-based real-time sync (Plaid-style) is on the roadmap — when live, account balances will update automatically from the provider's API. The account structure you set up today is 100% forward-compatible.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setAccountsSeeded(true)}
            className={`mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${accountsSeeded ? 'bg-accent/10 text-secondary border border-accent/20 cursor-default' : 'bg-primary text-white hover:shadow-lg hover:shadow-primary/20 active:scale-95'}`}
          >
            {accountsSeeded ? <><CheckCircle2 className="w-4 h-4" /> Accounts seeded</> : <><Play className="w-4 h-4" /> Preview seed result above</>}
          </button>
        </Step>

        {/* ── STEP 4: KYC ── */}
        <Step n={4} total={TOTAL_STEPS} id="step-kyc" icon={Eye} color="bg-pink-600"
          label="Configure KYC & compliance" subtitle="Identity verification for 30+ countries with document scanning, biometric checks, and risk scoring — powered by Didit.">

          <div className="grid md:grid-cols-2 gap-4 mb-5">
            {[
              { icon: Globe, title: '30+ Countries', desc: 'Jurisdiction-specific document requirements. US, UK, EU, India, Brazil, and more — each with required doc types pre-configured.' },
              { icon: Shield, title: 'Risk Scoring', desc: 'Every verification gets a 0–100 risk score with factor breakdown: document authenticity, geographic risk, PEP/sanctions screening.' },
              { icon: Eye, title: 'Biometric Check', desc: 'Liveness detection and face matching via Didit SDK. API-first — no vendor lock-in for document capture.' },
              { icon: CheckCircle2, title: 'Audit Trail', desc: 'Full audit log of all verification attempts, decisions, and document submissions stored per user ID.' },
            ].map(f => (
              <div key={f.title} className="flex gap-3 bg-white border border-outline-variant rounded-xl p-4 shadow-premium">
                <f.icon className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-primary mb-1">{f.title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-premium mb-4">
            <h3 className="text-sm font-bold text-primary mb-3">1. Check supported countries & document types</h3>
            <CodeBlock lang="bash" code={`curl https://api.mudracore.dev/api/kyc/countries

# Returns:
# {
#   "countries": [
#     {
#       "country": "United States",
#       "documents": ["passport", "drivers_license", "id_card"],
#       "description": "USA — federal and state-issued IDs"
#     },
#     {
#       "country": "United Kingdom",
#       "documents": ["passport", "drivers_license"]
#     },
#     ... 28 more countries
#   ],
#   "total": 30
# }`} />
          </div>

          <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-premium mb-4">
            <h3 className="text-sm font-bold text-primary mb-1">2. Start a KYC session for your user</h3>
            <p className="text-xs text-slate-500 mb-3">This endpoint is public — call it from your onboarding flow before the user is authenticated.</p>

            <div className="flex gap-2 mb-3">
              {['United States', 'United Kingdom', 'India', 'Brazil'].map(c => (
                <button key={c} onClick={() => setKycCountry(c)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg font-medium border transition-all ${kycCountry === c ? 'bg-primary text-white border-primary' : 'bg-surface border-outline-variant text-slate-500 hover:border-primary/30'}`}>
                  {c.split(' ')[0]}
                </button>
              ))}
            </div>

            <CodeBlock lang="bash" code={`curl -X POST https://api.mudracore.dev/api/kyc/start \\
  -H 'Content-Type: application/json' \\
  -d '{
    "country": "${kycCountry}",
    "name": "Jane Doe",
    "email": "jane@yourcompany.com",
    "phone": "+1234567890",
    "location": "New York, NY",
    "amount": 10000
  }'

# Response:
# {
#   "user_id": "usr_kyc_123",
#   "status": "pending",
#   "progress": 0,
#   "documents": {
#     "passport": { "status": "pending" },
#     "drivers_license": { "status": "pending" }
#   },
#   "next_steps": ["Upload passport", "Complete biometric check"]
# }`} />
          </div>

          <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-premium mb-4">
            <h3 className="text-sm font-bold text-primary mb-1">3. Submit a document for verification</h3>
            <CodeBlock lang="bash" code={`curl -X POST https://api.mudracore.dev/api/kyc/verify/passport \\
  -H 'Content-Type: application/json' \\
  -d '{
    "document_type": "passport",
    "document_number": "P12345678",
    "country": "US"
  }'

# Response:
# {
#   "status": "verified",
#   "valid": true,
#   "details": {
#     "full_name": "Jane Doe",
#     "date_of_birth": "1990-01-15",
#     "nationality": "US"
#   }
# }`} />
          </div>

          <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-premium">
            <h3 className="text-sm font-bold text-primary mb-1">4. Monitor KYC status dashboard</h3>
            <CodeBlock lang="bash" code={`curl https://api.mudracore.dev/api/kyc/dashboard \\
  -H "Authorization: Bearer $MUDRA_TOKEN"

# Returns all submissions with status, progress %, and risk scores`} />
          </div>
        </Step>

        {/* ── STEP 5: PAYMENTS ── */}
        <Step n={5} total={TOTAL_STEPS} id="step-payments" icon={ArrowLeftRight} color="bg-secondary"
          label="Send your first payment" subtitle="The engine auto-selects the cheapest available rail, deducts the principal + fee from the sender, and creates balanced journal entries automatically.">

          <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-premium mb-5">
            <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> How rail selection works
            </h3>
            <div className="space-y-2">
              {[
                { rank: 1, rail: 'Solana / USDC on SOL', fee: '$0.00025', time: '<1 second', tag: 'CHEAPEST', tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                { rank: 2, rail: 'Lightning Network',    fee: '~$0.001',  time: '<1 second', tag: 'FASTEST', tagColor: 'bg-amber-50 text-amber-700 border-amber-200' },
                { rank: 3, rail: 'RTP / FedNow',         fee: '$0.045',   time: 'Instant',   tag: 'FIAT',   tagColor: 'bg-blue-50 text-blue-700 border-blue-200' },
                { rank: 4, rail: 'SWIFT',                fee: '$2 flat',  time: '~60s',      tag: 'GLOBAL', tagColor: 'bg-slate-50 text-slate-600 border-slate-200' },
                { rank: 5, rail: 'UPI',                  fee: '$5 flat',  time: '~1s',       tag: 'INDIA',  tagColor: 'bg-orange-50 text-orange-700 border-orange-200' },
              ].map(r => (
                <div key={r.rank} className="flex items-center gap-3 bg-surface rounded-xl px-3 py-2.5">
                  <span className="text-[10px] font-bold text-slate-300 w-4">#{r.rank}</span>
                  <span className="text-xs font-medium text-primary flex-1">{r.rail}</span>
                  <span className="text-xs font-mono text-slate-500">{r.fee}</span>
                  <span className="text-xs text-slate-400">{r.time}</span>
                  <span className={`text-[9px] font-bold border rounded-full px-2 py-0.5 ${r.tagColor}`}>{r.tag}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
              <Info className="w-3 h-3" /> Rail auto-selection is based on amount, currency, and geography. 19 rails total available.
            </p>
          </div>

          <CodeBlock lang="bash" title="Send a payment" code={`curl -X POST https://api.mudracore.dev/api/v1/payments \\
  -H "Authorization: Bearer $MUDRA_TOKEN" \\
  -H 'Content-Type: application/json' \\
  -d '{
    "from_account_id": "acc_from_123",
    "to_account_id":   "acc_to_456",
    "amount": 100.00,
    "currency": "USD",
    "description": "Invoice payment #INV-001"
  }'

# Response:
# {
#   "success": true,
#   "data": {
#     "transaction": {
#       "id": "txn_xyz789",
#       "type": "transfer",
#       "status": "posted",
#       "total_amount": 100.00,
#       "fee": 2.00,             <── deducted from sender
#       "rail": "SWIFT",         <── auto-selected
#       "currency": "USD"
#     },
#     "rail": "SWIFT",
#     "fee": 2.00,
#     "fx_rate": 1.0,
#     "latency": "60s"
#   }
# }
#
# What happened in the ledger:
#   Debit  recipient account  +$100
#   Credit sender account     -$100
#   Debit  sender account     -$2    (fee)
#   Credit SYSTEM-FEE Revenue +$2    (fee)`} />

          <div className="grid md:grid-cols-3 gap-3">
            {[
              { label: 'Sender loses', value: '$102', sub: '$100 + $2 fee', color: 'text-red-600' },
              { label: 'Recipient gains', value: '$100', sub: 'Principal only', color: 'text-emerald-600' },
              { label: 'Ledger balanced', value: '✓', sub: 'Always', color: 'text-secondary' },
            ].map(s => (
              <div key={s.label} className="bg-white border border-outline-variant rounded-xl p-4 text-center shadow-premium">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs font-semibold text-primary mt-1">{s.label}</p>
                <p className="text-[10px] text-slate-400">{s.sub}</p>
              </div>
            ))}
          </div>
        </Step>

        {/* ── STEP 6: LEDGER ── */}
        <Step n={6} total={TOTAL_STEPS} id="step-ledger" icon={Database} color="bg-orange-500"
          label="Inspect your ledger" subtitle="Every transaction creates balanced double-entry journal entries. View the trial balance, chart of accounts, and account statements at any time.">

          <div className="grid md:grid-cols-2 gap-4 mb-5">
            {[
              { icon: Layers, title: 'Trial Balance', desc: 'Verify that total debits equal total credits across all accounts at any point in time.' },
              { icon: FileText, title: 'Account Statements', desc: 'Full transaction history per account with opening balance, movements, and closing balance.' },
              { icon: BarChart2, title: 'Chart of Accounts', desc: 'Structured view of all accounts grouped by type: assets, liabilities, equity, revenue, expenses.' },
              { icon: Database, title: 'Journal Entries', desc: 'Raw double-entry journal entries for every transaction — the gold standard audit trail.' },
            ].map(f => (
              <div key={f.title} className="flex gap-3 bg-white border border-outline-variant rounded-xl p-4 shadow-premium">
                <f.icon className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-primary mb-0.5">{f.title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <CodeBlock lang="bash" title="Get trial balance" code={`curl https://api.mudracore.dev/api/ledger/trial-balance \\
  -H "Authorization: Bearer $MUDRA_TOKEN"

# {
#   "trial_balance": [
#     { "account_name": "Primary Operations", "type": "bank",    "debit_balance": 9898.00, "credit_balance": 0 },
#     { "account_name": "Revolut Account",    "type": "bank",    "debit_balance": 1200.00, "credit_balance": 0 },
#     { "account_name": "Coinbase Wallet",    "type": "invest",  "debit_balance": 2100.00, "credit_balance": 0 },
#     { "account_name": "SYSTEM-FEE Revenue", "type": "revenue", "debit_balance": 0,       "credit_balance": 2.00 }
#   ],
#   "total_debits": 13198.00,
#   "total_credits": 13198.00,
#   "is_balanced": true     <── always true if MudraCore is handling transactions
# }`} />

          <CodeBlock lang="bash" title="Get chart of accounts" code={`curl https://api.mudracore.dev/api/ledger/chart-of-accounts \\
  -H "Authorization: Bearer $MUDRA_TOKEN"

# Returns accounts grouped by: assets, liabilities, equity, revenue, expenses`} />

          <CodeBlock lang="bash" title="Get account transactions" code={`curl https://api.mudracore.dev/api/v1/transactions \\
  -H "Authorization: Bearer $MUDRA_TOKEN"

# Returns all transactions with fee, rail, and status fields`} />
        </Step>

        {/* ── WHAT'S NEXT ── */}
        <section id="whats-next">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3 text-xs font-semibold tracking-widest uppercase"
              style={{ background: 'rgba(0,255,148,0.08)', border: '1px solid rgba(0,255,148,0.20)', color: '#006d43' }}>
              <Star className="h-3 w-3" /> You're ready to build
            </div>
            <h2 className="text-3xl font-black text-primary mb-2">What's next</h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto">Explore the full platform capabilities or integrate directly with your stack.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {[
              {
                icon: Terminal, label: 'API Explorer', desc: 'Test all 32 endpoints live in your browser — with real responses and code generation.',
                href: '/developers/api-explorer', cta: 'Open Explorer', color: 'bg-primary', textColor: 'text-white', border: '',
              },
              {
                icon: ArrowLeftRight, label: 'Payment Rails', desc: 'Try multi-rail transfers and watch the Rail Cost Intelligence panel select the optimal path.',
                href: '/payments', cta: 'Try Payments', color: 'bg-secondary', textColor: 'text-white', border: '',
              },
              {
                icon: Eye, label: 'KYC Dashboard', desc: 'View all identity verification submissions and their current status.',
                href: '/kyc/dashboard', cta: 'Open KYC', color: 'bg-white', textColor: 'text-primary', border: 'border border-outline-variant shadow-premium',
              },
            ].map(c => (
              <Link key={c.label} to={c.href}
                className={`flex flex-col p-5 rounded-2xl group transition-all hover:-translate-y-0.5 hover:shadow-lg ${c.color} ${c.border}`}>
                <c.icon className={`w-6 h-6 mb-3 ${c.textColor === 'text-white' ? 'text-white/70' : 'text-secondary'}`} />
                <p className={`text-base font-bold mb-1 ${c.textColor}`}>{c.label}</p>
                <p className={`text-xs leading-relaxed mb-4 flex-1 ${c.textColor === 'text-white' ? 'text-white/60' : 'text-slate-500'}`}>{c.desc}</p>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold ${c.textColor === 'text-white' ? 'text-white/80' : 'text-secondary'} group-hover:gap-2 transition-all`}>
                  {c.cta} <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>

          {/* Feature matrix */}
          <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-premium mb-6">
            <h3 className="text-sm font-bold text-primary mb-4">Full platform capabilities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { icon: Database, label: 'Double-Entry Ledger', status: 'Live' },
                { icon: ArrowLeftRight, label: '19 Payment Rails', status: 'Live' },
                { icon: Eye, label: 'KYC — 30+ Countries', status: 'Live' },
                { icon: Globe, label: 'Live FX Rates', status: 'Live' },
                { icon: BarChart2, label: 'Crypto Prices', status: 'Live' },
                { icon: Wallet, label: 'Account Aggregation', status: 'Live' },
                { icon: Zap, label: 'gRPC Streaming', status: 'Live' },
                { icon: Activity, label: 'Transaction History', status: 'Live' },
                { icon: Shield, label: 'JWT Auth + RBAC', status: 'Live' },
                { icon: Globe, label: 'Currency Conversion', status: 'Live' },
                { icon: Layers, label: 'Trial Balance', status: 'Live' },
                { icon: ArrowLeftRight, label: 'OAuth Account Link', status: 'Roadmap' },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-2.5 bg-surface rounded-xl px-3 py-2.5">
                  <f.icon className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                  <span className="text-xs text-slate-600 flex-1">{f.label}</span>
                  <span className={`text-[9px] font-bold rounded-full px-1.5 py-0.5 ${f.status === 'Live' ? 'bg-accent/10 text-secondary' : 'bg-slate-100 text-slate-400'}`}>
                    {f.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="bg-primary rounded-2xl p-8 text-center">
            <Lock className="w-8 h-8 text-accent mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">You have the full fintech stack.</h3>
            <p className="text-slate-400 text-sm mb-5 max-w-md mx-auto">
              Everything a fintech company needs — ledger, payments, KYC, market data, account aggregation — unified in one API. Ship your product, not infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/developers/api-explorer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-primary font-bold rounded-xl hover:shadow-glow active:scale-95 transition-all text-sm">
                <Terminal className="w-4 h-4" /> Explore All APIs
              </Link>
              <Link to="/developers"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 active:scale-95 transition-all text-sm">
                Read Full Docs <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default QuickStartPage;
