import { AgentResponse } from './types';
import { generateUUID } from './uuid';

// Lead interface matching our API response
export interface Lead extends AgentResponse {
  createdAt: string;
  updatedAt: string;
  status: 'new' | 'qualified' | 'proposal' | 'negotiation' | 'closed';
  company?: string;
  contact?: string;
  email?: string;
}

// External signals interface
export interface ExternalSignals {
  industryDemand: 'High' | 'Medium' | 'Low';
  marketTrend: 'Increasing' | 'Stable' | 'Decreasing';
  priceIndex: 'Rising' | 'Stable' | 'Falling';
  urgencySignal: 'Critical' | 'Normal' | 'Low';
  buyingIntent: 'Strong' | 'Moderate' | 'Weak';
  competitorPressure: 'Intense' | 'Moderate' | 'Minimal';
}

// Activity log entry
export interface ActivityEntry {
  id: string;
  timestamp: string;
  type: 'lead_created' | 'status_changed' | 'report_generated' | 'score_updated';
  leadId: string;
  leadName: string;
  details: string;
}

// Report interface
export interface SavedReport {
  id: string;
  leadId: string;
  leadName: string;
  score: number;
  priority: string;
  timestamp: string;
  summary: string;
}

// Note Entry interface
export interface NoteEntry {
  id: string;
  timestamp: string;
  type: 'manual' | 'ai_generated' | 'risk_extraction' | 'follow_up' | 'summary';
  content: string;
  author: 'user' | 'system';
  editHistory?: { timestamp: string; content: string }[];
}

// Lead Notes interface
export interface LeadNotes {
  keyObservations: string[];
  risks: string[];
  missingInfo: string[];
  salesStrategyNotes: string[];
  entries: NoteEntry[];
}

// Local storage keys
const LEADS_KEY = 'vitam_leads';
const ACTIVITY_KEY = 'vitam_activity';
const REPORTS_KEY = 'vitam_reports';
const SIGNALS_KEY = 'vitam_signals';

// Generate external signals based on industry
function generateExternalSignals(industry: string): ExternalSignals {
  const industrySignals: Record<string, Partial<ExternalSignals>> = {
    'Oil & Gas': { industryDemand: 'High', marketTrend: 'Increasing', priceIndex: 'Rising', buyingIntent: 'Strong', competitorPressure: 'Intense' },
    'Manufacturing': { industryDemand: 'High', marketTrend: 'Stable', priceIndex: 'Stable', buyingIntent: 'Moderate', competitorPressure: 'Moderate' },
    'Aerospace': { industryDemand: 'High', marketTrend: 'Increasing', priceIndex: 'Rising', buyingIntent: 'Strong', competitorPressure: 'Intense' },
    'Energy': { industryDemand: 'Medium', marketTrend: 'Increasing', priceIndex: 'Rising', buyingIntent: 'Moderate', competitorPressure: 'Moderate' },
    'Metal': { industryDemand: 'High', marketTrend: 'Increasing', priceIndex: 'Rising', buyingIntent: 'Strong', competitorPressure: 'Intense' },
    'Chemical': { industryDemand: 'Medium', marketTrend: 'Stable', priceIndex: 'Stable', buyingIntent: 'Moderate', competitorPressure: 'Moderate' },
    'Pharmaceutical': { industryDemand: 'High', marketTrend: 'Stable', priceIndex: 'Rising', buyingIntent: 'Strong', competitorPressure: 'Intense' },
    'ERP / IT Modernization': { industryDemand: 'High', marketTrend: 'Increasing', priceIndex: 'Rising', buyingIntent: 'Strong', competitorPressure: 'Intense' },
    'VR / AR': { industryDemand: 'Medium', marketTrend: 'Increasing', priceIndex: 'Stable', buyingIntent: 'Moderate', competitorPressure: 'Moderate' },
    'SaaS / Tech': { industryDemand: 'Medium', marketTrend: 'Increasing', priceIndex: 'Stable', buyingIntent: 'Moderate', competitorPressure: 'Moderate' },
  };

  const base: ExternalSignals = {
    industryDemand: 'Medium',
    marketTrend: 'Stable',
    priceIndex: 'Stable',
    urgencySignal: 'Normal',
    buyingIntent: 'Moderate',
    competitorPressure: 'Moderate',
  };

  const industryOverride = industrySignals[industry] || {};
  return { ...base, ...industryOverride };
}

// Get all leads
export function getLeads(): Lead[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(LEADS_KEY);
  if (!data) return [];
  const leads: Lead[] = JSON.parse(data);
  // Sanitize any legacy demo- IDs to prevent duplicate key warnings
  return leads.map(lead => {
    if (lead.id && lead.id.startsWith('demo-')) {
      return { ...lead, id: generateUUID() };
    }
    return lead;
  });
}

// Save lead
export function saveLead(lead: Lead): void {
  if (typeof window === 'undefined') return;
  const leads = getLeads();
  // Ensure no duplicate IDs
  const filtered = leads.filter(l => l.id !== lead.id);
  filtered.unshift(lead);
  localStorage.setItem(LEADS_KEY, JSON.stringify(filtered));
  addActivity({
    type: 'lead_created',
    leadId: lead.id,
    leadName: lead.company || lead.extracted_requirements.product,
    details: `Lead created: ${lead.extracted_requirements.product} — Score ${lead.lead_score}/100`,
  });
}

// Update lead status
export function updateLeadStatus(leadId: string, status: Lead['status']): void {
  const leads = getLeads();
  const index = leads.findIndex(l => l.id === leadId);
  if (index !== -1) {
    leads[index].status = status;
    leads[index].updatedAt = new Date().toISOString();
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
    addActivity({
      type: 'status_changed',
      leadId,
      leadName: leads[index].company || leads[index].extracted_requirements.product,
      details: `Moved to ${status} stage`,
    });
  }
}

// Delete lead
export function deleteLead(leadId: string): void {
  if (typeof window === 'undefined') return;
  const leads = getLeads().filter(l => l.id !== leadId);
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
}

// Get pipeline leads by status
export function getPipelineLeads(): Record<Lead['status'], Lead[]> {
  const leads = getLeads();
  return {
    new: leads.filter(l => l.status === 'new'),
    qualified: leads.filter(l => l.status === 'qualified'),
    proposal: leads.filter(l => l.status === 'proposal'),
    negotiation: leads.filter(l => l.status === 'negotiation'),
    closed: leads.filter(l => l.status === 'closed'),
  };
}

// Get recent leads
export function getRecentLeads(count: number = 5): Lead[] {
  return getLeads().slice(0, count);
}

// Get top opportunity (highest score lead that's not closed)
export function getTopOpportunity(): Lead | null {
  const leads = getLeads().filter(l => l.status !== 'closed');
  if (leads.length === 0) return null;
  return leads.reduce((top, l) => l.lead_score > top.lead_score ? l : top, leads[0]);
}

// Get at-risk leads (low score or missing info)
export function getAtRiskLeads(): Lead[] {
  return getLeads().filter(l => {
    const hasLowScore = l.lead_score < 35;
    const missingInfo = !l.extracted_requirements.quantity ||
                        l.extracted_requirements.quantity === 'TBD' ||
                        !l.extracted_requirements.budget_range;
    return hasLowScore || missingInfo;
  }).slice(0, 5);
}

// Calculate metrics
export function getMetrics(): {
  totalLeads: number;
  highPriority: number;
  conversionRate: number;
  pipelineValue: string;
  avgScore: number;
  reportsGenerated: number;
  avgDealSize: string;
  pipelineHealth: { early: number; late: number };
} {
  const leads = getLeads();
  const totalLeads = leads.length;
  const highPriority = leads.filter(l => l.lead_priority === 'High').length;
  const closed = leads.filter(l => l.status === 'closed').length;
  const conversionRate = totalLeads > 0 ? Math.round((closed / totalLeads) * 100) : 0;

  // Calculate pipeline value
  const pipelineLeads = leads.filter(l => l.status !== 'closed');
  let totalValue = 0;
  pipelineLeads.forEach(l => {
    const match = l.estimated_deal_value.match(/\$?([\d.]+)([KM])?/);
    if (match) {
      let val = parseFloat(match[1]);
      if (match[2] === 'K') val *= 1000;
      if (match[2] === 'M') val *= 1000000;
      totalValue += val;
    }
  });
  let pipelineValue = '₹0';
  const inrValue = totalValue * 83;
  if (inrValue >= 10000000) pipelineValue = `₹${(inrValue / 10000000).toFixed(1)}Cr`;
  else if (inrValue >= 100000) pipelineValue = `₹${(inrValue / 100000).toFixed(1)}L`;
  else pipelineValue = `₹${inrValue.toFixed(0)}`;

  const avgScore = totalLeads > 0
    ? Math.round(leads.reduce((sum, l) => sum + l.lead_score, 0) / totalLeads)
    : 0;

  const reportsGenerated = getReports().length;

  // Average deal size
  const dealSizes = pipelineLeads.map(l => {
    // Handle ₹ format: ₹1.5L, ₹2.3Cr
    const rupeeMatch = l.estimated_deal_value.match(/₹?([\d.]+)(L|Cr)?/);
    if (rupeeMatch) {
      let val = parseFloat(rupeeMatch[1]);
      if (rupeeMatch[2] === 'Cr') val *= 10000000;
      else if (rupeeMatch[2] === 'L') val *= 100000;
      return val;
    }
    return 0;
  }).filter(v => v > 0);
  const avgDeal = dealSizes.length > 0
    ? dealSizes.reduce((a, b) => a + b, 0) / dealSizes.length
    : 0;
  let avgDealSize = '₹0';
  const avgInr = avgDeal;
  if (avgInr >= 10000000) avgDealSize = `₹${(avgInr / 10000000).toFixed(1)}Cr`;
  else if (avgInr >= 100000) avgDealSize = `₹${(avgInr / 100000).toFixed(1)}L`;
  else if (avgInr > 0) avgDealSize = `₹${Math.round(avgInr).toLocaleString()}`;

  // Pipeline health (early = new/qualified, late = proposal/negotiation)
  const early = leads.filter(l => l.status === 'new' || l.status === 'qualified').length;
  const late = leads.filter(l => l.status === 'proposal' || l.status === 'negotiation').length;

  return {
    totalLeads,
    highPriority,
    conversionRate,
    pipelineValue,
    avgScore,
    reportsGenerated,
    avgDealSize,
    pipelineHealth: { early, late },
  };
}

// Extract company name from form data or inquiry
function extractCompanyFromForm(formData: { companyName?: string } | undefined, fallback: string): string {
  if (formData?.companyName) return formData.companyName;
  const clean = fallback.replace(/looking for|needs|wants|interested in|enquiry about| inquiry about/gi, '').trim();
  const words = clean.split(' ').slice(0, 2);
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Unknown Company';
}

// Create lead from analysis result
export function createLead(result: AgentResponse, inquiry: string, formData?: { companyName?: string }): Lead {
  const now = new Date().toISOString();
  return {
    ...result,
    createdAt: now,
    updatedAt: now,
    status: 'new',
    company: extractCompanyFromForm(formData, inquiry),
    contact: formData?.companyName ? 'Contact not specified' : 'Unknown',
    email: '',
  };
}

// Get external signals for an industry
export function getExternalSignals(industry: string): ExternalSignals {
  const signals = generateExternalSignals(industry);
  if (typeof window !== 'undefined') {
    localStorage.setItem(SIGNALS_KEY, JSON.stringify(signals));
  }
  return signals;
}

// Activity management
export function getActivities(): ActivityEntry[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(ACTIVITY_KEY);
  return data ? JSON.parse(data) : [];
}

function addActivity(entry: Omit<ActivityEntry, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  const activities = getActivities();
  activities.unshift({
    ...entry,
    id: generateUUID(),
    timestamp: new Date().toISOString(),
  });
  // Keep only last 50 activities
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities.slice(0, 50)));
}

// Report management
export function getReports(): SavedReport[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(REPORTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveReport(report: SavedReport): void {
  if (typeof window === 'undefined') return;
  const reports = getReports();
  reports.unshift(report);
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports.slice(0, 50)));
  addActivity({
    type: 'report_generated',
    leadId: report.leadId,
    leadName: report.leadName,
    details: `Report generated: ${report.leadName} — Score ${report.score}/100`,
  });
}

export function getRecentReports(count: number = 5): SavedReport[] {
  return getReports().slice(0, count);
}

// Get lead by ID
export function getLeadById(leadId: string): Lead | undefined {
  return getLeads().find(l => l.id === leadId);
}

// Get pipeline movement (recent stage changes)
export function getPipelineMovement(count: number = 5): ActivityEntry[] {
  return getActivities()
    .filter(a => a.type === 'status_changed')
    .slice(0, count);
}

// ==================== NOTE MANAGEMENT ====================

const NOTES_KEY = 'vitam_notes';

function getNotesMap(): Record<string, LeadNotes> {
  if (typeof window === 'undefined') return {};
  const data = localStorage.getItem(NOTES_KEY);
  return data ? JSON.parse(data) : {};
}

function saveNotesMap(notes: Record<string, LeadNotes>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

function initLeadNotes(): LeadNotes {
  return {
    keyObservations: [],
    risks: [],
    missingInfo: [],
    salesStrategyNotes: [],
    entries: [],
  };
}

// Get notes for a specific lead
export function getLeadNotes(leadId: string): LeadNotes {
  const notes = getNotesMap();
  return notes[leadId] || initLeadNotes();
}

// Add a note entry to a lead
export function addLeadNote(
  leadId: string,
  type: NoteEntry['type'],
  content: string,
  author: 'user' | 'system' = 'user'
): NoteEntry {
  const notes = getNotesMap();
  if (!notes[leadId]) {
    notes[leadId] = initLeadNotes();
  }

  const entry: NoteEntry = {
    id: generateUUID(),
    timestamp: new Date().toISOString(),
    type,
    content,
    author,
    editHistory: [],
  };

  notes[leadId].entries.unshift(entry);
  saveNotesMap(notes);

  // Also add to activity log
  addActivity({
    type: 'score_updated',
    leadId,
    leadName: getLeadById(leadId)?.company || 'Unknown',
    details: `${author === 'system' ? 'AI' : 'User'} added ${type.replace('_', ' ')} note`,
  });

  return entry;
}

// Update a note entry
export function updateLeadNote(
  leadId: string,
  noteId: string,
  newContent: string
): NoteEntry | null {
  const notes = getNotesMap();
  if (!notes[leadId]) return null;

  const entryIndex = notes[leadId].entries.findIndex(e => e.id === noteId);
  if (entryIndex === -1) return null;

  // Save to edit history
  const oldContent = notes[leadId].entries[entryIndex].content;
  if (!notes[leadId].entries[entryIndex].editHistory) {
    notes[leadId].entries[entryIndex].editHistory = [];
  }
  notes[leadId].entries[entryIndex].editHistory.push({
    timestamp: notes[leadId].entries[entryIndex].timestamp,
    content: oldContent,
  });

  // Update the entry
  notes[leadId].entries[entryIndex].content = newContent;
  notes[leadId].entries[entryIndex].timestamp = new Date().toISOString();
  saveNotesMap(notes);

  return notes[leadId].entries[entryIndex];
}

// Delete a note entry
export function deleteLeadNote(leadId: string, noteId: string): boolean {
  const notes = getNotesMap();
  if (!notes[leadId]) return false;

  const index = notes[leadId].entries.findIndex(e => e.id === noteId);
  if (index === -1) return false;

  notes[leadId].entries.splice(index, 1);
  saveNotesMap(notes);
  return true;
}

// Update structured note fields (keyObservations, risks, missingInfo, salesStrategyNotes)
export function updateLeadStructuredNotes(
  leadId: string,
  field: 'keyObservations' | 'risks' | 'missingInfo' | 'salesStrategyNotes',
  value: string[]
): void {
  const notes = getNotesMap();
  if (!notes[leadId]) {
    notes[leadId] = initLeadNotes();
  }
  notes[leadId][field] = value;
  saveNotesMap(notes);
}

// Generate AI notes from lead data (deterministic, no actual AI needed)
export function generateAIGeneratedNotes(lead: Lead): {
  keyObservations: string[];
  risks: string[];
  missingInfo: string[];
  salesStrategyNotes: string[];
} {
  const observations: string[] = [];
  const risks: string[] = [];
  const missing: string[] = [];
  const strategy: string[] = [];

  // Key Observations
  if (lead.lead_priority === 'High') {
    observations.push(`High priority lead — requires immediate attention within 4 hours`);
  } else if (lead.lead_priority === 'Medium') {
    observations.push(`Medium priority — standard follow-up within 48 hours`);
  }

  if (lead.extracted_requirements.budget_range === 'gt500k') {
    observations.push(`Enterprise budget (₹4Cr+) — multi-stakeholder deal likely`);
  } else if (lead.extracted_requirements.budget_range === 'lt5k') {
    observations.push(`Small deal size — consider bundling or upsell opportunities`);
  }

  if (lead.extracted_requirements.urgency === 'high' || lead.extracted_requirements.urgency === 'critical') {
    observations.push(`Urgent timeline — accelerate proposal preparation`);
  }

  if (lead.extracted_requirements.decision_maker === 'yes') {
    observations.push(`Decision maker identified — streamline sales cycle`);
  } else {
    observations.push(`Decision maker not confirmed — identify stakeholders first`);
  }

  // Risks
  if (!lead.extracted_requirements.quantity || lead.extracted_requirements.quantity === 'TBD') {
    risks.push(`Missing quantity — cannot accurately size deal`);
    missing.push(`Quantity or scope not specified`);
  }

  if (!lead.extracted_requirements.budget_range) {
    risks.push(`Budget not disclosed — may indicate exploratory behavior`);
    missing.push(`Budget range unknown`);
  }

  if (lead.extracted_requirements.inquiry_source === 'Cold outreach') {
    risks.push(`Cold outreach lead — lower conversion probability, longer sales cycle`);
  }

  if (lead.extracted_requirements.previous_vendor === 'yes') {
    risks.push(`Replacing existing vendor — competitive situation, price sensitivity likely`);
    strategy.push(`Prepare competitive differentiation vs incumbent`);
  }

  if (lead.lead_score < 40) {
    risks.push(`Low lead score — high risk of non-conversion, consider nurture path`);
  }

  // Missing Information
  if (!lead.extracted_requirements.company_size) {
    missing.push(`Company size not specified`);
  }
  if (!lead.extracted_requirements.location) {
    missing.push(`Geographic location unknown — may affect logistics/pricing`);
  }
  if (!lead.contact || lead.contact === 'Unknown') {
    missing.push(`Contact information incomplete`);
  }

  // Sales Strategy Notes
  if (lead.extracted_requirements.industry === 'Oil & Gas' || lead.extracted_requirements.industry === 'Aerospace') {
    strategy.push(`Industrial enterprise sale — emphasize compliance, safety certifications, and delivery track record`);
  }

  if (lead.extracted_requirements.use_case === 'System replacement') {
    strategy.push(`System replacement — highlight migration support, training, and transition timeline`);
  }

  if (lead.extracted_requirements.use_case === 'New project') {
    strategy.push(`New project — position as partnership, focus on long-term relationship`);
  }

  if (lead.business_relevance?.revenuePotential === 'Exceptional') {
    strategy.push(`Exceptional revenue potential — allocate senior resource, prepare executive presentation`);
  }

  if (lead.extracted_requirements.urgency === 'high' || lead.extracted_requirements.urgency === 'critical') {
    strategy.push(`Urgent deal — fast-track internal approvals, have management on standby for escalations`);
  }

  return { keyObservations: observations, risks, missingInfo: missing, salesStrategyNotes: strategy };
}

// Calculate note influence on scoring
export function calculateNoteInfluence(leadId: string): {
  competitionRisk: number;
  followUpUrgency: number;
  conversionModifier: number;
} {
  const notes = getNotesMap();
  const leadNotes = notes[leadId];
  if (!leadNotes) return { competitionRisk: 5, followUpUrgency: 5, conversionModifier: 0 };

  let competitionRisk = 5;
  let followUpUrgency = 5;
  let conversionModifier = 0;

  // Analyze note entries for influence
  leadNotes.entries.forEach(entry => {
    const content = entry.content.toLowerCase();

    // Competition risk signals
    if (content.includes('comparing') || content.includes('competitor') || content.includes('vendor')) {
      competitionRisk = Math.max(competitionRisk, 8);
    }
    if (content.includes('only one') || content.includes('single') || content.includes(' sole')) {
      competitionRisk = Math.min(competitionRisk, 3);
    }

    // Follow-up urgency signals
    if (content.includes('urgent') || content.includes('asap') || content.includes('critical')) {
      followUpUrgency = Math.max(followUpUrgency, 9);
    }
    if (content.includes('slow') || content.includes('exploring') || content.includes('not ready')) {
      followUpUrgency = Math.min(followUpUrgency, 2);
    }

    // Conversion modifier signals
    if (content.includes('decision maker confirmed') || content.includes('budget approved')) {
      conversionModifier += 10;
    }
    if (content.includes('blocked') || content.includes('stuck') || content.includes('waiting')) {
      conversionModifier -= 10;
    }
  });

  // Apply risk list influence
  leadNotes.risks.forEach(risk => {
    if (risk.toLowerCase().includes('cold')) conversionModifier -= 5;
    if (risk.toLowerCase().includes('low score')) conversionModifier -= 8;
  });

  leadNotes.salesStrategyNotes.forEach(note => {
    if (note.toLowerCase().includes('exceptional')) conversionModifier += 5;
  });

  return {
    competitionRisk: Math.max(0, Math.min(10, competitionRisk)),
    followUpUrgency: Math.max(0, Math.min(10, followUpUrgency)),
    conversionModifier: Math.max(-15, Math.min(15, conversionModifier)),
  };
}

// Clear all data
export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LEADS_KEY);
  localStorage.removeItem(ACTIVITY_KEY);
  localStorage.removeItem(REPORTS_KEY);
  localStorage.removeItem(SIGNALS_KEY);
  localStorage.removeItem(NOTES_KEY);
}