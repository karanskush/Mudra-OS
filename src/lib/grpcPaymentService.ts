// gRPC Payment Service for Real-time Payment Processing
// Handles payment initiation, status updates, and rail selection

import { getApiUrl } from './env';

export interface PaymentStreamRequest {
  command: {
    initiatePayment?: {
      userId: string;
      fromAccountId: string;
      toAccountId: string;
      amount: number;
      currency: string;
      description: string;
      reference: string;
      preferredRail?: string;
      forceRail?: boolean;
    };
    updatePaymentStatus?: {
      paymentId: string;
      status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
      message?: string;
    };
    getPaymentStatus?: {
      paymentId: string;
    };
    subscribeToPayments?: {
      userId: string;
      statusFilter?: string[];
    };
  };
}

export interface PaymentStreamResponse {
  event: {
    paymentInitiated?: {
      paymentId: string;
      userId: string;
      amount: number;
      currency: string;
      selectedRail: string;
      estimatedFee: number;
      estimatedTime: string;
      fxRate: number;
      status: 'PENDING';
      initiatedAt: string;
    };
    paymentStatusUpdate?: {
      paymentId: string;
      status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
      message: string;
      timestamp: string;
      railInfo?: {
        railName: string;
        processingTime: string;
        fee: number;
        confirmationCode?: string;
      };
    };
    paymentCompleted?: {
      paymentId: string;
      finalAmount: number;
      actualFee: number;
      completedAt: string;
      confirmationCode: string;
      railUsed: string;
      fxRate: number;
    };
    paymentError?: {
      paymentId: string;
      errorCode: string;
      errorMessage: string;
      retryable: boolean;
      failedAt: string;
    };
  };
}

class GrpcPaymentService {
  private baseUrl: string;
  private isConnected = false;
  private eventListeners: Array<(event: PaymentStreamResponse) => void> = [];
  private activeStreams: Map<string, EventSource> = new Map();

  constructor() {
    this.baseUrl = getApiUrl();
  }

  async connect(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grpc/payment/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        this.isConnected = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to connect to payment service:', error);
      return false;
    }
  }

  // Start bidirectional payment streaming
  async startPaymentStream(userId: string, onEvent: (event: PaymentStreamResponse) => void): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Not connected to payment service');
    }

    const streamId = `payment_stream_${userId}`;
    
    // Create Server-Sent Events connection for receiving updates
    const eventSource = new EventSource(`${this.baseUrl}/api/grpc/payment/stream?userId=${userId}`, {
      withCredentials: true
    });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as PaymentStreamResponse;
        onEvent(data);
      } catch (error) {
        console.error('Error parsing payment stream event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Payment stream error:', error);
      this.activeStreams.delete(streamId);
    };

    this.activeStreams.set(streamId, eventSource);
  }

  // Send payment command (initiate, update status, etc.)
  async sendPaymentCommand(command: PaymentStreamRequest): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Not connected to payment service');
    }

    const response = await fetch(`${this.baseUrl}/api/grpc/payment/command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(command)
    });

    if (!response.ok) {
      throw new Error(`Payment command failed: ${response.statusText}`);
    }
  }

  // Initiate payment with real-time updates
  async initiatePayment(paymentRequest: PaymentStreamRequest['command']['initiatePayment']): Promise<string> {
    const command: PaymentStreamRequest = {
      command: {
        initiatePayment: paymentRequest
      }
    };

    await this.sendPaymentCommand(command);
    
    // Return a temporary payment ID (real implementation would return actual ID)
    return `pay_${Date.now()}`;
  }

  // Subscribe to payment updates for a specific user
  async subscribeToUserPayments(userId: string, statusFilter?: string[]): Promise<(event: PaymentStreamResponse) => void> {
    const command: PaymentStreamRequest = {
      command: {
        subscribeToPayments: {
          userId,
          statusFilter
        }
      }
    };

    await this.sendPaymentCommand(command);
    
    return (event: PaymentStreamResponse) => {
      this.eventListeners.forEach(listener => listener(event));
    };
  }

  addEventListener(listener: (event: PaymentStreamResponse) => void): void {
    this.eventListeners.push(listener);
  }

  removeEventListener(listener: (event: PaymentStreamResponse) => void): void {
    this.eventListeners = this.eventListeners.filter(l => l !== listener);
  }

  disconnect(): void {
    this.activeStreams.forEach((eventSource, streamId) => {
      eventSource.close();
      this.activeStreams.delete(streamId);
    });
    this.isConnected = false;
  }
}

export const grpcPaymentService = new GrpcPaymentService(); 