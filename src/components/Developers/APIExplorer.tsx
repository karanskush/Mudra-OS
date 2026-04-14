import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronRight, ChevronDown, Play, Copy, Check,
  Shield, User, CreditCard, ArrowLeftRight, BookOpen, Eye,
  Globe, Zap, Activity, Terminal, Code2, Clock, Lock, Unlock,
  CheckCircle2, XCircle, AlertCircle, Hash, RefreshCw,
  Database, Layers, BarChart2, FileText, Wifi,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:47291';

// ─── Types ───────────────────────────────────────────────────────────────────

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'STREAM';

interface Endpoint {
  id: string;
  method: HttpMethod;
  path: string;
  title: string;
  description: string;
  auth: boolean;
  requestBody?: Record<string, unknown>;
  queryParams?: Record<string, string>;
  responseExample: Record<string, unknown>;
  complexity: 'simple' | 'intermediate' | 'advanced';
  latency: number; // ms
}

interface Category {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
  endpoints: Endpoint[];
}

// ─── API Catalogue ────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  {
    id: 'system',
    label: 'System',
    icon: Activity,
    color: 'text-emerald-600',
    description: 'Health checks and system status',
    endpoints: [
      {
        id: 'health',
        method: 'GET',
        path: '/health',
        title: 'Health Check',
        description: 'Returns system health including database connectivity, uptime, and backend version.',
        auth: false,
        responseExample: {
          status: 'ok',
          message: 'Fintech Backend is running with Neon database',
          time: '2026-04-14T10:30:00Z',
          database: { connected: true, database_name: 'fintech', ssl_mode: 'require', version: 'PostgreSQL 15.5' },
        },
        complexity: 'simple',
        latency: 23,
      },
    ],
  },
  {
    id: 'auth',
    label: 'Authentication',
    icon: Shield,
    color: 'text-blue-600',
    description: 'User registration, login, and session management',
    endpoints: [
      {
        id: 'register',
        method: 'POST',
        path: '/api/v1/auth/register',
        title: 'Register',
        description: 'Create a new user account. Returns a JWT token on success.',
        auth: false,
        requestBody: { email: 'user@example.com', password: 'SecurePass123!', first_name: 'Jane', last_name: 'Doe', phone: '+1234567890', date_of_birth: '1990-01-15T00:00:00Z' },
        responseExample: { token: 'eyJhbGciOiJIUzI1NiJ9...', expires_at: '2026-05-14T10:30:00Z', user: { id: 'usr_abc123', email: 'user@example.com', first_name: 'Jane', last_name: 'Doe', role: 'user' } },
        complexity: 'simple',
        latency: 145,
      },
      {
        id: 'login',
        method: 'POST',
        path: '/api/v1/auth/login',
        title: 'Login',
        description: 'Authenticate with email and password. Returns a JWT token for all subsequent requests.',
        auth: false,
        requestBody: { email: 'user@example.com', password: 'SecurePass123!' },
        responseExample: { token: 'eyJhbGciOiJIUzI1NiJ9...', expires_at: '2026-05-14T10:30:00Z', user: { id: 'usr_abc123', email: 'user@example.com', role: 'user' } },
        complexity: 'simple',
        latency: 89,
      },
      {
        id: 'logout',
        method: 'POST',
        path: '/api/v1/auth/logout',
        title: 'Logout',
        description: 'Invalidate the current session token.',
        auth: true,
        requestBody: {},
        responseExample: { success: true, message: 'Logged out successfully' },
        complexity: 'simple',
        latency: 34,
      },
    ],
  },
  {
    id: 'users',
    label: 'Users',
    icon: User,
    color: 'text-violet-600',
    description: 'User profile management',
    endpoints: [
      {
        id: 'getMe',
        method: 'GET',
        path: '/api/v1/me',
        title: 'Get Current User',
        description: 'Returns the authenticated user profile.',
        auth: true,
        responseExample: { id: 'usr_abc123', email: 'user@example.com', first_name: 'Jane', last_name: 'Doe', phone: '+1234567890', role: 'user', is_active: true, is_verified: true, created_at: '2026-01-15T10:30:00Z' },
        complexity: 'simple',
        latency: 45,
      },
      {
        id: 'getProfile',
        method: 'GET',
        path: '/api/v1/users/profile',
        title: 'Get Profile',
        description: 'Get full user profile details.',
        auth: true,
        responseExample: { id: 'usr_abc123', email: 'user@example.com', first_name: 'Jane', last_name: 'Doe', phone: '+1234567890', date_of_birth: '1990-01-15', role: 'user', created_at: '2026-01-15T10:30:00Z' },
        complexity: 'simple',
        latency: 55,
      },
      {
        id: 'updateProfile',
        method: 'PUT',
        path: '/api/v1/users/profile',
        title: 'Update Profile',
        description: 'Update the authenticated user profile fields.',
        auth: true,
        requestBody: { first_name: 'Jane', last_name: 'Smith', phone: '+1987654321' },
        responseExample: { success: true, user: { id: 'usr_abc123', first_name: 'Jane', last_name: 'Smith', phone: '+1987654321' } },
        complexity: 'simple',
        latency: 98,
      },
    ],
  },
  {
    id: 'accounts',
    label: 'Accounts',
    icon: CreditCard,
    color: 'text-secondary',
    description: 'Bank account management and connected providers',
    endpoints: [
      {
        id: 'listAccounts',
        method: 'GET',
        path: '/api/v1/accounts',
        title: 'List Accounts',
        description: 'List all accounts for the authenticated user. Includes real-time balances, account types, and provider metadata.',
        auth: true,
        responseExample: { success: true, data: [{ id: 'acc_123', account_number: '8472910346', type: 'bank', status: 'active', balance: 1200.0, currency: 'USD', name: 'Revolut Account', provider: 'revolut', institution_name: 'Revolut', created_at: '2026-01-15T10:30:00Z' }] },
        complexity: 'simple',
        latency: 78,
      },
      {
        id: 'createAccount',
        method: 'POST',
        path: '/api/v1/accounts',
        title: 'Create Account',
        description: 'Create a new bank or investment account. Optionally provide an initial balance which creates a deposit entry.',
        auth: true,
        requestBody: { type: 'checking', name: 'Euro Savings', description: 'Savings for travel', currency: 'USD', initial_balance: 500.0 },
        responseExample: { success: true, data: { id: 'acc_456', account_number: '5839201047', type: 'bank', status: 'active', balance: 500.0, currency: 'USD', name: 'Euro Savings', created_at: '2026-04-14T10:30:00Z' } },
        complexity: 'intermediate',
        latency: 156,
      },
      {
        id: 'getAccount',
        method: 'GET',
        path: '/api/v1/accounts/{id}',
        title: 'Get Account',
        description: 'Retrieve a specific account by ID.',
        auth: true,
        responseExample: { success: true, data: { id: 'acc_123', account_number: '8472910346', type: 'bank', status: 'active', balance: 1200.0, currency: 'USD', name: 'Revolut Account', provider: 'revolut', institution_name: 'Revolut' } },
        complexity: 'simple',
        latency: 42,
      },
      {
        id: 'seedDemo',
        method: 'POST',
        path: '/api/v1/accounts/seed-demo',
        title: 'Seed Demo Accounts',
        description: 'Creates 8 pre-connected dummy accounts (Revolut, PayPal, Wise, Chase, Coinbase, MetaMask, Binance, Stripe). Idempotent — skips any accounts that already exist.',
        auth: true,
        requestBody: {},
        responseExample: { success: true, message: 'Seeded 8 demo accounts (0 already existed)', created: 8, skipped: 0 },
        complexity: 'simple',
        latency: 340,
      },
    ],
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: Layers,
    color: 'text-amber-600',
    description: 'Transaction history and ledger entries',
    endpoints: [
      {
        id: 'listTransactions',
        method: 'GET',
        path: '/api/v1/transactions',
        title: 'List Transactions',
        description: 'Returns all ledger transactions across all accounts for the user. Includes debit/credit entries, rail info, and fees.',
        auth: true,
        responseExample: { success: true, data: [{ id: 'txn_abc', type: 'transfer', status: 'posted', total_amount: 100.0, fee: 2.0, rail: 'SWIFT', currency: 'USD', description: 'Transfer', timestamp: '2026-04-14T09:00:00Z' }], count: 1 },
        complexity: 'simple',
        latency: 112,
      },
    ],
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: ArrowLeftRight,
    color: 'text-secondary',
    description: 'Multi-rail payment orchestration',
    endpoints: [
      {
        id: 'createPayment',
        method: 'POST',
        path: '/api/v1/payments',
        title: 'Send Payment',
        description: 'Create a multi-rail transfer. The engine auto-selects the optimal payment rail (UPI, SEPA, SWIFT, Crypto, ACH, RTP, FedNow) and deducts both the principal and the rail fee from the sender.',
        auth: true,
        requestBody: { from_account_id: 'acc_123', to_account_id: 'acc_456', amount: 50.0, currency: 'USD', description: 'Dinner split' },
        responseExample: { success: true, data: { transaction: { id: 'txn_xyz', status: 'posted', total_amount: 50.0, fee: 2.0, rail: 'SWIFT', currency: 'USD' }, rail: 'SWIFT', fee: 2.0, fx_rate: 1.0, latency: '60s' } },
        complexity: 'intermediate',
        latency: 189,
      },
      {
        id: 'listPayments',
        method: 'GET',
        path: '/api/v1/payments',
        title: 'List Payments',
        description: 'Returns all transfer-type transactions for the authenticated user.',
        auth: true,
        responseExample: { success: true, data: [{ id: 'txn_xyz', type: 'transfer', status: 'posted', total_amount: 50.0, fee: 2.0, rail: 'SWIFT', currency: 'USD', timestamp: '2026-04-14T09:15:00Z' }], count: 1 },
        complexity: 'simple',
        latency: 94,
      },
    ],
  },
  {
    id: 'ledger',
    label: 'Ledger',
    icon: BookOpen,
    color: 'text-orange-600',
    description: 'Double-entry bookkeeping and accounting reports',
    endpoints: [
      {
        id: 'listLedgerAccounts',
        method: 'GET',
        path: '/api/ledger/accounts',
        title: 'List Ledger Accounts',
        description: 'List all double-entry ledger accounts: assets, liabilities, equity, revenue, and expense accounts.',
        auth: true,
        responseExample: { success: true, data: [{ id: 'la_123', account_number: 'ACC001', name: 'Cash', type: 'bank', status: 'active', balance: 5000.0, currency: 'USD' }] },
        complexity: 'intermediate',
        latency: 87,
      },
      {
        id: 'createLedgerAccount',
        method: 'POST',
        path: '/api/ledger/accounts',
        title: 'Create Ledger Account',
        description: 'Create a new account in the chart of accounts. Supports all standard account types.',
        auth: true,
        requestBody: { name: 'Operating Expenses', description: 'Monthly opex', currency: 'USD', type: 'expense' },
        responseExample: { success: true, data: { id: 'la_456', account_number: 'ACC002', name: 'Operating Expenses', type: 'expense', status: 'active', balance: 0.0, currency: 'USD' } },
        complexity: 'intermediate',
        latency: 123,
      },
      {
        id: 'ledgerTransfer',
        method: 'POST',
        path: '/api/ledger/transactions/transfer',
        title: 'Ledger Transfer',
        description: 'Create a balanced double-entry transfer between two accounts.',
        auth: true,
        requestBody: { from_account_id: 'la_123', to_account_id: 'la_456', amount: 1000.0, currency: 'USD', description: 'Payroll', reference: 'PAY-2026-04' },
        responseExample: { success: true, data: { id: 'txn_la_789', type: 'transfer', status: 'posted', total_amount: 1000.0, entries: [{ debit_account_id: 'la_456', credit_account_id: 'la_123', amount: 1000.0 }] } },
        complexity: 'advanced',
        latency: 189,
      },
      {
        id: 'ledgerDeposit',
        method: 'POST',
        path: '/api/ledger/transactions/deposit',
        title: 'Deposit',
        description: 'Record a deposit — creates a debit entry on the target account and a matching credit on the system equity account.',
        auth: true,
        requestBody: { account_id: 'la_123', amount: 500.0, currency: 'USD', description: 'Client payment received', reference: 'DEP-001' },
        responseExample: { success: true, data: { id: 'txn_dep_abc', type: 'deposit', status: 'posted', total_amount: 500.0 } },
        complexity: 'intermediate',
        latency: 145,
      },
      {
        id: 'trialBalance',
        method: 'GET',
        path: '/api/ledger/trial-balance',
        title: 'Trial Balance',
        description: 'Get the trial balance across all accounts. Verifies that total debits equal total credits.',
        auth: true,
        responseExample: { success: true, data: { trial_balance: [{ account_name: 'Cash', type: 'bank', debit_balance: 5000.0, credit_balance: 0.0 }], total_debits: 5000.0, total_credits: 5000.0, is_balanced: true, as_of: '2026-04-14T10:30:00Z' } },
        complexity: 'intermediate',
        latency: 234,
      },
      {
        id: 'chartOfAccounts',
        method: 'GET',
        path: '/api/ledger/chart-of-accounts',
        title: 'Chart of Accounts',
        description: 'Returns a structured chart of accounts organized by account type.',
        auth: true,
        responseExample: { success: true, data: { assets: [], liabilities: [], equity: [], revenue: [], expenses: [] } },
        complexity: 'simple',
        latency: 67,
      },
    ],
  },
  {
    id: 'kyc',
    label: 'KYC',
    icon: Eye,
    color: 'text-pink-600',
    description: 'Know Your Customer verification and compliance',
    endpoints: [
      {
        id: 'kycStart',
        method: 'POST',
        path: '/api/kyc/start',
        title: 'Start KYC',
        description: 'Initiate a KYC verification flow for a user. Returns a session with document requirements per country.',
        auth: false,
        requestBody: { country: 'United States', name: 'Jane Doe', email: 'jane@example.com', phone: '+1234567890', location: 'New York, NY', amount: 10000 },
        responseExample: { user_id: 'usr_kyc_123', country: 'United States', status: 'pending', progress: 0, documents: { passport: { status: 'pending' }, drivers_license: { status: 'pending' } }, next_steps: ['Upload passport', 'Complete biometric check'] },
        complexity: 'intermediate',
        latency: 234,
      },
      {
        id: 'kycCountries',
        method: 'GET',
        path: '/api/kyc/countries',
        title: 'Supported Countries',
        description: 'Returns the list of countries supported for KYC verification along with required document types.',
        auth: false,
        responseExample: { success: true, countries: [{ country: 'United States', documents: ['passport', 'drivers_license', 'id_card'], description: 'USA — federal and state documents' }, { country: 'United Kingdom', documents: ['passport', 'drivers_license'] }], total: 30 },
        complexity: 'simple',
        latency: 89,
      },
      {
        id: 'kycVerify',
        method: 'POST',
        path: '/api/kyc/verify/passport',
        title: 'Verify Document',
        description: 'Submit a document for verification via the Didit integration. Supports passport, drivers_license, and id_card.',
        auth: false,
        requestBody: { document_type: 'passport', document_number: 'P12345678', country: 'US' },
        responseExample: { status: 'verified', valid: true, details: { full_name: 'Jane Doe', date_of_birth: '1990-01-15', nationality: 'US', document_number: 'P12345678' }, timestamp: '2026-04-14T10:30:00Z' },
        complexity: 'advanced',
        latency: 1200,
      },
      {
        id: 'kycDashboard',
        method: 'GET',
        path: '/api/kyc/dashboard',
        title: 'KYC Dashboard',
        description: 'Returns all KYC submissions with their current status and progress.',
        auth: true,
        responseExample: { success: true, data: [{ id: 'kyc_abc', status: 'verified', country: 'US', progress: 100, submitted_at: '2026-01-20T15:30:00Z' }] },
        complexity: 'intermediate',
        latency: 156,
      },
    ],
  },
  {
    id: 'market',
    label: 'Market Data',
    icon: BarChart2,
    color: 'text-cyan-600',
    description: 'Live FX rates, crypto prices, and currency conversion',
    endpoints: [
      {
        id: 'fxRates',
        method: 'GET',
        path: '/api/market/fx?base=USD',
        title: 'FX Rates',
        description: 'Live foreign exchange rates for 15 major currencies. Cached for 5 minutes. Source: ExchangeRate-API.',
        auth: false,
        queryParams: { base: 'USD' },
        responseExample: { success: true, base: 'USD', rates: { EUR: 0.92, GBP: 0.79, INR: 83.12, JPY: 149.5, CAD: 1.36, AUD: 1.53, CHF: 0.9 }, fetched_at: '2026-04-14T10:30:00Z' },
        complexity: 'simple',
        latency: 45,
      },
      {
        id: 'convert',
        method: 'GET',
        path: '/api/market/convert?from=USD&to=EUR&amount=100',
        title: 'Currency Convert',
        description: 'Convert an amount between any two supported currencies using live rates.',
        auth: false,
        queryParams: { from: 'USD', to: 'EUR', amount: '100' },
        responseExample: { success: true, from: 'USD', to: 'EUR', amount: 100, converted: '92.0000', rate: 0.92, fetched_at: '2026-04-14T10:30:00Z' },
        complexity: 'simple',
        latency: 52,
      },
      {
        id: 'crypto',
        method: 'GET',
        path: '/api/market/crypto',
        title: 'Crypto Prices',
        description: 'Live prices for BTC, ETH, USDC, USDT, and SOL with 24-hour change percentage. Source: CoinGecko.',
        auth: false,
        responseExample: { success: true, data: { BTC: { usd: 95000, usd_24h_change: 2.5, usd_market_cap: 1880000000000 }, ETH: { usd: 3800, usd_24h_change: 1.8 }, SOL: { usd: 185, usd_24h_change: -1.2 } }, source: 'coingecko' },
        complexity: 'simple',
        latency: 310,
      },
    ],
  },
  {
    id: 'grpc',
    label: 'gRPC / Streaming',
    icon: Zap,
    color: 'text-purple-600',
    description: 'Low-latency streaming and unary gRPC-over-HTTP bridge',
    endpoints: [
      {
        id: 'grpcCreatePayment',
        method: 'POST',
        path: '/v1/payments/create',
        title: 'gRPC Create Payment',
        description: 'Unary RPC: create a payment with KYC checks, rail auto-selection, and journal entry creation.',
        auth: true,
        requestBody: { userId: 'usr_abc123', fromAccountId: 'acc_123', toAccountId: 'acc_456', amount: 1000.0, currency: 'USD', description: 'Monthly invoice', reference: 'INV-2026-04' },
        responseExample: { paymentId: 'pay_grpc_xyz', status: 'PROCESSING', chosenRail: 'ACH', fee: 2.5, fxRate: 1.0, latency: '30s', kycCheck: { passed: true, riskLevel: 'low', flags: [] } },
        complexity: 'advanced',
        latency: 45,
      },
      {
        id: 'grpcKycProfile',
        method: 'POST',
        path: '/v1/kyc/create-profile',
        title: 'gRPC KYC Profile',
        description: 'Unary RPC: create a KYC profile with risk scoring and compliance policy evaluation.',
        auth: true,
        requestBody: { userId: 'usr_abc123', name: 'Jane Doe', email: 'jane@example.com', country: 'US', amount: 50000 },
        responseExample: { profileId: 'kyc_grpc_456', status: 'UNDER_REVIEW', riskScore: 25, riskLevel: 'low', policyVerdict: 'approved', policyVersion: 'v1.2.0' },
        complexity: 'advanced',
        latency: 234,
      },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const METHOD_STYLES: Record<HttpMethod, { bg: string; text: string; border: string }> = {
  GET:    { bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-200' },
  POST:   { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
  PUT:    { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' },
  DELETE: { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200' },
  PATCH:  { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200' },
  STREAM: { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200' },
};

const COMPLEXITY_STYLES = {
  simple:       { label: 'Simple',       color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  intermediate: { label: 'Intermediate', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  advanced:     { label: 'Advanced',     color: 'text-red-600 bg-red-50 border-red-200' },
};

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken') || '';
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

function formatJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const MethodBadge: React.FC<{ method: HttpMethod; small?: boolean }> = ({ method, small }) => {
  const s = METHOD_STYLES[method];
  return (
    <span className={`inline-flex items-center rounded font-mono font-bold border ${s.bg} ${s.text} ${s.border} ${small ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'}`}>
      {method}
    </span>
  );
};

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button onClick={copy} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all">
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};

const JsonBlock: React.FC<{ code: string; label?: string }> = ({ code, label }) => (
  <div className="rounded-xl border border-outline-variant overflow-hidden">
    {label && (
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-outline-variant">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        <CopyButton text={code} />
      </div>
    )}
    <pre className="p-4 text-xs font-mono text-slate-700 overflow-x-auto leading-relaxed bg-white whitespace-pre-wrap break-words">
      {code}
    </pre>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const APIExplorer: React.FC = () => {
  const [search, setSearch] = useState('');
  const [openCats, setOpenCats] = useState<Set<string>>(new Set(['auth', 'accounts', 'payments']));
  const [activeEndpoint, setActiveEndpoint] = useState<Endpoint | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tryit' | 'code'>('overview');

  // Try It state
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState<{ status: number; data: unknown; time: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [reqError, setReqError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ── search filter ─────────────────────────────────────────────────────────
  const q = search.toLowerCase();
  const filteredCats = CATEGORIES.map(cat => ({
    ...cat,
    endpoints: cat.endpoints.filter(e =>
      !q || e.title.toLowerCase().includes(q) || e.path.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
    ),
  })).filter(cat => !q || cat.endpoints.length > 0);

  const totalEndpoints = CATEGORIES.reduce((s, c) => s + c.endpoints.length, 0);

  // ── select endpoint ───────────────────────────────────────────────────────
  const selectEndpoint = (ep: Endpoint) => {
    setActiveEndpoint(ep);
    setActiveTab('overview');
    setResponse(null);
    setReqError(null);
    setRequestBody(ep.requestBody ? formatJson(ep.requestBody) : '');
  };

  const toggleCat = (id: string) =>
    setOpenCats(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  // ── live API call ─────────────────────────────────────────────────────────
  const runRequest = useCallback(async () => {
    if (!activeEndpoint) return;
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setResponse(null);
    setReqError(null);
    const t0 = performance.now();

    try {
      const isGet = activeEndpoint.method === 'GET';
      const url = `${API_BASE}${activeEndpoint.path.split('?')[0]}${activeEndpoint.path.includes('?') ? activeEndpoint.path.split('?')[1] ? '?' + activeEndpoint.path.split('?')[1] : '' : ''}`;
      const fetchOpts: RequestInit = {
        method: activeEndpoint.method === 'STREAM' ? 'POST' : activeEndpoint.method,
        headers: activeEndpoint.auth ? authHeaders() : { 'Content-Type': 'application/json' },
        signal: abortRef.current.signal,
      };
      if (!isGet && activeEndpoint.method !== 'STREAM') {
        try {
          fetchOpts.body = requestBody || '{}';
        } catch { fetchOpts.body = '{}'; }
      }
      const res = await fetch(url, fetchOpts);
      const elapsed = Math.round(performance.now() - t0);
      let data: unknown;
      try { data = await res.json(); } catch { data = { raw: await res.text() }; }
      setResponse({ status: res.status, data, time: elapsed });
    } catch (err: unknown) {
      if ((err as { name?: string }).name !== 'AbortError') {
        setReqError(err instanceof Error ? err.message : 'Request failed');
      }
    } finally {
      setLoading(false);
    }
  }, [activeEndpoint, requestBody]);

  // ── curl snippet ─────────────────────────────────────────────────────────
  const curlSnippet = (ep: Endpoint) => {
    const url = `${API_BASE}${ep.path}`;
    const lines = [`curl -X ${ep.method === 'STREAM' ? 'POST' : ep.method} \\`, `  '${url}' \\`];
    if (ep.auth) lines.push(`  -H 'Authorization: Bearer <TOKEN>' \\`);
    lines.push(`  -H 'Content-Type: application/json'`);
    if (ep.requestBody && Object.keys(ep.requestBody).length > 0) {
      lines.push(` \\\n  -d '${JSON.stringify(ep.requestBody)}'`);
    }
    return lines.join('\n');
  };

  const tsSnippet = (ep: Endpoint) => {
    const hasBody = ep.requestBody && Object.keys(ep.requestBody).length > 0;
    return `const response = await fetch('${API_BASE}${ep.path}', {
  method: '${ep.method === 'STREAM' ? 'POST' : ep.method}',
  headers: {
    'Content-Type': 'application/json',${ep.auth ? "\n    'Authorization': `Bearer ${'{token}'}`," : ''}
  },${hasBody ? `\n  body: JSON.stringify(${formatJson(ep.requestBody)}),` : ''}
});
const data = await response.json();`;
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-80px)] bg-surface overflow-hidden">

      {/* ════ LEFT SIDEBAR ════ */}
      <aside className="w-72 flex-shrink-0 bg-white border-r border-outline-variant flex flex-col overflow-hidden">

        {/* Sidebar header */}
        <div className="px-4 py-4 border-b border-outline-variant">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Terminal className="w-3.5 h-3.5 text-accent" />
            </div>
            <div>
              <p className="text-xs font-bold text-primary">API Reference</p>
              <p className="text-[10px] text-slate-400">{totalEndpoints} endpoints · v1</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search endpoints…"
              className="w-full pl-8 pr-3 py-1.5 bg-surface border border-outline-variant rounded-lg text-xs text-primary placeholder-slate-400 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
            />
          </div>
        </div>

        {/* Category list */}
        <div className="flex-1 overflow-y-auto py-2">
          {filteredCats.map(cat => {
            const Icon = cat.icon;
            const isOpen = openCats.has(cat.id);
            return (
              <div key={cat.id}>
                <button
                  onClick={() => toggleCat(cat.id)}
                  className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                    <span className="text-xs font-semibold text-primary">{cat.label}</span>
                    <span className="text-[9px] text-slate-400 font-medium">{cat.endpoints.length}</span>
                  </div>
                  {isOpen
                    ? <ChevronDown className="w-3 h-3 text-slate-400" />
                    : <ChevronRight className="w-3 h-3 text-slate-400" />}
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      {cat.endpoints.map(ep => (
                        <button
                          key={ep.id}
                          onClick={() => selectEndpoint(ep)}
                          className={`w-full flex items-center gap-2.5 pl-9 pr-3 py-1.5 transition-colors text-left ${
                            activeEndpoint?.id === ep.id
                              ? 'bg-accent/10 border-r-2 border-accent'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <MethodBadge method={ep.method} small />
                          <span className={`text-[11px] truncate font-medium ${activeEndpoint?.id === ep.id ? 'text-secondary' : 'text-slate-600'}`}>
                            {ep.title}
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Base URL footer */}
        <div className="px-4 py-3 border-t border-outline-variant bg-surface">
          <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider mb-1">Base URL</p>
          <div className="flex items-center gap-1.5 bg-white border border-outline-variant rounded-lg px-2 py-1.5">
            <Wifi className="w-3 h-3 text-secondary flex-shrink-0" />
            <code className="text-[10px] text-slate-600 truncate">{API_BASE}</code>
            <CopyButton text={API_BASE} />
          </div>
        </div>
      </aside>

      {/* ════ MAIN CONTENT ════ */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeEndpoint ? (
          <EndpointView
            endpoint={activeEndpoint}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            requestBody={requestBody}
            setRequestBody={setRequestBody}
            response={response}
            loading={loading}
            reqError={reqError}
            onRun={runRequest}
            curlSnippet={curlSnippet(activeEndpoint)}
            tsSnippet={tsSnippet(activeEndpoint)}
          />
        ) : (
          <Overview categories={CATEGORIES} onSelect={selectEndpoint} />
        )}
      </div>
    </div>
  );
};

// ─── Overview ─────────────────────────────────────────────────────────────────

const Overview: React.FC<{ categories: Category[]; onSelect: (ep: Endpoint) => void }> = ({ categories, onSelect }) => {
  const totalEndpoints = categories.reduce((s, c) => s + c.endpoints.length, 0);
  const authRequired = categories.flatMap(c => c.endpoints).filter(e => e.auth).length;

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {/* Hero */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3 text-xs font-semibold tracking-widest uppercase"
          style={{ background: 'rgba(0,255,148,0.08)', border: '1px solid rgba(0,255,148,0.20)', color: '#006d43' }}>
          <Terminal className="h-3 w-3" /> MudraCore REST + gRPC
        </div>
        <h1 className="text-3xl font-bold text-primary mb-2">
          API <span className="gradient-text">Reference</span>
        </h1>
        <p className="text-slate-500 text-sm max-w-xl">
          All endpoints powering the MudraCore OS — authentication, payments, double-entry ledger, KYC, live market data, and gRPC streaming.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Endpoints', value: totalEndpoints, icon: Hash, color: 'text-secondary', bg: 'bg-accent/10' },
          { label: 'Categories', value: categories.length, icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Auth Required', value: authRequired, icon: Lock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Public Endpoints', value: totalEndpoints - authRequired, icon: Unlock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-outline-variant rounded-2xl p-4 shadow-premium">
            <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center mb-2`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-primary">{s.value}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {categories.map(cat => {
          const Icon = cat.icon;
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-outline-variant rounded-2xl p-5 shadow-premium hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-surface border border-outline-variant flex items-center justify-center">
                  <Icon className={`w-4.5 h-4.5 ${cat.color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-primary">{cat.label}</h3>
                  <p className="text-[10px] text-slate-400">{cat.endpoints.length} endpoint{cat.endpoints.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">{cat.description}</p>
              <div className="space-y-1.5">
                {cat.endpoints.slice(0, 4).map(ep => (
                  <button
                    key={ep.id}
                    onClick={() => onSelect(ep)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-surface hover:bg-white hover:border-slate-200 border border-transparent transition-all text-left group"
                  >
                    <MethodBadge method={ep.method} small />
                    <span className="text-[11px] text-slate-600 group-hover:text-primary truncate font-medium">{ep.title}</span>
                    <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-slate-400 ml-auto flex-shrink-0" />
                  </button>
                ))}
                {cat.endpoints.length > 4 && (
                  <p className="text-[10px] text-slate-400 text-center pt-1">+{cat.endpoints.length - 4} more</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Endpoint View ────────────────────────────────────────────────────────────

interface EndpointViewProps {
  endpoint: Endpoint;
  activeTab: 'overview' | 'tryit' | 'code';
  setActiveTab: (t: 'overview' | 'tryit' | 'code') => void;
  requestBody: string;
  setRequestBody: (v: string) => void;
  response: { status: number; data: unknown; time: number } | null;
  loading: boolean;
  reqError: string | null;
  onRun: () => void;
  curlSnippet: string;
  tsSnippet: string;
}

const EndpointView: React.FC<EndpointViewProps> = ({
  endpoint, activeTab, setActiveTab, requestBody, setRequestBody,
  response, loading, reqError, onRun, curlSnippet, tsSnippet,
}) => {
  const ms = METHOD_STYLES[endpoint.method];
  const cx = COMPLEXITY_STYLES[endpoint.complexity];
  const isGet = endpoint.method === 'GET';

  const statusColor = (code: number) =>
    code < 300 ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
    : code < 400 ? 'text-amber-600 bg-amber-50 border-amber-200'
    : 'text-red-600 bg-red-50 border-red-200';

  const TABS = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'tryit',    label: 'Try It',   icon: Play },
    { id: 'code',     label: 'Code',     icon: Code2 },
  ] as const;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Endpoint header */}
      <div className="bg-white border-b border-outline-variant px-6 py-4 flex-shrink-0">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3 flex-wrap">
            <MethodBadge method={endpoint.method} />
            <code className="text-sm font-mono text-primary font-semibold">{endpoint.path}</code>
            {endpoint.auth
              ? <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-600 border border-amber-200 rounded-full px-2 py-0.5 font-semibold"><Lock className="w-2.5 h-2.5" /> Auth required</span>
              : <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full px-2 py-0.5 font-semibold"><Unlock className="w-2.5 h-2.5" /> Public</span>
            }
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-[10px] border rounded-full px-2 py-0.5 font-semibold ${cx.color}`}>{cx.label}</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-surface border border-outline-variant rounded-full px-2 py-0.5">
              <Clock className="w-2.5 h-2.5" /> ~{endpoint.latency}ms
            </span>
          </div>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed">{endpoint.description}</p>

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'text-slate-500 hover:text-primary hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-3 h-3" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Request body */}
              {!isGet && endpoint.requestBody && Object.keys(endpoint.requestBody).length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Request Body</h3>
                  <JsonBlock code={formatJson(endpoint.requestBody)} label="application/json" />
                </div>
              )}

              {/* Query params */}
              {endpoint.queryParams && Object.keys(endpoint.queryParams).length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Query Parameters</h3>
                  <div className="rounded-xl border border-outline-variant overflow-hidden">
                    {Object.entries(endpoint.queryParams).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between px-4 py-2.5 border-b border-outline-variant last:border-b-0 bg-white">
                        <code className="text-xs font-mono text-blue-600">{k}</code>
                        <span className="text-xs text-slate-500 font-mono">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Response example */}
              <div className={(!isGet && endpoint.requestBody && Object.keys(endpoint.requestBody).length > 0) ? '' : 'lg:col-span-2'}>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Response Example</h3>
                <JsonBlock code={formatJson(endpoint.responseExample)} label="200 OK" />
              </div>
            </motion.div>
          )}

          {activeTab === 'tryit' && (
            <motion.div key="tryit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Request panel */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Request</h3>
                  <button
                    onClick={onRun}
                    disabled={loading}
                    className="btn-primary flex items-center gap-1.5 px-4 py-2 text-xs disabled:opacity-50"
                  >
                    {loading
                      ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Running…</>
                      : <><Play className="w-3.5 h-3.5" /> Send Request</>}
                  </button>
                </div>

                {/* Request info */}
                <div className="rounded-xl border border-outline-variant overflow-hidden mb-3">
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-surface border-b border-outline-variant">
                    <MethodBadge method={endpoint.method} small />
                    <code className="text-xs font-mono text-slate-600 truncate">{API_BASE}{endpoint.path}</code>
                  </div>
                  {endpoint.auth && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50/50 border-b border-outline-variant">
                      <Lock className="w-3 h-3 text-amber-500 flex-shrink-0" />
                      <code className="text-[10px] font-mono text-amber-600 truncate">Authorization: Bearer {localStorage.getItem('authToken')?.slice(0, 20) || '<no token>'}</code>
                    </div>
                  )}
                </div>

                {!isGet && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-500">Body (JSON)</label>
                      <button
                        onClick={() => setRequestBody(formatJson(endpoint.requestBody || {}))}
                        className="text-[10px] text-secondary hover:underline"
                      >
                        Reset to example
                      </button>
                    </div>
                    <textarea
                      value={requestBody}
                      onChange={e => setRequestBody(e.target.value)}
                      rows={10}
                      spellCheck={false}
                      className="w-full font-mono text-xs bg-white border border-outline-variant rounded-xl p-3 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 text-slate-700 resize-y"
                    />
                  </div>
                )}
              </div>

              {/* Response panel */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Response</h3>
                {reqError && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 mb-3">
                    <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div><p className="font-semibold">Request failed</p><p className="mt-0.5 text-red-500">{reqError}</p></div>
                  </div>
                )}
                {!response && !reqError && !loading && (
                  <div className="flex flex-col items-center justify-center py-16 bg-surface rounded-xl border border-outline-variant">
                    <Terminal className="w-8 h-8 text-slate-200 mb-3" />
                    <p className="text-xs text-slate-400 font-medium">Click "Send Request" to see the response</p>
                  </div>
                )}
                {loading && (
                  <div className="flex flex-col items-center justify-center py-16 bg-surface rounded-xl border border-outline-variant">
                    <RefreshCw className="w-6 h-6 text-secondary animate-spin mb-3" />
                    <p className="text-xs text-slate-400">Waiting for response…</p>
                  </div>
                )}
                {response && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold border rounded-full px-3 py-1 ${statusColor(response.status)}`}>
                        {response.status < 300
                          ? <CheckCircle2 className="w-3.5 h-3.5" />
                          : response.status < 500
                          ? <AlertCircle className="w-3.5 h-3.5" />
                          : <XCircle className="w-3.5 h-3.5" />}
                        {response.status}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-surface border border-outline-variant rounded-full px-2 py-0.5">
                        <Clock className="w-2.5 h-2.5" /> {response.time}ms
                      </span>
                    </div>
                    <JsonBlock code={formatJson(response.data)} label="Response Body" />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'code' && (
            <motion.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="p-6 space-y-5 max-w-3xl">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5" /> cURL
                </h3>
                <JsonBlock code={curlSnippet} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5" /> TypeScript / JavaScript
                </h3>
                <JsonBlock code={tsSnippet} />
              </div>
              <div className="bg-slate-50 rounded-2xl border border-outline-variant p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-slate-400" />
                  <p className="text-xs font-semibold text-slate-600">Authentication</p>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {endpoint.auth
                    ? 'This endpoint requires a valid JWT token. Obtain one via POST /api/v1/auth/login and pass it in the Authorization header.'
                    : 'This endpoint is public — no token required.'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default APIExplorer;
