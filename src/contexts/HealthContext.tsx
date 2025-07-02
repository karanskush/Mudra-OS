import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, HealthResponse, DatabaseInfo } from '../lib/api';

interface HealthContextType {
  health: HealthResponse | null;
  databaseInfo: DatabaseInfo | null;
  isLoading: boolean;
  error: string | null;
  refreshHealth: () => Promise<void>;
  lastUpdated: Date | null;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
};

interface HealthProviderProps {
  children: React.ReactNode;
  refreshInterval?: number; // in milliseconds
}

export const HealthProvider: React.FC<HealthProviderProps> = ({ 
  children, 
  refreshInterval = 30000 // 30 seconds default
}) => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [databaseInfo, setDatabaseInfo] = useState<DatabaseInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refreshHealth = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const healthData = await apiClient.getHealth();
      const dbInfo = await apiClient.getDatabaseInfo();
      
      setHealth(healthData);
      setDatabaseInfo(dbInfo);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health status');
      console.error('Health check failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial health check
    refreshHealth();

    // Set up periodic health checks
    const interval = setInterval(refreshHealth, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const value: HealthContextType = {
    health,
    databaseInfo,
    isLoading,
    error,
    refreshHealth,
    lastUpdated,
  };

  return (
    <HealthContext.Provider value={value}>
      {children}
    </HealthContext.Provider>
  );
}; 