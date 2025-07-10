import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CreditCard, 
  TrendingUp, 
  Database, 
  Plus, 
  ArrowRight,
  DollarSign,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  Eye,
  Globe,
  Copy,
  ArrowRightLeft,
  Users,
  Wallet,
  RefreshCw,
  X,
  Check
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from "../lib/api";
import toast from 'react-hot-toast';
import { grpcLedgerService, type LedgerStreamResponse } from '../lib/grpcLedgerService';
import { getSessionUserId } from '../lib/utils';
import { Loader2 } from 'lucide-react';

interface Account {
  id: string;
  account_number: string;
  name: string;
  description: string;
  currency: string;
  type: string;
  balance?: number;
}

interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  description: string;
  entries: any[];
  timestamp?: string;
  created_at?: string;
}

interface TransferRailInfo {
  transaction: Transaction;
  rail: string;
  fee: number;
  fx_rate: number;
  latency: string;
}

interface TrialBalance {
  accounts: Array<{
    account_id: string;
    account_name: string;
    account_number: string;
    balance: number;
    currency: string;
  }>;
  total_debits: number;
  total_credits: number;
  net_balance: number;
}

// --- ConnectAccountFlow Component ---
const COUNTRY_PROVIDERS: Record<string, { id: string; name: string; logo: string }[]> = {
  USA: [
    { id: 'chase', name: 'Chase', logo: 'https://logo.clearbit.com/chase.com' },
    { id: 'bankofamerica', name: 'Bank of America', logo: 'https://logo.clearbit.com/bankofamerica.com' },
    { id: 'wellsfargo', name: 'Wells Fargo', logo: 'https://logo.clearbit.com/wellsfargo.com' },
    { id: 'chime', name: 'Chime', logo: 'https://logo.clearbit.com/chime.com' },
    { id: 'sofi', name: 'SoFi', logo: 'https://logo.clearbit.com/sofi.com' },
    { id: 'plaid', name: 'Plaid', logo: 'https://logo.clearbit.com/plaid.com' },
    { id: 'manual', name: 'Other (Manual Entry)', logo: '' },
  ],
  UK: [
    { id: 'revolut', name: 'Revolut', logo: 'https://logo.clearbit.com/revolut.com' },
    { id: 'monzo', name: 'Monzo', logo: 'https://logo.clearbit.com/monzo.com' },
    { id: 'starling', name: 'Starling Bank', logo: 'https://logo.clearbit.com/starlingbank.com' },
    { id: 'wise', name: 'Wise', logo: 'https://logo.clearbit.com/wise.com' },
    { id: 'lloyds', name: 'Lloyds Bank', logo: 'https://logo.clearbit.com/lloydsbank.com' },
    { id: 'manual', name: 'Other (Manual Entry)', logo: '' },
  ],
  Brazil: [
    { id: 'nubank', name: 'Nubank', logo: 'https://logo.clearbit.com/nubank.com.br' },
    { id: 'bancodobrasil', name: 'Banco do Brasil', logo: 'https://logo.clearbit.com/bb.com.br' },
    { id: 'itau', name: 'Itaú', logo: 'https://logo.clearbit.com/itau.com.br' },
    { id: 'bradesco', name: 'Bradesco', logo: 'https://logo.clearbit.com/bradesco.com.br' },
    { id: 'manual', name: 'Other (Manual Entry)', logo: '' },
  ],
  India: [
    { id: 'hdfc', name: 'HDFC Bank', logo: 'https://logo.clearbit.com/hdfcbank.com' },
    { id: 'icici', name: 'ICICI Bank', logo: 'https://logo.clearbit.com/icicibank.com' },
    { id: 'sbi', name: 'State Bank of India', logo: 'https://logo.clearbit.com/onlinesbi.com' },
    { id: 'razorpay', name: 'Razorpay', logo: 'https://logo.clearbit.com/razorpay.com' },
    { id: 'phonepe', name: 'PhonePe', logo: 'https://logo.clearbit.com/phonepe.com' },
    { id: 'manual', name: 'Other (Manual Entry)', logo: '' },
  ],
  Germany: [
    { id: 'n26', name: 'N26', logo: 'https://logo.clearbit.com/n26.com' },
    { id: 'deutschebank', name: 'Deutsche Bank', logo: 'https://logo.clearbit.com/deutsche-bank.de' },
    { id: 'commerzbank', name: 'Commerzbank', logo: 'https://logo.clearbit.com/commerzbank.com' },
    { id: 'trade-republic', name: 'Trade Republic', logo: 'https://logo.clearbit.com/traderepublic.com' },
    { id: 'manual', name: 'Other (Manual Entry)', logo: '' },
  ],
};

const COUNTRY_LIST = Object.keys(COUNTRY_PROVIDERS);

interface ConnectAccountFlowProps {
  onAccountConnected: () => void;
}

const ConnectAccountFlow: React.FC<ConnectAccountFlowProps> = ({ onAccountConnected }) => {
  const [step, setStep] = useState(1); // 1: country, 2: provider, 3: details, 4: confirm, 5: success
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [showOAuth, setShowOAuth] = useState(false);
  const [oauthSuccess, setOAuthSuccess] = useState(false);
  const [error, setError] = useState<string>('');
  const [accountDetails, setAccountDetails] = useState({
    account_number: '',
    name: '',
    description: '',
    currency: 'USD',
    type: 'bank',
  });
  const [loading, setLoading] = useState(false);

  // Step 1: Select Country
  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
    setSelectedProvider('');
    setError('');
    setStep(2);
  };

  // Step 2: Select Provider
  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    setError('');
    if (providerId === 'manual') {
      setStep(3); // Go to manual entry
    } else {
      setShowOAuth(true); // Simulate OAuth
    }
  };

  // Step 3: Simulate OAuth
  const handleOAuthConnect = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowOAuth(false);
      setOAuthSuccess(true);
      // Simulate fetched details
      const provider = COUNTRY_PROVIDERS[selectedCountry]?.find(p => p.id === selectedProvider);
      setAccountDetails({
        account_number: Math.floor(Math.random() * 1000000000).toString(),
        name: `${provider?.name || 'Account'} Account`,
        description: `Connected via OAuth to ${provider?.name || ''}`,
        currency: 'USD',
        type: 'bank',
      });
      setStep(3);
    }, 1500);
  };

  // Step 3 (Manual) or 4 (OAuth): Enter/Edit Details
  const handleDetailsChange = (field: string, value: string) => {
    setAccountDetails(prev => ({ ...prev, [field]: value }));
  };

  // Step 4/5: Confirm
  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      // Create account using the same pattern as handleCreateAccount
      const response = await apiClient.createLedgerAccount(accountDetails);
      // The response is the account object directly, not wrapped in a data field
      setStep(5);
      setTimeout(() => {
        onAccountConnected();
      }, 1200);
    } catch (err) {
      console.error('Account creation error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Stepper UI
  const steps = [
    'Select Country',
    'Select Provider',
    selectedProvider === 'manual' ? 'Enter Details' : 'Review Details',
    'Confirm',
  ];
  const currentStep = step === 5 ? 4 : step - 1;

  return (
    <div>
      {/* Enhanced Progress Stepper */}
      <div className="relative mb-12">
        <div className="flex items-center justify-between mb-4">
          {steps.map((label, idx) => (
            <div key={label} className={`flex flex-col items-center relative z-10 transition-all duration-300 ${
              idx <= currentStep ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
            }`}>
              <div className={`rounded-2xl h-12 w-12 flex items-center justify-center font-bold border-2 transition-all duration-300 ${
                idx < currentStep 
                  ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-500 text-white shadow-lg scale-110' 
                  : idx === currentStep
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-500 text-white shadow-lg scale-110'
                  : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-400'
              }`}>
                {idx < currentStep ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  idx + 1
                )}
              </div>
              <span className="text-xs mt-2 font-medium text-center max-w-[80px]">{label}</span>
            </div>
          ))}
        </div>
        {/* Animated Progress Line */}
        <div className="absolute top-6 left-6 right-6 h-1 bg-gray-200 dark:bg-slate-600 rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step 1: Enhanced Country Selection */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mx-auto mb-4 flex items-center justify-center">
              <Globe className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Where are you located?</h3>
            <p className="text-gray-600 dark:text-gray-400">Select your country to see available banking partners</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {COUNTRY_LIST.map(country => (
              <button
                key={country}
                onClick={() => handleCountrySelect(country)}
                className="group flex flex-col items-center p-6 bg-white dark:bg-slate-700 rounded-2xl border-2 border-gray-200 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                <div className="w-12 h-12 bg-gray-100 dark:bg-slate-600 rounded-xl mb-3 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <span className="text-2xl">
                    {country === 'USA' && '🇺🇸'}
                    {country === 'UK' && '🇬🇧'}
                    {country === 'Brazil' && '🇧🇷'}
                    {country === 'India' && '🇮🇳'}
                    {country === 'Germany' && '🇩🇪'}
                  </span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {country}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {COUNTRY_PROVIDERS[country]?.length - 1} providers
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Enhanced Provider Selection */}
      {step === 2 && selectedCountry && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-3xl mx-auto mb-4 flex items-center justify-center">
              <CreditCard className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Choose your bank</h3>
            <p className="text-gray-600 dark:text-gray-400">Connect securely with your banking provider in {selectedCountry}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {COUNTRY_PROVIDERS[selectedCountry].map(provider => (
              <button
                key={provider.id}
                onClick={() => handleProviderSelect(provider.id)}
                className={`group flex items-center gap-4 p-6 border-2 rounded-2xl w-full transition-all duration-200 focus:outline-none ${
                  selectedProvider === provider.id 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg' 
                    : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md hover:scale-[1.02]'
                }`}
              >
                <div className="flex-shrink-0">
                  {provider.logo ? (
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-200 dark:border-slate-600 flex items-center justify-center">
                      <img src={provider.logo} alt={provider.name} className="h-10 w-10 object-contain" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center">
                      <Database className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {provider.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {provider.id === 'manual' ? 'Enter details manually' : 'Instant secure connection'}
                  </div>
                  {provider.id !== 'manual' && (
                    <div className="flex items-center gap-1 mt-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">OAuth Supported</span>
                    </div>
                  )}
                </div>
                <ArrowRight className={`h-5 w-5 transition-colors ${
                  selectedProvider === provider.id 
                    ? 'text-blue-500' 
                    : 'text-gray-400 group-hover:text-blue-500'
                }`} />
              </button>
            ))}
          </div>

          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => { setStep(1); setSelectedCountry(''); setSelectedProvider(''); setOAuthSuccess(false); }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 transition-all"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back
            </button>
          </div>
        </div>
      )}

      {/* Simulated OAuth Modal */}
      {showOAuth && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 max-w-sm w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowOAuth(false)}>&times;</button>
            <div className="flex flex-col items-center">
              <img src={COUNTRY_PROVIDERS[selectedCountry]?.find(p => p.id === selectedProvider)?.logo} alt="Provider" className="h-12 w-12 mb-2" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Connect to {COUNTRY_PROVIDERS[selectedCountry]?.find(p => p.id === selectedProvider)?.name}</h3>
              <p className="text-sm text-gray-500 mb-4">Simulated OAuth flow. Click below to authorize.</p>
              <button
                onClick={handleOAuthConnect}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Connecting...' : 'Authorize'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Enter/Edit Details */}
      {(step === 3 && (selectedProvider === 'manual' || oauthSuccess)) && (
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); setStep(4); }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Name</label>
            <input
              type="text"
              value={accountDetails.name}
              onChange={e => handleDetailsChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              value={accountDetails.description}
              onChange={e => handleDetailsChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Currency</label>
              <select
                value={accountDetails.currency}
                onChange={e => handleDetailsChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Type</label>
              <select
                value={accountDetails.type}
                onChange={e => handleDetailsChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              >
                <option value="bank">Bank</option>
                <option value="cash">Cash</option>
                <option value="asset">Asset</option>
                <option value="liability">Liability</option>
                <option value="equity">Equity</option>
                <option value="revenue">Revenue</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Number</label>
            <input
              type="text"
              value={accountDetails.account_number}
              onChange={e => handleDetailsChange('account_number', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              required
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => {
                if (selectedProvider === 'manual') {
                  setStep(2);
                } else {
                  setStep(2); setOAuthSuccess(false);
                }
              }}
              className="px-4 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
            >Back</button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >Next</button>
          </div>
        </form>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Review & Confirm</h3>
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-4 border border-gray-200 dark:border-slate-600">
            <div className="mb-2"><span className="font-medium">Country:</span> {selectedCountry}</div>
            <div className="mb-2"><span className="font-medium">Provider:</span> {selectedProvider === 'manual' ? 'Manual Entry' : COUNTRY_PROVIDERS[selectedCountry]?.find(p => p.id === selectedProvider)?.name}</div>
            <div className="mb-2"><span className="font-medium">Account Name:</span> {accountDetails.name}</div>
            <div className="mb-2"><span className="font-medium">Account Number:</span> {accountDetails.account_number}</div>
            <div className="mb-2"><span className="font-medium">Type:</span> {accountDetails.type}</div>
            <div className="mb-2"><span className="font-medium">Currency:</span> {accountDetails.currency}</div>
            <div className="mb-2"><span className="font-medium">Description:</span> {accountDetails.description}</div>
          </div>
          {error && <div className="text-red-600 mb-2">{error}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-4 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
            >Back</button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >{loading ? 'Connecting...' : 'Connect Account'}</button>
          </div>
        </div>
      )}

      {/* Step 5: Success */}
      {step === 5 && (
        <div className="flex flex-col items-center justify-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
          <h3 className="text-xl font-semibold text-green-700 dark:text-green-400 mb-2">Account Connected!</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Your account has been successfully connected and is now available.</p>
        </div>
      )}
    </div>
  );
};

const LedgerTest: React.FC = () => {
  const { user } = useAuth(); // Add user from auth context
  
  // Helper function to get user's first name
  const getUserFirstName = () => {
    if (!user) return 'Friend';
    
    // Check for actual content (not just empty strings)
    const firstName = user.firstName?.trim();
    const first_name = user.first_name?.trim();
    
    let name = '';
    if (firstName) name = firstName;
    else if (first_name) name = first_name;
    else return 'Friend';
    
    // Capitalize first character
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };
  
  const [loading, setLoading] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [trialBalance, setTrialBalance] = useState<TrialBalance | null>(null);
  const [response, setResponse] = useState<string>('');
  const [accountBalance, setAccountBalance] = useState<null | { balance: number, currency: string }>(null);
  const [activeForm, setActiveForm] = useState<'account' | 'transfer' | 'deposit' | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'transactions' | 'analytics'>('overview');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Form states
  const [accountForm, setAccountForm] = useState({
    account_number: '',
    name: '',
    description: '',
    currency: 'USD',
    type: 'bank'
  });

  const [transferForm, setTransferForm] = useState({
    from_account_id: '',
    to_account_id: '',
    amount: 100.00,
    currency: 'USD',
    description: 'Test transfer'
  });

  const [depositForm, setDepositForm] = useState({
    account_id: '',
    amount: 500.00,
    currency: 'USD',
    description: 'Initial deposit'
  });

  const [balanceForm, setBalanceForm] = useState({
    account_id: ''
  });

  const [lastTransferRailInfo, setLastTransferRailInfo] = useState<TransferRailInfo | null>(null);
  const [showTransferSuccess, setShowTransferSuccess] = useState(false);

  // gRPC streaming state
  const [isGrpcConnected, setIsGrpcConnected] = useState(false);
  const [streamingEvents, setStreamingEvents] = useState<LedgerStreamResponse[]>([]);
  const [realTimeBalances, setRealTimeBalances] = useState<Record<string, number>>({});

  // Initialize gRPC connection
  useEffect(() => {
    const initializeGrpc = async () => {
      try {
        const connected = await grpcLedgerService.connect();
        setIsGrpcConnected(connected);
        
        if (connected) {
          // Start streaming ledger events
          const userId = getSessionUserId();
          await grpcLedgerService.startLedgerStream(userId, handleLedgerStreamEvent);
          
          // Subscribe to all user transactions
          await grpcLedgerService.subscribeToUserTransactions(userId);
          
          console.log('gRPC Ledger streaming started');
        }
      } catch (error) {
        console.error('Failed to initialize gRPC Ledger service:', error);
        setIsGrpcConnected(false);
      }
    };

    initializeGrpc();

    return () => {
      grpcLedgerService.disconnect();
    };
  }, []);

  // Handle gRPC stream events
  const handleLedgerStreamEvent = (event: LedgerStreamResponse) => {
    setStreamingEvents(prev => [...prev, event]);
    
    // Handle different event types
    if (event.event.balanceUpdate) {
      const { accountId, balance, changeAmount, changeType } = event.event.balanceUpdate;
      
      // Update real-time balances
      setRealTimeBalances(prev => ({
        ...prev,
        [accountId]: balance
      }));
      
      // Update available accounts with new balance
      setAvailableAccounts(prev => 
        prev.map(account => 
          account.id === accountId 
            ? { ...account, balance }
            : account
        )
      );
      
      // Show balance update notification
      toast.success(
        `Balance ${changeType.toLowerCase()}: ${changeType === 'CREDIT' ? '+' : '-'}$${changeAmount.toFixed(2)}`,
        { duration: 3000 }
      );
    }
    
    if (event.event.transactionCreated) {
      const { transactionId, amount, status, fromAccountId, toAccountId } = event.event.transactionCreated;
      
      // Add to transactions list
      const newTransaction: Transaction = {
        id: transactionId,
        type: 'transfer',
        status: status.toLowerCase(),
        amount,
        currency: event.event.transactionCreated.currency,
        description: event.event.transactionCreated.description,
        entries: [],
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      
      toast(`Transaction created: ${transactionId}`, {
        duration: 3000,
        icon: 'ℹ️'
      });
    }
    
    if (event.event.transactionStatusUpdate) {
      const { transactionId, status, message } = event.event.transactionStatusUpdate;
      
      // Update transaction status
      setTransactions(prev => 
        prev.map(tx => 
          tx.id === transactionId 
            ? { ...tx, status: status.toLowerCase() }
            : tx
        )
      );
      
      if (status === 'COMPLETED') {
        toast.success(`Transaction completed: ${transactionId}`);
      } else if (status === 'FAILED') {
        toast.error(`Transaction failed: ${message}`);
      }
    }
    
    if (event.event.reconciliationResult) {
      const { accountId, reconciled, variance } = event.event.reconciliationResult;
      
      if (!reconciled && variance !== 0) {
        toast(`Account reconciliation issue: Variance of $${variance.toFixed(2)}`, {
          duration: 5000,
          icon: '⚠️'
        });
      } else {
        toast.success('Account reconciliation completed successfully');
      }
    }
    
    if (event.event.lowBalanceAlert) {
      const { accountId, currentBalance, threshold } = event.event.lowBalanceAlert;
      
      toast.error(
        `Low balance alert: Account ${accountId} has $${currentBalance.toFixed(2)} (below $${threshold.toFixed(2)})`,
        { duration: 10000 }
      );
    }
    
    if (event.event.accountLocked) {
      const { accountId, reason } = event.event.accountLocked;
      
      toast.error(
        `Account locked: ${accountId} - ${reason}`,
        { duration: 10000 }
      );
    }
  };

  // Load available accounts
  const loadAvailableAccounts = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getAvailableAccounts();
      // The response could be a direct array of accounts or an object with accounts property
      const data = response as any;
      
      if (Array.isArray(data)) {
        // Direct array of accounts
        setAvailableAccounts(data);
      } else if (data.accounts && Array.isArray(data.accounts)) {
        // Wrapped in accounts property
        setAvailableAccounts(data.accounts);
      } else if (data.data && Array.isArray(data.data)) {
        // Wrapped in data property
        setAvailableAccounts(data.data);
      } else {
        console.error('Failed to load accounts:', response);
        setAvailableAccounts([]);
      }
    } catch (error) {
      console.error('Error loading available accounts:', error);
      setAvailableAccounts([]);
      // If authentication error, the apiClient will handle token cleanup
    } finally {
      setLoading(false);
    }
  };

  const loadTransactionHistory = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getTransactionHistory(50, 0);
      const data = response as any;
      
      if (data.data && Array.isArray(data.data)) {
        // Transform the backend transaction format to frontend format
        const transformedTransactions = data.data.map((tx: any) => ({
          id: tx.id,
          type: tx.type?.toLowerCase() || 'unknown',
          status: tx.status?.toLowerCase() || 'draft',
          amount: tx.total_amount || 0,
          currency: tx.currency || 'USD',
          description: tx.description || '',
          entries: tx.entries || [],
          timestamp: tx.timestamp || tx.created_at,
          created_at: tx.created_at
        }));
        console.log('Loaded transactions:', transformedTransactions);
        console.log('Draft transactions count:', transformedTransactions.filter((t: any) => t.status === 'draft').length);
        setTransactions(transformedTransactions);
      } else if (Array.isArray(data)) {
        // Direct array of transactions
        const transformedTransactions = data.map((tx: any) => ({
          id: tx.id,
          type: tx.type?.toLowerCase() || 'unknown',
          status: tx.status?.toLowerCase() || 'draft',
          amount: tx.total_amount || 0,
          currency: tx.currency || 'USD',
          description: tx.description || '',
          entries: tx.entries || [],
          timestamp: tx.timestamp || tx.created_at,
          created_at: tx.created_at
        }));
        setTransactions(transformedTransactions);
      } else {
        console.error('Failed to load transactions:', response);
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error loading transaction history:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Load accounts on component mount
  useEffect(() => {
    let mounted = true;
    
    const loadAccounts = async () => {
      if (mounted) {
        await loadAvailableAccounts();
        await loadTransactionHistory();
      }
    };
    
    loadAccounts();
    
    return () => {
      mounted = false;
    };
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');

    try {
      const response = await apiClient.createLedgerAccount(accountForm);
      // The response is the account object directly, not wrapped in a data field
      setResponse(JSON.stringify(response, null, 2));
      // Refresh available accounts after creating new account
      await loadAvailableAccounts();
      setActiveForm(null); // Close the form on success
      toast.success('Account created successfully!');
    } catch (error) {
      console.error('Account creation error:', error);
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error('Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');
    setLastTransferRailInfo(null);
    setShowTransferSuccess(false);

    try {
      if (isGrpcConnected && grpcLedgerService) {
        // Use gRPC streaming service
        const transactionId = await grpcLedgerService.createTransaction({
          fromAccountId: transferForm.from_account_id,
          toAccountId: transferForm.to_account_id,
          amount: transferForm.amount,
          currency: transferForm.currency,
          description: transferForm.description
        });
        
        // Real-time updates will be handled by the stream event handler
        toast(`Transfer initiated: ${transactionId}`, {
          duration: 3000,
          icon: '💸'
        });
        
        setResponse(`Transaction ID: ${transactionId}`);
        setShowTransferSuccess(true);
      } else {
        // Fallback to REST API
        const response = await apiClient.createTransfer(transferForm);
        // The response is the transfer object directly, not wrapped in a data field
        const data = response as any;
        
        // If the response includes rail info, use it
        if (data.rail) {
          setLastTransferRailInfo(data as TransferRailInfo);
          setTransactions([...transactions, data.transaction]);
          setResponse(JSON.stringify(data, null, 2));
          setShowTransferSuccess(true);
          await loadAvailableAccounts();
          toast.success('Transfer created successfully!');
        } else if (data.id) {
          // fallback for old response
          setTransactions([...transactions, data]);
          setResponse(JSON.stringify(data, null, 2));
          setShowTransferSuccess(true);
          await loadAvailableAccounts();
          toast.success('Transfer created successfully!');
        } else {
          setResponse(`Error: ${data.error || 'Failed to create transfer'}`);
          toast.error('Failed to create transfer');
        }
      }
    } catch (error) {
      console.error('Transfer creation error:', error);
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error('Failed to create transfer');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');

    try {
      const response = await apiClient.createDeposit(depositForm);
      // The response is the deposit object directly, not wrapped in a data field
      setResponse(JSON.stringify(response, null, 2));
      setTransactions([...transactions, response as any]);
      // Refresh available accounts after deposit
      await loadAvailableAccounts();
      toast.success('Deposit created successfully!');
    } catch (error) {
      console.error('Deposit creation error:', error);
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error('Failed to create deposit');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');

    try {
      const response = await apiClient.createTestBalance(depositForm);
      // The response is the test balance object directly, not wrapped in a data field
      setResponse(JSON.stringify(response, null, 2));
      setTransactions([...transactions, response as any]);
      // Refresh available accounts after test balance
      await loadAvailableAccounts();
      toast.success('Test balance created successfully!');
    } catch (error) {
      console.error('Test balance creation error:', error);
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error('Failed to create test balance');
    } finally {
      setLoading(false);
    }
  };

  const handleGetBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');
    setAccountBalance(null);

    try {
      const response = await apiClient.getAccountBalance(balanceForm.account_id);
      // The response is the balance object directly, not wrapped in a data field
      const data = response as any;
      setAccountBalance({ balance: data.balance, currency: data.currency });
      setResponse('');
      toast.success('Balance retrieved successfully!');
    } catch (error) {
      console.error('Balance retrieval error:', error);
      setAccountBalance(null);
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error('Failed to retrieve balance');
    } finally {
      setLoading(false);
    }
  };

  const handleGetTrialBalance = async () => {
    setLoading(true);
    setResponse('');

    try {
      const response = await apiClient.authenticatedRequest("/api/v1/ledger/trial-balance", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();
      
      if (response.ok) {
        setTrialBalance(result);
        setResponse(JSON.stringify(result, null, 2));
        toast.success('Trial balance retrieved successfully!');
      } else {
        setResponse(`Error: ${result.error || 'Failed to get trial balance'}`);
        toast.error('Failed to get trial balance');
      }
    } catch (error) {
      console.error('Trial balance retrieval error:', error);
      setResponse(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error('Failed to get trial balance');
    } finally {
      setLoading(false);
    }
  };

  const handlePostTransaction = async (transactionId: string) => {
    setLoading(true);
    setResponse('');

    try {
      const response = await apiClient.authenticatedRequest(`/api/v1/ledger/transactions/${transactionId}/post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      
      if (response.ok) {
        setTransactions(prev => prev.map(tx => 
          tx.id === transactionId 
            ? { ...tx, status: 'posted' }
            : tx
        ));
        setResponse(JSON.stringify(result, null, 2));
      } else {
        setResponse(`Error: ${result.error || 'Failed to post transaction'}`);
      }
    } catch (error) {
      setResponse(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTransactionStatus = async (transactionId: string, currentStatus: string) => {
    setLoading(true);
    setResponse('');

    try {
      const newStatus = currentStatus === 'draft' ? 'posted' : 'draft';
      const endpoint = currentStatus === 'draft' 
        ? `/api/v1/ledger/transactions/${transactionId}/post`
        : `/api/v1/ledger/transactions/${transactionId}/unpost`;

      const response = await apiClient.authenticatedRequest(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      
      if (response.ok) {
        setTransactions(prev => prev.map(tx => 
          tx.id === transactionId 
            ? { ...tx, status: newStatus }
            : tx
        ));
        setResponse(JSON.stringify(result, null, 2));
      } else {
        setResponse(`Error: ${result.error || `Failed to ${currentStatus === 'draft' ? 'post' : 'unpost'} transaction`}`);
      }
    } catch (error) {
      setResponse(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total balance
  const totalBalance = availableAccounts.reduce((total, account) => total + (account.balance || 0), 0);

  // Debug helper function
  const generateAuthenticatedCurl = (endpoint: string, method: string = 'GET', body?: any) => {
    const token = localStorage.getItem('authToken');
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    
    let curlCommand = `curl -X ${method} '${baseUrl}${endpoint}' \\\n`;
    curlCommand += `  -H 'Content-Type: application/json' \\\n`;
    
    if (token) {
      curlCommand += `  -H 'Authorization: Bearer ${token}'`;
    } else {
      curlCommand += `  -H 'Authorization: Bearer YOUR_TOKEN_HERE' # ⚠️ Token not found! Please login first.`;
    }
    
    if (body) {
      curlCommand += ` \\\n  --data-raw '${JSON.stringify(body)}'`;
    }
    
    return curlCommand;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!');
    });
  };

  // Helper function to format date/time
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Bulk approve all draft transactions
  const handleBulkApproveDrafts = async () => {
    const draftTransactions = transactions.filter(tx => tx.status === 'draft');
    
    if (draftTransactions.length === 0) {
      toast.error('No draft transactions to approve');
      return;
    }

    setLoading(true);
    setResponse('');

    try {
      // Process each draft transaction
      const promises = draftTransactions.map(tx => 
        apiClient.authenticatedRequest(`/api/v1/ledger/transactions/${tx.id}/post`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        })
      );

      const results = await Promise.allSettled(promises);
      
      // Count successful and failed operations
      const successful = results.filter(result => result.status === 'fulfilled' && result.value.ok).length;
      const failed = results.length - successful;

      // Update local state for successful operations
      setTransactions(prev => prev.map(tx => 
        tx.status === 'draft' 
          ? { ...tx, status: 'posted' }
          : tx
      ));

      setResponse(`Bulk approve completed: ${successful} approved, ${failed} failed`);
      
      if (successful > 0) {
        toast.success(`Successfully approved ${successful} transactions!`);
      }
      if (failed > 0) {
        toast.error(`${failed} transactions failed to approve`);
      }
    } catch (error) {
      setResponse(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error('Bulk approve failed');
    } finally {
      setLoading(false);
    }
  };

  // New TransferFlow component
  interface TransferFlowProps {
    availableAccounts: Account[];
    onTransferComplete: () => void;
    onCancel: () => void;
    loading: boolean;
  }

  const TransferFlow: React.FC<TransferFlowProps> = ({
    availableAccounts,
    onTransferComplete,
    onCancel,
    loading
  }) => {
    const [step, setStep] = useState(1); // 1: source, 2: destination, 3: amount, 4: confirm
    const [transferData, setTransferData] = useState({
      from_account_id: '',
      to_account_id: '',
      amount: 100.00,
      currency: 'USD',
      description: ''
    });
    const [sourceAccount, setSourceAccount] = useState<Account | null>(null);
    const [destinationAccount, setDestinationAccount] = useState<Account | null>(null);

    // Helper to format account balance
    const formatBalance = (balance?: number, currency = 'USD') => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(balance || 0);
    };

    // Handle source account selection
    const handleSourceSelect = (accountId: string) => {
      const account = availableAccounts.find(a => a.id === accountId);
      setSourceAccount(account || null);
      setTransferData(prev => ({ ...prev, from_account_id: accountId }));
      setStep(2);
    };

    // Handle destination account selection
    const handleDestinationSelect = (accountId: string) => {
      const account = availableAccounts.find(a => a.id === accountId);
      setDestinationAccount(account || null);
      setTransferData(prev => ({ ...prev, to_account_id: accountId }));
      setStep(3);
    };

    // Handle amount and currency input
    const handleAmountSubmit = (amount: number, currency: string) => {
      setTransferData(prev => ({ ...prev, amount, currency }));
      setStep(4);
    };

    // Handle final confirmation
    const handleConfirm = async () => {
      try {
        const response = await apiClient.createTransfer(transferData);
        onTransferComplete();
        toast.success('Transfer completed successfully!');
      } catch (error) {
        console.error('Transfer error:', error);
        toast.error('Failed to complete transfer');
      }
    };

    // Render account selection card
    const AccountCard = ({ account, selected, onClick }: { 
      account: Account, 
      selected: boolean,
      onClick: () => void 
    }) => (
      <div
        onClick={onClick}
        className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
          selected 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{account.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{account.account_number}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatBalance(account.balance, account.currency)}
            </p>
            {selected && (
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>
    );

    // Step 1: Source Account Selection
    if (step === 1) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Select Source Account</h2>
            <p className="text-gray-600 dark:text-gray-400">Choose the account to transfer from</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {availableAccounts.map(account => (
              <AccountCard
                key={account.id}
                account={account}
                selected={account.id === transferData.from_account_id}
                onClick={() => handleSourceSelect(account.id)}
              />
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={onCancel}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    // Step 2: Destination Account Selection
    if (step === 2) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Select Destination</h2>
            <p className="text-gray-600 dark:text-gray-400">Choose where to send the money</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {availableAccounts
              .filter(account => account.id !== transferData.from_account_id)
              .map(account => (
                <AccountCard
                  key={account.id}
                  account={account}
                  selected={account.id === transferData.to_account_id}
                  onClick={() => handleDestinationSelect(account.id)}
                />
              ))}
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Back
            </button>
          </div>
        </div>
      );
    }

    // Step 3: Amount and Currency
    if (step === 3) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Transfer Amount</h2>
            <p className="text-gray-400">How much would you like to send?</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={transferData.amount}
                    onChange={(e) => setTransferData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                    className="w-full pl-12 pr-4 py-3 text-2xl font-semibold bg-slate-700/50 border border-slate-600 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    step="0.01"
                    min="0"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-gray-400">
                    $
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Currency
                </label>
                <select
                  value={transferData.currency}
                  onChange={(e) => setTransferData(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={transferData.description}
                  onChange={(e) => setTransferData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What's this transfer for?"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => handleAmountSubmit(transferData.amount, transferData.currency)}
              className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      );
    }

    // Step 4: Confirmation
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Confirm Transfer</h2>
          <p className="text-gray-600 dark:text-gray-400">Please review the transfer details</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="space-y-6">
            {/* From Account */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">From</p>
                <p className="font-semibold text-gray-900 dark:text-white">{sourceAccount?.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{sourceAccount?.account_number}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Available Balance</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatBalance(sourceAccount?.balance, sourceAccount?.currency)}
                </p>
              </div>
            </div>

            {/* To Account */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">To</p>
                <p className="font-semibold text-gray-900 dark:text-white">{destinationAccount?.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{destinationAccount?.account_number}</p>
              </div>
            </div>

            {/* Amount */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatBalance(transferData.amount, transferData.currency)}
                </p>
              </div>
            </div>

            {/* Description */}
            {transferData.description && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                <p className="text-gray-900 dark:text-white">{transferData.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <button
            onClick={() => setStep(3)}
            className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Back
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-8 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="h-5 w-5" />
                Confirm Transfer
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
      <div className="min-h-screen">
        {/* Header Section */}
      <div className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/50">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Hello {getUserFirstName()}, Welcome to the Ledger!
                </h1>
              </div>


              <p className="text-lg text-gray-600 dark:text-gray-400">
                Enterprise-grade accounting system with real-time operations
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-3">
              {/* Authentication Status Indicator */}
              {user ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Authenticated as {user.firstName}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">Not Authenticated</span>
                </div>
              )}
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">System Online</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: Database },
              { id: 'accounts', label: 'Accounts', icon: CreditCard },
              { id: 'transactions', label: 'Transactions', icon: ArrowRight },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { 
                  setActiveTab(tab.id as any); 
                  setActiveForm(null);
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white/50 dark:bg-slate-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-slate-700/80'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Quick Actions for Overview */}
          {activeTab === 'overview' && !activeForm && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveForm('account')}
                  className="group p-6 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-2xl text-white transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Plus className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold">Connect Account</h4>
                      <p className="text-blue-100 text-sm">Link new bank accounts</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveForm('transfer')}
                  className="group p-6 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-2xl text-white transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <ArrowRight className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold">Transfer Funds</h4>
                      <p className="text-green-100 text-sm">Move money between accounts</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveForm('deposit')}
                  className="group p-6 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-2xl text-white transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold">Make Deposit</h4>
                      <p className="text-purple-100 text-sm">Add funds and see balance update</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && !activeForm && (
            <>
              {/* Enhanced Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="group relative bg-gradient-to-br from-blue-500/10 to-blue-600/20 dark:from-blue-500/20 dark:to-blue-600/30 backdrop-blur-xl rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
                  <div className="absolute top-4 right-4 p-2 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform">
                    <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Accounts</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{availableAccounts.length}</p>
                    <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                      <TrendingUp className="h-3 w-3" />
                      <span>Active connections</span>
                    </div>
                  </div>
                </div>

                <div className="group relative bg-gradient-to-br from-green-500/10 to-green-600/20 dark:from-green-500/20 dark:to-green-600/30 backdrop-blur-xl rounded-2xl p-6 border border-green-200/50 dark:border-green-700/50 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300">
                  <div className="absolute top-4 right-4 p-2 bg-green-500/20 rounded-xl group-hover:scale-110 transition-transform">
                    <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Transactions</p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">{transactions.length}</p>
                    <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                      <CheckCircle className="h-3 w-3" />
                      <span>All time</span>
                    </div>
                  </div>
                </div>

                <div className="group relative bg-gradient-to-br from-purple-500/10 to-purple-600/20 dark:from-purple-500/20 dark:to-purple-600/30 backdrop-blur-xl rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
                  <div className="absolute top-4 right-4 p-2 bg-purple-500/20 rounded-xl group-hover:scale-110 transition-transform">
                    <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Pending Transactions</p>
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                      {transactions.filter(t => t.status === 'draft').length}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Awaiting approval</span>
                    </div>
                  </div>
                </div>

                <div className="group relative bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 dark:from-emerald-500/20 dark:to-emerald-600/30 backdrop-blur-xl rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-700/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
                  <div className="absolute top-4 right-4 p-2 bg-emerald-500/20 rounded-xl group-hover:scale-110 transition-transform">
                    <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Total Volume</p>
                    <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                      ${transactions.reduce((total, tx) => total + tx.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="h-3 w-3" />
                      <span>Transaction value</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Total Balance Card */}
              <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 dark:from-slate-800 dark:via-blue-800 dark:to-purple-800 rounded-3xl p-8 mb-8 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur">
                        <CreditCard className="h-6 w-6 text-white" />
                      </div>
                      <h2 className="text-xl font-semibold text-white">Portfolio Balance</h2>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-200 font-medium">Live</span>
                    </div>
                  </div>
                  
                  <div className="text-center space-y-4">
                    <div className="space-y-2">
                      <div className="text-5xl font-bold text-white tracking-tight">
                        ${availableAccounts.reduce((total, account) => total + (account.balance || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-white/70 text-lg">USD</div>
                    </div>
                    
                    <div className="flex items-center justify-center gap-6 text-sm">
                      <div className="flex items-center gap-2 text-white/80">
                        <Database className="h-4 w-4" />
                        <span>{availableAccounts.length} accounts connected</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-300">
                        <TrendingUp className="h-4 w-4" />
                        <span>Real-time sync</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
                    <button 
                      onClick={() => setActiveTab('transactions')}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      View all →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {transactions.slice(0, 3).map((transaction) => (
                      transaction && typeof transaction.amount === 'number' ? (
                        <div key={transaction.id} className="flex items-center gap-3 p-3 bg-white/50 dark:bg-slate-700/50 rounded-xl">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            transaction.type === 'transfer' ? 'bg-green-500' : 'bg-purple-500'
                          }`}>
                            {transaction.type === 'transfer' ? (
                              <ArrowRight className="h-4 w-4 text-white" />
                            ) : (
                              <DollarSign className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white capitalize">{transaction.type}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.description}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {formatDateTime(transaction.timestamp || transaction.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      ) : null
                    ))}
                    {transactions.length === 0 && (
                      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                        No recent activity
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Account Summary</h3>
                  <div className="space-y-4">
                    {availableAccounts.slice(0, 3).map((account) => (
                      account && typeof account.balance === 'number' ? (
                        <div key={account.id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-700/50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{account.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{account.type}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              ${(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      ) : null
                    ))}
                    {availableAccounts.length === 0 && (
                      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                        No accounts connected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Accounts Tab */}
          {activeTab === 'accounts' && !activeForm && (
            <>
              {/* Accounts Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Management</h2>
                  <p className="text-gray-600 dark:text-gray-400">Manage your connected accounts and view balances</p>
                </div>
                <button
                  onClick={() => setActiveForm('account')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <Plus className="h-5 w-5" />
                  Connect New Account
                </button>
              </div>

              {/* Account Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/20 dark:from-blue-500/20 dark:to-blue-600/30 backdrop-blur-xl rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-500/20 rounded-xl">
                      <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Accounts</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{availableAccounts.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500/10 to-green-600/20 dark:from-green-500/20 dark:to-green-600/30 backdrop-blur-xl rounded-2xl p-6 border border-green-200/50 dark:border-green-700/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-500/20 rounded-xl">
                      <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Balance</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        ${availableAccounts.reduce((total, account) => total + (account.balance || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/20 dark:from-purple-500/20 dark:to-purple-600/30 backdrop-blur-xl rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-500/20 rounded-xl">
                      <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Active Accounts</p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{availableAccounts.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connected Accounts - List-Detail View */}
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-xl">
                <div className="p-6 border-b border-gray-200/50 dark:border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Connected Accounts</h3>
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-2 px-4 py-2 text-sm bg-white/50 dark:bg-slate-700/50 rounded-lg hover:bg-white/80 dark:hover:bg-slate-700/80 transition-all">
                        <TrendingUp className="h-4 w-4" />
                        Sync All
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 text-sm bg-white/50 dark:bg-slate-700/50 rounded-lg hover:bg-white/80 dark:hover:bg-slate-700/80 transition-all">
                        Export
                      </button>
                    </div>
                  </div>
                </div>

                {availableAccounts.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="relative mb-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-3xl mx-auto flex items-center justify-center">
                        <Database className="h-10 w-10 text-blue-500 dark:text-blue-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">No accounts connected</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      Connect your bank accounts to start managing your finances with our ledger system
                    </p>
                    <button
                      onClick={() => setActiveForm('account')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
                    >
                      <Plus className="h-5 w-5" />
                      Connect Your First Account
                    </button>
                  </div>
                ) : (
                  <div className="flex h-[600px]">
                    {/* Accounts List - Left Side */}
                    <div className="w-1/3 border-r border-gray-200/50 dark:border-slate-700/50 overflow-y-auto">
                      <div className="p-4 space-y-2">
                        {availableAccounts.map((account) => (
                          account && typeof account.balance === 'number' ? (
                            <button
                              key={account.id}
                              onClick={() => setSelectedAccount(account)}
                              className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                                selectedAccount?.id === account.id
                                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-300/50 dark:border-blue-600/50'
                                  : 'bg-white/30 dark:bg-slate-700/30 hover:bg-white/50 dark:hover:bg-slate-700/50 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  selectedAccount?.id === account.id
                                    ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                                    : 'bg-gradient-to-br from-gray-400 to-gray-500'
                                }`}>
                                  <CreditCard className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className={`font-semibold truncate ${
                                    selectedAccount?.id === account.id
                                      ? 'text-blue-900 dark:text-blue-100'
                                      : 'text-gray-900 dark:text-white'
                                  }`}>
                                    {account.name}
                                  </h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    #{account.account_number}
                                  </p>
                                  {account.balance !== undefined && typeof account.balance === 'number' && (
                                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                      ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                </div>
                              </div>
                            </button>
                          ) : null
                        ))}
                      </div>
                    </div>

                    {/* Account Details - Right Side */}
                    <div className="flex-1 p-6">
                      {selectedAccount ? (
                        <div className="h-full">
                          {/* Account Header */}
                          <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                                <CreditCard className="h-8 w-8 text-white" />
                              </div>
                              <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedAccount.name}</h2>
                                <p className="text-gray-500 dark:text-gray-400">Account #{selectedAccount.account_number}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">Active</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setActiveForm('transfer');
                                  setTransferForm(prev => ({
                                    ...prev,
                                    from_account_id: selectedAccount.id
                                  }));
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                              >
                                <ArrowRight className="h-4 w-4" />
                                Transfer
                              </button>
                              <button
                                onClick={() => {
                                  setActiveForm('deposit');
                                  setDepositForm(prev => ({
                                    ...prev,
                                    account_id: selectedAccount.id
                                  }));
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
                              >
                                <DollarSign className="h-4 w-4" />
                                Deposit
                              </button>
                            </div>
                          </div>

                          {/* Account Balance */}
                          {selectedAccount.balance !== undefined && typeof selectedAccount.balance === 'number' && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800 mb-8">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Available Balance</p>
                                  <p className="text-4xl font-bold text-green-900 dark:text-green-100">
                                    ${selectedAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </p>
                                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">{selectedAccount.currency}</p>
                                </div>
                                <div className="text-green-600 dark:text-green-400">
                                  <TrendingUp className="h-12 w-12" />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Account Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white/50 dark:bg-slate-700/50 rounded-xl p-6 border border-white/20 dark:border-slate-600/50">
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Account Information</h3>
                              <div className="space-y-3">
                                <div>
                                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Type</label>
                                  <div className="mt-1">
                                    <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium capitalize">
                                      {selectedAccount.type}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
                                  <div className="mt-1">
                                    <span className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
                                      {selectedAccount.currency}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                  <p className="mt-1 text-gray-600 dark:text-gray-400">{selectedAccount.description}</p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-white/50 dark:bg-slate-700/50 rounded-xl p-6 border border-white/20 dark:border-slate-600/50">
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                              <div className="space-y-3">
                                <button
                                  onClick={() => {
                                    setBalanceForm({account_id: selectedAccount.id});
                                    handleGetBalance(new Event('submit') as any);
                                  }}
                                  className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30 transition-all"
                                >
                                  <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                  <span className="text-blue-700 dark:text-blue-300 font-medium">Refresh Balance</span>
                                </button>
                                <button className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-800/30 dark:hover:to-purple-700/30 transition-all">
                                  <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                  <span className="text-purple-700 dark:text-purple-300 font-medium">View Transactions</span>
                                </button>
                                <button className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg hover:from-green-100 hover:to-green-200 dark:hover:from-green-800/30 dark:hover:to-green-700/30 transition-all">
                                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                                  <span className="text-green-700 dark:text-green-300 font-medium">Export Statement</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl mx-auto flex items-center justify-center mb-4">
                              <CreditCard className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Select an Account</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                              Choose an account from the list to view its details and manage transactions
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && !activeForm && (
            <>
              {/* Transactions Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction History</h2>
                  <p className="text-gray-600 dark:text-gray-400">View and manage all your financial transactions</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={loadTransactionHistory}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
                  >
                    <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Loading...' : 'Refresh'}
                  </button>
                  {transactions.filter(tx => tx.status === 'draft').length > 0 && (
                    <button
                      onClick={handleBulkApproveDrafts}
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
                    >
                      <CheckCircle className="h-5 w-5" />
                      {loading ? 'Approving...' : `Approve All Drafts (${transactions.filter(tx => tx.status === 'draft').length})`}
                    </button>
                  )}
                  <button
                    onClick={() => setActiveForm('deposit')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    <DollarSign className="h-5 w-5" />
                    Deposit
                  </button>
                  <button
                    onClick={() => setActiveForm('transfer')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    <ArrowRight className="h-5 w-5" />
                    Transfer
                  </button>
                </div>
              </div>

              {/* Transaction Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/20 dark:from-green-500/20 dark:to-green-600/30 backdrop-blur-xl rounded-2xl p-6 border border-green-200/50 dark:border-green-700/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-xl">
                      <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Transactions</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">{transactions.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/20 dark:from-blue-500/20 dark:to-blue-600/30 backdrop-blur-xl rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-xl">
                      <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Posted</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {transactions.filter(t => t.status === 'posted').length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/20 dark:from-yellow-500/20 dark:to-yellow-600/30 backdrop-blur-xl rounded-2xl p-6 border border-yellow-200/50 dark:border-yellow-700/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-xl">
                      <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Pending</p>
                      <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                        {transactions.filter(t => t.status === 'draft').length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 dark:from-emerald-500/20 dark:to-emerald-600/30 backdrop-blur-xl rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-700/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-xl">
                      <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Total Volume</p>
                      <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                        ${transactions.reduce((total, tx) => total + tx.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Filters and Search */}
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl mb-8">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      className="w-full px-4 py-3 bg-white/50 dark:bg-slate-700/50 border border-white/20 dark:border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                  <div className="flex gap-3">
                    <select className="px-4 py-3 bg-white/50 dark:bg-slate-700/50 border border-white/20 dark:border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white">
                      <option>All Types</option>
                      <option>Transfer</option>
                      <option>Deposit</option>
                    </select>
                    <select className="px-4 py-3 bg-white/50 dark:bg-slate-700/50 border border-white/20 dark:border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white">
                      <option>All Status</option>
                      <option>Posted</option>
                      <option>Draft</option>
                    </select>
                    <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all">
                      Export
                    </button>
                  </div>
                </div>
              </div>

              {/* Transactions List */}
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-xl">
                <div className="p-6">
                  {transactions.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="relative mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-3xl mx-auto flex items-center justify-center">
                          <Activity className="h-10 w-10 text-green-500 dark:text-green-400" />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">No transactions yet</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        Start by creating your first transaction to see your financial activity here
                      </p>
                      <div className="flex gap-4 justify-center">
                        <button
                          onClick={() => setActiveForm('transfer')}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
                        >
                          <ArrowRight className="h-5 w-5" />
                          Create Transfer
                        </button>
                        <button
                          onClick={() => setActiveForm('deposit')}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                        >
                          <DollarSign className="h-5 w-5" />
                          Make Deposit
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full bg-white/50 dark:bg-slate-700/50 backdrop-blur border border-white/20 dark:border-slate-600/50 rounded-2xl">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-slate-600">
                            <th className="px-6 py-2.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Type</th>
                            <th className="px-6 py-2.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Description</th>
                            <th className="px-6 py-2.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                            <th className="px-6 py-2.5 text-right text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                            <th className="px-6 py-2.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Date/Time</th>
                            <th className="px-6 py-2.5 text-center text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-600">
                          {transactions.map((transaction) => (
                            transaction && typeof transaction.amount === 'number' ? (
                              <tr key={transaction.id} className="hover:bg-white/80 dark:hover:bg-slate-700/80 transition-colors">
                                <td className="px-6 py-2.5">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                      transaction.type === 'transfer' 
                                        ? 'bg-gradient-to-br from-green-500 to-green-600'
                                        : 'bg-gradient-to-br from-purple-500 to-purple-600'
                                    }`}>
                                      {transaction.type === 'transfer' ? (
                                        <ArrowRight className="h-4 w-4 text-white" />
                                      ) : (
                                        <DollarSign className="h-4 w-4 text-white" />
                                      )}
                                    </div>
                                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                                      {transaction.type}
                                    </span>
                                  </div>
                                </td>

                                <td className="px-6 py-2.5 text-gray-600 dark:text-gray-300">
                                  {transaction.description}
                                </td>
                                <td className="px-6 py-2.5">
                                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                                    transaction.status === 'posted' 
                                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' 
                                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
                                  }`}>
                                    {transaction.status === 'posted' ? (
                                      <>
                                        <CheckCircle className="h-3 w-3" />
                                        Posted
                                      </>
                                    ) : (
                                      <>
                                        <Clock className="h-3 w-3" />
                                        Draft
                                      </>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-2.5 text-right">
                                  <div className="text-gray-900 dark:text-white font-medium">
                                    ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{transaction.currency}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-2.5 text-gray-600 dark:text-gray-300">
                                  <div className="text-sm">
                                    {formatDateTime(transaction.timestamp || transaction.created_at)}
                                  </div>
                                </td>
                                <td className="px-6 py-2.5 text-center">
                                  <button
                                    onClick={() => handleToggleTransactionStatus(transaction.id, transaction.status)}
                                    disabled={loading}
                                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg disabled:opacity-50 transition-all text-sm ${
                                      transaction.status === 'draft'
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                                        : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
                                    }`}
                                  >
                                    {transaction.status === 'draft' ? (
                                      <>
                                        <CheckCircle className="h-3 w-3" />
                                        {loading ? 'Posting...' : 'Approve'}
                                      </>
                                    ) : (
                                      <>
                                        <Clock className="h-3 w-3" />
                                        {loading ? 'Unposting...' : 'Unpost'}
                                      </>
                                    )}
                                  </button>
                                </td>
                              </tr>
                            ) : null
                          ))}
                        </tbody>
                      </table>
                      {transactions.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          No transactions found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && !activeForm && (
            <>
              <div className="text-center py-16">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-3xl mx-auto flex items-center justify-center">
                    <TrendingUp className="h-10 w-10 text-purple-500 dark:text-purple-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Analytics Dashboard</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Advanced financial analytics and insights will be available here soon
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  Coming Soon
                </div>
              </div>
            </>
          )}

          {/* Enhanced Account Connection Form */}
          {activeForm === 'account' && (
            <div className="max-w-4xl mx-auto">
              {/* Modern Header with Progress */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-slate-700/50 shadow-2xl mb-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <Database className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Connect Your Account</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">Securely link your bank account to get started</p>
                </div>

                {/* Trust Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-700 dark:text-green-300 text-sm">Bank-Level Security</p>
                      <p className="text-xs text-green-600 dark:text-green-400">256-bit encryption</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-700 dark:text-blue-300 text-sm">Instant Connection</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">Real-time verification</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-purple-700 dark:text-purple-300 text-sm">Read-Only Access</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400">We never store passwords</p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Multi-Step Connect Account Flow */}
                <ConnectAccountFlow onAccountConnected={() => { loadAvailableAccounts(); setActiveForm(null); }} />
              </div>
            </div>
          )}

          {/* Enhanced Transfer Form */}
          {activeForm === 'transfer' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-slate-700/50 shadow-2xl">
                <TransferFlow
                  availableAccounts={availableAccounts}
                  onTransferComplete={() => {
                    setActiveForm(null);
                    loadAvailableAccounts();
                    loadTransactionHistory();
                  }}
                  onCancel={() => setActiveForm(null)}
                  loading={loading}
                />
              </div>
            </div>
          )}

          {activeForm === 'deposit' && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-6">
                <DollarSign className="h-5 w-5 text-purple-500" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create Deposit</h2>
              </div>
              <form onSubmit={handleCreateDeposit} className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account
                  </label>
                  <select
                    value={depositForm.account_id}
                    onChange={(e) => setDepositForm({...depositForm, account_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    required
                  >
                    <option value="">Select account</option>
                    {availableAccounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name} ({account.account_number})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount
                    </label>
                    <input
                      type="number"
                      value={depositForm.amount}
                      onChange={(e) => setDepositForm({...depositForm, amount: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Currency
                    </label>
                    <select
                      value={depositForm.currency}
                      onChange={(e) => setDepositForm({...depositForm, currency: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={depositForm.description}
                    onChange={(e) => setDepositForm({...depositForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-purple-600 text-white py-2 px-6 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition-colors flex-1"
                  >
                    {loading ? 'Creating...' : 'Create Deposit'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateTestBalance}
                    disabled={loading}
                    className="bg-orange-600 text-white py-2 px-6 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 transition-colors flex-1"
                  >
                    {loading ? 'Creating...' : 'Get Test Balance'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Response Display - Moving it outside the transactions view */}
          {response && (
            <div className="max-w-4xl mx-auto mt-6">
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 text-gray-900 dark:text-white px-6 py-4 rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">API Response</h3>
                  <button
                    onClick={() => setResponse('')}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <pre className="text-sm whitespace-pre-wrap">{response}</pre>
              </div>
            </div>
          )}


        </div>
    </div>
  );
};

export default LedgerTest; 