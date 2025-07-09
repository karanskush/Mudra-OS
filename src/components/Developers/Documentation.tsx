import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Book, Code, Database, Shield, CreditCard, Zap, Search, ChevronRight, ExternalLink, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface DocSection {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  content: string;
}

const Documentation: React.FC = () => {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const sections: DocSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Book,
      description: 'Quick start guide and basic concepts',
      content: `
# Getting Started with MudraCore OS

Follow these steps to integrate MudraCore OS into your application:

## Installation

Choose your preferred package manager:

\`\`\`bash
# Install via npm
npm install @mudracore/sdk

# Or using yarn
yarn add @mudracore/sdk
\`\`\`

## Client Initialization

Initialize the MudraCore client with your configuration:

\`\`\`typescript
import { MudraCore } from '@mudracore/sdk';

// Basic initialization
const client = new MudraCore({
  apiKey: 'your_api_key',
  environment: 'sandbox' // or 'production'
});

// Advanced configuration
const clientWithOptions = new MudraCore({
  apiKey: 'your_api_key',
  environment: 'sandbox',
  options: {
    timeout: 30000, // Request timeout in ms
    retries: 3,     // Number of retry attempts
    baseUrl: 'https://api.custom-domain.com', // Optional custom API endpoint
    debug: true     // Enable debug logging
  }
});
\`\`\`

## Error Handling

Implement proper error handling in your integration:

\`\`\`typescript
try {
  const client = new MudraCore({
    apiKey: 'your_api_key',
    environment: 'sandbox'
  });
  
  // Your API calls here
} catch (error) {
  if (error.code === 'INVALID_API_KEY') {
    console.error('Please check your API key');
  } else if (error.code === 'NETWORK_ERROR') {
    console.error('Network connectivity issues');
  } else {
    console.error('Unexpected error:', error);
  }
}
\`\`\`
      `
    },
    {
      id: 'authentication',
      title: 'Authentication',
      icon: Shield,
      description: 'Secure your API requests',
      content: `
# Authentication

MudraCore OS supports multiple authentication methods to secure your API requests.

## API Key Authentication

The simplest way to authenticate:

\`\`\`typescript
// Using API key authentication
const response = await client.authenticate({
  apiKey: 'your_api_key'
});

// Verify authentication status
const isAuthenticated = await client.auth.verify();
console.log('Authentication status:', isAuthenticated);
\`\`\`

## JWT Authentication

For more advanced scenarios:

\`\`\`typescript
// Generate JWT token
const token = await client.auth.getToken({
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret',
  scope: ['read', 'write'] // Optional scopes
});

// Use token in requests
const client = new MudraCore({
  jwt: token,
  environment: 'sandbox'
});

// Refresh token when needed
const newToken = await client.auth.refreshToken(token);
\`\`\`

## Session Management

Handle user sessions effectively:

\`\`\`typescript
// Start a new session
const session = await client.auth.createSession({
  userId: 'user123',
  deviceId: 'device456',
  expiresIn: '24h'
});

// Validate session
const isValid = await client.auth.validateSession(session.id);

// End session
await client.auth.endSession(session.id);
\`\`\`
      `
    },
    {
      id: 'ledger',
      title: 'Ledger API',
      icon: Database,
      description: 'Core ledger operations and transactions',
      content: `
# Ledger API

The Ledger API provides comprehensive double-entry accounting capabilities.

## Basic Operations

Create and manage ledger entries:

\`\`\`typescript
// Create a new ledger entry
const entry = await client.ledger.createEntry({
  debitAccount: 'ASSETS',
  creditAccount: 'REVENUE',
  amount: 1000,
  currency: 'USD',
  description: 'Service payment',
  metadata: {
    orderId: 'order123',
    customerId: 'cust456'
  }
});

// Get account balance
const balance = await client.ledger.getBalance('ASSETS', {
  currency: 'USD',
  asOf: new Date() // Optional timestamp
});

// List recent transactions
const transactions = await client.ledger.listTransactions({
  account: 'ASSETS',
  limit: 10,
  offset: 0,
  startDate: new Date('2024-01-01'),
  endDate: new Date()
});
\`\`\`

## Batch Operations

Handle multiple transactions efficiently:

\`\`\`typescript
// Create multiple entries in a single request
const batchEntries = await client.ledger.createBatchEntries([
  {
    debitAccount: 'ASSETS',
    creditAccount: 'REVENUE',
    amount: 1000,
    currency: 'USD',
    description: 'Service payment 1'
  },
  {
    debitAccount: 'ASSETS',
    creditAccount: 'REVENUE',
    amount: 2000,
    currency: 'USD',
    description: 'Service payment 2'
  }
]);

// Get multiple account balances
const balances = await client.ledger.getBatchBalances([
  'ASSETS',
  'LIABILITIES',
  'REVENUE'
], {
  currency: 'USD'
});
\`\`\`

## Advanced Features

Utilize advanced ledger capabilities:

\`\`\`typescript
// Create a recurring entry
const recurring = await client.ledger.createRecurringEntry({
  debitAccount: 'EXPENSES',
  creditAccount: 'ASSETS',
  amount: 500,
  currency: 'USD',
  description: 'Monthly subscription',
  schedule: {
    frequency: 'MONTHLY',
    startDate: new Date(),
    endDate: new Date('2025-01-01')
  }
});

// Generate account statement
const statement = await client.ledger.generateStatement('ASSETS', {
  startDate: new Date('2024-01-01'),
  endDate: new Date(),
  format: 'PDF'
});
\`\`\`
      `
    },
    {
      id: 'payments',
      title: 'Payment Processing',
      icon: CreditCard,
      description: 'Handle payments and transactions',
      content: `
# Payment Processing

Process payments securely using our comprehensive payment API.

## Payment Creation

Create and process payments:

\`\`\`typescript
// Process a card payment
const cardPayment = await client.payments.create({
  amount: 1000,
  currency: 'USD',
  source: {
    type: 'card',
    token: 'card_token',
    save: true // Save for future use
  },
  description: 'Product purchase',
  metadata: {
    orderId: 'order123',
    productId: 'prod456'
  }
});

// Process ACH payment
const achPayment = await client.payments.create({
  amount: 5000,
  currency: 'USD',
  source: {
    type: 'ach',
    accountNumber: '****1234',
    routingNumber: '****5678'
  },
  description: 'Service subscription'
});
\`\`\`

## Payment Management

Monitor and manage payments:

\`\`\`typescript
// Get payment status
const status = await client.payments.getStatus(payment.id);

// Refund payment
const refund = await client.payments.refund(payment.id, {
  amount: 500, // Partial refund
  reason: 'Customer request'
});

// List payments
const payments = await client.payments.list({
  status: 'succeeded',
  startDate: new Date('2024-01-01'),
  endDate: new Date(),
  limit: 10
});
\`\`\`

## Webhooks

Handle payment webhooks:

\`\`\`typescript
// Configure webhook endpoint
const webhook = await client.payments.createWebhook({
  url: 'https://your-domain.com/webhooks',
  events: ['payment.succeeded', 'payment.failed']
});

// Handle webhook events
app.post('/webhooks', async (req, res) => {
  const event = client.payments.constructEvent(
    req.body,
    req.headers['signature']
  );

  switch (event.type) {
    case 'payment.succeeded':
      await handleSuccessfulPayment(event.data);
      break;
    case 'payment.failed':
      await handleFailedPayment(event.data);
      break;
  }

  res.json({ received: true });
});
\`\`\`
      `
    },
    {
      id: 'realtime',
      title: 'Real-time APIs',
      icon: Zap,
      description: 'WebSocket and gRPC streaming',
      content: `
# Real-time APIs

Subscribe to real-time updates using WebSocket or gRPC streaming.

## WebSocket Integration

Connect and handle real-time events:

\`\`\`typescript
// Initialize WebSocket connection
const ws = client.realtime.connect({
  reconnect: true,
  maxRetries: 3
});

// Handle connection lifecycle
ws.on('open', () => {
  console.log('Connected to real-time API');
});

ws.on('close', () => {
  console.log('Disconnected from real-time API');
});

// Subscribe to specific events
ws.on('transaction', (data) => {
  console.log('New transaction:', data);
});

ws.on('balance.update', (data) => {
  console.log('Balance updated:', data);
});

// Handle errors
ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});
\`\`\`

## gRPC Streaming

Implement bi-directional streaming:

\`\`\`typescript
// Subscribe to transaction stream
const stream = client.grpc.subscribeToTransactions({
  accounts: ['ASSETS', 'LIABILITIES'],
  minAmount: 1000
});

// Handle incoming data
stream.on('data', (transaction) => {
  console.log('New transaction:', transaction);
});

// Handle stream end
stream.on('end', () => {
  console.log('Stream ended');
});

// Handle errors
stream.on('error', (error) => {
  console.error('Stream error:', error);
});

// Send data back
stream.write({
  type: 'FILTER_UPDATE',
  data: {
    minAmount: 2000
  }
});
\`\`\`

## Advanced Features

Implement advanced real-time features:

\`\`\`typescript
// Custom subscription with filters
const subscription = client.realtime.subscribe({
  events: ['transaction', 'balance.update'],
  filters: {
    accounts: ['ASSETS'],
    minAmount: 1000,
    currency: 'USD'
  }
});

// Batch updates handling
subscription.on('batch', (updates) => {
  for (const update of updates) {
    console.log('Batch update:', update);
  }
});

// Presence detection
const presence = client.realtime.presence({
  channel: 'transactions',
  userId: 'user123'
});

presence.on('join', (user) => {
  console.log('User joined:', user);
});

presence.on('leave', (user) => {
  console.log('User left:', user);
});
\`\`\`
      `
    }
  ];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMarkdown = (content: string) => {
    const parts = content.split('```');
    return parts.map((part, index) => {
      if (index % 2 === 0) {
        // Regular text
        return (
          <div key={index} className="prose dark:prose-invert max-w-none">
            {part.split('\n').map((line, i) => {
              if (line.startsWith('#')) {
                const match = line.match(/^#+/);
                const level = match ? match[0].length : 1;
                const text = line.replace(/^#+\s/, '');
                const Tag = `h${level}` as keyof JSX.IntrinsicElements;
                const classes = level === 1 
                  ? 'text-3xl font-bold mb-6 mt-8' 
                  : level === 2 
                    ? 'text-2xl font-bold mb-4 mt-6' 
                    : 'text-xl font-bold mb-3 mt-4';
                return <Tag key={i} className={classes}>{text}</Tag>;
              }
              return line.trim() ? <p key={i} className="my-3 leading-relaxed">{line}</p> : null;
            })}
          </div>
        );
      } else {
        // Code block
        const [language, ...codeLines] = part.split('\n');
        const code = codeLines.join('\n').trim();
        return (
          <div key={index} className="relative group">
            <div className={`rounded-lg p-4 my-6 font-mono text-sm ${
              isDark ? 'bg-slate-800/80 backdrop-blur border border-slate-700' : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className="flex justify-between items-center mb-3">
                <span className={`text-xs font-medium px-2 py-1 rounded ${
                  isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-600'
                }`}>{language}</span>
                <button
                  onClick={() => handleCopyCode(code)}
                  className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-md ${
                    isDark ? 'hover:bg-slate-700 text-slate-400 hover:text-slate-200' : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {copiedCode === code ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              <pre className={`overflow-x-auto p-2 rounded ${
                isDark ? 'bg-slate-900/50 text-slate-200' : 'bg-white text-gray-800'
              }`}>
                <code className="block whitespace-pre">{code}</code>
              </pre>
            </div>
          </div>
        );
      }
    });
  };

  return (
    <div className={`min-h-screen pt-20 ${isDark ? 'bg-slate-900 text-slate-200' : 'bg-white text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            API Documentation
          </h1>
          <p className={`text-xl ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            Comprehensive guide to integrating with MudraCore OS
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <div className={`relative rounded-lg border ${
            isDark ? 'bg-slate-800/80 backdrop-blur border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className={`h-5 w-5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
            </div>
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`block w-full pl-12 pr-4 py-4 rounded-lg focus:outline-none focus:ring-2 ${
                isDark 
                  ? 'bg-slate-800/80 text-white placeholder-slate-400 focus:ring-blue-500/50' 
                  : 'bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500/50'
              }`}
            />
          </div>
        </div>

        {/* Documentation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSections.map((section) => (
            <div
              key={section.id}
              className={`rounded-xl border p-6 transition-all duration-200 hover:shadow-lg ${
                isDark 
                  ? 'bg-slate-800/80 backdrop-blur border-slate-700 hover:border-slate-600' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  isDark ? 'bg-slate-700' : 'bg-blue-50'
                }`}>
                  <section.icon className={`h-6 w-6 ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{section.title}</h3>
                  <p className={`text-sm mb-4 ${
                    isDark ? 'text-slate-300' : 'text-gray-600'
                  }`}>{section.description}</p>
                  <a
                    href={`#${section.id}`}
                    className={`inline-flex items-center text-sm font-medium ${
                      isDark 
                        ? 'text-blue-400 hover:text-blue-300' 
                        : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    View Documentation
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Documentation Content */}
        <div className="mt-16 space-y-16">
          {filteredSections.map((section) => (
            <div key={section.id} id={section.id} className="scroll-mt-24">
              <div className="mb-8">
                <div className="flex items-center gap-4">
                  <section.icon className={`h-10 w-10 ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <h2 className={`text-3xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{section.title}</h2>
                </div>
                <p className={`mt-3 text-xl ${
                  isDark ? 'text-slate-300' : 'text-gray-600'
                }`}>{section.description}</p>
              </div>
              {renderMarkdown(section.content)}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`mt-16 pt-8 border-t ${
          isDark ? 'border-slate-700/50' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              Need help? Contact our developer support
            </p>
            <a
              href="https://github.com/yourusername/mudracore"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center text-sm font-medium ${
                isDark 
                  ? 'text-blue-400 hover:text-blue-300' 
                  : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              View on GitHub
              <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation; 