import React, { useState, useEffect } from 'react';
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
  Users,
  Shield,
  Globe,
  Wifi,
  WifiOff,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';
import { grpcPaymentService, type PaymentStreamResponse } from '../lib/grpcPaymentService';
import { getSessionUserId } from '../lib/utils';

interface PaymentEvent {
  id: string;
  timestamp: string;
  type: 'initiated' | 'status_update' | 'completed' | 'error';
  data: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

const RealTimePayments: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [paymentEvents, setPaymentEvents] = useState<PaymentEvent[]>([]);
  const [activePayments, setActivePayments] = useState<Record<string, any>>({});
  const [metrics, setMetrics] = useState({
    totalVolume: 0,
    successRate: 0,
    avgProcessingTime: 0,
    activeCount: 0
  });

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    fromAccountId: 'acc_001',
    toAccountId: 'acc_002',
    amount: 100,
    currency: 'USD',
    description: 'Real-time payment demo',
    reference: '',
    preferredRail: 'ACH'
  });

  // Initialize gRPC connection
  useEffect(() => {
    const initializePaymentService = async () => {
      try {
        const connected = await grpcPaymentService.connect();
        setIsConnected(connected);
        
        if (connected) {
          console.log('gRPC Payment service connected');
        }
      } catch (error) {
        console.error('Failed to connect to payment service:', error);
        setIsConnected(false);
      }
    };

    initializePaymentService();

    return () => {
      grpcPaymentService.disconnect();
    };
  }, []);

  // Handle payment stream events
  const handlePaymentEvent = (event: PaymentStreamResponse) => {
    const timestamp = new Date().toISOString();
    
    if (event.event.paymentInitiated) {
      const payment = event.event.paymentInitiated;
      
      const paymentEvent: PaymentEvent = {
        id: payment.paymentId,
        timestamp,
        type: 'initiated',
        data: payment,
        status: 'pending'
      };
      
      setPaymentEvents(prev => [paymentEvent, ...prev.slice(0, 49)]); // Keep last 50 events
      setActivePayments(prev => ({
        ...prev,
        [payment.paymentId]: {
          ...payment,
          events: [paymentEvent]
        }
      }));
    }
    
    if (event.event.paymentStatusUpdate) {
      const update = event.event.paymentStatusUpdate;
      
      const paymentEvent: PaymentEvent = {
        id: `${update.paymentId}_${Date.now()}`,
        timestamp,
        type: 'status_update',
        data: update,
        status: update.status.toLowerCase() as any
      };
      
      setPaymentEvents(prev => [paymentEvent, ...prev.slice(0, 49)]);
      setActivePayments(prev => ({
        ...prev,
        [update.paymentId]: {
          ...prev[update.paymentId],
          status: update.status,
          events: [paymentEvent, ...(prev[update.paymentId]?.events || [])]
        }
      }));
    }
    
    if (event.event.paymentCompleted) {
      const completion = event.event.paymentCompleted;
      
      const paymentEvent: PaymentEvent = {
        id: `${completion.paymentId}_completed`,
        timestamp,
        type: 'completed',
        data: completion,
        status: 'completed'
      };
      
      setPaymentEvents(prev => [paymentEvent, ...prev.slice(0, 49)]);
      setActivePayments(prev => ({
        ...prev,
        [completion.paymentId]: {
          ...prev[completion.paymentId],
          status: 'completed',
          completedAt: completion.completedAt,
          events: [paymentEvent, ...(prev[completion.paymentId]?.events || [])]
        }
      }));
    }
    
    if (event.event.paymentError) {
      const error = event.event.paymentError;
      
      const paymentEvent: PaymentEvent = {
        id: `${error.paymentId}_error`,
        timestamp,
        type: 'error',
        data: error,
        status: 'failed'
      };
      
      setPaymentEvents(prev => [paymentEvent, ...prev.slice(0, 49)]);
      setActivePayments(prev => ({
        ...prev,
        [error.paymentId]: {
          ...prev[error.paymentId],
          status: 'failed',
          error: error.errorMessage,
          events: [paymentEvent, ...(prev[error.paymentId]?.events || [])]
        }
      }));
    }
  };

  // Start payment streaming
  const startStreaming = async () => {
    if (!isConnected) return;
    
    try {
      const userId = getSessionUserId();
      await grpcPaymentService.startPaymentStream(userId, handlePaymentEvent);
      await grpcPaymentService.subscribeToUserPayments(userId);
      setIsStreaming(true);
    } catch (error) {
      console.error('Failed to start payment streaming:', error);
    }
  };

  // Stop payment streaming
  const stopStreaming = () => {
    grpcPaymentService.disconnect();
    setIsStreaming(false);
  };

  // Initiate payment
  const initiatePayment = async () => {
    if (!isConnected) return;
    
    try {
      const reference = `PAY_${Date.now()}`;
      const userId = getSessionUserId();
      const paymentRequest = {
        userId,
        ...paymentForm,
        reference
      };
      
      await grpcPaymentService.initiatePayment(paymentRequest);
      
      // Update form with new reference
      setPaymentForm(prev => ({ ...prev, reference }));
    } catch (error) {
      console.error('Failed to initiate payment:', error);
    }
  };

  // Calculate metrics
  useEffect(() => {
    const payments = Object.values(activePayments);
    const completed = payments.filter(p => p.status === 'completed');
    const failed = payments.filter(p => p.status === 'failed');
    const active = payments.filter(p => ['pending', 'processing'].includes(p.status));
    
    setMetrics({
      totalVolume: completed.reduce((sum, p) => sum + (p.amount || 0), 0),
      successRate: payments.length > 0 ? (completed.length / payments.length) * 100 : 0,
      avgProcessingTime: completed.length > 0 ? 2.3 : 0, // Mock average
      activeCount: active.length
    });
  }, [activePayments]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'failed': return 'text-red-500';
      case 'processing': return 'text-yellow-500';
      default: return 'text-blue-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Real-time Payment Processing
          </h1>
          <p className="text-xl text-blue-100/80 mb-6">
            gRPC bidirectional streaming for instant payment updates
          </p>
          
          {/* Connection Status */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              isConnected ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
            }`}>
              {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              isStreaming ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-300'
            }`}>
              {isStreaming ? <Activity className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isStreaming ? 'Streaming' : 'Idle'}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {!isStreaming ? (
              <button
                onClick={startStreaming}
                disabled={!isConnected}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Play className="w-4 h-4" />
                Start Streaming
              </button>
            ) : (
              <button
                onClick={stopStreaming}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                <Pause className="w-4 h-4" />
                Stop Streaming
              </button>
            )}
            
            <button
              onClick={initiatePayment}
              disabled={!isConnected || !isStreaming}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <DollarSign className="w-4 h-4" />
              Send Test Payment
            </button>
          </div>
        </motion.div>

        {/* Metrics Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-8 h-8 text-green-400" />
              <h3 className="text-white font-semibold">Total Volume</h3>
            </div>
            <p className="text-3xl font-bold text-white">${metrics.totalVolume.toFixed(2)}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-blue-400" />
              <h3 className="text-white font-semibold">Success Rate</h3>
            </div>
            <p className="text-3xl font-bold text-white">{metrics.successRate.toFixed(1)}%</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-8 h-8 text-yellow-400" />
              <h3 className="text-white font-semibold">Avg Processing</h3>
            </div>
            <p className="text-3xl font-bold text-white">{metrics.avgProcessingTime.toFixed(1)}s</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-8 h-8 text-purple-400" />
              <h3 className="text-white font-semibold">Active Payments</h3>
            </div>
            <p className="text-3xl font-bold text-white">{metrics.activeCount}</p>
          </div>
        </motion.div>

        {/* Real-time Events Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden"
        >
          <div className="p-6 border-b border-white/20">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Real-time Payment Events
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Live stream of payment processing events via gRPC
            </p>
          </div>
          
          <div className="h-96 overflow-y-auto p-6 space-y-3">
            <AnimatePresence>
              {paymentEvents.length > 0 ? (
                paymentEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10"
                  >
                    <div className={getStatusColor(event.status)}>
                      {getStatusIcon(event.status)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium">
                          {event.type === 'initiated' && 'Payment Initiated'}
                          {event.type === 'status_update' && 'Status Update'}
                          {event.type === 'completed' && 'Payment Completed'}
                          {event.type === 'error' && 'Payment Failed'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-300">
                        {event.type === 'initiated' && (
                          <>
                            Payment ID: {event.data.paymentId} • 
                            Amount: ${event.data.amount} {event.data.currency} • 
                            Rail: {event.data.selectedRail}
                          </>
                        )}
                        {event.type === 'status_update' && (
                          <>
                            {event.data.paymentId} → {event.data.status} • 
                            {event.data.message}
                          </>
                        )}
                        {event.type === 'completed' && (
                          <>
                            {event.data.paymentId} • 
                            Final Amount: ${event.data.finalAmount} • 
                            Rail: {event.data.railUsed}
                          </>
                        )}
                        {event.type === 'error' && (
                          <>
                            {event.data.paymentId} • 
                            Error: {event.data.errorMessage}
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">
                    No payment events yet. Start streaming to see real-time updates.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RealTimePayments; 