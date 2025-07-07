// gRPC KYC Service for Real-time Document Verification and Compliance
// Handles document upload, verification status, and risk assessment updates

import { getApiUrl } from './env';

export interface KYCStreamRequest {
  command: {
    startVerification?: {
      userId: string;
      country: string;
      name: string;
      email: string;
      phone: string;
      amount: number;
    };
    uploadDocument?: {
      userId: string;
      documentType: string;
      documentData: string; // base64 encoded
      fileName: string;
    };
    verifyDocument?: {
      userId: string;
      documentType: string;
      documentNumber?: string;
    };
    subscribeToVerification?: {
      userId: string;
      includeRiskUpdates?: boolean;
    };
    updateRiskProfile?: {
      userId: string;
      riskFactors: Record<string, number>;
    };
  };
}

export interface KYCStreamResponse {
  event: {
    verificationStarted?: {
      verificationId: string;
      userId: string;
      country: string;
      requiredDocuments: string[];
      estimatedTime: string;
      startedAt: string;
    };
    documentUploaded?: {
      verificationId: string;
      documentType: string;
      documentId: string;
      status: 'UPLOADED' | 'PROCESSING' | 'VERIFIED' | 'REJECTED';
      uploadedAt: string;
      processingTime?: string;
    };
    documentVerified?: {
      verificationId: string;
      documentType: string;
      documentId: string;
      status: 'VERIFIED' | 'REJECTED';
      confidence: number;
      extractedData?: Record<string, any>;
      verifiedAt: string;
      issues?: string[];
    };
    riskAssessmentUpdate?: {
      verificationId: string;
      riskScore: number;
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      riskFactors: Record<string, number>;
      flags: string[];
      updatedAt: string;
    };
    verificationCompleted?: {
      verificationId: string;
      status: 'VERIFIED' | 'REJECTED' | 'REQUIRES_REVIEW';
      finalRiskScore: number;
      completedAt: string;
      nextSteps?: string[];
    };
    complianceAlert?: {
      verificationId: string;
      alertType: 'SANCTIONS' | 'PEP' | 'ADVERSE_MEDIA' | 'WATCHLIST';
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      message: string;
      requiresAction: boolean;
      alertedAt: string;
    };
  };
}

class GrpcKYCService {
  private baseUrl: string;
  private isConnected = false;
  private eventListeners: Array<(event: KYCStreamResponse) => void> = [];
  private activeStreams: Map<string, EventSource> = new Map();

  constructor() {
    this.baseUrl = getApiUrl();
  }

  async connect(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grpc/kyc/health`, {
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
      console.error('Failed to connect to KYC service:', error);
      return false;
    }
  }

  // Start bidirectional KYC streaming
  async startKYCStream(userId: string, onEvent: (event: KYCStreamResponse) => void): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Not connected to KYC service');
    }

    const streamId = `kyc_stream_${userId}`;
    
    // Create Server-Sent Events connection for receiving updates
    const eventSource = new EventSource(`${this.baseUrl}/api/grpc/kyc/stream?userId=${userId}`, {
      withCredentials: true
    });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as KYCStreamResponse;
        onEvent(data);
      } catch (error) {
        console.error('Error parsing KYC stream event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('KYC stream error:', error);
      this.activeStreams.delete(streamId);
    };

    this.activeStreams.set(streamId, eventSource);
  }

  // Send KYC command
  async sendKYCCommand(command: KYCStreamRequest): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Not connected to KYC service');
    }

    const response = await fetch(`${this.baseUrl}/api/grpc/kyc/command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(command)
    });

    if (!response.ok) {
      throw new Error(`KYC command failed: ${response.statusText}`);
    }
  }

  // Start KYC verification with real-time updates
  async startVerification(verificationRequest: KYCStreamRequest['command']['startVerification']): Promise<string> {
    const command: KYCStreamRequest = {
      command: {
        startVerification: verificationRequest
      }
    };

    await this.sendKYCCommand(command);
    
    // Return a temporary verification ID (real implementation would return actual ID)
    return `kyc_${Date.now()}`;
  }

  // Upload document with real-time processing updates
  async uploadDocument(documentRequest: KYCStreamRequest['command']['uploadDocument']): Promise<void> {
    const command: KYCStreamRequest = {
      command: {
        uploadDocument: documentRequest
      }
    };

    await this.sendKYCCommand(command);
  }

  // Verify document with real-time validation
  async verifyDocument(verificationRequest: KYCStreamRequest['command']['verifyDocument']): Promise<void> {
    const command: KYCStreamRequest = {
      command: {
        verifyDocument: verificationRequest
      }
    };

    await this.sendKYCCommand(command);
  }

  // Subscribe to KYC verification updates
  async subscribeToVerification(userId: string, includeRiskUpdates: boolean = true): Promise<void> {
    const command: KYCStreamRequest = {
      command: {
        subscribeToVerification: {
          userId,
          includeRiskUpdates
        }
      }
    };

    await this.sendKYCCommand(command);
  }

  // Convert file to base64 for upload
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove data URL prefix (data:image/jpeg;base64,)
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  }

  addEventListener(listener: (event: KYCStreamResponse) => void): void {
    this.eventListeners.push(listener);
  }

  removeEventListener(listener: (event: KYCStreamResponse) => void): void {
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

export const grpcKYCService = new GrpcKYCService(); 