'use client';

import { useState } from 'react';
import { AgentResponse } from '@/lib/types';

interface ReportModalProps {
  result: AgentResponse;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportModal({ result, isOpen, onClose }: ReportModalProps) {
  const [emailExpanded, setEmailExpanded] = useState(false);
  const [salesAssistantExpanded, setSalesAssistantExpanded] = useState(false);

  if (!isOpen) return null;

  const avgScore = result.report_summary.leads_today > 0
    ? Math.round(result.report_summary.total_score_processed / result.report_summary.leads_today)
    : result.lead_score;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white w-full max-w-5xl mx-4 rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Lead Analysis Report</h2>
            <p className="text-xs text-gray-500">ID: {result.id}</p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - 3 Column Layout - Scrollable */}
        <div className="grid grid-cols-12 gap-6 p-6 overflow-y-auto flex-1">
          {/* LEFT - Lead Info */}
          <div className="col-span-3 space-y-6">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Lead Info</p>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-gray-400">Product</p>
                  <p className="text-sm text-gray-900">{result.extracted_requirements.product}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Industry</p>
                  <p className="text-sm text-gray-900">{result.extracted_requirements.industry}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Quantity</p>
                  <p className="text-sm text-gray-900">{result.extracted_requirements.quantity}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Budget</p>
                  <p className="text-sm text-gray-900">{result.extracted_requirements.budget_range || 'TBD'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Decision Maker</p>
                  <p className="text-sm text-gray-900">{result.extracted_requirements.decision_maker || 'TBD'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Source</p>
                  <p className="text-sm text-gray-900">{result.extracted_requirements.inquiry_source || 'TBD'}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Why This Lead Matters</p>
              <p className="text-sm text-gray-600 leading-relaxed">{result.business_relevance.summary}</p>
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Revenue Potential</span>
                  <span className="text-gray-900">{result.business_relevance.revenuePotential}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Conversion</span>
                  <span className="text-gray-900">{result.business_relevance.conversionLikelihood}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Risk</span>
                  <span className="text-gray-900">{result.business_relevance.riskFactor}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Urgency</span>
                  <span className="text-gray-900">{result.business_relevance.urgencyImpact}</span>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER - Main Score & Analysis */}
          <div className="col-span-6 space-y-8">
            {/* Lead Score - Dominant */}
            <section>
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Lead Score</p>
                  <p className="text-8xl font-bold text-gray-900 leading-none tracking-tight">{result.lead_score}</p>
                  <p className="text-2xl text-gray-300 font-light">/100</p>
                </div>
                <div className="text-right pb-2">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Priority</span>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{result.lead_priority}</p>
                </div>
              </div>

              {/* Score Breakdown */}
              {result.score_breakdown && (
                <div className="grid grid-cols-6 gap-px bg-gray-200 border border-gray-200 mb-6">
                  {[
                    { label: 'Budget', value: result.score_breakdown.budget, max: 25 },
                    { label: 'Company', value: result.score_breakdown.companySize, max: 15 },
                    { label: 'Urgency', value: result.score_breakdown.urgency, max: 20 },
                    { label: 'Industry', value: result.score_breakdown.industryFit, max: 15 },
                    { label: 'D.Maker', value: result.score_breakdown.decisionMaker, max: 10 },
                    { label: 'Source', value: result.score_breakdown.sourceQuality, max: 15 },
                  ].map((item) => (
                    <div key={item.label} className="bg-white px-3 py-2 text-center">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{item.label}</p>
                      <p className="text-lg font-semibold text-gray-900 mt-0.5">{item.value}<span className="text-xs text-gray-400 font-normal">/{item.max}</span></p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reasoning */}
              <p className="text-sm text-gray-500 leading-relaxed border-l-2 border-gray-200 pl-4 mb-6">
                {result.score_reasoning || `Score of ${result.lead_score}/100 based on lead characteristics.`}
              </p>

              {/* Confidence & Conversion */}
              <div className="flex gap-8 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Confidence</p>
                  <p className="text-xl font-semibold text-gray-900 mt-1">{result.confidence}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Conversion Prob.</p>
                  <p className="text-xl font-semibold text-gray-900 mt-1">
                    {result.lead_score >= 65 ? '35%' : result.lead_score >= 45 ? '22%' : result.lead_score >= 30 ? '15%' : '8%'}
                  </p>
                </div>
              </div>
            </section>

            {/* Deal Summary */}
            <section className="pt-6 border-t border-gray-200">
              <div className="space-y-4">
                {result.dealVerdict && (
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Deal Verdict</p>
                    <div className="flex items-baseline gap-3">
                      <p className="text-3xl font-bold text-gray-900">{result.dealVerdict.verdict}</p>
                      <p className="text-sm text-gray-400">{result.dealVerdict.conversionProbability}% likely</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Expected: {result.dealVerdict.expectedRevenue} · {result.dealVerdict.expectedCloseDays} days</p>
                  </div>
                )}

                {result.dealVerdict?.keyStrengths && result.dealVerdict.keyStrengths.length > 0 && (
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Strengths</p>
                    <div className="space-y-1.5">
                      {result.dealVerdict.keyStrengths.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5" />
                          <span className="text-xs text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.dealVerdict?.keyWeaknesses && result.dealVerdict.keyWeaknesses.length > 0 && (
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Weaknesses</p>
                    <div className="space-y-1.5">
                      {result.dealVerdict.keyWeaknesses.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-gray-300 mt-1.5" />
                          <span className="text-xs text-gray-500">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Est. Value</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{result.estimated_deal_value}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Timeline</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{result.recommended_timeline}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Next Actions */}
            <section className="pt-6 border-t border-gray-200">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Next Actions</p>
              <p className="text-sm font-medium text-gray-900 mb-3">{result.suggested_next_step}</p>
              <div className="space-y-2">
                {result.recommended_actions.map((action, i) => (
                  <label key={i} className="flex items-start gap-2 group cursor-pointer">
                    <input type="checkbox" className="mt-0.5 w-3.5 h-3.5 border border-gray-300 rounded" />
                    <span className="text-xs text-gray-700 group-hover:text-gray-900 transition-colors">{action}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Email Draft - Collapsible */}
            <section className="pt-6 border-t border-gray-200">
              <button
                onClick={() => setEmailExpanded(!emailExpanded)}
                className="flex items-center justify-between w-full text-left"
              >
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Email Draft</p>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${emailExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {emailExpanded && (
                <div className="mt-3">
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed bg-gray-50 p-3 rounded">
                    {result.sales_output.emailDraft}
                  </pre>
                </div>
              )}
            </section>

            {/* Sales Assistant - Collapsible */}
            {result.salesAssistantOutput && (
              <section className="pt-6 border-t border-gray-200">
                <button
                  onClick={() => setSalesAssistantExpanded(!salesAssistantExpanded)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                    {result.salesAssistantOutput.outreachChannel === 'whatsapp' ? 'WhatsApp' : 'Email'} Message
                  </p>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${salesAssistantExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {salesAssistantExpanded && (
                  <div className="mt-3 space-y-3">
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed bg-gray-50 p-3 rounded">
                      {result.salesAssistantOutput.outreachMessage}
                    </pre>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Strategy</p>
                      <p className="text-xs text-gray-700 capitalize">{result.salesAssistantOutput.callStrategy.keyAngle} angle</p>
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* RIGHT - Deep Research & Additional */}
          <div className="col-span-3 space-y-6">
            {/* Call Script */}
            <div>
              <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">Call Script</p>
              <div className="space-y-3">
                {result.sales_output.callScript.map((bullet, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-600 shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-700 leading-relaxed">{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Discovery Questions */}
            {result.followUpQuestions && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Discovery Questions</p>
                <p className="text-xs text-gray-500 italic mb-3">{result.followUpQuestions.conversationalTone.opening}</p>
                <div className="space-y-3">
                  {result.followUpQuestions.questions.map((q, i) => (
                    <div key={i} className="border-l-2 border-gray-200 pl-3">
                      <p className="text-xs text-gray-700 leading-relaxed">"{q.question}"</p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
                        {q.focus.replace('_', ' ')} · +{q.scoreBoost} pts
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Time & Source Intel */}
            {(result.timeBasedIntelligence || result.sourceIntelligence) && (
              <div className="pt-4 border-t border-gray-200">
                <div className="space-y-4">
                  {result.timeBasedIntelligence && (
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Follow-up Timing</p>
                      <p className="text-sm text-gray-900">{result.timeBasedIntelligence.bestTimeToFollowUp.day} at {result.timeBasedIntelligence.bestTimeToFollowUp.hour}:00</p>
                      <p className="text-xs text-gray-500 mt-1">Decay Risk: {result.timeBasedIntelligence.dealDecayRisk}</p>
                    </div>
                  )}
                  {result.sourceIntelligence && (
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Source Intel</p>
                      <p className="text-sm text-gray-900 capitalize">{result.sourceIntelligence.inferredBuyingStage}</p>
                      <p className="text-xs text-gray-500 mt-1">{result.sourceIntelligence.inferredIntent}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pricing Strategy */}
            {result.simplifiedScoring?.pricing && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Pricing Strategy</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Range</span>
                    <span className="text-xs font-medium text-gray-900">{result.simplifiedScoring.pricing.suggestedRange}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Ideal</span>
                    <span className="text-xs font-medium text-gray-900">{result.simplifiedScoring.pricing.idealPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Flexibility</span>
                    <span className="text-xs text-gray-600">{result.simplifiedScoring.pricing.discountFlexibility}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Session Summary */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Session Summary</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded p-2 text-center">
                  <p className="text-sm font-semibold text-gray-900">{result.report_summary.leads_today}</p>
                  <p className="text-[10px] text-gray-500">Leads</p>
                </div>
                <div className="bg-gray-50 rounded p-2 text-center">
                  <p className="text-sm font-semibold text-gray-900">{avgScore}</p>
                  <p className="text-[10px] text-gray-500">Avg Score</p>
                </div>
                <div className="bg-gray-50 rounded p-2 text-center">
                  <p className="text-sm font-semibold text-gray-900">{result.report_summary.high_priority}</p>
                  <p className="text-[10px] text-gray-500">High Priority</p>
                </div>
                <div className="bg-gray-50 rounded p-2 text-center">
                  <p className="text-sm font-semibold text-gray-900">{result.report_summary.reports_generated}</p>
                  <p className="text-[10px] text-gray-500">Reports</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <p className="text-xs text-gray-400">Generated by Vitam Sales Operator</p>
          <div className="flex gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Copy JSON
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
