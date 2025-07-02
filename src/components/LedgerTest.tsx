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
  Clock
} from 'lucide-react';

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
      // Simulate API call to create/connect account
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/ledger/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountDetails),
      });
      const data = await response.json();
      if (response.ok) {
        setStep(5);
        setTimeout(() => {
          onAccountConnected();
        }, 1200);
      } else {
        setError(data.error || 'Failed to connect account');
      }
    } catch (err) {
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
      {/* Stepper */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((label, idx) => (
          <React.Fragment key={label}>
            <div className={`flex flex-col items-center ${idx <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}> 
              <div className={`rounded-full h-8 w-8 flex items-center justify-center font-bold border-2 ${idx <= currentStep ? 'border-blue-600 bg-blue-100' : 'border-gray-300 bg-gray-100'}`}>{idx + 1}</div>
              <span className="text-xs mt-1">{label}</span>
            </div>
            {idx < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${idx < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}></div>}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Select Country */}
      {step === 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Choose your country</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white mb-6"
            value={selectedCountry}
            onChange={e => handleCountrySelect(e.target.value)}
          >
            <option value="">Select country</option>
            {COUNTRY_LIST.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
      )}

      {/* Step 2: Select Provider */}
      {step === 2 && selectedCountry && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Choose your account provider</label>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {COUNTRY_PROVIDERS[selectedCountry].map(provider => (
              <button
                key={provider.id}
                onClick={() => handleProviderSelect(provider.id)}
                className={`flex items-center gap-3 p-4 border rounded-lg w-full transition-colors focus:outline-none ${selectedProvider === provider.id ? 'border-blue-600 bg-blue-50 dark:bg-slate-700' : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
              >
                {provider.logo ? (
                  <img src={provider.logo} alt={provider.name} className="h-8 w-8 rounded" />
                ) : (
                  <Database className="h-8 w-8 text-gray-400" />
                )}
                <span className="font-medium text-gray-900 dark:text-white">{provider.name}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => { setStep(1); setSelectedCountry(''); setSelectedProvider(''); setOAuthSuccess(false); }}
            className="px-4 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
          >Back</button>
        </div>
      )}

      {/* Simulated OAuth Modal */}
      {showOAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
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
  const [loading, setLoading] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [trialBalance, setTrialBalance] = useState<TrialBalance | null>(null);
  const [response, setResponse] = useState<string>('');
  const [accountBalance, setAccountBalance] = useState<null | { balance: number, currency: string }>(null);
  const [activeForm, setActiveForm] = useState<'account' | 'transfer' | 'deposit' | null>(null);

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
    reference: 'TRX-001'
  });

  const [depositForm, setDepositForm] = useState({
    account_id: '',
    amount: 500.00,
    currency: 'USD',
    description: 'Initial deposit',
    reference: 'DEP-001'
  });

  const [balanceForm, setBalanceForm] = useState({
    account_id: ''
  });

  const [lastTransferRailInfo, setLastTransferRailInfo] = useState<TransferRailInfo | null>(null);
  const [showTransferSuccess, setShowTransferSuccess] = useState(false);

  // Load available accounts
  const loadAvailableAccounts = async () => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/ledger/accounts/available`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const data = await response.json();
      
      if (response.ok && data.accounts) {
        setAvailableAccounts(data.accounts);
      } else {
        console.error('Failed to load accounts:', data);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was aborted');
      } else {
        console.error('Error loading available accounts:', error);
      }
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/ledger/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountForm)
      });

      const data = await response.json();
      
      if (response.ok) {
        setResponse(JSON.stringify(data, null, 2));
        // Refresh available accounts after creating new account
        loadAvailableAccounts();
      } else {
        setResponse(`Error: ${data.error || 'Failed to create account'}`);
      }
    } catch (error) {
      setResponse(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/ledger/transactions/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transferForm)
      });

      const data = await response.json();
      // If the response includes rail info, use it
      if (response.ok && data.rail) {
        setLastTransferRailInfo(data as TransferRailInfo);
        setTransactions([...transactions, data.transaction]);
        setResponse(JSON.stringify(data, null, 2));
        setShowTransferSuccess(true);
        loadAvailableAccounts();
      } else if (response.ok && data.id) {
        // fallback for old response
        setTransactions([...transactions, data]);
        setResponse(JSON.stringify(data, null, 2));
        setShowTransferSuccess(true);
        loadAvailableAccounts();
      } else {
        setResponse(`Error: ${data.error || 'Failed to create transfer'}`);
      }
    } catch (error) {
      setResponse(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/ledger/transactions/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(depositForm)
      });

      const data = await response.json();
      
      if (response.ok) {
        setResponse(JSON.stringify(data, null, 2));
        setTransactions([...transactions, data]);
        // Refresh available accounts after deposit
        loadAvailableAccounts();
      } else {
        setResponse(`Error: ${data.error || 'Failed to create deposit'}`);
      }
    } catch (error) {
      setResponse(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/ledger/accounts/${balanceForm.account_id}/balance`);
      const data = await response.json();
      
      if (response.ok) {
        setAccountBalance({ balance: data.balance, currency: data.currency });
        setResponse('');
      } else {
        setAccountBalance(null);
        setResponse(`Error: ${data.error || 'Failed to get balance'}`);
      }
    } catch (error) {
      setAccountBalance(null);
      setResponse(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGetTrialBalance = async () => {
    setLoading(true);
    setResponse('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/ledger/trial-balance`);
      const result = await response.json();
      
      if (response.ok) {
        setTrialBalance(result);
        setResponse(JSON.stringify(result, null, 2));
      } else {
        setResponse(`Error: ${result.error || 'Failed to get trial balance'}`);
      }
    } catch (error) {
      setResponse(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePostTransaction = async (transactionId: string) => {
    setLoading(true);
    setResponse('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/ledger/transactions/${transactionId}/post`, {
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

  // Calculate total balance
  const totalBalance = availableAccounts.reduce((total, account) => total + (account.balance || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-20">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🧾 Ledger System Test
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Test the double-entry accounting system with real-time operations
            </p>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar - Navigation */}
        <div className="w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 min-h-screen p-6">
          <div className="space-y-4">
            <button
              onClick={() => setActiveForm(null)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeForm === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600'
              }`}
            >
              <Database className="h-5 w-5" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveForm('account')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeForm === 'account'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600'
              }`}
            >
              <Plus className="h-5 w-5" />
              Connect Account
            </button>
            <button
              onClick={() => setActiveForm('transfer')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeForm === 'transfer'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600'
              }`}
            >
              <ArrowRight className="h-5 w-5" />
              Create Transfer
            </button>
            <button
              onClick={() => setActiveForm('deposit')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeForm === 'deposit'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600'
              }`}
            >
              <DollarSign className="h-5 w-5" />
              Create Deposit
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Dashboard Content */}
          {activeForm === null && (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Accounts</p>
                      <p className="text-2xl font-bold text-blue-600">{availableAccounts.length}</p>
                    </div>
                    <Database className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</p>
                      <p className="text-2xl font-bold text-green-600">{transactions.length}</p>
                    </div>
                    <Activity className="h-8 w-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Transactions</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {transactions.filter(t => t.status === 'active').length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-purple-500" />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transaction Volume</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${transactions.reduce((total, tx) => total + tx.amount, 0).toFixed(2)}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </div>
              </div>

              {/* Total Balance */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-8 border border-gray-200 dark:border-slate-700">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Total Balance</h2>
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    ${availableAccounts.reduce((total, account) => total + (account.balance || 0), 0).toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Across all accounts
                  </p>
                </div>
              </div>

              {/* Data Display Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Accounts List */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-6">
                    <Database className="h-5 w-5 text-blue-500" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Created Accounts</h2>
                  </div>
                  {availableAccounts.length === 0 ? (
                    <div className="text-center py-8">
                      <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No accounts created yet</p>
                      <p className="text-sm text-gray-400">Create an account to see it here</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {availableAccounts.map((account) => (
                        <div key={account.id} className="border border-gray-200 dark:border-slate-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">{account.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">#{account.account_number}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-500">{account.description}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-500">
                                Type: {account.type} | Currency: {account.currency}
                              </p>
                              {account.balance !== undefined && (
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  Balance: ${account.balance.toFixed(2)}
                                </p>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500 font-mono">{account.id}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Transactions List */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-6">
                    <Activity className="h-5 w-5 text-green-500" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Created Transactions</h2>
                  </div>
                  {transactions.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No transactions created yet</p>
                      <p className="text-sm text-gray-400">Create a transaction to see it here</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="border border-gray-200 dark:border-slate-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">{transaction.type}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{transaction.description}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-500">Reference: {transaction.reference}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-500">
                                Amount: ${transaction.amount.toFixed(2)} {transaction.currency}
                              </p>
                              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                                transaction.status === 'posted' 
                                  ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' 
                                  : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
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
                            </div>
                            <div className="flex flex-col space-y-2">
                              <div className="text-xs text-gray-400 dark:text-gray-500 font-mono">{transaction.id}</div>
                              {transaction.status === 'draft' && (
                                <button
                                  onClick={() => handlePostTransaction(transaction.id)}
                                  disabled={loading}
                                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                  Post
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Form Content */}
          {activeForm === 'account' && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-slate-700 max-w-2xl mx-auto">
              <div className="flex items-center gap-2 mb-6">
                <Plus className="h-5 w-5 text-blue-500" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Connect Account</h2>
              </div>
              {/* Enhanced Multi-Step Connect Account Flow */}
              <ConnectAccountFlow onAccountConnected={() => { loadAvailableAccounts(); setActiveForm(null); }} />
            </div>
          )}

          {activeForm === 'transfer' && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-6">
                <ArrowRight className="h-5 w-5 text-green-500" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create Transfer</h2>
              </div>
              {/* Success Toast Notification */}
              {showTransferSuccess && (
                <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 animate-fade-in">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-green-800 dark:text-green-200 font-medium">Transfer created successfully!</span>
                </div>
              )}
              <form onSubmit={handleCreateTransfer} className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    From Account
                  </label>
                  <select
                    value={transferForm.from_account_id}
                    onChange={(e) => setTransferForm({...transferForm, from_account_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    required
                  >
                    <option value="">Select source account</option>
                    {availableAccounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name} ({account.account_number})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    To Account
                  </label>
                  <select
                    value={transferForm.to_account_id}
                    onChange={(e) => setTransferForm({...transferForm, to_account_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    required
                  >
                    <option value="">Select destination account</option>
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
                      value={transferForm.amount}
                      onChange={(e) => setTransferForm({...transferForm, amount: parseFloat(e.target.value)})}
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
                      value={transferForm.currency}
                      onChange={(e) => setTransferForm({...transferForm, currency: e.target.value})}
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
                    value={transferForm.description}
                    onChange={(e) => setTransferForm({...transferForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reference
                  </label>
                  <input
                    type="text"
                    value={transferForm.reference}
                    onChange={(e) => setTransferForm({...transferForm, reference: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Transfer'}
                </button>
              </form>
              {/* Display rail info after transfer */}
              {lastTransferRailInfo && (
                <div className="mt-6 p-6 rounded-xl bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 dark:from-blue-900/40 dark:via-blue-900/60 dark:to-blue-900/30 border border-blue-300 dark:border-blue-700 shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                    <h3 className="font-semibold text-blue-800 dark:text-blue-100 text-lg">Payment Rail Details</h3>
                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 border border-blue-400 dark:border-blue-700`}>{lastTransferRailInfo.rail}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Fee</span>
                      <span className="font-bold text-blue-700 dark:text-blue-200 text-lg">{lastTransferRailInfo.fee}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 dark:text-gray-400">FX Rate</span>
                      <span className="font-bold text-blue-700 dark:text-blue-200 text-lg">{lastTransferRailInfo.fx_rate}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Estimated Settlement</span>
                      <span className="font-bold text-blue-700 dark:text-blue-200 text-lg">{lastTransferRailInfo.latency}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Transaction ID: <span className="font-mono">{lastTransferRailInfo.transaction.id}</span>
                  </div>
                </div>
              )}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reference
                  </label>
                  <input
                    type="text"
                    value={depositForm.reference}
                    onChange={(e) => setDepositForm({...depositForm, reference: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-purple-600 text-white py-2 px-6 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Deposit'}
                </button>
              </form>
            </div>
          )}

          {/* Response Display */}
          {response && (
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white px-4 py-3 rounded-lg mt-6">
              <pre className="text-sm whitespace-pre-wrap">{response}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LedgerTest; 