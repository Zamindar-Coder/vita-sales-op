'use client';

import { useState, useEffect } from 'react';
import { Lead, updateLeadStatus, getActivities, saveReport, ExternalSignals, getExternalSignals } from '@/lib/store';
import NotesPanel from './NotesPanel';

interface LeadDetailModalProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_OPTIONS: Lead['status'][] = ['new', 'qualified', 'proposal', 'negotiation', 'closed'];
const STATUS_LABELS: Record<Lead['status'], string> = {
  new: 'New',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed: 'Closed',
};

type TabType = 'overview' | 'notes';

export default function LeadDetailModal({ lead, isOpen, onClose }: LeadDetailModalProps) {
  const [status, setStatus] = useState(lead.status);
  const [activities, setActivities] = useState<{ time: string; action: string }[]>([]);
  const [signals, setSignals] = useState<ExternalSignals | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    setStatus(lead.status);
    setSignals(getExternalSignals(lead.extracted_requirements.industry));

    const leadActivities = getActivities().filter(a => a.leadId === lead.id);
    const activityList = leadActivities.length > 0
      ? leadActivities.map(a => ({ time: new Date(a.timestamp).toLocaleString(), action: a.details }))
      : [
          { time: new Date(lead.createdAt).toLocaleString(), action: 'Lead created from analysis' },
          { time: new Date(lead.createdAt).toLocaleString(), action: `Initial status: ${STATUS_LABELS[lead.status]}` },
        ];
    setActivities(activityList);
  }, [lead]);

  const handleStatusChange = (newStatus: Lead['status']) => {
    updateLeadStatus(lead.id, newStatus);
    setStatus(newStatus);
    setActivities(prev => [...prev, { time: new Date().toLocaleString(), action: `Status changed to ${STATUS_LABELS[newStatus]}` }]);
  };

  const handleCopyJSON = () => {
    const json = JSON.stringify(lead, null, 2);
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateReport = () => {
    saveReport({
      id: `rpt-${Date.now()}`,
      leadId: lead.id,
      leadName: lead.company || lead.extracted_requirements.product,
      score: lead.lead_score,
      priority: lead.lead_priority,
      timestamp: new Date().toISOString(),
      summary: lead.short_sales_response || lead.suggested_next_step,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 bg-gray-50">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">Lead Report</h2>
              <span className="text-xs text-gray-400">|</span>
              <span className="text-xs text-gray-500">{lead.id}</span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{lead.company || lead.extracted_requirements.product}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-8 py-2 border-b border-gray-200 bg-gray-50/50">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'overview' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'notes' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Context Memory
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'overview' ? (
            <div className="space-y-8">
              {/* Score Hero */}
              <div className="flex items-center gap-8 p-6 bg-gray-900 rounded-xl">
                <div className="text-center">
                  <p className="text-6xl font-bold text-white">{lead.lead_score}</p>
                  <p className="text-xs text-gray-400 mt-2 uppercase tracking-wider">Lead Score</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-sm font-medium px-3 py-1 rounded ${
                      lead.lead_priority === 'High' ? 'bg-amber-500/20 text-amber-400' :
                      lead.lead_priority === 'Medium' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {lead.lead_priority} Priority
                    </span>
                    <span className="text-sm text-gray-400">Confidence: {lead.confidence}%</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {lead.score_reasoning || `Score of ${lead.lead_score} reflects strong alignment with current market demand in ${lead.extracted_requirements.industry}.`}
                  </p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Est. Value</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{lead.estimated_deal_value}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Timeline</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{lead.recommended_timeline}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Industry</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{lead.extracted_requirements.industry}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Urgency</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{lead.extracted_requirements.urgency}</p>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Lead Overview */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">Lead Overview</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Product / Service</p>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{lead.extracted_requirements.product}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Quantity / Scope</p>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{lead.extracted_requirements.quantity}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Company</p>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{lead.company || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Contact</p>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{lead.contact}</p>
                      </div>
                    </div>
                  </div>

                  {/* External Signals */}
                  {signals && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">External Signals</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-gray-50 rounded-lg">
                          <p className="text-[9px] text-gray-400 uppercase">Demand</p>
                          <p className={`text-xs font-medium ${
                            signals.industryDemand === 'High' ? 'text-emerald-600' :
                            signals.industryDemand === 'Medium' ? 'text-blue-600' : 'text-gray-600'
                          }`}>{signals.industryDemand}</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-lg">
                          <p className="text-[9px] text-gray-400 uppercase">Trend</p>
                          <p className={`text-xs font-medium ${
                            signals.marketTrend === 'Increasing' ? 'text-emerald-600' :
                            signals.marketTrend === 'Decreasing' ? 'text-red-600' : 'text-gray-600'
                          }`}>{signals.marketTrend}</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-lg">
                          <p className="text-[9px] text-gray-400 uppercase">Price</p>
                          <p className={`text-xs font-medium ${
                            signals.priceIndex === 'Rising' ? 'text-amber-600' :
                            signals.priceIndex === 'Falling' ? 'text-red-600' : 'text-gray-600'
                          }`}>{signals.priceIndex}</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-lg">
                          <p className="text-[9px] text-gray-400 uppercase">Intent</p>
                          <p className={`text-xs font-medium ${
                            signals.buyingIntent === 'Strong' ? 'text-emerald-600' :
                            signals.buyingIntent === 'Moderate' ? 'text-blue-600' : 'text-gray-600'
                          }`}>{signals.buyingIntent}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Status */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">Status</h3>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(s)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            status === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Actions */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">Recommended Actions</h3>
                    <ul className="space-y-2">
                      {(lead.recommended_actions || []).map((action, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          </span>
                          <span className="text-sm text-gray-700">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Suggested Next Step */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">Next Step</h3>
                    <p className="text-sm font-medium text-gray-900">{lead.suggested_next_step}</p>
                  </div>
                </div>
              </div>

              {/* Generated Communication */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">Generated Response</h3>
                <p className="text-sm text-gray-700 p-4 bg-gray-50 rounded-xl leading-relaxed">
                  {lead.short_sales_response}
                </p>
              </div>

              {/* Activity Log */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">Activity Log</h3>
                <div className="space-y-2">
                  {activities.map((entry, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      <span className="text-xs text-gray-400 shrink-0">{entry.time}</span>
                      <span className="text-gray-700">{entry.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <NotesPanel leadId={lead.id} leadCompany={lead.company || lead.extracted_requirements.product} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCopyJSON}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {copied ? 'Copied' : 'Copy JSON'}
            </button>
            <button
              onClick={handleGenerateReport}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Save Report
            </button>
          </div>
          <p className="text-xs text-gray-400">Created: {new Date(lead.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}