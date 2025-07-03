// API client for backend communication

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  message: string;
  time: string;
  timestamp: number;
  database?: {
    connected: boolean;
    max_open_connections?: number;
    open_connections?: number;
    in_use?: number;
    idle?: number;
    error?: string;
  };
}

export interface DatabaseInfo {
  connected: boolean;
  max_open_connections?: number;
  open_connections?: number;
  in_use?: number;
  idle?: number;
  error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    // Use environment variable or default to localhost
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  }

  // Get authentication token from localStorage
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Create default headers with optional authentication
  private getHeaders(includeAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Generic authenticated API call method
  async authenticatedRequest<T = any>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getAuthToken();
    
    // Debug: Log the request details
    console.log('[API] authenticatedRequest:', { url, options });
    
    // Check if token exists before making request
    if (!token) {
      console.error('[API] No auth token found');
      throw new Error('Authentication required. Please login first.');
    }
    
    const headers = this.getHeaders(true);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized - token might be expired
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          console.error('[API] 401 Unauthorized');
          throw new Error('Authentication required. Please login again.');
        }
        // Try to get error message from response
        try {
          const errorData = await response.json();
          console.error('[API] Error response:', errorData);
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        } catch (err) {
          console.error('[API] Error parsing error response:', err);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();
      console.log('[API] Response data:', data);
      return data;
    } catch (error) {
      console.error('[API] Fetch error:', error);
      throw error;
    }
  }

  // Generic public API call method
  async publicRequest<T = any>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders(false);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async getHealth(): Promise<HealthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'error',
        message: 'Unable to connect to backend',
        time: new Date().toISOString(),
        timestamp: Date.now(),
        database: {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  async getDatabaseInfo(): Promise<DatabaseInfo | null> {
    try {
      const health = await this.getHealth();
      return health.database || null;
    } catch (error) {
      console.error('Failed to get database info:', error);
      return null;
    }
  }

  // Test database connection
  async testConnection(): Promise<boolean> {
    try {
      const health = await this.getHealth();
      return health.status === 'ok' && health.database?.connected === true;
    } catch (error) {
      return false;
    }
  }

  // Get connection pool statistics
  async getConnectionStats() {
    const dbInfo = await this.getDatabaseInfo();
    if (!dbInfo) {
      return null;
    }

    return {
      maxConnections: dbInfo.max_open_connections || 0,
      openConnections: dbInfo.open_connections || 0,
      inUse: dbInfo.in_use || 0,
      idle: dbInfo.idle || 0,
      utilization: dbInfo.max_open_connections && dbInfo.in_use
        ? Math.round((dbInfo.in_use / dbInfo.max_open_connections) * 100)
        : 0
    };
  }

  // Account management methods
  async getAccounts(): Promise<ApiResponse> {
    return this.authenticatedRequest('/api/v1/accounts/');
  }

  async createAccount(accountData: any): Promise<ApiResponse> {
    return this.authenticatedRequest('/api/v1/accounts/', {
      method: 'POST',
      body: JSON.stringify(accountData),
    });
  }

  async getAccount(accountId: string): Promise<ApiResponse> {
    return this.authenticatedRequest(`/api/v1/accounts/${accountId}`);
  }

  // User profile methods
  async getUserProfile(): Promise<ApiResponse> {
    return this.authenticatedRequest('/api/v1/users/profile');
  }

  async updateUserProfile(profileData: any): Promise<ApiResponse> {
    return this.authenticatedRequest('/api/v1/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Ledger methods
  async getLedgerAccounts(): Promise<ApiResponse> {
    return this.authenticatedRequest('/api/ledger/accounts');
  }

  async createLedgerAccount(accountData: any): Promise<ApiResponse> {
    return this.authenticatedRequest('/api/ledger/accounts', {
      method: 'POST',
      body: JSON.stringify(accountData),
    });
  }

  async getAvailableAccounts(): Promise<ApiResponse> {
    return this.authenticatedRequest('/api/ledger/accounts/available');
  }

  async createTransfer(transferData: any): Promise<ApiResponse> {
    return this.authenticatedRequest('/api/ledger/transactions/transfer', {
      method: 'POST',
      body: JSON.stringify(transferData),
    });
  }

  async createDeposit(depositData: any): Promise<ApiResponse> {
    return this.authenticatedRequest('/api/ledger/transactions/deposit', {
      method: 'POST',
      body: JSON.stringify(depositData),
    });
  }

  async createTestBalance(depositData: any): Promise<ApiResponse> {
    return this.authenticatedRequest('/api/ledger/transactions/test-balance', {
      method: 'POST',
      body: JSON.stringify(depositData),
    });
  }

  async getAccountBalance(accountId: string): Promise<ApiResponse> {
    return this.authenticatedRequest(`/api/ledger/accounts/${accountId}/balance`);
  }

  async getAccountTransactions(accountId: string, limit?: number, offset?: number): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.authenticatedRequest(`/api/ledger/accounts/${accountId}/transactions${queryString}`);
  }

  // Debug helper - generates curl command with proper auth headers
  generateCurlCommand(endpoint: string, options: RequestInit = {}): string {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getAuthToken();
    const method = options.method || 'GET';
    
    let curlCommand = `curl -X ${method} '${url}'`;
    
    // Add headers
    curlCommand += ` \\\n  -H 'Content-Type: application/json'`;
    
    if (token) {
      curlCommand += ` \\\n  -H 'Authorization: Bearer ${token}'`;
    } else {
      curlCommand += ` \\\n  # WARNING: No auth token found! Please login first.`;
    }
    
    // Add body if present
    if (options.body) {
      curlCommand += ` \\\n  --data-raw '${options.body}'`;
    }
    
    return curlCommand;
  }

  // Debug helper - logs curl command to console
  logCurlCommand(endpoint: string, options: RequestInit = {}) {
    const curlCommand = this.generateCurlCommand(endpoint, options);
    console.log('🐛 Debug Curl Command:');
    console.log(curlCommand);
    return curlCommand;
  }
}

export const apiClient = new ApiClient(); 