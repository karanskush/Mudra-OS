import React from 'react';
import { HelpCircle, Mail, Users } from 'lucide-react';

const faqs = [
  { q: 'How do I get an API key?', a: 'Sign up and log in to your developer account, then generate an API key from your dashboard.' },
  { q: 'How do I authenticate requests?', a: 'Include your API key in the Authorization header as a Bearer token.' },
  { q: 'Where can I find SDKs or code samples?', a: 'SDKs and code samples are available in the Quick Start section and on our GitHub.' },
  { q: 'How do I report a bug or request support?', a: 'Contact our support team via email or join our developer community.' },
];

const Support: React.FC = () => (
  <section className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-gray-50 dark:from-blue-900 dark:to-slate-900 rounded-2xl shadow border border-blue-200 dark:border-blue-800">
    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
      <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-300" /> Support & Community
    </h2>
    <div className="mb-4">
      <h3 className="font-semibold mb-2">Frequently Asked Questions</h3>
      <ul className="space-y-2">
        {faqs.map((faq, i) => (
          <li key={i} className="border-l-4 border-blue-400 pl-4 py-2">
            <div className="font-medium text-gray-800 dark:text-gray-100">{faq.q}</div>
            <div className="text-gray-600 dark:text-gray-300 text-sm">{faq.a}</div>
          </li>
        ))}
      </ul>
    </div>
    <div className="flex gap-6 mt-4">
      <a href="mailto:support@mudracoreos.com" className="flex items-center gap-2 text-blue-700 dark:text-blue-300 hover:underline">
        <Mail className="w-4 h-4" />
        support@mudracoreos.com
      </a>
      <a href="https://github.com/your-org/mudracoreos" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-700 dark:text-blue-300 hover:underline">
        <Users className="w-4 h-4" /> Developer Community
      </a>
    </div>
  </section>
);

export default Support; 