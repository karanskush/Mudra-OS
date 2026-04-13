import React from 'react';
import { History } from 'lucide-react';

const changelog = [
  { version: 'v2.0', date: '2024-06-01', notes: 'Major update: Added KYC endpoints, improved error handling, and introduced API playground.' },
  { version: 'v1.5', date: '2024-04-15', notes: 'Added Ledger endpoints and analytics features.' },
  { version: 'v1.0', date: '2024-01-10', notes: 'Initial release with Auth, Users, and Accounts APIs.' },
];

const Changelog: React.FC = () => (
  <section className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50   rounded-2xl shadow border border-gray-200 ">
    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
      <History className="w-6 h-6 text-blue-600 " /> API Changelog
    </h2>
    <ul className="space-y-2">
      {changelog.map(entry => (
        <li key={entry.version} className="border-l-4 border-blue-400 pl-4 py-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-blue-700 ">{entry.version}</span>
            <span className="text-xs text-gray-500 ">({entry.date})</span>
          </div>
          <div className="text-gray-700  text-sm">{entry.notes}</div>
        </li>
      ))}
    </ul>
  </section>
);

export default Changelog; 