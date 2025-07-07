// gRPC-Web Client for connecting to the backend services
// This client uses HTTP/1.1 with JSON transcoding to communicate with gRPC services

import { getApiUrl } from './env';

export interface KYCProfile {
  profileId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  location: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  riskScore: number;
  amount: number;
  documents: DocumentStatus[];
  complianceFlags: string[];
  verificationMethod: string;
  processingTime: string;
  lastActivity: string;
  avatar: string;
  submittedAt: string;
  updatedAt: string;
}

export interface DocumentStatus {
  documentType: string;
  status: string;
  verifiedAt?: string;
  errorMessage?: string;
}

export interface RiskAssessment {
  overallScore: number;
  riskLevel: string;
  flags: string[];
  factorScores: Record<string, number>;
}

export interface PolicyEvaluation {
  verdict: string;
  policyVersion: string;
  violatedRules: string[];
  policyContext: Record<string, string>;
}

export interface Payment {
  paymentId: string;
  userId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  currency: string;
  description: string;
  reference: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  chosenRail: string;
  fee: number;
  fxRate: number;
  latency: string;
  amountSaved: number;
  createdAt: string;
  updatedAt: string;
  failureReason?: string;
}

export interface KYCCheck {
  passed: boolean;
  riskLevel: string;
  flags: string[];
}

export interface CreateProfileRequest {
  userId: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  location: string;
  amount: number;
  documents: Record<string, string>;
  avatar: string;
}

export interface CreateProfileResponse {
  profile: KYCProfile;
  riskAssessment: RiskAssessment;
  policyEvaluation: PolicyEvaluation;
  message: string;
}

export interface CreatePaymentRequest {
  userId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  currency: string;
  description: string;
  reference: string;
  forceRail?: boolean;
  preferredRail?: string;
}

export interface CreatePaymentResponse {
  payment: Payment;
  kycCheck: KYCCheck;
  journalEntryId: string;
  message: string;
}

class GrpcWebClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseUrl = getApiUrl();
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  // Set authentication token
  setAuthToken(token: string) {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  // KYC Service Methods
  async createProfile(request: CreateProfileRequest): Promise<CreateProfileResponse> {
    const response = await fetch(`${this.baseUrl}/v1/kyc/profiles`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`KYC Create Profile failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getProfile(profileId: string): Promise<{ profile: KYCProfile; riskAssessment: RiskAssessment }> {
    const response = await fetch(`${this.baseUrl}/v1/kyc/profiles/${profileId}`, {
      method: 'GET',
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`KYC Get Profile failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Payment Service Methods
  async createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    const response = await fetch(`${this.baseUrl}/v1/payments`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Payment Create failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getPayment(paymentId: string): Promise<{ payment: Payment }> {
    const response = await fetch(`${this.baseUrl}/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Payment Get failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Stream payments using Server-Sent Events
  streamPayments(userId?: string, statusFilter?: string[]): EventSource {
    let url = `${this.baseUrl}/v1/payments/stream`;
    const params = new URLSearchParams();
    
    if (userId) {
      params.append('user_id', userId);
    }
    
    if (statusFilter && statusFilter.length > 0) {
      statusFilter.forEach(status => params.append('status_filter', status));
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return new EventSource(url);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/health`, {
      method: 'GET',
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
export const grpcWebClient = new GrpcWebClient(); 