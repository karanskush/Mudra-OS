import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Copy, Check, ExternalLink, Hash,
  Rocket, Shield, CreditCard, BookOpen, Zap, Code2,
  ArrowRight, Terminal, Globe, Clock, Lock, AlertCircle,
  Info, CheckCircle2, Database, Layers, BarChart2, Eye,
  History, HelpCircle, Mail, Github, FileText, ChevronDown,
  Activity,
} from 'lucide-react';
import Navbar from '../Navbar';

// ─── Types ───────────────────────────────────────────────────────────────────

interface NavSection {
  id: string;
  label: string;
  icon?: React.ElementType;
  children?: { id: string; label: string }[];
}

// ─── Sidebar structure ────────────────────────────────────────────────────────

const NAV: NavSection[] = [
  {
    id: 'getting-started', label: 'Getting Started', icon: Rocket,
    children: [
      { id: 'introduction',    label: 'Introduction' },
      { id: 'quickstart',      label: 'Quick Start' },
      { id: 'authentication',  label: 'Authentication' },
    ],
  },
  {
    id: 'rest-api', label: 'REST APIs', icon: Globe,
    children: [
      { id: 'api-overview',    label: 'Overview' },
      { id: 'accounts-api',    label: 'Accounts' },
      { id: 'payments-api',    label: 'Payments' },
      { id: 'ledger-api',      label: 'Ledger' },
      { id: 'kyc-api',         label: 'KYC' },
      { id: 'market-api',      label: 'Market Data' },
    ],
  },
  {
    id: 'grpc', label: 'gRPC & Streaming', icon: Zap,
    children: [
      { id: 'grpc-overview',   label: 'Overview' },
      { id: 'grpc-quickstart', label: 'Quick Start' },
      { id: 'grpc-streaming',  label: 'Streaming APIs' },
      { id: 'grpc-examples',   label: 'Code Examples' },
    ],
  },
  {
    id: 'sdk', label: 'SDKs & Examples', icon: Code2,
    children: [
      { id: 'sdk-typescript',  label: 'TypeScript' },
      { id: 'sdk-go',          label: 'Go' },
      { id: 'sdk-python',      label: 'Python' },
    ],
  },
  {
    id: 'resources', label: 'Resources', icon: BookOpen,
    children: [
      { id: 'webhooks',        label: 'Webhooks' },
      { id: 'error-codes',     label: 'Error Codes' },
      { id: 'rate-limits',     label: 'Rate Limits' },
      { id: 'changelog',       label: 'Changelog' },
      { id: 'support',         label: 'Support & FAQ' },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

const Code: React.FC<{ children: string; lang?: string }> = ({ children, lang }) => (
  <div className="my-4 rounded-xl overflow-hidden border border-slate-700">
    <div className="flex items-center justify-between px-4 py-2 bg-primary border-b border-slate-700">
      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">{lang ?? 'code'}</span>
      <CopyBtn text={children} />
    </div>
    <pre className="bg-[#0d1424] p-4 overflow-x-auto">
      <code className="text-sm font-mono text-slate-300 leading-relaxed whitespace-pre">{children}</code>
    </pre>
  </div>
);

const Callout: React.FC<{ type?: 'info' | 'warn' | 'tip' | 'danger'; children: React.ReactNode }> = ({ type = 'info', children }) => {
  const styles = {
    info:   { bg: 'bg-blue-50 border-blue-200',    icon: Info,         iconCls: 'text-blue-500',   text: 'text-blue-800' },
    warn:   { bg: 'bg-amber-50 border-amber-200',  icon: AlertCircle,  iconCls: 'text-amber-500',  text: 'text-amber-800' },
    tip:    { bg: 'bg-accent/8 border-accent/20',  icon: CheckCircle2, iconCls: 'text-secondary',  text: 'text-secondary' },
    danger: { bg: 'bg-red-50 border-red-200',      icon: AlertCircle,  iconCls: 'text-red-500',    text: 'text-red-800' },
  }[type];
  const Icon = styles.icon;
  return (
    <div className={`flex gap-3 p-4 rounded-xl border my-4 ${styles.bg}`}>
      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${styles.iconCls}`} />
      <div className={`text-sm leading-relaxed ${styles.text}`}>{children}</div>
    </div>
  );
};

const SectionHeading: React.FC<{ id: string; level?: 2 | 3; children: React.ReactNode }> = ({ id, level = 2, children }) => {
  const Tag = `h${level}` as 'h2' | 'h3';
  const cls = level === 2
    ? 'text-2xl font-bold text-primary mt-12 mb-4 flex items-center gap-2 group'
    : 'text-lg font-semibold text-primary mt-8 mb-3 flex items-center gap-2 group';
  return (
    <Tag id={id} className={cls}>
      {children}
      <a href={`#${id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
        <Hash className="w-4 h-4 text-slate-300" />
      </a>
    </Tag>
  );
};

const Table: React.FC<{ headers: string[]; rows: (string | React.ReactNode)[][] }> = ({ headers, rows }) => (
  <div className="my-4 rounded-xl border border-outline-variant overflow-hidden">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-surface border-b border-outline-variant">
          {headers.map(h => (
            <th key={h} className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-4 py-3">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-outline-variant bg-white">
        {rows.map((row, i) => (
          <tr key={i} className="hover:bg-surface transition-colors">
            {row.map((cell, j) => (
              <td key={j} className="px-4 py-2.5 text-slate-600">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const MethodBadge: React.FC<{ m: string }> = ({ m }) => {
  const c: Record<string, string> = {
    GET: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    POST: 'bg-blue-50 text-blue-700 border-blue-200',
    PUT: 'bg-amber-50 text-amber-700 border-amber-200',
    DELETE: 'bg-red-50 text-red-700 border-red-200',
  };
  return <span className={`inline font-mono font-bold text-xs px-1.5 py-0.5 rounded border ${c[m] ?? 'bg-slate-50 text-slate-700 border-slate-200'}`}>{m}</span>;
};

// ─── Main component ───────────────────────────────────────────────────────────

const DevelopersPage: React.FC = () => {
  const [activeId, setActiveId] = useState('introduction');
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(NAV.map(n => n.id)));
  const contentRef = useRef<HTMLDivElement>(null);

  // Intersection observer to track active section
  useEffect(() => {
    const allIds = NAV.flatMap(g => g.children?.map(c => c.id) ?? []);
    const observers: IntersectionObserver[] = [];
    allIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(id); },
        { rootMargin: '-20% 0px -70% 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveId(id);
  }, []);

  const toggleGroup = (id: string) =>
    setOpenGroups(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <div className="flex pt-[80px]">

      {/* ════ LEFT SIDEBAR ════ */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-outline-variant self-start sticky top-[80px] max-h-[calc(100vh-80px)] overflow-y-auto">
        <div className="px-4 py-5 border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-accent" />
            </div>
            <div>
              <p className="text-xs font-bold text-primary">Documentation</p>
              <p className="text-[10px] text-slate-400">MudraCore OS · v2.1</p>
            </div>
          </div>
        </div>

        <nav className="py-3">
          {NAV.map(group => {
            const Icon = group.icon;
            const isOpen = openGroups.has(group.id);
            return (
              <div key={group.id} className="mb-1">
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{group.label}</span>
                  </div>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
                </button>
                {isOpen && group.children && (
                  <div className="pb-1">
                    {group.children.map(child => (
                      <button
                        key={child.id}
                        onClick={() => scrollTo(child.id)}
                        className={`w-full text-left pl-9 pr-4 py-1.5 text-xs font-medium transition-all ${
                          activeId === child.id
                            ? 'text-secondary border-r-2 border-accent bg-accent/5'
                            : 'text-slate-500 hover:text-primary hover:bg-slate-50'
                        }`}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* API Explorer CTA */}
        <div className="mx-4 mb-4 mt-2">
          <Link
            to="/developers/api-explorer"
            className="flex items-center gap-2 px-3 py-2.5 bg-primary rounded-xl text-white text-xs font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all group"
          >
            <Terminal className="w-3.5 h-3.5 text-accent" />
            <span>Open API Explorer</span>
            <ArrowRight className="w-3 h-3 ml-auto group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </aside>

      {/* ════ MAIN CONTENT ════ */}
      <div ref={contentRef} className="flex-1 min-w-0">
        <article className="max-w-3xl mx-auto px-8 py-12 pb-32">

          {/* ── INTRODUCTION ─────────────────────────────────────────── */}
          <div id="introduction">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 text-xs font-semibold tracking-widest uppercase"
              style={{ background: 'rgba(0,255,148,0.08)', border: '1px solid rgba(0,255,148,0.20)', color: '#006d43' }}>
              <Code2 className="h-3 w-3" /> MudraCore OS
            </div>
            <h1 className="text-4xl font-black text-primary mb-4 leading-tight">
              Developer Documentation
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed mb-6">
              MudraCore OS is a full-stack fintech infrastructure platform — double-entry ledger, multi-rail payment orchestration, KYC compliance, and live market data — all exposed via REST and gRPC APIs.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {[
                { label: 'REST Endpoints', value: '32+', icon: Globe, color: 'text-secondary' },
                { label: 'gRPC Services',  value: '3',   icon: Zap,   color: 'text-purple-600' },
                { label: 'Payment Rails',  value: '19',  icon: CreditCard, color: 'text-amber-600' },
                { label: 'Avg Latency',    value: '<50ms', icon: Clock, color: 'text-blue-600' },
              ].map(s => (
                <div key={s.label} className="bg-white border border-outline-variant rounded-xl p-3 shadow-premium">
                  <s.icon className={`w-4 h-4 ${s.color} mb-1.5`} />
                  <p className="text-lg font-bold text-primary">{s.value}</p>
                  <p className="text-[10px] text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-2">
              {[
                { icon: Shield,   title: 'JWT Auth',          desc: 'Secure token-based authentication with role-based access control.' },
                { icon: Layers,   title: 'Double-Entry Ledger',desc: 'GAAP-compliant accounting with full audit trail and trial balance.' },
                { icon: Activity, title: 'Real-time Streaming',desc: 'Bidirectional gRPC streams for live payments, webhooks, and reconciliation.' },
              ].map(f => (
                <div key={f.title} className="bg-white border border-outline-variant rounded-xl p-4 shadow-premium">
                  <f.icon className="w-5 h-5 text-secondary mb-2" />
                  <p className="text-sm font-semibold text-primary mb-1">{f.title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── QUICK START ──────────────────────────────────────────── */}
          <SectionHeading id="quickstart"><Rocket className="w-5 h-5 text-secondary" /> Quick Start</SectionHeading>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">Get your first payment sent in under 5 minutes.</p>

          {[
            {
              step: 1, title: 'Register & Login',
              desc: 'Create an account and obtain a JWT token.',
              code: `curl -X POST https://api.mudracore.dev/api/v1/auth/register \\
  -H 'Content-Type: application/json' \\
  -d '{"email":"you@example.com","password":"SecurePass!","first_name":"Jane","last_name":"Doe"}'

# Save the token from the response:
TOKEN="eyJhbGciOiJIUzI1NiJ9..."`, lang: 'bash',
            },
            {
              step: 2, title: 'Seed Demo Accounts',
              desc: 'Creates 8 pre-connected accounts (Revolut, PayPal, Coinbase, etc.) in one call.',
              code: `curl -X POST https://api.mudracore.dev/api/v1/accounts/seed-demo \\
  -H "Authorization: Bearer $TOKEN"

# Lists your accounts to get their IDs:
curl https://api.mudracore.dev/api/v1/accounts \\
  -H "Authorization: Bearer $TOKEN"`, lang: 'bash',
            },
            {
              step: 3, title: 'Send a Payment',
              desc: 'The engine auto-selects the cheapest rail, deducts principal + fee, and returns full cost intelligence.',
              code: `curl -X POST https://api.mudracore.dev/api/v1/payments \\
  -H "Authorization: Bearer $TOKEN" \\
  -H 'Content-Type: application/json' \\
  -d '{
    "from_account_id": "<from_id>",
    "to_account_id":   "<to_id>",
    "amount": 100,
    "currency": "USD",
    "description": "First payment"
  }'`, lang: 'bash',
            },
            {
              step: 4, title: 'Inspect Transaction History',
              desc: 'View all transfers with rail used, fee deducted, and settlement time.',
              code: `curl https://api.mudracore.dev/api/v1/transactions \\
  -H "Authorization: Bearer $TOKEN"`, lang: 'bash',
            },
          ].map(s => (
            <div key={s.step} className="flex gap-4 mb-2">
              <div className="flex-shrink-0 mt-1">
                <div className="w-7 h-7 rounded-full bg-primary text-accent font-bold text-xs flex items-center justify-center">{s.step}</div>
              </div>
              <div className="flex-1 pb-6 border-l border-outline-variant pl-4 -ml-3.5">
                <p className="text-sm font-semibold text-primary">{s.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 mb-1">{s.desc}</p>
                <Code lang={s.lang}>{s.code}</Code>
              </div>
            </div>
          ))}

          {/* ── AUTHENTICATION ──────────────────────────────────────── */}
          <SectionHeading id="authentication"><Shield className="w-5 h-5 text-blue-500" /> Authentication</SectionHeading>
          <p className="text-slate-500 text-sm leading-relaxed mb-4">
            MudraCore uses <strong>JWT Bearer tokens</strong>. Tokens are issued on registration and login, and must be included in every protected request.
          </p>
          <Callout type="tip">
            Token lifetime is <strong>30 days</strong> by default. Refresh by calling <code className="font-mono text-xs bg-accent/10 px-1 rounded">POST /api/v1/auth/login</code> again before expiry.
          </Callout>
          <SectionHeading id="auth-header" level={3}>Authorization Header</SectionHeading>
          <Code lang="http">{`Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfYWJjMTIzIiwiZXhwIjoxNzYzODQ1NjAwfQ.sig`}</Code>

          <SectionHeading id="auth-endpoints" level={3}>Auth Endpoints</SectionHeading>
          <Table
            headers={['Method', 'Path', 'Auth', 'Description']}
            rows={[
              [<MethodBadge m="POST" />, <code className="font-mono text-xs">/api/v1/auth/register</code>, 'No', 'Create a new account'],
              [<MethodBadge m="POST" />, <code className="font-mono text-xs">/api/v1/auth/login</code>, 'No', 'Login and receive JWT'],
              [<MethodBadge m="POST" />, <code className="font-mono text-xs">/api/v1/auth/logout</code>, 'Yes', 'Invalidate session'],
              [<MethodBadge m="GET" />, <code className="font-mono text-xs">/api/v1/me</code>, 'Yes', 'Get current user profile'],
            ]}
          />

          {/* ── REST API OVERVIEW ────────────────────────────────────── */}
          <SectionHeading id="api-overview"><Globe className="w-5 h-5 text-secondary" /> REST API Overview</SectionHeading>
          <p className="text-slate-500 text-sm leading-relaxed mb-4">
            All REST endpoints follow a consistent JSON response envelope, versioned under <code className="font-mono text-xs bg-slate-100 px-1 rounded">/api/v1/</code>.
          </p>
          <Code lang="json">{`// Successful response envelope
{
  "success": true,
  "data": { ... },
  "count": 10          // present on list endpoints
}

// Error envelope
{
  "success": false,
  "error": "insufficient balance: available 50.00, requested 102.00 (incl. 2.00 SWIFT fee)"
}`}</Code>
          <Callout type="info">
            The interactive <Link to="/developers/api-explorer" className="font-semibold underline decoration-accent/60 hover:text-secondary">API Explorer</Link> lets you make live requests against all 32 endpoints directly in your browser.
          </Callout>

          {/* ── ACCOUNTS API ─────────────────────────────────────────── */}
          <SectionHeading id="accounts-api"><CreditCard className="w-5 h-5 text-secondary" /> Accounts API</SectionHeading>
          <p className="text-slate-500 text-sm leading-relaxed mb-4">
            Accounts are the foundational ledger primitives. Each account tracks a running balance computed from its debit/credit journal entries.
          </p>
          <Table
            headers={['Method', 'Path', 'Description']}
            rows={[
              [<MethodBadge m="GET" />, <code className="font-mono text-xs">/api/v1/accounts</code>, 'List all accounts with live balances + provider metadata'],
              [<MethodBadge m="POST" />, <code className="font-mono text-xs">/api/v1/accounts</code>, 'Create an account (type: checking, savings, investment, credit)'],
              [<MethodBadge m="GET" />, <code className="font-mono text-xs">/api/v1/accounts/{'{id}'}</code>, 'Get a single account by ID'],
              [<MethodBadge m="POST" />, <code className="font-mono text-xs">/api/v1/accounts/seed-demo</code>, 'Idempotent: create 8 pre-connected dummy provider accounts'],
            ]}
          />
          <SectionHeading id="account-types" level={3}>Account Types</SectionHeading>
          <Table
            headers={['Type', 'Ledger Class', 'Balance Direction', 'Example Providers']}
            rows={[
              ['checking / savings', 'bank (asset)', 'Debit increases', 'Chase, Revolut, Wise'],
              ['investment', 'investment (asset)', 'Debit increases', 'Coinbase, MetaMask, Binance'],
              ['credit', 'liability', 'Credit increases', 'Stripe, PayPal'],
            ]}
          />

          {/* ── PAYMENTS API ─────────────────────────────────────────── */}
          <SectionHeading id="payments-api"><CreditCard className="w-5 h-5 text-amber-500" /> Payments API</SectionHeading>
          <p className="text-slate-500 text-sm leading-relaxed mb-4">
            The payment engine auto-selects the cheapest rail, creates two balanced journal entries (principal + fee), and returns full cost intelligence.
          </p>
          <Callout type="warn">
            The sender must have a balance of at least <strong>amount + fee</strong>. If the balance is insufficient, a 400 error is returned with the exact shortfall.
          </Callout>

          <SectionHeading id="rail-selection" level={3}>Rail Selection Logic</SectionHeading>
          <Table
            headers={['Rail', 'Fee', 'Settlement', 'Category']}
            rows={[
              ['Solana', '$0.00025 flat', '<1 second', 'Crypto'],
              ['USDC/SOL', '$0.00025 flat', '<1 second', 'Crypto'],
              ['Lightning', '$0.001 + 0.01%', '<1 second', 'Crypto'],
              ['FedNow', '$0.045 flat', 'Instant', 'Fiat'],
              ['RTP', '$0.045 flat', '<30 seconds', 'Fiat'],
              ['ACH Standard', '$0.25 flat', '1–3 days', 'Fiat'],
              ['SWIFT', '$2 flat', '~60 seconds', 'Fiat'],
              ['UPI', '$5 flat', '~1 second', 'Fiat'],
              ['Ethereum', '$5 flat', '~15 seconds', 'Crypto'],
            ]}
          />

          <SectionHeading id="payment-response" level={3}>Payment Response</SectionHeading>
          <Code lang="json">{`{
  "success": true,
  "data": {
    "transaction": {
      "id": "txn_abc123",
      "type": "transfer",
      "status": "posted",
      "total_amount": 100.00,
      "fee": 2.00,
      "rail": "SWIFT",
      "currency": "USD",
      "timestamp": "2026-04-14T10:30:00Z"
    },
    "rail": "SWIFT",
    "fee": 2.00,
    "fx_rate": 1.0,
    "latency": "60s"
  }
}`}</Code>

          {/* ── LEDGER API ───────────────────────────────────────────── */}
          <SectionHeading id="ledger-api"><Database className="w-5 h-5 text-orange-500" /> Ledger API</SectionHeading>
          <p className="text-slate-500 text-sm leading-relaxed mb-4">
            The ledger system implements <strong>double-entry bookkeeping</strong>. Every transaction creates balanced journal entries — for every debit there is an equal credit.
          </p>

          <SectionHeading id="double-entry" level={3}>Double-Entry Model</SectionHeading>
          <Code lang="text">{`Transfer $100 via SWIFT (fee = $2):

  Entry 1 — Transfer
    Debit:   Recipient account   +$100
    Credit:  Sender account      -$100

  Entry 2 — Fee
    Debit:   Sender account      -$2
    Credit:  SYSTEM-FEE Revenue  +$2

  Net change: Sender -$102, Recipient +$100, Fee Revenue +$2
  Ledger is balanced ✓`}</Code>

          <Table
            headers={['Method', 'Path', 'Description']}
            rows={[
              [<MethodBadge m="GET" />, <code className="font-mono text-xs">/api/ledger/accounts</code>, 'List chart of accounts'],
              [<MethodBadge m="POST" />, <code className="font-mono text-xs">/api/ledger/accounts</code>, 'Create ledger account (asset, liability, revenue, expense)'],
              [<MethodBadge m="GET" />, <code className="font-mono text-xs">/api/ledger/accounts/{'{id}'}/balance</code>, 'Real-time computed balance'],
              [<MethodBadge m="POST" />, <code className="font-mono text-xs">/api/ledger/transactions/transfer</code>, 'Balanced double-entry transfer'],
              [<MethodBadge m="POST" />, <code className="font-mono text-xs">/api/ledger/transactions/deposit</code>, 'Deposit (debit account, credit equity)'],
              [<MethodBadge m="GET" />, <code className="font-mono text-xs">/api/ledger/trial-balance</code>, 'Trial balance with balanced check'],
              [<MethodBadge m="GET" />, <code className="font-mono text-xs">/api/ledger/chart-of-accounts</code>, 'Full chart grouped by type'],
            ]}
          />

          {/* ── KYC API ──────────────────────────────────────────────── */}
          <SectionHeading id="kyc-api"><Eye className="w-5 h-5 text-pink-500" /> KYC API</SectionHeading>
          <p className="text-slate-500 text-sm leading-relaxed mb-4">
            Know Your Customer verification powered by Didit. Supports 30+ countries with document-type requirements per jurisdiction.
          </p>
          <Table
            headers={['Method', 'Path', 'Auth', 'Description']}
            rows={[
              [<MethodBadge m="POST" />, <code className="font-mono text-xs">/api/kyc/start</code>, 'No', 'Start KYC session with country-specific requirements'],
              [<MethodBadge m="GET" />, <code className="font-mono text-xs">/api/kyc/countries</code>, 'No', 'List 30+ supported countries + required documents'],
              [<MethodBadge m="POST" />, <code className="font-mono text-xs">/api/kyc/verify/passport</code>, 'No', 'Submit passport for Didit verification'],
              [<MethodBadge m="GET" />, <code className="font-mono text-xs">/api/kyc/dashboard</code>, 'Yes', 'All KYC submissions + current status'],
            ]}
          />

          {/* ── MARKET DATA API ──────────────────────────────────────── */}
          <SectionHeading id="market-api"><BarChart2 className="w-5 h-5 text-cyan-500" /> Market Data API</SectionHeading>
          <p className="text-slate-500 text-sm leading-relaxed mb-4">
            All market endpoints are <strong>public</strong> (no auth required). FX rates are cached for 5 minutes. Crypto prices are live from CoinGecko.
          </p>
          <Table
            headers={['Method', 'Path', 'Description']}
            rows={[
              [<MethodBadge m="GET" />, <code className="font-mono text-xs">/api/market/fx?base=USD</code>, 'Live FX rates for 15 major currencies'],
              [<MethodBadge m="GET" />, <code className="font-mono text-xs">/api/market/convert?from=USD&to=EUR&amount=100</code>, 'Currency conversion with live rate'],
              [<MethodBadge m="GET" />, <code className="font-mono text-xs">/api/market/crypto</code>, 'Live prices for BTC, ETH, SOL, USDC, USDT'],
            ]}
          />

          {/* ── gRPC OVERVIEW ────────────────────────────────────────── */}
          <SectionHeading id="grpc-overview"><Zap className="w-5 h-5 text-purple-500" /> gRPC Overview</SectionHeading>
          <p className="text-slate-500 text-sm leading-relaxed mb-4">
            All gRPC services are exposed via an HTTP bridge — no gRPC client library required. Send JSON and receive JSON.
          </p>
          <div className="grid md:grid-cols-2 gap-4 my-4">
            {[
              { title: 'Bidirectional Streaming', desc: 'Real-time payment monitoring and webhook debugging with dynamic filters.' },
              { title: 'Type-Safe Protobufs', desc: 'Protocol Buffer definitions ensure strong typing across all languages.' },
              { title: '10× Faster than REST', desc: 'Binary serialization and HTTP/2 multiplexing reduce payload overhead.' },
              { title: 'Multi-Language', desc: 'Auto-generated clients for Go, TypeScript, Python, Java, and more.' },
            ].map(f => (
              <div key={f.title} className="bg-white border border-outline-variant rounded-xl p-4 shadow-premium">
                <p className="text-sm font-semibold text-primary mb-1">{f.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          <SectionHeading id="grpc-quickstart" level={3}>Quick Start</SectionHeading>
          {[
            { n: 1, title: 'Install gRPC Tools', code: `# Go
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

# Node.js
npm install @grpc/grpc-js @grpc/proto-loader`, lang: 'bash' },
            { n: 2, title: 'Download Proto Files', code: `git clone https://github.com/mudracore/fintech-proto.git
cd fintech-proto && ls
# payment.proto  kyc.proto  ledger.proto`, lang: 'bash' },
            { n: 3, title: 'Generate Client', code: `# Go
protoc --go_out=. --go-grpc_out=. payment.proto

# Verify with grpcurl
grpcurl -plaintext localhost:50051 list`, lang: 'bash' },
          ].map(s => (
            <div key={s.n} className="flex gap-3 mb-1">
              <span className="w-6 h-6 flex-shrink-0 mt-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center">{s.n}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-primary">{s.title}</p>
                <Code lang={s.lang}>{s.code}</Code>
              </div>
            </div>
          ))}

          {/* ── gRPC STREAMING ───────────────────────────────────────── */}
          <SectionHeading id="grpc-streaming"><Zap className="w-4 h-4 text-purple-500" /> Streaming APIs</SectionHeading>
          <p className="text-slate-500 text-sm mb-4">Three bidirectional streaming services handle real-time financial workflows.</p>
          {[
            {
              name: 'Transaction Monitor', service: 'PaymentService', method: 'TransactionMonitor',
              desc: 'Stream real-time payment updates with status, amount, and rail filters.',
              code: `const stream = client.transactionMonitor();

stream.write({
  command: {
    start_monitoring: {
      user_id: "user_123",
      status_filter: ["PROCESSING", "COMPLETED"],
      min_amount: 100.0,
      currency_filter: ["USD", "EUR"],
      rail_filter: ["SWIFT", "ACH"]
    }
  }
});

stream.on('data', (response) => {
  if (response.event.payment_update) {
    console.log('Update:', response.event.payment_update);
  }
});`,
            },
            {
              name: 'Webhook Debugger', service: 'WebhookService', method: 'WebhookDebugger',
              desc: 'Live debugging of webhook delivery attempts with full request/response capture.',
              code: `const debug = client.webhookDebugger();

debug.write({
  command: {
    start_debugging: {
      endpoint_url: "https://api.partner.com/webhooks",
      event_types: ["payment.completed", "payment.failed"],
      debug_level: "DETAILED"
    }
  }
});

debug.on('data', (r) => {
  console.log('Delivery:', r.response.delivery_attempt);
});`,
            },
          ].map(api => (
            <div key={api.name} className="mb-6 bg-white border border-outline-variant rounded-2xl p-5 shadow-premium">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-primary">{api.name}</span>
                <span className="text-[10px] bg-purple-50 text-purple-600 border border-purple-200 rounded-full px-2 py-0.5 font-semibold">{api.service}/{api.method}</span>
              </div>
              <p className="text-xs text-slate-500 mb-2">{api.desc}</p>
              <Code lang="javascript">{api.code}</Code>
            </div>
          ))}

          {/* ── gRPC CODE EXAMPLES ───────────────────────────────────── */}
          <SectionHeading id="grpc-examples" level={3}>Multi-Language Examples</SectionHeading>

          {/* ── SDK TypeScript ───────────────────────────────────────── */}
          <SectionHeading id="sdk-typescript"><Code2 className="w-4 h-4 text-blue-500" /> TypeScript</SectionHeading>
          <Code lang="typescript">{`// Install: npm install
import fetch from 'node-fetch';

const BASE = 'https://api.mudracore.dev';

// 1. Login
const { token } = await fetch(\`\${BASE}/api/v1/auth/login\`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'you@example.com', password: 'pass' }),
}).then(r => r.json());

// 2. List accounts
const { data: accounts } = await fetch(\`\${BASE}/api/v1/accounts\`, {
  headers: { Authorization: \`Bearer \${token}\` },
}).then(r => r.json());

// 3. Send payment
const result = await fetch(\`\${BASE}/api/v1/payments\`, {
  method: 'POST',
  headers: { Authorization: \`Bearer \${token}\`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from_account_id: accounts[0].id,
    to_account_id:   accounts[1].id,
    amount: 100,
    currency: 'USD',
    description: 'TypeScript SDK demo',
  }),
}).then(r => r.json());

console.log(\`Rail: \${result.data.rail}, Fee: $\${result.data.fee}\`);`}</Code>

          {/* ── SDK Go ───────────────────────────────────────────────── */}
          <SectionHeading id="sdk-go"><Code2 className="w-4 h-4 text-cyan-500" /> Go</SectionHeading>
          <Code lang="go">{`package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

const base = "https://api.mudracore.dev"

func main() {
    // Login
    loginBody, _ := json.Marshal(map[string]string{
        "email": "you@example.com", "password": "pass",
    })
    resp, _ := http.Post(base+"/api/v1/auth/login",
        "application/json", bytes.NewBuffer(loginBody))
    var loginResp struct{ Token string \`json:"token"\` }
    json.NewDecoder(resp.Body).Decode(&loginResp)

    // Send payment
    payBody, _ := json.Marshal(map[string]interface{}{
        "from_account_id": "acc_from",
        "to_account_id":   "acc_to",
        "amount": 100.0, "currency": "USD",
    })
    req, _ := http.NewRequest("POST", base+"/api/v1/payments",
        bytes.NewBuffer(payBody))
    req.Header.Set("Authorization", "Bearer "+loginResp.Token)
    req.Header.Set("Content-Type", "application/json")
    client := &http.Client{}
    payResp, _ := client.Do(req)

    var result map[string]interface{}
    json.NewDecoder(payResp.Body).Decode(&result)
    fmt.Printf("Result: %+v\n", result)
}`}</Code>

          {/* ── SDK Python ───────────────────────────────────────────── */}
          <SectionHeading id="sdk-python"><Code2 className="w-4 h-4 text-yellow-500" /> Python</SectionHeading>
          <Code lang="python">{`# pip install requests
import requests

BASE = "https://api.mudracore.dev"

# Login
login = requests.post(f"{BASE}/api/v1/auth/login", json={
    "email": "you@example.com",
    "password": "pass"
}).json()
token = login["token"]
headers = {"Authorization": f"Bearer {token}"}

# Seed + list accounts
requests.post(f"{BASE}/api/v1/accounts/seed-demo", headers=headers)
accounts = requests.get(f"{BASE}/api/v1/accounts", headers=headers).json()["data"]

# Send payment
result = requests.post(f"{BASE}/api/v1/payments", headers=headers, json={
    "from_account_id": accounts[0]["id"],
    "to_account_id":   accounts[1]["id"],
    "amount": 100,
    "currency": "USD",
    "description": "Python SDK demo",
}).json()

fee = result['data']['fee']
print(f"Rail: {result['data']['rail']}, Fee: \${fee}")`}</Code>

          {/* ── WEBHOOKS ─────────────────────────────────────────────── */}
          <SectionHeading id="webhooks"><Activity className="w-5 h-5 text-indigo-500" /> Webhooks</SectionHeading>
          <p className="text-slate-500 text-sm leading-relaxed mb-4">
            Webhooks deliver real-time event notifications to your endpoint as signed HTTPS POST requests.
          </p>
          <Callout type="info">
            All webhook payloads include a <code className="font-mono text-xs bg-blue-50 px-1 rounded">X-MudraCore-Signature</code> header — an HMAC-SHA256 signature of the raw body using your webhook secret. Always verify it before processing.
          </Callout>
          <Table
            headers={['Event', 'Trigger', 'Payload Key']}
            rows={[
              ['payment.completed', 'Transfer posted to ledger', 'payment'],
              ['payment.failed', 'Transfer rejected (insufficient funds, invalid rail)', 'payment'],
              ['kyc.verified', 'KYC document verified successfully', 'kyc_profile'],
              ['kyc.failed', 'KYC document rejected', 'kyc_profile'],
              ['account.created', 'New account registered', 'account'],
              ['balance.low', 'Account balance drops below threshold', 'account'],
            ]}
          />
          <Code lang="typescript">{`// Verify webhook signature (Node.js)
import crypto from 'crypto';

app.post('/webhook', (req, res) => {
  const sig = req.headers['x-mudracore-signature'];
  const expected = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET!)
    .update(req.rawBody)
    .digest('hex');

  if (sig !== \`sha256=\${expected}\`) {
    return res.status(401).send('Invalid signature');
  }

  const { event, data } = req.body;
  if (event === 'payment.completed') {
    console.log('Payment:', data.payment.id, data.payment.rail);
  }
  res.sendStatus(200);
});`}</Code>

          {/* ── ERROR CODES ──────────────────────────────────────────── */}
          <SectionHeading id="error-codes"><AlertCircle className="w-5 h-5 text-red-500" /> Error Codes</SectionHeading>
          <Table
            headers={['HTTP Status', 'Code', 'Description', 'Resolution']}
            rows={[
              ['400', 'INVALID_REQUEST', 'Missing or malformed fields', 'Check request schema'],
              ['400', 'INSUFFICIENT_BALANCE', 'Sender balance < amount + fee', 'Top up sender account'],
              ['401', 'UNAUTHORIZED', 'Missing or invalid JWT', 'Re-authenticate at /auth/login'],
              ['403', 'FORBIDDEN', 'Valid token but insufficient permissions', 'Check user role'],
              ['404', 'NOT_FOUND', 'Resource does not exist', 'Verify ID in request'],
              ['409', 'DUPLICATE_REFERENCE', 'Transaction reference already used', 'Use unique reference'],
              ['422', 'CURRENCY_MISMATCH', 'From and to accounts have different currencies', 'Use same-currency accounts'],
              ['503', 'DB_UNAVAILABLE', 'Database not reachable', 'Retry with exponential backoff'],
            ]}
          />
          <Callout type="tip">
            All error responses follow the same envelope: <code className="font-mono text-xs bg-accent/10 px-1 rounded">{"{ success: false, error: \"message\" }"}</code>
          </Callout>

          {/* ── RATE LIMITS ──────────────────────────────────────────── */}
          <SectionHeading id="rate-limits"><Clock className="w-5 h-5 text-amber-500" /> Rate Limits</SectionHeading>
          <Table
            headers={['Tier', 'Requests / min', 'Burst', 'Notes']}
            rows={[
              ['Free', '60', '10', 'Default for all registered users'],
              ['Pro', '600', '100', 'Available on Pro plan'],
              ['Enterprise', 'Unlimited', '—', 'Custom SLA + dedicated infrastructure'],
              ['Public endpoints', '120', '20', '/api/market/*, /api/kyc/countries, /health'],
            ]}
          />
          <Callout type="warn">
            Rate limit headers are returned on every response: <code className="font-mono text-xs bg-amber-50 px-1 rounded">X-RateLimit-Remaining</code>, <code className="font-mono text-xs bg-amber-50 px-1 rounded">X-RateLimit-Reset</code>. Implement retry logic with exponential backoff when you receive a 429.
          </Callout>

          {/* ── CHANGELOG ────────────────────────────────────────────── */}
          <SectionHeading id="changelog"><History className="w-5 h-5 text-slate-500" /> Changelog</SectionHeading>
          {[
            {
              version: 'v2.1', date: 'April 2026', badge: 'Latest',
              changes: [
                'Added Fee and Rail fields to LedgerTransaction model — fees now deducted from sender balance via double-entry fee entry',
                'New POST /api/v1/accounts/seed-demo — seeds 8 provider accounts (Revolut, PayPal, Coinbase, Wise, Chase, MetaMask, Binance, Stripe)',
                'Provider metadata (provider, institution_name) added to LedgerAccount — shown with emoji badges in UI',
                'Balance check in CreateTransfer updated to amount + fee',
                'New AutoMigrate-first migration strategy ensures existing DBs receive new columns on restart',
              ],
            },
            {
              version: 'v2.0', date: 'January 2026', badge: undefined,
              changes: [
                'Complete redesign of API Explorer — 2-pane layout with live Try It, cURL & TypeScript snippets',
                'Multi-rail payments page redesigned — Transfer History panel + Rail Cost Intelligence always visible',
                'Vercel deployment support added',
                'KYC endpoints expanded — country support grew to 30+',
              ],
            },
            {
              version: 'v1.5', date: 'October 2025', badge: undefined,
              changes: [
                'Ledger API added — double-entry bookkeeping with trial balance and chart of accounts',
                'gRPC bridge for Payment and KYC services',
                'Market data endpoints (FX, crypto, currency conversion)',
              ],
            },
            {
              version: 'v1.0', date: 'June 2025', badge: undefined,
              changes: [
                'Initial release — Auth, Users, Accounts, Payments',
                'JWT authentication with 30-day token lifetime',
                'Basic multi-rail payment routing (UPI, SEPA, SWIFT, Crypto)',
              ],
            },
          ].map(entry => (
            <div key={entry.version} className="mb-5 flex gap-4">
              <div className="flex-shrink-0 pt-1">
                <div className="w-2 h-2 rounded-full bg-secondary mt-1.5" />
              </div>
              <div className="flex-1 border-l border-outline-variant pl-4 pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-sm text-primary">{entry.version}</span>
                  {entry.badge && <span className="text-[9px] bg-accent/10 text-secondary border border-accent/20 font-bold rounded-full px-2 py-0.5">{entry.badge}</span>}
                  <span className="text-xs text-slate-400">{entry.date}</span>
                </div>
                <ul className="space-y-1">
                  {entry.changes.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3 h-3 text-secondary flex-shrink-0 mt-0.5" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          {/* ── SUPPORT ──────────────────────────────────────────────── */}
          <SectionHeading id="support"><HelpCircle className="w-5 h-5 text-blue-500" /> Support & FAQ</SectionHeading>

          <div className="space-y-3 mb-8">
            {[
              { q: 'How do I get an API token?', a: 'Register via POST /api/v1/auth/register (or use the login form on the platform). The response includes a JWT token valid for 30 days.' },
              { q: 'Why does my payment fail with "insufficient balance"?', a: 'The sender account must have at least amount + rail fee. For example, sending $100 via SWIFT requires $102 ($2 fee). Check the exact shortfall in the error message.' },
              { q: 'Can I use the API without authentication?', a: 'Public endpoints (health, market data, KYC countries) require no token. All account, payment, and ledger operations require Bearer auth.' },
              { q: 'How do I choose a specific payment rail?', a: 'The engine auto-selects the optimal rail. Direct rail selection is on the roadmap. You can see the selected rail and fee in the payment response.' },
              { q: 'What currencies are supported?', a: 'USD, EUR, GBP, INR, JPY, CAD, AUD, CHF, CNY, SGD for FX rates. Payments currently require matching currencies between accounts.' },
              { q: 'How do I test without real money?', a: 'Use POST /api/v1/accounts/seed-demo to create dummy accounts with pre-loaded balances. All transactions are simulated — no real money moves.' },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="bg-white border border-outline-variant rounded-xl p-4 shadow-premium"
              >
                <p className="text-sm font-semibold text-primary mb-1.5">{faq.q}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>

          {/* Contact */}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: Mail, label: 'Email Support', value: 'support@mudracoreos.com', href: 'mailto:support@mudracoreos.com', color: 'text-secondary' },
              { icon: Github, label: 'GitHub', value: 'github.com/mudracore', href: 'https://github.com', color: 'text-primary' },
              { icon: ExternalLink, label: 'API Explorer', value: 'Interactive playground', href: '/developers/api-explorer', color: 'text-blue-600', internal: true },
            ].map(c => (
              c.internal
                ? <Link key={c.label} to={c.href} className="flex items-start gap-3 p-4 bg-white border border-outline-variant rounded-xl shadow-premium hover:shadow-lg transition-all group">
                    <c.icon className={`w-5 h-5 ${c.color} flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform`} />
                    <div><p className="text-sm font-semibold text-primary">{c.label}</p><p className="text-xs text-slate-400">{c.value}</p></div>
                  </Link>
                : <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 p-4 bg-white border border-outline-variant rounded-xl shadow-premium hover:shadow-lg transition-all group">
                    <c.icon className={`w-5 h-5 ${c.color} flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform`} />
                    <div><p className="text-sm font-semibold text-primary">{c.label}</p><p className="text-xs text-slate-400">{c.value}</p></div>
                  </a>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 bg-primary rounded-2xl p-8 text-center">
            <Lock className="w-8 h-8 text-accent mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Ready to build?</h3>
            <p className="text-slate-300 text-sm mb-5 max-w-md mx-auto">Test every endpoint live in the API Explorer — no setup required.</p>
            <Link
              to="/developers/api-explorer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-primary font-bold rounded-xl hover:shadow-glow active:scale-95 transition-all text-sm"
            >
              <Terminal className="w-4 h-4" /> Open API Explorer <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </article>
      </div>

      </div>{/* end flex row */}
    </div>
  );
};

export default DevelopersPage;
