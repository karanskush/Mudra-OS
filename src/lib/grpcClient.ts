// gRPC Client for connecting to the backend services
// This client uses HTTP to communicate with the gRPC-Web server

export interface StreamEvent {
  id: string;
  timestamp: string;
  type: 'payment' | 'risk' | 'reconciliation' | 'webhook' | 'stats';
  data: any;
  status: 'success' | 'warning' | 'error' | 'info';
}

export interface PaymentRequest {
  initiatePayment?: {
    userId: string;
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    currency: string;
    description: string;
    reference?: string;
    preferredRail: number;
    forceRail: boolean;
  };
  updatePayment?: {
    paymentId: string;
    newStatus: number;
    reason: string;
    metadata: Record<string, string>;
  };
  cancelPayment?: {
    paymentId: string;
    reason: string;
  };
  getStatus?: {
    paymentId: string;
    includeDetails: boolean;
  };
}

export interface PaymentResponse {
  paymentInitiated?: {
    paymentId: string;
    sessionId: string;
    selectedRail: number;
    estimatedFee: number;
    estimatedTime: string;
    fxRate: number;
    message: string;
    initiatedAt: string;
  };
  statusUpdate?: {
    paymentId: string;
    status: number;
    message: string;
    metadata: Record<string, string>;
    updatedAt: string;
  };
  paymentCompleted?: {
    paymentId: string;
    finalAmount: number;
    finalFee: number;
    transactionId: string;
    confirmationNumber: string;
    completedAt: string;
    message: string;
  };
  paymentError?: {
    paymentId: string;
    errorCode: string;
    errorMessage: string;
    errorDetails: string;
    isRetryable: boolean;
    errorAt: string;
  };
}

class GrpcClient {
  private serverUrl: string;
  private eventListeners: ((event: StreamEvent) => void)[] = [];
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private mockStreamingInterval: NodeJS.Timeout | null = null;

  constructor(serverUrl: string = 'http://localhost:50051') {
    this.serverUrl = serverUrl;
  }

  // Connect to the gRPC service
  async connect(): Promise<boolean> {
    return new Promise(async (resolve) => {
      try {
        // Test connection by making a simple HTTP request
        const response = await fetch(this.serverUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          console.log('gRPC HTTP connection successful');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve(true);
        } else {
          console.log('gRPC HTTP connection failed, using mock data');
          this.isConnected = false;
          resolve(false);
        }
      } catch (error) {
        console.error('Failed to connect to gRPC service:', error);
        this.isConnected = false;
        resolve(false);
      }
    });
  }

  // Disconnect from the service
  disconnect() {
    this.isConnected = false;
    if (this.mockStreamingInterval) {
      clearInterval(this.mockStreamingInterval);
      this.mockStreamingInterval = null;
    }
  }

  // Send a payment request
  async sendPaymentRequest(request: PaymentRequest): Promise<void> {
    if (!this.isConnected) {
      console.warn('Not connected to gRPC service, using mock response');
      // Simulate a mock response
      setTimeout(() => {
        const mockResponse = {
          paymentInitiated: {
            paymentId: `pay_${Date.now()}`,
            sessionId: `session_${Date.now()}`,
            selectedRail: request.initiatePayment?.preferredRail || 1,
            estimatedFee: 2.50,
            estimatedTime: '2-3 business days',
            fxRate: 1.0,
            message: 'Payment request received and being processed',
            initiatedAt: new Date().toISOString(),
          }
        };
        
        const event: StreamEvent = {
          id: mockResponse.paymentInitiated.paymentId,
          timestamp: new Date().toISOString(),
          type: 'payment',
          data: mockResponse,
          status: 'info',
        };
        
        this.eventListeners.forEach(listener => listener(event));
      }, 1000);
      return;
    }

    try {
      // In a real implementation, this would use proper gRPC-Web protocol
      // For now, we'll simulate the request
      console.log('Sending payment request:', request);
      
      // Simulate processing time
      setTimeout(() => {
        const mockResponse = {
          paymentInitiated: {
            paymentId: `pay_${Date.now()}`,
            sessionId: `session_${Date.now()}`,
            selectedRail: request.initiatePayment?.preferredRail || 1,
            estimatedFee: 2.50,
            estimatedTime: '2-3 business days',
            fxRate: 1.0,
            message: 'Payment request received and being processed',
            initiatedAt: new Date().toISOString(),
          }
        };
        
        const event: StreamEvent = {
          id: mockResponse.paymentInitiated.paymentId,
          timestamp: new Date().toISOString(),
          type: 'payment',
          data: mockResponse,
          status: 'info',
        };
        
        this.eventListeners.forEach(listener => listener(event));
      }, 1000);
    } catch (error) {
      console.error('Error sending payment request:', error);
    }
  }

  // Add event listener
  addEventListener(listener: (event: StreamEvent) => void) {
    this.eventListeners.push(listener);
  }

  // Remove event listener
  removeEventListener(listener: (event: StreamEvent) => void) {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  // Handle incoming stream events
  private handleStreamEvent(data: any) {
    const event: StreamEvent = {
      id: data.paymentId || data.transactionId || Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: 'payment',
      data: data,
      status: this.getStatusFromResponse(data),
    };

    // Notify all listeners
    this.eventListeners.forEach(listener => listener(event));
  }

  // Convert payment response to stream event status
  private getStatusFromResponse(response: any): 'success' | 'warning' | 'error' | 'info' {
    if (response.paymentError) {
      return 'error';
    }
    if (response.paymentCompleted) {
      return 'success';
    }
    if (response.statusUpdate) {
      const status = response.statusUpdate.status;
      if (status === 3) return 'success'; // COMPLETED
      if (status === 4) return 'error';   // FAILED
      if (status === 5) return 'warning'; // CANCELLED
      return 'info';
    }
    return 'info';
  }

  // Handle reconnection logic
  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.log('Max reconnection attempts reached');
    }
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Generate mock events for demonstration when gRPC is not available
  startMockStreaming() {
    const mockEvents: StreamEvent[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        type: 'payment',
        data: { 
          paymentId: 'pay_123', 
          amount: 1500, 
          currency: 'USD', 
          status: 'processing',
          message: 'Payment validated'
        },
        status: 'info'
      },
      {
        id: '2',
        timestamp: new Date().toISOString(),
        type: 'payment',
        data: { 
          paymentId: 'pay_124', 
          amount: 2500, 
          currency: 'EUR', 
          status: 'completed',
          message: 'Payment completed successfully'
        },
        status: 'success'
      },
      {
        id: '3',
        timestamp: new Date().toISOString(),
        type: 'payment',
        data: { 
          paymentId: 'pay_125', 
          amount: 5000, 
          currency: 'USD', 
          status: 'failed',
          message: 'Insufficient funds'
        },
        status: 'error'
      }
    ];

    // Send mock events periodically
    let eventIndex = 0;
    this.mockStreamingInterval = setInterval(() => {
      if (!this.isConnected) {
        const event = mockEvents[eventIndex % mockEvents.length];
        event.id = `mock_${Date.now()}`;
        event.timestamp = new Date().toISOString();
        
        this.eventListeners.forEach(listener => listener(event));
        eventIndex++;
      } else {
        // Stop mock streaming if we're connected to real service
        if (this.mockStreamingInterval) {
          clearInterval(this.mockStreamingInterval);
          this.mockStreamingInterval = null;
        }
      }
    }, 3000);

    // Return cleanup function
    return () => {
      if (this.mockStreamingInterval) {
        clearInterval(this.mockStreamingInterval);
        this.mockStreamingInterval = null;
      }
    };
  }
}

// Export singleton instance
export const grpcClient = new GrpcClient(); 