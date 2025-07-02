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

class ApiClient {
  private baseUrl: string;

  constructor() {
    // Use environment variable or default to localhost
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
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
}

export const apiClient = new ApiClient(); 