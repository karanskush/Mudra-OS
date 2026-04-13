import React, { useMemo } from 'react';
import { TrendingUp, DollarSign, Shield, Zap, Database, Eye, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHealth } from '../contexts/HealthContext';

const metrics = [
  {
    icon: TrendingUp,
    label: 'Active Transactions',
    value: '2,847',
    change: '+12.3%',
    trend: 'up',
    colorClass: {
      bg: 'bg-[rgba(46,111,64,0.15)]',
      icon: 'text-[#68BA7F]',
      border: 'border-[rgba(104,186,127,0.25)]',
    },
  },
  {
    icon: DollarSign,
    label: 'Volume Processed',
    value: '₹42.5M',
    change: '+18.7%',
    trend: 'up',
    colorClass: {
      bg: 'bg-[rgba(207,255,220,0.08)]',
      icon: 'text-[#CFFFDC]',
      border: 'border-[rgba(207,255,220,0.2)]',
    },
  },
  {
    icon: Shield,
    label: 'Compliance Score',
    value: '99.8%',
    change: '+0.2%',
    trend: 'up',
    colorClass: {
      bg: 'bg-[rgba(46,111,64,0.12)]',
      icon: 'text-[#68BA7F]',
      border: 'border-[rgba(104,186,127,0.2)]',
    },
  },
  {
    icon: Zap,
    label: 'Avg Response Time',
    value: '45ms',
    change: '-12ms',
    trend: 'down',
    colorClass: {
      bg: 'bg-amber-500/15',
      icon: 'text-amber-400',
      border: 'border-amber-500/25',
    },
  },
];

const systemMetrics = [
  { label: 'Payment Success Rate', value: '99.97%', colorClass: 'text-[#CFFFDC]'  },
  { label: 'KYC Automation',       value: '94.2%',  colorClass: 'text-[#68BA7F]'  },
  { label: 'Cost Savings',         value: '₹2.3M',  colorClass: 'text-[#68BA7F]'  },
  { label: 'API Uptime',           value: '99.99%', colorClass: 'text-[#CFFFDC]'  },
];

const recentTransactions = [
  { id: 'TXN-001', amount: '₹25,000', status: 'completed', rail: 'UPI',    time: '2m ago'  },
  { id: 'TXN-002', amount: '€1,200',  status: 'pending',   rail: 'SEPA',   time: '5m ago'  },
  { id: 'TXN-003', amount: '0.05 BTC',status: 'completed', rail: 'Crypto', time: '8m ago'  },
  { id: 'TXN-004', amount: '₹50,000', status: 'failed',    rail: 'UPI',    time: '12m ago' },
];

// Stable bar heights — generated once, not on every render
const CHART_BARS = Array.from({ length: 24 }, (_, i) => ({
  height: 20 + ((i * 37 + 13) % 80), // deterministic pseudo-random heights
  highlight: i % 4 === 0,
}));

const statusConfig = {
  completed: { dot: 'bg-brand-300', text: 'text-brand-300' },
  pending:   { dot: 'bg-amber-400',   text: 'text-amber-400'   },
  failed:    { dot: 'bg-red-400',     text: 'text-red-400'     },
} as const;

const Analytics: React.FC = () => {
  const { health, databaseInfo } = useHealth();

  const healthStatus = useMemo(() => {
    if (!health) return { icon: <AlertTriangle className="h-4 w-4 text-slate-400" />, text: 'Unknown', color: 'text-slate-400' };
    switch (health.status) {
      case 'ok':       return { icon: <CheckCircle   className="h-4 w-4 text-brand-300" />, text: 'OK',       color: 'text-brand-300' };
      case 'degraded': return { icon: <AlertTriangle className="h-4 w-4 text-amber-400"   />, text: 'DEGRADED', color: 'text-amber-400'   };
      case 'error':    return { icon: <XCircle       className="h-4 w-4 text-red-400"     />, text: 'ERROR',    color: 'text-red-400'     };
      default:         return { icon: <AlertTriangle className="h-4 w-4 text-slate-400"   />, text: 'Unknown',  color: 'text-slate-400'   };
    }
  }, [health]);

  return (
    <section className="section-pad">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-xs font-semibold tracking-widest uppercase"
            style={{
              background: 'rgba(46,111,64,0.10)',
              border: '1px solid rgba(104,186,127,0.18)',
              color: '#68BA7F',
            }}
          >
            <TrendingUp className="h-3 w-3" />
            Real-Time Analytics
          </div>
          <h2 className="text-fluid-3xl font-bold text-white mb-4">
            Production-grade observability
            <span
              className="block"
              style={{
                background: 'linear-gradient(95deg, #ffffff 0%, #CFFFDC 45%, #68BA7F 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              that drives decisions
            </span>
          </h2>
          <p className="text-fluid-lg max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.38)' }}>
            Monitor your MudraCore platform with comprehensive analytics. Track performance,
            compliance, and business metrics in real-time.
          </p>
        </div>

        {/* Dashboard card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card rounded-3xl p-8"
        >
          {/* Dashboard header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-fluid-xl font-bold text-white mb-1">MudraCore OS Dashboard</h3>
              <p className="text-slate-400 text-sm">Real-time platform monitoring and analytics</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="status-dot-online" />
              <span className="text-xs text-slate-400">Live · updated now</span>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 stagger">
            {metrics.map((metric, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="glass-card rounded-2xl p-5 cursor-default"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 ${metric.colorClass.bg} border ${metric.colorClass.border} rounded-xl flex items-center justify-center`}>
                    <metric.icon className={`h-5 w-5 ${metric.colorClass.icon}`} />
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    metric.trend === 'up'
                      ? 'bg-brand-500/10 text-brand-300'
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {metric.change}
                  </span>
                </div>
                <div className="text-2xl font-bold text-white mb-0.5">{metric.value}</div>
                <div className="text-slate-400 text-sm">{metric.label}</div>
              </motion.div>
            ))}
          </div>

          {/* System health + recent txns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* System health */}
            <div className="glass-card rounded-2xl p-6">
              <h4 className="text-base font-semibold text-white flex items-center gap-2 mb-5">
                <Database className="h-4 w-4 text-[#68BA7F]" />
                System Health
              </h4>
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">Backend Status</span>
                  <div className="flex items-center gap-1.5">
                    {healthStatus.icon}
                    <span className={`text-sm font-semibold ${healthStatus.color}`}>{healthStatus.text}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">Database Connection</span>
                  <div className="flex items-center gap-1.5">
                    {databaseInfo?.connected
                      ? <CheckCircle className="h-4 w-4 text-brand-300" />
                      : <XCircle    className="h-4 w-4 text-red-400"     />}
                    <span className={`text-sm font-semibold ${databaseInfo?.connected ? 'text-brand-300' : 'text-red-400'}`}>
                      {databaseInfo?.connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>

                {databaseInfo && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Connection Pool</span>
                    <span className="text-[#68BA7F] text-sm font-semibold">
                      {databaseInfo.in_use ?? 0} / {databaseInfo.max_open_connections ?? 0}
                    </span>
                  </div>
                )}

                <div className="border-t border-white/5 pt-3.5 space-y-3">
                  {systemMetrics.map((m, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-slate-300 text-sm">{m.label}</span>
                      <span className={`text-sm font-semibold ${m.colorClass}`}>{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent transactions */}
            <div className="glass-card rounded-2xl p-6">
              <h4 className="text-base font-semibold text-white flex items-center gap-2 mb-5">
                <Eye className="h-4 w-4 text-[#68BA7F]" />
                Recent Transactions
              </h4>
              <div className="space-y-2.5">
                {recentTransactions.map((txn, i) => {
                  const cfg = statusConfig[txn.status as keyof typeof statusConfig];
                  return (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] transition-colors">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                        <div>
                          <div className="text-white text-sm font-medium">{txn.id}</div>
                          <div className="text-slate-500 text-xs">{txn.rail} · {txn.time}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold text-sm">{txn.amount}</div>
                        <div className={`text-xs capitalize ${cfg.text}`}>{txn.status}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-base font-semibold text-white">Transaction Volume (24h)</h4>
              <div className="flex gap-1.5">
                {['24H', '7D', '30D'].map((label, i) => (
                  <button
                    key={label}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors`}
                    style={i === 0
                      ? { background: 'rgba(46,111,64,0.5)', color: '#CFFFDC', border: '1px solid rgba(104,186,127,0.3)' }
                      : { color: 'rgba(207,255,220,0.45)' }
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-36 flex items-end justify-between gap-1">
              {CHART_BARS.map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-sm transition-all duration-300 hover:opacity-80"
                    style={{
                      background: bar.highlight
                        ? 'linear-gradient(to top, #2E6F40, #CFFFDC)'
                        : 'linear-gradient(to top, rgba(46,111,64,0.45), rgba(104,186,127,0.35))',
                      height: `${bar.height}%`,
                    }}
                  />
                  {bar.highlight && (
                    <span className="text-xs text-slate-500">{i}:00</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 text-center"
        >
          <div
            className="rounded-2xl p-10 max-w-3xl mx-auto"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <h3 className="text-2xl font-bold text-white mb-3">Ready to see your data in action?</h3>
            <p className="text-sm mb-7 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.38)' }}>
              Experience real-time analytics with our comprehensive monitoring suite.
              Track every transaction, monitor compliance, and optimize performance.
            </p>
            <button className="btn-primary">
              View Live Dashboard
            </button>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Analytics;
