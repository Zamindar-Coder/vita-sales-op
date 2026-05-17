'use client';

import { SessionStats } from '@/lib/types';

interface StatsStripProps {
  stats: SessionStats;
}

export default function StatsStrip({ stats }: StatsStripProps) {
  const avgScore = stats.leads_today > 0
    ? Math.round(stats.total_score_processed / stats.leads_today)
    : 0;

  return (
    <div className="bg-gray-50 border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-6 py-2.5">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-gray-900">{stats.leads_today}</span>
            <span className="text-xs text-gray-500">Leads Today</span>
          </div>
          <div className="h-4 w-px bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-amber-600">{stats.high_priority}</span>
            <span className="text-xs text-gray-500">High Priority</span>
          </div>
          <div className="h-4 w-px bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-gray-900">{avgScore || '--'}</span>
            <span className="text-xs text-gray-500">Avg Score</span>
          </div>
          <div className="h-4 w-px bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-gray-900">{stats.reports_generated}</span>
            <span className="text-xs text-gray-500">Reports</span>
          </div>
        </div>
      </div>
    </div>
  );
}
