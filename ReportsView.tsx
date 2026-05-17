'use client';

import { useState, useEffect } from 'react';
import { getLeads, getMetrics, getRecentReports, SavedReport } from '@/lib/store';
import { Lead } from '@/lib/store';
import { Metrics } from '@/lib/types';

export default function ReportsView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    totalLeads: 0, highPriority: 0, conversionRate: 0,
    pipelineValue: '₹0', avgScore: 0, reportsGenerated: 0,
    avgDealSize: '₹0', pipelineHealth: { early: 0, late: 0 },
  });
  const [reports, setReports] = useState<SavedReport[]>([]);

  useEffect(() => {
    const refresh = () => {
      setLeads(getLeads());
      setMetrics(getMetrics());
      setReports(getRecentReports(10));
    };
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  // Lead quality distribution
  const highQuality = leads.filter(l => l.lead_score >= 65).length;
  const midQuality = leads.filter(l => l.lead_score >= 35 && l.lead_score < 65).length;
  const lowQuality = leads.filter(l => l.lead_score < 35).length;

  // Pipeline stages
  const pipelineByStatus = {
    new: leads.filter(l => l.status === 'new').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    proposal: leads.filter(l => l.status === 'proposal').length,
    negotiation: leads.filter(l => l.status === 'negotiation').length,
    closed: leads.filter(l => l.status === 'closed').length,
  };

  // Conversion probability by score tier
  const highScoreLeads = leads.filter(l => l.lead_score >= 65);
  const midScoreLeads = leads.filter(l => l.lead_score >= 35 && l.lead_score < 65);
  const conversionProb = leads.length > 0
    ? Math.round((leads.filter(l => l.status === 'closed').length / leads.length) * 100)
    : 0;

  // Action efficiency (mock metric based on lead-to-activity ratio)
  const totalActivities = reports.length + leads.filter(l => l.status !== 'new').length;
  const actionEfficiency = leads.length > 0
    ? Math.round((totalActivities / leads.length) * 20)
    : 0;

  // Avg deal size calculation
  const dealValues = leads.map(l => {
    const match = l.estimated_deal_value.match(/\$?([\d.]+)([KM])?/);
    if (match) {
      let val = parseFloat(match[1]);
      if (match[2] === 'K') val *= 1000;
      if (match[2] === 'M') val *= 1000000;
      return val;
    }
    return 0;
  }).filter(v => v > 0);
  const avgDealRaw = dealValues.length > 0 ? dealValues.reduce((a, b) => a + b, 0) / dealValues.length : 0;

  // High priority leads by stage
  const highPriorityByStage = {
    new: leads.filter(l => l.lead_priority === 'High' && l.status === 'new').length,
    qualified: leads.filter(l => l.lead_priority === 'High' && l.status === 'qualified').length,
    proposal: leads.filter(l => l.lead_priority === 'High' && l.status === 'proposal').length,
    negotiation: leads.filter(l => l.lead_priority === 'High' && l.status === 'negotiation').length,
    closed: leads.filter(l => l.lead_priority === 'High' && l.status === 'closed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Revenue Insights</h1>
          <p className="text-sm text-gray-500 mt-0.5">Pipeline performance and deal analytics</p>
        </div>
      </div>

      {/* Top Summary Row */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Total Opportunities</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalLeads}</p>
          <div className="flex items-center gap-1 mt-2">
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              metrics.totalLeads > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
            }`}>
              Active
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Avg Deal Size</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.avgDealSize}</p>
          <p className="text-[10px] text-gray-500 mt-1">Per lead</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Conversion Rate</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{metrics.conversionRate}%</p>
          <p className="text-[10px] text-gray-500 mt-1">{pipelineByStatus.closed} closed</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Avg Lead Score</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.avgScore || '--'}</p>
          <p className="text-[10px] text-gray-500 mt-1">Out of 100</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Pipeline Value</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.pipelineValue}</p>
          <p className="text-[10px] text-gray-500 mt-1">Open pipeline</p>
        </div>
      </div>

      {/* Lead Quality + Pipeline Health Row */}
      <div className="grid grid-cols-3 gap-5">
        {/* Lead Quality Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Lead Quality Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm text-gray-700">High (65+)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">{highQuality}</span>
                <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${leads.length > 0 ? (highQuality / leads.length) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-sm text-gray-700">Medium (35–64)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">{midQuality}</span>
                <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${leads.length > 0 ? (midQuality / leads.length) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                <span className="text-sm text-gray-700">Low (&lt;35)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">{lowQuality}</span>
                <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-400 rounded-full" style={{ width: `${leads.length > 0 ? (lowQuality / leads.length) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline Health */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Pipeline Health</h3>
          <div className="flex items-center gap-6 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{metrics.pipelineHealth.early}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Early Stage</p>
              <p className="text-[10px] text-gray-400">New + Qualified</p>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{metrics.pipelineHealth.late}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Late Stage</p>
              <p className="text-[10px] text-gray-400">Proposal + Negotiation</p>
            </div>
          </div>
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Closed Deals</span>
              <span className="text-sm font-semibold text-emerald-600">{pipelineByStatus.closed}</span>
            </div>
          </div>
        </div>

        {/* Conversion Probability Estimate */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Conversion Probability</h3>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-4xl font-bold text-gray-900">{conversionProb}%</span>
            <span className="text-xs text-gray-500 mb-1">estimated</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">High Score (65+)</span>
              <span className="text-xs font-semibold text-emerald-600">35%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Mid Score (35–64)</span>
              <span className="text-xs font-semibold text-blue-600">22%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Low Score (&lt;35)</span>
              <span className="text-xs font-semibold text-gray-600">8%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Breakdown + Action Efficiency */}
      <div className="grid grid-cols-5 gap-4">
        {Object.entries(pipelineByStatus).map(([status, count]) => (
          <div key={status} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{count}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{status}</p>
            {highPriorityByStage[status as keyof typeof highPriorityByStage] > 0 && (
              <p className="text-[9px] text-amber-600 mt-1 font-medium">
                {highPriorityByStage[status as keyof typeof highPriorityByStage]} high
              </p>
            )}
          </div>
        ))}
      </div>

      {/* High Priority Leads + Recent Reports */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">High Priority Leads</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {leads.filter(l => l.lead_priority === 'High').length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-gray-500">No high priority leads</p>
              </div>
            ) : (
              leads.filter(l => l.lead_priority === 'High').slice(0, 6).map((lead) => (
                <div key={lead.id} className="px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{lead.company || lead.extracted_requirements.product}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{lead.extracted_requirements.industry}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{lead.lead_score}</p>
                        <p className="text-[10px] text-gray-500">{lead.estimated_deal_value}</p>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-1 rounded ${
                        lead.status === 'new' ? 'bg-blue-50 text-blue-700' :
                        lead.status === 'qualified' ? 'bg-amber-50 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {lead.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Recent Reports</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {reports.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-gray-500">No reports generated</p>
              </div>
            ) : (
              reports.slice(0, 6).map((report) => (
                <div key={report.id} className="px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{report.leadName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(report.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        report.priority === 'High' ? 'bg-amber-50 text-amber-700' :
                        report.priority === 'Medium' ? 'bg-blue-50 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {report.priority}
                      </span>
                      <span className="text-sm font-bold text-gray-900">{report.score}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}