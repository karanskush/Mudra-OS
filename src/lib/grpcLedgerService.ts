// gRPC Ledger Service for Real-time Balance Updates and Transaction Streaming
// Handles account balance streaming, transaction monitoring, and reconciliation

export interface LedgerStreamRequest {
  command: {
    subscribeToAccount?: {
      accountId: string;
      userId: string;
      includeTransactions?: boolean;
    };
    createTransaction?: {
      fromAccountId: string;
      toAccountId: string;
      amount: number;
      currency: string;
      description: string;
      reference: string;
      metadata?: Record<string, string>;
    };
    getBalance?: {
      accountId: string;
    };
    reconcileAccount?: {
      accountId: string;
      expectedBalance: number;
      currency: string;
    };
    subscribeToTransactions?: {
      userId: string;
      accountIds?: string[];
      statusFilter?: string[];
    };
  };
}

export interface LedgerStreamResponse {
  event: {
    balanceUpdate?: {
      accountId: string;
      userId: string;
      balance: number;
      currency: string;
      previousBalance: number;
      changeAmount: number;
      changeType: 'CREDIT' | 'DEBIT';
      updatedAt: string;
      transactionId?: string;
    };
    transactionCreated?: {
      transactionId: string;
      fromAccountId: string;
      toAccountId: string;
      amount: number;
      currency: string;
      description: string;
      reference: string;
      status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
      createdAt: string;
      estimatedSettlement?: string;
    };
    transactionStatusUpdate?: {
      transactionId: string;
      status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
      message: string;
      timestamp: string;
      failureReason?: string;
    };
    reconciliationResult?: {
      accountId: string;
      reconciled: boolean;
      expectedBalance: number;
      actualBalance: number;
      variance: number;
      reconciliationId: string;
      timestamp: string;
      discrepancies?: Array<{
        transactionId: string;
        issue: string;
        amount: number;
      }>;
    };
    accountLocked?: {
      accountId: string;
      reason: string;
      lockedAt: string;
      unlockConditions?: string[];
    };
    lowBalanceAlert?: {
      accountId: string;
      currentBalance: number;
      threshold: number;
      currency: string;
      alertedAt: string;
    };
  };
}

class GrpcLedgerService {
  private baseUrl: string;
  private isConnected = false;
  private eventListeners: Array<(event: LedgerStreamResponse) => void> = [];
  private activeStreams: Map<string, EventSource> = new Map();

  constructor(baseUrl: string = 'http://localhost:8080') {
    this.baseUrl = baseUrl;
  }

  async connect(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grpc/ledger/health`, {
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
      console.error('Failed to connect to ledger service:', error);
      return false;
    }
  }

  // Start bidirectional ledger streaming
  async startLedgerStream(userId: string, onEvent: (event: LedgerStreamResponse) => void): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Not connected to ledger service');
    }

    const streamId = `ledger_stream_${userId}`;
    
    // Create Server-Sent Events connection for receiving updates
    const eventSource = new EventSource(`${this.baseUrl}/api/grpc/ledger/stream?userId=${userId}`, {
      withCredentials: true
    });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as LedgerStreamResponse;
        onEvent(data);
      } catch (error) {
        console.error('Error parsing ledger stream event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Ledger stream error:', error);
      this.activeStreams.delete(streamId);
    };

    this.activeStreams.set(streamId, eventSource);
  }

  // Send ledger command
  async sendLedgerCommand(command: LedgerStreamRequest): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Not connected to ledger service');
    }

    const response = await fetch(`${this.baseUrl}/api/grpc/ledger/command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(command)
    });

    if (!response.ok) {
      throw new Error(`Ledger command failed: ${response.statusText}`);
    }
  }

  // Subscribe to account balance updates
  async subscribeToAccount(accountId: string, userId: string, includeTransactions: boolean = true): Promise<void> {
    const command: LedgerStreamRequest = {
      command: {
        subscribeToAccount: {
          accountId,
          userId,
          includeTransactions
        }
      }
    };

    await this.sendLedgerCommand(command);
  }

  // Create transaction with real-time updates
  async createTransaction(transactionRequest: LedgerStreamRequest['command']['createTransaction']): Promise<string> {
    const command: LedgerStreamRequest = {
      command: {
        createTransaction: transactionRequest
      }
    };

    await this.sendLedgerCommand(command);
    
    // Return a temporary transaction ID (real implementation would return actual ID)
    return `txn_${Date.now()}`;
  }

  // Get real-time balance
  async getBalance(accountId: string): Promise<void> {
    const command: LedgerStreamRequest = {
      command: {
        getBalance: {
          accountId
        }
      }
    };

    await this.sendLedgerCommand(command);
  }

  // Reconcile account with real-time results
  async reconcileAccount(accountId: string, expectedBalance: number, currency: string): Promise<void> {
    const command: LedgerStreamRequest = {
      command: {
        reconcileAccount: {
          accountId,
          expectedBalance,
          currency
        }
      }
    };

    await this.sendLedgerCommand(command);
  }

  // Subscribe to transaction updates
  async subscribeToTransactions(userId: string, accountIds?: string[], statusFilter?: string[]): Promise<void> {
    const command: LedgerStreamRequest = {
      command: {
        subscribeToTransactions: {
          userId,
          accountIds,
          statusFilter
        }
      }
    };

    await this.sendLedgerCommand(command);
  }

  // Subscribe to specific account balance updates
  async subscribeToAccountBalance(accountId: string, userId: string): Promise<void> {
    await this.subscribeToAccount(accountId, userId, false);
  }

  // Subscribe to all user transactions
  async subscribeToUserTransactions(userId: string): Promise<void> {
    await this.subscribeToTransactions(userId);
  }

  addEventListener(listener: (event: LedgerStreamResponse) => void): void {
    this.eventListeners.push(listener);
  }

  removeEventListener(listener: (event: LedgerStreamResponse) => void): void {
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

export const grpcLedgerService = new GrpcLedgerService(); 