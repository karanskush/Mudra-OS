import React from 'react';
import { CreditCard } from 'lucide-react';

interface Account {
  id: string;
  name: string;
  accountNumber: string;
  balance: number;
  type: string;
}

interface AccountSelectorProps {
  accounts: Account[];
  onSelect: (account: Account) => void;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({ accounts, onSelect }) => {
  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-[#0E0E11] rounded-2xl">
      <h2 className="text-2xl font-semibold text-white mb-2">Select Source Account</h2>
      <p className="text-gray-400 mb-6">Choose the account to transfer from</p>
      
      <div className="space-y-3">
        {accounts.map((account) => (
          <button
            key={account.id}
            onClick={() => onSelect(account)}
            className="w-full group flex items-center justify-between p-4 bg-gray-900/50 hover:bg-gray-800/50 rounded-xl transition-all duration-200 border border-gray-800/50"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                <CreditCard size={20} />
              </div>
              <div className="text-left">
                <h3 className="text-white font-medium group-hover:text-white/90">{account.name}</h3>
                <p className="text-gray-400 text-sm">{account.accountNumber}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-lg font-medium ${account.balance < 0 ? 'text-red-400' : 'text-white'}`}>
                ${Math.abs(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AccountSelector; 