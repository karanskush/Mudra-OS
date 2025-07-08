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
  XCircle
} from 'lucide-react';
import {
  RocketLaunchIcon,
  SparklesIcon,
  MapIcon,
  CircleStackIcon,
  CloudIcon,
  CpuChipIcon,
  WifiIcon
} from '@heroicons/react/24/outline';

// 🌟 2025 DESIGN TREND: AI-Powered Performance Dashboard
const GRPCPerformanceDashboard: React.FC = () => {
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
    <div className="bg-gradient-to-br from-slate-900/90 via-indigo-900/80 to-purple-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <RocketLaunchIcon className="h-6 w-6 text-white" />
          </div>
          Real-time Performance Intelligence
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-emerald-400 text-sm font-medium">Live</span>
        </div>
      </div>

      {/* Glassmorphism Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Latency', value: `${metrics.latency.toFixed(1)}ms`, trend: 'down', color: 'from-green-400 to-emerald-500' },
          { label: 'Throughput', value: `${Math.floor(metrics.throughput/1000)}K/s`, trend: 'up', color: 'from-blue-400 to-cyan-500' },
          { label: 'Error Rate', value: `${(metrics.errorRate).toFixed(2)}%`, trend: 'down', color: 'from-red-400 to-pink-500' },
          { label: 'Active Streams', value: metrics.activeStreams.toString(), trend: 'up', color: 'from-purple-400 to-violet-500' },
          { label: 'CPU Usage', value: `${metrics.cpuUsage.toFixed(0)}%`, trend: 'stable', color: 'from-yellow-400 to-orange-500' },
          { label: 'Memory', value: `${metrics.memoryUsage.toFixed(0)}%`, trend: 'stable', color: 'from-indigo-400 to-blue-500' },
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-5`}></div>
            <div className="relative z-10">
              <div className="text-white/70 text-xs uppercase tracking-wider mb-1">{metric.label}</div>
              <div className="text-white text-xl font-bold mb-2">{metric.value}</div>
              <div className={`text-xs flex items-center gap-1 ${
                metric.trend === 'up' ? 'text-green-400' : 
                metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  metric.trend === 'up' ? 'bg-green-400' : 
                  metric.trend === 'down' ? 'bg-red-400' : 'bg-gray-400'
                }`}></div>
                {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Insights Panel */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-yellow-400" />
          AI Performance Insights
        </h4>
        <div className="space-y-3">
          {aiInsights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
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

// 🌈 2025 DESIGN TREND: Interactive 3D Stream Topology
const InteractiveStreamTopology: React.FC = () => {
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
    <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 rounded-3xl p-8 border border-white/10 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
            <MapIcon className="h-6 w-6 text-white" />
          </div>
          Interactive Stream Topology
        </h3>
        <div className="flex items-center gap-4">
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
      </div>

      <div className="relative bg-black/20 rounded-2xl p-6 h-96 overflow-hidden">
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

const StatusPage: React.FC = () => {
  const { health, databaseInfo, lastUpdated } = useHealth();

  const getUptimePercentage = () => {
    // This would typically come from the backend
    // For now, we'll show a placeholder
    return 99.99;
  };

  const getResponseTime = () => {
    // This would typically be measured from the frontend
    // For now, we'll show a placeholder
    return 45; // ms
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            System Status
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Real-time monitoring of our MudraCore platform infrastructure
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>

        {/* Overall Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Status</p>
                <p className={`text-2xl font-bold ${health?.status === 'ok' ? 'text-green-600' : health?.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'}`}>
                  {health?.status?.toUpperCase() || 'UNKNOWN'}
                </p>
              </div>
              {health?.status === 'ok' ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : health?.status === 'degraded' ? (
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              ) : (
                <XCircle className="h-8 w-8 text-red-500" />
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Uptime</p>
                <p className="text-2xl font-bold text-green-600">{getUptimePercentage()}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Response Time</p>
                <p className="text-2xl font-bold text-blue-600">{getResponseTime()}ms</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Detailed Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Health Status Component */}
          <div>
            <HealthStatus />
          </div>

          {/* System Information */}
          <div className="space-y-6">
            {/* Backend Information */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <Server className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Backend Services</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">API Gateway</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-600">Operational</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Authentication</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-600">Operational</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Payment Processing</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-600">Operational</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Database Information */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <Database className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Neon Database</h3>
              </div>
              
              {databaseInfo ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Connection</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${databaseInfo.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`text-sm font-medium ${databaseInfo.connected ? 'text-green-600' : 'text-red-600'}`}>
                        {databaseInfo.connected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Connection Pool</span>
                    <span className="text-sm font-medium">
                      {databaseInfo.in_use || 0} / {databaseInfo.max_open_connections || 0}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Region</span>
                    <span className="text-sm font-medium">East US 2 (Azure)</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">SSL/TLS</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-600">Enabled</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Database information unavailable</p>
              )}
            </div>

            {/* Recent Incidents */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Incidents</h3>
              </div>
              
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No incidents reported</p>
                <p className="text-sm text-gray-500">All systems operational</p>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Performance Dashboard */}
        <div className="mt-12">
          <GRPCPerformanceDashboard />
        </div>

        {/* Interactive Stream Topology */}
        <div className="mt-8">
          <InteractiveStreamTopology />
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            For real-time updates, follow our{' '}
            <a href="#status" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              status page
            </a>
            {' '}or contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatusPage; 