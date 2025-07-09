import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Building2,
  Globe,
  Zap,
  Shield,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  ArrowRight,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Wifi,
  WifiOff,
  Route,
  Network,
  Database,
  Lock,
  Users,
  BarChart3,
  FileText,
  ExternalLink,
  Edit3,
  Plus,
  Download,
  ChevronDown,
  X,
  AlertTriangle,
  Percent,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface PaymentRail {
  id: string;
  name: string;
  type: 'ACH' | 'Wire' | 'Card' | 'Crypto' | 'SWIFT' | 'SEPA' | 'UPI';
  status: 'active' | 'maintenance' | 'down';
  volume: number;
  successRate: number;
  avgProcessingTime: number;
  cost: number;
  fixedFee: number;
  fxSpread: number;
  slaTarget: number;
  description: string;
  features: string[];
  icon: React.ComponentType<any>;
  lastPing: Date;
  throughput: number[];
  errorRate: number;
}

interface PaymentMetrics {
  totalVolume: number;
  totalTransactions: number;
  successRate: number;
  avgProcessingTime: number;
  activeRails: number;
  costSavings: number;
  totalRails: number;
  disabledRails: number;
  dailySavings: number;
  monthlyThroughput: number;
}

interface SettlementFile {
  id: string;
  railId: string;
  filename: string;
  importedAt: Date;
  variance: number;
  status: 'success' | 'error' | 'warning';
  downloadUrl: string;
}

interface CostSimulation {
  railId: string;
  totalCost: number;
  breakdown: {
    fixedFee: number;
    fxSpread: number;
    networkFee: number;
  };
  isOptimal: boolean;
  estimatedTime: number;
}

interface RailDrawerProps {
  rail: PaymentRail | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (rail: PaymentRail) => void;
}

const RailDrawer: React.FC<RailDrawerProps> = ({ rail, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<PaymentRail>>(rail || {});

  useEffect(() => {
    if (rail) {
      setFormData(rail);
    }
  }, [rail]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData && formData.id) {
      onSave(formData as PaymentRail);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-screen w-full max-w-md bg-white dark:bg-slate-800 shadow-xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {rail ? 'Edit Payment Rail' : 'Add New Rail'}
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-300"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Basic Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Rail Name
                      </label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Rail Type
                      </label>
                      <select
                        value={formData.type || ''}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as PaymentRail['type'] })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="ACH">ACH</option>
                        <option value="Wire">Wire</option>
                        <option value="Card">Card</option>
                        <option value="Crypto">Crypto</option>
                        <option value="SWIFT">SWIFT</option>
                        <option value="SEPA">SEPA</option>
                        <option value="UPI">UPI</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status || ''}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as PaymentRail['status'] })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        required
                      >
                        <option value="active">Active</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="down">Down</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Commercial Settings */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Commercial Settings</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Fixed Fee (USD)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.fixedFee || ''}
                        onChange={(e) => setFormData({ ...formData, fixedFee: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        FX Spread (%)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={formData.fxSpread ? formData.fxSpread * 100 : ''}
                        onChange={(e) => setFormData({ ...formData, fxSpread: parseFloat(e.target.value) / 100 })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Technical Settings */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Technical Settings</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        SLA Target (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formData.slaTarget || ''}
                        onChange={(e) => setFormData({ ...formData, slaTarget: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Error Injection Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formData.errorRate ? formData.errorRate * 100 : ''}
                        onChange={(e) => setFormData({ ...formData, errorRate: parseFloat(e.target.value) / 100 })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      />
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        For testing and demo purposes
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 pt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US').format(num);
};

interface CostSimulatorProps {
  paymentRails: PaymentRail[];
}

const CostSimulator: React.FC<CostSimulatorProps> = ({ paymentRails }) => {
  const [amount, setAmount] = useState<number>(1000);
  const [currency, setCurrency] = useState<string>('USD');
  const [simulations, setSimulations] = useState<CostSimulation[]>([]);

  const currencies = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'JPY', symbol: '¥' },
  ];

  const calculateTotalCost = useCallback((amt: number, rail: PaymentRail) => {
    const fixedFee = rail.fixedFee;
    const fxSpread = currency === 'USD' ? 0 : rail.fxSpread * amt;
    const networkFee = amt * 0.001; // Example network fee calculation
    const totalCost = fixedFee + fxSpread + networkFee;

    return {
      railId: rail.id,
      totalCost,
      breakdown: {
        fixedFee,
        fxSpread,
        networkFee,
      },
      isOptimal: false, // Will be set later
      estimatedTime: rail.avgProcessingTime
    };
  }, [currency]);

  useEffect(() => {
    if (amount > 0) {
      const results = paymentRails
        .filter(rail => rail.status === 'active')
        .map(rail => calculateTotalCost(amount, rail))
        .sort((a, b) => a.totalCost - b.totalCost);

      // Mark the cheapest option as optimal
      if (results.length > 0) {
        results[0].isOptimal = true;
      }

      setSimulations(results);
    }
  }, [amount, currency, calculateTotalCost, paymentRails]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Cost Simulator
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Transaction Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                placeholder="Enter amount"
              />
            </div>
          </div>

          {/* Currency Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              {currencies.map(curr => (
                <option key={curr.code} value={curr.code}>
                  {curr.code} ({curr.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {simulations.map((sim) => {
            const rail = paymentRails.find(r => r.id === sim.railId);
            if (!rail) return null;

            return (
              <div
                key={sim.railId}
                className={`p-4 rounded-lg border ${
                  sim.isOptimal
                    ? 'border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/10'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      sim.isOptimal ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <rail.icon className={`w-5 h-5 ${
                        sim.isOptimal ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {rail.name}
                      </h4>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Est. Time: {sim.estimatedTime}s
                      </span>
                    </div>
                  </div>
                  {sim.isOptimal && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Best Option
                    </span>
                  )}
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Fixed Fee</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(sim.breakdown.fixedFee)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">FX Spread</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(sim.breakdown.fxSpread)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Network Fee</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(sim.breakdown.networkFee)}
                    </span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Total Cost</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(sim.totalCost)}
                    </span>
                  </div>
                </div>

                {/* Percentage of Transaction */}
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">% of Transaction</span>
                  <span className={`font-medium ${
                    (sim.totalCost / amount) * 100 < 1 ? 'text-green-600 dark:text-green-400' :
                    (sim.totalCost / amount) * 100 < 2 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {((sim.totalCost / amount) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface SettlementPanelProps {
  paymentRails: PaymentRail[];
}

const SettlementPanel: React.FC<SettlementPanelProps> = ({ paymentRails }) => {
  const [selectedRail, setSelectedRail] = useState<string | null>(null);
  const [files, setFiles] = useState<SettlementFile[]>([
    {
      id: '1',
      railId: 'ach',
      filename: 'settlement_20240315.csv',
      importedAt: new Date(),
      variance: 0.05,
      status: 'success',
      downloadUrl: '#'
    },
    {
      id: '2',
      railId: 'wire',
      filename: 'settlement_20240314.csv',
      importedAt: new Date(Date.now() - 86400000),
      variance: 2.5,
      status: 'warning',
      downloadUrl: '#'
    },
    {
      id: '3',
      railId: 'card',
      filename: 'settlement_20240313.csv',
      importedAt: new Date(Date.now() - 172800000),
      variance: 0.02,
      status: 'success',
      downloadUrl: '#'
    }
  ]);

  const getStatusIcon = (status: SettlementFile['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getVarianceColor = (variance: number) => {
    if (variance < 0.1) return 'text-green-500 dark:text-green-400';
    if (variance < 1) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle file upload logic here
    console.log('File upload:', e.target.files);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Settlement Files
          </h3>
          <div className="flex items-center space-x-2">
            <select
              value={selectedRail || ''}
              onChange={(e) => setSelectedRail(e.target.value || null)}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="">All Rails</option>
              {paymentRails.map(rail => (
                <option key={rail.id} value={rail.id}>{rail.name}</option>
              ))}
            </select>
            <label className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors duration-300">
              <Plus className="w-4 h-4 mr-1" />
              Import File
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="space-y-4">
          {files
            .filter(file => !selectedRail || file.railId === selectedRail)
            .map((file) => {
              const rail = paymentRails.find(r => r.id === file.railId);
              if (!rail) return null;

              return (
                <div
                  key={file.id}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                        <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {file.filename}
                        </h4>
                        <div className="flex items-center mt-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {rail.name}
                          </span>
                          <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(file.importedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(file.status)}
                      <a
                        href={file.downloadUrl}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-300"
                      >
                        <Download className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </a>
                    </div>
                  </div>

                  {/* Variance Analysis */}
                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Variance
                        </span>
                        <span className={`text-sm font-medium ${getVarianceColor(file.variance)}`}>
                          {file.variance}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            file.variance < 0.1 ? 'bg-green-500' :
                            file.variance < 1 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(file.variance * 10, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Status Indicators */}
                    <div className="flex items-center space-x-4 pt-2">
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${
                          file.status === 'success' ? 'bg-green-500' :
                          file.status === 'warning' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} />
                        <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {file.status}
                        </span>
                      </div>
                      {file.variance >= 1 && (
                        <span className="text-sm text-red-500 dark:text-red-400">
                          Requires Review
                        </span>
                      )}
                      {file.variance < 0.1 && (
                        <span className="text-sm text-green-500 dark:text-green-400">
                          Auto-Reconciled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {files.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No settlement files found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface ThroughputChartProps {
  paymentRails: PaymentRail[];
}

const ThroughputChart: React.FC<ThroughputChartProps> = ({ paymentRails }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [isLive, setIsLive] = useState(false);
  const [selectedRail, setSelectedRail] = useState<string | null>(null);

  const timeframes = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' }
  ];

  const getStatusIcon = (status: PaymentRail['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'maintenance': return <Clock className="w-4 h-4" />;
      case 'down': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getSparklinePoints = (data: number[], width: number = 100, height: number = 30) => {
    if (data.length < 2) return '';

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    });

    return points.join(' ');
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLive) {
      interval = setInterval(() => {
        // Simulate real-time updates
        console.log('Updating throughput data...');
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Throughput Monitor
          </h3>
          <div className="flex items-center space-x-2">
            <select
              value={selectedRail || ''}
              onChange={(e) => setSelectedRail(e.target.value || null)}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="">All Rails</option>
              {paymentRails.map(rail => (
                <option key={rail.id} value={rail.id}>{rail.name}</option>
              ))}
            </select>
            <div className="flex items-center rounded-lg border border-gray-300 dark:border-gray-600 p-1">
              {timeframes.map(tf => (
                <button
                  key={tf.value}
                  onClick={() => setSelectedTimeframe(tf.value as any)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors duration-300 ${
                    selectedTimeframe === tf.value
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsLive(!isLive)}
              className={`p-2 rounded-lg transition-colors duration-300 ${
                isLive
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
            >
              {isLive ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {paymentRails
            .filter(rail => !selectedRail || rail.id === selectedRail)
            .map((rail) => (
              <div
                key={rail.id}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      rail.status === 'active' ? 'bg-green-100 dark:bg-green-900/30' :
                      rail.status === 'maintenance' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                      'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      <rail.icon className={`w-5 h-5 ${
                        rail.status === 'active' ? 'text-green-600 dark:text-green-400' :
                        rail.status === 'maintenance' ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {rail.name}
                      </h4>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          rail.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          rail.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {getStatusIcon(rail.status)}
                          <span className="ml-1 capitalize">{rail.status}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(rail.throughput[rail.throughput.length - 1])}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Transactions/hour
                    </div>
                  </div>
                </div>

                {/* Sparkline */}
                <div className="relative h-[60px]">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 100 30"
                    preserveAspectRatio="none"
                  >
                    {/* Grid Lines */}
                    <line
                      x1="0"
                      y1="15"
                      x2="100"
                      y2="15"
                      stroke="currentColor"
                      strokeWidth="0.1"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    {/* Sparkline */}
                    <polyline
                      points={getSparklinePoints(rail.throughput)}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      className="text-blue-500"
                    />
                  </svg>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Success Rate
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {rail.successRate}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Avg Time
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {rail.avgProcessingTime}s
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Error Rate
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {rail.errorRate}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

const PaymentRails: React.FC = () => {
  const [selectedRail, setSelectedRail] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingRail, setEditingRail] = useState<PaymentRail | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [metrics, setMetrics] = useState<PaymentMetrics>({
    totalVolume: 0,
    totalTransactions: 0,
    successRate: 0,
    avgProcessingTime: 0,
    activeRails: 0,
    costSavings: 0,
    totalRails: 0,
    disabledRails: 0,
    dailySavings: 0,
    monthlyThroughput: 0
  });

  const paymentRails: PaymentRail[] = [
    {
      id: 'ach',
      name: 'ACH Network',
      type: 'ACH',
      status: 'active',
      volume: 2500000,
      successRate: 98.5,
      avgProcessingTime: 1.2,
      cost: 0.25,
      fixedFee: 0.05,
      fxSpread: 0.01,
      slaTarget: 99.9,
      description: 'Automated Clearing House for domestic bank transfers',
      features: ['Low cost', 'Batch processing', 'Next-day settlement', 'High volume'],
      icon: Building2,
      lastPing: new Date(),
      throughput: [1000000, 2000000, 3000000],
      errorRate: 0.05
    },
    {
      id: 'wire',
      name: 'Wire Transfer',
      type: 'Wire',
      status: 'active',
      volume: 1500000,
      successRate: 99.2,
      avgProcessingTime: 0.5,
      cost: 15.00,
      fixedFee: 1.00,
      fxSpread: 0.02,
      slaTarget: 99.9,
      description: 'Real-time domestic and international wire transfers',
      features: ['Real-time', 'High value', 'Same-day settlement', 'Secure'],
      icon: Zap,
      lastPing: new Date(),
      throughput: [500000, 1000000, 1500000],
      errorRate: 0.02
    },
    {
      id: 'card',
      name: 'Card Networks',
      type: 'Card',
      status: 'active',
      volume: 5000000,
      successRate: 99.8,
      avgProcessingTime: 0.1,
      cost: 2.5,
      fixedFee: 0.10,
      fxSpread: 0.005,
      slaTarget: 99.9,
      description: 'Visa, Mastercard, and other card payment networks',
      features: ['Instant', 'Global reach', 'High success rate', 'Fraud protection'],
      icon: CreditCard,
      lastPing: new Date(),
      throughput: [2000000, 4000000, 6000000],
      errorRate: 0.01
    },
    {
      id: 'swift',
      name: 'SWIFT Network',
      type: 'SWIFT',
      status: 'active',
      volume: 800000,
      successRate: 99.0,
      avgProcessingTime: 2.0,
      cost: 25.00,
      fixedFee: 5.00,
      fxSpread: 0.03,
      slaTarget: 99.9,
      description: 'Society for Worldwide Interbank Financial Telecommunication',
      features: ['International', 'Bank-to-bank', 'High security', 'Standardized'],
      icon: Globe,
      lastPing: new Date(),
      throughput: [100000, 200000, 300000],
      errorRate: 0.03
    },
    {
      id: 'sepa',
      name: 'SEPA',
      type: 'SEPA',
      status: 'active',
      volume: 600000,
      successRate: 98.8,
      avgProcessingTime: 1.0,
      cost: 0.50,
      fixedFee: 0.02,
      fxSpread: 0.008,
      slaTarget: 99.9,
      description: 'Single Euro Payments Area for European transactions',
      features: ['European', 'Low cost', 'Standardized', 'Fast'],
      icon: Network,
      lastPing: new Date(),
      throughput: [50000, 100000, 150000],
      errorRate: 0.02
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      type: 'Crypto',
      status: 'active',
      volume: 300000,
      successRate: 95.5,
      avgProcessingTime: 0.3,
      cost: 1.00,
      fixedFee: 0.20,
      fxSpread: 0.05,
      slaTarget: 99.9,
      description: 'Blockchain-based digital currency payments',
      features: ['Decentralized', 'Fast', 'Low fees', 'Global'],
      icon: Shield,
      lastPing: new Date(),
      throughput: [10000, 20000, 30000],
      errorRate: 0.05
    }
  ];

  useEffect(() => {
    // Simulate connection status
    setIsConnected(true);
    
    // Calculate metrics
    const totalVolume = paymentRails.reduce((sum, rail) => sum + rail.volume, 0);
    const totalTransactions = paymentRails.reduce((sum, rail) => sum + Math.floor(rail.volume / 100), 0);
    const avgSuccessRate = paymentRails.reduce((sum, rail) => sum + rail.successRate, 0) / paymentRails.length;
    const avgProcessingTime = paymentRails.reduce((sum, rail) => sum + rail.avgProcessingTime, 0) / paymentRails.length;
    const activeRails = paymentRails.filter(rail => rail.status === 'active').length;
    const costSavings = paymentRails.reduce((sum, rail) => sum + (rail.volume * 0.01), 0); // Simulated savings

    setMetrics({
      totalVolume,
      totalTransactions,
      successRate: avgSuccessRate,
      avgProcessingTime,
      activeRails,
      costSavings,
      totalRails: paymentRails.length,
      disabledRails: paymentRails.filter(rail => rail.status === 'down').length,
      dailySavings: 0, // Placeholder for daily savings
      monthlyThroughput: 0 // Placeholder for monthly throughput
    });
  }, []);

  const handleEditRail = (rail: PaymentRail) => {
    setEditingRail(rail);
    setIsDrawerOpen(true);
  };

  const handleSaveRail = (updatedRail: PaymentRail) => {
    // Here you would typically make an API call to update the rail
    console.log('Saving rail:', updatedRail);
    setIsDrawerOpen(false);
    setEditingRail(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'maintenance': return 'text-yellow-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'maintenance': return <Clock className="w-4 h-4" />;
      case 'down': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Enhanced Header Metrics */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Rails Status */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Rails Status</h3>
                <div className={`flex items-center ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                  {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metrics.activeRails}/{metrics.totalRails}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Active Rails</span>
                </div>
                <div className="mt-2 flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(metrics.activeRails / metrics.totalRails) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {((metrics.activeRails / metrics.totalRails) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Daily Savings */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Daily Savings</h3>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(metrics.dailySavings)}
                  </span>
                  <div className="flex items-center text-green-500">
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-sm ml-1">+12.5%</span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    vs. Previous Day
                  </span>
                </div>
              </div>
            </div>

            {/* Success Rate */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Success Rate</h3>
                <Activity className="w-4 h-4 text-blue-500" />
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metrics.successRate.toFixed(1)}%
                  </span>
                  <div className="flex items-center text-blue-500">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm ml-1">Healthy</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${metrics.successRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Volume */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Volume</h3>
                <BarChart3 className="w-4 h-4 text-purple-500" />
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(metrics.monthlyThroughput)}
                  </span>
                  <div className="flex items-center text-purple-500">
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-sm ml-1">+8.3%</span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatNumber(metrics.totalTransactions)} Transactions
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Rail Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paymentRails.map((rail) => (
            <motion.div
              key={rail.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden"
            >
              {/* Rail Header */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      rail.status === 'active' ? 'bg-green-100 dark:bg-green-900/30' :
                      rail.status === 'maintenance' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                      'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      <rail.icon className={`w-5 h-5 ${
                        rail.status === 'active' ? 'text-green-600 dark:text-green-400' :
                        rail.status === 'maintenance' ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{rail.name}</h3>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          rail.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          rail.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {getStatusIcon(rail.status)}
                          <span className="ml-1 capitalize">{rail.status}</span>
                        </span>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          Last ping: {new Date(rail.lastPing).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEditRail(rail)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-300"
                  >
                    <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                {/* Commercial Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Volume (24h)</span>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(rail.volume)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Cost per Tx</span>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(rail.cost)}
                    </div>
                  </div>
                </div>

                {/* Technical Metrics */}
                <div className="space-y-3">
                  {/* Success Rate */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Success Rate</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {rail.successRate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-green-500 h-1.5 rounded-full"
                        style={{ width: `${rail.successRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Processing Time */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Avg Processing Time</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {rail.avgProcessingTime}s
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${(rail.avgProcessingTime / 3) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Error Rate */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Error Rate</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {rail.errorRate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          rail.errorRate < 1 ? 'bg-green-500' :
                          rail.errorRate < 5 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${rail.errorRate * 10}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {rail.features.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-slate-700/50 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      className={`p-2 rounded-lg transition-colors duration-300 ${
                        rail.status === 'active'
                          ? 'hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400'
                          : 'hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400'
                      }`}
                    >
                      {rail.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-300">
                      <RefreshCw className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300">
                      View Details
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Smart Routing Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Smart Payment Routing</h2>
              <p className="text-blue-100 mb-6">
                Our intelligent routing engine automatically selects the optimal payment rail based on:
              </p>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>Cost optimization and volume discounts</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>Processing speed requirements</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>Success rate and reliability</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>Geographic and regulatory compliance</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Routing Decision</h3>
                  <Route className="w-5 h-5" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-blue-100">Amount:</span>
                    <span className="font-semibold">$1,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-100">Destination:</span>
                    <span className="font-semibold">US Bank</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-100">Selected Rail:</span>
                    <span className="font-semibold text-green-300">ACH Network</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-100">Estimated Cost:</span>
                    <span className="font-semibold">$0.25</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-100">Processing Time:</span>
                    <span className="font-semibold">1-2 business days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Advanced Features
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Comprehensive payment infrastructure with enterprise-grade features
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: 'Security & Compliance',
              description: 'Bank-grade security with SOC 2, PCI DSS, and regulatory compliance',
              features: ['End-to-end encryption', 'Fraud detection', 'Audit trails', 'Compliance reporting']
            },
            {
              icon: BarChart3,
              title: 'Analytics & Monitoring',
              description: 'Real-time insights into payment performance and optimization opportunities',
              features: ['Performance metrics', 'Cost analysis', 'Success rate tracking', 'Custom dashboards']
            },
            {
              icon: Settings,
              title: 'Configuration & Control',
              description: 'Flexible configuration options for custom payment workflows',
              features: ['Custom routing rules', 'Webhook integration', 'API management', 'Rate limiting']
            },
            {
              icon: Users,
              title: 'Multi-tenant Support',
              description: 'Built for scale with enterprise multi-tenant architecture',
              features: ['Isolated environments', 'Role-based access', 'Custom branding', 'White-label options']
            },
            {
              icon: FileText,
              title: 'Documentation & SDKs',
              description: 'Comprehensive documentation and SDKs for easy integration',
              features: ['REST APIs', 'gRPC services', 'SDKs for major languages', 'Integration guides']
            },
            {
              icon: ExternalLink,
              title: 'Third-party Integrations',
              description: 'Seamless integration with popular payment processors and banks',
              features: ['Stripe integration', 'Plaid connectivity', 'Bank APIs', 'Webhook support']
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6"
            >
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl w-fit mb-4">
                <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {feature.description}
              </p>
              <ul className="space-y-2">
                {feature.features.map((item, idx) => (
                  <li key={idx} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-lg p-8 text-center text-white"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Connect your payment infrastructure to our intelligent routing system and start optimizing your payment operations today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-300 flex items-center justify-center space-x-2">
              <Play className="w-5 h-5" />
              <span>Start Integration</span>
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-300 flex items-center justify-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>View Documentation</span>
            </button>
          </div>
        </motion.div>
      </div>
      
      {/* Rail Drawer */}
      <RailDrawer
        rail={editingRail}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingRail(null);
        }}
        onSave={handleSaveRail}
      />

      {/* Cost Simulator */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <CostSimulator paymentRails={paymentRails} />
      </div>

      {/* Settlement Panel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <SettlementPanel paymentRails={paymentRails} />
      </div>

      {/* Throughput Chart */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <ThroughputChart paymentRails={paymentRails} />
      </div>
    </div>
  );
};

export default PaymentRails; 