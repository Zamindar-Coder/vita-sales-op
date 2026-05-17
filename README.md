# Vitam Sales Operator

An enterprise AI sales agent with real Gemini API integration, premium UI, and believable staged execution.

## Features

- Real Gemini AI integration for context, response, and image generation
- 6-stage execution with grouped logs
- Polished report modal with full analysis
- Provider abstraction (swap LLM via env vars)
- Deterministic fallback when no API key

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3009](http://localhost:3009)

## Configuration

```bash
# .env.local
LLM_PROVIDER=gemini
LLM_API_KEY=your-gemini-api-key
LLM_MODEL=gemini-2.0-flash-latest
```

Get your API key at [Google AI Studio](https://makersuite.google.com/app/apikey)

## API Endpoints

### POST /api/agent
```bash
curl -X POST http://localhost:3009/api/agent \
  -H "Content-Type: application/json" \
  -d '{"input":"Need 1000 stainless steel tubes for oil refinery use"}'
```

### POST /api/report
```bash
curl -X POST http://localhost:3009/api/report \
  -H "Content-Type: application/json" \
  -d '{"agentId":"demo-001"}'
```

### GET /api/health
```bash
curl http://localhost:3009/api/health
```

## Response Schema

```json
{
  "id": "demo-001",
  "brand": "Vitam Sales Operator",
  "extracted_requirements": {
    "product": "Stainless steel tubes",
    "quantity": "1000",
    "industry": "Oil & Gas",
    "urgency": "High"
  },
  "lead_priority": "High",
  "lead_score": 78,
  "confidence": 85,
  "estimated_deal_value": "$500K - $1M",
  "recommended_timeline": "Within 4 hours",
  "suggested_next_step": "Assign dedicated account manager",
  "short_sales_response": "Thank you for your inquiry...",
  "recommended_actions": ["Assign account manager", "Send quote"],
  "score_reasoning": "Score of 78 reflects...",
  "generated_report_image": "data:image/png;base64,..."
}
```

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Gemini API

## Architecture

```
/app
  /api/agent/route.ts    - Agent execution
  /api/report/route.ts   - Report generation
  /api/health/route.ts   - Health check

/lib
  agent.ts              - Business logic + prompts
  providers.ts           - LLM abstraction
  types.ts              - TypeScript types
  inMemoryStore.ts      - Session state
  mockData.ts           - Sample inquiries

/components
  Header.tsx            - Brand + status
  StatsStrip.tsx       - KPI bar
  InputPanel.tsx       - Inquiry input
  OutputCard.tsx       - Output sections
  ExecutionLog.tsx     - Timeline logs
  ReportModal.tsx      - Full report modal
  ApiDemo.tsx          - API demo panel
```
