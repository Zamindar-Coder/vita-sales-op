'use client';

import { useState, useEffect } from 'react';

interface LeadIntakeFormProps {
  onRunAnalysis: (inquiry: string, formData?: any) => void;
  isLoading: boolean;
}

interface FormData {
  companyName: string;
  industry: string;
  companySize: string;
  location: string;
  productService: string;
  quantity: string;
  budgetRange: string;
  timeline: string;
  urgency: string;
  decisionMakerRole: string;
  decisionMakerInfluence: string;
  previousVendor: string;
  acquisitionChannel: string;
  contextNotes: string;
  useCase: string;
}

const INITIAL_FORM: FormData = {
  companyName: '',
  industry: '',
  companySize: '',
  location: '',
  productService: '',
  quantity: '',
  budgetRange: '',
  timeline: '',
  urgency: '',
  decisionMakerRole: '',
  decisionMakerInfluence: '',
  previousVendor: '',
  acquisitionChannel: '',
  contextNotes: '',
  useCase: '',
};

const INDUSTRIES = [
  'Manufacturing', 'Oil & Gas', 'Construction', 'Aerospace', 'Energy',
  'Chemical', 'Metal', 'Pharmaceutical', 'Food & Beverage', 'Automotive',
  'ERP / IT', 'SaaS / Tech', 'Other',
];

// Industry-specific product suggestions
const PRODUCT_SUGGESTIONS: Record<string, string[]> = {
  'Manufacturing': ['Precision components', 'Custom machining', 'Sheet metal fabrication', 'Assembly services', 'Raw materials'],
  'Oil & Gas': ['Valve assemblies', 'Pump components', 'Pipeline fittings', 'Pressure vessels', 'Drilling equipment'],
  'Aerospace': ['Titanium brackets', 'Flight-critical components', 'High-tolerance parts', 'Landing gear', 'Turbine components'],
  'Energy': ['Solar panels', 'Wind turbine components', 'Power distribution', 'Transformer parts', 'Grid equipment'],
  'Chemical': ['Reactor vessels', 'Heat exchangers', 'Piping systems', 'Storage tanks', 'Process equipment'],
  'Construction': ['Structural steel', 'Concrete formwork', 'HVAC systems', 'Electrical infrastructure', 'Building materials'],
  'Metal': ['Steel coils', 'Aluminum sheets', 'Metal forgings', 'Castings', 'Welding assemblies'],
  'Pharmaceutical': ['Processing equipment', 'Clean room systems', 'Packaging machinery', 'Laboratory equipment', 'Sterile components'],
  'Automotive': ['Precision parts', 'EV components', 'Transmission parts', 'Safety systems', 'Electronics'],
  'ERP / IT': ['ERP implementation', 'Cloud migration', 'IT consulting', 'Software development', 'System integration'],
  'SaaS / Tech': ['Platform license', 'API integration', 'Custom development', 'Consulting services', 'Infrastructure'],
  'Other': ['Industrial supplies', 'Specialized equipment', 'Custom components', 'Consulting services'],
};

const BUDGET_RANGES = [
  { value: 'lt5k', label: '<₹4L' },
  { value: '5k-10k', label: '₹4L-₹8L' },
  { value: '10k-50k', label: '₹8L-₹40L' },
  { value: '50k-500k', label: '₹40L-₹4Cr' },
  { value: 'gt500k', label: '₹4Cr+' },
];

const URGENCY_LEVELS = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const ACQUISITION_CHANNELS = [
  { value: 'inbound', label: 'Inbound' },
  { value: 'referral', label: 'Referral' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'cold_outreach', label: 'Cold Outreach' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'event', label: 'Event / Trade Show' },
  { value: 'existing_customer', label: 'Existing Customer' },
];

const DECISION_MAKER_ROLES = [
  { value: 'founder', label: 'Founder / CEO' },
  { value: 'procurement', label: 'Procurement Head' },
  { value: 'engineering', label: 'Engineering / Technical' },
  { value: 'operations', label: 'Operations' },
  { value: 'finance', label: 'Finance / CFO' },
  { value: 'it', label: 'IT / Technology' },
  { value: 'unknown', label: 'Unknown' },
];

const INFLUENCE_LEVELS = [
  { value: 'high', label: 'High Influence' },
  { value: 'medium', label: 'Medium Influence' },
  { value: 'low', label: 'Low Influence' },
  { value: 'unknown', label: 'Unknown' },
];

const USE_CASES = [
  'New project',
  'System replacement',
  'Capacity expansion',
  'Quality improvement',
  'Cost reduction',
  'Compliance upgrade',
  'Technology upgrade',
  'Supplier diversification',
  'R&D / Prototype',
  'Other',
];

function calculateCompleteness(form: FormData): number {
  const fields = [form.companyName, form.industry, form.productService, form.quantity, form.budgetRange, form.urgency, form.acquisitionChannel, form.companySize, form.timeline, form.previousVendor];
  return Math.round((fields.filter(f => f.trim() !== '').length / fields.length) * 100);
}

export default function LeadIntakeForm({ onRunAnalysis, isLoading }: LeadIntakeFormProps) {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [completeness, setCompleteness] = useState(0);
  const [productSuggestions, setProductSuggestions] = useState<string[]>([]);

  useEffect(() => { setCompleteness(calculateCompleteness(form)); }, [form]);

  // Update product suggestions when industry changes
  useEffect(() => {
    if (form.industry && PRODUCT_SUGGESTIONS[form.industry]) {
      setProductSuggestions(PRODUCT_SUGGESTIONS[form.industry]);
    } else {
      setProductSuggestions([]);
    }
  }, [form.industry]);

  const updateField = (field: keyof FormData, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    const inquiry = `${form.companyName || form.productService}, ${form.industry} company, needs ${form.productService}, quantity: ${form.quantity}, budget: ${form.budgetRange}, urgency: ${form.urgency}`;
    onRunAnalysis(inquiry, form);
  };

  const isValid = completeness >= 40;

  const sampleTemplates = [
    { company: 'Sharma Industrial', industry: 'Manufacturing', product: 'precision components', budget: '50k-500k', quantity: '2000', companySize: 'enterprise', urgency: 'high', acquisitionChannel: 'inbound', location: 'Mumbai, India', timeline: 'immediate', previousVendor: 'no', useCase: 'capacity_expansion', decisionMakerRole: 'procurement', decisionMakerInfluence: 'high' },
    { company: 'Vanguard Energy', industry: 'Oil & Gas', product: 'valve assemblies', budget: 'gt500k', quantity: '500', companySize: 'enterprise', urgency: 'critical', acquisitionChannel: 'referral', location: 'Dubai, UAE', timeline: 'immediate', previousVendor: 'yes', useCase: 'system_replacement', decisionMakerRole: 'operations', decisionMakerInfluence: 'high' },
    { company: 'NovaTech Aero', industry: 'Aerospace', product: 'titanium brackets', budget: 'gt500k', quantity: '300', companySize: 'mid', urgency: 'high', acquisitionChannel: 'linkedin', location: 'Seattle, USA', timeline: '1month', previousVendor: 'TBD', useCase: 'new_project', decisionMakerRole: 'engineering', decisionMakerInfluence: 'medium' },
  ];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Opportunity Context</h2>
        <select
          className="h-5 text-[9px] border border-gray-200 rounded px-1 bg-white text-gray-500"
          onChange={(e) => {
            const t = sampleTemplates[parseInt(e.target.value)];
            if (t) setForm(prev => ({ ...prev, ...t }));
          }}
        >
          <option value="">Load sample</option>
          {sampleTemplates.map((t, i) => (
            <option key={i} value={i}>{t.company}</option>
          ))}
        </select>
      </div>

      {/* Company Name */}
      <div>
        <input
          type="text"
          value={form.companyName}
          onChange={(e) => updateField('companyName', e.target.value)}
          placeholder="Company name"
          className="w-full h-7 rounded border border-gray-200 px-2.5 text-xs focus:outline-none focus:border-gray-400"
        />
      </div>

      {/* Industry & Use Case */}
      <div className="grid grid-cols-2 gap-2">
        <select
          value={form.industry}
          onChange={(e) => updateField('industry', e.target.value)}
          className="h-7 rounded border border-gray-200 px-2 text-xs bg-white focus:outline-none focus:border-gray-400"
        >
          <option value="">Industry</option>
          {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
        </select>
        <select
          value={form.useCase}
          onChange={(e) => updateField('useCase', e.target.value)}
          className="h-7 rounded border border-gray-200 px-2 text-xs bg-white focus:outline-none focus:border-gray-400"
        >
          <option value="">Use Case</option>
          {USE_CASES.map(uc => <option key={uc} value={uc.toLowerCase().replace(/ /g, '_')}>{uc}</option>)}
        </select>
      </div>

      {/* Product with Suggestions */}
      <div>
        <input
          type="text"
          value={form.productService}
          onChange={(e) => updateField('productService', e.target.value)}
          placeholder="Product / Service"
          className="w-full h-7 rounded border border-gray-200 px-2.5 text-xs focus:outline-none focus:border-gray-400"
          list="product-suggestions"
        />
        <datalist id="product-suggestions">
          {productSuggestions.map(s => <option key={s} value={s} />)}
        </datalist>
      </div>

      {/* Quantity & Budget */}
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={form.quantity}
          onChange={(e) => updateField('quantity', e.target.value)}
          placeholder="Quantity"
          className="h-7 rounded border border-gray-200 px-2 text-xs focus:outline-none focus:border-gray-400"
        />
        <select
          value={form.budgetRange}
          onChange={(e) => updateField('budgetRange', e.target.value)}
          className="h-7 rounded border border-gray-200 px-2 text-xs bg-white focus:outline-none focus:border-gray-400"
        >
          <option value="">Budget</option>
          {BUDGET_RANGES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
        </select>
      </div>

      {/* Urgency & Timeline */}
      <div className="grid grid-cols-2 gap-2">
        <select
          value={form.urgency}
          onChange={(e) => updateField('urgency', e.target.value)}
          className="h-7 rounded border border-gray-200 px-2 text-xs bg-white focus:outline-none focus:border-gray-400"
        >
          <option value="">Urgency</option>
          {URGENCY_LEVELS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
        </select>
        <select
          value={form.timeline}
          onChange={(e) => updateField('timeline', e.target.value)}
          className="h-7 rounded border border-gray-200 px-2 text-xs bg-white focus:outline-none focus:border-gray-400"
        >
          <option value="">Timeline</option>
          <option value="immediate">Immediate</option>
          <option value="1week">Within 1 week</option>
          <option value="1month">Within 1 month</option>
          <option value="3months">3+ months</option>
        </select>
      </div>

      {/* Acquisition Channel */}
      <select
        value={form.acquisitionChannel}
        onChange={(e) => updateField('acquisitionChannel', e.target.value)}
        className="w-full h-7 rounded border border-gray-200 px-2 text-xs bg-white focus:outline-none focus:border-gray-400"
      >
        <option value="">Acquisition Channel</option>
        {ACQUISITION_CHANNELS.map(ch => <option key={ch.value} value={ch.value}>{ch.label}</option>)}
      </select>

      {/* Decision Maker Role & Influence */}
      <div className="grid grid-cols-2 gap-2">
        <select
          value={form.decisionMakerRole}
          onChange={(e) => updateField('decisionMakerRole', e.target.value)}
          className="h-7 rounded border border-gray-200 px-2 text-xs bg-white focus:outline-none focus:border-gray-400"
        >
          <option value="">D.M. Role</option>
          {DECISION_MAKER_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <select
          value={form.decisionMakerInfluence}
          onChange={(e) => updateField('decisionMakerInfluence', e.target.value)}
          className="h-7 rounded border border-gray-200 px-2 text-xs bg-white focus:outline-none focus:border-gray-400"
        >
          <option value="">Influence</option>
          {INFLUENCE_LEVELS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
        </select>
      </div>

      {/* Company Size & Location */}
      <div className="grid grid-cols-2 gap-2">
        <select
          value={form.companySize}
          onChange={(e) => updateField('companySize', e.target.value)}
          className="h-7 rounded border border-gray-200 px-2 text-xs bg-white focus:outline-none focus:border-gray-400"
        >
          <option value="">Size</option>
          <option value="small">Small</option>
          <option value="mid">Mid-size</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <input
          type="text"
          value={form.location}
          onChange={(e) => updateField('location', e.target.value)}
          placeholder="City, Country"
          className="h-7 rounded border border-gray-200 px-2 text-xs focus:outline-none focus:border-gray-400"
        />
      </div>

      {/* Previous Vendor */}
      <select
        value={form.previousVendor}
        onChange={(e) => updateField('previousVendor', e.target.value)}
        className="w-full h-7 rounded border border-gray-200 px-2 text-xs bg-white focus:outline-none focus:border-gray-400"
      >
        <option value="">Previous Supplier</option>
        <option value="no">No existing supplier</option>
        <option value="yes">Current supplier</option>
        <option value="TBD">To be determined</option>
      </select>

      {/* Context Notes */}
      <textarea
        value={form.contextNotes}
        onChange={(e) => updateField('contextNotes', e.target.value)}
        placeholder="Key context: competitors being evaluated, specific requirements..."
        rows={2}
        className="w-full resize-none rounded border border-gray-200 px-2.5 py-1.5 text-xs focus:outline-none focus:border-gray-400"
      />

      {/* Completeness indicator */}
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-gray-400 transition-all" style={{ width: `${completeness}%` }} />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!isValid || isLoading}
        className={`w-full py-2 rounded text-xs font-medium transition-colors ${
          isValid && !isLoading
            ? 'bg-gray-900 text-white hover:bg-black'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {isLoading ? 'Analyzing...' : 'Analyze Opportunity'}
      </button>
    </div>
  );
}
