'use client';

export default function SettingsView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configure your workspace and preferences</p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6 max-w-3xl">
        {/* General Settings */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">General</h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">Product</p>
                <p className="text-xs text-gray-500 mt-0.5">Vitam Sales Intelligence</p>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-700">v1.0.0</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">LLM Provider</p>
                <p className="text-xs text-gray-500 mt-0.5">AI model provider for analysis</p>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded bg-blue-50 text-blue-700">Gemini</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">LLM Model</p>
                <p className="text-xs text-gray-500 mt-0.5">gemini-2.0-flash-latest</p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Storage */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Data Storage</h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">Storage Type</p>
                <p className="text-xs text-gray-500 mt-0.5">Local browser storage</p>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded bg-emerald-50 text-emerald-700">Active</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">Data Persistence</p>
                <p className="text-xs text-gray-500 mt-0.5">Data persists until browser cache is cleared</p>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                    localStorage.removeItem('vitam_leads');
                    localStorage.removeItem('vitam_activity');
                    localStorage.removeItem('vitam_reports');
                    localStorage.removeItem('vitam_signals');
                    window.dispatchEvent(new Event('storage'));
                    window.location.reload();
                  }
                }}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-red-200 text-red-700 hover:bg-red-50 transition-colors"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>

        {/* API Configuration */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">API Configuration</h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">API Endpoint</p>
                <p className="text-xs text-gray-500 mt-0.5">/api/agent</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">API Key</p>
                <p className="text-xs text-gray-500 mt-0.5">Configured via .env.local</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">Fallback Mode</p>
                <p className="text-xs text-gray-500 mt-0.5">Uses deterministic mock data when no API key</p>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded bg-amber-50 text-amber-700">Enabled</span>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">About</h3>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-3 py-2">
              <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 24V8L16 16L8 24Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 24V16L24 8V24" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Vitam Sales Intelligence</p>
                <p className="text-xs text-gray-500">Enterprise AI for B2B manufacturing and industrial clients</p>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                A comprehensive sales intelligence platform that ingests leads, maps them to business context, scores them, compares to past leads, suggests next steps, generates reports, and stores history.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
