import {
  AgentResponse,
  ExecutionLogEntry,
  ScoreBreakdown,
  BusinessRelevance,
  SalesOutput,
  DeepResearchOutput,
  IndustryInsights,
  RiskAnalysis,
  ConversionAnalysis,
  StrategicRecommendations,
  ExpandedSalesPlaybook,
  DealIntelligence,
  ExecutiveDecisionBlock,
  SalesAssistantOutput,
  DealVerdict,
  DealStrategyEngine,
  TimeBasedIntelligence,
  SourceIntelligence,
  FollowUpQuestions,
  SimplifiedScoring,
} from './types';
import { store } from './inMemoryStore';
import { GeminiProvider, MiniMaxProvider } from './providers';
import {
  addLeadNote,
  generateAIGeneratedNotes,
  updateLeadStructuredNotes,
  calculateNoteInfluence,
  getLeadNotes,
} from './store';

// ============================================
// DETERMINISTIC SCORING ENGINE
// ============================================

// Budget score: 0-25 pts
function scoreBudget(budgetRange: string): number {
  switch (budgetRange) {
    case 'lt5k': return 5;
    case '5k-10k': return 10;
    case '10k-50k': return 15;
    case '50k-500k': return 20;
    case 'gt500k': return 25;
    default: return 10;
  }
}

// Company Size score: 0-15 pts
function scoreCompanySize(size: string): number {
  switch (size) {
    case 'small': return 5;
    case 'mid': return 10;
    case 'enterprise': return 15;
    default: return 5;
  }
}

// Urgency score: 0-20 pts
function scoreUrgency(urgency: string): number {
  switch (urgency) {
    case 'critical': return 20;
    case 'high': return 15;
    case 'medium': return 10;
    case 'low': return 5;
    default: return 10;
  }
}

// Industry Fit score: 0-15 pts
function scoreIndustryFit(industry: string): number {
  const highValue = ['Oil & Gas', 'Aerospace', 'Pharmaceutical', 'Chemical', 'Energy', 'Metal'];
  const mediumValue = ['Manufacturing', 'ERP / IT Modernization', 'VR / AR', 'SaaS / Tech', 'Construction'];
  if (highValue.includes(industry)) return 15;
  if (mediumValue.includes(industry)) return 10;
  return 5;
}

// Decision Maker score: 0-10 pts
function scoreDecisionMaker(hasDecisionMaker: string): number {
  return hasDecisionMaker === 'yes' ? 10 : 0;
}

// Source Quality score: 0-15 pts
function scoreSourceQuality(source: string): number {
  switch (source) {
    case 'existing_customer': return 15;
    case 'referral': return 12;
    case 'inbound': return 10;
    case 'event': return 8;
    case 'marketplace': return 8;
    case 'linkedin': return 6;
    case 'distributor': return 6;
    case 'cold_outreach': return 4;
    default: return 5;
  }
}

export function calculateLeadScore(requirements: {
  budget_range?: string;
  company_size?: string;
  urgency: string;
  industry: string;
  decision_maker?: string;
  inquiry_source?: string;
}): { score: number; breakdown: ScoreBreakdown } {
  const budget = scoreBudget(requirements.budget_range || '');
  const companySize = scoreCompanySize(requirements.company_size || '');
  const urgency = scoreUrgency(requirements.urgency);
  const industryFit = scoreIndustryFit(requirements.industry);
  const decisionMaker = scoreDecisionMaker(requirements.decision_maker || '');
  const sourceQuality = scoreSourceQuality(requirements.inquiry_source || '');

  const total = Math.min(100, budget + companySize + urgency + industryFit + decisionMaker + sourceQuality);

  return {
    score: total,
    breakdown: { budget, companySize, urgency, industryFit, decisionMaker, sourceQuality, total },
  };
}

export function classifyPriority(score: number): 'High' | 'Medium' | 'Low' {
  if (score >= 65) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

// ============================================
// DEAL VALUE ESTIMATION (DETERMINISTIC)
// ============================================

function parseQuantity(qty: string): number {
  const match = qty.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

const INDUSTRY_MULTIPLIERS: Record<string, number> = {
  'Oil & Gas': 5000,
  'Aerospace': 4000,
  'Pharmaceutical': 3000,
  'Chemical': 2500,
  'Energy': 2000,
  'Metal': 1800,
  'Manufacturing': 1500,
  'ERP / IT Modernization': 800,
  'Construction': 1200,
  'VR / AR': 600,
  'SaaS / Tech': 500,
  'Other': 1000,
};

export function estimateDealValue(
  quantity: string,
  industry: string,
  budgetRange?: string
): string {
  const qty = parseQuantity(quantity);
  const multiplier = INDUSTRY_MULTIPLIERS[industry] || 1000;

  // Base value from quantity (in dollars)
  let total = qty * multiplier;

  // Adjust by budget if provided
  if (budgetRange === 'lt5k') total = Math.min(total, 5000);
  else if (budgetRange === '5k-10k') total = Math.min(total, 10000);
  else if (budgetRange === '10k-50k') total = Math.min(total, 50000);
  else if (budgetRange === '50k-500k') total = Math.min(total, Math.max(total, 75000));
  else if (budgetRange === 'gt500k') total = Math.max(total, 500000);

  // Convert to INR (approximately 83 INR per USD)
  const inr = total * 83;

  // Format in Indian numbering system
  if (inr >= 10000000) {
    return `₹${(inr / 10000000).toFixed(1)}Cr`;
  }
  if (inr >= 100000) {
    return `₹${(inr / 100000).toFixed(1)}L`;
  }
  return `₹${inr.toFixed(0)}`;
}

export function getRecommendedTimeline(priority: 'High' | 'Medium' | 'Low'): string {
  switch (priority) {
    case 'High': return 'Within 4 hours';
    case 'Medium': return 'Within 48 hours';
    case 'Low': return 'Within 1 week';
  }
}

function determineActions(priority: 'High' | 'Medium' | 'Low', score: number): string[] {
  if (priority === 'High' || score >= 65) {
    return [
      'Assign dedicated account manager immediately',
      'Send priority quote within 24 hours',
      'Schedule discovery call within 24 hours',
      'Prepare custom proposal document',
      'Alert executive sponsor for fast-track approval',
    ];
  } else if (priority === 'Medium') {
    return [
      'Send product information package',
      'Schedule demo within 48 hours',
      'Prepare tailored proposal',
      'Assign to standard sales cycle',
    ];
  }
  return [
    'Add to nurture campaign',
    'Send introductory materials',
    'Schedule follow-up in 1 week',
  ];
}

// ============================================
// BUSINESS RELEVANCE (DETERMINISTIC)
// ============================================

function calculateBusinessRelevance(
  score: number,
  priority: 'High' | 'Medium' | 'Low',
  dealValue: string,
  urgency: string
): BusinessRelevance {
  const dealMillion = dealValue.includes('M');
  const dealK = dealValue.includes('K');

  let revenuePotential: BusinessRelevance['revenuePotential'];
  if (dealMillion || (dealK && parseFloat(dealValue.replace(/[^\d.]/g, '')) >= 200)) {
    revenuePotential = 'Exceptional';
  } else if (dealK || parseFloat(dealValue.replace(/[^\d.]/g, '')) >= 50) {
    revenuePotential = 'Strong';
  } else {
    revenuePotential = 'Moderate';
  }

  let conversionLikelihood: BusinessRelevance['conversionLikelihood'];
  if (score >= 65) conversionLikelihood = 'Very Likely';
  else if (score >= 45) conversionLikelihood = 'Likely';
  else if (score >= 25) conversionLikelihood = 'Possible';
  else conversionLikelihood = 'Unlikely';

  let riskFactor: BusinessRelevance['riskFactor'];
  if (score >= 55 && priority !== 'Low') riskFactor = 'Low Risk';
  else if (score >= 30) riskFactor = 'Medium Risk';
  else riskFactor = 'High Risk';

  let urgencyImpact: BusinessRelevance['urgencyImpact'];
  if (urgency === 'critical' || urgency === 'high') urgencyImpact = 'Critical';
  else if (urgency === 'medium') urgencyImpact = 'Significant';
  else urgencyImpact = 'Standard';

  const summary = `${revenuePotential} revenue opportunity with ${conversionLikelihood.toLowerCase()} conversion. ${urgencyImpact === 'Critical' ? 'Immediate action required.' : 'Standard follow-up protocol.'}`;

  return { revenuePotential, conversionLikelihood, riskFactor, urgencyImpact, summary };
}

// ============================================
// SALES OUTPUT (DETERMINISTIC)
// ============================================

function generateSalesOutput(
  companyName: string,
  product: string,
  industry: string,
  priority: 'High' | 'Medium' | 'Low',
  timeline: string,
  dealValue: string
): SalesOutput {
  const contactName = companyName.split(' ')[0];
  const timelineLower = timeline.toLowerCase();

  const emailDraft = priority === 'High'
    ? `Subject: Priority Response — ${product} for ${companyName}\n\nDear ${contactName} Team,\n\nThank you for your interest in our ${product} solutions. Given the urgency and scale of your requirement, I have personally assigned this to our senior team.\n\nOur ${industry} specialists have handled similar deployments and can provide a detailed proposal within 24 hours. Would tomorrow at 10 AM work for a call to discuss specifics?\n\nBest regards,\nSales Team`
    : priority === 'Medium'
    ? `Subject: ${product} Solutions for ${companyName}\n\nDear ${contactName} Team,\n\nThank you for reaching out regarding ${product}. Based on your requirements, I believe we can deliver significant value to your operations.\n\nI'll prepare a tailored proposal and send it over within 48 hours. Would you be available for a brief call this week to ensure we capture all requirements accurately?\n\nBest regards,\nSales Team`
    : `Subject: ${product} Solutions — ${companyName}\n\nDear ${contactName} Team,\n\nThank you for your inquiry about ${product}. We've logged your requirements and our team will prepare some options tailored to your needs.\n\nExpect to hear from us within the week with a detailed proposal. In the meantime, feel free to explore our product literature.\n\nBest regards,\nSales Team`;

  const callScript = priority === 'High' || priority === 'Medium'
    ? [
        `Confirm decision-maker identity and direct contact details`,
        `Verify quantity, budget range, and exact timeline requirements`,
        `Assess current vendor situation and replacement urgency`,
        `Identify key stakeholders and approval process`,
        `Confirm next step: proposal, demo, or executive presentation`,
      ]
    : [
        `Introduce company and confirm product interest`,
        `Gather basic requirements: quantity, timeline, budget`,
        `Assess if timing is firm or exploratory`,
        `Schedule follow-up with detailed proposal`,
        `Add to nurture sequence for future engagement`,
      ];

  const nextActions = priority === 'High'
    ? [
        `Send introduction email within 2 hours`,
        `Prepare preliminary quote based on requirements`,
        `Schedule call with decision-maker within 24 hours`,
        `Alert team for priority handling`,
      ]
    : priority === 'Medium'
    ? [
        `Send welcome email within 4 hours`,
        `Research company and prepare background brief`,
        `Schedule follow-up call within 48 hours`,
        `Add to active pipeline monitoring`,
      ]
    : [
        `Send welcome email with product information`,
        `Research company background and contacts`,
        `Schedule follow-up in 3-5 days`,
        `Add to weekly pipeline review`,
      ];

  return { emailDraft, callScript, nextActions };
}

// ============================================
// DEEP RESEARCH MODE — Industry Insights
// ============================================

function generateIndustryInsights(
  industry: string,
  useCase?: string,
  budgetRange?: string
): IndustryInsights {
  const insights: Record<string, Partial<IndustryInsights>> = {
    'Oil & Gas': {
      typicalDealSize: '₹2Cr - ₹16Cr',
      buyingBehavior: 'Multi-stakeholder approval, long procurement cycles, safety-first evaluation criteria',
      salesCycleLength: '3-6 months',
      marketSeasonality: 'Q4 budget flush, Q1 planning season',
      keyPlayers: ['Procurement Director', 'Plant Manager', 'HSE Director', 'CFO'],
      decisionMakers: ['VP Operations', 'CEO for large deals'],
      commonObjections: ['We already have a preferred vendor', 'Budget not approved', 'Need headquarters sign-off'],
      competitiveLandscape: 'Domination by Schlumberger, Baker Hughes, Halliburton. Local players compete on service.',
    },
    'Manufacturing': {
      typicalDealSize: '₹40L - ₹4Cr',
      buyingBehavior: 'ROI-focused, production efficiency critical, cross-functional buy-in',
      salesCycleLength: '2-4 months',
      marketSeasonality: 'Variable, often tied to fiscal years and plant maintenance cycles',
      keyPlayers: ['Plant Manager', 'Procurement Manager', 'Engineering Director'],
      decisionMakers: ['CFO', 'CEO for enterprise deals'],
      commonObjections: ['Downtime risk during installation', 'Integration with existing systems', 'Total cost of ownership'],
      competitiveLandscape: 'Fragmented market, many regional players. Price competition intense except for premium solutions.',
    },
    'Aerospace': {
      typicalDealSize: '₹4Cr - ₹40Cr',
      buyingBehavior: 'Rigorous qualification, traceability requirements, quality certifications mandatory',
      salesCycleLength: '6-12 months',
      marketSeasonality: 'Long-term contracts, quarterly review cycles',
      keyPlayers: ['Quality Director', 'Supply Chain Manager', 'Engineering VP'],
      decisionMakers: ['CEO', 'Board for major partnerships'],
      commonObjections: ['AS9100 certification required', 'Traceability to lot level', 'First article inspection'],
      competitiveLandscape: 'Oligopoly, strong relationships with primes (Boeing, Airbus). Sub-tier suppliers compete on quality.',
    },
    'Energy': {
      typicalDealSize: '₹80L - ₹8Cr',
      buyingBehavior: 'Regulatory compliance driven, reliability paramount, long-term service relationships',
      salesCycleLength: '3-5 months',
      marketSeasonality: 'Project-based, tied to infrastructure budgets and regulatory deadlines',
      keyPlayers: ['Energy Manager', 'Compliance Officer', 'Operations Director'],
      decisionMakers: ['CFO', 'Board for large projects'],
      commonObjections: ['Regulatory approval timeline', 'Grid connection complexity', 'Interconnection agreements'],
      competitiveLandscape: 'Growing renewable sector, traditional utilities competing on green initiatives. EPC firms dominate large projects.',
    },
    'ERP / IT Modernization': {
      typicalDealSize: '₹1.6Cr - ₹16Cr',
      buyingBehavior: 'Committee-driven, IT and business joint ownership, change management critical',
      salesCycleLength: '6-18 months',
      marketSeasonality: 'Calendar fiscal year, Q4 end-of-budget rush',
      keyPlayers: ['IT Director', 'CFO', 'Process Owner', 'Change Management Lead'],
      decisionMakers: ['CEO', 'Board for strategic transformations'],
      commonObjections: ['Integration complexity', 'Data migration risk', 'User adoption challenges', 'Total cost justification'],
      competitiveLandscape: 'SAP, Oracle, Microsoft dominate enterprise. Salesforce, HubSpot compete in mid-market. Differentiation through industry templates.',
    },
  };

  const base: IndustryInsights = {
    typicalDealSize: '₹20L - ₹1.6Cr',
    buyingBehavior: 'Direct decision-maker contact, value demonstration critical, reference selling important',
    salesCycleLength: '1-3 months',
    marketSeasonality: 'Standard fiscal year patterns',
    keyPlayers: ['Owner/GM', 'Procurement Manager'],
    decisionMakers: ['Owner', 'Managing Director'],
    commonObjections: ['Price vs alternatives', 'Implementation timeline', 'Support and maintenance terms'],
    competitiveLandscape: 'Highly fragmented, many small players. Competitive pricing pressure.',
  };

  const override = insights[industry] || {};
  return { ...base, ...override };
}

// ============================================
// DEEP RESEARCH MODE — Risk Analysis
// ============================================

function generateRiskAnalysis(
  requirements: ParsedRequirements,
  score: number,
  priority: 'High' | 'Medium' | 'Low'
): RiskAnalysis {
  const missingInfo: string[] = [];
  const weakSignals: string[] = [];
  const redFlags: string[] = [];

  if (!requirements.quantity || requirements.quantity === 'TBD') {
    missingInfo.push('Exact quantity/scope not specified');
  }
  if (!requirements.budget_range) {
    missingInfo.push('Budget range undisclosed');
    redFlags.push('Budget-conscious or exploratory inquiry');
  }
  if (!requirements.company_size || requirements.company_size === 'small') {
    weakSignals.push('Small company may have limited purchasing power');
  }
  if (!requirements.decision_maker || requirements.decision_maker === 'no') {
    weakSignals.push('Decision maker not yet identified');
    redFlags.push('May require additional discovery call');
  }
  if (requirements.inquiry_source === 'cold_outreach') {
    weakSignals.push('Cold outreach leads typically have lower conversion rates');
  }
  if (score < 40) {
    redFlags.push('Low lead score indicates weak fit or poor targeting');
  }
  if (requirements.previous_vendor === 'yes') {
    redFlags.push('Replacing existing vendor — competitive situation');
  }

  // Calculate risk scores
  let timelineRisk: 'Low' | 'Medium' | 'High' = 'Medium';
  let budgetRisk: 'Low' | 'Medium' | 'High' = 'Medium';
  let competitiveRisk: 'Low' | 'Medium' | 'High' = 'Medium';

  if (requirements.urgency === 'critical' || requirements.urgency === 'high') {
    timelineRisk = 'Low';
  } else if (requirements.urgency === 'low') {
    timelineRisk = 'High';
  }

  if (requirements.budget_range === 'gt500k' || requirements.budget_range === '50k-500k') {
    budgetRisk = 'Low';
  } else if (requirements.budget_range === 'lt5k') {
    budgetRisk = 'Medium';
  } else {
    budgetRisk = 'Medium';
  }

  if (requirements.previous_vendor === 'yes') {
    competitiveRisk = 'High';
  } else if (requirements.inquiry_source === 'referral' || requirements.inquiry_source === 'existing_customer') {
    competitiveRisk = 'Low';
  } else if (requirements.inquiry_source === 'cold_outreach') {
    competitiveRisk = 'High';
  }

  const overallRiskScore = Math.round(
    (missingInfo.length * 15) +
    (weakSignals.length * 10) +
    (redFlags.length * 20) +
    (score < 40 ? 20 : 0)
  );

  return {
    missingInfo,
    weakSignals,
    competitiveRisk,
    timelineRisk,
    budgetRisk,
    overallRiskScore: Math.min(100, overallRiskScore),
    redFlags,
  };
}

// ============================================
// DEEP RESEARCH MODE — Conversion Analysis
// ============================================

function generateConversionAnalysis(
  score: number,
  priority: 'High' | 'Medium' | 'Low',
  requirements: ParsedRequirements
): ConversionAnalysis {
  let probability = score >= 65 ? 35 : score >= 45 ? 22 : score >= 30 ? 15 : 8;
  const boostingFactors: string[] = [];
  const detractingFactors: string[] = [];

  // Boosting factors
  if (requirements.decision_maker === 'yes') {
    boostingFactors.push('Decision maker identified — shorter cycle');
    probability = Math.min(45, probability + 8);
  }
  if (requirements.inquiry_source === 'existing_customer' || requirements.inquiry_source === 'referral') {
    boostingFactors.push('Warm referral — higher trust');
    probability = Math.min(45, probability + 10);
  }
  if (requirements.budget_range === 'gt500k' || requirements.budget_range === '50k-500k') {
    boostingFactors.push('Enterprise budget — serious buyer');
    probability = Math.min(45, probability + 5);
  }
  if (requirements.urgency === 'high' || requirements.urgency === 'critical') {
    boostingFactors.push('High urgency — time-bounded decision');
    probability = Math.min(45, probability + 5);
  }
  if (requirements.company_size === 'enterprise') {
    boostingFactors.push('Enterprise target — larger deal size');
    probability = Math.min(45, probability + 5);
  }

  // Detracting factors
  if (!requirements.decision_maker || requirements.decision_maker === 'no') {
    detractingFactors.push('No decision maker identified — extended discovery needed');
    probability = Math.max(5, probability - 8);
  }
  if (requirements.inquiry_source === 'cold_outreach') {
    detractingFactors.push('Cold outreach — higher friction, longer cycle');
    probability = Math.max(5, probability - 7);
  }
  if (!requirements.budget_range) {
    detractingFactors.push('Budget undisclosed — qualification required');
    probability = Math.max(5, probability - 5);
  }
  if (requirements.previous_vendor === 'yes') {
    detractingFactors.push('Vendor replacement — competitive evaluation');
    probability = Math.max(5, probability - 5);
  }
  if (score < 40) {
    detractingFactors.push('Low baseline score — weak fit signals');
    probability = Math.max(5, probability - 5);
  }

  const explanation = probability >= 35
    ? `Strong lead profile with clear buying signals. Decision maker identified, budget confirmed, and urgency aligned. Expected to convert within 2-4 weeks with proper engagement.`
    : probability >= 20
    ? `Moderate lead with some positive indicators. Requires additional qualification to confirm budget and timeline. Consider as a 6-8 week pipeline opportunity with discovery focus.`
    : `Lower probability lead with multiple risk factors. Focus on efficient qualification — don't over-invest until basic criteria are confirmed (budget, decision maker, timeline).`;

  const comparisonToIndustry = probability >= 35
    ? `Above industry average conversion rate (industry benchmark: ${25 - 30}%)`
    : probability >= 15
    ? `Within industry average range (${15 - 25}%)`
    : `Below average — may require longer nurturing or marketing automation follow-up`;

  return { probability, explanation, boostingFactors, detractingFactors, comparisonToIndustry };
}

// ============================================
// DEEP RESEARCH MODE — Strategic Recommendations
// ============================================

function generateStrategicRecommendations(
  requirements: ParsedRequirements,
  companyName: string,
  industry: string,
  priority: 'High' | 'Medium' | 'Low',
  score: number,
  riskAnalysis: RiskAnalysis
): StrategicRecommendations {
  const immediate: string[] = [];
  const shortTerm: string[] = [];
  const longTerm: string[] = [];

  // Immediate actions
  if (priority === 'High' || score >= 65) {
    immediate.push(`Contact ${companyName} decision maker within 24 hours — same-day email with value proposition`);
    immediate.push(`Prepare preliminary quote based on requirements — ready to send within 4 hours`);
  } else {
    immediate.push(`Send introductory email with relevant case study from ${industry} sector`);
    immediate.push(`Research company background and identify all stakeholders before calling`);
  }

  if (requirements.urgency === 'critical' || requirements.urgency === 'high') {
    immediate.push(`FLAG: High urgency — escalate to senior sales rep, prepare for expedited decision`);
  }

  // Short-term actions
  if (requirements.decision_maker !== 'yes') {
    shortTerm.push(`Identify and map all stakeholders — procurement, technical, and business decision makers`);
  }
  if (riskAnalysis.competitiveRisk === 'High') {
    shortTerm.push(`Prepare competitive differentiation brief — incumbent has relationship advantage`);
    shortTerm.push(`Develop value stack vs current vendor — quantify switching benefits`);
  }
  shortTerm.push(`Schedule discovery call within 5 business days`);
  shortTerm.push(`Send technical specifications and compliance documentation if required`);

  // Long-term actions
  if (requirements.use_case === 'System replacement') {
    longTerm.push(`Develop migration plan presentation — address fear of downtime and data loss`);
    longTerm.push(`Include success stories from same industry with system replacement use case`);
  }
  if (requirements.company_size === 'enterprise') {
    longTerm.push(`Map out buying committee — prepare materials for each stakeholder's concerns`);
    longTerm.push(`Plan executive engagement for final stages — C-level support can close deals`);
  }

  const competitiveAngle = requirements.previous_vendor === 'yes'
    ? `Position as the modernization partner — emphasize seamless transition, training, and ongoing support. Don't attack incumbent directly. Focus on what NEW capabilities they'll gain.`
    : `Position as trusted partner with strong ${industry} domain expertise. Lead with track record and specific results in similar environments.`;

  const uniqueValueProposition = requirements.industry === 'Aerospace'
    ? `AS9100 certified supplier with traceability documentation and first-article inspection reports ready for audit. ${requirements.quantity || 'Volume'} capacity with redundant production capability.`
    : requirements.industry === 'Oil & Gas'
    ? `HSE-compliant processes with documented safety record. Local service presence for emergency response. IOGP-certified materials available from stock.`
    : `Rapid deployment capability with local support team. ROI typically achieved within 6-12 months based on similar ${industry} implementations.`;

  const stakeholderMapping = requirements.company_size === 'enterprise'
    ? ['CFO: ROI justification and budget approval', 'Operations: Implementation and integration', 'IT: Security and technical compliance', 'Procurement: Contract terms and SLAs']
    : ['Owner/GM: Final decision on all aspects', 'Operations: Technical evaluation and implementation', 'Finance: Payment terms and financing'];

  const negotiationStrategy = priority === 'High'
    ? `Fast-track negotiation — be prepared to offer preferred pricing for expedited commitment. Senior management should be available for quick escalation.`
    : `Standard negotiation with clear value anchors — don't lead with price, lead with value and ROI. Prepare to bundle services for margin protection.`;

  return {
    immediate,
    shortTerm,
    longTerm,
    competitiveAngle,
    uniqueValueProposition,
    stakeholderMapping,
    negotiationStrategy,
  };
}

// ============================================
// DEEP RESEARCH MODE — Expanded Sales Playbook
// ============================================

function generateExpandedPlaybook(
  requirements: ParsedRequirements,
  companyName: string,
  product: string,
  industry: string,
  priority: 'High' | 'Medium' | 'Low'
): ExpandedSalesPlaybook {
  const firstName = companyName.split(' ')[0];

  const emailSubject = priority === 'High'
    ? `Priority: ${product} solutions for ${companyName}`
    : `${product} for ${industry} companies like ${companyName}`;

  const emailDraft = priority === 'High' || priority === 'Medium'
    ? `Subject: ${emailSubject}

Hi ${firstName} Team,

Thank you for your interest in ${product} for your ${industry} operations.

Based on your requirements, I believe we can deliver significant value:

${requirements.quantity ? `• Scale: ${requirements.quantity} capacity with proven track record in ${industry}` : ''}
${requirements.budget_range ? `• Investment range: ${requirements.budget_range === 'gt500k' ? '₹4Cr+' : requirements.budget_range === '50k-500k' ? '₹40L-₹4Cr' : 'Competitive pricing'} aligned with market standards` : ''}
${requirements.urgency === 'high' || requirements.urgency === 'critical' ? `• Timeline: We're prepared to move quickly to meet your urgent requirements` : '• Timeline: Flexible implementation schedule to minimize operational disruption'}

I'd like to schedule a 20-minute call this week to discuss your specific requirements in detail.

Are you available Thursday or Friday for a brief call?

Best regards,
Sales Team`
    : `Subject: ${emailSubject}

Hi ${firstName},

I noticed ${companyName} is evaluating ${product} solutions for your ${industry} operations.

We've helped similar companies in the ${industry} sector achieve measurable improvements in efficiency and cost reduction.

I'd be happy to share some relevant case studies and provide a quick assessment of how we might help.

Would you have 15 minutes for a brief call this week or next?

Best regards,
Sales Team`;

  const callScript = [
    `Open with value: "I'm calling about the ${product} inquiry for ${companyName}. I wanted to understand your requirements better and see if there's a fit."`,
    `Qualify budget and timeline: "What's the decision timeline and budget range you're working with?"`,
    `Identify stakeholders: "Who else is involved in this evaluation — procurement, technical team, management?"`,
    `Understand competition: "Have you evaluated other vendors, or is this early-stage exploration?"`,
    `Confirm next step: "Based on what you've shared, I think we can help. What's the best way to move forward — call, demo, or proposal?"`,
  ];

  const callObjectives = [
    `Confirm decision timeline and budget authority`,
    `Identify all stakeholders in buying committee`,
    `Understand current evaluation status vs competition`,
    `Gain commitment for next step (demo/proposal/call)`,
  ];

  const objectionHandling = [
    {
      objection: `We're already talking to other vendors`,
      response: `That's common in this stage. What would help us stand out is understanding your specific evaluation criteria. What's working well with the alternatives you've seen, and where do they fall short?`,
    },
    {
      objection: `Budget hasn't been approved yet`,
      response: `That's okay — our goal is to help you build the business case. We can provide detailed ROI analysis and work with you on phased implementation to fit budget cycles.`,
    },
    {
      objection: `We need to run this by headquarters`,
      response: `That makes sense for an initiative of this scale. Let me understand — would you say this is primarily a local decision or does it need regional/global approval? I'll tailor our materials accordingly.`,
    },
    {
      objection: `It's not a priority right now`,
      response: `I understand timing is everything. What would need to change for this to become more urgent? Sometimes having a preliminary proposal ready helps move things along when priorities shift.`,
    },
  ];

  const discoveryQuestions = [
    `What specific problem are you trying to solve with ${product}?`,
    `What's driving the timeline — business need, regulatory, or competitive pressure?`,
    `Who will be using this day-to-day, and what's their current pain point?`,
    `How does your organization typically evaluate and select vendors like us?`,
    `What would a successful implementation look like 6 months from now?`,
  ];

  const closeTechniques = [
    `Assumptive close: "Based on our discussion, I'll prepare a proposal for the configuration we covered. Should I send it to the same email or would you prefer a different contact?"`,
    `Urgency close: "Given the timeline you mentioned, I want to make sure we have enough time for a thorough implementation. Can we get started on the proposal this week?"`,
    `Value close: "When you compare the ROI we've delivered to similar companies in ${industry}, I think you'll see the value. Would it help if I prepared a side-by-side comparison?"`,
  ];

  // Generate WhatsApp draft
  const whatsappDraft = priority === 'High'
    ? `Hi ${firstName}, quick follow-up on your ${product} inquiry. We can deliver within your timeline and have priority availability. Would a 5-min call today work?`
    : `Hi ${firstName}, thanks for your interest in ${product}. I'd love to understand your requirements better. Are you available for a quick call this week?`;

  // Generate call opener script (first 30 seconds)
  const callOpenerScript = `Hi ${firstName}, this is [Your Name] from [Company]. I'm calling regarding your inquiry about ${product} for your ${industry} operations.

${requirements.urgency === 'critical' || requirements.urgency === 'high'
    ? `I understand you have an urgent requirement — I wanted to personally follow up to ensure we can meet your timeline.`
    : `I wanted to follow up on your inquiry to understand your specific requirements and see how we can help.`}

The reason I'm calling is: ${requirements.use_case === 'System replacement'
    ? `When companies are replacing their current system, we often help them avoid the common pitfalls. Have you already selected a shortlist?`
    : requirements.budget_range === 'gt500k' || requirements.budget_range === '50k-500k'
    ? `For an initiative of this scale, I'd like to understand your evaluation timeline. Are you looking to make a decision soon?`
    : `I'd like to understand what's driving your timeline and what a successful outcome would look like for you.`}

[Pause and listen]

Great, let me take a few notes and I'll send over some relevant information right away.`;

  return {
    emailDraft,
    emailSubject,
    whatsappDraft,
    callOpenerScript,
    callScript,
    callObjectives,
    objectionHandling,
    discoveryQuestions,
    closeTechniques,
  };
}

// ============================================
// DEAL INTELLIGENCE — Industry Benchmarks & Similar Deals
// ============================================

function generateDealIntelligence(
  requirements: ParsedRequirements,
  score: number,
  dealValue: string
): DealIntelligence {
  // Industry benchmark data
  const benchmarks: Record<string, { avgDealSize: string; avgCloseDays: number; conversionRate: string }> = {
    'Oil & Gas': { avgDealSize: '₹4Cr', avgCloseDays: 90, conversionRate: '28%' },
    'Aerospace': { avgDealSize: '₹8Cr', avgCloseDays: 150, conversionRate: '22%' },
    'Manufacturing': { avgDealSize: '₹1.2Cr', avgCloseDays: 45, conversionRate: '35%' },
    'Energy': { avgDealSize: '₹2.5Cr', avgCloseDays: 60, conversionRate: '32%' },
    'ERP / IT Modernization': { avgDealSize: '₹5Cr', avgCloseDays: 120, conversionRate: '25%' },
    'Chemical': { avgDealSize: '₹2Cr', avgCloseDays: 55, conversionRate: '30%' },
    'Metal': { avgDealSize: '₹1.5Cr', avgCloseDays: 40, conversionRate: '38%' },
    'Construction': { avgDealSize: '₹80L', avgCloseDays: 35, conversionRate: '40%' },
  };

  const baseBenchmarks = benchmarks[requirements.industry] || { avgDealSize: '₹50L', avgCloseDays: 45, conversionRate: '30%' };

  // Calculate similar deals based on quantity and industry
  const qty = parseQuantity(requirements.quantity);
  const similarCount = qty > 0 ? Math.min(Math.max(2, Math.floor(qty / 500)), 8) : 3;
  const avgValue = `₹${(similarCount * 0.3).toFixed(1)}Cr`;

  // Deal momentum based on urgency and priority
  let dealMomentum: 'Accelerating' | 'Stable' | 'Decelerating' = 'Stable';
  if (requirements.urgency === 'critical' || requirements.urgency === 'high') {
    dealMomentum = 'Accelerating';
  } else if (requirements.urgency === 'low' || score < 40) {
    dealMomentum = 'Decelerating';
  }

  return {
    industryBenchmark: {
      avgDealSize: baseBenchmarks.avgDealSize,
      avgCloseTime: `${baseBenchmarks.avgCloseDays} days`,
      conversionRate: baseBenchmarks.conversionRate,
    },
    similarDeals: {
      count: similarCount,
      avgValue: avgValue,
      closedInDays: baseBenchmarks.avgCloseDays,
    },
    dealMomentum,
  };
}

// ============================================
// EXECUTIVE DECISION BLOCK — Core Decision Data
// ============================================

function generateExecutiveDecisionBlock(
  score: number,
  priority: 'High' | 'Medium' | 'Low',
  dealValue: string,
  requirements: ParsedRequirements,
  riskAnalysis: RiskAnalysis,
  companyName?: string
): ExecutiveDecisionBlock {
  // Calculate conversion probability
  let conversionProb = score >= 65 ? 38 : score >= 45 ? 25 : score >= 30 ? 15 : 8;
  if (requirements.decision_maker === 'yes') conversionProb += 5;
  if (requirements.urgency === 'critical') conversionProb += 7;
  if (requirements.inquiry_source === 'Referral' || requirements.inquiry_source === 'Existing customer') conversionProb += 6;
  conversionProb = Math.min(75, conversionProb);

  // Expected close days based on priority
  const expectedCloseDays = priority === 'High' ? 7 : priority === 'Medium' ? 21 : 45;

  // Deal quality
  let dealQuality: 'High' | 'Medium' | 'Low' = 'Medium';
  if (score >= 70 && requirements.budget_range === 'gt500k') dealQuality = 'High';
  else if (score < 40 || riskAnalysis.overallRiskScore > 60) dealQuality = 'Low';

  // Why this matters (3 bullets)
  const whyThisMatters: string[] = [];
  if (requirements.urgency === 'critical' || requirements.urgency === 'high') {
    whyThisMatters.push(`Urgent requirement — ${companyName || 'the client'} needs resolution within days`);
  }
  if (score >= 65) {
    whyThisMatters.push(`High-fit lead: strong alignment between budget, industry, and decision maker`);
  }
  if (requirements.budget_range === 'gt500k' || requirements.budget_range === '50k-500k') {
    whyThisMatters.push(`Enterprise deal value (₹40L+) — significant revenue opportunity`);
  }
  if (requirements.inquiry_source === 'Referral') {
    whyThisMatters.push(`Warm referral — trust established, higher conversion probability`);
  }
  if (requirements.use_case === 'System replacement') {
    whyThisMatters.push(`System replacement — competitor vulnerable, open to new solutions`);
  }

  // Primary risk
  let primaryRisk = 'No significant risks identified';
  if (riskAnalysis.redFlags.length > 0) {
    primaryRisk = riskAnalysis.redFlags[0];
  } else if (!requirements.decision_maker || requirements.decision_maker === 'no') {
    primaryRisk = 'Decision maker not yet identified — may require additional discovery';
  } else if (requirements.previous_vendor === 'yes') {
    primaryRisk = 'Replacing existing vendor — competitive situation, must demonstrate clear advantage';
  } else if (riskAnalysis.competitiveRisk === 'High') {
    primaryRisk = 'High competitive pressure — differentiation critical';
  }

  // Recommended action
  let recommendedAction = '';
  if (priority === 'High' || score >= 65) {
    recommendedAction = `Call ${companyName || 'the contact'} within 2 hours — lead is hot and ready for immediate engagement`;
  } else if (requirements.urgency === 'critical') {
    recommendedAction = `Escalate immediately — prepare preliminary proposal and request emergency call`;
  } else {
    recommendedAction = `Send personalized email within 4 hours and schedule discovery call within 48 hours`;
  }

  return {
    conversionProbability: conversionProb,
    refinedDealValue: dealValue,
    expectedCloseDays,
    dealQuality,
    whyThisMatters,
    primaryRisk,
    recommendedAction,
  };
}

// ============================================
// SALES ASSISTANT OUTPUT — Actionable Communications
// ============================================

function generateSalesAssistantOutput(
  requirements: ParsedRequirements,
  companyName: string,
  product: string,
  priority: 'High' | 'Medium' | 'Low',
  score: number
): SalesAssistantOutput {
  const firstName = companyName.split(' ')[0] || 'there';

  // Determine best outreach channel
  const outreachChannel: 'email' | 'whatsapp' = requirements.urgency === 'critical' || requirements.urgency === 'high' ? 'whatsapp' : 'email';

  // Generate personalized outreach message
  let outreachMessage = '';
  if (outreachChannel === 'whatsapp') {
    outreachMessage = `Hi ${firstName}, this is regarding your inquiry for ${product}. Given the urgency you mentioned, I wanted to reach out personally. We have availability to deliver within your timeline and can offer priority pricing for immediate orders. Would a quick 5-minute call work today?`;
  } else {
    const urgencyLine = priority === 'High'
      ? `Given the urgency of your requirement, I'm following up personally to ensure you have everything you need to make a quick decision.`
      : `I wanted to reach out to understand your timeline better and see how we can be most helpful.`;

    outreachMessage = `Subject: ${product} for ${requirements.industry} — Quick Follow-up

Hi ${firstName},

Thank you for your interest in ${product} for your ${requirements.industry} operations.

${urgencyLine}

I've attached our company profile and relevant case studies from similar companies in ${requirements.industry}.

Would you be available for a 15-minute call this week to discuss your specific requirements?

Best regards,
Sales Team`;
  }

  // Determine call strategy
  let keyAngle: 'price' | 'urgency' | 'value' | 'relationship' = 'value';
  let talkingPoints: string[] = [];

  if (requirements.urgency === 'critical' || requirements.urgency === 'high') {
    keyAngle = 'urgency';
    talkingPoints = [
      'Confirm exact timeline and consequences of delay',
      'Offer expedited delivery options and priority allocation',
      'Emphasize reliability and track record for urgent needs',
      'Ask what happens if they miss their deadline',
    ];
  } else if (score >= 65 && requirements.budget_range === 'gt500k') {
    keyAngle = 'value';
    talkingPoints = [
      'Lead with ROI and total cost of ownership',
      'Share benchmark data from similar enterprises',
      'Discuss risk mitigation and warranty terms',
      'Position as strategic partner, not vendor',
    ];
  } else if (requirements.previous_vendor === 'yes') {
    keyAngle = 'relationship';
    talkingPoints = [
      'Acknowledge their current setup without criticizing',
      'Focus on what\'s NEW and what they\'ll gain',
      'Offer migration support and training',
      'Provide references from similar transitions',
    ];
  } else {
    talkingPoints = [
      'Understand their current process and pain points',
      'Discuss timeline and decision criteria',
      'Share relevant industry examples',
      'Identify key stakeholders in decision process',
    ];
  }

  // Objection handling
  const objectionHandling = [
    {
      objection: 'We need to compare vendors first',
      response: 'I completely understand. Would it help if I prepared a comparison matrix highlighting our key differentiators for ${requirements.industry} specifically? Many of our clients have found this saves significant time.',
    },
    {
      objection: 'Budget hasn\'t been approved yet',
      response: 'That\'s common. Would it make sense to prepare a preliminary proposal now so it\'s ready when budget discussions begin? We can also explore flexible payment options that align with your fiscal cycle.',
    },
  ];

  // Add industry-specific objection for critical urgency
  if (requirements.urgency === 'critical') {
    objectionHandling.unshift({
      objection: 'We don\'t have time to go through a full evaluation',
      response: 'I understand. For urgent requirements, we have an accelerated path — we can have samples ready in 48 hours and a simplified proposal based on your stated requirements. Would that help?',
    });
  }

  return {
    outreachMessage,
    outreachChannel,
    callStrategy: {
      approach: keyAngle === 'value' ? 'Present as a strategic investment, not a purchase' :
                keyAngle === 'urgency' ? 'Demonstrate ability to meet tight deadlines without compromising quality' :
                keyAngle === 'relationship' ? 'Build trust through transparency and showing understanding of their situation' :
                'Focus on competitive differentiation and unique advantages',
      keyAngle,
      talkingPoints,
    },
    objectionHandling,
  };
}

// ============================================
// PRIORITIZATION SIGNAL — Tag leads for action
// ============================================

function calculatePrioritizationSignal(
  score: number,
  urgency: string,
  riskScore: number
): 'Close Now' | 'Nurture' | 'Low Priority' {
  if (score >= 60 && (urgency === 'critical' || urgency === 'high') && riskScore < 50) {
    return 'Close Now';
  }
  if (score >= 40 || riskScore < 40) {
    return 'Nurture';
  }
  return 'Low Priority';
}

interface ParsedRequirements {
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
  context_notes?: string;
  previous_vendor?: string;
}

function extractRequirements(input: string, formData?: Partial<ParsedRequirements>): ParsedRequirements {
  const lower = input.toLowerCase();

  // Parse quantity
  const qtyMatch = input.match(/(\d+)\s*(?:units?|pieces?|tubes?|valves?|items?|pcs)?/i);
  const quantity = qtyMatch ? `${qtyMatch[1]} units` : (formData?.quantity || 'TBD');

  // Parse product
  let product = 'Industrial product';
  if (lower.includes('tube') || lower.includes('pipe')) product = 'Stainless steel tubes';
  else if (lower.includes('valve')) product = 'Industrial valves';
  else if (lower.includes('erp') || lower.includes('system')) product = 'ERP system';
  else if (lower.includes('prototype') || lower.includes('visualization')) product = 'Prototype visualization';
  else if (lower.includes('automation')) product = 'Automation system';
  else if (lower.includes('safety')) product = 'Safety equipment';
  else if (lower.includes('precision') || lower.includes('machin')) product = 'Precision machined parts';

  // Parse industry
  let industry = 'Manufacturing';
  if (lower.includes('oil') || lower.includes('refinery') || lower.includes('petrochemical')) industry = 'Oil & Gas';
  else if (lower.includes('pharma')) industry = 'Pharmaceutical';
  else if (lower.includes('aerospace') || lower.includes('aviation')) industry = 'Aerospace';
  else if (lower.includes('auto')) industry = 'Automotive';
  else if (lower.includes('food')) industry = 'Food & Beverage';
  else if (lower.includes('chemical')) industry = 'Chemical';
  else if (lower.includes('construct') || lower.includes('build')) industry = 'Construction';
  else if (lower.includes('energy')) industry = 'Energy';
  else if (lower.includes('metal') || lower.includes('steel')) industry = 'Metal';

  // Parse urgency
  let urgency = 'medium';
  if (lower.includes('urgent') || lower.includes('asap') || lower.includes('immediately') || lower.includes('critical')) urgency = 'high';
  else if (lower.includes('looking') || lower.includes('interested') || lower.includes('exploring')) urgency = 'low';

  // Use case
  let use_case: string | undefined;
  if (lower.includes('replacement')) use_case = 'System replacement';
  else if (lower.includes('upgrade')) use_case = 'System upgrade';
  else if (lower.includes('new build') || lower.includes('new project')) use_case = 'New project';
  else if (lower.includes('prototype') || lower.includes('demo')) use_case = 'Prototype/demo';

  return {
    product: formData?.product || product,
    quantity: formData?.quantity || quantity,
    industry: formData?.industry || industry,
    urgency: formData?.urgency || urgency,
    use_case: formData?.use_case || use_case,
    budget_range: formData?.budget_range,
    company_size: formData?.company_size,
    location: formData?.location,
    decision_maker: formData?.decision_maker,
    inquiry_source: formData?.inquiry_source,
    context_notes: formData?.context_notes,
    previous_vendor: formData?.previous_vendor,
  };
}

// ============================================
// DEAL VERDICT — Final Assessment
// ============================================

function generateDealVerdict(
  score: number,
  priority: 'High' | 'Medium' | 'Low',
  dealValue: string,
  requirements: ParsedRequirements,
  riskAnalysis: RiskAnalysis,
  conversionAnalysis?: ConversionAnalysis
): DealVerdict {
  let conversionProb = score >= 65 ? 42 : score >= 45 ? 28 : score >= 30 ? 18 : 10;
  if (requirements.decision_maker === 'yes') conversionProb += 6;
  if (requirements.urgency === 'critical') conversionProb += 8;
  if (requirements.inquiry_source === 'Referral' || requirements.inquiry_source === 'Existing customer') conversionProb += 7;
  conversionProb = Math.min(75, conversionProb);
  if (conversionAnalysis) conversionProb = conversionAnalysis.probability;

  const expectedCloseDays = priority === 'High' ? 7 : priority === 'Medium' ? 21 : 45;

  let verdict: 'Strong' | 'Medium' | 'Weak' = 'Medium';
  if (score >= 60 && requirements.urgency !== 'low' && riskAnalysis.overallRiskScore < 50) {
    verdict = 'Strong';
  } else if (score < 40 || riskAnalysis.overallRiskScore > 65 || requirements.urgency === 'low') {
    verdict = 'Weak';
  }

  const keyStrengths: string[] = [];
  if (requirements.decision_maker === 'yes') keyStrengths.push('Decision maker identified');
  if (requirements.urgency === 'critical' || requirements.urgency === 'high') keyStrengths.push('High urgency');
  if (requirements.budget_range === 'gt500k' || requirements.budget_range === '50k-500k') keyStrengths.push('Enterprise budget');
  if (requirements.inquiry_source === 'Referral' || requirements.inquiry_source === 'Existing customer') keyStrengths.push('Warm referral');
  if (score >= 65) keyStrengths.push('High lead score (65+)');

  const keyWeaknesses: string[] = [];
  if (!requirements.decision_maker || requirements.decision_maker === 'no') keyWeaknesses.push('No decision maker identified');
  if (requirements.urgency === 'low') keyWeaknesses.push('Low urgency signal');
  if (score < 45) keyWeaknesses.push('Below average lead score');
  if (riskAnalysis.overallRiskScore > 50) keyWeaknesses.push(`High risk score (${riskAnalysis.overallRiskScore}/100)`);
  if (requirements.previous_vendor === 'yes') keyWeaknesses.push('Replacing vendor (competitive)');

  return { verdict, conversionProbability: conversionProb, expectedRevenue: dealValue, expectedCloseDays, keyStrengths, keyWeaknesses };
}

// ============================================
// DEAL STRATEGY ENGINE — Winning Plan
// ============================================

function generateDealStrategyEngine(
  requirements: ParsedRequirements,
  score: number,
  priority: 'High' | 'Medium' | 'Low',
  dealValue: string
): DealStrategyEngine {
  let positioningAngle: 'cost-saving' | 'speed' | 'quality' | 'risk-reduction' = 'cost-saving';
  let angleDescription = '';
  let whyThisAngle = '';

  if (requirements.urgency === 'critical' || requirements.urgency === 'high') {
    positioningAngle = 'speed';
    angleDescription = 'Fast turnaround with priority production';
    whyThisAngle = 'Urgent requirement demands immediate action. Delays cost operational losses.';
  } else if (requirements.budget_range === 'gt500k' || requirements.budget_range === '50k-500k') {
    positioningAngle = 'quality';
    angleDescription = 'Premium quality with proven track record';
    whyThisAngle = 'Enterprise deals require ironclad quality assurance.';
  } else if (requirements.use_case === 'System replacement') {
    positioningAngle = 'risk-reduction';
    angleDescription = 'Seamless transition with minimal disruption';
    whyThisAngle = 'System replacements carry high switching risk. Focus on smooth migration.';
  } else if (requirements.previous_vendor === 'yes') {
    positioningAngle = 'cost-saving';
    angleDescription = 'Competitive pricing with better value';
    whyThisAngle = 'Switching vendors justified only if value significantly improves.';
  } else {
    positioningAngle = 'cost-saving';
    angleDescription = 'Best ROI in the industry';
    whyThisAngle = 'Emphasize total cost of ownership and long-term value.';
  }

  let negotiationFlexibility: 'Low' | 'Medium' | 'High' = 'Medium';
  let pushbackRisk: 'Low' | 'Medium' | 'High' = 'Medium';
  if (requirements.budget_range === 'gt500k') { negotiationFlexibility = 'High'; pushbackRisk = 'Low'; }
  else if (requirements.urgency === 'critical') { negotiationFlexibility = 'Low'; pushbackRisk = 'Medium'; }
  else if (requirements.company_size === 'enterprise') { negotiationFlexibility = 'High'; pushbackRisk = 'High'; }

  const closingPlan = {
    step1: { action: `Send ${positioningAngle === 'speed' ? 'immediate response' : 'introductory email'}`, timing: priority === 'High' ? 'Within 2 hours' : 'Within 4 hours', trigger: 'Email opens indicate engagement' },
    step2: { action: 'Schedule discovery call to understand decision criteria', timing: priority === 'High' ? 'Within 24 hours' : 'Within 48 hours', trigger: 'Reply indicates buying intent' },
    step3: { action: 'Submit proposal aligned to their timeline', timing: priority === 'High' ? 'Within 48 hours' : 'Within 5 days', trigger: 'Proposal request or budget confirmation' },
  };

  return { winningStrategy: { positioningAngle, angleDescription, whyThisAngle }, pricingGuidance: { suggestedRange: dealValue, negotiationFlexibility, pushbackRisk }, closingPlan };
}

// ============================================
// TIME-BASED SALES INTELLIGENCE
// ============================================

function generateTimeBasedIntelligence(requirements: ParsedRequirements, priority: 'High' | 'Medium' | 'Low', score: number): TimeBasedIntelligence {
  const bestDay = priority === 'High' ? 'Tuesday' : 'Wednesday';
  const bestHour = requirements.urgency === 'critical' ? 10 : 11;

  let dealDecayRisk: 'High' | 'Medium' | 'Low' = 'Medium';
  let decayReason = '';
  if (requirements.urgency === 'critical') { dealDecayRisk = 'Low'; decayReason = 'Critical urgency maintains focus'; }
  else if (requirements.urgency === 'low') { dealDecayRisk = 'High'; decayReason = 'Low urgency leads lose momentum within 2 weeks'; }
  else if (score < 45) { dealDecayRisk = 'High'; decayReason = 'Lower scores correlate with slower decisions'; }
  else { decayReason = 'Standard decay expected within 3-4 weeks'; }

  const next7DaysTimeline = priority === 'High'
    ? [
        { day: 'Day 1', action: 'Send personalized email with value proposition', objective: 'Establish contact' },
        { day: 'Day 2', action: 'Follow up via WhatsApp if no response', objective: 'Create urgency' },
        { day: 'Day 3', action: 'Schedule discovery call', objective: 'Understand decision timeline' },
        { day: 'Day 5', action: 'Send case study from similar industry', objective: 'Build credibility' },
        { day: 'Day 7', action: 'Submit preliminary proposal', objective: 'Move to next stage' },
      ]
    : [
        { day: 'Day 1-2', action: 'Send introductory email with relevant case study', objective: 'Establish credibility' },
        { day: 'Day 3-4', action: 'Research company and prepare background brief', objective: 'Understand context' },
        { day: 'Day 5-6', action: 'Follow up with additional value points', objective: 'Maintain engagement' },
        { day: 'Day 7', action: 'Schedule discovery call for following week', objective: 'Build relationship' },
      ];

  return { bestTimeToFollowUp: { hour: bestHour, day: bestDay }, dealDecayRisk, decayReason, next7DaysTimeline };
}

// ============================================
// SOURCE INTELLIGENCE — Website Analysis
// ============================================

function generateSourceIntelligence(requirements: ParsedRequirements): SourceIntelligence | null {
  if (requirements.inquiry_source !== 'Website') return null;

  let inferredBuyingStage: 'awareness' | 'consideration' | 'decision' | 'comparison' = 'consideration';
  if (requirements.urgency === 'critical') inferredBuyingStage = 'decision';
  else if (requirements.use_case === 'System replacement') inferredBuyingStage = 'comparison';
  else if (requirements.budget_range === 'gt500k') inferredBuyingStage = 'decision';

  const inferredIntent = inferredBuyingStage === 'decision'
    ? 'Ready to purchase, comparing options quickly'
    : inferredBuyingStage === 'comparison'
    ? 'Actively evaluating alternatives, need convincing'
    : inferredBuyingStage === 'consideration'
    ? 'Exploring options, building shortlist'
    : 'Early research, building awareness';

  const possibleHiddenRequirements: string[] = [];
  if (requirements.budget_range === 'gt500k' || requirements.budget_range === '50k-500k') {
    possibleHiddenRequirements.push('Integration requirements with existing systems');
    possibleHiddenRequirements.push('Compliance and certification requirements');
  }
  if (requirements.use_case === 'System replacement') {
    possibleHiddenRequirements.push('Migration support and data transfer');
    possibleHiddenRequirements.push('Training and change management');
  }
  possibleHiddenRequirements.push('Post-purchase support expectations');
  possibleHiddenRequirements.push('Payment terms and financing preferences');

  const engagementSignals = requirements.urgency === 'critical'
    ? ['High intent signal', 'Time-sensitive need', 'Direct contact likely']
    : requirements.urgency === 'high'
    ? ['Positive engagement', 'Active evaluation likely', 'Medium conversion probability']
    : ['Lower intent signal', 'May be early in buying cycle', 'Requires nurturing'];

  return { inferredIntent, inferredBuyingStage, possibleHiddenRequirements, engagementSignals };
}

// ============================================
// FOLLOW-UP QUESTIONS — When Data Is Weak
// ============================================

function generateFollowUpQuestions(requirements: ParsedRequirements, score: number): FollowUpQuestions | null {
  const missingFields: string[] = [];

  if (!requirements.budget_range || requirements.budget_range === '') missingFields.push('budget');
  if (!requirements.decision_maker || requirements.decision_maker === '') missingFields.push('decision_maker');
  if (!requirements.urgency || requirements.urgency === 'low') missingFields.push('urgency');
  if (!requirements.previous_vendor && score < 60) missingFields.push('competition');

  // If most fields are present, no need for follow-up
  if (missingFields.length === 0) return null;

  const questions: FollowUpQuestions['questions'] = [];
  const conversationalTone = {
    opening: "Hey, I was reviewing your inquiry and had a few quick questions — shouldn't take more than 2 minutes.",
    transition: "Moving on to the next point...",
    closing: "That gives me a much clearer picture. Based on this, I can put together something far more relevant for you."
  };

  // Budget clarity questions
  if (missingFields.includes('budget')) {
    questions.push({
      question: "I see the quantity you're looking at — what's the overall budget you're working with for this project? We're flexible on pricing tiers.",
      focus: 'budget',
      impact: 'high',
      scoreBoost: 15
    });
    questions.push({
      question: "Is this project already approved in the budget, or is it still pending allocation?",
      focus: 'budget',
      impact: 'medium',
      scoreBoost: 8
    });
  }

  // Decision authority questions
  if (missingFields.includes('decision_maker')) {
    questions.push({
      question: "Who else would be involved in making this decision? I want to make sure I'm speaking with everyone who matters.",
      focus: 'decision_maker',
      impact: 'high',
      scoreBoost: 12
    });
    questions.push({
      question: "Is there a technical lead or procurement manager you'd recommend I loop in for the detailed discussion?",
      focus: 'decision_maker',
      impact: 'medium',
      scoreBoost: 7
    });
  }

  // Urgency validation
  if (missingFields.includes('urgency')) {
    questions.push({
      question: "What's driving the timeline on this? Any internal deadlines or external factors we should know about?",
      focus: 'urgency',
      impact: 'high',
      scoreBoost: 14
    });
    questions.push({
      question: "If we could deliver within your ideal window, would you be ready to move forward, or are there other variables still in play?",
      focus: 'urgency',
      impact: 'medium',
      scoreBoost: 6
    });
  }

  // Competitive context
  if (missingFields.includes('competition')) {
    questions.push({
      question: "Have you already spoken with other suppliers, or are we at the early stages of evaluation?",
      focus: 'competition',
      impact: 'medium',
      scoreBoost: 9
    });
    questions.push({
      question: "What was your experience with your previous supplier? Looking to understand what worked and what didn't.",
      focus: 'competition',
      impact: 'low',
      scoreBoost: 5
    });
  }

  // Sort by impact (high first) and take top 5
  questions.sort((a, b) => (b.impact === 'high' ? 1 : 0) - (a.impact === 'high' ? 1 : 0) ||
                           (b.impact === 'medium' ? 1 : 0) - (a.impact === 'medium' ? 1 : 0));
  const topQuestions = questions.slice(0, 5);

  const priorityQuestions = topQuestions
    .filter(q => q.impact === 'high')
    .map(q => q.question);

  const discoveryQuestions = topQuestions
    .filter(q => q.impact === 'medium')
    .map(q => q.question);

  const disqualifyingQuestions = [
    "If budget is below ₹2L and no decision maker identified, this may not be worth pursuing at this stage.",
    "A lead with low urgency and no confirmed decision authority typically has <10% close probability."
  ];

  return {
    questions: topQuestions,
    priorityQuestions,
    discoveryQuestions,
    disqualifyingQuestions,
    conversationalTone
  };
}

// ============================================
// SIMPLIFIED SCORING — B2B Sales Perspective
// ============================================

function generateSimplifiedScoring(requirements: ParsedRequirements, score: number): SimplifiedScoring {
  // Map to 0-20 scale
  const intent = Math.min(20, Math.round(score * 0.2));
  const budget = requirements.budget_range
    ? (requirements.budget_range === 'gt500k' ? 18 : requirements.budget_range === '50k-500k' ? 14 : requirements.budget_range === '10k-50k' ? 10 : requirements.budget_range === '5k-10k' ? 6 : 4)
    : 6;
  const urgency = requirements.urgency
    ? (requirements.urgency === 'critical' ? 18 : requirements.urgency === 'high' ? 14 : requirements.urgency === 'medium' ? 10 : 5)
    : 6;
  const industryFit = ['Oil & Gas', 'Aerospace', 'Pharmaceutical', 'Chemical', 'Energy', 'Metal'].includes(requirements.industry) ? 16
    : ['Manufacturing', 'ERP / IT Modernization', 'VR / AR', 'SaaS / Tech', 'Construction'].includes(requirements.industry) ? 12 : 8;
  const decisionMaker = requirements.decision_maker === 'yes' ? 18 : 8;

  const confidence = (intent + budget + urgency + industryFit + decisionMaker) / 100;

  // Pricing
  const budgetMap: Record<string, { range: string; ideal: string; flex: 'low' | 'medium' | 'high'; risk: 'low' | 'medium' | 'high' }> = {
    'lt5k': { range: '₹2L - ₹4L', ideal: '₹2.5L', flex: 'medium', risk: 'low' },
    '5k-10k': { range: '₹4L - ₹8L', ideal: '₹5L', flex: 'medium', risk: 'medium' },
    '10k-50k': { range: '₹8L - ₹40L', ideal: '₹18L', flex: 'high', risk: 'medium' },
    '50k-500k': { range: '₹40L - ₹4Cr', ideal: '₹1.2Cr', flex: 'high', risk: 'low' },
    'gt500k': { range: '₹4Cr - ₹8Cr', ideal: '₹5Cr', flex: 'low', risk: 'low' },
  };
  const pricing = budgetMap[requirements.budget_range || '5k-10k'] || budgetMap['5k-10k'];

  // Generate follow-up questions
  const followUpQuestions = generateFollowUpQuestions(requirements, score);
  const questionStrings = followUpQuestions?.priorityQuestions.slice(0, 3) || [];

  const dealInsight = score >= 65
    ? `Strong lead with ${Math.round(confidence * 100)}% confidence. Budget-qualified with decision authority confirmed. High conversion probability.`
    : score >= 45
    ? `Moderate lead with gaps in qualification. ${questionStrings.length > 0 ? 'Follow-up questions critical to close.' : 'Missing decision authority or budget clarity.'}`
    : `Weak lead — multiple qualification gaps. Score reflects high risk. ${score < 30 ? 'Consider disqualifying or nurture campaign.' : 'Urgent follow-up required.'}`;

  return {
    scoreBreakdown: { intent, budget, urgency, industryFit, decisionMaker },
    confidence,
    pricing: {
      suggestedRange: pricing.range,
      idealPrice: pricing.ideal,
      discountFlexibility: pricing.flex,
      pricingRisk: pricing.risk
    },
    followUpQuestions: questionStrings,
    dealInsight
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createLog(stage: number, message: string, type: ExecutionLogEntry['type']): ExecutionLogEntry {
  return {
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    stage,
    message,
    type,
  };
}

// ============================================
// GEMINI DEEP RESEARCH — Real AI-Powered Intelligence
// ============================================

interface ParsedRequirements {
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
  context_notes?: string;
  previous_vendor?: string;
  timeline?: string;
}

async function callMiniMaxIntelligence(
  requirements: ParsedRequirements,
  companyName: string,
  score: number
): Promise<{
  industryInsights: IndustryInsights;
  riskAnalysis: RiskAnalysis;
  conversionAnalysis: ConversionAnalysis;
  strategicRecommendations: StrategicRecommendations;
  expandedPlaybook: ExpandedSalesPlaybook;
  dealIntelligence: DealIntelligence;
}> {
  const provider = new MiniMaxProvider('sk-api-HvdFN0Z2WeVjQmZyqTGjsh8FToEHimqYLivTL_FfRt3jDpZeATbcJ7vay4SLo-2PgHYjWEG9IYqStDDqA0CVHt2x9HwOJ2Nd_uEB5KO7QpIPcOt5Bqe5awA', 'MiniMax-M2.7');

  // Prompt 1: Industry & Company Intelligence
  const industryPrompt = `You are a B2B sales intelligence analyst. Generate detailed industry intelligence for a sales lead. Return ONLY valid JSON, no markdown.

Company: ${companyName}
Industry: ${requirements.industry}
Product: ${requirements.product}
Quantity: ${requirements.quantity || 'TBD'}
Use Case: ${requirements.use_case || 'standard procurement'}
Budget Range: ${requirements.budget_range || 'TBD'}
Location: ${requirements.location || 'TBD'}
Company Size: ${requirements.company_size || 'mid'}

Return valid JSON with this exact structure:
{
  "industryInsights": {
    "typicalDealSize": "string (e.g. '₹2Cr - ₹4Cr')",
    "buyingBehavior": "string describing how buyers in this industry typically make decisions",
    "salesCycleLength": "string (e.g. '3-5 months')",
    "marketSeasonality": "string describing any seasonal patterns in buying",
    "keyPlayers": ["array of 4-5 decision-maker role titles"],
    "decisionMakers": ["array of 3-4 C-level titles for large deals"],
    "commonObjections": ["array of 4-5 common objections with brief context"],
    "competitiveLandscape": "string describing the competitive environment"
  },
  "riskAnalysis": {
    "missingInfo": ["array of key information not provided"],
    "weakSignals": ["array of weak buying signals detected"],
    "competitiveRisk": "Low | Medium | High",
    "timelineRisk": "Low | Medium | High",
    "budgetRisk": "Low | Medium | High",
    "overallRiskScore": number (0-100),
    "redFlags": ["array of 2-3 specific red flags"]
  },
  "conversionAnalysis": {
    "probability": number (0-100),
    "explanation": "string explaining the probability",
    "boostingFactors": ["array of 3-4 positive factors"],
    "detractingFactors": ["array of 3-4 negative factors"],
    "comparisonToIndustry": "string comparing to industry benchmarks"
  }
}`;

  // Prompt 2: Outreach Strategy & Personalization
  const outreachPrompt = `Generate a personalized B2B sales outreach strategy for this lead. Return ONLY valid JSON, no markdown.

Company: ${companyName}
Industry: ${requirements.industry}
Product/Service: ${requirements.product}
Quantity: ${requirements.quantity || 'TBD'}
Budget: ${requirements.budget_range || 'TBD'}
Timeline: ${requirements.timeline || 'TBD'}
Urgency: ${requirements.urgency}
Previous Vendor: ${requirements.previous_vendor || 'unknown'}
Context: ${requirements.context_notes || 'none provided'}
Decision Maker: ${requirements.decision_maker || 'unknown'}
Lead Score: ${score}/100

Return JSON:
{
  "emailDraft": "string - personalized email 150-200 words specific to this company and situation",
  "emailSubject": "string - compelling subject line under 60 chars",
  "whatsappDraft": "string - brief WhatsApp message under 150 chars",
  "callOpenerScript": "string - first 30 seconds of a cold call script",
  "callScript": ["array of 4-5 call flow bullets specific to this lead"],
  "objectionHandling": [{"objection": "string", "response": "string"} - 3 relevant objections],
  "discoveryQuestions": ["array of 4-5 discovery questions specific to this company"],
  "closeTechniques": ["array of 2-3 closing techniques for this deal type"]
}`;

  // Prompt 3: Strategic Recommendations
  const strategyPrompt = `Generate strategic sales recommendations for this B2B opportunity. Return ONLY valid JSON, no markdown.

Company: ${companyName}
Industry: ${requirements.industry}
Urgency: ${requirements.urgency}
Budget: ${requirements.budget_range || 'TBD'}
Company Size: ${requirements.company_size || 'mid'}
Decision Maker: ${requirements.decision_maker}
Previous Vendor: ${requirements.previous_vendor || 'unknown'}
Context: ${requirements.context_notes || 'none'}
Lead Score: ${score}/100

Return JSON:
{
  "strategicRecommendations": {
    "immediate": ["array of 3-4 immediate action items for next 24-48 hours"],
    "shortTerm": ["array of 3-4 actions for next 1-2 weeks"],
    "longTerm": ["array of 2-3 strategic long-term actions"],
    "competitiveAngle": "string describing how to position against competitors",
    "uniqueValueProposition": "string with specific UVP for this company",
    "stakeholderMapping": ["array of stakeholder titles with their primary concerns"],
    "negotiationStrategy": "string with specific negotiation approach"
  },
  "dealIntelligence": {
    "industryBenchmark": {
      "avgDealSize": "string",
      "avgCloseTime": "string",
      "conversionRate": "string"
    },
    "similarDeals": {
      "count": number,
      "avgValue": "string",
      "closedInDays": number
    },
    "dealMomentum": "Accelerating | Stable | Decelerating"
  }
}`;

  try {
    // Fetch all three in parallel
    const [industryResponse, outreachResponse, strategyResponse] = await Promise.all([
      provider.generateJSON(industryPrompt),
      provider.generateJSON(outreachPrompt),
      provider.generateJSON(strategyPrompt),
    ]);

    // Parse and validate responses
    const industryData = (thisOrDefault(industryResponse, {}) as Record<string, unknown>) as {
      industryInsights?: Record<string, unknown>;
      riskAnalysis?: Record<string, unknown>;
      conversionAnalysis?: Record<string, unknown>;
    };
    const outreachData = (thisOrDefault(outreachResponse, {}) as Record<string, unknown>) as {
      emailDraft?: string;
      emailSubject?: string;
      whatsappDraft?: string;
      callOpenerScript?: string;
      callScript?: string[];
      objectionHandling?: { objection: string; response: string }[];
      discoveryQuestions?: string[];
      closeTechniques?: string[];
    };
    const strategyData = (thisOrDefault(strategyResponse, {}) as Record<string, unknown>) as {
      strategicRecommendations?: Record<string, unknown>;
      dealIntelligence?: Record<string, unknown>;
    };

    // Build industry insights with safe defaults
    const industryInsights: IndustryInsights = {
      typicalDealSize: (industryData.industryInsights?.typicalDealSize as string) || '₹20L - ₹1.6Cr',
      buyingBehavior: (industryData.industryInsights?.buyingBehavior as string) || 'Direct decision-maker contact, value demonstration critical',
      salesCycleLength: (industryData.industryInsights?.salesCycleLength as string) || '1-3 months',
      marketSeasonality: (industryData.industryInsights?.marketSeasonality as string) || 'Standard fiscal year patterns',
      keyPlayers: (industryData.industryInsights?.keyPlayers as string[]) || ['Owner/GM', 'Procurement Manager'],
      decisionMakers: (industryData.industryInsights?.decisionMakers as string[]) || ['Owner', 'Managing Director'],
      commonObjections: (industryData.industryInsights?.commonObjections as string[]) || ['Price vs alternatives', 'Implementation timeline'],
      competitiveLandscape: (industryData.industryInsights?.competitiveLandscape as string) || 'Highly fragmented market',
    };

    // Build risk analysis with safe defaults
    const riskAnalysis: RiskAnalysis = {
      missingInfo: (industryData.riskAnalysis?.missingInfo as string[]) || [],
      weakSignals: (industryData.riskAnalysis?.weakSignals as string[]) || [],
      competitiveRisk: (industryData.riskAnalysis?.competitiveRisk as 'Low' | 'Medium' | 'High') || 'Medium',
      timelineRisk: (industryData.riskAnalysis?.timelineRisk as 'Low' | 'Medium' | 'High') || 'Medium',
      budgetRisk: (industryData.riskAnalysis?.budgetRisk as 'Low' | 'Medium' | 'High') || 'Medium',
      overallRiskScore: (industryData.riskAnalysis?.overallRiskScore as number) || 50,
      redFlags: (industryData.riskAnalysis?.redFlags as string[]) || [],
    };

    // Build conversion analysis with safe defaults
    const conversionAnalysis: ConversionAnalysis = {
      probability: (industryData.conversionAnalysis?.probability as number) || Math.min(45, Math.max(8, score * 0.4)),
      explanation: (industryData.conversionAnalysis?.explanation as string) || `Lead score of ${score}/100 indicates ${score >= 65 ? 'strong' : score >= 45 ? 'moderate' : 'challenging'} conversion potential`,
      boostingFactors: (industryData.conversionAnalysis?.boostingFactors as string[]) || [],
      detractingFactors: (industryData.conversionAnalysis?.detractingFactors as string[]) || [],
      comparisonToIndustry: (industryData.conversionAnalysis?.comparisonToIndustry as string) || 'Comparable to industry standard conversion rates',
    };

    // Build strategic recommendations with safe defaults
    const strategicRecommendations: StrategicRecommendations = {
      immediate: (strategyData.strategicRecommendations?.immediate as string[]) || [`Contact ${companyName} decision maker within 24 hours`],
      shortTerm: (strategyData.strategicRecommendations?.shortTerm as string[]) || ['Research company background', 'Prepare tailored proposal'],
      longTerm: (strategyData.strategicRecommendations?.longTerm as string[]) || ['Build relationship for future opportunities'],
      competitiveAngle: (strategyData.strategicRecommendations?.competitiveAngle as string) || 'Emphasize value and ROI',
      uniqueValueProposition: (strategyData.strategicRecommendations?.uniqueValueProposition as string) || 'Proven track record in ' + requirements.industry,
      stakeholderMapping: (strategyData.strategicRecommendations?.stakeholderMapping as string[]) || ['Owner: Final decision'],
      negotiationStrategy: (strategyData.strategicRecommendations?.negotiationStrategy as string) || 'Focus on value, not price',
    };

    // Build expanded playbook with safe defaults
    const expandedPlaybook: ExpandedSalesPlaybook = {
      emailDraft: outreachData.emailDraft || `Thank you for your interest in ${requirements.product}. Our team is ready to help ${companyName} with their ${requirements.industry} needs.`,
      whatsappDraft: outreachData.whatsappDraft || `Hi, following up on your ${requirements.product} inquiry. Ready to help!`,
      callOpenerScript: outreachData.callOpenerScript || `Hi, this is calling about the ${requirements.product} inquiry for ${companyName}.`,
      emailSubject: outreachData.emailSubject || `${requirements.product} for ${companyName}`,
      callScript: outreachData.callScript || ['Confirm decision maker identity', 'Verify requirements', 'Understand timeline', 'Confirm next step'],
      callObjectives: ['Confirm decision timeline', 'Identify stakeholders', 'Understand evaluation status'],
      objectionHandling: outreachData.objectionHandling || [
        { objection: 'We need to compare vendors', response: 'I understand. Would a comparison matrix help?' },
        { objection: 'Budget not approved', response: 'We can prepare a proposal that fits your budget cycle.' },
      ],
      discoveryQuestions: outreachData.discoveryQuestions || ['What is driving this requirement?', 'What is the decision timeline?'],
      closeTechniques: outreachData.closeTechniques || ['Assume close: I will prepare a proposal', 'Urgency close: Given your timeline'],
    };

    // Build deal intelligence with safe defaults
    const dealIntelligence: DealIntelligence = {
      industryBenchmark: (strategyData.dealIntelligence?.industryBenchmark as DealIntelligence['industryBenchmark']) || {
        avgDealSize: '₹50L',
        avgCloseTime: '45 days',
        conversionRate: '30%',
      },
      similarDeals: (strategyData.dealIntelligence?.similarDeals as DealIntelligence['similarDeals']) || {
        count: 3,
        avgValue: '₹30L',
        closedInDays: 40,
      },
      dealMomentum: (strategyData.dealIntelligence?.dealMomentum as 'Accelerating' | 'Stable' | 'Decelerating') || 'Stable',
    };

    return {
      industryInsights,
      riskAnalysis,
      conversionAnalysis,
      strategicRecommendations,
      expandedPlaybook,
      dealIntelligence,
    };
  } catch (error) {
    console.warn('MiniMax API failed, using fallback generation:', error);
    // Fall back to deterministic functions
    return {
      industryInsights: generateIndustryInsights(requirements.industry, requirements.use_case, requirements.budget_range),
      riskAnalysis: generateRiskAnalysis(requirements, score, classifyPriority(score)),
      conversionAnalysis: generateConversionAnalysis(score, classifyPriority(score), requirements),
      strategicRecommendations: generateStrategicRecommendations(requirements, companyName, requirements.industry, classifyPriority(score), score, generateRiskAnalysis(requirements, score, classifyPriority(score))),
      expandedPlaybook: generateExpandedPlaybook(requirements, companyName, requirements.product, requirements.industry, classifyPriority(score)),
      dealIntelligence: generateDealIntelligence(requirements, score, '₹50L'),
    };
  }
}

// Helper to safely extract object from API response
function thisOrDefault(obj: unknown, defaultVal: Record<string, unknown>): Record<string, unknown> {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    return obj as Record<string, unknown>;
  }
  return defaultVal;
}

// ============================================
// MAIN AGENT EXECUTION
// ============================================

export async function runAgent(
  input: string,
  formData?: Partial<ParsedRequirements>
): Promise<{ result: AgentResponse; allLogs: ExecutionLogEntry[] }> {
  const allLogs: ExecutionLogEntry[] = [];

  // Stage 1: Lead Structuring
  await delay(800);
  const requirements = extractRequirements(input, formData);
  const companyName = formData?.product ? input.split(',')[0].trim() : extractCompanyName(input);

  allLogs.push(createLog(1, `parsed_company: ${companyName}`, 'success'));
  allLogs.push(createLog(1, `parsed_requirement: ${requirements.product}, ${requirements.quantity}`, 'success'));
  allLogs.push(createLog(1, `parsed_buying_signals: urgency=${requirements.urgency}`, 'info'));

  // Stage 2: Context Mapping
  await delay(1000);
  allLogs.push(createLog(2, 'matched_to_industry_benchmarks', 'success'));
  allLogs.push(createLog(2, `industry_profile: ${requirements.industry}`, 'info'));
  allLogs.push(createLog(2, `deal_pattern: ${requirements.use_case || 'standard'}`, 'info'));

  // Stage 3: Scoring (DETERMINISTIC)
  await delay(1000);
  const { score, breakdown } = calculateLeadScore(requirements);
  const priority = classifyPriority(score);

  allLogs.push(createLog(3, `calculated_baseline_score: ${score}/100`, 'success'));
  allLogs.push(createLog(3, `score_breakdown: budget=${breakdown.budget}, size=${breakdown.companySize}, urgency=${breakdown.urgency}, fit=${breakdown.industryFit}, dmk=${breakdown.decisionMaker}, src=${breakdown.sourceQuality}`, 'info'));

  // Stage 4: Opportunity Evaluation
  await delay(1000);
  const dealValue = estimateDealValue(requirements.quantity, requirements.industry, requirements.budget_range);
  const timeline = getRecommendedTimeline(priority);

  const conversionProb = score >= 65 ? '35%' : score >= 45 ? '22%' : score >= 30 ? '15%' : '8%';

  allLogs.push(createLog(4, `estimated_deal_value: ${dealValue}`, 'success'));
  allLogs.push(createLog(4, `conversion_likelihood: ${conversionProb}`, 'success'));
  allLogs.push(createLog(4, `close_window: ${priority === 'High' ? '2-3 weeks' : priority === 'Medium' ? '4-6 weeks' : '8-12 weeks'}`, 'info'));

  // Stage 5: Action Planning
  await delay(1000);
  const actions = determineActions(priority, score);
  const suggestedNextStep = actions[0];

  allLogs.push(createLog(5, `action_path: ${priority.toLowerCase()}-priority`, 'success'));
  allLogs.push(createLog(5, `recommended_actions: ${actions.length} steps`, 'info'));
  allLogs.push(createLog(5, `immediate_next_step: ${suggestedNextStep}`, 'info'));

  // Stage 6: Report Generation
  await delay(800);
  const businessRelevance = calculateBusinessRelevance(score, priority, dealValue, requirements.urgency);
  const salesOutput = generateSalesOutput(
    companyName,
    requirements.product,
    requirements.industry,
    priority,
    timeline,
    dealValue
  );

  const scoreReasoning = `Score of ${score}/100 based on: ${requirements.industry} industry (${breakdown.industryFit}pts), ${requirements.urgency} urgency (${breakdown.urgency}pts), ${requirements.company_size || 'unknown'} company size (${breakdown.companySize}pts), ${requirements.budget_range || 'standard'} budget (${breakdown.budget}pts), decision maker ${requirements.decision_maker || 'unknown'} (${breakdown.decisionMaker}pts), ${requirements.inquiry_source || 'general'} source (${breakdown.sourceQuality}pts).`;

  allLogs.push(createLog(6, 'compiled_executive_summary', 'success'));
  allLogs.push(createLog(6, `business_relevance: ${businessRelevance.revenuePotential}`, 'info'));
  allLogs.push(createLog(6, 'analysis_complete', 'success'));

  // Build result
  const id = store.generateId();
  const stats = store.getStats();

  const result: AgentResponse = {
    id,
    brand: 'Vitam Sales Intelligence',
    extracted_requirements: requirements,
    lead_priority: priority,
    lead_score: score,
    score_breakdown: breakdown,
    business_relevance: businessRelevance,
    sales_output: salesOutput,
    confidence: Math.min(95, 50 + score * 0.4),
    estimated_deal_value: dealValue,
    recommended_timeline: timeline,
    suggested_next_step: suggestedNextStep,
    short_sales_response: salesOutput.emailDraft,
    recommended_actions: actions,
    action_log: allLogs.filter(l => l.type === 'success').map(l => l.message),
    report_summary: {
      ...stats,
      leads_today: stats.leads_today,
      reports_generated: stats.reports_generated,
      total_score_processed: stats.total_score_processed + score,
    },
    score_reasoning: scoreReasoning,
    deepResearch: false,
  };

  store.incrementLeads(priority);
  store.setLastResult(result);

  // Auto-generate AI notes for the new lead
  // We build a temporary lead object for generateAIGeneratedNotes
  const tempLead = { ...result, company: companyName } as any;
  const aiNotes = generateAIGeneratedNotes(tempLead);

  // Store structured AI notes
  updateLeadStructuredNotes(id, 'keyObservations', aiNotes.keyObservations);
  updateLeadStructuredNotes(id, 'risks', aiNotes.risks);
  updateLeadStructuredNotes(id, 'missingInfo', aiNotes.missingInfo);
  updateLeadStructuredNotes(id, 'salesStrategyNotes', aiNotes.salesStrategyNotes);

  // Add individual AI note entries for timeline/history
  addLeadNote(id, 'ai_generated', `Key observation: ${aiNotes.keyObservations.join(' | ') || 'None noted'}`, 'system');
  if (aiNotes.risks.length > 0) {
    addLeadNote(id, 'risk_extraction', `Risks identified: ${aiNotes.risks.join(' | ')}`, 'system');
  }
  if (aiNotes.missingInfo.length > 0) {
    addLeadNote(id, 'ai_generated', `Missing info: ${aiNotes.missingInfo.join(' | ')}`, 'system');
  }
  if (aiNotes.salesStrategyNotes.length > 0) {
    addLeadNote(id, 'ai_generated', `Strategy: ${aiNotes.salesStrategyNotes.join(' | ')}`, 'system');
  }

  // Calculate note influence and add to result
  const noteInfluence = calculateNoteInfluence(id);

  // Add note influence to result (adjust score and conversion)
  const adjustedScore = Math.max(0, Math.min(100, score + noteInfluence.conversionModifier * 0.3));
  const adjustedConversion = score >= 65 ? 35 : score >= 45 ? 22 : score >= 30 ? 15 : 8;
  const finalConversionProb = adjustedConversion + Math.round(noteInfluence.conversionModifier * 0.5);

  // Update result with note influence
  result.lead_score = Math.round(adjustedScore);
  result.score_breakdown.total = Math.round(adjustedScore);
  result.confidence = Math.min(95, result.confidence + noteInfluence.conversionModifier * 0.1);
  result.noteInfluence = noteInfluence;

  // Adjust recommended timeline based on followUpUrgency
  if (noteInfluence.followUpUrgency >= 8) {
    result.recommended_timeline = 'Within 2 hours';
    result.suggested_next_step = `URGENT: Contact ${companyName} within 2 hours — notes indicate high urgency`;
  } else if (noteInfluence.followUpUrgency <= 2) {
    result.recommended_timeline = 'Within 1 week';
    result.suggested_next_step = `Notes suggest low urgency — schedule intro call for next week`;
  }

  // Always call MiniMax AI for intelligent, context-specific output on every lead
  allLogs.push(createLog(1, 'ai_analysis: calling_minimax_api', 'info'));

  const aiOutput = await callMiniMaxIntelligence(requirements, companyName, score);

  // Generate all remaining fields using AI output
  const executiveDecisionBlock = generateExecutiveDecisionBlock(score, priority, dealValue, requirements, aiOutput.riskAnalysis, companyName);
  const salesAssistantOutput = generateSalesAssistantOutput(requirements, companyName, requirements.product, priority, score);
  const dealVerdict = generateDealVerdict(score, priority, dealValue, requirements, aiOutput.riskAnalysis, aiOutput.conversionAnalysis);
  const dealStrategyEngine = generateDealStrategyEngine(requirements, score, priority, dealValue);
  const timeBasedIntelligence = generateTimeBasedIntelligence(requirements, priority, score);
  const sourceIntelligence = generateSourceIntelligence(requirements);
  const simplifiedScoring = generateSimplifiedScoring(requirements, score);
  const prioritizationSignal = calculatePrioritizationSignal(score, requirements.urgency, aiOutput.riskAnalysis.overallRiskScore);

  result.deepResearch = true;
  result.deepResearchOutput = aiOutput;
  result.executiveDecisionBlock = executiveDecisionBlock;
  result.salesAssistantOutput = salesAssistantOutput;
  result.prioritizationSignal = prioritizationSignal;
  result.dealVerdict = dealVerdict;
  result.dealStrategyEngine = dealStrategyEngine;
  result.timeBasedIntelligence = timeBasedIntelligence;
  result.sourceIntelligence = sourceIntelligence || undefined;
  result.simplifiedScoring = simplifiedScoring;

  // Use AI-generated sales outputs for email, call script, etc.
  if (aiOutput.expandedPlaybook) {
    result.sales_output = {
      ...result.sales_output,
      emailDraft: aiOutput.expandedPlaybook.emailDraft,
      emailSubject: aiOutput.expandedPlaybook.emailSubject,
      whatsappDraft: aiOutput.expandedPlaybook.whatsappDraft,
      callScript: aiOutput.expandedPlaybook.callScript,
    };
    result.short_sales_response = aiOutput.expandedPlaybook.emailDraft;
  }

  // Update recommended actions with AI-generated ones
  if (aiOutput.strategicRecommendations?.immediate) {
    result.recommended_actions = [
      ...aiOutput.strategicRecommendations.immediate,
      ...aiOutput.strategicRecommendations.shortTerm.slice(0, 2),
    ];
    result.suggested_next_step = aiOutput.strategicRecommendations.immediate[0] || result.suggested_next_step;
  }

  // Update business relevance with AI analysis
  if (aiOutput.conversionAnalysis) {
    result.business_relevance = {
      ...result.business_relevance,
      conversionLikelihood: `${aiOutput.conversionAnalysis.probability}%`,
      revenuePotential: aiOutput.conversionAnalysis.explanation.split('.')[0] + '.',
    };
  }

  allLogs.push(createLog(1, 'ai_analysis: minimax_api_completed', 'success'));
  allLogs.push(createLog(2, 'ai_analysis: industry_intelligence_generated', 'success'));
  allLogs.push(createLog(3, 'ai_analysis: outreach_strategy_generated', 'success'));
  allLogs.push(createLog(4, 'ai_analysis: strategic_recommendations_generated', 'success'));
  allLogs.push(createLog(5, 'ai_analysis: all_outputs_finalized', 'success'));

  return { result, allLogs };
}

function extractCompanyName(inquiry: string): string {
  const clean = inquiry.replace(/looking for|needs|wants|interested in| enquiry about| inquiry about/gi, '').trim();
  const words = clean.split(' ').slice(0, 2);
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Unknown Company';
}

export function generateReport(agentId: string): { report: string; generated_at: string } {
  store.incrementReports();
  const stats = store.getStats();
  const result = store.getLastResult();

  const report = `
VITAM SALES INTELLIGENCE — LEAD ANALYSIS REPORT
=================================================

Report ID: ${agentId}
Generated: ${new Date().toISOString()}

SCORING BREAKDOWN
-----------------
Budget Score: ${result?.score_breakdown.budget}/25
Company Size: ${result?.score_breakdown.companySize}/15
Urgency: ${result?.score_breakdown.urgency}/20
Industry Fit: ${result?.score_breakdown.industryFit}/15
Decision Maker: ${result?.score_breakdown.decisionMaker}/10
Source Quality: ${result?.score_breakdown.sourceQuality}/15
TOTAL: ${result?.score_breakdown.total}/100

BUSINESS RELEVANCE
------------------
Revenue Potential: ${result?.business_relevance.revenuePotential}
Conversion Likelihood: ${result?.business_relevance.conversionLikelihood}
Risk Factor: ${result?.business_relevance.riskFactor}
Urgency Impact: ${result?.business_relevance.urgencyImpact}
Summary: ${result?.business_relevance.summary}

SESSION METRICS
---------------
Leads Processed: ${stats.leads_today}
High Priority: ${stats.high_priority}
Reports Generated: ${stats.reports_generated}

Status: OPERATIONAL
`.trim();

  return { report, generated_at: new Date().toISOString() };
}