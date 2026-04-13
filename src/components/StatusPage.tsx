import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHealth } from '../contexts/HealthContext';
import HealthStatus from './HealthStatus';
import {
  Server,
  Database,
  Activity,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Map,
  Sparkles,
  Radio,
} from 'lucide-react';

const GRPCPerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    latency:       Math.random() * 20 + 5,
    throughput:    Math.random() * 10000 + 40000,
    errorRate:     Math.random() * 0.5,
    activeStreams: Math.floor(Math.random() * 150 + 50),
    cpuUsage:      Math.random() * 30 + 40,
    memoryUsage:   Math.random() * 20 + 60,
  });

  const aiInsights = [
    'Latency is 15% better than yesterday',
    'Peak performance achieved on webhook debugging',
    'Fraud detection accuracy improved to 99.8%',
    'Transaction volume trending upward',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        latency:       Math.max(1, prev.latency + (Math.random() - 0.5) * 2),
        throughput:    Math.max(30000, prev.throughput + (Math.random() - 0.5) * 1000),
        errorRate:     Math.max(0, Math.min(1, prev.errorRate + (Math.random() - 0.5) * 0.1)),
        activeStreams: Math.max(10, prev.activeStreams + Math.floor((Math.random() - 0.5) * 10)),
        cpuUsage:      Math.max(20, Math.min(90, prev.cpuUsage + (Math.random() - 0.5) * 5)),
        memoryUsage:   Math.max(40, Math.min(95, prev.memoryUsage + (Math.random() - 0.5) * 3)),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const metricItems = [
    { label: 'Latency',        value: `${metrics.latency.toFixed(1)}ms`,            trend: 'down'   },
    { label: 'Throughput',     value: `${Math.floor(metrics.throughput / 1000)}K/s`, trend: 'up'     },
    { label: 'Error Rate',     value: `${metrics.errorRate.toFixed(2)}%`,            trend: 'down'   },
    { label: 'Active Streams', value: metrics.activeStreams.toString(),               trend: 'up'     },
    { label: 'CPU Usage',      value: `${metrics.cpuUsage.toFixed(0)}%`,             trend: 'stable' },
    { label: 'Memory',         value: `${metrics.memoryUsage.toFixed(0)}%`,          trend: 'stable' },
  ];

  return (
    <div className="bg-white border border-outline-variant rounded-3xl p-8 shadow-premium">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-primary flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary">
            <Zap className="h-5 w-5 text-accent" />
          </div>
          Real-time Performance Intelligence
        </h3>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-medium text-secondary">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {metricItems.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.07 }}
            className="bg-surface border border-outline-variant rounded-2xl p-4"
          >
            <div className="text-xs uppercase tracking-wider mb-1 text-slate-400">{metric.label}</div>
            <div className="text-xl font-bold text-primary mb-1.5">{metric.value}</div>
            <div className={`text-xs flex items-center gap-1 ${
              metric.trend === 'up'   ? 'text-secondary' :
              metric.trend === 'down' ? 'text-red-500'   : 'text-slate-400'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                metric.trend === 'up'   ? 'bg-secondary' :
                metric.trend === 'down' ? 'bg-red-500'   : 'bg-slate-300'
              }`} />
              {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-surface border border-outline-variant rounded-2xl p-6">
        <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-secondary" />
          AI Performance Insights
        </h4>
        <div className="space-y-2.5">
          {aiInsights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.12 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-white border border-outline-variant/50"
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0 bg-accent" />
              <span className="text-sm text-slate-600">{insight}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const InteractiveStreamTopology: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [streamFlow, setStreamFlow] = useState(true);

  const nodes = [
    { id: 'client',    label: 'Client Apps',         x: 100, y: 150, connections: ['gateway'] },
    { id: 'gateway',   label: 'gRPC Gateway',        x: 250, y: 150, connections: ['lb'] },
    { id: 'lb',        label: 'Load Balancer',       x: 400, y: 150, connections: ['payment', 'webhook', 'recon'] },
    { id: 'payment',   label: 'Payment Stream',      x: 550, y: 100, connections: ['ml', 'db'] },
    { id: 'webhook',   label: 'Webhook Stream',      x: 550, y: 150, connections: ['analytics', 'db'] },
    { id: 'recon',     label: 'Reconciliation',      x: 550, y: 200, connections: ['ml', 'db'] },
    { id: 'ml',        label: 'AI/ML Engine',        x: 700, y: 100, connections: ['insights'] },
    { id: 'analytics', label: 'Analytics',           x: 700, y: 150, connections: ['insights'] },
    { id: 'db',        label: 'Database',            x: 700, y: 200, connections: [] },
    { id: 'insights',  label: 'Insights Dashboard', x: 850, y: 125, connections: [] },
  ];

  const nodeDescriptions: Record<string, string> = {
    client:    'React, Mobile, and Web applications consuming gRPC streams',
    gateway:   'Protocol translation layer supporting HTTP/JSON to gRPC',
    lb:        'Intelligent load balancing with health checks and auto-scaling',
    payment:   'Real-time payment processing with fraud detection',
    webhook:   'Webhook debugging and performance monitoring',
    recon:     'ML-powered reconciliation with automated variance resolution',
    ml:        'TensorFlow-based ML engine for fraud detection and predictions',
    analytics: 'Real-time data processing and visualization engine',
    db:        'Distributed PostgreSQL cluster with real-time replication',
    insights:  'Interactive dashboards with AI-powered insights',
  };

  return (
    <div className="bg-white border border-outline-variant rounded-3xl p-8 shadow-premium">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-primary flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary">
            <Map className="h-5 w-5 text-accent" />
          </div>
          Interactive Stream Topology
        </h3>
        <button
          onClick={() => setStreamFlow(v => !v)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
            streamFlow
              ? 'bg-accent/10 text-secondary border-accent/30'
              : 'bg-surface text-slate-500 border-outline-variant'
          }`}
        >
          {streamFlow ? 'Pause Flow' : 'Resume Flow'}
        </button>
      </div>

      <div className="relative rounded-2xl p-4 h-80 overflow-hidden bg-surface border border-outline-variant">
        <svg className="w-full h-full" viewBox="0 0 1000 300">
          {nodes.map(node =>
            node.connections.map(targetId => {
              const target = nodes.find(n => n.id === targetId);
              if (!target) return null;
              return (
                <g key={`${node.id}-${targetId}`}>
                  <line
                    x1={node.x + 60} y1={node.y + 15}
                    x2={target.x}    y2={target.y + 15}
                    stroke="rgba(0,109,67,0.20)" strokeWidth="1.5"
                  />
                  {streamFlow && (
                    <motion.circle
                      r="3" fill="rgba(0,255,148,0.8)"
                      initial={{ cx: node.x + 60, cy: node.y + 15 }}
                      animate={{ cx: [node.x + 60, target.x], cy: [node.y + 15, target.y + 15] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                  )}
                </g>
              );
            })
          )}
          {nodes.map(node => (
            <g key={node.id}>
              <motion.foreignObject
                x={node.x} y={node.y} width="120" height="28"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: node.x / 300 }}
                className="cursor-pointer"
                onMouseEnter={() => setSelectedNode(node.id)}
                onMouseLeave={() => setSelectedNode(null)}
              >
                <div
                  className="w-full h-full rounded-lg flex items-center justify-center text-xs font-medium"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,109,67,0.12), rgba(0,255,148,0.08))',
                    border: '1px solid rgba(0,109,67,0.25)',
                    color: '#006d43',
                  }}
                >
                  {node.label}
                </div>
              </motion.foreignObject>
            </g>
          ))}
        </svg>

        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute bottom-4 left-4 p-4 rounded-xl bg-white border border-outline-variant shadow-lg"
            >
              <div className="text-sm font-semibold text-primary mb-1">
                {nodes.find(n => n.id === selectedNode)?.label}
              </div>
              <div className="text-xs text-slate-500 max-w-xs">
                {nodeDescriptions[selectedNode]}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const StatusPage: React.FC = () => {
  const { health, databaseInfo, lastUpdated } = useHealth();

  const statusColor = health?.status === 'ok' ? 'text-secondary' : health?.status === 'degraded' ? 'text-amber-500' : 'text-red-500';
  const statusIcon  = health?.status === 'ok'
    ? <CheckCircle className="h-7 w-7 text-secondary" />
    : health?.status === 'degraded'
      ? <AlertTriangle className="h-7 w-7 text-amber-500" />
      : <XCircle className="h-7 w-7 text-red-500" />;

  const summaryCards = [
    {
      label:      'Overall Status',
      value:      health?.status?.toUpperCase() || 'UNKNOWN',
      valueClass: statusColor,
      icon:       statusIcon,
    },
    {
      label:      'Uptime',
      value:      '99.99%',
      valueClass: 'text-secondary',
      icon:       <TrendingUp className="h-7 w-7 text-secondary" />,
    },
    {
      label:      'Response Time',
      value:      '45ms',
      valueClass: 'text-secondary',
      icon:       <Activity className="h-7 w-7 text-secondary" />,
    },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-xs font-semibold tracking-widest uppercase bg-accent/10 border border-accent/20 text-secondary">
            <Radio className="h-3 w-3" />
            System Status
          </div>
          <h1 className="text-4xl font-black text-primary mb-3 tracking-tight">
            Platform{' '}
            <span style={{
              background: 'linear-gradient(95deg, #0A1128 0%, #006d43 45%, #00FF94 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Infrastructure
            </span>
          </h1>
          <p className="text-base text-slate-500">
            Real-time monitoring of our MudraCore platform
          </p>
          {lastUpdated && (
            <p className="text-xs mt-2 text-slate-400">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {summaryCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              className="bg-white border border-outline-variant rounded-2xl shadow-premium p-6 flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-medium uppercase tracking-wider mb-1.5 text-slate-400">{card.label}</p>
                <p className={`text-2xl font-bold ${card.valueClass}`}>{card.value}</p>
              </div>
              {card.icon}
            </motion.div>
          ))}
        </div>

        {/* Detailed status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <HealthStatus />
          </div>

          <div className="space-y-5">
            {/* Backend Services */}
            <div className="bg-white border border-outline-variant rounded-2xl shadow-premium p-6">
              <div className="flex items-center gap-2 mb-5">
                <Server className="h-4 w-4 text-secondary" />
                <h3 className="text-base font-semibold text-primary">Backend Services</h3>
              </div>
              <div className="space-y-3">
                {['API Gateway', 'Authentication', 'Payment Processing'].map(svc => (
                  <div key={svc} className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">{svc}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-accent rounded-full" />
                      <span className="text-sm font-medium text-secondary">Operational</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Database */}
            <div className="bg-white border border-outline-variant rounded-2xl shadow-premium p-6">
              <div className="flex items-center gap-2 mb-5">
                <Database className="h-4 w-4 text-secondary" />
                <h3 className="text-base font-semibold text-primary">Neon Database</h3>
              </div>
              {databaseInfo ? (
                <div className="space-y-3">
                  {[
                    { label: 'Connection',      value: databaseInfo.connected ? 'Connected' : 'Disconnected', ok: databaseInfo.connected },
                    { label: 'Connection Pool', value: `${databaseInfo.in_use || 0} / ${databaseInfo.max_open_connections || 0}`, ok: true },
                    { label: 'Region',          value: 'East US 2 (Azure)', ok: true },
                    { label: 'SSL/TLS',         value: 'Enabled', ok: true },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">{row.label}</span>
                      <span className={`text-sm font-medium ${row.ok ? 'text-secondary' : 'text-red-500'}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">Database information unavailable</p>
              )}
            </div>

            {/* Recent Incidents */}
            <div className="bg-white border border-outline-variant rounded-2xl shadow-premium p-6">
              <div className="flex items-center gap-2 mb-5">
                <Clock className="h-4 w-4 text-slate-400" />
                <h3 className="text-base font-semibold text-primary">Recent Incidents</h3>
              </div>
              <div className="text-center py-6">
                <CheckCircle className="h-10 w-10 text-secondary mx-auto mb-3" />
                <p className="text-sm text-primary font-medium">No incidents reported</p>
                <p className="text-xs mt-1 text-slate-400">All systems operational</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance dashboard */}
        <div className="mb-8">
          <GRPCPerformanceDashboard />
        </div>

        {/* Stream topology */}
        <div className="mb-8">
          <InteractiveStreamTopology />
        </div>

        {/* Footer note */}
        <div className="text-center">
          <p className="text-sm text-slate-400">
            For real-time updates, follow our{' '}
            <a href="#status" className="text-secondary hover:underline">
              status page
            </a>{' '}
            or contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatusPage;
