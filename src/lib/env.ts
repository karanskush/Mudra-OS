// Environment variable utility for cross-platform compatibility
// Supports both Vite and Create React App

/**
 * Safely access environment variables in the browser
 * Works with both Vite (VITE_*) and Create React App (REACT_APP_*)
 */
export const getEnvVar = (key: string, defaultValue: string = ''): string => {
  // For Vite-based React apps (import.meta.env)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || defaultValue;
  }
  
  // For Create React App (process.env in bundled code)
  if (typeof window !== 'undefined' && (window as any).__ENV__) {
    return (window as any).__ENV__[key] || defaultValue;
  }
  
  // Fallback for development/testing
  return defaultValue;
};

/**
 * Get Didit API configuration from environment
 */
export const getDiditConfig = (): {
  apiKey: string;
  environment: 'sandbox' | 'production';
  baseUrl: string;
} => {
  const apiKey = getEnvVar('VITE_DIDIT_API_KEY') || getEnvVar('REACT_APP_DIDIT_API_KEY') || 'demo-api-key';
  const environment = getEnvVar('VITE_DIDIT_ENVIRONMENT') || getEnvVar('REACT_APP_DIDIT_ENVIRONMENT') || 'sandbox';
  const mode = getEnvVar('VITE_MODE') || getEnvVar('NODE_ENV') || 'development';
  
  return {
    apiKey,
    environment: (mode === 'production' ? 'production' : 'sandbox') as 'sandbox' | 'production',
    baseUrl: mode === 'production' ? 'https://api.didit.me' : 'https://api-sandbox.didit.me'
  };
};

/**
 * Get API base URL from environment
 */
export const getApiUrl = (): string => {
  return getEnvVar('VITE_API_URL') || getEnvVar('REACT_APP_API_URL') || 'http://localhost:8080';
};

/**
 * Check if we're in development mode
 */
export const isDevelopment = (): boolean => {
  const mode = getEnvVar('VITE_MODE') || getEnvVar('NODE_ENV') || 'development';
  return mode === 'development';
};

/**
 * Check if we're in production mode
 */
export const isProduction = (): boolean => {
  const mode = getEnvVar('VITE_MODE') || getEnvVar('NODE_ENV') || 'development';
  return mode === 'production';
}; 