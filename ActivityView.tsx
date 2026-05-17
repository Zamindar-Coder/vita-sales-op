'use client';

import { useState, useEffect } from 'react';
import { getActivities, getLeads, ActivityEntry } from '@/lib/store';

export default function ActivityView() {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'lead_created' | 'status_changed' | 'report_generated'>('all');

  useEffect(() => {
    const refresh = () => setActivities(getActivities());
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  const filteredActivities = filter === 'all' ? activities : activities.filter(a => a.type === filter);

  const getTypeIcon = (type: ActivityEntry['type']) => {
    switch (type) {
      case 'lead_created':
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
      case 'status_changed':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
        );
      case 'report_generated':
        return (
          <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getTypeLabel = (type: ActivityEntry['type']) => {
    switch (type) {
      case 'lead_created': return 'Lead Created';
      case 'status_changed': return 'Status Changed';
      case 'report_generated': return 'Report Generated';
      default: return 'Activity';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Activity</h1>
          <p className="text-sm text-gray-500 mt-0.5">Recent actions and system events</p>
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
          All ({activities.length})
        </button>
        <button
          onClick={() => setFilter('lead_created')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filter === 'lead_created' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          Leads ({activities.filter(a => a.type === 'lead_created').length})
        </button>
        <button
          onClick={() => setFilter('status_changed')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filter === 'status_changed' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          Status ({activities.filter(a => a.type === 'status_changed').length})
        </button>
        <button
          onClick={() => setFilter('report_generated')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filter === 'report_generated' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          Reports ({activities.filter(a => a.type === 'report_generated').length})
        </button>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="divide-y divide-gray-100">
          {filteredActivities.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm text-gray-500">No activity yet</p>
              <p className="text-xs text-gray-400 mt-1">Run an analysis to create your first lead</p>
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <div key={activity.id} className="px-5 py-4 flex items-start gap-4">
                {getTypeIcon(activity.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{activity.leadName}</p>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      activity.type === 'lead_created' ? 'bg-emerald-50 text-emerald-700' :
                      activity.type === 'status_changed' ? 'bg-blue-50 text-blue-700' :
                      'bg-purple-50 text-purple-700'
                    }`}>
                      {getTypeLabel(activity.type)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{activity.details}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
