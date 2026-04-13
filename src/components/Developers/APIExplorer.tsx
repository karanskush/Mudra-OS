import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BoltIcon, 
  ShieldCheckIcon, 
  CubeIcon, 
  PlayIcon,
  DocumentTextIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  CodeBracketIcon,
  PlayCircleIcon,
  StopIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  BeakerIcon,
  RocketLaunchIcon,
  CircleStackIcon,
  CogIcon,
  UserIcon,
  IdentificationIcon,
  BanknotesIcon,
  Square3Stack3DIcon
} from '@heroicons/react/24/outline';

// TypeScript interfaces
interface APIEndpoint {
  key: string;
  method: string;
  path: string;
  description: string;
  status: string;
  requestBody: any;
  response: any;
  responseTime?: number;
  complexity?: 'simple' | 'intermediate' | 'advanced';
}

// Enhanced API data with actual implemented REST and gRPC endpoints
const apiCategories = {
  authentication: {
    name: 'Authentication & Users',
    icon: ShieldCheckIcon,
    description: 'Secure user authentication and profile management',
    color: 'from-[#2E6F40] to-[#68BA7F]',
    emoji: '🛡️',
    endpoints: [
      { 
        key: 'register', 
        method: 'POST',
        path: '/api/v1/auth/register',
        description: 'Register a new user account with secure password hashing 🎉',
        status: 'stable',
        complexity: 'simple' as const,
        responseTime: 145,
        requestBody: {
          email: 'user@example.com',
          password: 'securePassword123',
          first_name: 'John',
          last_name: 'Doe',
          phone: '+1234567890',
          date_of_birth: '1990-01-01T00:00:00Z'
        },
        response: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          expires_at: '2024-01-21T10:30:00Z',
          user: {
            id: '12345',
            email: 'user@example.com',
            first_name: 'John',
            last_name: 'Doe',
            role: 'user'
          }
        }
      },
      { 
        key: 'login', 
        method: 'POST',
        path: '/api/v1/auth/login',
        description: 'Authenticate user and receive JWT token 🚪',
        status: 'stable',
        complexity: 'simple' as const,
        responseTime: 89,
        requestBody: {
          email: 'user@example.com',
          password: 'securePassword123'
        },
        response: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          expires_at: '2024-01-21T10:30:00Z',
          user: {
            id: '12345',
            email: 'user@example.com',
            first_name: 'John',
            last_name: 'Doe',
            role: 'user'
          }
        }
      },
      { 
        key: 'profile', 
        method: 'GET',
        path: '/api/v1/users/profile',
        description: 'Get authenticated user profile information 👤',
        status: 'stable',
        complexity: 'simple' as const,
        responseTime: 45,
        requestBody: {},
        response: {
          id: '12345',
          email: 'user@example.com',
          first_name: 'John',
          last_name: 'Doe',
          phone: '+1234567890',
          role: 'user',
          is_active: true,
          is_verified: true,
          created_at: '2024-01-15T10:30:00Z'
        }
      }
    ]
  },
  accounts: {
    name: 'Accounts & Banking',
    icon: BanknotesIcon,
    description: '💰 Account management and banking operations',
    color: 'from-brand-500 to-brand-300',
    emoji: '💳',
    endpoints: [
      { 
        key: 'listAccounts', 
        method: 'GET',
        path: '/api/v1/accounts',
        description: 'List all user accounts with balances 📊',
        status: 'stable',
        complexity: 'simple' as const,
        responseTime: 78,
        requestBody: {},
        response: [
          {
            id: 'acc_123',
            account_number: 'ACC001234567',
            type: 'CHECKING',
            status: 'ACTIVE',
            balance: 1500.00,
            currency: 'USD',
            name: 'Primary Checking',
            description: 'Main operating account',
            created_at: '2024-01-15T10:30:00Z'
          }
        ]
      },
      { 
        key: 'createAccount', 
        method: 'POST',
        path: '/api/v1/accounts',
        description: 'Create a new bank account 🆕',
        status: 'stable',
        complexity: 'intermediate' as const,
        responseTime: 156,
        requestBody: {
          type: 'CHECKING',
          name: 'Savings Account',
          description: 'Personal savings',
          currency: 'USD',
          initial_balance: 1000.00
        },
        response: {
          id: 'acc_456',
          account_number: 'ACC001234568',
          type: 'CHECKING',
          status: 'ACTIVE',
          balance: 1000.00,
          currency: 'USD',
          name: 'Savings Account',
          description: 'Personal savings',
          created_at: '2024-01-20T15:30:00Z'
        }
      }
    ]
  },
  kyc: {
    name: 'KYC & Compliance',
    icon: IdentificationIcon,
    description: 'Know Your Customer verification and compliance',
    color: 'from-[#253D2C] to-[#2E6F40]',
    emoji: '🔍',
    endpoints: [
      {
        key: 'startKYC',
        method: 'POST',
        path: '/api/kyc/start',
        description: 'Start KYC verification process 🚀',
        status: 'stable',
        complexity: 'intermediate' as const,
        responseTime: 234,
        requestBody: {
          country: 'United States of America',
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          location: 'New York, NY',
          amount: 10000
        },
        response: {
          user_id: 'user_123',
          country: 'United States of America',
          status: 'pending',
          progress: 0,
          documents: {
            passport: { status: 'pending', verified_at: null },
            drivers_license: { status: 'pending', verified_at: null }
          },
          next_steps: ['Upload required documents', 'Complete verification'],
          updated_at: '2024-01-20T15:30:00Z'
        }
      },
      {
        key: 'getCountries',
        method: 'GET',
        path: '/api/kyc/countries',
        description: 'Get supported countries for KYC verification 🌍',
        status: 'stable',
        complexity: 'simple' as const,
        responseTime: 89,
        requestBody: {},
        response: {
          success: true,
          countries: [
            {
              country: 'United States of America',
              documents: ['passport', 'drivers_license', 'id_card'],
              description: 'USA - State-issued IDs and federal documents'
            },
            {
              country: 'United Kingdom',
              documents: ['passport', 'drivers_license'],
              description: 'UK - UK passport and driving licence'
            }
          ],
          total: 30
        }
      },
      {
        key: 'verifyDocument',
        method: 'POST',
        path: '/api/kyc/verify/passport',
        description: 'Verify document using Didit integration 📄',
        status: 'stable',
        complexity: 'advanced' as const,
        responseTime: 1200,
        requestBody: {
          document_type: 'passport',
          document_number: '123456789',
          country: 'US'
        },
        response: {
          status: 'verified',
          valid: true,
          details: {
            full_name: 'John Doe',
            date_of_birth: '1990-01-01',
            nationality: 'US',
            document_number: '123456789'
          },
          timestamp: '2024-01-20T15:30:00Z'
        }
      },
      {
        key: 'getDashboard',
        method: 'GET',
        path: '/api/kyc/dashboard',
        description: 'Get KYC dashboard with all submissions 📊',
        status: 'stable',
        complexity: 'intermediate' as const,
        responseTime: 156,
        requestBody: {},
        response: {
          success: true,
          data: [
            {
              id: 'kyc_123',
              user_id: 'user_456',
              status: 'verified',
              country: 'US',
              progress: 100,
              submitted_at: '2024-01-20T15:30:00Z'
            }
          ]
        }
      }
    ]
  },
  ledger: {
    name: 'Ledger & Double-Entry',
    icon: Square3Stack3DIcon,
    description: '📚 Double-entry bookkeeping and ledger operations',
    color: 'from-orange-500 to-red-600',
    emoji: '📊',
    endpoints: [
      {
        key: 'createLedgerAccount',
        method: 'POST',
        path: '/api/ledger/accounts',
        description: 'Create a new ledger account for double-entry bookkeeping 📝',
        status: 'stable',
        complexity: 'intermediate' as const,
        responseTime: 123,
        requestBody: {
          name: 'Cash Account',
          description: 'Primary cash account',
          currency: 'USD',
          type: 'ASSET',
          parent_id: null
        },
        response: {
          id: 'ledger_acc_789',
          account_number: 'LA001234567',
          name: 'Cash Account',
          type: 'ASSET',
          status: 'ACTIVE',
          currency: 'USD',
          balance: 0.00,
          created_at: '2024-01-20T15:30:00Z'
        }
      },
      {
        key: 'createTransfer',
        method: 'POST',
        path: '/api/ledger/transactions/transfer',
        description: 'Create a transfer transaction between accounts ↔️',
        status: 'stable',
        complexity: 'advanced' as const,
        responseTime: 189,
        requestBody: {
          from_account_id: 'ledger_acc_123',
          to_account_id: 'ledger_acc_456',
          amount: 1000.00,
          currency: 'USD',
          description: 'Transfer to savings',
          reference: 'TXN001'
        },
        response: {
          id: 'txn_123',
          from_account_id: 'ledger_acc_123',
          to_account_id: 'ledger_acc_456',
          amount: 1000.00,
          currency: 'USD',
          status: 'posted',
          entries: [
            {
              account_id: 'ledger_acc_123',
              debit: 0,
              credit: 1000.00
            },
            {
              account_id: 'ledger_acc_456',
              debit: 1000.00,
              credit: 0
            }
          ],
          created_at: '2024-01-20T15:30:00Z'
        }
      },
      {
        key: 'getTrialBalance',
        method: 'GET',
        path: '/api/ledger/trial-balance',
        description: 'Get trial balance for all accounts ⚖️',
        status: 'stable',
        complexity: 'intermediate' as const,
        responseTime: 234,
        requestBody: {},
        response: {
          trial_balance: [
            {
              account_id: 'ledger_acc_123',
              account_name: 'Cash Account',
              account_type: 'ASSET',
              debit_balance: 5000.00,
              credit_balance: 0.00
            },
            {
              account_id: 'ledger_acc_456',
              account_name: 'Revenue Account',
              account_type: 'REVENUE',
              debit_balance: 0.00,
              credit_balance: 3000.00
            }
          ],
          total_debits: 5000.00,
          total_credits: 5000.00,
          is_balanced: true,
          as_of: '2024-01-20T15:30:00Z'
        }
      }
    ]
  },
  grpc: {
    name: 'gRPC Streaming APIs',
    icon: BoltIcon,
    description: 'Next-generation streaming APIs with microsecond latency',
    color: 'from-[#2E6F40] to-[#253D2C]',
    emoji: '🚀',
    endpoints: [
      { 
        key: 'paymentMonitor', 
        method: 'BIDIRECTIONAL_STREAM',
        path: 'fintech.payment.v1.PaymentService/TransactionMonitor',
        description: '💸 Real-time payment monitoring with dynamic filtering and alerts',
        status: 'stable',
        complexity: 'advanced' as const,
        responseTime: 12,
        requestBody: {
          command: {
            start_monitoring: {
              user_id: "user_123",
              status_filter: ["PROCESSING", "COMPLETED", "FAILED"],
              min_amount: 100.0,
              currency_filter: ["USD", "EUR", "GBP"],
              rail_filter: ["UPI", "SEPA", "ACH"]
            }
          }
        },
        response: {
          event: {
            payment_update: {
              payment_id: "pay_456",
              user_id: "user_123",
              amount: 250.0,
              currency: "USD",
              status: "COMPLETED",
              chosen_rail: "ACH",
              processing_time_ms: 1240,
              timestamp: "2024-01-20T15:30:00Z"
            }
          }
        }
      },
      {
        key: 'webhookDebugger',
        method: 'BIDIRECTIONAL_STREAM',
        path: 'fintech.webhook.v1.WebhookService/WebhookDebugger',
        description: '🐛 Live webhook debugging with real-time delivery testing',
        status: 'stable',
        complexity: 'advanced' as const,
        responseTime: 15,
        requestBody: {
          command: {
            start_debugging: {
              webhook_id: "webhook_123",
              capture_requests: true,
              capture_responses: true,
              enable_verbose_logging: true
            }
          }
        },
        response: {
          response: {
            delivery_attempt: {
              delivery_id: "delivery_456",
              webhook_id: "webhook_123",
              url: "https://api.example.com/webhook",
              response_status: 200,
              response_time_ms: 89.5,
              successful: true,
              attempted_at: "2024-01-20T15:30:00Z"
            }
          }
        }
      },
      {
        key: 'createPayment',
        method: 'UNARY',
        path: 'fintech.payment.v1.PaymentService/CreatePayment',
        description: '💳 Create payment with KYC checks and rail optimization',
        status: 'stable',
        complexity: 'advanced' as const,
        responseTime: 45,
        requestBody: {
          user_id: "user_123",
          from_account_id: "acc_456",
          to_account_id: "acc_789",
          amount: 1000.0,
          currency: "USD",
          description: "Monthly rent payment",
          reference: "RENT_JAN_2024"
        },
        response: {
          payment: {
            payment_id: "pay_123",
            user_id: "user_123",
            amount: 1000.0,
            currency: "USD",
            status: "PROCESSING",
            chosen_rail: "ACH",
            fee: 2.50,
            created_at: "2024-01-20T15:30:00Z"
          },
          kyc_check: {
            passed: true,
            risk_level: "low",
            flags: []
          },
          message: "Payment created successfully"
        }
      },
      {
        key: 'kycCreateProfile',
        method: 'UNARY',
        path: 'fintech.kyc.v1.KYCService/CreateProfile',
        description: '🔍 Create KYC profile with risk assessment and policy evaluation',
        status: 'stable',
        complexity: 'advanced' as const,
        responseTime: 234,
        requestBody: {
          user_id: "user_123",
          name: "John Doe",
          email: "john.doe@example.com",
          country: "US",
          amount: 50000,
          documents: {
            passport: "base64_encoded_document",
            drivers_license: "base64_encoded_document"
          }
        },
        response: {
          profile: {
            profile_id: "kyc_profile_456",
            user_id: "user_123",
            status: "UNDER_REVIEW",
            risk_score: 25,
            submitted_at: "2024-01-20T15:30:00Z"
          },
          risk_assessment: {
            overall_score: 25,
            risk_level: "low",
            flags: [],
            factor_scores: {
              document_authenticity: 0.95,
              geographic_risk: 0.10
            }
          },
          policy_evaluation: {
            verdict: "approved",
            policy_version: "v1.2.0",
            violated_rules: []
          }
        }
      },
      {
        key: 'ledgerCreateAccount',
        method: 'UNARY',
        path: 'fintech.ledger.v1.LedgerService/CreateAccount',
        description: '📚 Create ledger account for double-entry bookkeeping',
        status: 'stable',
        complexity: 'intermediate' as const,
        responseTime: 67,
        requestBody: {
          user_id: "user_123",
          account_number: "LA001234567",
          name: "Cash Account",
          description: "Primary cash account",
          currency: "USD",
          type: "ASSET"
        },
        response: {
          account: {
            account_id: "ledger_acc_789",
            user_id: "user_123",
            account_number: "LA001234567",
            name: "Cash Account",
            type: "ASSET",
            status: "ACTIVE",
            currency: "USD",
            created_at: "2024-01-20T15:30:00Z"
          },
          message: "Account created successfully"
        }
      }
    ]
  },
  system: {
    name: 'System & Health',
    icon: CogIcon,
    description: '⚙️ System monitoring and health checks',
    color: 'from-gray-500 to-slate-600',
    emoji: '🔧',
    endpoints: [
      { 
        key: 'health', 
        method: 'GET',
        path: '/health',
        description: 'System health check with database status 💚',
        status: 'stable',
        complexity: 'simple' as const,
        responseTime: 23,
        requestBody: {},
        response: {
          status: 'ok',
          message: 'Fintech Backend is running with Neon database',
          time: '2024-01-20T15:30:00Z',
          timestamp: 1705758600,
          database: {
            connected: true,
            database_name: 'fintech',
            host: 'ep-xxx.us-east-1.aws.neon.tech',
            ssl_mode: 'require',
            version: 'PostgreSQL 15.5'
          }
        }
      }
    ]
  }
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const style = status === 'stable'
    ? { background: 'rgba(46,111,64,0.15)', color: '#CFFFDC', border: '1px solid rgba(104,186,127,0.25)' }
    : status === 'beta'
      ? { background: 'rgba(245,158,11,0.12)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.25)' }
      : { background: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)' };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" style={style}>
      {status}
    </span>
  );
};

const MethodBadge: React.FC<{ method: string }> = ({ method }) => {
  const style: React.CSSProperties =
    method === 'GET'
      ? { background: 'rgba(104,186,127,0.15)', color: '#68BA7F', border: '1px solid rgba(104,186,127,0.25)' }
    : method === 'POST'
      ? { background: 'rgba(46,111,64,0.20)', color: '#CFFFDC', border: '1px solid rgba(207,255,220,0.25)' }
    : method === 'PUT'
      ? { background: 'rgba(245,158,11,0.12)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.25)' }
    : method === 'DELETE'
      ? { background: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)' }
    : method === 'BIDIRECTIONAL_STREAM'
      ? { background: 'rgba(37,61,44,0.50)', color: '#CFFFDC', border: '1px solid rgba(104,186,127,0.30)' }
      : { background: 'rgba(37,61,44,0.35)', color: '#68BA7F', border: '1px solid rgba(104,186,127,0.20)' };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-semibold" style={style}>
      {method}
    </span>
  );
};

const AnimatedCard: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  delay?: number;
  hoverable?: boolean;
}> = ({ children, className = '', delay = 0, hoverable = true }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hoverable ? { 
        y: -5, 
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
      } : {}}
      className={`${className} ${hoverable ? 'cursor-pointer' : ''}`}
    >
      {children}
    </motion.div>
  );
};

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <motion.button
      onClick={handleCopy}
      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {copied ? (
        <CheckCircleIcon className="h-4 w-4 text-brand-300" />
      ) : (
        <ClipboardDocumentIcon className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.45)' }} />
      )}
    </motion.button>
  );
};

const APIExplorer: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof apiCategories>('authentication');
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint>(apiCategories.authentication.endpoints[0] as APIEndpoint);

  const CategoryIcon = apiCategories[selectedCategory].icon;

  useEffect(() => {
    setSelectedEndpoint(apiCategories[selectedCategory].endpoints[0] as APIEndpoint);
  }, [selectedCategory]);

  return (
    <div className="min-h-screen" style={{ background: '#0B0C0E' }}>
      <div className="pt-16 sm:pt-20">
        {/* Hero */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-xs font-semibold tracking-widest uppercase"
                style={{ background: 'rgba(46,111,64,0.10)', border: '1px solid rgba(104,186,127,0.18)', color: '#68BA7F' }}
              >
                <CodeBracketIcon className="h-3 w-3" />
                Developer Tools
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                API{' '}
                <span style={{
                  background: 'linear-gradient(95deg, #ffffff 0%, #CFFFDC 45%, #68BA7F 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>Explorer</span>
              </h1>
              <p className="text-lg sm:text-xl max-w-3xl mx-auto px-4" style={{ color: 'rgba(255,255,255,0.42)' }}>
                Explore our comprehensive APIs and start building amazing fintech applications
              </p>
            </motion.div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {[
                { name: 'Quick Start',   icon: RocketLaunchIcon,          description: 'Get started in minutes' },
                { name: 'API Reference', icon: DocumentTextIcon,           description: 'Complete documentation' },
                { name: 'Code Examples', icon: CodeBracketIcon,            description: 'Ready-to-use snippets' },
                { name: 'Support',       icon: ChatBubbleLeftRightIcon,    description: '24/7 developer support' },
              ].map((item, i) => (
                <AnimatedCard key={i} delay={i * 0.08}>
                  <motion.button
                    className="w-full p-5 glass-card rounded-xl text-left group"
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon className="h-6 w-6 mb-3 group-hover:scale-110 transition-transform duration-300" style={{ color: '#68BA7F' }} />
                    <h3 className="text-base font-semibold text-white mb-1">{item.name}</h3>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.42)' }}>{item.description}</p>
                    <ChevronRightIcon className="h-4 w-4 mt-2 group-hover:translate-x-1 transition-transform duration-300" style={{ color: 'rgba(255,255,255,0.25)' }} />
                  </motion.button>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>

        {/* Categories + Explorer */}
        <section className="pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col xl:grid xl:grid-cols-3 gap-5">
              {/* Sidebar */}
              <div className="xl:col-span-1">
                <AnimatedCard>
                  <div className="glass-card rounded-2xl p-5 xl:sticky xl:top-8">
                    <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                      <CubeIcon className="h-4 w-4" style={{ color: '#68BA7F' }} />
                      API Categories
                    </h3>
                    {/* Mobile: horizontal scroll */}
                    <div className="xl:hidden flex gap-3 overflow-x-auto pb-2">
                      {Object.entries(apiCategories).map(([key, category]) => (
                        <motion.button
                          key={key}
                          onClick={() => setSelectedCategory(key as keyof typeof apiCategories)}
                          className="flex-shrink-0 text-left p-3 rounded-xl transition-all duration-200"
                          style={selectedCategory === key
                            ? { background: 'linear-gradient(135deg, #2E6F40, #68BA7F)', color: 'white', border: '1px solid transparent' }
                            : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <div className="font-semibold text-sm whitespace-nowrap">{category.name}</div>
                          <div className="text-xs opacity-70">{category.endpoints.length} endpoints</div>
                        </motion.button>
                      ))}
                    </div>
                    {/* Desktop: vertical list */}
                    <div className="hidden xl:block space-y-2">
                      {Object.entries(apiCategories).map(([key, category]) => (
                        <motion.button
                          key={key}
                          onClick={() => setSelectedCategory(key as keyof typeof apiCategories)}
                          className="w-full text-left p-4 rounded-xl transition-all duration-200"
                          style={selectedCategory === key
                            ? { background: 'linear-gradient(135deg, #2E6F40, #68BA7F)', color: 'white', border: '1px solid transparent' }
                            : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold truncate text-sm">{category.name}</div>
                              <div className="text-xs opacity-65 mt-0.5">{category.endpoints.length} endpoints</div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </AnimatedCard>
              </div>

              {/* Main content */}
              <div className="xl:col-span-2 space-y-5">
                {/* Category header + endpoints */}
                <AnimatedCard>
                  <div className="glass-card rounded-2xl p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #2E6F40, #68BA7F)' }}
                      >
                        <CategoryIcon className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{apiCategories[selectedCategory].name}</h3>
                        <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                          {apiCategories[selectedCategory].description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {apiCategories[selectedCategory].endpoints.map((endpoint, i) => (
                        <motion.div
                          key={endpoint.key}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.07 }}
                          onClick={() => setSelectedEndpoint(endpoint as APIEndpoint)}
                          className="p-4 rounded-xl cursor-pointer transition-all duration-200"
                          style={selectedEndpoint.key === endpoint.key
                            ? { background: 'rgba(46,111,64,0.12)', border: '1px solid rgba(104,186,127,0.28)' }
                            : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <MethodBadge method={endpoint.method} />
                                <code className="text-xs font-mono px-2 py-0.5 rounded break-all"
                                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.65)' }}>
                                  {endpoint.path}
                                </code>
                                <StatusBadge status={endpoint.status} />
                              </div>
                              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{endpoint.description}</p>
                            </div>
                            <CopyButton text={endpoint.path} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </AnimatedCard>

                {/* Code example */}
                <AnimatedCard>
                  <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h4 className="text-base font-semibold text-white flex items-center gap-2">
                        <CodeBracketIcon className="h-4 w-4" style={{ color: '#68BA7F' }} />
                        Code Example
                      </h4>
                      <CopyButton text={`curl -X ${selectedEndpoint.method} "https://api.fintech-os.com${selectedEndpoint.path}" \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json"`} />
                    </div>
                    <div className="rounded-xl p-5 overflow-x-auto" style={{ background: 'rgba(0,0,0,0.35)' }}>
                      <pre className="text-sm font-mono" style={{ color: 'rgba(207,255,220,0.85)' }}>
                        <code>{`curl -X ${selectedEndpoint.method} "https://api.fintech-os.com${selectedEndpoint.path}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"${selectedEndpoint.method !== 'GET' && Object.keys(selectedEndpoint.requestBody).length > 0 ? ` \\
  -d '${JSON.stringify(selectedEndpoint.requestBody, null, 2)}'` : ''}`}</code>
                      </pre>
                    </div>
                  </div>
                </AnimatedCard>

                {/* Request & Response */}
                <AnimatedCard>
                  <div className="glass-card rounded-2xl p-6">
                    <h4 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
                      <DocumentTextIcon className="h-4 w-4" style={{ color: '#68BA7F' }} />
                      Request &amp; Response
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      {/* Request */}
                      <div className="rounded-xl p-5" style={{ background: 'rgba(46,111,64,0.08)', border: '1px solid rgba(104,186,127,0.18)' }}>
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-sm font-semibold flex items-center gap-1.5" style={{ color: '#68BA7F' }}>
                            <span>→</span> Request Body
                          </h5>
                          <CopyButton text={JSON.stringify(selectedEndpoint.requestBody, null, 2)} />
                        </div>
                        <div className="rounded-xl p-4 overflow-x-auto" style={{ background: 'rgba(0,0,0,0.35)' }}>
                          <pre className="text-xs font-mono" style={{ color: '#68BA7F' }}>
                            <code>{JSON.stringify(selectedEndpoint.requestBody, null, 2)}</code>
                          </pre>
                        </div>
                      </div>

                      {/* Response */}
                      <div className="rounded-xl p-5" style={{ background: 'rgba(207,255,220,0.04)', border: '1px solid rgba(207,255,220,0.12)' }}>
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-sm font-semibold flex items-center gap-1.5" style={{ color: '#CFFFDC' }}>
                            <span>←</span> Response
                          </h5>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded"
                              style={{ background: 'rgba(46,111,64,0.15)', color: '#68BA7F', border: '1px solid rgba(104,186,127,0.2)' }}>
                              {selectedEndpoint.responseTime || 50}ms
                            </span>
                            <CopyButton text={JSON.stringify(selectedEndpoint.response, null, 2)} />
                          </div>
                        </div>
                        <div className="rounded-xl p-4 overflow-x-auto" style={{ background: 'rgba(0,0,0,0.35)' }}>
                          <pre className="text-xs font-mono" style={{ color: '#CFFFDC' }}>
                            <code>{JSON.stringify(selectedEndpoint.response, null, 2)}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default APIExplorer; 