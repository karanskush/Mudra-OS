import React from 'react';
import { Database, Users, Shield, CreditCard, Activity, Code, Zap } from 'lucide-react';

const categories = [
  { key: 'authentication', name: 'Auth', icon: <Shield className="w-5 h-5 mr-2" /> },
  { key: 'accounts', name: 'Accounts', icon: <Users className="w-5 h-5 mr-2" /> },
  { key: 'ledger', name: 'Ledger', icon: <Database className="w-5 h-5 mr-2" /> },
  { key: 'payments', name: 'Payments', icon: <CreditCard className="w-5 h-5 mr-2" /> },
  { key: 'kyc', name: 'KYC', icon: <Shield className="w-5 h-5 mr-2" /> },
  { key: 'analytics', name: 'Analytics', icon: <Activity className="w-5 h-5 mr-2" /> },
  { key: 'grpc', name: 'gRPC APIs', icon: <Zap className="w-5 h-5 mr-2" /> },
  { key: 'health', name: 'Health', icon: <Activity className="w-5 h-5 mr-2" /> },
];

const Sidebar = ({ selected, onSelect }: { selected: string, onSelect: (key: string) => void }) => (
  <aside className="w-56 bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 border-r border-gray-200 dark:border-slate-700 h-full sticky top-0 p-6">
    <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      <Code className="w-6 h-6" /> API Categories
    </h2>
    <nav className="flex flex-col gap-2">
      {categories.map(cat => (
        <button
          key={cat.key}
          className={`flex items-center px-4 py-2 rounded-lg text-left transition-all font-medium ${selected === cat.key ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'hover:bg-blue-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200'}`}
          onClick={() => onSelect(cat.key)}
        >
          {cat.icon}
          {cat.name}
        </button>
      ))}
    </nav>
  </aside>
);

export default Sidebar; 