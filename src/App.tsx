import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { HealthProvider } from './contexts/HealthContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import { HeroParallax } from './components/ui/hero-parallax';
import { ConsistentBackground } from './components/ui/ConsistentBackground';
import Features from './components/Features';
import Gallery from './components/Gallery';
import Analytics from './components/Analytics';
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
import PaymentRails from './components/PaymentRails';
import About from './components/About';
import { getApiUrl } from './lib/env';

// Enhanced fintech-focused products with more relevant imagery
const fintechProducts = [
  {
    title: "Core Ledger",
    link: "/ledger",
    thumbnail: "/images/hero-images/Core Ledger.png",
  },
  {
    title: "Payment Orchestration",
    link: "/payments",
    thumbnail: "/images/hero-images/Payment Orchestration.png",
  },
  {
    title: "Smart Routing Optimiser",
    link: "/routing",
    thumbnail: "/images/hero-images/Smart Routing Optimiser.png",
  },
  {
    title: "KYC & Risk Stub",
    link: "/kyc",
    thumbnail: "/images/hero-images/KYC & Risk Stub.png",
  },
  {
    title: "Automated Reconciliation Engine",
    link: "/reconciliation",
    thumbnail: "/images/hero-images/Automated Reconciliation Engine.png",
  },
  {
    title: "Compliance Report Generator",
    link: "/compliance",
    thumbnail: "/images/hero-images/Compliance Report Generator.png",
  },
  {
    title: "Treasury / FX Mock",
    link: "/treasury",
    thumbnail: "/images/hero-images/Treasury : FX Mock.png",
  },
  {
    title: "Self-Serve Webhooks & SDKs",
    link: "/webhooks",
    thumbnail: "/images/hero-images/Self-Serve Webhooks & SDKs.png",
  },
  {
    title: "Dual API Surface",
    link: "/api",
    thumbnail: "/images/hero-images/Dual API Surface.png",
  },
  {
    title: "Ops Console (HTMX + Tailwind)",
    link: "/ops",
    thumbnail: "/images/hero-images/Ops Console.png",
  },
  {
    title: "Observability",
    link: "/monitoring",
    thumbnail: "/images/hero-images/Observability.png",
  },
  {
    title: "Security Basics",
    link: "/security",
    thumbnail: "/images/hero-images/Security Basics.png",
  },
  {
    title: "One-Command Experience",
    link: "/dev-tools",
    thumbnail: "/images/hero-images/One-Command Experience.png",
  },
  {
    title: "Clean Code & Docs",
    link: "/analytics",
    thumbnail: "/images/hero-images/Clean Code & Docs.png",
  },
];

// Home page component
const HomePage: React.FC = () => (
  <>
    <HeroParallax products={fintechProducts} />
    <Features />
    <Gallery />
    <Analytics />
  </>
);

// Layout component that includes Navbar and Footer
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConsistentBackground>
    <div className="relative">
      <div className="relative z-10">
        <Navbar />
        <main className="pt-20">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  </ConsistentBackground>
);

// Layout without Footer for Landing Page
const LandingLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConsistentBackground>
    <Navbar />
    <main className="pt-20">
      {children}
    </main>
  </ConsistentBackground>
);

function App() {
  const location = useLocation();

  useEffect(() => {
    console.log('Route changed to:', location.pathname);
    // Debug: Log the API URL being used
    console.log('🔧 Environment Debug:');
    console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
    console.log('getApiUrl():', getApiUrl());
    console.log('NODE_ENV:', import.meta.env.NODE_ENV);
    console.log('MODE:', import.meta.env.MODE);
  }, [location.pathname]);

  return (
    <ThemeProvider>
      <AuthProvider>
        <HealthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<Layout><HomePage /></Layout>} />
              <Route path="/landing" element={<LandingLayout><LandingPage /></LandingLayout>} />
              <Route path="/status" element={<ProtectedRoute><Layout><StatusPage /></Layout></ProtectedRoute>} />
              <Route path="/ledger" element={<ProtectedRoute><Layout><LedgerTest /></Layout></ProtectedRoute>} />
              <Route path="/kyc" element={<ProtectedRoute><Layout><KYCFlow /></Layout></ProtectedRoute>} />
              <Route path="/kyc/dashboard" element={<ProtectedRoute><Layout><KYCDashboard /></Layout></ProtectedRoute>} />
              <Route path="/developers" element={<Layout><Developers /></Layout>} />
              <Route path="/developers/api-explorer" element={<Layout><APIExplorer /></Layout>} />
              <Route path="/grpc-demo" element={<Layout><GRPCDemo /></Layout>} />
              <Route path="/grpc-test" element={<Layout><GRPCTest /></Layout>} />
              <Route path="/router-test" element={<Layout><RouterTest /></Layout>} />
              <Route path="/payments" element={<ProtectedRoute><RealTimePayments /></ProtectedRoute>} />
              <Route path="/payment-rails" element={<ProtectedRoute><Layout><PaymentRails /></Layout></ProtectedRoute>} />
              <Route path="/about" element={<Layout><About /></Layout>} />
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