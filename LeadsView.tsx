'use client';

import { useState, useEffect } from 'react';
import { Lead, getLeads } from '@/lib/store';

interface LeadsViewProps {
  onViewLead: (lead: Lead) => void;
}

const STATUS_COLORS: Record<Lead['status'], string> = {
  new: 'bg-gray-100 text-gray-700',
  qualified: 'bg-gray-100 text-gray-700',
  proposal: 'bg-gray-100 text-gray-700',
  negotiation: 'bg-gray-100 text-gray-700',
  closed: 'bg-gray-100 text-gray-700',
};

const PRIORITY_COLORS: Record<string, string> = {
  High: 'bg-gray-100 text-gray-700',
  Medium: 'bg-gray-100 text-gray-700',
  Low: 'bg-gray-100 text-gray-600',
};

export default function LeadsView({ onViewLead }: LeadsViewProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<Lead['status'] | 'all'>('all');

  useEffect(() => {
    const refresh = () => setLeads(getLeads());
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  const filteredLeads = filter === 'all' ? leads : leads.filter(l => l.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Opportunities</h1>
          <p className="text-sm text-gray-500 mt-0.5">{leads.length} opportunities in pipeline</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filter === 'all' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          All ({leads.length})
        </button>
        {(['new', 'qualified', 'proposal', 'negotiation', 'closed'] as Lead['status'][]).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === status ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} ({leads.filter(l => l.status === status).length})
          </button>
        ))}
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Company</th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Industry</th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Intent</th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Fit</th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Stage</th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Signal</th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Est. Value</th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center">
                  <p className="text-sm text-gray-500">No opportunities found</p>
                  <p className="text-xs text-gray-400 mt-1">Analyze a lead to discover opportunities</p>
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => onViewLead(lead)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-gray-900">{lead.company || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{lead.email || 'No email'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-gray-900">{lead.extracted_requirements.product}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-gray-700">{lead.extracted_requirements.industry}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-gray-900">{lead.lead_score}</span>
                      <span className="text-[10px] text-gray-400">/ 100</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${PRIORITY_COLORS[lead.lead_priority]}`}>
                      {lead.lead_priority}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${STATUS_COLORS[lead.status]}`}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {lead.prioritizationSignal ? (
                      <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100 text-gray-700">
                        {lead.prioritizationSignal}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-gray-900">{lead.estimated_deal_value}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs text-gray-500">{new Date(lead.createdAt).toLocaleDateString()}</p>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
