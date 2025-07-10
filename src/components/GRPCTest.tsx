import React, { useState, useEffect } from 'react';
import { grpcWebClient, CreateProfileRequest, CreatePaymentRequest } from '../lib/grpcWebClient';

interface TestResult {
  test: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  data?: any;
}

const GRPCTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    try {
      const isConnected = await grpcWebClient.testConnection();
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  };

  const addTestResult = (test: string, status: 'success' | 'error' | 'pending', message: string, data?: any) => {
    setTestResults(prev => [...prev, { test, status, message, data }]);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // Test 1: Health Check
      addTestResult('Health Check', 'pending', 'Testing server health...');
      try {
        const health = await grpcWebClient.healthCheck();
        addTestResult('Health Check', 'success', 'Server is healthy', health);
      } catch (error) {
        addTestResult('Health Check', 'error', `Health check failed: ${error}`);
        return;
      }

      // Test 2: Create KYC Profile
      addTestResult('Create KYC Profile', 'pending', 'Creating test KYC profile...');
      try {
        const kycRequest: CreateProfileRequest = {
          userId: 'test-user-123',
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          country: 'US',
          location: 'New York, NY',
          amount: 5000000, // $50,000 in cents
          documents: {
            'passport': 'base64-encoded-passport-data',
            'drivers_license': 'base64-encoded-license-data'
          },
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        };

        const kycResponse = await grpcWebClient.createProfile(kycRequest);
        addTestResult('Create KYC Profile', 'success', 'KYC profile created successfully', kycResponse);

        // Test 3: Get KYC Profile
        addTestResult('Get KYC Profile', 'pending', 'Retrieving KYC profile...');
        try {
          const profileResponse = await grpcWebClient.getProfile(kycResponse.profile.profileId);
          addTestResult('Get KYC Profile', 'success', 'KYC profile retrieved successfully', profileResponse);
        } catch (error) {
          addTestResult('Get KYC Profile', 'error', `Failed to get profile: ${error}`);
        }

      } catch (error) {
        addTestResult('Create KYC Profile', 'error', `Failed to create KYC profile: ${error}`);
      }

      // Test 4: Create Payment
      addTestResult('Create Payment', 'pending', 'Creating test payment...');
      try {
        const paymentRequest: CreatePaymentRequest = {
          userId: 'test-user-123',
          fromAccountId: 'account-123',
          toAccountId: 'account-456',
          amount: 100000, // $1,000 in cents
          currency: 'USD',
          description: 'Test payment for gRPC testing',
          reference: 'TEST-001',
          forceRail: false,
          preferredRail: 'ACH'
        };

        const paymentResponse = await grpcWebClient.createPayment(paymentRequest);
        addTestResult('Create Payment', 'success', 'Payment created successfully', paymentResponse);

        // Test 5: Get Payment
        addTestResult('Get Payment', 'pending', 'Retrieving payment details...');
        try {
          const getPaymentResponse = await grpcWebClient.getPayment(paymentResponse.payment.paymentId);
          addTestResult('Get Payment', 'success', 'Payment retrieved successfully', getPaymentResponse);
        } catch (error) {
          addTestResult('Get Payment', 'error', `Failed to get payment: ${error}`);
        }

      } catch (error) {
        addTestResult('Create Payment', 'error', `Failed to create payment: ${error}`);
      }

      // Test 6: Payment Streaming (simulated)
      addTestResult('Payment Streaming', 'pending', 'Testing payment streaming...');
      try {
        const eventSource = grpcWebClient.streamPayments('test-user-123', ['PENDING', 'PROCESSING']);
        
        eventSource.onopen = () => {
          addTestResult('Payment Streaming', 'success', 'Payment stream connected successfully');
        };

        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          addTestResult('Payment Streaming', 'success', 'Received payment update', data);
        };

        eventSource.onerror = (error) => {
          addTestResult('Payment Streaming', 'error', `Stream error: ${error}`);
        };

        // Close stream after 5 seconds
        setTimeout(() => {
          eventSource.close();
        }, 5000);

      } catch (error) {
        addTestResult('Payment Streaming', 'error', `Failed to start payment stream: ${error}`);
      }

    } catch (error) {
      addTestResult('Test Suite', 'error', `Test suite failed: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'disconnected': return 'text-red-600';
      case 'checking': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">gRPC API Test Suite</h1>
        <p className="text-gray-600">
          Test all gRPC services to ensure they're working correctly
        </p>
        
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Connection Status:</span>
            <span className={`text-sm font-semibold ${getConnectionColor()}`}>
              {connectionStatus === 'checking' && 'Checking...'}
              {connectionStatus === 'connected' && 'Connected'}
              {connectionStatus === 'disconnected' && 'Disconnected'}
            </span>
          </div>
          
          <button
            onClick={checkConnection}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={runAllTests}
          disabled={isRunning || connectionStatus === 'disconnected'}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            isRunning || connectionStatus === 'disconnected'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </button>
      </div>

      <div className="space-y-4">
        {testResults.map((result, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{result.test}</h3>
              <span className={`font-medium ${getStatusColor(result.status)}`}>
                {result.status.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-600 mb-2">{result.message}</p>
            {result.data && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                  View Response Data
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-64">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}

        {testResults.length === 0 && !isRunning && (
          <div className="text-center py-8 text-gray-500">
            No tests have been run yet. Click "Run All Tests" to start testing the gRPC APIs.
          </div>
        )}
      </div>

      {connectionStatus === 'disconnected' && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">Connection Issue</h3>
          <p className="text-red-700 text-sm">
            Unable to connect to the backend server. Please ensure:
          </p>
          <ul className="text-red-700 text-sm mt-2 list-disc list-inside">
            <li>The backend server is running on port 8080</li>
            <li>The gRPC server is running on port 50051</li>
            <li>There are no firewall or network issues</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default GRPCTest; 