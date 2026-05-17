import { AgentResponse, SessionStats } from './types';
import { generateUUID } from './uuid';

// In-memory session store for demo purposes
class InMemoryStore {
  private stats: SessionStats = {
    leads_today: 0,
    high_priority: 0,
    pending_followups: 0,
    reports_generated: 0,
    total_score_processed: 0,
  };

  private lastResult: AgentResponse | null = null;
  private requestCount = 0;

  getStats(): SessionStats {
    return { ...this.stats };
  }

  incrementLeads(priority: 'High' | 'Medium' | 'Low'): void {
    this.stats.leads_today++;
    if (priority === 'High') {
      this.stats.high_priority++;
      this.stats.pending_followups++;
    }
  }

  incrementReports(): void {
    this.stats.reports_generated++;
  }

  setLastResult(result: AgentResponse): void {
    this.lastResult = result;
  }

  getLastResult(): AgentResponse | null {
    return this.lastResult;
  }

  generateId(): string {
    this.requestCount++;
    return generateUUID();
  }

  reset(): void {
    this.stats = {
      leads_today: 0,
      high_priority: 0,
      pending_followups: 0,
      reports_generated: 0,
      total_score_processed: 0,
    };
    this.lastResult = null;
    this.requestCount = 0;
  }
}

// Singleton instance
export const store = new InMemoryStore();