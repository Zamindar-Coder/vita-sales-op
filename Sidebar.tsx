'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getRecentLeads, getRecentReports, getMetrics, Lead, SavedReport } from '@/lib/store';

export type View = 'dashboard' | 'pipeline' | 'leads' | 'reports' | 'activity' | 'settings' | 'analysis';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onViewLead?: (leadId: string) => void;
}

const navItems: { id: View; label: string; icon: React.ReactElement }[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    id: 'pipeline',
    label: 'Deal Pipeline',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
  },
  {
    id: 'leads',
    label: 'Opportunities',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: 'reports',
    label: 'Revenue Insights',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: 'activity',
    label: 'Activity',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function Sidebar({ currentView, onNavigate, onViewLead }: SidebarProps) {
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [recentReports, setRecentReports] = useState<SavedReport[]>([]);
  const [metrics, setMetrics] = useState({ totalLeads: 0, conversionRate: 0, highPriority: 0, avgScore: 0, pipelineValue: '₹0', reportsGenerated: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setRecentLeads(getRecentLeads(4));
    setRecentReports(getRecentReports(3));
    setMetrics(getMetrics());
    setMounted(true);
  }, []);

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="relative h-8 w-8 shrink-0">
            <Image src="/vitamlogo.png" alt="Vitam" fill className="object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900">Vitam</h1>
            <p className="text-[10px] text-gray-500 tracking-wide uppercase">Sales Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === item.id
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        {/* Recent Opportunities Section */}
        {mounted && recentLeads.length > 0 && (
          <div className="pt-4 mt-4 border-t border-gray-100">
            <p className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Recent Opportunities</p>
            <div className="space-y-0.5">
              {recentLeads.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => onViewLead?.(lead.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    lead.lead_priority === 'High' ? 'bg-amber-500' :
                    lead.lead_priority === 'Medium' ? 'bg-blue-500' : 'bg-gray-300'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {lead.company || lead.extracted_requirements.product}
                    </p>
                    <p className="text-[10px] text-gray-500">{lead.lead_score} score</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Reports Section */}
        {mounted && recentReports.length > 0 && (
          <div className="pt-4 mt-4 border-t border-gray-100">
            <p className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Recent Analyses</p>
            <div className="space-y-0.5">
              {recentReports.map((report) => (
                <button
                  key={report.id}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{report.leadName}</p>
                    <p className="text-[10px] text-gray-400">Score: {report.score}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Metrics Footer */}
      {mounted && (
      <div className="px-3 py-3 border-t border-gray-100 bg-gray-50">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">{metrics.totalLeads}</p>
            <p className="text-[9px] text-gray-500 uppercase tracking-wide">Opportunities</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-emerald-600">{metrics.conversionRate}%</p>
            <p className="text-[9px] text-gray-500 uppercase tracking-wide">Conv.</p>
          </div>
        </div>
      </div>
      )}

      {/* User */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-900">Sales Team</p>
            <p className="text-[10px] text-gray-500">Operations</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
