import React from 'react';
import { Download, KeyRound, Github, MessageCircle } from 'lucide-react';

const QuickStart: React.FC = () => (
  <section className="mb-8 p-6 bg-gradient-to-r from-blue-100 to-blue-50   rounded-2xl shadow border border-blue-200 ">
    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
      <KeyRound className="w-6 h-6 text-blue-600 " /> Quick Start
    </h2>
    <ol className="list-decimal ml-6 text-gray-700  mb-4">
      <li>Sign up and log in to your developer account.</li>
      <li>Generate your API key from the dashboard.</li>
      <li>Authenticate requests by including your API key in the <span className="font-mono bg-gray-200  px-1 rounded">Authorization</span> header.</li>
      <li>Explore endpoints below and use the interactive playground to test requests.</li>
    </ol>
    <div className="flex gap-4 mt-4 flex-wrap">
      <a href="/api-docs/swagger.json" download className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-primary px-4 py-2 rounded-lg font-semibold shadow transition-all">
        <Download className="w-4 h-4" /> Download Swagger
      </a>
      <a href="/api-docs/postman_collection.json" download className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-primary px-4 py-2 rounded-lg font-semibold shadow transition-all">
        <Download className="w-4 h-4" /> Download Postman
      </a>
      <a href="https://github.com/your-org/mudracoreos" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-primary px-4 py-2 rounded-lg font-semibold shadow transition-all">
        <Github className="w-4 h-4" /> GitHub SDKs & Code
      </a>
      <a href="https://community.yourdomain.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-brand-500 hover:bg-brand-500 text-primary px-4 py-2 rounded-lg font-semibold shadow transition-all">
        <MessageCircle className="w-4 h-4" /> Join Community Chat
      </a>
    </div>
    <div className="mt-6">
      <h3 className="font-semibold mb-2">Guides & Tutorials</h3>
      <ul className="list-disc ml-6 text-blue-700 ">
        <li><a href="/docs/getting-started" className="hover:underline">Getting Started with the API</a></li>
        <li><a href="/docs/authentication" className="hover:underline">Authentication & Security</a></li>
        <li><a href="/docs/integrate-sdk" className="hover:underline">Integrating with SDKs</a></li>
        <li><a href="/docs/common-errors" className="hover:underline">Handling Common Errors</a></li>
      </ul>
    </div>
  </section>
);

export default QuickStart; 