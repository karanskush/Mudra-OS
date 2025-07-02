import React, { useState } from 'react';

export type EndpointDetailProps = {
  endpoint: {
    method: string;
    path: string;
    description: string;
    parameters?: { name: string; type: string; required: boolean; description: string }[];
    requestExample?: string;
    responseExample?: string;
    errorCodes?: { code: string; message: string }[];
  };
};

const EndpointDetail: React.FC<EndpointDetailProps> = ({ endpoint }) => {
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [apiKey, setApiKey] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParamChange = (name: string, value: string) => {
    setParamValues(v => ({ ...v, [name]: value }));
  };

  const buildUrl = () => {
    let url = endpoint.path;
    // Replace path params (e.g., :id)
    if (endpoint.parameters) {
      endpoint.parameters.forEach(param => {
        if (url.includes(`:${param.name}`) && paramValues[param.name]) {
          url = url.replace(`:${param.name}`, encodeURIComponent(paramValues[param.name]));
        }
      });
    }
    // For GET, add query params
    if (endpoint.method === 'GET' && endpoint.parameters) {
      const query = endpoint.parameters
        .filter(p => !url.includes(p.name) && paramValues[p.name])
        .map(p => `${encodeURIComponent(p.name)}=${encodeURIComponent(paramValues[p.name])}`)
        .join('&');
      if (query) url += (url.includes('?') ? '&' : '?') + query;
    }
    return url;
  };

  const handleSend = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const url = buildUrl();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
      let body: string | undefined = undefined;
      if (endpoint.method !== 'GET' && endpoint.parameters) {
        const bodyObj: Record<string, any> = {};
        endpoint.parameters.forEach(param => {
          if (!url.includes(param.name) && paramValues[param.name]) {
            bodyObj[param.name] = paramValues[param.name];
          }
        });
        body = Object.keys(bodyObj).length > 0 ? JSON.stringify(bodyObj) : undefined;
      }
      const res = await fetch(url, {
        method: endpoint.method,
        headers,
        ...(body ? { body } : {}),
      });
      const text = await res.text();
      try {
        setResponse(JSON.stringify(JSON.parse(text), null, 2));
      } catch {
        setResponse(text);
      }
      if (!res.ok) {
        setError(`HTTP ${res.status}: ${res.statusText}`);
      }
    } catch (err: any) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">{endpoint.method} <span className="font-mono text-blue-600 dark:text-blue-400">{endpoint.path}</span></h2>
      <p className="mb-4 text-gray-700 dark:text-gray-300">{endpoint.description}</p>
      {endpoint.parameters && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Parameters</h3>
          <div className="space-y-2">
            {endpoint.parameters.map(param => (
              <div key={param.name} className="flex items-center gap-2">
                <input
                  className="border rounded px-2 py-1 font-mono text-xs w-32 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                  placeholder={param.name}
                  value={paramValues[param.name] || ''}
                  onChange={e => handleParamChange(param.name, e.target.value)}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">{param.type}{param.required ? ' (required)' : ''} - {param.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mb-4">
        <label className="block font-semibold mb-1">API Key / Token</label>
        <input
          className="border rounded px-2 py-1 font-mono text-xs w-full bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
          placeholder="Paste your API key or token here"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow transition-all"
          onClick={handleSend}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Request'}
        </button>
      </div>
      {error && <div className="mb-4 text-red-600 dark:text-red-400 font-mono text-xs">{error}</div>}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Request Example</h3>
        <pre className="bg-gray-100 dark:bg-slate-800 rounded p-3 text-xs overflow-x-auto"><code>{endpoint.requestExample || '...'}</code></pre>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Response Example</h3>
        <pre className="bg-gray-100 dark:bg-slate-800 rounded p-3 text-xs overflow-x-auto"><code>{response || endpoint.responseExample || '...'}</code></pre>
      </div>
      {endpoint.errorCodes && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Error Codes</h3>
          <ul className="list-disc ml-6 text-xs text-red-600 dark:text-red-400">
            {endpoint.errorCodes.map(err => (
              <li key={err.code}><span className="font-mono">{err.code}</span>: {err.message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EndpointDetail; 