'use client';

import { useState, useEffect } from 'react';
import {
  NoteEntry,
  LeadNotes,
  addLeadNote,
  updateLeadNote,
  deleteLeadNote,
  getLeadNotes,
  updateLeadStructuredNotes,
  calculateNoteInfluence,
} from '@/lib/store';

interface NotesPanelProps {
  leadId: string;
  leadCompany: string;
}

export default function NotesPanel({ leadId, leadCompany }: NotesPanelProps) {
  const [notes, setNotes] = useState<LeadNotes>({
    keyObservations: [],
    risks: [],
    missingInfo: [],
    salesStrategyNotes: [],
    entries: [],
  });
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showEditHistory, setShowEditHistory] = useState<string | null>(null);
  const [influence, setInfluence] = useState({ competitionRisk: 5, followUpUrgency: 5, conversionModifier: 0 });

  useEffect(() => {
    refreshNotes();
  }, [leadId]);

  const refreshNotes = () => {
    setNotes(getLeadNotes(leadId));
    setInfluence(calculateNoteInfluence(leadId));
  };

  const handleAddNote = (type: NoteEntry['type'] = 'manual') => {
    if (!newNoteContent.trim()) return;
    addLeadNote(leadId, type, newNoteContent);
    setNewNoteContent('');
    refreshNotes();
  };

  const handleDeleteNote = (noteId: string) => {
    deleteLeadNote(leadId, noteId);
    refreshNotes();
  };

  const handleStartEdit = (note: NoteEntry) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = () => {
    if (editingNoteId) {
      updateLeadNote(leadId, editingNoteId, editContent);
      setEditingNoteId(null);
      setEditContent('');
      refreshNotes();
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditContent('');
  };

  // Quick actions
  const handleSummarize = () => {
    const summary = `Summary for ${leadCompany}:\n\nKey observations: ${notes.keyObservations.length > 0 ? notes.keyObservations.join('; ') : 'None recorded'}\n\nRisks: ${notes.risks.length > 0 ? notes.risks.join('; ') : 'None identified'}\n\nMissing info: ${notes.missingInfo.length > 0 ? notes.missingInfo.join('; ') : 'All critical fields filled'}\n\nSales strategy: ${notes.salesStrategyNotes.length > 0 ? notes.salesStrategyNotes.join('; ') : 'Standard approach'}`;
    addLeadNote(leadId, 'summary', summary, 'system');
    refreshNotes();
  };

  const handleExtractRisks = () => {
    const riskSummary = notes.risks.length > 0
      ? `Confirmed risks: ${notes.risks.join('; ')}`
      : 'No risks explicitly identified. Consider reviewing missing information gaps.';
    addLeadNote(leadId, 'risk_extraction', riskSummary, 'system');
    refreshNotes();
  };

  const handleGenerateFollowUp = () => {
    let followUp = '';
    if (influence.followUpUrgency >= 8) {
      followUp = `URGENT FOLLOW-UP REQUIRED for ${leadCompany}:\n1. Contact today (within 2 hours)\n2. Confirm meeting with decision maker\n3. Prepare proposal draft\n4. Escalate to senior management if no response`;
    } else if (influence.followUpUrgency >= 5) {
      followUp = `STANDARD FOLLOW-UP for ${leadCompany}:\n1. Send introductory email within 24 hours\n2. Schedule discovery call within 48 hours\n3. Prepare tailored presentation\n4. Add to pipeline review`;
    } else {
      followUp = `LOW PRIORITY FOLLOW-UP for ${leadCompany}:\n1. Send welcome email with resources\n2. Add to weekly nurture sequence\n3. Schedule check-in in 5-7 days\n4. Monitor for engagement signals`;
    }
    addLeadNote(leadId, 'follow_up', followUp, 'system');
    refreshNotes();
  };

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getNoteTypeLabel = (type: NoteEntry['type']) => {
    switch (type) {
      case 'manual': return 'Note';
      case 'ai_generated': return 'AI';
      case 'risk_extraction': return 'Risk';
      case 'follow_up': return 'Follow-up';
      case 'summary': return 'Summary';
    }
  };

  const getNoteTypeColor = (type: NoteEntry['type']) => {
    switch (type) {
      case 'manual': return 'bg-gray-100 text-gray-700';
      case 'ai_generated': return 'bg-blue-50 text-blue-700';
      case 'risk_extraction': return 'bg-red-50 text-red-700';
      case 'follow_up': return 'bg-emerald-50 text-emerald-700';
      case 'summary': return 'bg-purple-50 text-purple-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Note Influence Indicator */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Note Influence on Lead</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{influence.competitionRisk}<span className="text-xs text-gray-400">/10</span></p>
            <p className="text-[9px] text-gray-500">Competition Risk</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{influence.followUpUrgency}<span className="text-xs text-gray-400">/10</span></p>
            <p className="text-[9px] text-gray-500">Follow-up Urgency</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{influence.conversionModifier > 0 ? '+' : ''}{influence.conversionModifier}</p>
            <p className="text-[9px] text-gray-500">Conversion Mod.</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <button onClick={handleSummarize} className="flex-1 px-3 py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
          Summarize Context
        </button>
        <button onClick={handleExtractRisks} className="flex-1 px-3 py-2 text-xs font-medium bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors">
          Extract Risks
        </button>
        <button onClick={handleGenerateFollowUp} className="flex-1 px-3 py-2 text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors">
          Generate Follow-up
        </button>
      </div>

      {/* Update Analysis Button */}
      <button className="w-full px-3 py-2 text-xs font-medium bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors border border-purple-200">
        Update Analysis from Notes
      </button>

      {/* Structured AI Notes */}
      {(notes.keyObservations.length > 0 || notes.risks.length > 0 || notes.missingInfo.length > 0 || notes.salesStrategyNotes.length > 0) && (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          <p className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider px-4 py-2 bg-purple-50/50">Context Memory</p>

          {notes.keyObservations.length > 0 && (
            <div className="px-4 py-2">
              <p className="text-[10px] text-emerald-600 font-medium mb-1">Key Observations</p>
              {notes.keyObservations.map((obs, i) => (
                <p key={i} className="text-xs text-gray-700">• {obs}</p>
              ))}
            </div>
          )}

          {notes.risks.length > 0 && (
            <div className="px-4 py-2 bg-red-50/30">
              <p className="text-[10px] text-red-600 font-medium mb-1">Risks</p>
              {notes.risks.map((risk, i) => (
                <p key={i} className="text-xs text-gray-700">• {risk}</p>
              ))}
            </div>
          )}

          {notes.missingInfo.length > 0 && (
            <div className="px-4 py-2">
              <p className="text-[10px] text-amber-600 font-medium mb-1">Missing Information</p>
              {notes.missingInfo.map((miss, i) => (
                <p key={i} className="text-xs text-gray-700">• {miss}</p>
              ))}
            </div>
          )}

          {notes.salesStrategyNotes.length > 0 && (
            <div className="px-4 py-2">
              <p className="text-[10px] text-blue-600 font-medium mb-1">Sales Strategy</p>
              {notes.salesStrategyNotes.map((note, i) => (
                <p key={i} className="text-xs text-gray-700">• {note}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Note Input */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Add Note</p>
        <textarea
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          placeholder="Add a manual note..."
          rows={3}
          className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={() => handleAddNote('manual')}
            disabled={!newNoteContent.trim()}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              newNoteContent.trim()
                ? 'bg-gray-900 text-white hover:bg-black'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Add Note
          </button>
        </div>
      </div>

      {/* Note Timeline */}
      <div className="bg-white rounded-lg border border-gray-200">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-2 border-b border-gray-100">Note History</p>
        <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
          {notes.entries.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-xs text-gray-500">No notes yet</p>
            </div>
          ) : (
            notes.entries.map((note) => (
              <div key={note.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${getNoteTypeColor(note.type)}`}>
                        {getNoteTypeLabel(note.type)}
                      </span>
                      <span className="text-[10px] text-gray-400">{note.author === 'system' ? 'System' : 'User'}</span>
                      <span className="text-[10px] text-gray-400">{formatTimestamp(note.timestamp)}</span>
                    </div>

                    {editingNoteId === note.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={3}
                          className="w-full resize-none rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:outline-none focus:border-gray-400"
                        />
                        <div className="flex gap-2">
                          <button onClick={handleSaveEdit} className="px-2 py-1 text-[10px] font-medium bg-emerald-600 text-white rounded hover:bg-emerald-700">Save</button>
                          <button onClick={handleCancelEdit} className="px-2 py-1 text-[10px] font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>

                        {note.editHistory && note.editHistory.length > 0 && (
                          <button
                            onClick={() => setShowEditHistory(showEditHistory === note.id ? null : note.id)}
                            className="text-[9px] text-gray-400 hover:text-gray-600 mt-1"
                          >
                            {showEditHistory === note.id ? 'Hide' : 'Show'} edit history ({note.editHistory.length})
                          </button>
                        )}

                        {showEditHistory === note.id && note.editHistory && (
                          <div className="mt-2 bg-gray-50 rounded p-2">
                            <p className="text-[10px] font-medium text-gray-500 mb-1">Edit History</p>
                            {note.editHistory.map((edit, i) => (
                              <div key={i} className="text-[10px] text-gray-600 border-b border-gray-200 pb-1 mb-1 last:border-0 last:pb-0">
                                <span className="text-gray-400">{formatTimestamp(edit.timestamp)}:</span>
                                <p className="mt-0.5 pl-2">{edit.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {!editingNoteId && (
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEdit(note)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        title="Edit"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                        title="Delete"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}