import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// TypeScript interfaces
interface APIEndpoint {
  key: string;
  method: string;
  path: string;
  description: string;
  status: string;
  requestBody: any;
  response: any;
}
import ChevronRightIcon from '@heroicons/react/24/outline/ChevronRightIcon';
import ClipboardDocumentIcon from '@heroicons/react/24/outline/ClipboardDocumentIcon';
import PlayIcon from '@heroicons/react/24/outline/PlayIcon';
import CodeBracketIcon from '@heroicons/react/24/outline/CodeBracketIcon';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';
import CubeIcon from '@heroicons/react/24/outline/CubeIcon';
import ShieldCheckIcon from '@heroicons/react/24/outline/ShieldCheckIcon';
import BoltIcon from '@heroicons/react/24/outline/BoltIcon';
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon';
import UserGroupIcon from '@heroicons/react/24/outline/UserGroupIcon';
import CreditCardIcon from '@heroicons/react/24/outline/CreditCardIcon';
import BuildingLibraryIcon from '@heroicons/react/24/outline/BuildingLibraryIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon';

// Floating code snippets for animation
const floatingCodeSnippets = [
  "const transfer = async () => {",
  "POST /api/v1/auth/login",
  "{ amount: 1000, currency: 'USD' }",
  "const balance = await getBalance();",
  "if (transaction.status === 'success')",
  "return { success: true, data };",
  "npm install @fintech/sdk",
  "Authorization: Bearer ${token}",
  "{ ledger_account_id: '12345' }",
  "await ledger.createTransaction({",
  "Content-Type: application/json",
  "console.log('Payment processed!');"
];

// Terminal commands animation
const terminalCommands = [
  "$ npm install @fintech-os/sdk",
  "$ curl -X POST https://api.fintech-os.com/auth",
  "$ git clone https://github.com/fintech-os/examples",
  "$ yarn add @fintech-os/react-components",
  "$ npm run test:integration",
  "$ docker run fintech-os/server"
];

// Enhanced API data structure with more quirky descriptions
const apiCategories = {
  authentication: {
    name: 'Authentication',
    icon: ShieldCheckIcon,
    description: '🔐 Fort Knox-level security for your users',
    color: 'from-blue-500 to-indigo-600',
    emoji: '🛡️',
    endpoints: [
      { 
        key: 'register', 
        method: 'POST',
        path: '/api/v1/auth/register',
        description: 'Welcome new users to the party 🎉',
        status: 'stable',
        requestBody: {
          email: 'user@example.com',
          password: 'securePassword123',
          firstName: 'John',
          lastName: 'Doe'
        },
        response: {
          success: true,
          message: 'User registered successfully',
          data: {
            userId: '12345',
            email: 'user@example.com',
            firstName: 'John',
            lastName: 'Doe',
            createdAt: '2024-01-15T10:30:00Z'
          },
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      },
      { 
        key: 'login', 
        method: 'POST',
        path: '/api/v1/auth/login',
        description: 'Let the right ones in 🚪',
        status: 'stable',
        requestBody: {
          email: 'user@example.com',
          password: 'securePassword123'
        },
        response: {
          success: true,
          message: 'Login successful',
          data: {
            userId: '12345',
            email: 'user@example.com',
            firstName: 'John',
            lastName: 'Doe'
          },
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          expiresIn: '24h'
        }
      },
      { 
        key: 'logout', 
        method: 'POST',
        path: '/api/v1/auth/logout',
        description: 'See you later, alligator! 🐊',
        status: 'stable',
        requestBody: {},
        response: {
          success: true,
          message: 'Logout successful'
        }
      },
    ]
  },
  accounts: {
    name: 'Accounts',
    icon: UserGroupIcon,
    description: '👥 Manage users like a social media mogul',
    color: 'from-emerald-500 to-teal-600',
    emoji: '👤',
    endpoints: [
      { 
        key: 'getProfile', 
        method: 'GET',
        path: '/api/v1/users/profile',
        description: 'Stalk users (legally) 🕵️',
        status: 'stable',
        requestBody: {},
        response: {
          success: true,
          data: {
            userId: '12345',
            email: 'user@example.com',
            firstName: 'John',
            lastName: 'Doe',
            phone: '+1234567890',
            kycStatus: 'verified',
            createdAt: '2024-01-15T10:30:00Z',
            lastLogin: '2024-01-20T14:22:00Z'
          }
        }
      },
      { 
        key: 'updateProfile', 
        method: 'PUT', 
        path: '/api/v1/users/profile', 
        description: 'Makeover time! ✨',
        status: 'stable',
        requestBody: {
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '+1987654321'
        },
        response: {
          success: true,
          message: 'Profile updated successfully',
          data: {
            userId: '12345',
            email: 'user@example.com',
            firstName: 'Jane',
            lastName: 'Smith',
            phone: '+1987654321',
            updatedAt: '2024-01-20T15:30:00Z'
          }
        }
      },
      { 
        key: 'listAccounts', 
        method: 'GET', 
        path: '/api/v1/accounts', 
        description: 'The whole gang in one place 🎭',
        status: 'stable',
        requestBody: {},
        response: {
          success: true,
          data: [
            {
              accountId: 'acc_001',
              userId: '12345',
              accountType: 'checking',
              balance: 1500.00,
              currency: 'USD',
              status: 'active'
            },
            {
              accountId: 'acc_002',
              userId: '12345',
              accountType: 'savings',
              balance: 5000.00,
              currency: 'USD',
              status: 'active'
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 2
          }
        }
      },
    ]
  },
  ledger: {
    name: 'Ledger',
    icon: BuildingLibraryIcon,
    description: '📚 Double-entry bookkeeping that would make an accountant cry',
    color: 'from-purple-500 to-pink-600',
    emoji: '📊',
    endpoints: [
      { 
        key: 'listLedgerAccounts', 
        method: 'GET', 
        path: '/api/ledger/accounts', 
        description: 'Show me the money! 💰',
        status: 'stable',
        requestBody: {},
        response: {
          success: true,
          data: [
            {
              ledgerAccountId: 'lg_001',
              name: 'Cash Account',
              accountType: 'asset',
              balance: 25000.00,
              currency: 'USD',
              createdAt: '2024-01-15T10:30:00Z'
            },
            {
              ledgerAccountId: 'lg_002',
              name: 'Revenue Account',
              accountType: 'revenue',
              balance: 15000.00,
              currency: 'USD',
              createdAt: '2024-01-15T10:30:00Z'
            }
          ]
        }
      },
      { 
        key: 'createLedgerAccount', 
        method: 'POST', 
        path: '/api/ledger/accounts', 
        description: 'Birth a new account into existence 👶',
        status: 'stable',
        requestBody: {
          name: 'New Cash Account',
          accountType: 'asset',
          currency: 'USD'
        },
        response: {
          success: true,
          message: 'Ledger account created successfully',
          data: {
            ledgerAccountId: 'lg_003',
            name: 'New Cash Account',
            accountType: 'asset',
            balance: 0.00,
            currency: 'USD',
            createdAt: '2024-01-20T15:30:00Z'
          }
        }
      },
      { 
        key: 'getLedgerBalance', 
        method: 'GET', 
        path: '/api/ledger/accounts/:id/balance', 
        description: 'Check if you\'re broke or not 🏦',
        status: 'stable',
        requestBody: {},
        response: {
          success: true,
          data: {
            ledgerAccountId: 'lg_001',
            balance: 25000.00,
            currency: 'USD',
            lastUpdated: '2024-01-20T14:22:00Z'
          }
        }
      },
      { 
        key: 'createTransfer', 
        method: 'POST', 
        path: '/api/ledger/transactions/transfer', 
        description: 'Move money like a financial wizard 🧙‍♂️',
        status: 'stable',
        requestBody: {
          fromAccount: 'lg_001',
          toAccount: 'lg_002',
          amount: 500.00,
          currency: 'USD',
          description: 'Transfer funds'
        },
        response: {
          success: true,
          message: 'Transfer completed successfully',
          data: {
            transactionId: 'tx_12345',
            fromAccount: 'lg_001',
            toAccount: 'lg_002',
            amount: 500.00,
            currency: 'USD',
            status: 'completed',
            createdAt: '2024-01-20T15:30:00Z'
          }
        }
      },
    ]
  },
  payments: {
    name: 'Payments',
    icon: CreditCardIcon,
    description: '💳 Process payments faster than you can say "cha-ching"',
    color: 'from-orange-500 to-red-600',
    emoji: '💸',
    endpoints: [
      { 
        key: 'processPayment', 
        method: 'POST', 
        path: '/api/payments/process', 
        description: 'Make it rain (digitally) 🌧️💰',
        status: 'beta',
        requestBody: {
          amount: 100.00,
          currency: 'USD',
          paymentMethod: 'card',
          cardToken: 'tok_1234567890',
          description: 'Payment for services'
        },
        response: {
          success: true,
          message: 'Payment processed successfully',
          data: {
            paymentId: 'pay_123456',
            amount: 100.00,
            currency: 'USD',
            status: 'succeeded',
            fees: 3.00,
            netAmount: 97.00,
            processedAt: '2024-01-20T15:30:00Z'
          }
        }
      },
      { 
        key: 'getPaymentStatus', 
        method: 'GET', 
        path: '/api/payments/:id/status', 
        description: 'Are we there yet? Are we there yet? 🚗',
        status: 'beta',
        requestBody: {},
        response: {
          success: true,
          data: {
            paymentId: 'pay_123456',
            status: 'succeeded',
            amount: 100.00,
            currency: 'USD',
            createdAt: '2024-01-20T15:30:00Z',
            processedAt: '2024-01-20T15:30:05Z'
          }
        }
      },
    ]
  },
  kyc: {
    name: 'KYC & Compliance',
    icon: DocumentTextIcon,
    description: '🕵️ Know your customer better than they know themselves',
    color: 'from-cyan-500 to-blue-600',
    emoji: '🔍',
    endpoints: [
      { 
        key: 'startKYC', 
        method: 'POST', 
        path: '/api/kyc/start', 
        description: 'Begin the identity detective work 🔍',
        status: 'stable',
        requestBody: {
          userId: '12345',
          verificationType: 'identity'
        },
        response: {
          success: true,
          message: 'KYC process initiated',
          data: {
            kycId: 'kyc_789012',
            userId: '12345',
            status: 'pending',
            verificationType: 'identity',
            createdAt: '2024-01-20T15:30:00Z'
          }
        }
      },
      { 
        key: 'verifyDocument', 
        method: 'POST', 
        path: '/api/kyc/verify/:documentType', 
        description: 'Is this real life or just fantasy? 📄',
        status: 'stable',
        requestBody: {
          documentImage: 'base64_encoded_image',
          documentNumber: 'AB123456789'
        },
        response: {
          success: true,
          message: 'Document verification submitted',
          data: {
            verificationId: 'ver_345678',
            documentType: 'passport',
            status: 'processing',
            confidence: 0.95,
            submittedAt: '2024-01-20T15:30:00Z'
          }
        }
      },
      { 
        key: 'kycStatus', 
        method: 'GET', 
        path: '/api/kyc/status/:userId', 
        description: 'Judge their worthiness ⚖️',
        status: 'stable',
        requestBody: {},
        response: {
          success: true,
          data: {
            userId: '12345',
            kycStatus: 'verified',
            verificationLevel: 'level_2',
            completedAt: '2024-01-20T16:00:00Z',
            verifiedDocuments: ['passport', 'address_proof']
          }
        }
      },
    ]
  },
  analytics: {
    name: 'Analytics',
    icon: ChartBarIcon,
    description: '📈 Turn numbers into beautiful stories',
    color: 'from-violet-500 to-purple-600',
    emoji: '📊',
    endpoints: [
      { 
        key: 'getMetrics', 
        method: 'GET', 
        path: '/api/analytics/metrics', 
        description: 'Data that sparks joy ✨',
        status: 'beta',
        requestBody: {},
        response: {
          success: true,
          data: {
            totalTransactions: 1250,
            totalVolume: 125000.00,
            activeUsers: 89,
            conversionRate: 0.045,
            averageTransactionValue: 100.00,
            periodStart: '2024-01-01T00:00:00Z',
            periodEnd: '2024-01-20T23:59:59Z'
          }
        }
      },
      { 
        key: 'generateReport', 
        method: 'POST', 
        path: '/api/analytics/reports', 
        description: 'Create reports that don\'t put people to sleep 😴',
        status: 'beta',
        requestBody: {
          reportType: 'transaction_summary',
          dateRange: {
            start: '2024-01-01',
            end: '2024-01-31'
          },
          format: 'pdf'
        },
        response: {
          success: true,
          message: 'Report generation initiated',
          data: {
            reportId: 'rpt_567890',
            reportType: 'transaction_summary',
            status: 'processing',
            estimatedCompletion: '2024-01-20T15:35:00Z',
            downloadUrl: null
          }
        }
      },
    ]
  }
};

// Quick start features with quirky descriptions
const quickStartFeatures = [
  {
    icon: BoltIcon,
    title: 'Lightning Setup ⚡',
    description: 'From zero to hero in under 5 minutes (we timed it)',
    link: '#quickstart',
    gradient: 'from-yellow-400 to-orange-500'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Fort Knox Security 🏰',
    description: 'So secure, even we sometimes can\'t get in',
    link: '#security',
    gradient: 'from-green-400 to-blue-500'
  },
  {
    icon: CubeIcon,
    title: 'Modular Magic 🧱',
    description: 'Mix and match APIs like LEGO blocks',
    link: '#modular',
    gradient: 'from-purple-400 to-pink-500'
  }
];

// Floating particles component
const FloatingParticles: React.FC = () => {
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, delay: number}>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      delay: Math.random() * 2
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 backdrop-blur-sm"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// Floating code snippets component
const FloatingCode: React.FC = () => {
  const [codeSnippets, setCodeSnippets] = useState<Array<{id: number, text: string, x: number, y: number, delay: number}>>([]);

  useEffect(() => {
    const snippets = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      text: floatingCodeSnippets[i % floatingCodeSnippets.length],
      x: Math.random() * 90 + 5,
      y: Math.random() * 80 + 10,
      delay: Math.random() * 3
    }));
    setCodeSnippets(snippets);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {codeSnippets.map((snippet) => (
        <motion.div
          key={snippet.id}
          className="absolute px-3 py-1 bg-gray-900/10 dark:bg-white/5 backdrop-blur-sm rounded-md border border-gray-200/20 dark:border-gray-700/20"
          style={{
            left: `${snippet.x}%`,
            top: `${snippet.y}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0, 0.6, 0],
            rotateZ: [0, 2, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: snippet.delay,
            ease: "easeInOut"
          }}
        >
          <code className="text-xs font-mono text-gray-600 dark:text-gray-300">
            {snippet.text}
          </code>
        </motion.div>
      ))}
    </div>
  );
};

// Terminal animation component
const AnimatedTerminal: React.FC = () => {
  const [currentCommand, setCurrentCommand] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const command = terminalCommands[currentCommand];
    let i = 0;
    
    const typeCommand = () => {
      if (i < command.length) {
        setDisplayText(command.slice(0, i + 1));
        i++;
        setTimeout(typeCommand, 100 + Math.random() * 50);
      } else {
        setTimeout(() => {
          setCurrentCommand((prev) => (prev + 1) % terminalCommands.length);
          setDisplayText('');
        }, 2000);
      }
    };

    typeCommand();
  }, [currentCommand]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <span className="text-gray-400 text-xs ml-2">terminal</span>
      </div>
      <div className="text-green-400">
        <span className="text-blue-400">➜</span> fintech-os{' '}
        <span className="text-yellow-400">git:(main)</span>{' '}
        {displayText}
        <span className={`text-white ${showCursor ? 'opacity-100' : 'opacity-0'}`}>
          ▋
        </span>
      </div>
    </div>
  );
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

const DevelopersPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof apiCategories>('authentication');
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint>(apiCategories.authentication.endpoints[0] as APIEndpoint);

  const CategoryIcon = apiCategories[selectedCategory].icon;

  useEffect(() => {
    setSelectedEndpoint(apiCategories[selectedCategory].endpoints[0] as APIEndpoint);
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Fixed spacing from navbar */}
      <div className="pt-20">
        {/* Background Effects */}
        <FloatingParticles />
        <FloatingCode />
        
        {/* Hero Section */}
        <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/20 dark:border-blue-800/20 rounded-full mb-6"
              >
                <span className="text-2xl">🚀</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Developer Platform
                </span>
              </motion.div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Developer
                </span>{' '}
                <span className="text-gray-900 dark:text-white">Platform</span>
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
                Build the future of finance with our comprehensive APIs. From payments to ledger 
                management, we provide the infrastructure for modern fintech applications.
              </p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <motion.button
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <PlayIcon className="h-5 w-5" />
                  Quick Start
                </motion.button>
                
                <motion.button
                  className="px-8 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <DocumentTextIcon className="h-5 w-5" />
                  View Docs
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Quick Start Features */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {quickStartFeatures.map((feature, index) => (
                <AnimatedCard key={feature.title} delay={0.2 * index}>
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 text-center group hover:border-blue-300/50 dark:hover:border-blue-600/50 transition-all duration-300">
                    <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {feature.description}
                    </p>
                    <motion.button
                      className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 mx-auto group-hover:gap-2 transition-all duration-300"
                      whileHover={{ x: 5 }}
                    >
                      Learn more
                      <ChevronRightIcon className="h-4 w-4" />
                    </motion.button>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>

        {/* API Explorer Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                🧪 API Explorer
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Explore our comprehensive APIs and start building amazing fintech applications
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Categories Sidebar */}
              <div className="lg:col-span-1">
                <AnimatedCard>
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 sticky top-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <CubeIcon className="h-5 w-5" />
                      API Categories
                    </h3>
                    
                    <div className="space-y-3">
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
                            <div>
                              <div className="font-semibold">{category.name}</div>
                              <div className={`text-sm ${selectedCategory === key ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                                {category.endpoints.length} endpoints
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </AnimatedCard>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Category Overview */}
                <AnimatedCard>
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${apiCategories[selectedCategory].color} flex items-center justify-center`}>
                        <CategoryIcon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {apiCategories[selectedCategory].name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                          {apiCategories[selectedCategory].description}
                        </p>
                      </div>
                    </div>

                    {/* Endpoints List */}
                    <div className="space-y-4">
                      {apiCategories[selectedCategory].endpoints.map((endpoint, index) => (
                        <motion.div
                          key={endpoint.key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          onClick={() => setSelectedEndpoint(endpoint as APIEndpoint)}
                          className={`p-6 rounded-xl border transition-all duration-300 cursor-pointer ${
                            selectedEndpoint.key === endpoint.key
                              ? 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <MethodBadge method={endpoint.method} />
                                <code className="text-sm font-mono text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                  {endpoint.path}
                                </code>
                                <StatusBadge status={endpoint.status} />
                              </div>
                              <p className="text-gray-700 dark:text-gray-300">
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
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                      <DocumentTextIcon className="h-5 w-5" />
                      Request & Response
                    </h4>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Request Body */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="text-md font-medium text-gray-700 dark:text-gray-300">Request Body</h5>
                          <CopyButton text={JSON.stringify(selectedEndpoint.requestBody, null, 2)} />
                        </div>
                        <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-4 overflow-x-auto">
                          <pre className="text-sm text-green-400">
                            <code>{JSON.stringify(selectedEndpoint.requestBody, null, 2)}</code>
                          </pre>
                        </div>
                      </div>

                      {/* Response */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="text-md font-medium text-gray-700 dark:text-gray-300">Response</h5>
                          <CopyButton text={JSON.stringify(selectedEndpoint.response, null, 2)} />
                        </div>
                        <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-4 overflow-x-auto">
                          <pre className="text-sm text-blue-400">
                            <code>{JSON.stringify(selectedEndpoint.response, null, 2)}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>

                {/* Interactive Terminal */}
                <AnimatedCard>
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                      <span className="text-xl">💻</span>
                      Live Terminal
                    </h4>
                    <AnimatedTerminal />
                  </div>
                </AnimatedCard>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { number: '99.9%', label: 'Uptime SLA', icon: '⚡' },
                { number: '< 100ms', label: 'Response Time', icon: '🚀' },
                { number: '10M+', label: 'API Calls/Month', icon: '📈' },
                { number: '24/7', label: 'Developer Support', icon: '🛟' }
              ].map((stat, index) => (
                <AnimatedCard key={stat.label} delay={0.1 * index}>
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 text-center group hover:border-blue-300/50 dark:hover:border-blue-600/50 transition-all duration-300">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {stat.icon}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {stat.number}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 font-medium">
                      {stat.label}
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedCard>
                              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-12 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-20"></div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="relative z-10"
                >
                  <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                    Ready to build something amazing? 🎉
                  </h2>
                  <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                    Join thousands of developers who are already building the future of finance with our APIs
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.button
                      className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 justify-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <PlayIcon className="h-5 w-5" />
                      Get Started Free
                    </motion.button>
                    
                    <motion.button
                      className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center gap-2 justify-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <DocumentTextIcon className="h-5 w-5" />
                      Read the Docs
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </AnimatedCard>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DevelopersPage; 