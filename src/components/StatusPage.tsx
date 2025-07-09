import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHealth } from '../contexts/HealthContext';
import { 
  Server, 
  Database, 
  Activity, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Bell,
  RefreshCw,
  Shield,
  Zap,
  Network,
  Cpu,
  LineChart
} from 'lucide-react';
import {
  RocketLaunchIcon,
  SparklesIcon,
  MapIcon
} from '@heroicons/react/24/outline';

// Modern Status Card Component
const StatusCard: React.FC<{
  title: string;
  status: string;
  icon: React.ReactNode;
  metrics?: { label: string; value: string | number }[];
  className?: string;
}> = ({ title, status, icon, metrics, className }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'operational':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'outage':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden ${className}`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-slate-700 flex items-center justify-center">
              {icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
            <span className={`text-sm font-medium ${
              status.toLowerCase() === 'operational' ? 'text-green-600 dark:text-green-400' :
              status.toLowerCase() === 'degraded' ? 'text-yellow-600 dark:text-yellow-400' :
              'text-red-600 dark:text-red-400'
            }`}>
              {status}
            </span>
          </div>
        </div>
        
        {metrics && (
          <div className="space-y-3 mt-4">
            {metrics.map((metric, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{metric.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Real-time Performance Intelligence Dashboard
const PerformanceIntelligence: React.FC = () => {
  const [metrics, setMetrics] = useState({
    latency: Math.random() * 20 + 5,
    throughput: Math.random() * 10000 + 40000,
    errorRate: Math.random() * 0.5,
    activeStreams: Math.floor(Math.random() * 150 + 50),
    cpuUsage: Math.random() * 30 + 40,
    memoryUsage: Math.random() * 20 + 60,
  });

  const [aiInsights, setAiInsights] = useState([
    "🚀 Latency is 15% better than yesterday",
    "⚡ Peak performance achieved on webhook debugging",
    "🎯 Fraud detection accuracy improved to 99.8%",
    "📈 Transaction volume trending upward"
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        latency: Math.max(1, prev.latency + (Math.random() - 0.5) * 2),
        throughput: Math.max(30000, prev.throughput + (Math.random() - 0.5) * 1000),
        errorRate: Math.max(0, Math.min(1, prev.errorRate + (Math.random() - 0.5) * 0.1)),
        activeStreams: Math.max(10, prev.activeStreams + Math.floor((Math.random() - 0.5) * 10)),
        cpuUsage: Math.max(20, Math.min(90, prev.cpuUsage + (Math.random() - 0.5) * 5)),
        memoryUsage: Math.max(40, Math.min(95, prev.memoryUsage + (Math.random() - 0.5) * 3)),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 rounded-xl p-6 shadow-xl border border-indigo-500/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <RocketLaunchIcon className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">Real-time Performance Intelligence</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-emerald-400 text-sm font-medium">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[
          { label: 'Latency', value: `${metrics.latency.toFixed(1)}ms`, icon: <Zap className="h-4 w-4" />, color: 'from-green-400/20 to-emerald-500/20' },
          { label: 'Throughput', value: `${Math.floor(metrics.throughput/1000)}K/s`, icon: <Activity className="h-4 w-4" />, color: 'from-blue-400/20 to-cyan-500/20' },
          { label: 'Error Rate', value: `${(metrics.errorRate).toFixed(2)}%`, icon: <AlertTriangle className="h-4 w-4" />, color: 'from-red-400/20 to-pink-500/20' },
          { label: 'Active Streams', value: metrics.activeStreams.toString(), icon: <Network className="h-4 w-4" />, color: 'from-purple-400/20 to-violet-500/20' },
          { label: 'CPU Usage', value: `${metrics.cpuUsage.toFixed(0)}%`, icon: <Cpu className="h-4 w-4" />, color: 'from-yellow-400/20 to-orange-500/20' },
          { label: 'Memory', value: `${metrics.memoryUsage.toFixed(0)}%`, icon: <LineChart className="h-4 w-4" />, color: 'from-indigo-400/20 to-blue-500/20' },
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`relative overflow-hidden bg-gradient-to-br ${metric.color} backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/5 transition-all duration-300`}
          >
            <div className="flex items-center gap-2 mb-2 text-white/70">
              {metric.icon}
              <span className="text-xs uppercase tracking-wider">{metric.label}</span>
            </div>
            <div className="text-white text-xl font-bold">{metric.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <SparklesIcon className="h-5 w-5 text-yellow-400" />
          <h4 className="text-white font-semibold">AI Performance Insights</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {aiInsights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="text-white/80 text-sm flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
            >
              <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
              {insight}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Interactive Stream Topology
const StreamTopology: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [streamFlow, setStreamFlow] = useState(true);

  const nodes = [
    { id: 'client', label: 'Client Apps', x: 100, y: 150, type: 'client', connections: ['gateway'] },
    { id: 'gateway', label: 'gRPC Gateway', x: 250, y: 150, type: 'gateway', connections: ['lb'] },
    { id: 'lb', label: 'Load Balancer', x: 400, y: 150, type: 'loadbalancer', connections: ['payment', 'webhook', 'recon'] },
    { id: 'payment', label: 'Payment Stream', x: 550, y: 100, type: 'service', connections: ['ml', 'db'] },
    { id: 'webhook', label: 'Webhook Stream', x: 550, y: 150, type: 'service', connections: ['analytics', 'db'] },
    { id: 'recon', label: 'Reconciliation Stream', x: 550, y: 200, type: 'service', connections: ['ml', 'db'] },
    { id: 'ml', label: 'AI/ML Engine', x: 700, y: 100, type: 'ai', connections: ['insights'] },
    { id: 'analytics', label: 'Real-time Analytics', x: 700, y: 150, type: 'analytics', connections: ['insights'] },
    { id: 'db', label: 'Database Cluster', x: 700, y: 200, type: 'database', connections: [] },
    { id: 'insights', label: 'Insights Dashboard', x: 850, y: 125, type: 'dashboard', connections: [] }
  ];

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'client': return 'from-green-400 to-emerald-500';
      case 'gateway': return 'from-purple-400 to-violet-500';
      case 'loadbalancer': return 'from-orange-400 to-red-500';
      case 'service': return 'from-blue-400 to-cyan-500';
      case 'ai': return 'from-pink-400 to-rose-500';
      case 'analytics': return 'from-yellow-400 to-amber-500';
      case 'database': return 'from-gray-400 to-slate-500';
      case 'dashboard': return 'from-indigo-400 to-purple-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-6 shadow-xl border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
            <MapIcon className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">Interactive Stream Topology</h3>
        </div>
        <button
          onClick={() => setStreamFlow(!streamFlow)}
          className={`px-4 py-2 rounded-xl transition-all ${
            streamFlow 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
        >
          {streamFlow ? '⏸️ Pause Flow' : '▶️ Resume Flow'}
        </button>
      </div>

      <div className="relative bg-black/20 backdrop-blur rounded-xl p-6 h-96 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 1000 300">
          {/* Connection Lines with Animated Flow */}
          {nodes.map(node => 
            node.connections.map(targetId => {
              const target = nodes.find(n => n.id === targetId);
              if (!target) return null;
              
              return (
                <g key={`${node.id}-${targetId}`}>
                  <motion.line
                    x1={node.x + 30}
                    y1={node.y + 15}
                    x2={target.x}
                    y2={target.y + 15}
                    stroke="rgba(99, 102, 241, 0.3)"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                  {streamFlow && (
                    <motion.circle
                      r="4"
                      fill="rgba(34, 197, 94, 0.8)"
                      initial={{ cx: node.x + 30, cy: node.y + 15 }}
                      animate={{ 
                        cx: [node.x + 30, target.x],
                        cy: [node.y + 15, target.y + 15]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  )}
                </g>
              );
            })
          )}

          {/* Nodes */}
          {nodes.map((node) => (
            <g key={node.id}>
              <motion.foreignObject
                x={node.x}
                y={node.y}
                width="120"
                height="30"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: node.x / 200 }}
                className="cursor-pointer"
                onMouseEnter={() => setSelectedNode(node.id)}
                onMouseLeave={() => setSelectedNode(null)}
              >
                <div className={`w-full h-full bg-gradient-to-r ${getNodeColor(node.type)} rounded-lg flex items-center justify-center text-white text-xs font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}>
                  {node.label}
                </div>
              </motion.foreignObject>
            </g>
          ))}
        </svg>

        {/* Node Details Panel */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-4 left-4 bg-black/80 backdrop-blur text-white p-4 rounded-xl border border-white/20"
            >
              <div className="font-semibold">
                {nodes.find(n => n.id === selectedNode)?.label}
              </div>
              <div className="text-sm text-gray-300 mt-1">
                {selectedNode === 'client' && 'React, Mobile, and Web applications consuming gRPC streams'}
                {selectedNode === 'gateway' && 'Protocol translation layer supporting HTTP/JSON to gRPC'}
                {selectedNode === 'lb' && 'Intelligent load balancing with health checks and auto-scaling'}
                {selectedNode === 'payment' && 'Real-time payment processing with fraud detection'}
                {selectedNode === 'webhook' && 'Webhook debugging and performance monitoring'}
                {selectedNode === 'recon' && 'ML-powered reconciliation with automated variance resolution'}
                {selectedNode === 'ml' && 'TensorFlow-based ML engine for fraud detection and predictions'}
                {selectedNode === 'analytics' && 'Real-time data processing and visualization engine'}
                {selectedNode === 'db' && 'Distributed PostgreSQL cluster with real-time replication'}
                {selectedNode === 'insights' && 'Interactive dashboards with AI-powered insights'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Main Status Page Component
const StatusPage: React.FC = () => {
  const { health, databaseInfo, lastUpdated } = useHealth();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh - replace with actual refresh logic
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Status</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Real-time monitoring of our infrastructure
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              <Bell className="h-4 w-4" />
              Subscribe
            </button>
          </div>
        </div>

        {/* Overall Status */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-8 mb-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <Shield className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">Overall System Status</h2>
              <p className="text-blue-100">Last updated: {lastUpdated?.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              health?.status === 'ok' ? 'bg-green-400' :
              health?.status === 'degraded' ? 'bg-yellow-400' :
              'bg-red-400'
            }`} />
            <span className="text-xl font-semibold">
              {health?.status === 'ok' ? 'All Systems Operational' :
               health?.status === 'degraded' ? 'Partial System Outage' :
               'Major System Outage'}
            </span>
          </div>
        </div>

        {/* Service Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatusCard
            title="API Gateway"
            status="Operational"
            icon={<Server className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            metrics={[
              { label: 'Response Time', value: '45ms' },
              { label: 'Success Rate', value: '99.99%' }
            ]}
          />
          <StatusCard
            title="Database Cluster"
            status="Operational"
            icon={<Database className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
            metrics={[
              { label: 'Active Connections', value: `${databaseInfo?.in_use || 0} / ${databaseInfo?.max_open_connections || 0}` },
              { label: 'Query Response Time', value: '12ms' }
            ]}
          />
          <StatusCard
            title="Authentication Service"
            status="Operational"
            icon={<Shield className="h-5 w-5 text-green-600 dark:text-green-400" />}
            metrics={[
              { label: 'Active Sessions', value: '2,451' },
              { label: 'Auth Latency', value: '89ms' }
            ]}
          />
          <StatusCard
            title="Payment Processing"
            status="Operational"
            icon={<Activity className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />}
            metrics={[
              { label: 'Transaction Rate', value: '850/min' },
              { label: 'Success Rate', value: '99.95%' }
            ]}
          />
        </div>

        {/* Performance Intelligence Dashboard */}
        <div className="mb-8">
          <PerformanceIntelligence />
        </div>

        {/* Stream Topology */}
        <div className="mb-8">
          <StreamTopology />
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact our{' '}
            <a href="#support" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatusPage; 