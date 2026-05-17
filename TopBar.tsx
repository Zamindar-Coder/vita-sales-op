'use client';

import { useState, useEffect } from 'react';
import { getMetrics } from '@/lib/store';
import { Metrics } from '@/lib/types';

export default function TopBar() {
  const [metrics, setMetrics] = useState<Metrics>({
    totalLeads: 0,
    highPriority: 0,
    conversionRate: 0,
    pipelineValue: '₹0',
    avgScore: 0,
    reportsGenerated: 0,
    avgDealSize: '₹0',
    pipelineHealth: { early: 0, late: 0 },
  });

  useEffect(() => {
    setMetrics(getMetrics());
  }, []);

  return (
    <>
      {/* Top Bar */}
      <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">Vitam</span>
          <span className="text-gray-300">/</span>
          <span className="text-xs font-medium text-gray-900">Opportunity Intelligence</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500"></span>
            </span>
            <span className="text-xs text-gray-600">Systems operational</span>
          </div>
        </div>
      </header>

      {/* KPI Strip */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Opportunities</span>
            <span className="text-sm font-semibold text-gray-900">{metrics.totalLeads}</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">High Intent</span>
            <span className="text-sm font-semibold text-gray-900">{metrics.highPriority}</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Pipeline Value</span>
            <span className="text-sm font-semibold text-gray-900">{metrics.pipelineValue}</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Avg Deal Size</span>
            <span className="text-sm font-semibold text-gray-900">{metrics.avgDealSize}</span>
          </div>
        </div>
      </div>
    </>
  );
}
