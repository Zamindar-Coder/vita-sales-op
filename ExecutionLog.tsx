'use client';

import { useEffect, useRef } from 'react';
import { ExecutionLogEntry } from '@/lib/types';

interface ExecutionLogProps {
  entries: ExecutionLogEntry[];
  isLoading: boolean;
  currentStage: number;
  progressText: string;
}

const STAGE_GROUPS: Record<number, string> = {
  1: 'Intake & Parsing',
  2: 'Context Understanding',
  3: 'Lead Scoring',
  4: 'Decision Engine',
  5: 'Action Simulation',
  6: 'Report Generation',
};

export default function ExecutionLog({ entries, isLoading, currentStage, progressText }: ExecutionLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries, isLoading]);

  const groupedEntries = entries.reduce((acc, entry) => {
    const group = STAGE_GROUPS[entry.stage] || 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(entry);
    return acc;
  }, {} as Record<string, ExecutionLogEntry[]>);

  const getTypeColor = (type: ExecutionLogEntry['type']) => {
    switch (type) {
      case 'success': return 'text-gray-300';
      case 'warning': return 'text-amber-400';
      case 'debug': return 'text-gray-600';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800">
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide">Execution Timeline</h3>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
        {Object.keys(groupedEntries).length === 0 && !isLoading && (
          <p className="text-gray-500 text-xs">Awaiting execution...</p>
        )}

        {Object.entries(groupedEntries).map(([group, groupEntries]) => (
          <div key={group} className="mb-4 last:mb-0">
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">{group}</p>
            <div className="space-y-1">
              {groupEntries.map((entry, i) => (
                <div key={i} className={`text-xs font-mono ${getTypeColor(entry.type)}`}>
                  <span className="text-gray-600">[{entry.timestamp}]</span> {entry.message}
                </div>
              ))}
            </div>
          </div>
        ))}

        {isLoading && currentStage > 0 && (
          <div className="mt-2">
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">
              {STAGE_GROUPS[currentStage]}
            </p>
            <div className="text-xs font-mono text-blue-400 animate-pulse">
              <span className="text-gray-600">[{new Date().toLocaleTimeString('en-US', { hour12: false })}]</span> {progressText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
