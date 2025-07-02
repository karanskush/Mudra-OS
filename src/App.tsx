import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { HealthProvider } from './contexts/HealthContext';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import { HeroParallax } from './components/ui/hero-parallax';
import Features from './components/Features';
import Gallery from './components/Gallery';
import Analytics from './components/Analytics';
import Footer from './components/Footer';
import StatusPage from './components/StatusPage';
import LedgerTest from './components/LedgerTest';
import LandingPage from './components/LandingPage';

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
    <main>
      {children}
    </main>
    <Footer />
  </div>
);

// Layout without Footer for Landing Page
const LandingLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
    <Navbar />
    <main>
      {children}
    </main>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HealthProvider>
          <Routes>
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/landing" element={<LandingLayout><LandingPage /></LandingLayout>} />
            <Route path="/status" element={<Layout><StatusPage /></Layout>} />
            <Route path="/ledger" element={<Layout><LedgerTest /></Layout>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HealthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;