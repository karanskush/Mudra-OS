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
  const { user } = useAuth();
  
  // Helper function to get user's first name
  const getUserFirstName = () => {
    if (!user) return 'Friend';
    
    const firstName = user.firstName?.trim();
    const first_name = user.first_name?.trim();
    
    let name = '';
    if (firstName) name = firstName;
    else if (first_name) name = first_name;
    else return 'Friend';
    
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

  // Load accounts function
  const loadAvailableAccounts = async () => {
    try {
      const response = await apiClient.getLedgerAccounts();
      if (response) {
        // Update accounts with their current balances
        const accountsWithBalances = await Promise.all(
          response.map(async (account: Account) => {
            try {
              const balanceResponse = await apiClient.getAccountBalance(account.id);
              return {
                ...account,
                balance: balanceResponse.balance
              };
            } catch (error) {
              console.error(`Failed to get balance for account ${account.id}:`, error);
              return account;
            }
          })
        );
        setAvailableAccounts(accountsWithBalances);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
      setAvailableAccounts([]);
    }
  };

  // Handle deposit
  const handleCreateDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');

    try {
      const response = await apiClient.createDeposit(depositForm);
      setResponse(JSON.stringify(response, null, 2));
      
      // Add the new transaction
      setTransactions(prev => [...prev, response as any]);
      
      // Refresh the account balance
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

  // Handle transfer
  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');
    setLastTransferRailInfo(null);
    setShowTransferSuccess(false);

    try {
      // Use REST API only
      const response = await apiClient.createTransfer(transferForm);
      const data = response as any;
      
      if (data.rail) {
        setLastTransferRailInfo(data as TransferRailInfo);
        setTransactions(prev => [...prev, data.transaction]);
        setResponse(JSON.stringify(data, null, 2));
        setShowTransferSuccess(true);
        
        // Refresh account balances
        await loadAvailableAccounts();
        
        toast.success('Transfer created successfully!');
      } else if (data.id) {
        setTransactions(prev => [...prev, data]);
        setResponse(JSON.stringify(data, null, 2));
        setShowTransferSuccess(true);
        
        // Refresh account balances
        await loadAvailableAccounts();
        
        toast.success('Transfer created successfully!');
      } else {
        setResponse(`Error: ${data.error || 'Failed to create transfer'}`);
        toast.error('Failed to create transfer');
      }
    } catch (error) {
      console.error('Transfer creation error:', error);
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error('Failed to create transfer');
    } finally {
      setLoading(false);
    }
  };

  // ... rest of the component code ...

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
                  <div className="absolute top-4 right-4 p-2 bg