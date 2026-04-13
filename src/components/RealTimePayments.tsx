import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  CreditCard,
  Wallet,
  Building2,
  Activity,
  TrendingUp,
  TrendingDown,
  Shield,
  Globe,
  RefreshCw,
  Send,
  Bitcoin,
  BarChart2,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:47291';

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

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
});

const RealTimePayments: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [fxRates, setFxRates] = useState<FXRates | null>(null);
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrices>({});
  const [convertResult, setConvertResult] = useState<string | null>(null);

  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMarket, setIsFetchingMarket] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ------------ data fetchers ------------------------------------

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
    } catch {/* silent */} finally {
      setIsFetchingMarket(false);
    }
  }, [currency]);

  const fetchCrypto = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/market/crypto`);
      const data = await res.json();
      if (data.success) setCryptoPrices(data.data || {});
    } catch {/* silent */}
  }, []);

  // ------------ convert helper -----------------------------------

  const convertCurrency = useCallback(async (from: string, to: string, amt: string) => {
    const num = parseFloat(amt);
    if (!num || !from || !to || from === to) { setConvertResult(null); return; }
    try {
      const res = await fetch(`${API_BASE}/api/market/convert?from=${from}&to=${to}&amount=${num}`);
      const data = await res.json();
      if (data.success) setConvertResult(`≈ ${parseFloat(data.converted).toFixed(2)} ${to}`);
    } catch {
      setConvertResult(null);
    }
  }, []);

  // ------------ send payment -------------------------------------

  const sendPayment = async () => {
    if (!fromAccount || !toAccount || !amount || fromAccount === toAccount) {
      setMessage({ type: 'error', text: 'Please fill all fields and select different accounts.' });
      return;
    }
    setIsLoading(true);
    setMessage(null);
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
        const rail = data.data?.rail || 'SWIFT';
        const fee = data.data?.fee ?? 0;
        setMessage({ type: 'success', text: `Transfer sent via ${rail} rail! Fee: $${fee}` });
        setAmount('');
        setDescription('');
        setConvertResult(null);
        fetchAccounts();
        fetchPayments();
      } else {
        setMessage({ type: 'error', text: data.error || data.message || 'Transfer failed' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: 'Network error. Is the server running?' });
    } finally {
      setIsLoading(false);
    }
  };

  // ------------ effects ------------------------------------------

  useEffect(() => { fetchAccounts(); fetchPayments(); fetchFX(); fetchCrypto(); }, []);
  useEffect(() => { if (currency) fetchFX(); }, [currency]);
  useEffect(() => {
    if (amount && currency && fxRates) {
      const targetCurrency = currency === 'USD' ? 'EUR' : 'USD';
      convertCurrency(currency, targetCurrency, amount);
    }
  }, [amount, currency, fxRates]);

  // ------------ helpers ------------------------------------------

  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || id.slice(0, 8);

  const statusColor = (s: string) => ({
    posted: 'text-secondary',
    pending: 'text-amber-400',
    failed: 'text-red-400',
  }[s] || 'text-[#68BA7F]');

  const cryptoChange = (change?: number) => {
    if (change == null) return null;
    return (
      <span className={`text-xs flex items-center gap-0.5 ${change >= 0 ? 'text-secondary' : 'text-red-400'}`}>
        {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {Math.abs(change).toFixed(2)}%
      </span>
    );
  };

  const commonCurrencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'SGD'];

  // ------------ render -------------------------------------------

  return (
    <div className="min-h-screen p-4 md:p-6 bg-surface">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-xs font-semibold tracking-widest uppercase"
            style={{ background: 'rgba(46,111,64,0.10)', border: '1px solid rgba(104,186,127,0.18)', color: '#68BA7F' }}
          >
            <Send className="h-3 w-3" />
            Payment Orchestration
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            Multi-Rail{' '}
            <span style={{
              background: 'linear-gradient(95deg, #ffffff 0%, #CFFFDC 45%, #68BA7F 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Transfers</span>
          </h1>
          <p className="text-sm md:text-base" style={{ color: 'rgba(255,255,255,0.40)' }}>
            Multi-rail transfers · Live FX rates · Crypto prices
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* LEFT: Transfer Form */}
          <div className="xl:col-span-1 space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-surface border border-outline-variant rounded-2xl p-5 "
            >
              <div className="flex items-center gap-2 mb-4">
                <Send className="w-5 h-5" style={{ color: '#68BA7F' }} />
                <h2 className="text-lg font-semibold text-primary">Send Money</h2>
              </div>

              {/* From Account */}
              <div className="mb-3">
                <label className="text-xs text-slate-400 mb-1 block">From Account</label>
                <select
                  value={fromAccount}
                  onChange={e => setFromAccount(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-primary text-sm focus:outline-none focus:border-[#68BA7F]"
                >
                  <option value="">Select account…</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} — ${a.balance.toLocaleString()} {a.currency}
                    </option>
                  ))}
                </select>
              </div>

              {/* To Account */}
              <div className="mb-3">
                <label className="text-xs text-slate-400 mb-1 block">To Account</label>
                <select
                  value={toAccount}
                  onChange={e => setToAccount(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-primary text-sm focus:outline-none focus:border-[#68BA7F]"
                >
                  <option value="">Select account…</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} — ${a.balance.toLocaleString()} {a.currency}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount + Currency */}
              <div className="mb-3 flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-slate-400 mb-1 block">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-primary text-sm focus:outline-none focus:border-[#68BA7F]"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Currency</label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="bg-surface border border-outline-variant rounded-lg px-2 py-2 text-primary text-sm focus:outline-none focus:border-[#68BA7F]"
                  >
                    {commonCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Live convert hint */}
              {convertResult && (
                <div className="mb-3 text-xs rounded-lg px-3 py-1.5"
                  style={{ color: '#CFFFDC', background: 'rgba(46,111,64,0.12)', border: '1px solid rgba(104,186,127,0.2)' }}>
                  {amount} {currency} {convertResult}
                </div>
              )}

              {/* Description */}
              <div className="mb-4">
                <label className="text-xs text-slate-400 mb-1 block">Description (optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Payment memo…"
                  className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-primary text-sm focus:outline-none focus:border-[#68BA7F]"
                />
              </div>

              {/* Status message */}
              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`mb-3 text-xs rounded-lg px-3 py-2 flex items-center gap-2 ${
                      message.type === 'success'
                        ? 'bg-brand-500/15 border border-brand-500/25 text-secondary'
                        : 'bg-red-500/10 border border-red-500/30 text-red-300'
                    }`}
                  >
                    {message.type === 'success' ? <CheckCircle className="w-3 h-3 flex-shrink-0" /> : <AlertCircle className="w-3 h-3 flex-shrink-0" />}
                    {message.text}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={sendPayment}
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Payment
                  </>
                )}
              </button>
            </motion.div>

            {/* Account Balances */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-surface border border-outline-variant rounded-2xl p-5 "
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#68BA7F]" />
                  <h2 className="text-sm font-semibold text-primary">Your Accounts</h2>
                </div>
                <button onClick={fetchAccounts} className="text-primary/30 hover:text-slate-500 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                {accounts.length === 0 && (
                  <p className="text-primary/30 text-xs text-center py-4">No accounts found. Create one first.</p>
                )}
                {accounts.map(acc => (
                  <div key={acc.id} className="flex items-center justify-between bg-surface rounded-xl px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      {acc.type === 'bank' ? <Building2 className="w-3.5 h-3.5 text-[#68BA7F]" /> : <CreditCard className="w-3.5 h-3.5 text-[#CFFFDC]" />}
                      <div>
                        <p className="text-primary text-xs font-medium">{acc.name}</p>
                        <p className="text-slate-400 text-[10px]">···{acc.account_number.slice(-4)}</p>
                      </div>
                    </div>
                    <p className="text-primary font-semibold text-sm">${acc.balance.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* CENTER: Recent Transactions */}
          <div className="xl:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-surface border border-outline-variant rounded-2xl p-5  h-full"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#68BA7F]" />
                  <h2 className="text-sm font-semibold text-primary">Transaction History</h2>
                </div>
                <button onClick={fetchPayments} className="text-primary/30 hover:text-slate-500 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2 overflow-y-auto max-h-[520px]">
                {payments.length === 0 && (
                  <p className="text-primary/30 text-xs text-center py-8">No transactions yet.</p>
                )}
                <AnimatePresence>
                  {payments.map((txn, i) => (
                    <motion.div
                      key={txn.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-surface hover:bg-white rounded-xl px-3 py-3 transition-colors border border-outline-variant"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${txn.status === 'posted' ? 'bg-brand-500' : 'bg-yellow-400'}`} />
                          <span className="text-primary text-xs font-medium capitalize">{txn.type}</span>
                        </div>
                        <span className="text-primary font-semibold text-sm">
                          ${txn.total_amount?.toLocaleString() || '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[10px]">{txn.description || '—'}</span>
                        <span className={`text-[10px] ${statusColor(txn.status)}`}>{txn.status}</span>
                      </div>
                      <p className="text-primary/20 text-[10px] mt-0.5">
                        {txn.timestamp ? new Date(txn.timestamp).toLocaleString() : ''}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Market Data */}
          <div className="xl:col-span-1 space-y-4">

            {/* FX Rates */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-surface border border-outline-variant rounded-2xl p-5 "
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#68BA7F]" />
                  <h2 className="text-sm font-semibold text-primary">Live FX Rates</h2>
                </div>
                <div className="flex items-center gap-2">
                  {isFetchingMarket && <RefreshCw className="w-3 h-3 text-[#68BA7F] animate-spin" />}
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="text-xs bg-surface border border-outline-variant rounded px-1.5 py-0.5 text-primary"
                  >
                    {commonCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {fxRates && Object.entries(fxRates.rates)
                  .filter(([code]) => code !== currency)
                  .slice(0, 10)
                  .map(([code, rate]) => (
                    <div key={code} className="bg-surface rounded-lg px-2.5 py-1.5 flex justify-between items-center">
                      <span className="text-slate-500 text-xs font-medium">{code}</span>
                      <span className="text-primary text-xs">{rate < 1 ? rate.toFixed(4) : rate.toFixed(2)}</span>
                    </div>
                  ))}
                {!fxRates && (
                  <div className="col-span-2 text-center text-primary/30 text-xs py-4">Loading rates…</div>
                )}
              </div>
              {fxRates && (
                <p className="text-primary/20 text-[10px] mt-2 text-right">
                  Updated: {new Date(fxRates.fetched_at).toLocaleTimeString()}
                </p>
              )}
            </motion.div>

            {/* Crypto Prices */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-surface border border-outline-variant rounded-2xl p-5 "
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bitcoin className="w-4 h-4 text-orange-400" />
                  <h2 className="text-sm font-semibold text-primary">Crypto Prices</h2>
                </div>
                <button onClick={fetchCrypto} className="text-primary/30 hover:text-slate-500">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                {Object.entries(cryptoPrices).map(([symbol, data]) => (
                  <div key={symbol} className="flex items-center justify-between bg-surface rounded-xl px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-surface rounded-full flex items-center justify-center">
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
                  <p className="text-primary/30 text-xs text-center py-3">Loading…</p>
                )}
              </div>
            </motion.div>

            {/* Payment Rails Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-surface border border-outline-variant rounded-2xl p-5 "
            >
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-yellow-400" />
                <h2 className="text-sm font-semibold text-primary">Payment Rails</h2>
              </div>
              <div className="space-y-2 text-xs">
                {[
                  { rail: 'UPI', fee: '$5 flat', latency: '~1s', color: 'text-secondary', desc: 'Unified Payments Interface' },
                  { rail: 'SEPA', fee: '0.5% + $1', latency: '~30s', color: 'text-[#68BA7F]', desc: 'Single Euro Payments Area' },
                  { rail: 'Crypto', fee: '0.1% + gas', latency: '~5s', color: 'text-[#CFFFDC]', desc: 'On-chain settlement' },
                  { rail: 'SWIFT', fee: '$2 flat', latency: '~60s', color: 'text-yellow-400', desc: 'International wire' },
                ].map(r => (
                  <div key={r.rail} className="flex items-center justify-between bg-surface rounded-lg px-3 py-2">
                    <div>
                      <span className={`font-semibold ${r.color}`}>{r.rail}</span>
                      <span className="text-slate-400 ml-1.5 text-[10px]">{r.desc}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500">{r.fee}</p>
                      <p className="text-slate-400 text-[10px]">{r.latency}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-primary/30">
                <Shield className="w-3 h-3" />
                Rail auto-selected based on amount, currency, and geography
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimePayments;
