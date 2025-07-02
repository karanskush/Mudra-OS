// Didit API client for ID verification
// Based on https://docs.didit.me/reference/id-verification-core-technology

export interface DiditSessionRequest {
  workflow_id?: string;
  user_id: string;
  country?: string;
  document_types?: string[];
  redirect_url?: string;
  webhook_url?: string;
  metadata?: Record<string, any>;
}

export interface DiditSessionResponse {
  session_id: string;
  verification_url: string;
  status: 'created' | 'pending' | 'completed' | 'failed';
  created_at: string;
  expires_at: string;
}

export interface DiditVerificationResult {
  session_id: string;
  status: 'pending' | 'verified' | 'rejected' | 'processing';
  user_id: string;
  country: string;
  document_verification: {
    document_type: string;
    status: 'verified' | 'rejected' | 'pending';
    extracted_data: {
      full_name?: string;
      date_of_birth?: string;
      document_number?: string;
      issue_date?: string;
      expiry_date?: string;
      nationality?: string;
    };
    verification_checks: {
      document_authenticity: boolean;
      data_consistency: boolean;
      image_quality: boolean;
      document_liveness: boolean;
    };
  };
  face_verification?: {
    status: 'verified' | 'rejected' | 'pending';
    confidence_score: number;
  };
  risk_assessment: {
    overall_score: number;
    risk_level: 'low' | 'medium' | 'high';
    flags: string[];
  };
  created_at: string;
  completed_at?: string;
}

export interface DiditStandaloneRequest {
  document_image: string; // Base64 encoded image
  document_type: 'passport' | 'id_card' | 'driver_license' | 'residence_permit';
  country_code: string;
  face_image?: string; // Base64 encoded for face match
}

export interface DiditStandaloneResponse {
  verification_id: string;
  status: 'verified' | 'rejected' | 'processing';
  document_verification: DiditVerificationResult['document_verification'];
  face_verification?: DiditVerificationResult['face_verification'];
  risk_assessment: DiditVerificationResult['risk_assessment'];
  processing_time_ms: number;
}

class DiditApiClient {
  private apiKey: string;
  private baseUrl: string;
  private version: string;

  constructor(apiKey: string, environment: 'sandbox' | 'production' = 'sandbox') {
    this.apiKey = apiKey;
    this.version = 'v2.0';
    this.baseUrl = environment === 'production' 
      ? 'https://api.didit.me' 
      : 'https://api-sandbox.didit.me';
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}/${this.version}${endpoint}`;
    
    const defaultHeaders = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Didit API error: ${response.status} - ${errorData.message || response.statusText}`);
    }

    return await response.json();
  }

  // Create a new verification session
  async createVerificationSession(request: DiditSessionRequest): Promise<DiditSessionResponse> {
    return await this.makeRequest('/verification/sessions', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Retrieve session details
  async getVerificationSession(sessionId: string): Promise<DiditVerificationResult> {
    return await this.makeRequest(`/verification/sessions/${sessionId}`);
  }

  // List sessions for a user
  async listUserSessions(userId: string, limit: number = 20): Promise<DiditVerificationResult[]> {
    const response = await this.makeRequest(`/verification/sessions?user_id=${userId}&limit=${limit}`);
    return response.sessions || [];
  }

  // Delete a session
  async deleteSession(sessionId: string): Promise<{ success: boolean }> {
    await this.makeRequest(`/verification/sessions/${sessionId}`, {
      method: 'DELETE',
    });
    return { success: true };
  }

  // Generate PDF report
  async generatePDFReport(sessionId: string): Promise<{ pdf_url: string }> {
    return await this.makeRequest(`/verification/sessions/${sessionId}/pdf`);
  }

  // Standalone ID Verification
  async verifyDocument(request: DiditStandaloneRequest): Promise<DiditStandaloneResponse> {
    return await this.makeRequest('/verification/id', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Face Match 1:1
  async faceMatch(
    referenceImage: string, 
    verificationImage: string
  ): Promise<{
    verification_id: string;
    match: boolean;
    confidence_score: number;
    risk_assessment: DiditVerificationResult['risk_assessment'];
  }> {
    return await this.makeRequest('/verification/face-match', {
      method: 'POST',
      body: JSON.stringify({
        reference_image: referenceImage,
        verification_image: verificationImage,
      }),
    });
  }

  // Age Estimation
  async estimateAge(faceImage: string): Promise<{
    verification_id: string;
    estimated_age: number;
    age_range: {
      min: number;
      max: number;
    };
    confidence_score: number;
  }> {
    return await this.makeRequest('/verification/age-estimation', {
      method: 'POST',
      body: JSON.stringify({
        face_image: faceImage,
      }),
    });
  }

  // AML Screening
  async amlScreening(
    fullName: string,
    dateOfBirth?: string,
    nationality?: string
  ): Promise<{
    verification_id: string;
    match_found: boolean;
    risk_level: 'low' | 'medium' | 'high';
    matches: Array<{
      name: string;
      type: string;
      confidence_score: number;
      details: Record<string, any>;
    }>;
  }> {
    return await this.makeRequest('/verification/aml', {
      method: 'POST',
      body: JSON.stringify({
        full_name: fullName,
        date_of_birth: dateOfBirth,
        nationality: nationality,
      }),
    });
  }

  // Health check
  async healthCheck(): Promise<{ 
    status: string; 
    version: string; 
    timestamp: string 
  }> {
    return await this.makeRequest('/health');
  }
}

// Utility functions
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix to get pure base64
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }

  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }

  // Check supported formats
  const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!supportedFormats.includes(file.type)) {
    return { valid: false, error: 'File must be JPG, JPEG, or PNG format' };
  }

  return { valid: true };
};

import { getDiditConfig } from './env';

// Create singleton instance with safe environment variable access
const diditConfig = getDiditConfig();
export const diditApi = new DiditApiClient(
  diditConfig.apiKey,
  diditConfig.environment
);

export default DiditApiClient; 