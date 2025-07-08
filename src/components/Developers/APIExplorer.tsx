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
    description: '🔐 Secure user authentication and profile management',
    color: 'from-blue-500 to-indigo-600',
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
    color: 'from-green-500 to-emerald-600',
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
    description: '🛂 Know Your Customer verification and compliance',
    color: 'from-purple-500 to-pink-600',
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
    description: '⚡ Next-generation streaming APIs with microsecond latency',
    color: 'from-indigo-500 to-purple-600',
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
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'stable':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
      case 'beta':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700';
      case 'deprecated':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusStyle(status)}`}>
      {status}
    </span>
  );
};

const MethodBadge: React.FC<{ method: string }> = ({ method }) => {
  const getMethodStyle = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
      case 'POST':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
      case 'PUT':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700';
      case 'DELETE':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
      case 'BIDIRECTIONAL_STREAM':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700';
      case 'UNARY':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-mono font-semibold border ${getMethodStyle(method)}`}>
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
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {copied ? (
        <CheckCircleIcon className="h-4 w-4 text-green-500" />
      ) : (
        <ClipboardDocumentIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      <div className="pt-16 sm:pt-20">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12 lg:mb-16"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  🧪 API Explorer
                </span>
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed px-4">
                Explore our comprehensive APIs and start building amazing fintech applications
              </p>
            </motion.div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12 lg:mb-16">
              {[
                { name: 'Quick Start', icon: RocketLaunchIcon, description: 'Get started in minutes' },
                { name: 'API Reference', icon: DocumentTextIcon, description: 'Complete documentation' },
                { name: 'Code Examples', icon: CodeBracketIcon, description: 'Ready-to-use snippets' },
                { name: 'Support', icon: ChatBubbleLeftRightIcon, description: '24/7 developer support' }
              ].map((item, index) => (
                <AnimatedCard key={index} delay={index * 0.1}>
                  <motion.button
                    className="w-full p-4 lg:p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 text-left group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 dark:text-blue-400 mb-3 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300">
                      {item.description}
                    </p>
                    <ChevronRightIcon className="h-4 w-4 text-gray-400 mt-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </motion.button>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>

        {/* API Categories and Explorer */}
        <section className="py-12 sm:py-16 lg:py-4 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col xl:grid xl:grid-cols-3 gap-4 lg:gap-6">
              {/* Categories Sidebar */}
              <div className="xl:col-span-1 order-1 xl:order-1">
                <AnimatedCard>
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50 xl:sticky xl:top-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <CubeIcon className="h-5 w-5" />
                      API Categories
                    </h3>
                    
                    <div className="xl:space-y-3">
                      <div className="xl:hidden flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {Object.entries(apiCategories).map(([key, category]) => (
                          <motion.button
                            key={key}
                            onClick={() => setSelectedCategory(key as keyof typeof apiCategories)}
                            className={`flex-shrink-0 text-left p-3 rounded-xl transition-all duration-300 border whitespace-nowrap ${
                              selectedCategory === key 
                                ? `bg-gradient-to-r ${category.color} text-white border-transparent shadow-lg` 
                                : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center gap-2">
                              <div className="text-xl">{category.emoji}</div>
                              <div>
                                <div className="font-semibold text-sm">{category.name}</div>
                                <div className={`text-xs ${selectedCategory === key ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                                  {category.endpoints.length} endpoints
                                </div>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>

                      <div className="hidden xl:block space-y-3">
                        {Object.entries(apiCategories).map(([key, category]) => (
                          <motion.button
                            key={key}
                            onClick={() => setSelectedCategory(key as keyof typeof apiCategories)}
                            className={`w-full text-left p-4 rounded-xl transition-all duration-300 border ${
                              selectedCategory === key 
                                ? `bg-gradient-to-r ${category.color} text-white border-transparent shadow-lg` 
                                : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{category.emoji}</div>
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold truncate">{category.name}</div>
                                <div className={`text-sm truncate ${selectedCategory === key ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                                  {category.endpoints.length} endpoints
                                </div>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              </div>

              {/* Main Content */}
              <div className="xl:col-span-2 order-2 xl:order-2 space-y-4 lg:space-y-5">
                {/* Category Overview */}
                <AnimatedCard>
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                      <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${apiCategories[selectedCategory].color} flex items-center justify-center flex-shrink-0`}>
                        <CategoryIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                          {apiCategories[selectedCategory].name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">
                          {apiCategories[selectedCategory].description}
                        </p>
                      </div>
                    </div>

                    {/* Endpoints List */}
                    <div className="space-y-2 sm:space-y-4">
                      {apiCategories[selectedCategory].endpoints.map((endpoint, index) => (
                        <motion.div
                          key={endpoint.key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          onClick={() => setSelectedEndpoint(endpoint as APIEndpoint)}
                          className={`p-4 sm:p-6 rounded-xl border transition-all duration-300 cursor-pointer ${
                            selectedEndpoint.key === endpoint.key
                              ? 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                                <MethodBadge method={endpoint.method} />
                                <code className="text-xs sm:text-sm font-mono text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded break-all">
                                  {endpoint.path}
                                </code>
                                <StatusBadge status={endpoint.status} />
                              </div>
                              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                                {endpoint.description}
                              </p>
                            </div>
                            <CopyButton text={endpoint.path} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </AnimatedCard>

                {/* Code Example */}
                <AnimatedCard>
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <CodeBracketIcon className="h-5 w-5" />
                        Code Example
                      </h4>
                      <CopyButton text={`curl -X ${selectedEndpoint.method} "https://api.fintech-os.com${selectedEndpoint.path}" \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json"${selectedEndpoint.method !== 'GET' && Object.keys(selectedEndpoint.requestBody).length > 0 ? ` \\\n  -d '${JSON.stringify(selectedEndpoint.requestBody, null, 2)}'` : ''}`} />
                    </div>
                    
                    <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-6 overflow-x-auto">
                      <pre className="text-sm text-gray-300">
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
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                      <DocumentTextIcon className="h-6 w-6" />
                      Request & Response
                    </h4>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Request Body */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200/50 dark:border-green-800/50">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="text-lg font-bold text-green-900 dark:text-green-300 flex items-center gap-2">
                            <span className="text-green-600">→</span>
                            Request Body
                          </h5>
                          <CopyButton text={JSON.stringify(selectedEndpoint.requestBody, null, 2)} />
                        </div>
                        <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-4 overflow-x-auto">
                          <pre className="text-sm text-green-400 font-mono">
                            <code>{JSON.stringify(selectedEndpoint.requestBody, null, 2)}</code>
                          </pre>
                        </div>
                      </div>

                      {/* Response */}
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/50">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="text-lg font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                            <span className="text-blue-600">←</span>
                            Response
                          </h5>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                              {selectedEndpoint.responseTime || 50}ms
                            </span>
                            <CopyButton text={JSON.stringify(selectedEndpoint.response, null, 2)} />
                          </div>
                        </div>
                        <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-4 overflow-x-auto">
                          <pre className="text-sm text-blue-400 font-mono">
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