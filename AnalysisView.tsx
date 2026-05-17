'use client';

import { useState, useCallback, useEffect } from 'react';
import LeadIntakeForm from '@/components/LeadIntakeForm';
import {
  LeadScoreHero,
  DealSummary,
  StrengthsWeaknesses,
  NextActions,
  PricingStrategy,
  EmailDraft,
  CallScript,
  DiscoveryQuestions,
  RecommendedActionsExpanded,
  TimeSourceIntel,
  SalesAssistantOutputCard,
  DealStrategyEngineCompact,
  DeepResearchCard,
  EmptyState,
} from '@/components/OutputCard';
import ReportModal from '@/components/ReportModal';
import { AgentResponse, ExecutionLogEntry } from '@/lib/types';
import { saveLead, createLead } from '@/lib/store';

interface AnalysisViewProps {
  initialInquiry?: string | null;
  onComplete?: () => void;
  savedResult?: any;
  onSaveResult?: (result: any) => void;
}

const STAGES = [
  { id: 1, name: 'Lead Structuring', description: 'Parsed company, requirement, and buying signals' },
  { id: 2, name: 'Context Mapping', description: 'Matched to industry benchmarks and deal patterns' },
  { id: 3, name: 'Scoring', description: 'Calculated baseline score' },
  { id: 4, name: 'Opportunity Evaluation', description: 'Estimated deal value and conversion likelihood' },
  { id: 5, name: 'Action Planning', description: 'Generated next-step strategy' },
  { id: 6, name: 'Report Generation', description: 'Compiled executive summary' },
];

export default function AnalysisView({ initialInquiry, onComplete, savedResult, onSaveResult }: AnalysisViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [logs, setLogs] = useState<ExecutionLogEntry[]>([]);
  const [result, setResult] = useState<AgentResponse | null>(savedResult || null);
  const [showModal, setShowModal] = useState(false);

  const addLogs = useCallback((newLogs: ExecutionLogEntry[]) => {
    setLogs((prev) => [...prev, ...newLogs]);
  }, []);

  const runAnalysis = useCallback(async (inquiry: string, formData?: any) => {
    if (!inquiry.trim() || isLoading) return;

    setIsLoading(true);
    setCurrentStage(0);
    setProgressText('');
    setResult(null);
    setLogs([]);

    addLogs([{
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      stage: 0,
      message: 'analysis_started',
      type: 'info',
    }]);

    try {
      // Run through stages - 20-25 seconds for intelligent feel
      const stageMessages = [
        'Parsing company details and requirements...',
        'Mapping industry context and benchmarks...',
        'Running multi-factor scoring model...',
        'Evaluating deal value and conversion...',
        'Generating strategic recommendations...',
        'Compiling executive summary...',
      ];

      for (let i = 0; i < STAGES.length; i++) {
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            setCurrentStage(STAGES[i].id);
            setProgressText(stageMessages[i]);
            addLogs([{
              timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
              stage: STAGES[i].id,
              message: STAGES[i].name.toLowerCase().replace(/ /g, '_'),
              type: 'info',
            }]);
            resolve();
          }, 3000 + Math.random() * 1500);
        });
      }

      setProgressText('Finalizing analysis...');

      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: inquiry, formData }),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const data: AgentResponse = await response.json();
      setResult(data);
      onSaveResult?.(data);

      addLogs([
        { timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }), stage: 3, message: `score_calculated_${data.lead_score}`, type: 'success' },
        { timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }), stage: 4, message: `deal_value_${data.estimated_deal_value}`, type: 'success' },
        { timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }), stage: 5, message: 'sales_outputs_generated', type: 'success' },
        { timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }), stage: 6, message: 'lead_saved', type: 'success' },
        { timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }), stage: 6, message: 'analysis_complete', type: 'success' },
      ]);

      const lead = createLead(data, inquiry, formData);
      saveLead(lead);
      onComplete?.();

    } catch (error) {
      addLogs([{
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        stage: 0,
        message: `error: ${error instanceof Error ? error.message : 'unknown'}`,
        type: 'warning',
      }]);
    } finally {
      setIsLoading(false);
      setCurrentStage(0);
      setProgressText('');
    }
  }, [isLoading, addLogs, onComplete]);

  useEffect(() => {
    if (initialInquiry) {
      runAnalysis(initialInquiry);
    }
  }, [initialInquiry, runAnalysis]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Opportunity Analysis</h1>
      </div>

      {/* Main Grid: 3 columns */}
      <div className="grid grid-cols-12 gap-8">
        {/* LEFT COLUMN - Context Builder (20-25%) */}
        <div className="col-span-3">
          <div className="sticky top-6">
            <LeadIntakeForm
              onRunAnalysis={runAnalysis}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* CENTER COLUMN - Lead Score (50-55%) */}
        <div className="col-span-6 overflow-y-auto max-h-[calc(100vh-12rem)] pb-8">
          {result ? (
            <div className="space-y-8">
              {/* Intent Score - Most Dominant */}
              <section>
                <LeadScoreHero
                  score={result.lead_score}
                  priority={result.lead_priority}
                  reasoning={result.score_reasoning || `Intent score of ${result.lead_score}/100 based on opportunity characteristics.`}
                  confidence={result.confidence}
                  breakdown={result.score_breakdown}
                  whyThisOpp={[
                    `Company operates in ${result.extracted_requirements.industry}`,
                    `Likely needs ${result.extracted_requirements.product} for ${result.extracted_requirements.use_case || 'operational use'}`,
                    `Deal size of ${result.estimated_deal_value} matches target range`,
                    result.extracted_requirements.urgency === 'high' || result.extracted_requirements.urgency === 'critical'
                      ? `High urgency signal detected`
                      : `Standard urgency for qualified opportunity`,
                    result.extracted_requirements.decision_maker === 'yes'
                      ? `Decision maker identified`
                      : `Discovery needed to confirm decision authority`,
                  ]}
                />
              </section>

              {/* Deal Summary - Right aligned below score */}
              <section className="pt-6 border-t border-gray-200">
                <DealSummary
                  verdict={result.dealVerdict}
                  dealValue={result.estimated_deal_value}
                  timeline={result.recommended_timeline}
                  executiveBlock={result.executiveDecisionBlock}
                  signal={result.prioritizationSignal}
                />
              </section>

              {/* Strengths & Weaknesses */}
              {(result.dealVerdict?.keyStrengths.length || result.dealVerdict?.keyWeaknesses.length) && (
                <section className="pt-6 border-t border-gray-200">
                  <StrengthsWeaknesses
                    verdict={result.dealVerdict}
                    businessRelevance={result.business_relevance}
                  />
                </section>
              )}

              {/* Next Actions */}
              <section className="pt-6 border-t border-gray-200">
                <NextActions
                  actions={result.recommended_actions}
                  suggestedNextStep={result.suggested_next_step}
                />
              </section>

              {/* Email Draft - Collapsible */}
              <section className="pt-6 border-t border-gray-200">
                <EmailDraft emailDraft={result.sales_output.emailDraft} />
              </section>

              {/* Sales Assistant Output - Collapsible */}
              {result.salesAssistantOutput && (
                <section className="pt-6 border-t border-gray-200">
                  <SalesAssistantOutputCard output={result.salesAssistantOutput} />
                </section>
              )}

              {/* Report Button */}
              <section className="pt-4">
                <button
                  onClick={() => setShowModal(true)}
                  className="text-sm text-gray-600 hover:text-gray-900 underline underline-offset-4"
                >
                  View full report
                </button>
              </section>

              {/* Below Fold - Secondary Content */}
              <section className="pt-8 border-t border-gray-200 space-y-8">
                {/* Call Script */}
                <div>
                  <CallScript bullets={result.sales_output.callScript} />
                </div>

                {/* Discovery Questions */}
                {result.followUpQuestions && (
                  <div>
                    <DiscoveryQuestions followUp={result.followUpQuestions} />
                  </div>
                )}

                {/* Recommended Actions - Expanded */}
                <RecommendedActionsExpanded
                  nextStep={result.suggested_next_step}
                  actions={result.recommended_actions}
                  dealStrategy={result.dealStrategyEngine}
                />

                {/* Time & Source Intel */}
                <TimeSourceIntel
                  timeIntel={result.timeBasedIntelligence}
                  sourceIntel={result.sourceIntelligence}
                />

                {/* Pricing Strategy */}
                <PricingStrategy
                  dealStrategy={result.dealStrategyEngine}
                  simplifiedScoring={result.simplifiedScoring}
                />

                {/* Deal Strategy Engine */}
                {result.dealStrategyEngine && (
                  <DealStrategyEngineCompact strategy={result.dealStrategyEngine} />
                )}

                {/* Deep Research */}
                <DeepResearchCard
                  deepResearch={result.deepResearch}
                  output={result.deepResearchOutput}
                />
              </section>
            </div>
          ) : (
            /* Empty or Loading State */
            <div>
              {isLoading ? (
                <div className="space-y-6">
                  {/* Loading State */}
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 border border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Processing...</p>
                      <p className="text-xs text-gray-500 mt-0.5">{progressText}</p>
                    </div>
                  </div>

                  {/* Stage Progress */}
                  <div className="space-y-3">
                    {STAGES.map((stage) => {
                      const isComplete = currentStage > stage.id;
                      const isActive = currentStage === stage.id;
                      return (
                        <div key={stage.id} className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            isComplete ? 'bg-gray-900 text-white' :
                            isActive ? 'border border-gray-900 text-gray-900' :
                            'border border-gray-200 text-gray-400'
                          }`}>
                            {isComplete ? (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <span className="text-[10px]">{stage.id}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm ${isComplete || isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                              {stage.name}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <EmptyState />
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN - Deal Info (25%) */}
        <div className="col-span-3">
          {result && (
            <div className="space-y-8 sticky top-6">
              {/* Lead Info */}
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Lead Info</p>
                <div className="space-y-2">
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

              {/* Business Relevance - As text */}
              <div className="pt-6 border-t border-gray-200">
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
          )}
        </div>
      </div>

      {result && <ReportModal result={result} isOpen={showModal} onClose={() => setShowModal(false)} />}
    </div>
  );
}
