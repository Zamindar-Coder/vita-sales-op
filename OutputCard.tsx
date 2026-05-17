import { useState } from 'react';
import { AgentResponse, BusinessRelevance, DeepResearchOutput, ExecutiveDecisionBlock, SalesAssistantOutput, DealVerdict, DealStrategyEngine, TimeBasedIntelligence, SourceIntelligence, FollowUpQuestions, SimplifiedScoring } from '@/lib/types';

// ============================================
// INTENT SCORE — Dominant Visual Element
// ============================================

interface LeadScoreHeroProps {
  score: number;
  priority: AgentResponse['lead_priority'];
  reasoning: string;
  confidence: number;
  breakdown?: AgentResponse['score_breakdown'];
  whyThisOpp?: string[];
}

export function LeadScoreHero({ score, priority, reasoning, confidence, breakdown, whyThisOpp }: LeadScoreHeroProps) {
  return (
    <div className="space-y-6">
      {/* Score Display */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Intent Score</p>
          <p className="text-8xl font-bold text-gray-900 leading-none tracking-tight">{score}</p>
          <p className="text-2xl text-gray-300 font-light">/100</p>
        </div>
        <div className="text-right pb-2">
          <span className="text-xs text-gray-500 uppercase tracking-wider">Priority</span>
          <p className="text-lg font-semibold text-gray-900 mt-1">{priority}</p>
        </div>
      </div>

      {/* Why This Opportunity */}
      {whyThisOpp && whyThisOpp.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Why This Opportunity</p>
          <div className="space-y-1.5">
            {whyThisOpp.map((insight, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                <span className="text-xs text-gray-700">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Score Breakdown - Compact Grid */}
      {breakdown && (
        <div className="grid grid-cols-6 gap-px bg-gray-200 border border-gray-200">
          {[
            { label: 'Budget', value: breakdown.budget, max: 25 },
            { label: 'Company', value: breakdown.companySize, max: 15 },
            { label: 'Urgency', value: breakdown.urgency, max: 20 },
            { label: 'Industry', value: breakdown.industryFit, max: 15 },
            { label: 'D.Maker', value: breakdown.decisionMaker, max: 10 },
            { label: 'Source', value: breakdown.sourceQuality, max: 15 },
          ].map((item) => (
            <div key={item.label} className="bg-white px-3 py-2 text-center">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">{item.label}</p>
              <p className="text-lg font-semibold text-gray-900 mt-0.5">{item.value}<span className="text-xs text-gray-400 font-normal">/{item.max}</span></p>
            </div>
          ))}
        </div>
      )}

      {/* AI Reasoning */}
      <p className="text-sm text-gray-500 leading-relaxed border-l-2 border-gray-200 pl-4">{reasoning}</p>

      {/* Confidence & Conversion */}
      <div className="flex gap-8 pt-4 border-t border-gray-100">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Confidence</p>
          <p className="text-xl font-semibold text-gray-900 mt-1">{confidence}%</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Conversion Prob.</p>
          <p className="text-xl font-semibold text-gray-900 mt-1">
            {score >= 65 ? '35%' : score >= 45 ? '22%' : score >= 30 ? '15%' : '8%'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// DEAL SUMMARY — Right Column
// ============================================

interface DealSummaryProps {
  verdict?: DealVerdict;
  dealValue: string;
  timeline: string;
  executiveBlock?: ExecutiveDecisionBlock;
  signal?: 'Close Now' | 'Nurture' | 'Low Priority';
}

export function DealSummary({ verdict, dealValue, timeline, executiveBlock, signal }: DealSummaryProps) {
  return (
    <div className="space-y-6">
      {/* Deal Verdict */}
      {verdict && (
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Deal Verdict</p>
          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-bold text-gray-900">{verdict.verdict}</p>
            <p className="text-sm text-gray-400">{verdict.conversionProbability}% likely</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">Expected: {verdict.expectedRevenue} · {verdict.expectedCloseDays} days</p>
        </div>
      )}

      {/* Executive Decision Block - Compact */}
      {executiveBlock && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Executive Decision</p>
            {signal && (
              <span className="text-[10px] text-gray-600 px-2 py-0.5 border border-gray-300 rounded">
                {signal}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-gray-400">Deal Value</p>
              <p className="text-lg font-semibold text-gray-900">{executiveBlock.refinedDealValue}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400">Close In</p>
              <p className="text-lg font-semibold text-gray-900">{executiveBlock.expectedCloseDays} days</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3 leading-relaxed">{executiveBlock.recommendedAction}</p>
        </div>
      )}

      {/* Key Metrics */}
      <div className="pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Est. Value</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{dealValue}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Timeline</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{timeline}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// STRENGTHS & WEAKNESSES
// ============================================

interface StrengthsWeaknessesProps {
  verdict?: DealVerdict;
  businessRelevance?: BusinessRelevance;
}

export function StrengthsWeaknesses({ verdict, businessRelevance }: StrengthsWeaknessesProps) {
  const strengths = verdict?.keyStrengths || [];
  const weaknesses = verdict?.keyWeaknesses || [];

  if (strengths.length === 0 && weaknesses.length === 0) return null;

  return (
    <div className="space-y-4">
      {strengths.length > 0 && (
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Strengths</p>
          <div className="space-y-1.5">
            {strengths.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5" />
                <span className="text-xs text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {weaknesses.length > 0 && (
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Weaknesses</p>
          <div className="space-y-1.5">
            {weaknesses.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-gray-300 mt-1.5" />
                <span className="text-xs text-gray-500">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// NEXT ACTIONS — Clickable Checklist
// ============================================

interface NextActionsProps {
  actions: string[];
  suggestedNextStep?: string;
}

export function NextActions({ actions, suggestedNextStep }: NextActionsProps) {
  return (
    <div>
      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Next Actions</p>
      {suggestedNextStep && (
        <p className="text-sm font-medium text-gray-900 mb-3">{suggestedNextStep}</p>
      )}
      <div className="space-y-2">
        {actions.map((action, i) => (
          <label key={i} className="flex items-start gap-2 group cursor-pointer">
            <input type="checkbox" className="mt-0.5 w-3.5 h-3.5 border border-gray-300 rounded text-gray-900 focus:ring-gray-500" />
            <span className="text-xs text-gray-700 group-hover:text-gray-900 transition-colors">{action}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ============================================
// PRICING STRATEGY
// ============================================

interface PricingStrategyProps {
  dealStrategy?: DealStrategyEngine;
  simplifiedScoring?: SimplifiedScoring;
}

export function PricingStrategy({ dealStrategy, simplifiedScoring }: PricingStrategyProps) {
  const angle = dealStrategy?.winningStrategy;

  if (simplifiedScoring?.pricing) {
    const pricing = simplifiedScoring.pricing;
    return (
      <div>
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Pricing Strategy</p>
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-gray-500">Range</span>
            <span className="text-sm font-semibold text-gray-900">{pricing.suggestedRange}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-gray-500">Ideal</span>
            <span className="text-sm font-semibold text-gray-900">{pricing.idealPrice}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-gray-500">Flexibility</span>
            <span className="text-xs text-gray-600">{pricing.discountFlexibility}</span>
          </div>
        </div>
        {angle && (
          <div className="pt-2 border-t border-gray-100 mt-3">
            <p className="text-[10px] text-gray-400 mb-1">Angle</p>
            <p className="text-xs text-gray-700">{angle.angleDescription}</p>
          </div>
        )}
      </div>
    );
  }

  if (dealStrategy?.pricingGuidance) {
    const pricing = dealStrategy.pricingGuidance;
    return (
      <div>
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Pricing Strategy</p>
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-gray-500">Range</span>
            <span className="text-sm font-semibold text-gray-900">{pricing.suggestedRange}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-gray-500">Negotiation</span>
            <span className="text-xs text-gray-600">{pricing.negotiationFlexibility}</span>
          </div>
        </div>
        {angle && (
          <div className="pt-2 border-t border-gray-100 mt-3">
            <p className="text-[10px] text-gray-400 mb-1">Angle</p>
            <p className="text-xs text-gray-700">{angle.angleDescription}</p>
          </div>
        )}
      </div>
    );
  }

  return null;
}

// ============================================
// EMAIL DRAFT — Collapsible
// ============================================

interface EmailDraftProps {
  emailDraft: string;
}

export function EmailDraft({ emailDraft }: EmailDraftProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Email Draft</p>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && (
        <div className="mt-3">
          <pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed bg-gray-50 p-3 rounded">
            {emailDraft}
          </pre>
        </div>
      )}
    </div>
  );
}

// ============================================
// CALL SCRIPT — Below Fold
// ============================================

interface CallScriptProps {
  bullets: string[];
}

export function CallScript({ bullets }: CallScriptProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">Call Script</p>
      <div className="space-y-3">
        {bullets.map((bullet, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-600 shrink-0">
              {i + 1}
            </span>
            <span className="text-sm text-gray-700 leading-relaxed">{bullet}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// DISCOVERY QUESTIONS — Below Fold
// ============================================

interface DiscoveryQuestionsProps {
  followUp?: FollowUpQuestions;
}

export function DiscoveryQuestions({ followUp }: DiscoveryQuestionsProps) {
  if (!followUp) return null;

  return (
    <div>
      <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">Discovery Questions</p>
      <p className="text-xs text-gray-500 italic mb-4">{followUp.conversationalTone.opening}</p>
      <div className="space-y-3">
        {followUp.questions.map((q, i) => (
          <div key={i} className="border-l-2 border-gray-200 pl-3">
            <p className="text-xs text-gray-700 leading-relaxed">"{q.question}"</p>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
              {q.focus.replace('_', ' ')} · +{q.scoreBoost} pts
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// RECOMMENDED ACTIONS — Expanded Below Fold
// ============================================

interface RecommendedActionsExpandedProps {
  nextStep: string;
  actions: string[];
  dealStrategy?: DealStrategyEngine;
}

export function RecommendedActionsExpanded({ nextStep, actions, dealStrategy }: RecommendedActionsExpandedProps) {
  const closingPlan = dealStrategy?.closingPlan;

  return (
    <div>
      <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">Recommended Actions</p>
      <p className="text-sm font-medium text-gray-900 mb-4">{nextStep}</p>

      {/* Closing Plan */}
      {closingPlan && (
        <div className="mb-4 pb-4 border-b border-gray-100">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Closing Plan</p>
          <div className="space-y-2">
            {[closingPlan.step1, closingPlan.step2, closingPlan.step3].map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-[9px] font-medium text-gray-600 shrink-0">
                  {i + 1}
                </span>
                <div>
                  <p className="text-xs text-gray-700">{step.action}</p>
                  <p className="text-[10px] text-gray-400">{step.timing}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Actions */}
      <div className="space-y-2">
        {actions.map((action, i) => (
          <label key={i} className="flex items-start gap-2 group cursor-pointer">
            <input type="checkbox" className="mt-0.5 w-3.5 h-3.5 border border-gray-300 rounded" />
            <span className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors">{action}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ============================================
// TIME & SOURCE INTELLIGENCE — Below Fold
// ============================================

interface TimeSourceIntelProps {
  timeIntel?: TimeBasedIntelligence;
  sourceIntel?: SourceIntelligence;
}

export function TimeSourceIntel({ timeIntel, sourceIntel }: TimeSourceIntelProps) {
  if (!timeIntel && !sourceIntel) return null;

  return (
    <div className="grid grid-cols-2 gap-6">
      {timeIntel && (
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Follow-up Timing</p>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-gray-400">Best Time</p>
              <p className="text-sm text-gray-900">{timeIntel.bestTimeToFollowUp.day} at {timeIntel.bestTimeToFollowUp.hour}:00</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400">Decay Risk</p>
              <p className="text-sm text-gray-600">{timeIntel.dealDecayRisk}</p>
            </div>
          </div>
        </div>
      )}

      {sourceIntel && (
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Source Intelligence</p>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-gray-400">Stage</p>
              <p className="text-sm text-gray-900 capitalize">{sourceIntel.inferredBuyingStage}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400">Intent</p>
              <p className="text-sm text-gray-600">{sourceIntel.inferredIntent}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// SALES ASSISTANT OUTPUT — Outreach Message
// ============================================

interface SalesAssistantOutputCardProps {
  output: SalesAssistantOutput;
}

export function SalesAssistantOutputCard({ output }: SalesAssistantOutputCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <p className="text-[10px] text-gray-400 uppercase tracking-wider">
          {output.outreachChannel === 'whatsapp' ? 'WhatsApp' : 'Email'} Message
        </p>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && (
        <div className="mt-3 space-y-3">
          <pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed bg-gray-50 p-3 rounded">
            {output.outreachMessage}
          </pre>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Strategy</p>
            <p className="text-xs text-gray-700 capitalize">{output.callStrategy.keyAngle} angle</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// DEAL STRATEGY ENGINE — Compact Below Fold
// ============================================

interface DealStrategyEngineCompactProps {
  strategy: DealStrategyEngine;
}

export function DealStrategyEngineCompact({ strategy }: DealStrategyEngineCompactProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Strategy</p>
      <div className="space-y-3">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Angle</p>
          <p className="text-sm text-gray-900 capitalize">{strategy.winningStrategy.positioningAngle.replace('-', ' ')}</p>
          <p className="text-xs text-gray-500 mt-1">{strategy.winningStrategy.angleDescription}</p>
        </div>
        <div className="flex gap-6">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Negotiation</p>
            <p className="text-xs text-gray-700">{strategy.pricingGuidance.negotiationFlexibility} flexibility</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Pushback Risk</p>
            <p className="text-xs text-gray-700">{strategy.pricingGuidance.pushbackRisk}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// EMPTY STATE
// ============================================

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <p className="text-sm text-gray-500">Run analysis to see lead insights</p>
    </div>
  );
}

// ============================================
// DEEP RESEARCH — Industry Insights
// ============================================

interface DeepResearchCardProps {
  deepResearch: boolean;
  output?: DeepResearchOutput;
}

export function DeepResearchCard({ deepResearch, output }: DeepResearchCardProps) {
  if (!deepResearch || !output) return null;

  return (
    <div className="pt-6 border-t border-gray-200">
      <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">Deep Research</p>

      {/* Industry Insights */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Typical Deal</p>
          <p className="text-sm text-gray-900">{output.industryInsights.typicalDealSize}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Sales Cycle</p>
          <p className="text-sm text-gray-900">{output.industryInsights.salesCycleLength}</p>
        </div>
      </div>

      {/* Risk Score */}
      <div className="flex items-center gap-4 mb-4">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Risk Score</p>
          <p className="text-lg font-semibold text-gray-900">{output.riskAnalysis.overallRiskScore}/100</p>
        </div>
        <div className="flex gap-1">
          {['Competitive', 'Timeline', 'Budget'].map((risk) => (
            <span key={risk} className="text-[9px] px-1.5 py-0.5 border border-gray-300 rounded text-gray-500">
              {risk}: {output.riskAnalysis[risk.toLowerCase() as keyof typeof output.riskAnalysis] as string}
            </span>
          ))}
        </div>
      </div>

      {/* Conversion */}
      <div>
        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Conversion Probability</p>
        <p className="text-lg font-semibold text-gray-900">{output.conversionAnalysis.probability}%</p>
        <p className="text-xs text-gray-500 mt-1">{output.conversionAnalysis.explanation}</p>
      </div>
    </div>
  );
}
