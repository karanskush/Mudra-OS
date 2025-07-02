// KYC API client for frontend  
export interface Country {
  country: string;
  documents: string[];
  description: string;
  flag?: string;
  countryCode?: string;
}

export interface DocumentStatus {
  status: string;
  verifiedAt?: string;
  error?: string;
}

export interface KYCStatus {
  user_id: string;
  country: string;
  status: string;
  progress: number;
  documents: Record<string, DocumentStatus>;
  next_steps: string[];
  updated_at: string;
}

export interface DocumentVerificationRequest {
  document_number: string;
  user_id: string;
  country: string;
}

export interface DocumentVerificationResponse {
  status: string;
  valid: boolean;
  details?: any;
  timestamp: string;
}

export interface KYCStartRequest {
  user_id: string;
  country: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  amount?: number;
  avatar?: string;
}

const BASE_URL = '/api/kyc';

export class KYCApi {
  // Fetch available countries and their requirements
  static async getCountries(searchQuery?: string): Promise<Country[]> {
    try {
      const url = searchQuery 
        ? `${BASE_URL}/countries?search=${encodeURIComponent(searchQuery)}`
        : `${BASE_URL}/countries`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch countries');
      }
      
      return data.countries;
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw error;
    }
  }

  // Start KYC process for a user
  static async startKYC(request: KYCStartRequest): Promise<KYCStatus> {
    try {
      const response = await fetch(`${BASE_URL}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start KYC process');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error starting KYC:', error);
      throw error;
    }
  }

  // Verify a document
  static async verifyDocument(
    documentType: string,
    request: DocumentVerificationRequest
  ): Promise<DocumentVerificationResponse> {
    try {
      const response = await fetch(`${BASE_URL}/verify/${documentType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify document');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error verifying document:', error);
      throw error;
    }
  }

  // Get KYC status for a user
  static async getKYCStatus(userId: string): Promise<KYCStatus> {
    try {
      const response = await fetch(`${BASE_URL}/status/${userId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch KYC status');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching KYC status:', error);
      throw error;
    }
  }

  // Check if KYC service is running
  static async healthCheck(): Promise<{ success: boolean; message: string; version: string }> {
    try {
      const response = await fetch(`${BASE_URL}/`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'KYC service health check failed');
      }
      
      return data;
    } catch (error) {
      console.error('Error checking KYC service health:', error);
      throw error;
    }
  }

  // Upload document file (for future implementation)
  static async uploadDocument(
    userId: string,
    documentType: string,
    file: File
  ): Promise<{ success: boolean; fileId: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', userId);
      formData.append('document_type', documentType);

      const response = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload document');
      }
      
      return data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  // Verify document through Didit API
  static async verifyDocumentWithDidit(
    userId: string,
    documentType: string,
    file: File,
    countryCode: string,
    faceImage?: File
  ): Promise<any> {
    try {
      // Convert file to base64
      const documentImage = await this.convertFileToBase64(file);
      const faceImageB64 = faceImage ? await this.convertFileToBase64(faceImage) : undefined;

      const response = await fetch(`${BASE_URL}/verify/didit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_image: documentImage,
          document_type: documentType,
          country_code: countryCode,
          user_id: userId,
          face_image: faceImageB64,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify document');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error verifying document with Didit:', error);
      throw error;
    }
  }

  // Helper to convert file to base64
  private static convertFileToBase64(file: File): Promise<string> {
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
  }

  // Validate Aadhaar number format
  static validateAadhaarNumber(aadhaarNumber: string): boolean {
    // Remove spaces and check if it's exactly 12 digits
    const cleaned = aadhaarNumber.replace(/\s/g, '');
    const aadhaarRegex = /^\d{12}$/;
    return aadhaarRegex.test(cleaned);
  }

  // Validate PAN number format
  static validatePANNumber(panNumber: string): boolean {
    // PAN format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(panNumber.toUpperCase());
  }

  // Format Aadhaar number with spaces for display
  static formatAadhaarNumber(aadhaarNumber: string): string {
    const cleaned = aadhaarNumber.replace(/\s/g, '');
    if (cleaned.length <= 4) return cleaned;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8)}`;
  }

  // Get risk level based on score
  static getRiskLevel(riskScore: number): { level: string; color: string; description: string } {
    if (riskScore < 30) {
      return {
        level: 'Low',
        color: 'text-green-400',
        description: 'Low risk customer with standard verification requirements'
      };
    }
    if (riskScore < 60) {
      return {
        level: 'Medium',
        color: 'text-yellow-400',
        description: 'Medium risk customer requiring additional verification'
      };
    }
    return {
      level: 'High',
      color: 'text-red-400',
      description: 'High risk customer requiring enhanced due diligence'
    };
  }

  // Dashboard API Methods

  // Get all KYC submissions for dashboard
  static async getDashboardSubmissions(filters?: {
    status?: string;
    search?: string;
    country?: string;
    priority?: string;
  }): Promise<KYCSubmission[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.country) queryParams.append('country', filters.country);
      if (filters?.priority) queryParams.append('priority', filters.priority);

      const response = await fetch(`${BASE_URL}/dashboard?${queryParams.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch dashboard submissions');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching dashboard submissions:', error);
      throw error;
    }
  }

  // Get dashboard statistics
  static async getDashboardStats(): Promise<KYCStats> {
    try {
      const response = await fetch(`${BASE_URL}/dashboard/stats`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch dashboard stats');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Update submission status
  static async updateSubmissionStatus(
    submissionId: string,
    status: string,
    notes?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${BASE_URL}/submissions/${submissionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update submission status');
      }
      
      return data;
    } catch (error) {
      console.error('Error updating submission status:', error);
      throw error;
    }
  }

  // Bulk update submission statuses
  static async bulkUpdateStatus(
    submissionIds: string[],
    status: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${BASE_URL}/submissions/bulk-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: submissionIds, status }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to bulk update submissions');
      }
      
      return data;
    } catch (error) {
      console.error('Error bulk updating submissions:', error);
      throw error;
    }
  }
}

// Dashboard-specific interfaces
export interface KYCSubmission {
  id: string;
  user_id: string;
  name: string;
  country: string;
  email: string;
  phone?: string;
  status: 'pending' | 'verified' | 'rejected' | 'under_review';
  submitted_at: string;
  verified_at?: string;
  risk_score: number;
  notes?: string;
  avatar?: string;
  location?: string;
  amount?: number;
  priority?: 'high' | 'medium' | 'low';
  processing_time: string;
  last_activity: string;
  verification_method: string;
  compliance_flags: string[];
  review_notes?: string;
  created_at: string;
  updated_at: string;
  documents: KYCDocument[];
}

export interface KYCDocument {
  id: string;
  kyc_submission_id: string;
  type: string;
  status: string;
  document_number?: string;
  uploaded_at: string;
  verified_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface KYCStats {
  total_submissions: number;
  verified: number;
  pending: number;
  rejected: number;
  average_processing_time: string;
  success_rate: number;
  monthly_growth: number;
}

export default KYCApi; 