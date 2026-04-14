import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, ArrowRight, Clock, CheckCircle, AlertCircle, Zap,
  CreditCard, Wallet, Building2, Activity, TrendingUp, TrendingDown,
  Shield, Globe, RefreshCw, Send, Bitcoin, BarChart2, ChevronDown,
  Sparkles, Award, X,
} from 'lucide-react';

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
}

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

interface FXRates {
  base: string;
  rates: Record<string, number>;
  fetched_at: string;
}

interface CryptoPrice {
  usd: number;
  usd_24h_change?: number;
}

interface CryptoPrices {
  BTC?: CryptoPrice;
  ETH?: CryptoPrice;
  USDC?: CryptoPrice;
  SOL?: CryptoPrice;
}

interface LastTransfer {
  amount: number;
  currency: string;
  fromName: string;
  toName: string;
  rail: string;
  fee: number;
  latency: string;
}

// ─── Rail Definitions (real-world fee data) ───────────────────────────────────

interface RailDef {
  id: string;
  name: string;
  fullName: string;
  category: 'Fiat' | 'Crypto' | 'Processor';
  fixedFee: number;       // USD
  percentFee: number;     // decimal (0.029 = 2.9%)
  minFee?: number;
  maxFee?: number;
  settlement: string;
  settlementMs: number;   // for "fastest" badge
  description: string;
  nativeRailId?: string;  // matches backend rail string
  color: string;
  icon: string;
}

const RAILS: RailDef[] = [
  // ── Fiat ──────────────────────────────────────────────────────────────────
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
    description: 'European payments area (SEPA simulation)', nativeRailId: 'SEPA',
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
  // ── Processors ────────────────────────────────────────────────────────────
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
  // ── Crypto ────────────────────────────────────────────────────────────────
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

// ─── Auth helper ─────────────────────────────────────────────────────────────

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
});

// ─── Component ───────────────────────────────────────────────────────────────

const RealTimePayments: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [fxRates, setFxRates] = useState<FXRates | null>(null);
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrices>({});
  const [convertResult, setConvertResult] = useState<string | null>(null);
  const [lastTransfer, setLastTransfer] = useState<LastTransfer | null>(null);

  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMarket, setIsFetchingMarket] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [filterCategory, setFilterCategory] = useState<'All' | 'Fiat' | 'Crypto' | 'Processor'>('All');

  // ── fetchers ──────────────────────────────────────────────────────────────

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/accounts/`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAccounts(data.data);
        if (data.data.length >= 2 && !fromAccount) {
          setFromAccount(data.data[0].id);
          setToAccount(data.data[1].id);
        }
      }
    } catch {/* silent */}
  }, [fromAccount]);

  const fetchPayments = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/transactions`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPayments(data.data.slice(0, 10));
      }
    } catch {/* silent */}
  }, []);

  const fetchFX = useCallback(async () => {
    setIsFetchingMarket(true);
    try {
      const res = await fetch(`${API_BASE}/api/market/fx?base=${currency}`);
      const data = await res.json();
      if (data.success) setFxRates(data);
    } catch {/* silent */} finally { setIsFetchingMarket(false); }
  }, [currency]);

  const fetchCrypto = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/market/crypto`);
      const data = await res.json();
      if (data.success) setCryptoPrices(data.data || {});
    } catch {/* silent */}
  }, []);

  const convertCurrency = useCallback(async (from: string, to: string, amt: string) => {
    const num = parseFloat(amt);
    if (!num || !from || !to || from === to) { setConvertResult(null); return; }
    try {
      const res = await fetch(`${API_BASE}/api/market/convert?from=${from}&to=${to}&amount=${num}`);
      const data = await res.json();
      if (data.success) setConvertResult(`≈ ${parseFloat(data.converted).toFixed(2)} ${to}`);
    } catch { setConvertResult(null); }
  }, []);

  // ── send payment ──────────────────────────────────────────────────────────

  const sendPayment = async () => {
    if (!fromAccount || !toAccount || !amount || fromAccount === toAccount) {
      setMessage({ type: 'error', text: 'Please fill all fields and select different accounts.' });
      return;
    }
    setIsLoading(true);
    setMessage(null);
    setLastTransfer(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/payments`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          from_account_id: fromAccount,
          to_account_id: toAccount,
          amount: parseFloat(amount),
          currency,
          description: description || 'Transfer',
        }),
      });
      const data = await res.json();
      if (data.success) {
        const rail: string = data.data?.rail || 'SWIFT';
        const fee: number = data.data?.fee ?? 0;
        const latency: string = data.data?.latency || '—';
        const fromName = accounts.find(a => a.id === fromAccount)?.name || 'Account';
        const toName = accounts.find(a => a.id === toAccount)?.name || 'Account';

        setLastTransfer({
          amount: parseFloat(amount),
          currency,
          fromName,
          toName,
          rail,
          fee,
          latency,
        });
        setMessage({ type: 'success', text: `Sent via ${rail} · fee $${fee.toFixed(2)} · settles in ${latency}` });
        setAmount('');
        setDescription('');
        setConvertResult(null);
        fetchAccounts();
        fetchPayments();
      } else {
        setMessage({ type: 'error', text: data.error || data.message || 'Transfer failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Is the server running?' });
    } finally {
      setIsLoading(false);
    }
  };

  // ── effects ───────────────────────────────────────────────────────────────

  useEffect(() => { fetchAccounts(); fetchPayments(); fetchFX(); fetchCrypto(); }, []);
  useEffect(() => { if (currency) fetchFX(); }, [currency]);
  useEffect(() => {
    if (amount && currency && fxRates) {
      const target = currency === 'USD' ? 'EUR' : 'USD';
      convertCurrency(currency, target, amount);
    }
  }, [amount, currency, fxRates]);

  // ── helpers ───────────────────────────────────────────────────────────────

  const statusColor = (s: string) =>
    ({ posted: 'text-secondary', pending: 'text-amber-500', failed: 'text-red-400' }[s] || 'text-secondary');

  const cryptoChange = (change?: number) => {
    if (change == null) return null;
    return (
      <span className={`text-[10px] flex items-center gap-0.5 ${change >= 0 ? 'text-secondary' : 'text-red-400'}`}>
        {change >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
        {Math.abs(change).toFixed(2)}%
      </span>
    );
  };

  const commonCurrencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'SGD'];

  // ── cost comparison data ──────────────────────────────────────────────────

  const comparisonRails = lastTransfer
    ? RAILS.map(r => ({
        ...r,
        computedFee: calcFee(r, lastTransfer.amount),
        isUsed: r.nativeRailId?.toUpperCase() === lastTransfer.rail.toUpperCase(),
      })).sort((a, b) => a.computedFee - b.computedFee)
    : [];

  const cheapestFee = comparisonRails[0]?.computedFee ?? 0;
  const fastestRail = comparisonRails.length
    ? [...comparisonRails].sort((a, b) => a.settlementMs - b.settlementMs)[0]
    : null;

  const filteredRails = comparisonRails.filter(r =>
    filterCategory === 'All' || r.category === filterCategory
  );

  const usedRailData = comparisonRails.find(r => r.isUsed);
  const railRank = comparisonRails.findIndex(r => r.isUsed) + 1;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-xs font-semibold tracking-widest uppercase"
            style={{ background: 'rgba(0,255,148,0.08)', border: '1px solid rgba(0,255,148,0.20)', color: '#006d43' }}>
            <Send className="h-3 w-3" /> Payment Orchestration
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            Multi-Rail{' '}
            <span className="gradient-text">Transfers</span>
          </h1>
          <p className="text-sm text-slate-500">Send money · compare every rail · pick the optimal path</p>
        </div>

        {/* ── 3-col grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* LEFT: form + accounts */}
          <div className="xl:col-span-1 space-y-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-white border border-outline-variant rounded-2xl p-5 shadow-premium">
              <div className="flex items-center gap-2 mb-4">
                <Send className="w-4 h-4 text-secondary" />
                <h2 className="text-base font-semibold text-primary">Send Money</h2>
              </div>

              <div className="mb-3">
                <label className="text-xs text-slate-400 mb-1 block">From Account</label>
                <select value={fromAccount} onChange={e => setFromAccount(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-xl px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-accent/50">
                  <option value="">Select account…</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} — ${a.balance.toLocaleString()} {a.currency}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="text-xs text-slate-400 mb-1 block">To Account</label>
                <select value={toAccount} onChange={e => setToAccount(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-xl px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-accent/50">
                  <option value="">Select account…</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} — ${a.balance.toLocaleString()} {a.currency}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3 flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-slate-400 mb-1 block">Amount</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-surface border border-outline-variant rounded-xl px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-accent/50" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Currency</label>
                  <select value={currency} onChange={e => setCurrency(e.target.value)}
                    className="bg-surface border border-outline-variant rounded-xl px-2 py-2.5 text-primary text-sm focus:outline-none">
                    {commonCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {convertResult && (
                <div className="mb-3 text-xs rounded-xl px-3 py-2 bg-accent/10 border border-accent/20 text-secondary">
                  {amount} {currency} {convertResult}
                </div>
              )}

              <div className="mb-4">
                <label className="text-xs text-slate-400 mb-1 block">Description (optional)</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Payment memo…"
                  className="w-full bg-surface border border-outline-variant rounded-xl px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-accent/50" />
              </div>

              <AnimatePresence>
                {message && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`mb-3 text-xs rounded-xl px-3 py-2.5 flex items-start gap-2 ${
                      message.type === 'success'
                        ? 'bg-accent/10 border border-accent/20 text-secondary'
                        : 'bg-red-50 border border-red-200 text-red-600'
                    }`}>
                    {message.type === 'success'
                      ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />}
                    {message.text}
                  </motion.div>
                )}
              </AnimatePresence>

              <button onClick={sendPayment} disabled={isLoading}
                className="btn-primary w-full disabled:opacity-50">
                {isLoading
                  ? <RefreshCw className="w-4 h-4 animate-spin" />
                  : <><Send className="w-4 h-4" /> Send Payment</>}
              </button>
            </motion.div>

            {/* Accounts */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="bg-white border border-outline-variant rounded-2xl p-5 shadow-premium">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-secondary" />
                  <h2 className="text-sm font-semibold text-primary">Your Accounts</h2>
                </div>
                <button onClick={fetchAccounts} className="text-slate-400 hover:text-primary transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                {accounts.length === 0 && (
                  <p className="text-slate-400 text-xs text-center py-4">No accounts found.</p>
                )}
                {accounts.map(acc => (
                  <div key={acc.id} className="flex items-center justify-between bg-surface rounded-xl px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      {acc.type === 'bank'
                        ? <Building2 className="w-3.5 h-3.5 text-secondary" />
                        : <CreditCard className="w-3.5 h-3.5 text-slate-400" />}
                      <div>
                        <p className="text-primary text-xs font-medium">{acc.name}</p>
                        <p className="text-slate-400 text-[10px]">···{acc.account_number?.slice(-4)}</p>
                      </div>
                    </div>
                    <p className="text-primary font-semibold text-sm">${acc.balance?.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* CENTER: Transaction History */}
          <div className="xl:col-span-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="bg-white border border-outline-variant rounded-2xl p-5 shadow-premium h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-secondary" />
                  <h2 className="text-sm font-semibold text-primary">Transaction History</h2>
                </div>
                <button onClick={fetchPayments} className="text-slate-400 hover:text-primary transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2 overflow-y-auto max-h-[480px]">
                {payments.length === 0 && (
                  <p className="text-slate-400 text-xs text-center py-8">No transactions yet.</p>
                )}
                <AnimatePresence>
                  {payments.map((txn, i) => (
                    <motion.div key={txn.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-surface hover:bg-white border border-outline-variant rounded-xl px-3 py-3 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${txn.status === 'posted' ? 'bg-accent' : 'bg-amber-400'}`} />
                          <span className="text-primary text-xs font-medium capitalize">{txn.type}</span>
                          {txn.rail && (
                            <span className="text-[9px] bg-accent/10 text-secondary border border-accent/20 rounded px-1.5 py-0.5 font-semibold">
                              {txn.rail}
                            </span>
                          )}
                        </div>
                        <span className="text-primary font-semibold text-sm">
                          ${txn.total_amount?.toLocaleString() || '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[10px]">{txn.description || '—'}</span>
                        <span className={`text-[10px] font-medium ${statusColor(txn.status)}`}>{txn.status}</span>
                      </div>
                      {txn.timestamp && (
                        <p className="text-slate-300 text-[10px] mt-0.5">
                          {new Date(txn.timestamp).toLocaleString()}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Market data */}
          <div className="xl:col-span-1 space-y-4">

            {/* FX Rates */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="bg-white border border-outline-variant rounded-2xl p-5 shadow-premium">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-secondary" />
                  <h2 className="text-sm font-semibold text-primary">Live FX Rates</h2>
                </div>
                <div className="flex items-center gap-2">
                  {isFetchingMarket && <RefreshCw className="w-3 h-3 text-secondary animate-spin" />}
                  <select value={currency} onChange={e => setCurrency(e.target.value)}
                    className="text-xs bg-surface border border-outline-variant rounded-lg px-2 py-1 text-primary focus:outline-none">
                    {commonCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {fxRates && Object.entries(fxRates.rates).filter(([code]) => code !== currency).slice(0, 10)
                  .map(([code, rate]) => (
                    <div key={code} className="bg-surface rounded-lg px-2.5 py-1.5 flex justify-between items-center">
                      <span className="text-slate-500 text-xs font-medium">{code}</span>
                      <span className="text-primary text-xs font-mono">{rate < 1 ? rate.toFixed(4) : rate.toFixed(2)}</span>
                    </div>
                  ))}
                {!fxRates && <div className="col-span-2 text-center text-slate-400 text-xs py-4">Loading rates…</div>}
              </div>
              {fxRates && (
                <p className="text-slate-300 text-[10px] mt-2 text-right">
                  Updated {new Date(fxRates.fetched_at).toLocaleTimeString()}
                </p>
              )}
            </motion.div>

            {/* Crypto Prices */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
              className="bg-white border border-outline-variant rounded-2xl p-5 shadow-premium">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bitcoin className="w-4 h-4 text-orange-400" />
                  <h2 className="text-sm font-semibold text-primary">Crypto Prices</h2>
                </div>
                <button onClick={fetchCrypto} className="text-slate-400 hover:text-primary">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                {Object.entries(cryptoPrices).map(([symbol, data]) => (
                  <div key={symbol} className="flex items-center justify-between bg-surface rounded-xl px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-surface border border-outline-variant rounded-full flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary">{symbol.slice(0, 2)}</span>
                      </div>
                      <span className="text-primary text-xs font-medium">{symbol}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-primary text-xs font-semibold">${data?.usd?.toLocaleString()}</p>
                      {cryptoChange(data?.usd_24h_change)}
                    </div>
                  </div>
                ))}
                {Object.keys(cryptoPrices).length === 0 && (
                  <p className="text-slate-400 text-xs text-center py-3">Loading prices…</p>
                )}
              </div>
            </motion.div>

            {/* Rail quick reference */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="bg-white border border-outline-variant rounded-2xl p-5 shadow-premium">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-primary">Active Rails</h2>
              </div>
              <div className="space-y-2">
                {[
                  { rail: 'UPI', fee: '$5 flat', latency: '~1s', desc: 'Unified Payments Interface' },
                  { rail: 'SEPA', fee: '$1 + 0.5%', latency: '~30s', desc: 'Euro payments area' },
                  { rail: 'Crypto', fee: '$2 + 0.1%', latency: '~5s', desc: 'On-chain settlement' },
                  { rail: 'SWIFT', fee: '$2 flat', latency: '~60s', desc: 'International wire' },
                ].map(r => (
                  <div key={r.rail} className="flex items-center justify-between bg-surface rounded-xl px-3 py-2.5">
                    <div>
                      <span className="text-xs font-semibold text-secondary">{r.rail}</span>
                      <span className="text-slate-400 ml-1.5 text-[10px]">{r.desc}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-primary text-xs font-medium">{r.fee}</p>
                      <p className="text-slate-400 text-[10px]">{r.latency}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400">
                <Shield className="w-3 h-3" /> Rail auto-selected based on amount, currency & geography
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Rail Cost Intelligence Panel ─────────────────────────────────── */}
        <AnimatePresence>
          {lastTransfer && (
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 32 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="bg-white border border-outline-variant rounded-2xl shadow-premium overflow-hidden"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center">
                    <BarChart2 className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-primary">Rail Cost Intelligence</h2>
                    <p className="text-xs text-slate-400">
                      ${lastTransfer.amount.toLocaleString()} {lastTransfer.currency} · {lastTransfer.fromName} → {lastTransfer.toName}
                    </p>
                  </div>
                </div>
                <button onClick={() => setLastTransfer(null)}
                  className="w-7 h-7 rounded-lg bg-surface hover:bg-slate-100 flex items-center justify-center transition-colors">
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              <div className="p-6 space-y-6">

                {/* Transfer summary row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Used rail card */}
                  <div className="md:col-span-1 bg-accent/8 border border-accent/25 rounded-2xl p-4">
                    <p className="text-xs text-secondary font-semibold uppercase tracking-wider mb-2">Your Transfer</p>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-2xl font-bold text-primary">${lastTransfer.fee.toFixed(2)}</span>
                      <span className="text-xs text-slate-400">fee paid</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 bg-white border border-accent/30 rounded-full px-2.5 py-1 mt-1">
                      <CheckCircle className="w-3 h-3 text-secondary" />
                      <span className="text-xs font-semibold text-secondary">{lastTransfer.rail}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-3 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" /> Settles in {lastTransfer.latency}
                    </div>
                  </div>

                  {/* Stat cards */}
                  {[
                    {
                      label: 'Cheapest alternative',
                      value: `$${cheapestFee.toFixed(4) === '0.0003' ? cheapestFee.toFixed(5) : cheapestFee < 0.01 ? cheapestFee.toFixed(5) : cheapestFee.toFixed(2)}`,
                      sub: comparisonRails[0]?.name ?? '—',
                      good: cheapestFee < lastTransfer.fee,
                      icon: <Award className="w-4 h-4" />,
                      color: 'text-secondary',
                      bg: 'bg-accent/5 border-accent/15',
                    },
                    {
                      label: 'Fastest rail',
                      value: fastestRail?.settlement ?? '—',
                      sub: fastestRail?.name ?? '—',
                      good: true,
                      icon: <Zap className="w-4 h-4" />,
                      color: 'text-amber-500',
                      bg: 'bg-amber-50 border-amber-200',
                    },
                    {
                      label: 'Your rank by cost',
                      value: `#${railRank} of ${comparisonRails.length}`,
                      sub: railRank === 1 ? 'Optimal choice! 🎉' : `${railRank - 1} cheaper option${railRank - 1 > 1 ? 's' : ''}`,
                      good: railRank <= 3,
                      icon: <TrendingUp className="w-4 h-4" />,
                      color: railRank <= 3 ? 'text-secondary' : 'text-slate-400',
                      bg: railRank <= 3 ? 'bg-accent/5 border-accent/15' : 'bg-surface border-outline-variant',
                    },
                  ].map(stat => (
                    <div key={stat.label} className={`border rounded-2xl p-4 ${stat.bg}`}>
                      <div className={`${stat.color} mb-2`}>{stat.icon}</div>
                      <p className="text-[11px] text-slate-400 font-medium">{stat.label}</p>
                      <p className="text-xl font-bold text-primary mt-0.5">{stat.value}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{stat.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Category filter */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-400 font-medium mr-1">Filter:</span>
                  {(['All', 'Fiat', 'Crypto', 'Processor'] as const).map(cat => (
                    <button key={cat} onClick={() => setFilterCategory(cat)}
                      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                        filterCategory === cat
                          ? 'bg-primary text-white border-primary'
                          : 'bg-surface border-outline-variant text-slate-500 hover:border-primary/30'
                      }`}>
                      {cat}
                    </button>
                  ))}
                  <span className="ml-auto text-[11px] text-slate-400">{filteredRails.length} rails shown</span>
                </div>

                {/* Comparison table */}
                <div className="rounded-2xl border border-outline-variant overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-surface border-b border-outline-variant">
                          <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Rail</th>
                          <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Category</th>
                          <th className="text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Fee for ${lastTransfer.amount.toLocaleString()}</th>
                          <th className="text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">vs Yours</th>
                          <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Settlement</th>
                          <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant">
                        {filteredRails.map((rail, idx) => {
                          const diff = rail.computedFee - lastTransfer.fee;
                          const isCheapest = idx === 0 && filterCategory === 'All';
                          const isFastest = fastestRail?.id === rail.id && filterCategory === 'All';
                          return (
                            <tr key={rail.id}
                              className={`transition-colors ${
                                rail.isUsed
                                  ? 'bg-accent/5 hover:bg-accent/8'
                                  : 'hover:bg-surface'
                              }`}>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <span className="w-7 h-7 rounded-lg bg-surface border border-outline-variant flex items-center justify-center text-sm font-bold">
                                    {rail.icon}
                                  </span>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className={`text-sm font-semibold ${rail.isUsed ? 'text-secondary' : 'text-primary'}`}>
                                        {rail.name}
                                      </span>
                                      {rail.isUsed && (
                                        <span className="text-[9px] bg-accent text-primary font-bold px-1.5 py-0.5 rounded-full">
                                          USED
                                        </span>
                                      )}
                                      {isCheapest && !rail.isUsed && (
                                        <span className="text-[9px] bg-secondary/10 text-secondary border border-secondary/20 font-semibold px-1.5 py-0.5 rounded-full">
                                          CHEAPEST
                                        </span>
                                      )}
                                      {isFastest && !rail.isUsed && (
                                        <span className="text-[9px] bg-amber-50 text-amber-600 border border-amber-200 font-semibold px-1.5 py-0.5 rounded-full">
                                          FASTEST
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-400">{rail.fullName}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-[11px] font-medium px-2 py-1 rounded-full border ${
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
                                    : rail.computedFee < lastTransfer.fee
                                    ? 'text-secondary'
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
                              <td className="px-4 py-3 text-right">
                                {rail.isUsed ? (
                                  <span className="text-[11px] text-slate-400">—</span>
                                ) : (
                                  <span className={`text-xs font-semibold flex items-center justify-end gap-0.5 ${
                                    diff < 0 ? 'text-secondary' : diff === 0 ? 'text-slate-400' : 'text-red-400'
                                  }`}>
                                    {diff < 0 ? (
                                      <><TrendingDown className="w-3 h-3" /> save ${Math.abs(diff).toFixed(2)}</>
                                    ) : diff === 0 ? '=' : (
                                      <><TrendingUp className="w-3 h-3" /> +${diff.toFixed(2)}</>
                                    )}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3 h-3 text-slate-300 flex-shrink-0" />
                                  <span className="text-xs text-slate-500">{rail.settlement}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-[11px] text-slate-400 max-w-[160px] block truncate">
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

                {/* Speed vs cost scatter — visual bar chart */}
                <div className="bg-surface rounded-2xl border border-outline-variant p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-secondary" />
                    <h3 className="text-sm font-semibold text-primary">Cost Spectrum — cheapest to most expensive</h3>
                  </div>
                  <div className="space-y-2">
                    {comparisonRails.slice(0, 10).map(rail => {
                      const maxFee = comparisonRails[comparisonRails.length - 1]?.computedFee || 1;
                      const width = Math.max(2, (rail.computedFee / maxFee) * 100);
                      return (
                        <div key={rail.id} className="flex items-center gap-3">
                          <span className={`text-[11px] w-24 text-right flex-shrink-0 font-medium ${
                            rail.isUsed ? 'text-secondary' : 'text-slate-500'
                          }`}>
                            {rail.name}
                          </span>
                          <div className="flex-1 bg-outline-variant rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                rail.isUsed
                                  ? 'bg-accent'
                                  : rail.computedFee < lastTransfer.fee
                                  ? 'bg-secondary/60'
                                  : 'bg-slate-300'
                              }`}
                              style={{ width: `${width}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono text-primary w-16 flex-shrink-0">
                            ${rail.computedFee < 0.01
                              ? rail.computedFee.toFixed(5)
                              : rail.computedFee.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-full bg-accent inline-block" /> Your rail</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-full bg-secondary/60 inline-block" /> Cheaper alternatives</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-full bg-slate-300 inline-block" /> More expensive</span>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default RealTimePayments;
