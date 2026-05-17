# Vitam Sales Operator - Specification v6

## Concept & Vision

A polished enterprise AI sales agent demo that feels like a real internal sales intelligence tool. Features real Gemini API integration, premium UI, and believable staged execution. Clean, minimal, professional—not a chatbot toy.

---

## Design System

### Aesthetic
- Minimal enterprise SaaS
- Clean whites and grays
- Single accent (gray-900)
- No emojis, no playful elements
- Subtle shadows and borders

### Color Palette
- Background: `#F9FAFB` (page), `#FFFFFF` (cards)
- Text: `#111827` (primary), `#6B7280` (secondary), `#9CA3AF` (tertiary)
- Border: `#E5E7EB`
- Accent: `#111827`
- Success: `#059669`
- Log: `#111827` (dark)

### Typography
- Font: Inter (system fallback)
- Hero score: 60px bold
- Section labels: 12px uppercase tracking-wide
- Body: 14px

---

## Layout

```
┌──────────────────────────────────────────────────────────────┐
│ HEADER                                                       │
│ [Logo] Vitam              Operational | All systems active │
├──────────────────────────────────────────────────────────────┤
│ STATS: Leads Today | High Priority | Avg Score | Reports  │
├───────────┬────────────────────────────┬───────────────────┤
│ LEFT      │ CENTER                     │ RIGHT              │
│ 280px     │ flex-1                    │ 280px              │
│            │                            │                    │
│ New Inquiry│ [Lead Score Hero]          │ Execution Timeline │
│ [textarea]│                            │ [dark panel]      │
│            │ [Lead Intelligence]      │ [grouped logs]    │
│ [Run]     │                            │                    │
│ [Sample]  │ [Business Impact]          │                    │
│ [Report]  │                            │                    │
│            │ [Recommended Action]     │                    │
│            │                            │                    │
│            │ [Generated Communication] │                    │
└───────────┴────────────────────────────┴───────────────────┘
│ API ACCESS (collapsed)                                      │
└──────────────────────────────────────────────────────────────┘
```

---

## Components

| Component | Description |
|-----------|-------------|
| Header | Logo + brand + status badge |
| StatsStrip | 4-metric KPI bar |
| InputPanel | Inquiry textarea + action buttons |
| LeadScoreHero | Large score + priority badge + reasoning |
| LeadIntelligence | 6-field grid (product, quantity, industry, etc.) |
| BusinessImpact | Dark card with conversion, close window, priority |
| RecommendedAction | Primary action + action items list |
| GeneratedCommunication | Clean response paragraph |
| ExecutionLog | Dark grouped timeline logs |
| ReportModal | Full report with all sections |
| ApiDemo | Collapsible curl panel |

---

## Report Modal Sections

1. Hero Score with priority badge and reasoning
2. Key metrics: Est. Value, Timeline, Confidence
3. Generated visualization image (if available)
4. Recommended Actions (highlighted)
5. Lead Details grid
6. Generated Response
7. Session Summary (4 metrics)

---

## Features

- Real Gemini API integration for context, response, and image generation
- 6-stage execution with grouped logs
- Chain-of-thought reasoning (hidden, not exposed)
- Report modal with full analysis
- Deterministic fallback when no API key
- Provider abstraction for swappable LLM

---

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Gemini API (mock fallback)

---

## Quality Checklist

- [x] Logo in header
- [x] No emojis anywhere
- [x] Clean enterprise design
- [x] 3-panel layout
- [x] Grouped execution logs
- [x] Report modal
- [x] Gemini image generation
- [x] Provider abstraction
- [x] Build passes
