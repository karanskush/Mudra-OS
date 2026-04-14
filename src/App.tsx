import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { HealthProvider } from './contexts/HealthContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import { ConsistentBackground } from './components/ui/ConsistentBackground';
import Footer from './components/Footer';
import StatusPage from './components/StatusPage';
import LedgerTest from './components/LedgerTest';
import LandingPage from './components/LandingPage';
import KYCFlow from './components/KYCFlow';
import KYCDashboard from './components/KYCDashboard';
import Developers from './components/Developers';
import APIExplorer from './components/Developers/APIExplorer';
import GRPCDemo from './components/GRPCDemo';
import GRPCTest from './components/GRPCTest';
import RouterTest from './components/RouterTest';
import RealTimePayments from './components/RealTimePayments';
import QuickStartPage from './components/Developers/QuickStartPage';


// Layout component that includes Navbar and Footer
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConsistentBackground>
    <Navbar />
    <main className="pt-20">
      {children}
    </main>
    <Footer />
  </ConsistentBackground>
);

function App() {
  const location = useLocation();

  useEffect(() => {
    console.log('Route changed to:', location.pathname);
  }, [location.pathname]);

  return (
    <ThemeProvider>
      <AuthProvider>
        <HealthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/status" element={<ProtectedRoute><Layout><StatusPage /></Layout></ProtectedRoute>} />
              <Route path="/ledger" element={<ProtectedRoute><Layout><LedgerTest /></Layout></ProtectedRoute>} />
              <Route path="/kyc" element={<ProtectedRoute><Layout><KYCFlow /></Layout></ProtectedRoute>} />
              <Route path="/kyc/dashboard" element={<ProtectedRoute><Layout><KYCDashboard /></Layout></ProtectedRoute>} />
              <Route path="/developers" element={<Developers />} />
              <Route path="/developers/quickstart" element={<QuickStartPage />} />
              <Route path="/developers/api-explorer" element={<APIExplorer />} />
              <Route path="/grpc-demo" element={<Layout><GRPCDemo /></Layout>} />
              <Route path="/grpc-test" element={<Layout><GRPCTest /></Layout>} />
              <Route path="/router-test" element={<Layout><RouterTest /></Layout>} />
              <Route path="/payments" element={<ProtectedRoute><RealTimePayments /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
          
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: '#1f2937',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
                style: {
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  color: '#065f46',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
                style: {
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#991b1b',
                },
              },
            }}
          />
        </HealthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;