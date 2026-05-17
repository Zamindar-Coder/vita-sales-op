export interface ExtractedRequirements {
  product: string;
  quantity: string;
  industry: string;
  urgency: string;
  use_case?: string;
  budget_range?: string;
  company_size?: string;
  location?: string;
  decision_maker?: string;
  inquiry_source?: string;
  previous_vendor?: string;
}

export interface ScoreBreakdown {
  budget: number;        // 0-25
  companySize: number;   // 0-15
  urgency: number;        // 0-20
  industryFit: number;   // 0-15
  decisionMaker: number;  // 0-10
  sourceQuality: number;  // 0-15
  total: number;
}

export interface BusinessRelevance {
  revenuePotential: string;
  conversionLikelihood: string;
  riskFactor: string;
  urgencyImpact: string;
  summary: string;
}

export interface SalesOutput {
  emailDraft: string;
  emailSubject?: string;
  whatsappDraft?: string;
  callScript: string[];
  nextActions: string[];
}

export interface AgentResponse {
  id: string;
  brand: string;
  extracted_requirements: ExtractedRequirements;
  lead_priority: 'High' | 'Medium' | 'Low';
  lead_score: number;
  score_breakdown: ScoreBreakdown;
  business_relevance: BusinessRelevance;
  sales_output: SalesOutput;
  confidence: number;
  estimated_deal_value: string;
  recommended_timeline: string;
  suggested_next_step: string;
  short_sales_response: string;
  recommended_actions: string[];
  action_log: string[];
  report_summary: ReportSummary;
  score_reasoning?: string;
  generated_report_image?: string;
  notes?: LeadNotes;
  noteInfluence?: {
    competitionRisk: number;   // 0-10, added to risk assessment
    followUpUrgency: number;   // 0-10, adjusts timeline recommendation
    conversionModifier: number; // -15 to +15, adjusts conversion probability
  };
  deepResearch: boolean;
  deepResearchOutput?: DeepResearchOutput;
  executiveDecisionBlock?: ExecutiveDecisionBlock;
  salesAssistantOutput?: SalesAssistantOutput;
  prioritizationSignal?: 'Close Now' | 'Nurture' | 'Low Priority';
  dealVerdict?: DealVerdict;
  dealStrategyEngine?: DealStrategyEngine;
  timeBasedIntelligence?: TimeBasedIntelligence;
  sourceIntelligence?: SourceIntelligence;
  followUpQuestions?: FollowUpQuestions;
  simplifiedScoring?: SimplifiedScoring;
}

export interface ReportSummary {
  leads_today: number;
  high_priority: number;
  pending_followups: number;
  reports_generated: number;
  total_score_processed: number;
}

export interface ExecutionLogEntry {
  timestamp: string;
  stage: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'debug';
  group?: string;
}

export interface Metrics {
  totalLeads: number;
  highPriority: number;
  conversionRate: number;
  pipelineValue: string;
  avgScore: number;
  reportsGenerated: number;
  avgDealSize: string;
  pipelineHealth: { early: number; late: number };
}

export interface SessionStats {
  leads_today: number;
  high_priority: number;
  pending_followups: number;
  reports_generated: number;
  total_score_processed: number;
}

export interface LLMProvider {
  complete(prompt: string): Promise<string>;
  generateResponse(prompt: string): Promise<string>;
  generateJSON(prompt: string): Promise<Record<string, unknown>>;
  generateImage(prompt: string): Promise<string>;
}

export interface ExecutionStage {
  id: number;
  name: string;
  description: string;
  duration: number;
}

export interface NoteEntry {
  id: string;
  timestamp: string;
  type: 'manual' | 'ai_generated' | 'risk_extraction' | 'follow_up' | 'summary';
  content: string;
  author: 'user' | 'system';
  editHistory?: { timestamp: string; content: string }[];
}

export interface LeadNotes {
  keyObservations: string[];
  risks: string[];
  missingInfo: string[];
  salesStrategyNotes: string[];
  entries: NoteEntry[];
}

export interface IndustryInsights {
  typicalDealSize: string;
  buyingBehavior: string;
  salesCycleLength: string;
  marketSeasonality: string;
  keyPlayers: string[];
  decisionMakers: string[];
  commonObjections: string[];
  competitiveLandscape: string;
}

export interface RiskAnalysis {
  missingInfo: string[];
  weakSignals: string[];
  competitiveRisk: 'Low' | 'Medium' | 'High';
  timelineRisk: 'Low' | 'Medium' | 'High';
  budgetRisk: 'Low' | 'Medium' | 'High';
  overallRiskScore: number; // 0-100
  redFlags: string[];
}

export interface ConversionAnalysis {
  probability: number; // 0-100
  explanation: string;
  boostingFactors: string[];
  detractingFactors: string[];
  comparisonToIndustry: string;
}

export interface StrategicRecommendations {
  immediate: string[];
  shortTerm: string[];
  longTerm: string[];
  competitiveAngle: string;
  uniqueValueProposition: string;
  stakeholderMapping: string[];
  negotiationStrategy: string;
}

export interface ExpandedSalesPlaybook {
  emailDraft: string;
  whatsappDraft?: string;
  callOpenerScript?: string;
  emailSubject: string;
  callScript: string[];
  callObjectives: string[];
  objectionHandling: { objection: string; response: string }[];
  discoveryQuestions: string[];
  closeTechniques: string[];
}

export interface DeepResearchOutput {
  industryInsights: IndustryInsights;
  riskAnalysis: RiskAnalysis;
  conversionAnalysis: ConversionAnalysis;
  strategicRecommendations: StrategicRecommendations;
  expandedPlaybook: ExpandedSalesPlaybook;
  dealIntelligence?: DealIntelligence;
}

export interface DealIntelligence {
  industryBenchmark: {
    avgDealSize: string;
    avgCloseTime: string;
    conversionRate: string;
  };
  similarDeals: {
    count: number;
    avgValue: string;
    closedInDays: number;
  };
  dealMomentum: 'Accelerating' | 'Stable' | 'Decelerating';
}

export interface ExecutiveDecisionBlock {
  conversionProbability: number;
  refinedDealValue: string;
  expectedCloseDays: number;
  dealQuality: 'High' | 'Medium' | 'Low';
  whyThisMatters: string[];
  primaryRisk: string;
  recommendedAction: string;
}

export interface SalesAssistantOutput {
  outreachMessage: string;
  outreachChannel: 'email' | 'whatsapp';
  callStrategy: {
    approach: string;
    keyAngle: 'price' | 'urgency' | 'value' | 'relationship';
    talkingPoints: string[];
  };
  objectionHandling: {
    objection: string;
    response: string;
  }[];
}

export interface DealVerdict {
  verdict: 'Strong' | 'Medium' | 'Weak';
  conversionProbability: number;
  expectedRevenue: string;
  expectedCloseDays: number;
  keyStrengths: string[];
  keyWeaknesses: string[];
}

export interface DealStrategyEngine {
  winningStrategy: {
    positioningAngle: 'cost-saving' | 'speed' | 'quality' | 'risk-reduction';
    angleDescription: string;
    whyThisAngle: string;
  };
  pricingGuidance: {
    suggestedRange: string;
    negotiationFlexibility: 'Low' | 'Medium' | 'High';
    pushbackRisk: 'Low' | 'Medium' | 'High';
  };
  closingPlan: {
    step1: { action: string; timing: string; trigger: string };
    step2: { action: string; timing: string; trigger: string };
    step3: { action: string; timing: string; trigger: string };
  };
}

export interface TimeBasedIntelligence {
  bestTimeToFollowUp: { hour: number; day: string };
  dealDecayRisk: 'High' | 'Medium' | 'Low';
  decayReason: string;
  next7DaysTimeline: {
    day: string;
    action: string;
    objective: string;
  }[];
}

export interface SourceIntelligence {
  inferredIntent: string;
  inferredBuyingStage: 'awareness' | 'consideration' | 'decision' | 'comparison';
  possibleHiddenRequirements: string[];
  engagementSignals: string[];
}

export interface FollowUpQuestions {
  questions: {
    question: string;
    focus: 'budget' | 'decision_maker' | 'urgency' | 'competition' | 'timeline';
    impact: 'high' | 'medium' | 'low';
    scoreBoost: number;
  }[];
  priorityQuestions: string[];
  discoveryQuestions: string[];
  disqualifyingQuestions: string[];
  conversationalTone: {
    opening: string;
    transition: string;
    closing: string;
  };
}

export interface SimplifiedScoring {
  scoreBreakdown: {
    intent: number;      // 0-20
    budget: number;       // 0-20
    urgency: number;      // 0-20
    industryFit: number;  // 0-20
    decisionMaker: number; // 0-20
  };
  confidence: number;     // 0-1
  pricing: {
    suggestedRange: string;
    idealPrice: string;
    discountFlexibility: 'low' | 'medium' | 'high';
    pricingRisk: 'low' | 'medium' | 'high';
  };
  followUpQuestions: string[];
  dealInsight: string;
}

export interface SalesOutput {
  emailDraft: string;
  whatsappDraft?: string;
  callOpenerScript?: string;
  callScript: string[];
  nextActions: string[];
}

export const EXECUTION_STAGES: ExecutionStage[] = [
  { id: 1, name: 'Intake & Parsing', description: 'Analyzing inquiry...', duration: 2500 },
  { id: 2, name: 'Context Understanding', description: 'Mapping industry context...', duration: 3500 },
  { id: 3, name: 'Lead Scoring', description: 'Evaluating lead value...', duration: 3000 },
  { id: 4, name: 'Decision Engine', description: 'Determining optimal path...', duration: 2500 },
  { id: 5, name: 'Action Simulation', description: 'Executing workflow steps...', duration: 3500 },
  { id: 6, name: 'Report Generation', description: 'Compiling insights...', duration: 2000 },
];
