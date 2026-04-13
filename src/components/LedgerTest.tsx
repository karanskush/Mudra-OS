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
  Wallet
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from "../lib/api";
import toast from 'react-hot-toast';
import { grpcLedgerService, type LedgerStreamResponse } from '../lib/grpcLedgerService';
import { getSessionUserId } from '../lib/utils';

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
  reference: string;
  entries: any[];
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
              idx <= currentStep ? 'text-[#68BA7F]' : 'text-slate-500'
            }`}>
              <div className={`rounded-2xl h-12 w-12 flex items-center justify-center font-bold border-2 transition-all duration-300 ${
                idx < currentStep 
                  ? 'bg-gradient-to-br from-brand-500 to-brand-400 border-brand-500 text-white shadow-lg scale-110' 
                  : idx === currentStep
                  ? 'bg-gradient-to-br from-[#2E6F40] to-[#68BA7F] border-blue-500 text-white shadow-lg scale-110'
                  : 'border-gray-300 border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-gray-400'
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
        <div className="absolute top-6 left-6 right-6 h-1 bg-[rgba(255,255,255,0.06)] rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-[#2E6F40] via-[#68BA7F] to-[#CFFFDC] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step 1: Enhanced Country Selection */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#2E6F40] to-[#68BA7F] rounded-3xl mx-auto mb-4 flex items-center justify-center">
              <Globe className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Where are you located?</h3>
            <p className="text-gray-600 dark:text-gray-400">Select your country to see available banking partners</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {COUNTRY_LIST.map(country => (
              <button
                key={country}
                onClick={() => handleCountrySelect(country)}
                className="group flex flex-col items-center p-6 bg-[rgba(255,255,255,0.04)] rounded-2xl border-2 border-gray-200 border-[rgba(255,255,255,0.08)] hover:border-[#68BA7F] transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                <div className="w-12 h-12 bg-[rgba(255,255,255,0.05)] rounded-xl mb-3 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-[rgba(46,111,64,0.12)] transition-colors">
                  <span className="text-2xl">
                    {country === 'USA' && '🇺🇸'}
                    {country === 'UK' && '🇬🇧'}
                    {country === 'Brazil' && '🇧🇷'}
                    {country === 'India' && '🇮🇳'}
                    {country === 'Germany' && '🇩🇪'}
                  </span>
                </div>
                <span className="font-semibold text-white group-hover:text-[#68BA7F] dark:group-hover:text-[#68BA7F] transition-colors">
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
            <div className="w-20 h-20 bg-gradient-to-br from-[#2E6F40] to-[#68BA7F] rounded-3xl mx-auto mb-4 flex items-center justify-center">
              <CreditCard className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Choose your bank</h3>
            <p className="text-gray-600 dark:text-gray-400">Connect securely with your banking provider in {selectedCountry}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {COUNTRY_PROVIDERS[selectedCountry].map(provider => (
              <button
                key={provider.id}
                onClick={() => handleProviderSelect(provider.id)}
                className={`group flex items-center gap-4 p-6 border-2 rounded-2xl w-full transition-all duration-200 focus:outline-none ${
                  selectedProvider === provider.id 
                    ? 'border-blue-500 bg-[rgba(46,111,64,0.08)] shadow-lg' 
                    : 'border-gray-200 border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] hover:border-[rgba(104,186,127,0.40)] hover:shadow-md hover:scale-[1.02]'
                }`}
              >
                <div className="flex-shrink-0">
                  {provider.logo ? (
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-200 border-[rgba(255,255,255,0.08)] flex items-center justify-center">
                      <img src={provider.logo} alt={provider.name} className="h-10 w-10 object-contain" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center">
                      <Database className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-white text-lg group-hover:text-[#68BA7F] dark:group-hover:text-[#68BA7F] transition-colors">
                    {provider.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {provider.id === 'manual' ? 'Enter details manually' : 'Instant secure connection'}
                  </div>
                  {provider.id !== 'manual' && (
                    <div className="flex items-center gap-1 mt-2">
                      <div className="w-2 h-2 bg-brand-300 rounded-full"></div>
                      <span className="text-xs text-brand-400 dark:text-brand-300 font-medium">OAuth Supported</span>
                    </div>
                  )}
                </div>
                <ArrowRight className={`h-5 w-5 transition-colors ${
                  selectedProvider === provider.id 
                    ? 'text-[#68BA7F]' 
                    : 'text-gray-400 group-hover:text-[#68BA7F]'
                }`} />
              </button>
            ))}
          </div>

          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => { setStep(1); setSelectedCountry(''); setSelectedProvider(''); setOAuthSuccess(false); }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-300 border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600 transition-all"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back
            </button>
          </div>
        </div>
      )}

      {/* Simulated OAuth Modal */}
      {showOAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-[rgba(255,255,255,0.04)] rounded-lg shadow-lg p-8 max-w-sm w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowOAuth(false)}>&times;</button>
            <div className="flex flex-col items-center">
              <img src={COUNTRY_PROVIDERS[selectedCountry]?.find(p => p.id === selectedProvider)?.logo} alt="Provider" className="h-12 w-12 mb-2" />
              <h3 className="text-lg font-semibold mb-2 text-white">Connect to {COUNTRY_PROVIDERS[selectedCountry]?.find(p => p.id === selectedProvider)?.name}</h3>
              <p className="text-sm text-gray-500 mb-4">Simulated OAuth flow. Click below to authorize.</p>
              <button
                onClick={handleOAuthConnect}
                disabled={loading}
                className="bg-[#2E6F40] text-white px-6 py-2 rounded-md hover:bg-[#253D2C] disabled:opacity-50 transition-colors"
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
            <label className="block text-sm font-medium text-slate-300 mb-2">Account Name</label>
            <input
              type="text"
              value={accountDetails.name}
              onChange={e => handleDetailsChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 border-[rgba(255,255,255,0.08)] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgba(46,111,64,0.35)] bg-[rgba(255,255,255,0.05)] text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              value={accountDetails.description}
              onChange={e => handleDetailsChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 border-[rgba(255,255,255,0.08)] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgba(46,111,64,0.35)] bg-[rgba(255,255,255,0.05)] text-white"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Currency</label>
              <select
                value={accountDetails.currency}
                onChange={e => handleDetailsChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 border-[rgba(255,255,255,0.08)] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgba(46,111,64,0.35)] bg-[rgba(255,255,255,0.05)] text-white"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Account Type</label>
              <select
                value={accountDetails.type}
                onChange={e => handleDetailsChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 border-[rgba(255,255,255,0.08)] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgba(46,111,64,0.35)] bg-[rgba(255,255,255,0.05)] text-white"
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
            <label className="block text-sm font-medium text-slate-300 mb-2">Account Number</label>
            <input
              type="text"
              value={accountDetails.account_number}
              onChange={e => handleDetailsChange('account_number', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 border-[rgba(255,255,255,0.08)] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgba(46,111,64,0.35)] bg-[rgba(255,255,255,0.05)] text-white"
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
              className="px-4 py-2 rounded-md border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] text-slate-300 hover:bg-[rgba(255,255,255,0.08)]"
            >Back</button>
            <button
              type="submit"
              className="bg-[#2E6F40] text-white px-6 py-2 rounded-md hover:bg-[#253D2C] transition-colors"
            >Next</button>
          </div>
        </form>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Review & Confirm</h3>
          <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-4 mb-4 border border-gray-200 border-[rgba(255,255,255,0.08)]">
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
              className="px-4 py-2 rounded-md border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] text-slate-300 hover:bg-[rgba(255,255,255,0.08)]"
            >Back</button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="bg-[#2E6F40] text-white px-6 py-2 rounded-md hover:bg-[#253D2C] disabled:opacity-50 transition-colors"
            >{loading ? 'Connecting...' : 'Connect Account'}</button>
          </div>
        </div>
      )}

      {/* Step 5: Success */}
      {step === 5 && (
        <div className="flex flex-col items-center justify-center py-8">
          <CheckCircle className="h-12 w-12 text-brand-400 mb-2" />
          <h3 className="text-xl font-semibold text-brand-400 dark:text-brand-300 mb-2">Account Connected!</h3>
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
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'transactions' | 'journal' | 'reports' | 'analytics'>('overview');
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
    description: 'Test transfer',
    reference: ''
  });

  const [depositForm, setDepositForm] = useState({
    account_id: '',
    amount: 500.00,
    currency: 'USD',
    description: 'Initial deposit',
    reference: ''
  });

  // New state for advanced ledger features
  const [chartOfAccounts, setChartOfAccounts] = useState<any[]>([]);
  const [balanceSheet, setBalanceSheet] = useState<any>(null);
  const [incomeStatement, setIncomeStatement] = useState<any>(null);
  const [cashFlow, setCashFlow] = useState<any>(null);
  const [trialBalanceData, setTrialBalanceData] = useState<any>(null);
  const [activeReport, setActiveReport] = useState<'balance-sheet' | 'income-statement' | 'cash-flow' | 'trial-balance'>('balance-sheet');
  const [journalLines, setJournalLines] = useState<{ account_id: string; type: 'debit' | 'credit'; amount: number }[]>([
    { account_id: '', type: 'debit', amount: 0 },
    { account_id: '', type: 'credit', amount: 0 },
  ]);
  const [journalDesc, setJournalDesc] = useState('');
  const [journalRef, setJournalRef] = useState('');

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
        reference: event.event.transactionCreated.reference,
        entries: []
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

  // Load accounts on component mount
  useEffect(() => {
    let mounted = true;
    
    const loadAccounts = async () => {
      if (mounted) {
        await loadAvailableAccounts();
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
          description: transferForm.description,
          reference: transferForm.reference
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
      const data = (response as any);
      const txn = data.data || data;
      setResponse(JSON.stringify(txn, null, 2));
      setTransactions(prev => [txn, ...prev]);
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
      const response = await apiClient.authenticatedRequest("/api/ledger/trial-balance", {
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
      const response = await apiClient.authenticatedRequest(`/api/ledger/transactions/${transactionId}/post`, {
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

  // ── New handlers for advanced ledger features ──────────────────────────────

  const handleGetChartOfAccounts = async () => {
    try {
      const res = await apiClient.getChartOfAccounts();
      const data = (res as any);
      setChartOfAccounts(data.data || data);
      toast.success('Chart of accounts loaded');
    } catch (e) {
      toast.error('Failed to load chart of accounts');
    }
  };

  const handleGetBalanceSheet = async () => {
    try {
      const res = await apiClient.getBalanceSheet();
      setBalanceSheet((res as any).data || res);
      toast.success('Balance sheet loaded');
    } catch (e) {
      toast.error('Failed to load balance sheet');
    }
  };

  const handleGetIncomeStatement = async () => {
    try {
      const res = await apiClient.getIncomeStatement();
      setIncomeStatement((res as any).data || res);
      toast.success('Income statement loaded');
    } catch (e) {
      toast.error('Failed to load income statement');
    }
  };

  const handleGetCashFlow = async () => {
    try {
      const res = await apiClient.getCashFlow();
      setCashFlow(res as any);
      toast.success('Cash flow loaded');
    } catch (e) {
      toast.error('Failed to load cash flow');
    }
  };

  const handleGetTrialBalanceData = async () => {
    try {
      const res = await apiClient.getTrialBalance();
      setTrialBalanceData((res as any).data !== undefined ? res : null);
      toast.success('Trial balance loaded');
    } catch (e) {
      toast.error('Failed to load trial balance');
    }
  };

  const handleReverseTransaction = async (txnId: string) => {
    if (!confirm('Reverse this transaction? This cannot be undone.')) return;
    try {
      await apiClient.reverseTransaction(txnId);
      toast.success('Transaction reversed');
      // Refresh transaction list
      if (selectedAccount) {
        const res = await apiClient.getAccountTransactions(selectedAccount.id);
        const d = (res as any);
        setTransactions(d.data || d);
      }
    } catch (e: any) {
      toast.error(`Reversal failed: ${e.message}`);
    }
  };

  const handleCreateJournalEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.createJournalEntry({
        description: journalDesc,
        reference: journalRef,
        currency: 'USD',
        lines: journalLines.filter(l => l.account_id && l.amount > 0),
      });
      setResponse(JSON.stringify(res, null, 2));
      toast.success('Journal entry created and posted');
      setJournalLines([
        { account_id: '', type: 'debit', amount: 0 },
        { account_id: '', type: 'credit', amount: 0 },
      ]);
      setJournalDesc('');
      setJournalRef('');
      loadAvailableAccounts();
    } catch (e: any) {
      toast.error(`Journal entry failed: ${e.message}`);
      setResponse(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────

  // Calculate total balance
  const totalBalance = availableAccounts.reduce((total, account) => total + (account.balance || 0), 0);

  // Debug helper function
  const generateAuthenticatedCurl = (endpoint: string, method: string = 'GET', body?: any) => {
    const token = localStorage.getItem('authToken');
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:47291';
    
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

  return (
    <div className="flex h-screen bg-surface-base overflow-hidden" style={{fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"}}>

      {/* ─── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-60 flex-shrink-0 flex flex-col bg-surface-sidebar border-r border-white/[0.06] z-20">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/[0.06]">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center shadow-lg shadow-brand-950/40">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-none">Ledger</p>
            <p className="text-brand-300/70 text-[10px] mt-0.5 font-medium tracking-wider uppercase">Enterprise</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {[
            { id: 'overview',      label: 'Overview',       icon: Database,       desc: 'Dashboard' },
            { id: 'accounts',      label: 'Accounts',       icon: CreditCard,     desc: 'Manage accounts' },
            { id: 'transactions',  label: 'Transactions',   icon: ArrowRightLeft, desc: 'Transaction history' },
            { id: 'journal',       label: 'Journal Entry',  icon: BookOpen,       desc: 'Manual entries' },
            { id: 'reports',       label: 'Reports',        icon: TrendingUp,     desc: 'Financial reports' },
            { id: 'analytics',     label: 'Analytics',      icon: Activity,       desc: 'Insights' },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setActiveForm(null);
                  if (tab.id === 'journal') loadAvailableAccounts();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group ${
                  isActive
                    ? 'bg-brand-500/10 text-brand-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-brand-300' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className="text-sm font-medium">{tab.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-300" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-3 border-t border-white/[0.06] space-y-1">
          <button
            onClick={() => setActiveForm('account')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all group"
          >
            <Plus className="w-4 h-4 text-slate-500 group-hover:text-brand-300 transition-colors" />
            <span className="text-sm font-medium">New Account</span>
          </button>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03]">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-xs font-bold text-white">
              {getUserFirstName().charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{getUserFirstName()}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-300" />
                <p className="text-[10px] text-slate-500">Active session</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main area ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/[0.06] bg-surface-sidebar/60 backdrop-blur-xl flex-shrink-0">
          <div>
            <h1 className="text-white font-semibold text-base">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              {activeTab === 'overview' && 'Your financial overview'}
              {activeTab === 'accounts' && `${availableAccounts.length} accounts connected`}
              {activeTab === 'transactions' && `${transactions.length} transactions`}
              {activeTab === 'journal' && 'Double-entry bookkeeping'}
              {activeTab === 'reports' && 'Financial statements'}
              {activeTab === 'analytics' && 'Performance insights'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
              <span className="text-xs font-medium text-brand-300">Live</span>
            </div>
            {/* Quick actions */}
            <button
              onClick={() => setActiveForm('transfer')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-medium transition-all"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Transfer
            </button>
            <button
              onClick={() => setActiveForm('deposit')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-400 text-white text-xs font-semibold transition-all shadow-lg shadow-brand-950/30"
            >
              <Plus className="w-3.5 h-3.5" />
              Deposit
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* OVERVIEW TAB                                                    */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'overview' && !activeForm && (
            <>
              {/* KPI row */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Total Balance',
                    value: `$${availableAccounts.reduce((t, a) => t + (a.balance || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                    sub: `${availableAccounts.length} account${availableAccounts.length !== 1 ? 's' : ''}`,
                    icon: Wallet,
                    color: 'brand',
                    big: true,
                  },
                  {
                    label: 'Transactions',
                    value: transactions.length.toString(),
                    sub: 'All time',
                    icon: Activity,
                    color: 'blue',
                  },
                  {
                    label: 'Pending',
                    value: transactions.filter(t => t.status === 'draft' || t.status === 'pending').length.toString(),
                    sub: 'Awaiting post',
                    icon: Clock,
                    color: 'amber',
                  },
                  {
                    label: 'Volume',
                    value: `$${transactions.reduce((t, tx) => t + (tx.amount || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                    sub: 'Total processed',
                    icon: TrendingUp,
                    color: 'purple',
                  },
                ].map((kpi) => {
                  const Icon = kpi.icon;
                  const colorMap: Record<string, string> = {
                    brand: 'bg-brand-500/10 text-brand-300 border-brand-500/20',
                    blue:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
                    amber:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    purple:  'bg-purple-500/10 text-purple-400 border-purple-500/20',
                  };
                  const iconColor: Record<string, string> = {
                    brand: 'text-brand-300', blue: 'text-blue-400', amber: 'text-amber-400', purple: 'text-purple-400',
                  };
                  return (
                    <div key={kpi.label} className="bg-surface-raised rounded-2xl p-5 border border-white/[0.06] hover:border-white/[0.10] transition-all group">
                      <div className="flex items-start justify-between mb-4">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                        <div className={`p-2 rounded-lg border ${colorMap[kpi.color]}`}>
                          <Icon className={`w-3.5 h-3.5 ${iconColor[kpi.color]}`} />
                        </div>
                      </div>
                      <p className={`font-bold text-white mb-1 ${kpi.big ? 'text-2xl' : 'text-2xl'}`}>{kpi.value}</p>
                      <p className="text-xs text-slate-500">{kpi.sub}</p>
                    </div>
                  );
                })}
              </div>

              {/* Main 2-col grid */}
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
                {/* Recent transactions — wider */}
                <div className="xl:col-span-3 bg-surface-raised rounded-2xl border border-white/[0.06] overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                    <div>
                      <p className="text-sm font-semibold text-white">Recent Transactions</p>
                      <p className="text-xs text-slate-500 mt-0.5">Latest activity</p>
                    </div>
                    <button onClick={() => setActiveTab('transactions')} className="text-xs text-brand-300 hover:text-brand-200 font-medium transition-colors">
                      View all →
                    </button>
                  </div>
                  <div className="divide-y divide-white/[0.04]">
                    {transactions.length === 0 ? (
                      <div className="py-12 text-center">
                        <Activity className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">No transactions yet</p>
                        <p className="text-xs text-slate-600 mt-1">Create a deposit to get started</p>
                      </div>
                    ) : transactions.slice(0, 5).map(tx => (
                      tx && typeof tx.amount === 'number' ? (
                        <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            tx.type === 'deposit' ? 'bg-brand-500/15 text-brand-300' :
                            tx.type === 'withdrawal' ? 'bg-red-500/15 text-red-400' :
                            tx.type === 'transfer' ? 'bg-blue-500/15 text-blue-400' :
                            'bg-slate-500/15 text-slate-400'
                          }`}>
                            {tx.type === 'transfer' ? <ArrowRightLeft className="w-4 h-4" /> :
                             tx.type === 'deposit' ? <Plus className="w-4 h-4" /> :
                             <DollarSign className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white capitalize">{tx.type}</p>
                            <p className="text-xs text-slate-500 truncate mt-0.5">{tx.description || tx.reference || '—'}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className={`text-sm font-semibold ${tx.type === 'withdrawal' ? 'text-red-400' : 'text-white'}`}>
                              {tx.type === 'withdrawal' ? '-' : '+'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                            <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-md mt-1 font-medium ${
                              tx.status === 'posted' ? 'bg-brand-500/10 text-brand-300' :
                              tx.status === 'reversed' ? 'bg-red-500/10 text-red-400' :
                              'bg-amber-500/10 text-amber-400'
                            }`}>
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      ) : null
                    ))}
                  </div>
                </div>

                {/* Account summary — narrower */}
                <div className="xl:col-span-2 bg-surface-raised rounded-2xl border border-white/[0.06] overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                    <div>
                      <p className="text-sm font-semibold text-white">Accounts</p>
                      <p className="text-xs text-slate-500 mt-0.5">{availableAccounts.length} connected</p>
                    </div>
                    <button
                      onClick={() => setActiveForm('account')}
                      className="w-7 h-7 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-300 hover:bg-brand-500/20 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="divide-y divide-white/[0.04]">
                    {availableAccounts.length === 0 ? (
                      <div className="py-12 text-center">
                        <CreditCard className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">No accounts</p>
                        <button onClick={() => setActiveForm('account')} className="text-xs text-brand-300 mt-2 hover:text-brand-200">Connect one →</button>
                      </div>
                    ) : availableAccounts.map(acc => (
                      <div key={acc.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => { setSelectedAccount(acc); setActiveTab('accounts'); }}>
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-slate-400">{acc.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{acc.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5 capitalize">{acc.type} · {acc.currency}</p>
                        </div>
                        <p className="text-sm font-semibold text-white flex-shrink-0">
                          ${(acc.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ACCOUNTS TAB                                                    */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'accounts' && !activeForm && (
            <>
              {/* Summary KPIs */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total Accounts', value: availableAccounts.length, icon: Database, color: 'brand' },
                  { label: 'Total Balance', value: `$${availableAccounts.reduce((t, a) => t + (a.balance || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'blue' },
                  { label: 'Active', value: availableAccounts.length, icon: CheckCircle, color: 'brand' },
                ].map(kpi => {
                  const Icon = kpi.icon;
                  return (
                    <div key={kpi.label} className="bg-surface-raised rounded-2xl p-5 border border-white/[0.06]">
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">{kpi.label}</p>
                      <p className="text-2xl font-bold text-white">{kpi.value}</p>
                    </div>
                  );
                })}
              </div>

              {/* Accounts table */}
              <div className="bg-surface-raised rounded-2xl border border-white/[0.06] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                  <p className="text-sm font-semibold text-white">All Accounts</p>
                  <button
                    onClick={() => setActiveForm('account')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-400 text-white text-xs font-semibold transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> New Account
                  </button>
                </div>
                {availableAccounts.length === 0 ? (
                  <div className="py-16 text-center">
                    <CreditCard className="w-10 h-10 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">No accounts connected</p>
                    <p className="text-slate-600 text-sm mt-1">Connect your first bank account to get started</p>
                    <button onClick={() => setActiveForm('account')} className="mt-4 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-400 text-white text-sm font-medium transition-all">
                      Connect Account
                    </button>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        {['Name', 'Account #', 'Type', 'Currency', 'Balance', 'Status', ''].map(h => (
                          <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {availableAccounts.map(acc => (
                        <tr key={acc.id} className={`hover:bg-white/[0.02] transition-colors cursor-pointer ${selectedAccount?.id === acc.id ? 'bg-brand-500/[0.04]' : ''}`}
                            onClick={() => setSelectedAccount(acc === selectedAccount ? null : acc)}>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-slate-400">{acc.name.charAt(0)}</span>
                              </div>
                              <p className="text-sm font-medium text-white">{acc.name}</p>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-sm font-mono text-slate-400">{acc.account_number}</td>
                          <td className="px-5 py-3.5">
                            <span className="text-xs px-2 py-1 rounded-md bg-slate-800 text-slate-300 capitalize font-medium">{acc.type}</span>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-slate-400">{acc.currency}</td>
                          <td className="px-5 py-3.5 text-sm font-semibold text-white">
                            ${(acc.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-300 inline-block" />
                              Active
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex gap-2">
                              <button
                                onClick={e => { e.stopPropagation(); setDepositForm(f => ({ ...f, account_id: acc.id })); setActiveForm('deposit'); }}
                                className="text-xs px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-300 hover:bg-brand-500/20 transition-colors font-medium"
                              >Deposit</button>
                              <button
                                onClick={e => { e.stopPropagation(); setTransferForm(f => ({ ...f, from_account_id: acc.id })); setActiveForm('transfer'); }}
                                className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] transition-colors font-medium"
                              >Transfer</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TRANSACTIONS TAB                                                */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'transactions' && !activeForm && (
            <>
              {/* Filters row */}
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Eye className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    className="w-full pl-9 pr-4 py-2.5 bg-surface-raised border border-white/[0.06] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/40"
                  />
                </div>
                {['all', 'deposit', 'transfer', 'withdrawal', 'adjustment'].map(f => (
                  <button key={f} className="px-3 py-2 rounded-lg bg-surface-raised border border-white/[0.06] text-xs font-medium text-slate-400 hover:text-white hover:border-white/[0.12] capitalize transition-all">
                    {f}
                  </button>
                ))}
              </div>

              {/* Transaction table */}
              <div className="bg-surface-raised rounded-2xl border border-white/[0.06] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                  <p className="text-sm font-semibold text-white">{transactions.length} Transactions</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveForm('deposit')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-400 text-white text-xs font-semibold transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> New Deposit
                    </button>
                  </div>
                </div>
                {transactions.length === 0 ? (
                  <div className="py-16 text-center">
                    <Activity className="w-10 h-10 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">No transactions yet</p>
                    <p className="text-slate-600 text-sm mt-1">Create a deposit to see transactions here</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        {['Type', 'Description', 'Reference', 'Amount', 'Status', 'Entries', 'Actions'].map(h => (
                          <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {transactions.filter(tx => tx && typeof tx.amount === 'number').map(tx => (
                        <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                tx.type === 'deposit' ? 'bg-brand-500/15 text-brand-300' :
                                tx.type === 'withdrawal' ? 'bg-red-500/15 text-red-400' :
                                tx.type === 'transfer' ? 'bg-blue-500/15 text-blue-400' :
                                'bg-slate-500/15 text-slate-400'
                              }`}>
                                {tx.type === 'transfer' ? <ArrowRightLeft className="w-3.5 h-3.5" /> :
                                 tx.type === 'deposit' ? <Plus className="w-3.5 h-3.5" /> :
                                 <DollarSign className="w-3.5 h-3.5" />}
                              </div>
                              <span className="text-sm font-medium text-white capitalize">{tx.type}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-slate-400 max-w-[160px] truncate">{tx.description || '—'}</td>
                          <td className="px-5 py-3.5 text-xs font-mono text-slate-500">{tx.reference || '—'}</td>
                          <td className="px-5 py-3.5 text-sm font-semibold text-white">${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md ${
                              tx.status === 'posted' ? 'bg-brand-500/10 text-brand-300' :
                              tx.status === 'reversed' ? 'bg-red-500/10 text-red-400' :
                              tx.status === 'cancelled' ? 'bg-slate-500/10 text-slate-400' :
                              'bg-amber-500/10 text-amber-400'
                            }`}>
                              {tx.status === 'posted' && <CheckCircle className="w-3 h-3" />}
                              {tx.status === 'reversed' && <AlertTriangle className="w-3 h-3" />}
                              {(tx.status === 'draft' || tx.status === 'pending') && <Clock className="w-3 h-3" />}
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-500">{tx.entries?.length ?? 0} entries</td>
                          <td className="px-5 py-3.5">
                            <div className="flex gap-2">
                              {(tx.status === 'draft' || tx.status === 'pending') && (
                                <button
                                  onClick={() => handlePostTransaction(tx.id)}
                                  disabled={loading}
                                  className="text-xs px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-300 hover:bg-brand-500/20 transition-colors font-medium disabled:opacity-50"
                                >Post</button>
                              )}
                              {tx.status === 'posted' && (
                                <button
                                  onClick={() => handleReverseTransaction(tx.id)}
                                  disabled={loading}
                                  className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors font-medium disabled:opacity-50"
                                >Reverse</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* JOURNAL ENTRY TAB                                               */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'journal' && !activeForm && (
            <div className="max-w-3xl space-y-5">
              <div className="bg-surface-raised rounded-2xl border border-white/[0.06] overflow-hidden">
                <div className="px-6 py-5 border-b border-white/[0.06]">
                  <h3 className="text-sm font-semibold text-white">New Journal Entry</h3>
                  <p className="text-xs text-slate-500 mt-1">Debits must equal credits to post the entry</p>
                </div>
                <form onSubmit={handleCreateJournalEntry} className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Description *</label>
                      <input
                        type="text"
                        value={journalDesc}
                        onChange={e => setJournalDesc(e.target.value)}
                        required
                        placeholder="e.g. Accrue monthly interest"
                        className="w-full px-3.5 py-2.5 bg-surface-base border border-white/[0.08] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500/40 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Reference</label>
                      <input
                        type="text"
                        value={journalRef}
                        onChange={e => setJournalRef(e.target.value)}
                        placeholder="Auto-generated if empty"
                        className="w-full px-3.5 py-2.5 bg-surface-base border border-white/[0.08] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500/40 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Lines table */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Journal Lines</label>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setJournalLines(p => [...p, { account_id: '', type: 'debit', amount: 0 }])}
                          className="text-xs px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-300 hover:bg-brand-500/20 transition-colors font-medium">
                          + Debit
                        </button>
                        <button type="button" onClick={() => setJournalLines(p => [...p, { account_id: '', type: 'credit', amount: 0 }])}
                          className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors font-medium">
                          + Credit
                        </button>
                      </div>
                    </div>

                    <div className="bg-surface-base rounded-xl border border-white/[0.06] overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/[0.06]">
                            <th className="text-left text-xs text-slate-500 font-medium px-4 py-2.5">Account</th>
                            <th className="text-left text-xs text-slate-500 font-medium px-4 py-2.5 w-28">Type</th>
                            <th className="text-right text-xs text-slate-500 font-medium px-4 py-2.5 w-32">Amount</th>
                            <th className="w-10 px-2 py-2.5" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                          {journalLines.map((line, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-2">
                                <select
                                  value={line.account_id}
                                  onChange={e => setJournalLines(p => p.map((l, i) => i === idx ? { ...l, account_id: e.target.value } : l))}
                                  className="w-full bg-transparent text-sm text-white focus:outline-none"
                                >
                                  <option value="" className="bg-surface-raised">Select account…</option>
                                  {availableAccounts.map(acc => (
                                    <option key={acc.id} value={acc.id} className="bg-surface-raised">{acc.name} ({acc.account_number})</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-2">
                                <select
                                  value={line.type}
                                  onChange={e => setJournalLines(p => p.map((l, i) => i === idx ? { ...l, type: e.target.value as 'debit' | 'credit' } : l))}
                                  className={`bg-transparent text-xs font-semibold focus:outline-none ${line.type === 'debit' ? 'text-brand-300' : 'text-blue-400'}`}
                                >
                                  <option value="debit" className="bg-surface-raised text-brand-300">DR Debit</option>
                                  <option value="credit" className="bg-surface-raised text-blue-400">CR Credit</option>
                                </select>
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="number" min="0" step="0.01"
                                  value={line.amount || ''}
                                  onChange={e => setJournalLines(p => p.map((l, i) => i === idx ? { ...l, amount: parseFloat(e.target.value) || 0 } : l))}
                                  className="w-full text-right bg-transparent text-sm text-white focus:outline-none"
                                  placeholder="0.00"
                                />
                              </td>
                              <td className="px-2 py-2 text-center">
                                {journalLines.length > 2 && (
                                  <button type="button" onClick={() => setJournalLines(p => p.filter((_, i) => i !== idx))} className="text-slate-600 hover:text-red-400 transition-colors text-base">×</button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Balance indicator */}
                    {(() => {
                      const dr = journalLines.filter(l => l.type === 'debit').reduce((s, l) => s + (l.amount || 0), 0);
                      const cr = journalLines.filter(l => l.type === 'credit').reduce((s, l) => s + (l.amount || 0), 0);
                      const ok = Math.abs(dr - cr) < 0.001 && dr > 0;
                      return (
                        <div className={`mt-3 flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium ${ok ? 'bg-brand-500/10 border border-brand-500/20 text-brand-300' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                          <span>DR {dr.toFixed(2)} · CR {cr.toFixed(2)}</span>
                          <span>{ok ? '✓ Balanced' : `Difference: ${Math.abs(dr - cr).toFixed(2)}`}</span>
                        </div>
                      );
                    })()}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all"
                  >
                    {loading ? 'Posting…' : 'Post Journal Entry'}
                  </button>
                </form>
              </div>

              {response && (
                <div className="bg-surface-raised rounded-xl border border-white/[0.06] p-4">
                  <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Response</p>
                  <pre className="text-xs text-brand-300 overflow-auto max-h-40">{response}</pre>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* REPORTS TAB                                                     */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'reports' && !activeForm && (
            <div className="space-y-5">
              {/* Report selector */}
              <div className="flex gap-2">
                {[
                  { id: 'balance-sheet', label: 'Balance Sheet', action: handleGetBalanceSheet },
                  { id: 'income-statement', label: 'Income Statement', action: handleGetIncomeStatement },
                  { id: 'cash-flow', label: 'Cash Flow', action: handleGetCashFlow },
                  { id: 'trial-balance', label: 'Trial Balance', action: handleGetTrialBalanceData },
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => { setActiveReport(r.id as any); r.action(); }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeReport === r.id
                        ? 'bg-brand-500 text-white'
                        : 'bg-surface-raised text-slate-400 hover:text-white border border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {/* Balance Sheet */}
              {activeReport === 'balance-sheet' && balanceSheet && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Assets */}
                  <div className="bg-surface-raised rounded-2xl border border-white/[0.06] overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                      <span className="text-xs font-semibold text-brand-300 uppercase tracking-wider">Assets</span>
                      <span className="text-sm font-bold text-white">${(balanceSheet.total_assets || 0).toFixed(2)}</span>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                      {(balanceSheet.assets || []).flatMap((g: any) => (g.accounts || []).map((a: any) => (
                        <div key={a.id} className="flex items-center justify-between px-5 py-3">
                          <div>
                            <p className="text-sm text-white">{a.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5 capitalize">{a.type}</p>
                          </div>
                          <span className="text-sm font-semibold text-brand-300">${(a.balance || 0).toFixed(2)}</span>
                        </div>
                      )))}
                    </div>
                    <div className={`px-5 py-3 border-t-2 ${balanceSheet.is_balanced ? 'border-brand-500/30 bg-brand-500/[0.04]' : 'border-red-500/30 bg-red-500/[0.04]'}`}>
                      <div className="flex justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Assets</span>
                        <span className={`text-sm font-bold ${balanceSheet.is_balanced ? 'text-brand-300' : 'text-red-400'}`}>${(balanceSheet.total_assets || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  {/* Liabilities + Equity */}
                  <div className="bg-surface-raised rounded-2xl border border-white/[0.06] overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                      <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Liabilities & Equity</span>
                      <span className="text-sm font-bold text-white">${(balanceSheet.total_liabilities_equity || 0).toFixed(2)}</span>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                      {[...(balanceSheet.liabilities || []), ...(balanceSheet.equity || [])].flatMap((g: any) => (g.accounts || []).map((a: any) => (
                        <div key={a.id} className="flex items-center justify-between px-5 py-3">
                          <div>
                            <p className="text-sm text-white">{a.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5 capitalize">{a.type}</p>
                          </div>
                          <span className="text-sm font-semibold text-blue-400">${(a.balance || 0).toFixed(2)}</span>
                        </div>
                      )))}
                    </div>
                    <div className={`px-5 py-3 border-t-2 ${balanceSheet.is_balanced ? 'border-blue-500/30 bg-blue-500/[0.04]' : 'border-red-500/30 bg-red-500/[0.04]'}`}>
                      <div className="flex justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Liab + Equity</span>
                        <span className={`text-sm font-bold ${balanceSheet.is_balanced ? 'text-blue-400' : 'text-red-400'}`}>${(balanceSheet.total_liabilities_equity || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  {/* Accounting equation banner */}
                  <div className={`col-span-2 flex items-center justify-center gap-4 py-3 px-5 rounded-xl text-sm font-medium ${balanceSheet.is_balanced ? 'bg-brand-500/10 border border-brand-500/20 text-brand-300' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                    <span>Assets ${(balanceSheet.total_assets || 0).toFixed(2)}</span>
                    <span className="text-slate-500">=</span>
                    <span>Liabilities + Equity ${(balanceSheet.total_liabilities_equity || 0).toFixed(2)}</span>
                    <span className="ml-2">{balanceSheet.is_balanced ? '✓ Balanced' : '✗ Unbalanced'}</span>
                  </div>
                </div>
              )}

              {/* Income Statement */}
              {activeReport === 'income-statement' && incomeStatement && (
                <div className="bg-surface-raised rounded-2xl border border-white/[0.06] overflow-hidden max-w-2xl">
                  <div className="px-5 py-4 border-b border-white/[0.06]">
                    <p className="text-sm font-semibold text-white">Income Statement</p>
                  </div>
                  <div className="p-5 space-y-5">
                    <div>
                      <p className="text-xs font-semibold text-brand-300 uppercase tracking-wider mb-3">Revenue</p>
                      <div className="space-y-2">
                        {(incomeStatement.revenue || []).flatMap((g: any) => (g.accounts || []).map((a: any) => (
                          <div key={a.id} className="flex justify-between">
                            <span className="text-sm text-slate-300">{a.name}</span>
                            <span className="text-sm font-medium text-brand-300">${(a.balance || 0).toFixed(2)}</span>
                          </div>
                        )))}
                        <div className="flex justify-between border-t border-white/[0.06] pt-2 mt-2">
                          <span className="text-sm font-semibold text-white">Total Revenue</span>
                          <span className="text-sm font-bold text-brand-300">${(incomeStatement.total_revenue || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">Expenses</p>
                      <div className="space-y-2">
                        {(incomeStatement.expenses || []).flatMap((g: any) => (g.accounts || []).map((a: any) => (
                          <div key={a.id} className="flex justify-between">
                            <span className="text-sm text-slate-300">{a.name}</span>
                            <span className="text-sm font-medium text-red-400">${(a.balance || 0).toFixed(2)}</span>
                          </div>
                        )))}
                        <div className="flex justify-between border-t border-white/[0.06] pt-2 mt-2">
                          <span className="text-sm font-semibold text-white">Total Expenses</span>
                          <span className="text-sm font-bold text-red-400">${(incomeStatement.total_expenses || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`flex justify-between px-4 py-3 rounded-xl font-bold text-base ${(incomeStatement.net_income || 0) >= 0 ? 'bg-brand-500/10 border border-brand-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                      <span className="text-white">Net Income</span>
                      <span className={(incomeStatement.net_income || 0) >= 0 ? 'text-brand-300' : 'text-red-400'}>${(incomeStatement.net_income || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Cash Flow */}
              {activeReport === 'cash-flow' && cashFlow && (
                <div className="bg-surface-raised rounded-2xl border border-white/[0.06] overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                    <p className="text-sm font-semibold text-white">Cash Flow</p>
                    <span className={`text-sm font-bold ${(cashFlow.net_cash || 0) >= 0 ? 'text-brand-300' : 'text-red-400'}`}>Net ${(cashFlow.net_cash || 0).toFixed(2)}</span>
                  </div>
                  {(cashFlow.data || []).length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-sm">No cash transactions in this period</div>
                  ) : (
                    <table className="w-full">
                      <thead><tr className="border-b border-white/[0.06]">{['Date','Description','Type','Amount','Running Total'].map(h=><th key={h} className="text-left text-xs text-slate-500 font-medium px-5 py-3">{h}</th>)}</tr></thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {(cashFlow.data || []).map((e: any, i: number) => (
                          <tr key={i} className="hover:bg-white/[0.02]">
                            <td className="px-5 py-3 text-xs text-slate-500">{new Date(e.timestamp).toLocaleDateString()}</td>
                            <td className="px-5 py-3 text-sm text-white">{e.description}</td>
                            <td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-md font-medium ${e.type === 'deposit' ? 'bg-brand-500/10 text-brand-300' : 'bg-red-500/10 text-red-400'}`}>{e.type}</span></td>
                            <td className={`px-5 py-3 text-sm font-semibold ${e.amount >= 0 ? 'text-brand-300' : 'text-red-400'}`}>{e.amount >= 0 ? '+' : ''}{e.amount.toFixed(2)}</td>
                            <td className="px-5 py-3 text-sm text-slate-400">{e.running_total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Trial Balance */}
              {activeReport === 'trial-balance' && trialBalanceData && (
                <div className="bg-surface-raised rounded-2xl border border-white/[0.06] overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                    <p className="text-sm font-semibold text-white">Trial Balance</p>
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${(trialBalanceData as any).is_balanced ? 'bg-brand-500/10 text-brand-300' : 'bg-red-500/10 text-red-400'}`}>
                      {(trialBalanceData as any).is_balanced ? '✓ Balanced' : '✗ Unbalanced'}
                    </span>
                  </div>
                  <table className="w-full">
                    <thead><tr className="border-b border-white/[0.06]">{['Account #','Name','Type','Debit','Credit'].map(h=><th key={h} className="text-left text-xs text-slate-500 font-medium px-5 py-3">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {((trialBalanceData as any).data || []).map((e: any) => (
                        <tr key={e.id} className="hover:bg-white/[0.02]">
                          <td className="px-5 py-3 text-xs font-mono text-slate-500">{e.account_number}</td>
                          <td className="px-5 py-3 text-sm text-white">{e.name}</td>
                          <td className="px-5 py-3"><span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 capitalize">{e.type}</span></td>
                          <td className="px-5 py-3 text-sm font-medium text-brand-300">{e.balance > 0 ? `$${e.balance.toFixed(2)}` : '—'}</td>
                          <td className="px-5 py-3 text-sm font-medium text-blue-400">{e.balance < 0 ? `$${Math.abs(e.balance).toFixed(2)}` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-white/[0.10]">
                        <td colSpan={3} className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Totals</td>
                        <td className="px-5 py-3 text-sm font-bold text-brand-300">${((trialBalanceData as any).total_debits || 0).toFixed(2)}</td>
                        <td className="px-5 py-3 text-sm font-bold text-blue-400">${((trialBalanceData as any).total_credits || 0).toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* Empty prompt */}
              {!balanceSheet && !incomeStatement && !cashFlow && !trialBalanceData && (
                <div className="bg-surface-raised rounded-2xl border border-white/[0.06] py-16 text-center">
                  <TrendingUp className="w-10 h-10 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">Select a report above to get started</p>
                  <p className="text-slate-600 text-sm mt-1">Balance Sheet, Income Statement, Cash Flow, Trial Balance</p>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ANALYTICS TAB                                                   */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'analytics' && !activeForm && (
            <div className="bg-surface-raised rounded-2xl border border-white/[0.06] py-20 text-center">
              <TrendingUp className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-white font-semibold text-lg">Analytics Coming Soon</p>
              <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">Advanced charts, trend analysis, and AI-powered insights will appear here</p>
              <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-brand-500/10 border border-brand-500/20 rounded-lg text-brand-300 text-xs font-medium">
                <Clock className="w-3.5 h-3.5" /> In development
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* MODAL FORMS (overlaid on any tab)                              */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={e => { if (e.target === e.currentTarget) setActiveForm(null); }}>
              <div className="w-full max-w-lg bg-surface-raised rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>

                {/* Form header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      {activeForm === 'account' ? 'Connect New Account' : activeForm === 'transfer' ? 'Transfer Funds' : 'Fund Account'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {activeForm === 'account' ? 'Add a ledger account to your workspace' :
                       activeForm === 'transfer' ? 'Move funds between accounts' :
                       'Add funds and update balance instantly'}
                    </p>
                  </div>
                  <button onClick={() => setActiveForm(null)} className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center transition-all text-lg">×</button>
                </div>

                <div className="p-6">
                  {/* ── Account Form ─────────────────────────────────────── */}
                  {activeForm === 'account' && (
                    <ConnectAccountFlow onAccountConnected={() => { loadAvailableAccounts(); setActiveForm(null); }} />
                  )}

                  {/* ── Transfer Form ────────────────────────────────────── */}
                  {activeForm === 'transfer' && (
                    <form onSubmit={handleCreateTransfer} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">From Account</label>
                          <select value={transferForm.from_account_id} onChange={e => setTransferForm(f => ({...f, from_account_id: e.target.value}))} required
                            className="w-full px-3.5 py-2.5 bg-surface-base border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-brand-500/40">
                            <option value="" className="bg-surface-raised">Select account…</option>
                            {availableAccounts.map(a => <option key={a.id} value={a.id} className="bg-surface-raised">{a.name} (${(a.balance||0).toFixed(2)})</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">To Account</label>
                          <select value={transferForm.to_account_id} onChange={e => setTransferForm(f => ({...f, to_account_id: e.target.value}))} required
                            className="w-full px-3.5 py-2.5 bg-surface-base border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-brand-500/40">
                            <option value="" className="bg-surface-raised">Select account…</option>
                            {availableAccounts.filter(a => a.id !== transferForm.from_account_id).map(a => <option key={a.id} value={a.id} className="bg-surface-raised">{a.name}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Amount</label>
                          <input type="number" min="0.01" step="0.01" value={transferForm.amount} onChange={e => setTransferForm(f => ({...f, amount: parseFloat(e.target.value)}))} required
                            className="w-full px-3.5 py-2.5 bg-surface-base border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-brand-500/40" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Currency</label>
                          <select value={transferForm.currency} onChange={e => setTransferForm(f => ({...f, currency: e.target.value}))}
                            className="w-full px-3.5 py-2.5 bg-surface-base border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-brand-500/40">
                            {['USD','EUR','GBP','BRL','INR'].map(c => <option key={c} className="bg-surface-raised">{c}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
                        <input type="text" value={transferForm.description} onChange={e => setTransferForm(f => ({...f, description: e.target.value}))}
                          className="w-full px-3.5 py-2.5 bg-surface-base border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-brand-500/40" />
                      </div>
                      <button type="submit" disabled={loading} className="w-full py-3 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all">
                        {loading ? 'Processing…' : 'Execute Transfer'}
                      </button>
                    </form>
                  )}

                  {/* ── Deposit Form ─────────────────────────────────────── */}
                  {activeForm === 'deposit' && (
                    <form className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Account</label>
                        <select value={depositForm.account_id} onChange={e => setDepositForm(f => ({...f, account_id: e.target.value}))} required
                          className="w-full px-3.5 py-2.5 bg-surface-base border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-brand-500/40">
                          <option value="" className="bg-surface-raised">Select account…</option>
                          {availableAccounts.map(a => <option key={a.id} value={a.id} className="bg-surface-raised">{a.name} (${(a.balance||0).toFixed(2)})</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Amount</label>
                          <input type="number" min="0.01" step="0.01" value={depositForm.amount} onChange={e => setDepositForm(f => ({...f, amount: parseFloat(e.target.value)}))}
                            className="w-full px-3.5 py-2.5 bg-surface-base border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-brand-500/40" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Currency</label>
                          <select value={depositForm.currency} onChange={e => setDepositForm(f => ({...f, currency: e.target.value}))}
                            className="w-full px-3.5 py-2.5 bg-surface-base border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-brand-500/40">
                            {['USD','EUR','GBP','BRL','INR'].map(c => <option key={c} className="bg-surface-raised">{c}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
                        <input type="text" value={depositForm.description} onChange={e => setDepositForm(f => ({...f, description: e.target.value}))}
                          className="w-full px-3.5 py-2.5 bg-surface-base border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-brand-500/40" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button type="button" onClick={handleCreateDeposit} disabled={loading}
                          className="py-3 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all">
                          {loading ? 'Processing…' : 'Real Deposit'}
                        </button>
                        <button type="button" onClick={handleCreateTestBalance} disabled={loading}
                          className="py-3 bg-surface-base border border-brand-500/30 text-brand-300 hover:bg-brand-500/10 disabled:opacity-50 text-sm font-semibold rounded-xl transition-all">
                          {loading ? 'Processing…' : 'Test Balance'}
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 text-center">Test Balance adds funds instantly without validation</p>
                    </form>
                  )}
                </div>

                {/* Response */}
                {response && (
                  <div className="mx-6 mb-6 p-3 bg-surface-base rounded-xl border border-white/[0.06]">
                    <pre className="text-xs text-brand-300 overflow-auto max-h-32">{response}</pre>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default LedgerTest;
