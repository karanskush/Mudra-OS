import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Square, 
  Settings, 
  Activity, 
  Zap, 
  Shield, 
  Database, 
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Code,
  Terminal,
  BarChart3,
  Network,
  Wifi,
  WifiOff,
  Eye,
  EyeOff
} from 'lucide-react';
import { grpcClient, StreamEvent } from '../lib/grpcClient';

interface Session {
  id: string;
  type: 'payment' | 'risk' | 'reconciliation' | 'webhook';
  status: 'active' | 'inactive' | 'error';
  startTime: string;
  events: StreamEvent[];
}

const GRPCDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'payment' | 'risk' | 'reconciliation' | 'webhook' | 'connection'>('overview');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [showMetrics, setShowMetrics] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [streamingEvents, setStreamingEvents] = useState<StreamEvent[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [mockStreamingCleanup, setMockStreamingCleanup] = useState<(() => void) | null>(null);
  const [connectionLogs, setConnectionLogs] = useState<string[]>([]);
  const [connectionTestStatus, setConnectionTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const eventsEndRef = useRef<HTMLDivElement>(null);

  // Mock data for demonstration
  const mockPaymentEvents: StreamEvent[] = [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      type: 'payment',
      data: { paymentId: 'pay_123', amount: 1500, currency: 'USD', status: 'processing' },
      status: 'info'
    },
    {
      id: '2',
      timestamp: new Date().toISOString(),
      type: 'payment',
      data: { paymentId: 'pay_124', amount: 2500, currency: 'EUR', status: 'completed' },
      status: 'success'
    },
    {
      id: '3',
      timestamp: new Date().toISOString(),
      type: 'payment',
      data: { paymentId: 'pay_125', amount: 5000, currency: 'USD', status: 'failed' },
      status: 'error'
    }
  ];

  const mockRiskEvents: StreamEvent[] = [
    {
      id: '4',
      timestamp: new Date().toISOString(),
      type: 'risk',
      data: { transactionId: 'tx_001', riskScore: 0.85, alert: 'High risk transaction detected' },
      status: 'warning'
    },
    {
      id: '5',
      timestamp: new Date().toISOString(),
      type: 'risk',
      data: { transactionId: 'tx_002', riskScore: 0.15, alert: 'Low risk transaction' },
      status: 'success'
    }
  ];

  const mockReconciliationEvents: StreamEvent[] = [
    {
      id: '6',
      timestamp: new Date().toISOString(),
      type: 'reconciliation',
      data: { varianceId: 'var_001', description: 'Amount difference detected', progress: 30 },
      status: 'info'
    },
    {
      id: '7',
      timestamp: new Date().toISOString(),
      type: 'reconciliation',
      data: { varianceId: 'var_002', description: 'Variance resolved', progress: 80 },
      status: 'success'
    }
  ];

  const mockWebhookEvents: StreamEvent[] = [
    {
      id: '8',
      timestamp: new Date().toISOString(),
      type: 'webhook',
      data: { endpoint: 'https://api.example.com/webhook', status: 200, responseTime: 150 },
      status: 'success'
    },
    {
      id: '9',
      timestamp: new Date().toISOString(),
      type: 'webhook',
      data: { endpoint: 'https://api.example.com/webhook', status: 500, responseTime: 5000 },
      status: 'error'
    }
  ];

  // Handle incoming stream events
  const handleStreamEvent = (event: StreamEvent) => {
    setStreamingEvents(prev => {
      const newEvents = [...prev, event];
      // Keep only the last 50 events to prevent memory issues
      return newEvents.slice(-50);
    });
  };

  // Connect to gRPC service
  const connectToGrpc = async () => {
    setConnectionStatus('connecting');
    
    try {
      const connected = await grpcClient.connect();
      
      if (connected) {
        setConnectionStatus('connected');
        setIsConnected(true);
        console.log('Successfully connected to gRPC service');
      } else {
        setConnectionStatus('disconnected');
        setIsConnected(false);
        console.log('Failed to connect to gRPC service, using mock data');
      }
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus('disconnected');
      setIsConnected(false);
    }
  };

  // Start streaming
  const startStreaming = () => {
    if (isConnected) {
      // Real gRPC streaming
      grpcClient.addEventListener(handleStreamEvent);
      setIsStreaming(true);
      console.log('Started real gRPC streaming');
    } else {
      // Mock streaming
      const cleanup = grpcClient.startMockStreaming();
      setMockStreamingCleanup(() => cleanup);
      grpcClient.addEventListener(handleStreamEvent);
      setIsStreaming(true);
      console.log('Started mock streaming');
    }
  };

  // Stop streaming
  const stopStreaming = () => {
    if (isConnected) {
      grpcClient.removeEventListener(handleStreamEvent);
    } else if (mockStreamingCleanup) {
      mockStreamingCleanup();
      setMockStreamingCleanup(null);
    }
    
    grpcClient.removeEventListener(handleStreamEvent);
    setIsStreaming(false);
    console.log('Stopped streaming');
  };

  // Send test payment request
  const sendTestPayment = async () => {
    const testRequest = {
      initiatePayment: {
        userId: 'user_123',
        fromAccountId: 'acc_001',
        toAccountId: 'acc_002',
        amount: 1000,
        currency: 'USD',
        description: 'Test payment from gRPC demo',
        reference: `TEST_${Date.now()}`,
        preferredRail: 1, // UPI
        forceRail: false
      }
    };

    await grpcClient.sendPaymentRequest(testRequest);
    console.log('Sent test payment request');
  };

  // Connection test functions
  const addConnectionLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setConnectionLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearConnectionLogs = () => {
    setConnectionLogs([]);
  };

  const testConnection = async () => {
    setConnectionTestStatus('testing');
    clearConnectionLogs();
    
    addConnectionLog('Starting gRPC connection test...');
    
    try {
      // Test basic HTTP connection
      addConnectionLog('Testing HTTP connection to gRPC server...');
      const response = await fetch('http://localhost:50051', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const text = await response.text();
        addConnectionLog(`✓ HTTP connection successful: ${text}`);
        setConnectionTestStatus('success');
      } else {
        addConnectionLog(`✗ HTTP connection failed: ${response.status} ${response.statusText}`);
        setConnectionTestStatus('error');
      }

      // Test CORS headers
      addConnectionLog('Testing CORS headers...');
      const corsResponse = await fetch('http://localhost:50051', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:39184',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type',
        },
      });

      if (corsResponse.ok) {
        addConnectionLog('✓ CORS preflight request successful');
        const corsHeaders = corsResponse.headers;
        addConnectionLog(`CORS Headers: ${JSON.stringify({
          'Access-Control-Allow-Origin': corsHeaders.get('Access-Control-Allow-Origin'),
          'Access-Control-Allow-Methods': corsHeaders.get('Access-Control-Allow-Methods'),
          'Access-Control-Allow-Headers': corsHeaders.get('Access-Control-Allow-Headers'),
        }, null, 2)}`);
      } else {
        addConnectionLog(`✗ CORS preflight request failed: ${corsResponse.status}`);
      }

    } catch (error) {
      addConnectionLog(`✗ Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setConnectionTestStatus('error');
    }
  };

  useEffect(() => {
    // Auto-scroll to bottom
    if (autoScroll && eventsEndRef.current) {
      eventsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [autoScroll, streamingEvents]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (mockStreamingCleanup) {
        mockStreamingCleanup();
      }
      grpcClient.removeEventListener(handleStreamEvent);
      grpcClient.disconnect();
    };
  }, [mockStreamingCleanup]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-secondary';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-[#68BA7F]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'payment', label: 'Payment Monitor', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'risk', label: 'Risk Monitoring', icon: <Shield className="w-4 h-4" /> },
    { id: 'reconciliation', label: 'Reconciliation', icon: <Database className="w-4 h-4" /> },
    { id: 'webhook', label: 'Webhook Debug', icon: <Network className="w-4 h-4" /> },
    { id: 'connection', label: 'Connection Test', icon: <Terminal className="w-4 h-4" /> }
  ];

  const getEventsForTab = () => {
    if (isStreaming && streamingEvents.length > 0) {
      // Return real streaming events
      return streamingEvents;
    }

    // Return mock events based on tab
    switch (activeTab) {
      case 'payment': return mockPaymentEvents;
      case 'risk': return mockRiskEvents;
      case 'reconciliation': return mockReconciliationEvents;
      case 'webhook': return mockWebhookEvents;
      default: return [...mockPaymentEvents, ...mockRiskEvents, ...mockReconciliationEvents, ...mockWebhookEvents];
    }
  };

  return (
    <div className="min-h-screen">
      {/* Local-only notice banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/30">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <Terminal className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-amber-200 text-sm font-medium">
            gRPC requires a local server — it does not run on Vercel.{' '}
            <a
              href="https://github.com/karanskush/fintech-os"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-amber-300 hover:text-amber-100 transition-colors"
            >
              Clone the repo
            </a>{' '}
            and run <code className="bg-amber-500/20 px-1 rounded text-amber-200">make run</code> locally to interact with live gRPC streams.
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r [rgba(46,111,64,0.08)] to-[rgba(37,61,44,0.06)]" />
        <div className="relative z-10 container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-[#2E6F40] to-[#68BA7F] rounded-2xl">
                <Zap className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4">
              gRPC Streaming Demo
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Real-time financial operations with ultra-low latency bidirectional streaming APIs
            </p>
            
            {/* Enhanced Connection Status */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`relative flex items-center gap-3 px-6 py-3 rounded-2xl  border transition-all duration-300 ${
                  connectionStatus === 'connected' ? 'bg-brand-500/15 border-brand-500/25 text-secondary shadow-lg shadow-brand-500/10' :
                  connectionStatus === 'connecting' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400 shadow-lg shadow-yellow-500/10' :
                  'bg-red-500/20 border-red-500/30 text-red-400 shadow-lg shadow-red-500/10'
                }`}
              >
                <div className="relative">
                  {connectionStatus === 'connected' ? <Wifi className="w-5 h-5" /> :
                   connectionStatus === 'connecting' ? <RefreshCw className="w-5 h-5 animate-spin" /> :
                   <WifiOff className="w-5 h-5" />}
                  {connectionStatus === 'connected' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-300 rounded-full animate-ping"></div>
                  )}
                </div>
                <span className="font-semibold">
                  {connectionStatus === 'connected' ? 'Connected' :
                   connectionStatus === 'connecting' ? 'Connecting...' :
                   'Disconnected'}
                </span>
              </motion.div>
              
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-3 px-6 py-3 bg-[rgba(46,111,64,0.15)] border border-[rgba(104,186,127,0.25)] text-[#68BA7F] rounded-2xl  shadow-lg shadow-blue-500/10"
              >
                <Activity className="w-5 h-5" />
                <span className="font-semibold">Port 50051</span>
              </motion.div>

              {isStreaming && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="relative flex items-center gap-3 px-6 py-3 bg-brand-500/15 border border-brand-500/25 text-secondary rounded-2xl  shadow-lg shadow-brand-500/10"
                >
                  <Activity className="w-5 h-5 animate-pulse" />
                  <span className="font-semibold">Streaming Active</span>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-300 rounded-full animate-ping"></div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Professional Navigation */}
        <div className="mb-12">
          <div className="bg-slate-800/50  rounded-2xl p-2 border border-slate-700/50 max-w-fit mx-auto">
            <div className="flex flex-wrap gap-1">
              {tabs.map((tab, index) => (
                <motion.button
                  key={tab.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 group ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#2E6F40] to-[#68BA7F] text-primary shadow-lg shadow-[rgba(46,111,64,0.20)]'
                      : 'text-slate-300 hover:text-primary hover:bg-slate-700/50'
                  }`}
                >
                  <div className={`relative ${activeTab === tab.id ? 'text-primary' : 'text-slate-400 group-hover:text-slate-300'}`}>
                    {tab.icon}
                    {activeTab === tab.id && (
                      <div className="absolute inset-0 animate-ping">
                        {tab.icon}
                      </div>
                    )}
                  </div>
                  <span className="hidden sm:inline text-sm font-semibold">
                    {tab.label}
                  </span>
                  
                  {/* Active indicator */}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-[#2E6F40] to-[#68BA7F] rounded-xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  {/* Hover glow effect */}
                  {activeTab !== tab.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#2E6F40]/0 to-[#68BA7F]/0 group-hover:from-[rgba(46,111,64,0.10)] group-hover:to-[rgba(104,186,127,0.10)] rounded-xl transition-all duration-300" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Professional Control Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-slate-800/40  rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl"
            >
              {/* Panel Header */}
              <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 p-6 border-b border-slate-700/50">
                <h3 className="text-xl font-bold text-primary flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-[#2E6F40] to-[#68BA7F] rounded-lg shadow-lg">
                    <Settings className="w-5 h-5 text-primary" />
                  </div>
                  System Controls
                </h3>
                <p className="text-slate-400 text-sm mt-2">
                  Manage streaming preferences and display options
                </p>
              </div>

              <div className="p-6 space-y-4">
                {/* Auto-scroll Toggle */}
                <div className="group">
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[rgba(46,111,64,0.15)] rounded-lg group-hover:bg-[rgba(46,111,64,0.25)] transition-colors">
                        <Eye className="w-4 h-4 text-[#68BA7F]" />
                      </div>
                      <div>
                        <span className="text-primary font-semibold text-sm">Auto-scroll</span>
                        <p className="text-slate-400 text-xs">Follow latest events</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAutoScroll(!autoScroll)}
                      className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[rgba(46,111,64,0.35)] ${
                        autoScroll 
                          ? 'bg-gradient-to-r from-[#2E6F40] to-[#68BA7F] shadow-lg shadow-[rgba(46,111,64,0.25)]' 
                          : 'bg-slate-600 hover:bg-slate-500'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-md ${
                        autoScroll ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
                
                {/* Metrics Toggle */}
                <div className="group">
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[rgba(37,61,44,0.20)] rounded-lg group-hover:bg-[rgba(37,61,44,0.25)] transition-colors">
                        <BarChart3 className="w-4 h-4 text-[#CFFFDC]" />
                      </div>
                      <div>
                        <span className="text-primary font-semibold text-sm">Performance Metrics</span>
                        <p className="text-slate-400 text-xs">Show system statistics</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowMetrics(!showMetrics)}
                      className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                        showMetrics 
                          ? 'bg-gradient-to-r from-[#253D2C] to-[#2E6F40] shadow-lg shadow-[rgba(37,61,44,0.25)]' 
                          : 'bg-slate-600 hover:bg-slate-500'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-md ${
                        showMetrics ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-600/30 space-y-3">
                  {activeTab === 'connection' ? (
                    // Connection Test Controls
                    <>
                      <motion.button 
                        onClick={testConnection}
                        disabled={connectionTestStatus === 'testing'}
                        whileHover={{ scale: connectionTestStatus === 'testing' ? 1 : 1.02 }}
                        whileTap={{ scale: connectionTestStatus === 'testing' ? 1 : 0.98 }}
                        className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
                          connectionTestStatus === 'testing'
                            ? 'bg-slate-600 text-slate-300 cursor-not-allowed'
                            : 'bg-gradient-to-r from-[#2E6F40] to-[#68BA7F] text-primary hover:shadow-lg hover:shadow-[rgba(46,111,64,0.25)] hover:from-[#253D2C] hover:to-[#2E6F40]'
                        }`}
                      >
                        {connectionTestStatus === 'testing' ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Terminal className="w-4 h-4" />
                        )}
                        <span className="text-sm">
                          {connectionTestStatus === 'testing' ? 'Testing Connection...' : 'Run Connection Test'}
                        </span>
                      </motion.button>
                      
                      <motion.button 
                        onClick={clearConnectionLogs}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-slate-700 hover:bg-slate-600 text-primary py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 border border-slate-600/50 hover:border-slate-500/50"
                      >
                        <EyeOff className="w-4 h-4" />
                        <span className="text-sm">Clear Test Logs</span>
                      </motion.button>
                    </>
                  ) : (
                    // Regular Controls
                    <>
                      {!isConnected && (
                        <motion.button 
                          onClick={connectToGrpc}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-gradient-to-r from-[#2E6F40] to-[#68BA7F] hover:from-[#253D2C] hover:to-[#2E6F40] text-primary py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-[rgba(46,111,64,0.25)]"
                        >
                          <Wifi className="w-4 h-4" />
                          <span className="text-sm">Connect to gRPC Server</span>
                        </motion.button>
                      )}
                      
                      {!isStreaming ? (
                        <motion.button 
                          onClick={startStreaming}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-600 hover:to-brand-500 text-primary py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-brand-500/25"
                        >
                          <Play className="w-4 h-4" />
                          <span className="text-sm">Start Real-Time Stream</span>
                        </motion.button>
                      ) : (
                        <motion.button 
                          onClick={stopStreaming}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-primary py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-red-500/25"
                        >
                          <Square className="w-4 h-4" />
                          <span className="text-sm">Stop Streaming</span>
                        </motion.button>
                      )}
                      
                      {isStreaming && (
                        <motion.button 
                          onClick={sendTestPayment}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-gradient-to-r from-[#253D2C] to-[#2E6F40] hover:from-[#2E6F40] hover:to-[#68BA7F] text-primary py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-[rgba(37,61,44,0.25)] border border-[rgba(104,186,127,0.15)]"
                        >
                          <DollarSign className="w-4 h-4" />
                          <span className="text-sm">Send Test Payment</span>
                        </motion.button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Enhanced Metrics Panel */}
            {showMetrics && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-slate-800/40  rounded-2xl border border-slate-700/50 mt-6 overflow-hidden shadow-xl"
              >
                {/* Metrics Header */}
                <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 p-6 border-b border-slate-700/50">
                  <h3 className="text-xl font-bold text-primary flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-brand-500 to-brand-400 rounded-lg shadow-lg">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    Live Metrics
                  </h3>
                  <p className="text-slate-400 text-sm mt-2">
                    Real-time system performance indicators
                  </p>
                </div>
                
                <div className="p-6 space-y-4">
                  {/* Connection Metrics */}
                  <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-brand-300 rounded-full animate-pulse"></div>
                        <span className="text-slate-300 text-sm font-medium">Active Sessions</span>
                      </div>
                      <span className={`font-bold text-lg ${isStreaming ? 'text-secondary' : 'text-slate-400'}`}>
                        {isStreaming ? '1' : '0'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${isStreaming ? 'bg-gradient-to-r from-brand-500 to-brand-300 w-full' : 'w-0'}`}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Throughput Metrics */}
                  <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#68BA7F]" />
                        <span className="text-slate-300 text-sm font-medium">Throughput</span>
                      </div>
                      <span className="font-bold text-lg text-[#68BA7F]">
                        {isStreaming ? '1,247' : '0'} <span className="text-xs text-slate-400">evt/s</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${isStreaming ? 'bg-gradient-to-r from-[#2E6F40] to-[#68BA7F] w-3/4' : 'w-0'}`}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Latency Metrics */}
                  <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#CFFFDC]" />
                        <span className="text-slate-300 text-sm font-medium">Avg Latency</span>
                      </div>
                      <span className="font-bold text-lg text-[#CFFFDC]">
                        {isConnected ? '2.3' : '0'} <span className="text-xs text-slate-400">ms</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${isConnected ? 'bg-gradient-to-r from-[#2E6F40] to-[#68BA7F] w-1/4' : 'w-0'}`}
                      ></div>
                    </div>
                  </div>

                  {/* Success Rate */}
                  <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-secondary" />
                        <span className="text-slate-300 text-sm font-medium">Success Rate</span>
                      </div>
                      <span className="font-bold text-lg text-secondary">
                        {isConnected ? '99.8' : '0'}<span className="text-xs text-slate-400">%</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${isConnected ? 'bg-gradient-to-r from-brand-500 to-brand-300 w-full' : 'w-0'}`}
                      ></div>
                    </div>
                  </div>

                  {/* Event Counter */}
                  <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-xl p-4 border border-orange-500/20">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-orange-400" />
                        <span className="text-slate-300 text-sm font-medium">Total Events Processed</span>
                      </div>
                      <span className="font-bold text-lg text-orange-400">
                        {streamingEvents.length.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Main Events Display */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-slate-800/40  rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl"
            >
              {/* Stream Header */}
              <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 p-6 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-[#2E6F40] to-[#68BA7F] rounded-xl shadow-lg">
                      {activeTab === 'connection' ? (
                        <Terminal className="w-6 h-6 text-primary" />
                      ) : (
                        <Activity className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary">
                        {activeTab === 'connection' ? 'Connection Diagnostics' : 'Live Event Stream'}
                      </h3>
                      <p className="text-slate-400 text-sm mt-1">
                        {activeTab === 'connection' 
                          ? 'Test server connectivity and configuration'
                          : isStreaming 
                            ? `Monitoring ${activeTab === 'overview' ? 'all services' : activeTab} in real-time`
                            : 'Waiting for stream activation'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {/* Stream Status Indicator */}
                  {activeTab !== 'connection' && (
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                        isStreaming 
                          ? 'bg-brand-500/15 border border-brand-500/25' 
                          : 'bg-slate-600/30 border border-slate-600/50'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          isStreaming ? 'bg-brand-300 animate-pulse' : 'bg-slate-400'
                        }`}></div>
                        <span className={`text-xs font-semibold ${
                          isStreaming ? 'text-secondary' : 'text-slate-400'
                        }`}>
                          {isStreaming ? 'LIVE' : 'IDLE'}
                        </span>
                      </div>
                      
                      {isStreaming && (
                        <div className="text-right">
                          <div className="text-xs text-slate-400">Events</div>
                          <div className="text-sm font-bold text-primary">{streamingEvents.length}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Events Container */}
              <div className="h-96 overflow-y-auto bg-slate-900/50">
                {activeTab === 'connection' ? (
                  // Connection Test Content
                  <div className="p-6 space-y-4">
                    {/* Connection Test Controls */}
                    <div className="flex gap-3 mb-4">
                      <button
                        onClick={testConnection}
                        disabled={connectionTestStatus === 'testing'}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          connectionTestStatus === 'testing'
                            ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                            : 'bg-gradient-to-r from-[#2E6F40] to-[#68BA7F] text-primary hover:opacity-90'
                        } flex items-center gap-2`}
                      >
                        {connectionTestStatus === 'testing' ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Terminal className="w-4 h-4" />
                        )}
                        {connectionTestStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                      </button>
                      
                      <button
                        onClick={clearConnectionLogs}
                        className="px-4 py-2 bg-gray-600 text-primary rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center gap-2"
                      >
                        <EyeOff className="w-4 h-4" />
                        Clear Logs
                      </button>
                    </div>

                    {/* Connection Status */}
                    <div className={`p-4 rounded-lg border ${
                      connectionTestStatus === 'success' ? 'border-brand-500 bg-brand-500/10' :
                      connectionTestStatus === 'error' ? 'border-red-500 bg-red-500/10' :
                      connectionTestStatus === 'testing' ? 'border-yellow-500 bg-yellow-500/10' :
                      'border-gray-500 bg-gray-500/10'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {connectionTestStatus === 'success' ? (
                          <CheckCircle className="w-5 h-5 text-secondary" />
                        ) : connectionTestStatus === 'error' ? (
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        ) : connectionTestStatus === 'testing' ? (
                          <RefreshCw className="w-5 h-5 text-yellow-400 animate-spin" />
                        ) : (
                          <Clock className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="text-primary font-medium">
                          {connectionTestStatus === 'success' ? 'Connection Test Successful' :
                           connectionTestStatus === 'error' ? 'Connection Test Failed' :
                           connectionTestStatus === 'testing' ? 'Testing Connection...' :
                           'Ready to Test'}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">
                        {connectionTestStatus === 'success' ? 'gRPC server is reachable and CORS is properly configured' :
                         connectionTestStatus === 'error' ? 'Failed to connect to gRPC server or CORS issues detected' :
                         connectionTestStatus === 'testing' ? 'Testing HTTP connection and CORS headers...' :
                         'Click "Test Connection" to verify gRPC server connectivity'}
                      </p>
                    </div>

                    {/* Connection Logs */}
                    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                      <h4 className="text-primary font-medium mb-3 flex items-center gap-2">
                        <Terminal className="w-4 h-4" />
                        Connection Test Logs
                      </h4>
                      <div className="bg-black/50 rounded p-3 h-48 overflow-y-auto font-mono text-sm">
                        {connectionLogs.length === 0 ? (
                          <div className="text-gray-400 italic">No logs yet. Click "Test Connection" to start.</div>
                        ) : (
                          connectionLogs.map((log, index) => (
                            <div key={index} className="text-gray-300 mb-1">
                              {log}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Server Information */}
                    <div className="bg-[rgba(46,111,64,0.12)] border border-[rgba(104,186,127,0.25)] rounded-lg p-4">
                      <h4 className="text-primary font-medium mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Server Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Server URL:</span>
                          <div className="text-primary font-mono">http://localhost:50051</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Protocol:</span>
                          <div className="text-primary">gRPC-Web over HTTP</div>
                        </div>
                        <div>
                          <span className="text-gray-400">CORS:</span>
                          <div className="text-secondary">Enabled</div>
                        </div>
                        <div>
                          <span className="text-gray-400">WebSocket:</span>
                          <div className="text-secondary">Supported</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Professional Events Terminal
                  <div className="h-full">
                    {getEventsForTab().length === 0 ? (
                      // Empty State
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-600/50">
                              <Activity className="w-8 h-8 text-slate-400" />
                            </div>
                          </div>
                          <div className="text-slate-300 text-lg mb-2 font-semibold">No Events</div>
                          <div className="text-slate-500 text-sm">
                            {isStreaming ? 'Listening for incoming events...' : 'Start streaming to monitor events'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Events Terminal Display
                      <div className="space-y-1 p-4">
                        <AnimatePresence>
                          {getEventsForTab().map((event, index) => (
                            <motion.div
                              key={event.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className={`group relative bg-slate-800/30 hover:bg-slate-800/50 border-l-2 transition-all duration-200 rounded-r-lg ${
                                event.status === 'success' ? 'border-l-brand-500 hover:bg-brand-500/5' :
                                event.status === 'warning' ? 'border-l-amber-500 hover:bg-amber-500/5' :
                                event.status === 'error' ? 'border-l-red-500 hover:bg-red-500/5' :
                                'border-l-[#2E6F40] hover:bg-[rgba(46,111,64,0.05)]'
                              }`}
                            >
                              <div className="flex items-start gap-4 p-4">
                                {/* Timestamp */}
                                <div className="flex-shrink-0 text-xs text-slate-400 font-mono min-w-[70px] pt-1">
                                  {new Date(event.timestamp).toLocaleTimeString('en-US', { 
                                    hour12: false, 
                                    hour: '2-digit', 
                                    minute: '2-digit', 
                                    second: '2-digit' 
                                  })}
                                </div>
                                
                                {/* Event Type Badge */}
                                <div className="flex-shrink-0">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                                    event.status === 'success' ? 'bg-brand-500/15 text-secondary border border-brand-500/25' :
                                    event.status === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                    event.status === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                    'bg-[rgba(46,111,64,0.15)] text-[#68BA7F] border border-[rgba(104,186,127,0.22)]'
                                  }`}>
                                    {getStatusIcon(event.status)}
                                    {event.type.toUpperCase()}
                                  </span>
                                </div>
                                
                                {/* Event Data */}
                                <div className="flex-1 min-w-0">
                                  <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700/50">
                                    <pre className="text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap">
                                      {JSON.stringify(event.data, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                                
                                {/* Status Indicator */}
                                <div className="flex-shrink-0 pt-1">
                                  <div className={`w-2 h-2 rounded-full ${
                                    event.status === 'success' ? 'bg-brand-300' :
                                    event.status === 'warning' ? 'bg-amber-400' :
                                    event.status === 'error' ? 'bg-red-400' :
                                    'bg-[#68BA7F]'
                                  }`}></div>
                                </div>
                              </div>
                              
                              {/* Hover Effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-r-lg"></div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                )}
                <div ref={eventsEndRef} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Enhanced API Documentation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 bg-surface  rounded-3xl p-8 border border-outline-variant shadow-2xl shadow-black/20"
        >
          <h3 className="text-3xl font-bold text-primary mb-8 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-[#2E6F40] to-[#68BA7F] rounded-xl">
              <Code className="w-8 h-8" />
            </div>
            API Endpoints
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 bg-white border border-outline-variant shadow-premium rounded-2xl border border-[rgba(104,186,127,0.22)] hover:border-[rgba(104,186,127,0.50)] transition-all duration-300 hover:shadow-lg hover:shadow-[rgba(46,111,64,0.10)]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[rgba(46,111,64,0.20)] rounded-lg">
                  <DollarSign className="w-6 h-6 text-[#CFFFDC]" />
                </div>
                <h4 className="text-primary font-bold text-lg">Payment Processing</h4>
              </div>
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">Real-time payment processing with status updates</p>
              <code className="text-sm text-[#CFFFDC] bg-[rgba(46,111,64,0.12)] px-3 py-2 rounded-lg block">
                ProcessPayments(stream)
              </code>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 bg-gradient-to-br from-brand-500/15 to-brand-300/10 rounded-2xl border border-brand-500/25 hover:border-brand-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-brand-500/20 rounded-lg">
                  <Shield className="w-6 h-6 text-brand-200" />
                </div>
                <h4 className="text-primary font-bold text-lg">Risk Monitoring</h4>
              </div>
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">Dynamic risk assessment with rule updates</p>
              <code className="text-sm text-brand-200 bg-brand-950/50 px-3 py-2 rounded-lg block">
                MonitorRisk(stream)
              </code>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 bg-white border border-outline-variant shadow-premium rounded-2xl border border-[rgba(37,61,44,0.35)] hover:border-[rgba(37,61,44,0.50)] transition-all duration-300 hover:shadow-lg hover:shadow-[rgba(37,61,44,0.10)]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[rgba(37,61,44,0.25)] rounded-lg">
                  <Database className="w-6 h-6 text-[#CFFFDC]" />
                </div>
                <h4 className="text-primary font-bold text-lg">Account Sync</h4>
              </div>
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">Real-time balance synchronization</p>
              <code className="text-sm text-[#CFFFDC] bg-[rgba(37,61,44,0.20)] px-3 py-2 rounded-lg block">
                SyncAccountBalances(stream)
              </code>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl border border-orange-500/30 hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-500/30 rounded-lg">
                  <Network className="w-6 h-6 text-orange-300" />
                </div>
                <h4 className="text-primary font-bold text-lg">Webhook Debug</h4>
              </div>
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">Live webhook testing and debugging</p>
              <code className="text-sm text-orange-300 bg-orange-900/30 px-3 py-2 rounded-lg block">
                WebhookDebugger(stream)
              </code>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface  rounded-3xl p-8 border border-outline-variant hover:border-[rgba(104,186,127,0.30)] transition-all duration-300 hover:shadow-xl hover:shadow-[rgba(46,111,64,0.10)]"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-r from-[#2E6F40] to-[#68BA7F] rounded-2xl shadow-lg">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-primary font-bold text-xl">Ultra-low Latency</h4>
            </div>
            <p className="text-gray-300 text-base leading-relaxed">
              Sub-millisecond response times with binary protobuf serialization and persistent connections.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface  rounded-3xl p-8 border border-outline-variant hover:border-brand-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-r from-brand-500 to-brand-300 rounded-2xl shadow-lg">
                <Activity className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-primary font-bold text-xl">Real-time Updates</h4>
            </div>
            <p className="text-gray-300 text-base leading-relaxed">
              Bidirectional streaming enables instant event delivery without polling or webhooks.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-surface  rounded-3xl p-8 border border-outline-variant hover:border-[rgba(37,61,44,0.35)] transition-all duration-300 hover:shadow-xl hover:shadow-[rgba(37,61,44,0.10)]"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-r from-[#253D2C] to-[#2E6F40] rounded-2xl shadow-lg">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-primary font-bold text-xl">Type Safety</h4>
            </div>
            <p className="text-gray-300 text-base leading-relaxed">
              Strongly typed contracts with Protocol Buffers eliminate runtime errors and improve reliability.
            </p>
          </motion.div>
          
          <div className="bg-surface backdrop-blur-lg rounded-2xl p-6 border border-outline-variant">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <TrendingUp className="w-6 h-6 text-orange-400" />
              </div>
              <h4 className="text-primary font-semibold">High Performance</h4>
            </div>
            <p className="text-gray-300 text-sm">
              Handle 10,000+ concurrent connections with efficient memory usage and connection pooling.
            </p>
          </div>
          
          <div className="bg-surface backdrop-blur-lg rounded-2xl p-6 border border-outline-variant">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-pink-500/20 rounded-xl">
                <Users className="w-6 h-6 text-pink-400" />
              </div>
              <h4 className="text-primary font-semibold">Interactive Sessions</h4>
            </div>
            <p className="text-gray-300 text-sm">
              Maintain stateful sessions with dynamic configuration updates and interactive workflows.
            </p>
          </div>
          
          <div className="bg-surface backdrop-blur-lg rounded-2xl p-6 border border-outline-variant">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-indigo-500/20 rounded-xl">
                <Database className="w-6 h-6 text-[#68BA7F]" />
              </div>
              <h4 className="text-primary font-semibold">Production Ready</h4>
            </div>
            <p className="text-gray-300 text-sm">
              Built-in health checks, metrics, authentication, and comprehensive error handling.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GRPCDemo; 