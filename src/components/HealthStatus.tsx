import React from 'react';
import { useHealth } from '../contexts/HealthContext';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Database, 
  Activity,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';

const HealthStatus: React.FC = () => {
  const { health, databaseInfo, isLoading, error, refreshHealth, lastUpdated } = useHealth();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'text-green-500';
      case 'degraded':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString();
  };

  const getConnectionUtilization = () => {
    if (!databaseInfo?.max_open_connections || !databaseInfo?.in_use) {
      return 0;
    }
    return Math.round((databaseInfo.in_use / databaseInfo.max_open_connections) * 100);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Health Status
        </h3>
        <button
          onClick={refreshHealth}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Checking health status...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700 dark:text-red-400">Error: {error}</span>
          </div>
        </div>
      )}

      {health && (
        <>
          {/* Overall Status */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(health.status)}
                <div>
                  <h4 className={`font-medium ${getStatusColor(health.status)}`}>
                    Backend Status: {health.status.toUpperCase()}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {health.message}
                  </p>
                </div>
              </div>
              {lastUpdated && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {formatTime(lastUpdated)}
                </div>
              )}
            </div>
          </div>

          {/* Database Status */}
          {databaseInfo && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-500" />
                <h5 className="font-medium text-gray-900 dark:text-white">Neon Database</h5>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Connection Status */}
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {databaseInfo.connected ? (
                      <Wifi className="h-4 w-4 text-green-500" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium">Connection</span>
                  </div>
                  <p className={`text-sm ${databaseInfo.connected ? 'text-green-600' : 'text-red-600'}`}>
                    {databaseInfo.connected ? 'Connected' : 'Disconnected'}
                  </p>
                  {databaseInfo.error && (
                    <p className="text-xs text-red-500 mt-1">{databaseInfo.error}</p>
                  )}
                </div>

                {/* Connection Pool */}
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                  <h6 className="text-sm font-medium mb-2">Connection Pool</h6>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">In Use:</span>
                      <span className="font-medium">{databaseInfo.in_use || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Idle:</span>
                      <span className="font-medium">{databaseInfo.idle || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Max:</span>
                      <span className="font-medium">{databaseInfo.max_open_connections || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Utilization Bar */}
              {databaseInfo.max_open_connections && databaseInfo.in_use && (
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Pool Utilization</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {getConnectionUtilization()}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        getConnectionUtilization() > 80 ? 'bg-red-500' :
                        getConnectionUtilization() > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${getConnectionUtilization()}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HealthStatus; 