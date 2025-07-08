import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const RouterTest: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const testRoutes = [
    '/',
    '/ledger',
    '/kyc',
    '/developers',
    '/grpc-demo',
    '/status'
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Router Test</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Current Location:</h2>
        <p className="font-mono text-sm">Pathname: {location.pathname}</p>
        <p className="font-mono text-sm">Search: {location.search}</p>
        <p className="font-mono text-sm">Hash: {location.hash}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Test Navigation:</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {testRoutes.map((route) => (
            <button
              key={route}
              onClick={() => navigate(route)}
              className={`p-3 rounded-lg border transition-colors ${
                location.pathname === route
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {route === '/' ? 'Home' : route.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Manual Navigation:</h2>
        <div className="flex gap-4">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Go Back
          </button>
          <button
            onClick={() => window.history.forward()}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Go Forward
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Reload Page
          </button>
        </div>
      </div>

      <div className="p-4 bg-yellow-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Instructions:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Click the test navigation buttons to see if routing works</li>
          <li>Check if the URL changes in the address bar</li>
          <li>Try refreshing the page on different routes</li>
          <li>Use browser back/forward buttons</li>
          <li>Check the console for route change logs</li>
        </ul>
      </div>
    </div>
  );
};

export default RouterTest; 