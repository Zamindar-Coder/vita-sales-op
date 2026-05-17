'use client';

import { useState, useEffect } from 'react';
import { Lead, getPipelineLeads, updateLeadStatus } from '@/lib/store';

interface PipelineViewProps {
  onViewLead: (lead: Lead) => void;
}

const COLUMNS: { id: Lead['status']; label: string; color: string; dotColor: string }[] = [
  { id: 'new', label: 'Identified', color: 'text-gray-600', dotColor: '#6B7280' },
  { id: 'qualified', label: 'Contacted', color: 'text-gray-600', dotColor: '#6B7280' },
  { id: 'proposal', label: 'Engaged', color: 'text-gray-600', dotColor: '#6B7280' },
  { id: 'negotiation', label: 'Proposal', color: 'text-gray-600', dotColor: '#6B7280' },
  { id: 'closed', label: 'Closed', color: 'text-gray-600', dotColor: '#6B7280' },
];

export default function PipelineView({ onViewLead }: PipelineViewProps) {
  const [mounted, setMounted] = useState(false);
  const [pipeline, setPipeline] = useState<Record<Lead['status'], Lead[]>>({
    new: [], qualified: [], proposal: [], negotiation: [], closed: [],
  });
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);

  useEffect(() => {
    setMounted(true);
    const refresh = () => setPipeline(getPipelineLeads());
    refresh();
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, []);

  const handleDragStart = (lead: Lead) => setDraggedLead(lead);

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (status: Lead['status']) => {
    if (draggedLead && draggedLead.status !== status) {
      updateLeadStatus(draggedLead.id, status);
      setPipeline(getPipelineLeads());
      window.dispatchEvent(new Event('storage'));
    }
    setDraggedLead(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Deal Pipeline</h1>
          <p className="text-sm text-gray-500 mt-0.5">Drag opportunities between stages to update status</p>
        </div>
        {mounted && (
          <span className="text-xs text-gray-500">
            {Object.values(pipeline).flat().length} opportunities
          </span>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => (
          <div
            key={column.id}
            className="flex-shrink-0 w-72"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            <div className="bg-gray-100 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: column.dotColor }} />
                <h3 className="text-sm font-semibold text-gray-900">{column.label}</h3>
                <span className="ml-auto text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                  {pipeline[column.id].length}
                </span>
              </div>
              <div className="space-y-2 min-h-[200px]">
                {!mounted ? (
                  <div className="bg-white/50 rounded-lg border border-dashed border-gray-300 p-4 text-center">
                    <p className="text-xs text-gray-400">Loading...</p>
                  </div>
                ) : pipeline[column.id].length === 0 ? (
                  <div className="bg-white/50 rounded-lg border border-dashed border-gray-300 p-4 text-center">
                    <p className="text-xs text-gray-400">No leads</p>
                  </div>
                ) : (
                  pipeline[column.id].map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={() => handleDragStart(lead)}
                      onClick={() => onViewLead(lead)}
                      className="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all"
                    >
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {lead.company || lead.extracted_requirements.product}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {lead.extracted_requirements.industry}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{lead.lead_score}</span>
                          <span className="text-[10px] text-gray-400">score</span>
                        </div>
                        {lead.prioritizationSignal ? (
                          <span className="text-[9px] font-bold px-2 py-1 rounded bg-gray-100 text-gray-700">
                            {lead.prioritizationSignal}
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                            {lead.lead_priority}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-900">{lead.estimated_deal_value}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}