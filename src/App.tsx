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

// Enhanced fintech-focused products with more relevant imagery
const fintechProducts = [
  {
    title: "Core Ledger",
    link: "/ledger",
    thumbnail: "https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "Payment Orchestration",
    link: "/payments",
    thumbnail: "https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "Smart Routing Optimiser",
    link: "/routing",
    thumbnail: "https://images.pexels.com/photos/8728380/pexels-photo-8728380.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "KYC & Risk Stub",
    link: "/kyc",
    thumbnail: "https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "Automated Reconciliation Engine",
    link: "/reconciliation",
    thumbnail: "https://images.pexels.com/photos/6802042/pexels-photo-6802042.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "Compliance Report Generator",
    link: "/compliance",
    thumbnail: "https://images.pexels.com/photos/6801874/pexels-photo-6801874.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "Treasury / FX Mock",
    link: "/treasury",
    thumbnail: "https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "Self-Serve Webhooks & SDKs",
    link: "/webhooks",
    thumbnail: "https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "Dual API Surface",
    link: "/api",
    thumbnail: "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "Ops Console (HTMX + Tailwind)",
    link: "/ops",
    thumbnail: "https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "Observability",
    link: "/monitoring",
    thumbnail: "https://images.pexels.com/photos/6802049/pexels-photo-6802049.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "Security Basics",
    link: "/security",
    thumbnail: "https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "One-Command Experience",
    link: "/dev-tools",
    thumbnail: "https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "Clean Code & Docs",
    link: "/analytics",
    thumbnail: "https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800",
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
  <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
    <Navbar />
    <main className="pt-20">
      {children}
    </main>
    <Footer />
  </div>
);

// Layout without Footer for Landing Page
const LandingLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
    <Navbar />
    <main className="pt-20">
      {children}
    </main>
  </div>
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