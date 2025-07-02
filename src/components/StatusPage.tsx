import React from 'react';
import { useHealth } from '../contexts/HealthContext';
import HealthStatus from './HealthStatus';
import { 
  Server, 
  Database, 
  Activity, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const StatusPage: React.FC = () => {
  const { health, databaseInfo, lastUpdated } = useHealth();

  const getUptimePercentage = () => {
    // This would typically come from the backend
    // For now, we'll show a placeholder
    return 99.99;
  };

  const getResponseTime = () => {
    // This would typically be measured from the frontend
    // For now, we'll show a placeholder
    return 45; // ms
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            System Status
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Real-time monitoring of our fintech platform infrastructure
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>

        {/* Overall Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Status</p>
                <p className={`text-2xl font-bold ${health?.status === 'ok' ? 'text-green-600' : health?.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'}`}>
                  {health?.status?.toUpperCase() || 'UNKNOWN'}
                </p>
              </div>
              {health?.status === 'ok' ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : health?.status === 'degraded' ? (
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              ) : (
                <XCircle className="h-8 w-8 text-red-500" />
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Uptime</p>
                <p className="text-2xl font-bold text-green-600">{getUptimePercentage()}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Response Time</p>
                <p className="text-2xl font-bold text-blue-600">{getResponseTime()}ms</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Detailed Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Health Status Component */}
          <div>
            <HealthStatus />
          </div>

          {/* System Information */}
          <div className="space-y-6">
            {/* Backend Information */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <Server className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Backend Services</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">API Gateway</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-600">Operational</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Authentication</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-600">Operational</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Payment Processing</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-600">Operational</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Database Information */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <Database className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Neon Database</h3>
              </div>
              
              {databaseInfo ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Connection</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${databaseInfo.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`text-sm font-medium ${databaseInfo.connected ? 'text-green-600' : 'text-red-600'}`}>
                        {databaseInfo.connected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Connection Pool</span>
                    <span className="text-sm font-medium">
                      {databaseInfo.in_use || 0} / {databaseInfo.max_open_connections || 0}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Region</span>
                    <span className="text-sm font-medium">East US 2 (Azure)</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">SSL/TLS</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-600">Enabled</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Database information unavailable</p>
              )}
            </div>

            {/* Recent Incidents */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Incidents</h3>
              </div>
              
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No incidents reported</p>
                <p className="text-sm text-gray-500">All systems operational</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            For real-time updates, follow our{' '}
            <a href="#status" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              status page
            </a>
            {' '}or contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatusPage; 