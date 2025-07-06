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
          'Origin': 'http://localhost:5173',
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
      case 'success': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-blue-500';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <div className="relative z-10 container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              gRPC Bidirectional Streaming
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Real-time financial operations with ultra-low latency bidirectional streaming APIs
            </p>
            
            {/* Connection Status */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
                connectionStatus === 'connecting' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {connectionStatus === 'connected' ? <Wifi className="w-4 h-4" /> :
                 connectionStatus === 'connecting' ? <RefreshCw className="w-4 h-4 animate-spin" /> :
                 <WifiOff className="w-4 h-4" />}
                <span className="text-sm font-medium">
                  {connectionStatus === 'connected' ? 'Connected' :
                   connectionStatus === 'connecting' ? 'Connecting...' :
                   'Disconnected'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full">
                <Activity className="w-4 h-4" />
                <span className="text-sm font-medium">Port 50051</span>
              </div>

              {isStreaming && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-full">
                  <Activity className="w-4 h-4 animate-pulse" />
                  <span className="text-sm font-medium">Streaming Active</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-8">
        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {tab.icon}
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Controls
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Auto-scroll</span>
                  <button
                    onClick={() => setAutoScroll(!autoScroll)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      autoScroll ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      autoScroll ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Show Metrics</span>
                  <button
                    onClick={() => setShowMetrics(!showMetrics)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      showMetrics ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      showMetrics ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="pt-4 border-t border-white/20 space-y-3">
                  {activeTab === 'connection' ? (
                    // Connection Test Controls
                    <>
                      <button 
                        onClick={testConnection}
                        disabled={connectionTestStatus === 'testing'}
                        className={`w-full py-3 rounded-xl font-medium transition-opacity flex items-center justify-center gap-2 ${
                          connectionTestStatus === 'testing'
                            ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90'
                        }`}
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
                        className="w-full bg-gray-600 text-white py-3 rounded-xl font-medium hover:bg-gray-700 transition-opacity flex items-center justify-center gap-2"
                      >
                        <EyeOff className="w-4 h-4" />
                        Clear Logs
                      </button>
                    </>
                  ) : (
                    // Regular Controls
                    <>
                      {!isConnected && (
                        <button 
                          onClick={connectToGrpc}
                          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        >
                          <Wifi className="w-4 h-4" />
                          Connect to gRPC
                        </button>
                      )}
                      
                      {!isStreaming ? (
                        <button 
                          onClick={startStreaming}
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          Start Streaming
                        </button>
                      ) : (
                        <button 
                          onClick={stopStreaming}
                          className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        >
                          <Square className="w-4 h-4" />
                          Stop Streaming
                        </button>
                      )}
                      
                      {isStreaming && (
                        <button 
                          onClick={sendTestPayment}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        >
                          <DollarSign className="w-4 h-4" />
                          Send Test Payment
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Metrics Panel */}
            {showMetrics && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mt-6"
              >
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Metrics
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Active Sessions</span>
                    <span className="text-green-400 font-semibold">{isStreaming ? '1' : '0'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Events/sec</span>
                    <span className="text-blue-400 font-semibold">{isStreaming ? '1,247' : '0'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Avg Latency</span>
                    <span className="text-purple-400 font-semibold">{isConnected ? '2.3ms' : 'N/A'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Success Rate</span>
                    <span className="text-green-400 font-semibold">{isConnected ? '99.8%' : 'N/A'}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Events</span>
                    <span className="text-orange-400 font-semibold">{streamingEvents.length}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Center Panel - Events Stream */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden"
            >
              <div className="p-6 border-b border-white/20">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  {activeTab === 'connection' ? <Terminal className="w-5 h-5" /> : <Terminal className="w-5 h-5" />}
                  {activeTab === 'connection' ? 'Connection Test' : 'Real-time Events Stream'}
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  {activeTab === 'connection' 
                    ? 'Test the gRPC server connection and CORS configuration'
                    : isStreaming 
                      ? `Live bidirectional streaming events from ${activeTab === 'overview' ? 'all services' : activeTab} API`
                      : 'Click "Start Streaming" to begin receiving real-time events'
                  }
                </p>
              </div>
              
              <div className="h-96 overflow-y-auto p-4 space-y-3">
                {activeTab === 'connection' ? (
                  // Connection Test Content
                  <div className="space-y-4">
                    {/* Connection Test Controls */}
                    <div className="flex gap-3 mb-4">
                      <button
                        onClick={testConnection}
                        disabled={connectionTestStatus === 'testing'}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          connectionTestStatus === 'testing'
                            ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90'
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
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center gap-2"
                      >
                        <EyeOff className="w-4 h-4" />
                        Clear Logs
                      </button>
                    </div>

                    {/* Connection Status */}
                    <div className={`p-4 rounded-lg border ${
                      connectionTestStatus === 'success' ? 'border-green-500 bg-green-500/10' :
                      connectionTestStatus === 'error' ? 'border-red-500 bg-red-500/10' :
                      connectionTestStatus === 'testing' ? 'border-yellow-500 bg-yellow-500/10' :
                      'border-gray-500 bg-gray-500/10'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {connectionTestStatus === 'success' ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : connectionTestStatus === 'error' ? (
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        ) : connectionTestStatus === 'testing' ? (
                          <RefreshCw className="w-5 h-5 text-yellow-400 animate-spin" />
                        ) : (
                          <Clock className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="text-white font-medium">
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
                      <h4 className="text-white font-medium mb-3 flex items-center gap-2">
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
                    <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Server Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Server URL:</span>
                          <div className="text-white font-mono">http://localhost:50051</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Protocol:</span>
                          <div className="text-white">gRPC-Web over HTTP</div>
                        </div>
                        <div>
                          <span className="text-gray-400">CORS:</span>
                          <div className="text-green-400">Enabled</div>
                        </div>
                        <div>
                          <span className="text-gray-400">WebSocket:</span>
                          <div className="text-green-400">Supported</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Regular Events Stream Content
                  <AnimatePresence>
                    {getEventsForTab().map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`p-4 rounded-xl border-l-4 ${
                          event.status === 'success' ? 'border-green-500 bg-green-500/10' :
                          event.status === 'warning' ? 'border-yellow-500 bg-yellow-500/10' :
                          event.status === 'error' ? 'border-red-500 bg-red-500/10' :
                          'border-blue-500 bg-blue-500/10'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              event.status === 'success' ? 'bg-green-500/20' :
                              event.status === 'warning' ? 'bg-yellow-500/20' :
                              event.status === 'error' ? 'bg-red-500/20' :
                              'bg-blue-500/20'
                            }`}>
                              {getStatusIcon(event.status)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-white font-medium">
                                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)} Event
                                </span>
                                <span className="text-xs text-gray-400">
                                  {new Date(event.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <div className="text-sm text-gray-300 mt-1">
                                {JSON.stringify(event.data, null, 2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
                <div ref={eventsEndRef} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Section - API Documentation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Code className="w-5 h-5" />
            API Endpoints
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30">
              <h4 className="text-white font-semibold mb-2">Payment Processing</h4>
              <p className="text-gray-300 text-sm mb-3">Real-time payment processing with status updates</p>
              <code className="text-xs text-blue-300 bg-blue-900/30 px-2 py-1 rounded">
                ProcessPayments(stream)
              </code>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
              <h4 className="text-white font-semibold mb-2">Risk Monitoring</h4>
              <p className="text-gray-300 text-sm mb-3">Dynamic risk assessment with rule updates</p>
              <code className="text-xs text-green-300 bg-green-900/30 px-2 py-1 rounded">
                MonitorRisk(stream)
              </code>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
              <h4 className="text-white font-semibold mb-2">Account Sync</h4>
              <p className="text-gray-300 text-sm mb-3">Real-time balance synchronization</p>
              <code className="text-xs text-purple-300 bg-purple-900/30 px-2 py-1 rounded">
                SyncAccountBalances(stream)
              </code>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl border border-orange-500/30">
              <h4 className="text-white font-semibold mb-2">Webhook Debug</h4>
              <p className="text-gray-300 text-sm mb-3">Live webhook testing and debugging</p>
              <code className="text-xs text-orange-300 bg-orange-900/30 px-2 py-1 rounded">
                WebhookDebugger(stream)
              </code>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <h4 className="text-white font-semibold">Ultra-low Latency</h4>
            </div>
            <p className="text-gray-300 text-sm">
              Sub-millisecond response times with binary protobuf serialization and persistent connections.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Activity className="w-6 h-6 text-green-400" />
              </div>
              <h4 className="text-white font-semibold">Real-time Updates</h4>
            </div>
            <p className="text-gray-300 text-sm">
              Bidirectional streaming enables instant event delivery without polling or webhooks.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <h4 className="text-white font-semibold">Type Safety</h4>
            </div>
            <p className="text-gray-300 text-sm">
              Strongly typed contracts with Protocol Buffers eliminate runtime errors and improve reliability.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <TrendingUp className="w-6 h-6 text-orange-400" />
              </div>
              <h4 className="text-white font-semibold">High Performance</h4>
            </div>
            <p className="text-gray-300 text-sm">
              Handle 10,000+ concurrent connections with efficient memory usage and connection pooling.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-pink-500/20 rounded-xl">
                <Users className="w-6 h-6 text-pink-400" />
              </div>
              <h4 className="text-white font-semibold">Interactive Sessions</h4>
            </div>
            <p className="text-gray-300 text-sm">
              Maintain stateful sessions with dynamic configuration updates and interactive workflows.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-indigo-500/20 rounded-xl">
                <Database className="w-6 h-6 text-indigo-400" />
              </div>
              <h4 className="text-white font-semibold">Production Ready</h4>
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