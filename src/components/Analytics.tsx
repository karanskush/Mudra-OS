import React from 'react';
import { TrendingUp, Users, Eye, MousePointer, DollarSign, Shield, Zap, Database, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useHealth } from '../contexts/HealthContext';

const metrics = [
  {
    icon: Users,
    label: 'Active Transactions',
    value: '2,847',
    change: '+12.3%',
    trend: 'up',
    color: 'blue',
  },
  {
    icon: DollarSign,
    label: 'Volume Processed',
    value: '₹42.5M',
    change: '+18.7%',
    trend: 'up',
    color: 'green',
  },
  {
    icon: Shield,
    label: 'Compliance Score',
    value: '99.8%',
    change: '+0.2%',
    trend: 'up',
    color: 'purple',
  },
  {
    icon: Zap,
    label: 'Avg Response Time',
    value: '45ms',
    change: '-12ms',
    trend: 'down',
    color: 'orange',
  },
];

const systemMetrics = [
  { label: 'Payment Success Rate', value: '99.97%', color: 'green' },
  { label: 'KYC Automation', value: '94.2%', color: 'blue' },
  { label: 'Cost Savings', value: '₹2.3M', color: 'purple' },
  { label: 'API Uptime', value: '99.99%', color: 'cyan' },
];

const recentTransactions = [
  { id: 'TXN-001', amount: '₹25,000', status: 'completed', rail: 'UPI', time: '2m ago' },
  { id: 'TXN-002', amount: '€1,200', status: 'pending', rail: 'SEPA', time: '5m ago' },
  { id: 'TXN-003', amount: '0.05 BTC', status: 'completed', rail: 'Crypto', time: '8m ago' },
  { id: 'TXN-004', amount: '₹50,000', status: 'failed', rail: 'UPI', time: '12m ago' },
];

const Analytics: React.FC = () => {
  const { health, databaseInfo } = useHealth();

  const getHealthStatusIcon = () => {
    if (!health) return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    
    switch (health.status) {
      case 'ok':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getHealthStatusText = () => {
    if (!health) return 'Unknown';
    return health.status.toUpperCase();
  };

  const getHealthStatusColor = () => {
    if (!health) return 'text-gray-400';
    
    switch (health.status) {
      case 'ok':
        return 'text-green-400';
      case 'degraded':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 rounded-full px-4 py-2 mb-6 text-sm font-medium">
            <TrendingUp className="h-4 w-4" />
            Real-Time Analytics
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Production-grade observability
            <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              that drives decisions
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Monitor your MudraCore platform with comprehensive analytics. Track performance, compliance, and business metrics in real-time.
          </p>
        </div>

        {/* Main Analytics Dashboard */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 rounded-3xl p-8 shadow-2xl border border-gray-800">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">MudraCore OS Dashboard</h3>
                <p className="text-gray-400">Real-time platform monitoring and analytics</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-400">Live</span>
                </div>
                <div className="text-sm text-gray-400">Last updated: now</div>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {metrics.map((metric, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 bg-${metric.color}-600/20 rounded-xl flex items-center justify-center`}>
                      <metric.icon className={`h-5 w-5 text-${metric.color}-400`} />
                    </div>
                    <span
                      className={`text-sm font-medium px-2 py-1 rounded-full ${
                        metric.trend === 'up'
                          ? 'text-green-400 bg-green-400/10'
                          : 'text-red-400 bg-red-400/10'
                      }`}
                    >
                      {metric.change}
                    </span>
                  </div>
                  
                  <div className="text-3xl font-bold text-white mb-1">
                    {metric.value}
                  </div>
                  
                  <div className="text-gray-400 text-sm">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>

            {/* System Health & Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* System Health */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Database className="h-5 w-5 text-blue-400" />
                    System Health
                  </h4>
                </div>
                
                <div className="space-y-4">
                  {/* Real-time Backend Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Backend Status</span>
                    <div className="flex items-center gap-2">
                      {getHealthStatusIcon()}
                      <span className={`font-semibold ${getHealthStatusColor()}`}>
                        {getHealthStatusText()}
                      </span>
                    </div>
                  </div>

                  {/* Database Connection */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Database Connection</span>
                    <div className="flex items-center gap-2">
                      {databaseInfo?.connected ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                      <span className={`font-semibold ${databaseInfo?.connected ? 'text-green-400' : 'text-red-400'}`}>
                        {databaseInfo?.connected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </div>

                  {/* Connection Pool */}
                  {databaseInfo && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">Connection Pool</span>
                      <span className="text-blue-400 font-semibold">
                        {databaseInfo.in_use || 0} / {databaseInfo.max_open_connections || 0}
                      </span>
                    </div>
                  )}

                  {systemMetrics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">{metric.label}</span>
                      <span className={`text-${metric.color}-400 font-semibold`}>
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Eye className="h-5 w-5 text-purple-400" />
                    Recent Transactions
                  </h4>
                </div>
                
                <div className="space-y-3">
                  {recentTransactions.map((txn, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          txn.status === 'completed' ? 'bg-green-400' :
                          txn.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'
                        }`} />
                        <div>
                          <div className="text-white text-sm font-medium">{txn.id}</div>
                          <div className="text-gray-400 text-xs">{txn.rail} • {txn.time}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold text-sm">{txn.amount}</div>
                        <div className={`text-xs capitalize ${
                          txn.status === 'completed' ? 'text-green-400' :
                          txn.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {txn.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Chart Visualization */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mt-8">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-white">Transaction Volume (24h)</h4>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium">
                    24H
                  </button>
                  <button className="px-3 py-1 text-gray-400 hover:text-white rounded-lg text-sm font-medium transition-colors duration-300">
                    7D
                  </button>
                  <button className="px-3 py-1 text-gray-400 hover:text-white rounded-lg text-sm font-medium transition-colors duration-300">
                    30D
                  </button>
                </div>
              </div>
              
              {/* Enhanced Chart Visualization */}
              <div className="h-40 flex items-end justify-between gap-1">
                {Array.from({ length: 24 }, (_, i) => {
                  const height = Math.random() * 80 + 20;
                  const isHighlight = i % 4 === 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`${
                          isHighlight 
                            ? 'bg-gradient-to-t from-blue-600 to-cyan-400' 
                            : 'bg-gradient-to-t from-blue-600/60 to-blue-400/60'
                        } rounded-t-sm transition-all duration-500 hover:scale-110`}
                        style={{
                          height: `${height}%`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                      {isHighlight && (
                        <span className="text-xs text-gray-400">{i}:00</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Ready to see your data in action?</h3>
            <p className="text-green-100 mb-6 max-w-2xl mx-auto">
              Experience real-time analytics with our comprehensive monitoring suite. 
              Track every transaction, monitor compliance, and optimize performance.
            </p>
            <button className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg">
              View Live Dashboard
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Analytics;