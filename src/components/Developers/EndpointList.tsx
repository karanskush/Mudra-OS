import React from 'react';

export type Endpoint = {
  method: string;
  path: string;
  description: string;
  key: string;
};

const EndpointList = ({ endpoints, onSelect, selectedKey }: { endpoints: Endpoint[], onSelect: (key: string) => void, selectedKey: string }) => (
  <div className="space-y-2">
    {endpoints.map(ep => (
      <button
        key={ep.key}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-left ${selectedKey === ep.key ? 'bg-blue-50  border-blue-300 ' : 'bg-white  border-gray-200  hover:bg-blue-50 :bg-slate-700'}`}
        onClick={() => onSelect(ep.key)}
      >
        <span className={`font-mono text-xs px-2 py-1 rounded ${ep.method === 'GET' ? 'bg-brand-500 text-secondary' : ep.method === 'POST' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{ep.method}</span>
        <span className="font-mono text-xs text-gray-800 ">{ep.path}</span>
        <span className="ml-auto text-sm text-gray-600 ">{ep.description}</span>
      </button>
    ))}
  </div>
);

export default EndpointList; 