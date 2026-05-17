'use client';

import { useState, useEffect } from 'react';
import { Lead, getRecentLeads, getActivities, getMetrics, getTopOpportunity, getAtRiskLeads, getPipelineMovement, ActivityEntry } from '@/lib/store';
import { Metrics } from '@/lib/types';

interface DashboardViewProps {
  onRunAnalysis: (inquiry?: string) => void;
  onViewLead: (lead: Lead) => void;
}

export default function DashboardView({ onRunAnalysis, onViewLead }: DashboardViewProps) {
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    totalLeads: 0, highPriority: 0, conversionRate: 0,
    pipelineValue: '₹0', avgScore: 0, reportsGenerated: 0,
    avgDealSize: '₹0', pipelineHealth: { early: 0, late: 0 },
  });
  const [topOpp, setTopOpp] = useState<Lead | null>(null);
  const [atRiskLeads, setAtRiskLeads] = useState<Lead[]>([]);
  const [pipelineMovement, setPipelineMovement] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    const refresh = () => {
      setRecentLeads(getRecentLeads(5));
      setActivities(getActivities().slice(0, 8));
      setMetrics(getMetrics());
      setTopOpp(getTopOpportunity());
      setAtRiskLeads(getAtRiskLeads());
      setPipelineMovement(getPipelineMovement(5));
    };
    refresh();
    const interval = setInterval(refresh, 3000);
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Revenue Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Deal pipeline overview</p>
        </div>
        <button
          onClick={() => onRunAnalysis()}
          className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors"
        >
          New Opportunity
        </button>
      </div>

      {/* Top Opportunity Banner */}
      {topOpp && (
        <div className="bg-gray-900 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{topOpp.lead_score}</span>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Top Opportunity</p>
                <p className="text-lg font-semibold">{topOpp.company || topOpp.extracted_requirements.product}</p>
                <p className="text-sm text-gray-400 mt-0.5">{topOpp.extracted_requirements.industry} — {topOpp.extracted_requirements.product}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Est. Value</p>
                <p className="text-xl font-bold text-white">{topOpp.estimated_deal_value}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Priority</p>
                <p className="text-sm font-semibold text-gray-300">{topOpp.lead_priority}</p>
              </div>
              <button
                onClick={() => onViewLead(topOpp)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors"
              >
                View Opportunity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Total Opportunities</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalLeads}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">High Intent</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.highPriority}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Avg Intent Score</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.avgScore || '--'}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Pipeline Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.pipelineValue}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Avg Deal Size</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.avgDealSize}</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-3 gap-5">
        {/* Left Column - Recent Leads */}
        <div className="col-span-2 space-y-5">
          {/* Recent Leads Table */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Recent Opportunities</h3>
              <span className="text-xs text-gray-500">{recentLeads.length} opportunities</span>
            </div>
            <div className="divide-y divide-gray-100">
              {recentLeads.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm text-gray-500">No opportunities yet</p>
                  <p className="text-xs text-gray-400 mt-1">Analyze a lead to find your first opportunity</p>
                </div>
              ) : (
                recentLeads.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => onViewLead(lead)}
                    className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {lead.company || lead.extracted_requirements.product}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {lead.extracted_requirements.industry} — {lead.extracted_requirements.product}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className="text-xs font-medium text-gray-900 w-20">{lead.estimated_deal_value}</span>
                      <span className="text-sm font-bold text-gray-900 w-8">{lead.lead_score}</span>
                      <span className={`text-[10px] font-medium px-2 py-1 rounded ${
                        lead.lead_priority === 'High' ? 'bg-gray-900 text-white' :
                        lead.lead_priority === 'Medium' ? 'bg-gray-100 text-gray-700' :
                        'bg-gray-50 text-gray-500'
                      }`}>
                        {lead.lead_priority}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Pipeline Movement */}
          {pipelineMovement.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-3.5 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Pipeline Movement</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {pipelineMovement.map((activity) => (
                  <div key={activity.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900">{activity.leadName}</p>
                      <p className="text-xs text-gray-500">{activity.details}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - At Risk + Actions */}
        <div className="space-y-5">
          {/* At Risk Leads */}
          {atRiskLeads.length > 0 && (
            <div className="bg-white rounded-xl border border-amber-200 bg-amber-50/50">
              <div className="px-5 py-3.5 border-b border-amber-100">
                <h3 className="text-sm font-semibold text-amber-800">At Risk Leads</h3>
              </div>
              <div className="divide-y divide-amber-100">
                {atRiskLeads.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => onViewLead(lead)}
                    className="w-full px-5 py-3 flex items-center justify-between hover:bg-amber-50/50 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {lead.company || lead.extracted_requirements.product}
                      </p>
                      <p className="text-[10px] text-amber-700 mt-0.5">
                        Score: {lead.lead_score} — {lead.extracted_requirements.urgency} urgency
                      </p>
                    </div>
                    <span className="text-xs text-amber-600 font-medium">{lead.estimated_deal_value}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Immediate Actions */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Immediate Actions</h3>
            </div>
            <div className="px-5 py-4 space-y-3">
              {topOpp && topOpp.lead_priority === 'High' && (
                <div className="flex items-start gap-3 p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-emerald-800">Priority: Contact {topOpp.company}</p>
                    <p className="text-[10px] text-emerald-700 mt-0.5">Due within 4 hours</p>
                  </div>
                </div>
              )}
              {metrics.highPriority > 0 && (
                <div className="flex items-start gap-3 p-2 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-blue-800">{metrics.highPriority} High Priority Leads</p>
                    <p className="text-[10px] text-blue-700 mt-0.5">Review pipeline</p>
                  </div>
                </div>
              )}
              {recentLeads.length > 0 && (
                <div className="flex items-start gap-3 p-2 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Prepare quotes</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{recentLeads.filter(l => l.lead_priority === 'High').length || 0} high priority</p>
                  </div>
                </div>
              )}
              {metrics.totalLeads === 0 && (
                <div className="text-center py-4">
                  <p className="text-xs text-gray-500">No immediate actions</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Create your first lead</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {activities.length === 0 ? (
                <div className="px-5 py-6 text-center">
                  <p className="text-xs text-gray-500">No activity yet</p>
                </div>
              ) : (
                activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="px-5 py-2.5 flex items-start gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                      activity.type === 'lead_created' ? 'bg-emerald-500' :
                      activity.type === 'status_changed' ? 'bg-blue-500' :
                      activity.type === 'report_generated' ? 'bg-purple-500' :
                      'bg-gray-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{activity.leadName}</p>
                      <p className="text-[10px] text-gray-500">{activity.details}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}