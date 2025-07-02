import React from 'react';
import { Database, Zap, Shield, TrendingUp, Globe, Code, Users, BarChart3, Lock, Cpu, Webhook, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const features = [
  {
    icon: Database,
    title: 'Core Ledger System',
    description: 'Double-entry, multi-currency accounts with idempotent journal posting and point-in-time balance queries.',
    category: 'Foundation',
    color: 'blue',
    action: 'ledger',
  },
  {
    icon: Zap,
    title: 'Payment Orchestration',
    description: 'Full funds-flow API with UPI, SEPA, and Crypto rails. Asynchronous status lifecycle with real-time updates.',
    category: 'Payments',
    color: 'purple',
  },
  {
    icon: TrendingUp,
    title: 'Smart Routing Optimizer',
    description: 'Intelligent cost and SLA analysis. Chooses optimal rails and tracks savings per transaction.',
    category: 'Optimization',
    color: 'green',
  },
  {
    icon: Shield,
    title: 'KYC & Risk Engine',
    description: 'Automated compliance with synthetic profiles and hot-reload policy rules via JSONLogic.',
    category: 'Compliance',
    color: 'red',
    action: 'kyc',
  },
  {
    icon: BarChart3,
    title: 'Reconciliation Engine',
    description: 'Automated nightly jobs import settlement CSVs, compare against ledger, and flag variances.',
    category: 'Operations',
    color: 'orange',
  },
  {
    icon: Globe,
    title: 'Treasury & FX',
    description: 'Daily rate imports with configurable spreads. Books FX margins into revenue accounts.',
    category: 'Treasury',
    color: 'cyan',
  },
  {
    icon: Webhook,
    title: 'Self-Serve APIs',
    description: 'HMAC-signed webhooks with retry logic. Auto-generated SDKs for Go and TypeScript.',
    category: 'Integration',
    color: 'indigo',
  },
  {
    icon: Code,
    title: 'Dual API Surface',
    description: 'gRPC with Protobuf and REST mirror. Streaming endpoints for real-time payment events.',
    category: 'Developer Experience',
    color: 'pink',
  },
  {
    icon: Eye,
    title: 'Ops Console',
    description: 'HTMX-powered dashboard with live payment tables, SSE updates, and comprehensive analytics.',
    category: 'Operations',
    color: 'teal',
  },
  {
    icon: Lock,
    title: 'Security & Observability',
    description: 'Rate limiting, CSRF protection, structured logging, and Prometheus metrics integration.',
    category: 'Security',
    color: 'gray',
  },
  {
    icon: Users,
    title: 'Compliance Reporting',
    description: 'One-click SAR/CTR generation and GST reports. PDF/CSV exports for regulatory requirements.',
    category: 'Compliance',
    color: 'violet',
  },
  {
    icon: Cpu,
    title: 'One-Command Setup',
    description: 'Complete environment with make run. Includes SQLite migration, seed data, and browser launch.',
    category: 'Developer Experience',
    color: 'emerald',
  },
];

const categoryColors = {
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-purple-600',
  green: 'from-green-500 to-green-600',
  red: 'from-red-500 to-red-600',
  orange: 'from-orange-500 to-orange-600',
  cyan: 'from-cyan-500 to-cyan-600',
  indigo: 'from-indigo-500 to-indigo-600',
  pink: 'from-pink-500 to-pink-600',
  teal: 'from-teal-500 to-teal-600',
  gray: 'from-gray-500 to-gray-600',
  violet: 'from-violet-500 to-violet-600',
  emerald: 'from-emerald-500 to-emerald-600',
};

const Features: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleFeatureClick = (feature: any) => {
    if (feature.action === 'ledger') {
      navigate('/ledger');
    } else if (feature.action === 'kyc') {
      navigate('/kyc');
    }
  };

  return (
    <section id="features" className={`py-24 transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-b from-slate-900 to-slate-800' 
        : 'bg-gradient-to-b from-gray-50 to-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 text-sm font-medium ${
            isDark 
              ? 'bg-blue-900/50 text-blue-300 border border-blue-700/50' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            <Database className="h-4 w-4" />
            Complete Feature Matrix
          </div>
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Ultra-Lean Fintech OS
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Production-Ready Components
            </span>
          </h2>
          <p className={`text-lg max-w-3xl mx-auto ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            A comprehensive fintech platform demonstrating enterprise-grade capabilities. 
            From core ledger systems to compliance automation—everything you need to build modern financial applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              onClick={() => handleFeatureClick(feature)}
              className={`group relative p-8 rounded-2xl border transition-all duration-500 hover:-translate-y-2 overflow-hidden ${
                isDark 
                  ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:shadow-2xl hover:shadow-blue-500/10' 
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-2xl hover:shadow-gray-100'
              } ${feature.action ? 'cursor-pointer' : ''}`}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${categoryColors[feature.color as keyof typeof categoryColors]} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              {/* Category Badge */}
              <div className="absolute top-4 right-4">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  isDark 
                    ? 'text-gray-400 bg-slate-700/50' 
                    : 'text-gray-500 bg-gray-100'
                }`}>
                  {feature.category}
                </span>
              </div>

              <div className="relative z-10">
                <div className="mb-6">
                  <div className={`w-14 h-14 bg-gradient-to-br ${categoryColors[feature.color as keyof typeof categoryColors]} rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                </div>
                
                <h3 className={`text-xl font-bold mb-4 group-hover:text-gray-700 transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                
                <p className={`leading-relaxed text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>

                {/* Action indicator for clickable features */}
                {feature.action && (
                  <div className="mt-4 flex items-center text-sm text-blue-600 dark:text-blue-400">
                    <span className="mr-2">Click to test</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}

                {/* Hover Effect Line */}
                <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${categoryColors[feature.color as keyof typeof categoryColors]} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to explore the complete platform?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Experience all 14 domains in action with our interactive demo. See how enterprise fintech is built.
            </p>
            <button 
              onClick={() => navigate('/ledger')}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Launch Interactive Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;