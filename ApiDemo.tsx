'use client';

import { useState } from 'react';
import { AgentResponse } from '@/lib/types';

interface ApiDemoProps {
  lastResult: AgentResponse | null;
  lastInput: string;
}

export default function ApiDemo({ lastResult, lastInput }: ApiDemoProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const curlCommand = `curl -X POST http://localhost:3009/api/agent \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify({ input: lastInput || 'Need 1000 stainless steel tubes for oil refinery use' }, null, 2)}'`;

  return (
    <div className="border-t border-gray-200">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-medium text-gray-700">API Access</span>
        <span className="text-xs text-gray-400">{isCollapsed ? 'Show' : 'Hide'}</span>
      </button>

      {!isCollapsed && (
        <div className="px-6 pb-4">
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-xs font-mono text-gray-100 whitespace-pre-wrap">
              <code>{curlCommand}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
