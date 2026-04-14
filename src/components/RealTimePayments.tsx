import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, CheckCircle, Zap,
  CreditCard, Wallet, Building2, Activity, TrendingUp, TrendingDown,
  RefreshCw, Send, BarChart2,
  Sparkles, Award, MousePointerClick,
} from 'lucide-react';
import Navbar from './Navbar';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:47291';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Account {
  id: string;
  account_number: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  status: string;
  provider?: string;
  institution_name?: string;
}

// Provider display config
const PROVIDER_META: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
  revolut:  { emoji: '🔵', label: 'Revolut',  color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200' },
  paypal:   { emoji: '🅿',  label: 'PayPal',   color: 'text-blue-500',   bg: 'bg-blue-50 border-blue-200' },
  wise:     { emoji: '💱', label: 'Wise',     color: 'text-teal-600',   bg: 'bg-teal-50 border-teal-200' },
  chase:    { emoji: '🏦', label: 'Chase',    color: 'text-blue-700',   bg: 'bg-slate-50 border-slate-200' },
  coinbase: { emoji: '🟡', label: 'Coinbase', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  metamask: { emoji: '🦊', label: 'MetaMask', color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200' },
  binance:  { emoji: '🟨', label: 'Binance',  color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  stripe:   { emoji: '▲',  label: 'Stripe',   color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
};

interface Payment {
  id: string;
  type: string;
  status: string;
  total_amount: number;
  currency: string;
  description: string;
  timestamp: string;
  rail?: string;
  fee?: number;
}

// ─── Rail Definitions ────────────────────────────────────────────────────────

interface RailDef {
  id: string;
  name: string;
  fullName: string;
  category: 'Fiat' | 'Crypto' | 'Processor';
  fixedFee: number;
  percentFee: number;
  minFee?: number;
  maxFee?: number;
  settlement: string;
  settlementMs: number;
  description: string;
  nativeRailId?: string;
  color: string;
  icon: string;
}

const RAILS: RailDef[] = [
  {
    id: 'upi', name: 'UPI', fullName: 'Unified Payments Interface',
    category: 'Fiat', fixedFee: 5, percentFee: 0,
    settlement: '~1 second', settlementMs: 1_000,
    description: "India's real-time payment system", nativeRailId: 'UPI',
    color: 'orange', icon: '🇮🇳',
  },
  {
    id: 'sepa', name: 'SEPA', fullName: 'SEPA Credit Transfer',
    category: 'Fiat', fixedFee: 1, percentFee: 0.005,
    settlement: '~30 seconds', settlementMs: 30_000,
    description: 'European payments area', nativeRailId: 'SEPA',
    color: 'blue', icon: '🇪🇺',
  },
  {
    id: 'sepa_instant', name: 'SEPA Instant', fullName: 'SEPA Instant Credit Transfer',
    category: 'Fiat', fixedFee: 0.20, percentFee: 0,
    settlement: '~10 seconds', settlementMs: 10_000,
    description: 'Instant EUR transfers within Europe',
    color: 'blue', icon: '⚡',
  },
  {
    id: 'swift', name: 'SWIFT', fullName: 'SWIFT Wire Transfer',
    category: 'Fiat', fixedFee: 2, percentFee: 0,
    settlement: '~60 seconds', settlementMs: 60_000,
    description: 'Global interbank messaging network', nativeRailId: 'SWIFT',
    color: 'amber', icon: '🌐',
  },
  {
    id: 'ach', name: 'ACH Standard', fullName: 'ACH Standard Transfer',
    category: 'Fiat', fixedFee: 0.25, percentFee: 0,
    settlement: '1–3 business days', settlementMs: 172_800_000,
    description: 'US domestic bank network',
    color: 'indigo', icon: '🏦',
  },
  {
    id: 'ach_same', name: 'ACH Same-Day', fullName: 'Same-Day ACH',
    category: 'Fiat', fixedFee: 1.00, percentFee: 0,
    settlement: 'Same business day', settlementMs: 28_800_000,
    description: 'Accelerated US domestic transfer',
    color: 'indigo', icon: '🏦',
  },
  {
    id: 'rtp', name: 'RTP', fullName: 'Real-Time Payments (TCH)',
    category: 'Fiat', fixedFee: 0.045, percentFee: 0,
    settlement: '<30 seconds', settlementMs: 30_000,
    description: 'US instant payment rail by The Clearing House',
    color: 'green', icon: '⚡',
  },
  {
    id: 'fednow', name: 'FedNow', fullName: 'FedNow Service',
    category: 'Fiat', fixedFee: 0.045, percentFee: 0,
    settlement: 'Instant', settlementMs: 5_000,
    description: 'US Federal Reserve instant payments',
    color: 'green', icon: '🏛',
  },
  {
    id: 'wise', name: 'Wise', fullName: 'Wise International Transfer',
    category: 'Processor', fixedFee: 0.50, percentFee: 0.0033, minFee: 0.50,
    settlement: '1–2 business days', settlementMs: 86_400_000,
    description: 'Mid-market rate with low markup',
    color: 'teal', icon: '💱',
  },
  {
    id: 'paypal', name: 'PayPal', fullName: 'PayPal Transfer',
    category: 'Processor', fixedFee: 0.30, percentFee: 0.029,
    settlement: 'Instant', settlementMs: 5_000,
    description: 'Consumer P2P and business payments',
    color: 'blue', icon: '🅿',
  },
  {
    id: 'venmo', name: 'Venmo', fullName: 'Venmo Instant Transfer',
    category: 'Processor', fixedFee: 0.25, percentFee: 0.0175, maxFee: 25,
    settlement: 'Instant', settlementMs: 5_000,
    description: 'US social payments platform',
    color: 'blue', icon: 'V',
  },
  {
    id: 'stripe', name: 'Stripe', fullName: 'Stripe Payout',
    category: 'Processor', fixedFee: 0.30, percentFee: 0.029,
    settlement: '2 business days', settlementMs: 172_800_000,
    description: 'API-first payment infrastructure',
    color: 'purple', icon: '▲',
  },
  {
    id: 'crypto', name: 'Auto Crypto', fullName: 'On-chain (Auto-select)',
    category: 'Crypto', fixedFee: 2, percentFee: 0.001,
    settlement: '~5 seconds', settlementMs: 5_000,
    description: 'Smart chain selection by MudraCore', nativeRailId: 'CRYPTO',
    color: 'purple', icon: '⛓',
  },
  {
    id: 'btc', name: 'Bitcoin', fullName: 'Bitcoin Network',
    category: 'Crypto', fixedFee: 2.50, percentFee: 0,
    settlement: '~10 minutes', settlementMs: 600_000,
    description: 'Proof-of-Work L1 blockchain',
    color: 'orange', icon: '₿',
  },
  {
    id: 'eth', name: 'Ethereum', fullName: 'Ethereum Mainnet',
    category: 'Crypto', fixedFee: 5.00, percentFee: 0,
    settlement: '~15 seconds', settlementMs: 15_000,
    description: 'EVM smart contract platform',
    color: 'purple', icon: 'Ξ',
  },
  {
    id: 'lightning', name: 'Lightning', fullName: 'Lightning Network',
    category: 'Crypto', fixedFee: 0.001, percentFee: 0.0001,
    settlement: '<1 second', settlementMs: 500,
    description: 'Bitcoin L2 — near-zero fee + instant',
    color: 'yellow', icon: '⚡',
  },
  {
    id: 'sol', name: 'Solana', fullName: 'Solana Network',
    category: 'Crypto', fixedFee: 0.00025, percentFee: 0,
    settlement: '<1 second', settlementMs: 400,
    description: 'High-throughput PoS blockchain',
    color: 'violet', icon: '◎',
  },
  {
    id: 'usdc_sol', name: 'USDC / SOL', fullName: 'USDC on Solana',
    category: 'Crypto', fixedFee: 0.00025, percentFee: 0,
    settlement: '<1 second', settlementMs: 400,
    description: 'Circle stablecoin on Solana',
    color: 'blue', icon: '🔵',
  },
  {
    id: 'usdt_trx', name: 'USDT / TRX', fullName: 'USDT on TRON',
    category: 'Crypto', fixedFee: 1.00, percentFee: 0,
    settlement: '~3 seconds', settlementMs: 3_000,
    description: 'Tether stablecoin on TRON network',
    color: 'red', icon: '🔴',
  },
];

function calcFee(rail: RailDef, amount: number): number {
  let fee = rail.fixedFee + rail.percentFee * amount;
  if (rail.minFee !== undefined) fee = Math.max(fee, rail.minFee);
  if (rail.maxFee !== undefined) fee = Math.min(fee, rail.maxFee);
  return fee;
}

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
});

// ─── Component ───────────────────────────────────────────────────────────────

const RealTimePayments: React.FC = () => {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedTxn, setSelectedTxn] = useState<Payment | null>(null);
  const [filterCategory, setFilterCategory] = useState<'All' | 'Fiat' | 'Crypto' | 'Processor'>('All');

  // ── fetchers ──────────────────────────────────────────────────────────────

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/accounts/`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAccounts(data.data);
      }
    } catch {/* silent */}
  }, []);

  const fetchPayments = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/transactions`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPayments(data.data.slice(0, 20));
      }
    } catch {/* silent */}
  }, []);

  useEffect(() => {
    // Seed demo connected accounts once on mount, then fetch everything
    fetch(`${API_BASE}/api/v1/accounts/seed-demo`, { method: 'POST', headers: authHeaders() })
      .catch(() => {/* silent if backend unreachable */})
      .finally(() => { fetchAccounts(); fetchPayments(); });
  }, []);

  // ── helpers ───────────────────────────────────────────────────────────────

  const statusBg = (s: string) =>
    ({ posted: 'bg-emerald-500', pending: 'bg-amber-400', failed: 'bg-red-400' }[s] || 'bg-slate-300');

  const statusColor = (s: string) =>
    ({ posted: 'text-emerald-600', pending: 'text-amber-500', failed: 'text-red-400' }[s] || 'text-slate-400');

  // ── derived rail data ─────────────────────────────────────────────────────

  // Use selected transaction amount, or default preview of $100
  const activeAmount = selectedTxn?.total_amount ?? 100;
  const activeRail = selectedTxn?.rail ?? null;
  const activeFee = selectedTxn?.fee ?? null;
  const isPreview = !selectedTxn;

  const comparisonRails = RAILS.map(r => ({
    ...r,
    computedFee: calcFee(r, activeAmount),
    isUsed: activeRail
      ? r.nativeRailId?.toUpperCase() === activeRail.toUpperCase()
      : false,
  })).sort((a, b) => a.computedFee - b.computedFee);

  const cheapestFee = comparisonRails[0]?.computedFee ?? 0;
  const fastestRail = [...comparisonRails].sort((a, b) => a.settlementMs - b.settlementMs)[0];
  const filteredRails = comparisonRails.filter(r => filterCategory === 'All' || r.category === filterCategory);
  const railRank = comparisonRails.findIndex(r => r.isUsed) + 1;
  const usedRailDef = comparisonRails.find(r => r.isUsed);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <div className="pt-20 max-w-[1440px] mx-auto px-4 md:px-6 pb-10">

        {/* ── Page header ── */}
        <div className="py-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-primary transition-colors text-sm font-medium mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-2 text-xs font-semibold tracking-widest uppercase"
            style={{ background: 'rgba(0,255,148,0.08)', border: '1px solid rgba(0,255,148,0.20)', color: '#006d43' }}>
            <Send className="h-3 w-3" /> Payment Orchestration
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary">
            Multi-Rail <span className="gradient-text">Transfers</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Select any transfer to analyse its rail cost intelligence</p>
        </div>

        {/* ── 2-column layout ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">

          {/* ════ LEFT: Accounts + Transfer history ════ */}
          <div className="flex flex-col gap-5">

            {/* Your Accounts */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white border border-outline-variant rounded-2xl p-5 shadow-premium"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Wallet className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <h2 className="text-sm font-semibold text-primary">Your Accounts</h2>
                </div>
                <button
                  onClick={fetchAccounts}
                  className="text-slate-400 hover:text-primary transition-colors p-1 rounded-lg hover:bg-slate-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                {accounts.length === 0 && (
                  <p className="text-slate-400 text-xs text-center py-4">No accounts found.</p>
                )}
                {accounts.map(acc => {
                  const provider = acc.provider ? PROVIDER_META[acc.provider] : null;
                  return (
                    <div key={acc.id} className="flex items-center justify-between bg-surface rounded-xl px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        {provider ? (
                          <span className={`w-7 h-7 rounded-lg border flex items-center justify-center text-sm flex-shrink-0 ${provider.bg}`}>
                            {provider.emoji}
                          </span>
                        ) : acc.type === 'bank' ? (
                          <Building2 className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                        ) : (
                          <CreditCard className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-primary text-xs font-medium truncate">{acc.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {provider && (
                              <span className={`text-[9px] font-bold uppercase tracking-wide ${provider.color}`}>
                                {provider.label}
                              </span>
                            )}
                            <span className="text-slate-400 text-[10px]">···{acc.account_number?.slice(-4)}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-primary font-semibold text-sm flex-shrink-0">${acc.balance?.toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Transfer History */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 }}
              className="bg-white border border-outline-variant rounded-2xl p-5 shadow-premium flex-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Activity className="w-3.5 h-3.5 text-secondary" />
                  </div>
                  <h2 className="text-sm font-semibold text-primary">Transfer History</h2>
                  {payments.length > 0 && (
                    <span className="text-[10px] bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 font-semibold">
                      {payments.length}
                    </span>
                  )}
                </div>
                <button
                  onClick={fetchPayments}
                  className="text-slate-400 hover:text-primary transition-colors p-1 rounded-lg hover:bg-slate-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Hint */}
              {payments.length > 0 && !selectedTxn && (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-accent/5 border border-accent/15">
                  <MousePointerClick className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                  <p className="text-[11px] text-secondary font-medium">Click a transfer to analyse its rail cost</p>
                </div>
              )}

              <div className="space-y-2 overflow-y-auto max-h-[480px] pr-0.5">
                {payments.length === 0 && (
                  <div className="text-center py-12">
                    <Activity className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-slate-400 text-xs">No transfers yet.</p>
                  </div>
                )}
                <AnimatePresence>
                  {payments.map((txn, i) => (
                    <motion.button
                      key={txn.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setSelectedTxn(prev => prev?.id === txn.id ? null : txn)}
                      className={`w-full text-left rounded-xl px-3.5 py-3 border transition-all ${
                        selectedTxn?.id === txn.id
                          ? 'bg-accent/5 border-accent/30 shadow-sm ring-1 ring-accent/20'
                          : 'bg-surface border-outline-variant hover:bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusBg(txn.status)}`} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-primary text-xs font-semibold capitalize">{txn.type}</span>
                              {txn.rail && (
                                <span className={`text-[9px] border rounded px-1.5 py-0.5 font-bold uppercase tracking-wide ${
                                  selectedTxn?.id === txn.id
                                    ? 'bg-accent/20 text-secondary border-accent/30'
                                    : 'bg-accent/10 text-secondary border-accent/20'
                                }`}>
                                  {txn.rail}
                                </span>
                              )}
                            </div>
                            <p className="text-slate-400 text-[10px] mt-0.5 truncate">
                              {txn.description || '—'}
                              {txn.timestamp && ` · ${new Date(txn.timestamp).toLocaleString()}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="text-primary font-bold text-sm">
                            ${txn.total_amount?.toLocaleString() || '—'}
                          </p>
                          <p className={`text-[10px] font-semibold ${statusColor(txn.status)}`}>
                            {txn.status}
                          </p>
                        </div>
                      </div>

                      {/* Selected indicator */}
                      {selectedTxn?.id === txn.id && (
                        <div className="mt-2 pt-2 border-t border-accent/20 flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3 text-secondary" />
                          <span className="text-[10px] text-secondary font-semibold">Analysing on the right →</span>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* ════ RIGHT: Rail Cost Intelligence ════ */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-outline-variant rounded-2xl shadow-premium overflow-hidden flex flex-col"
          >
            {/* Panel header */}
            <div className="px-6 py-5 border-b border-outline-variant">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center">
                    <BarChart2 className="w-[18px] h-[18px] text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-primary">Rail Cost Intelligence</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedTxn
                        ? `Analysing transfer · $${selectedTxn.total_amount.toLocaleString()} ${selectedTxn.currency}`
                        : 'Select a transfer from the left to analyse its rail cost'}
                    </p>
                  </div>
                </div>
                {isPreview && (
                  <span className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 rounded-full px-2.5 py-1 font-semibold">
                    Preview · $100
                  </span>
                )}
              </div>

              {/* Selected txn meta strip */}
              <AnimatePresence>
                {selectedTxn && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 grid grid-cols-3 gap-3"
                  >
                    <div className="bg-surface rounded-xl px-3.5 py-2.5">
                      <p className="text-[10px] text-slate-400 font-medium mb-0.5">Amount</p>
                      <p className="text-sm font-bold text-primary">
                        ${selectedTxn.total_amount.toLocaleString()} {selectedTxn.currency}
                      </p>
                    </div>
                    <div className="bg-surface rounded-xl px-3.5 py-2.5">
                      <p className="text-[10px] text-slate-400 font-medium mb-0.5">Rail Used</p>
                      <p className="text-sm font-bold text-secondary">{selectedTxn.rail || '—'}</p>
                    </div>
                    <div className="bg-surface rounded-xl px-3.5 py-2.5">
                      <p className="text-[10px] text-slate-400 font-medium mb-0.5">Fee Paid</p>
                      <p className="text-sm font-bold text-primary">
                        {activeFee !== null ? `$${activeFee.toFixed(2)}` : '—'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">

              {/* Stat cards — only when a transaction is selected */}
              <AnimatePresence>
                {selectedTxn && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-3"
                  >
                    {/* Used rail card */}
                    <div className="bg-accent/8 border border-accent/25 rounded-2xl p-4">
                      <p className="text-[10px] text-secondary font-bold uppercase tracking-wider mb-2">Transfer</p>
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-2xl font-bold text-primary">
                          {activeFee !== null ? `$${activeFee.toFixed(2)}` : '—'}
                        </span>
                        <span className="text-[10px] text-slate-400">fee paid</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 bg-white border border-accent/30 rounded-full px-2 py-0.5">
                        <CheckCircle className="w-3 h-3 text-secondary" />
                        <span className="text-[11px] font-bold text-secondary">
                          {selectedTxn.rail || 'SWIFT'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-2.5 text-[10px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        {usedRailDef?.settlement ?? '—'}
                      </div>
                    </div>

                    {[
                      {
                        label: 'Cheapest alternative',
                        value: cheapestFee < 0.01 ? `$${cheapestFee.toFixed(5)}` : `$${cheapestFee.toFixed(2)}`,
                        sub: comparisonRails[0]?.name ?? '—',
                        icon: <Award className="w-4 h-4" />,
                        colorIcon: 'text-secondary',
                        bg: 'bg-accent/5 border-accent/15',
                      },
                      {
                        label: 'Fastest rail',
                        value: fastestRail?.settlement ?? '—',
                        sub: fastestRail?.name ?? '—',
                        icon: <Zap className="w-4 h-4" />,
                        colorIcon: 'text-amber-500',
                        bg: 'bg-amber-50 border-amber-200',
                      },
                      {
                        label: 'Your rank by cost',
                        value: railRank > 0 ? `#${railRank} of ${comparisonRails.length}` : '— of ' + comparisonRails.length,
                        sub: railRank === 1 ? 'Optimal! 🎉'
                          : railRank > 0 ? `${railRank - 1} cheaper option${railRank - 1 > 1 ? 's' : ''}`
                          : 'Rail not matched',
                        icon: <TrendingUp className="w-4 h-4" />,
                        colorIcon: railRank <= 3 && railRank > 0 ? 'text-secondary' : 'text-slate-400',
                        bg: railRank <= 3 && railRank > 0 ? 'bg-accent/5 border-accent/15' : 'bg-surface border-outline-variant',
                      },
                    ].map(stat => (
                      <div key={stat.label} className={`border rounded-2xl p-4 ${stat.bg}`}>
                        <div className={`${stat.colorIcon} mb-2`}>{stat.icon}</div>
                        <p className="text-[10px] text-slate-400 font-medium">{stat.label}</p>
                        <p className="text-xl font-bold text-primary mt-0.5">{stat.value}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{stat.sub}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Preview stat summary — before selection */}
              {isPreview && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-surface border border-outline-variant rounded-2xl p-4 text-center">
                    <Zap className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
                    <p className="text-[10px] text-slate-400 font-medium mb-1">Fastest rail</p>
                    <p className="text-sm font-bold text-primary">{fastestRail?.settlement ?? '—'}</p>
                    <p className="text-[10px] text-slate-500">{fastestRail?.name}</p>
                  </div>
                  <div className="bg-surface border border-outline-variant rounded-2xl p-4 text-center">
                    <Award className="w-5 h-5 text-secondary mx-auto mb-1.5" />
                    <p className="text-[10px] text-slate-400 font-medium mb-1">Cheapest fee</p>
                    <p className="text-sm font-bold text-primary">
                      {cheapestFee < 0.01 ? `$${cheapestFee.toFixed(5)}` : `$${cheapestFee.toFixed(2)}`}
                    </p>
                    <p className="text-[10px] text-slate-500">{comparisonRails[0]?.name}</p>
                  </div>
                  <div className="bg-surface border border-outline-variant rounded-2xl p-4 text-center">
                    <BarChart2 className="w-5 h-5 text-blue-400 mx-auto mb-1.5" />
                    <p className="text-[10px] text-slate-400 font-medium mb-1">Rails available</p>
                    <p className="text-sm font-bold text-primary">{comparisonRails.length}</p>
                    <p className="text-[10px] text-slate-500">across 3 categories</p>
                  </div>
                </div>
              )}

              {/* Category filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400 font-medium">Filter:</span>
                {(['All', 'Fiat', 'Crypto', 'Processor'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                      filterCategory === cat
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-surface border-outline-variant text-slate-500 hover:border-primary/30 hover:text-primary'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                <span className="ml-auto text-[11px] text-slate-400">{filteredRails.length} rails</span>
              </div>

              {/* Comparison table */}
              <div className="rounded-2xl border border-outline-variant overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-surface border-b border-outline-variant">
                        <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-4 py-3">Rail</th>
                        <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-4 py-3">Category</th>
                        <th className="text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider px-4 py-3">
                          Fee for ${activeAmount.toLocaleString()}
                        </th>
                        {selectedTxn && (
                          <th className="text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider px-4 py-3">vs Yours</th>
                        )}
                        <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-4 py-3">Settlement</th>
                        <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {filteredRails.map((rail, idx) => {
                        const paidFee = activeFee ?? 0;
                        const diff = selectedTxn ? rail.computedFee - paidFee : 0;
                        const isCheapest = idx === 0 && filterCategory === 'All';
                        const isFastest = fastestRail?.id === rail.id && filterCategory === 'All';
                        return (
                          <tr
                            key={rail.id}
                            className={`transition-colors ${
                              rail.isUsed
                                ? 'bg-accent/5 hover:bg-accent/8'
                                : 'hover:bg-surface'
                            }`}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <span className="w-8 h-8 rounded-lg bg-surface border border-outline-variant flex items-center justify-center text-base flex-shrink-0">
                                  {rail.icon}
                                </span>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className={`text-xs font-semibold ${rail.isUsed ? 'text-secondary' : 'text-primary'}`}>
                                      {rail.name}
                                    </span>
                                    {rail.isUsed && (
                                      <span className="text-[9px] bg-accent text-primary font-bold px-1.5 py-0.5 rounded-full">
                                        USED
                                      </span>
                                    )}
                                    {isCheapest && !rail.isUsed && (
                                      <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-200 font-semibold px-1.5 py-0.5 rounded-full">
                                        CHEAPEST
                                      </span>
                                    )}
                                    {isFastest && !rail.isUsed && (
                                      <span className="text-[9px] bg-amber-50 text-amber-600 border border-amber-200 font-semibold px-1.5 py-0.5 rounded-full">
                                        FASTEST
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-400 truncate">{rail.fullName}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${
                                rail.category === 'Fiat'
                                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                                  : rail.category === 'Crypto'
                                  ? 'bg-purple-50 text-purple-600 border-purple-200'
                                  : 'bg-slate-50 text-slate-500 border-slate-200'
                              }`}>
                                {rail.category}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className={`text-sm font-bold font-mono ${
                                rail.isUsed
                                  ? 'text-secondary'
                                  : (selectedTxn && rail.computedFee < paidFee)
                                  ? 'text-emerald-600'
                                  : 'text-primary'
                              }`}>
                                ${rail.computedFee < 0.01
                                  ? rail.computedFee.toFixed(5)
                                  : rail.computedFee.toFixed(2)}
                              </span>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {rail.percentFee > 0
                                  ? `$${rail.fixedFee} + ${(rail.percentFee * 100).toFixed(2)}%`
                                  : `$${rail.fixedFee} flat`}
                              </p>
                            </td>
                            {selectedTxn && (
                              <td className="px-4 py-3 text-right">
                                {rail.isUsed ? (
                                  <span className="text-[11px] text-slate-400">—</span>
                                ) : (
                                  <span className={`text-xs font-semibold flex items-center justify-end gap-0.5 ${
                                    diff < 0 ? 'text-emerald-600' : diff === 0 ? 'text-slate-400' : 'text-red-400'
                                  }`}>
                                    {diff < 0
                                      ? <><TrendingDown className="w-3 h-3" /> save ${Math.abs(diff).toFixed(2)}</>
                                      : diff === 0 ? '='
                                      : <><TrendingUp className="w-3 h-3" /> +${diff.toFixed(2)}</>}
                                  </span>
                                )}
                              </td>
                            )}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-slate-300 flex-shrink-0" />
                                <span className="text-xs text-slate-500 whitespace-nowrap">{rail.settlement}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 hidden lg:table-cell">
                              <span className="text-[10px] text-slate-400 max-w-[160px] block truncate">
                                {rail.description}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cost spectrum */}
              <div className="bg-surface rounded-2xl border border-outline-variant p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-secondary" />
                  <h3 className="text-sm font-semibold text-primary">Cost Spectrum</h3>
                  <span className="text-[10px] text-slate-400">— cheapest to most expensive</span>
                </div>
                <div className="space-y-2">
                  {comparisonRails.slice(0, 12).map(rail => {
                    const maxFee = comparisonRails[comparisonRails.length - 1]?.computedFee || 1;
                    const width = Math.max(2, (rail.computedFee / maxFee) * 100);
                    const paidFee = activeFee ?? 0;
                    return (
                      <div key={rail.id} className="flex items-center gap-3">
                        <span className={`text-[10px] w-[88px] text-right flex-shrink-0 font-medium ${
                          rail.isUsed ? 'text-secondary' : 'text-slate-500'
                        }`}>
                          {rail.name}
                        </span>
                        <div className="flex-1 bg-outline-variant rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              rail.isUsed
                                ? 'bg-accent'
                                : (selectedTxn && rail.computedFee < paidFee)
                                ? 'bg-emerald-400'
                                : (!selectedTxn && rail.id === comparisonRails[0]?.id)
                                ? 'bg-emerald-400'
                                : 'bg-slate-300'
                            }`}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-primary w-14 flex-shrink-0">
                          ${rail.computedFee < 0.01 ? rail.computedFee.toFixed(5) : rail.computedFee.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-4 text-[10px] text-slate-400 flex-wrap">
                  {selectedTxn && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-1.5 rounded-full bg-accent inline-block" /> Rail used
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1.5 rounded-full bg-emerald-400 inline-block" /> Cheaper options
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1.5 rounded-full bg-slate-300 inline-block" /> More expensive
                  </span>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default RealTimePayments;
