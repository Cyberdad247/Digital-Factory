import { WorkflowIntent, ContextBudget } from '../types';

/**
 * TriageOrchestrator determines the engine routing and context budget
 * based on user intent.
 */
export class TriageOrchestrator {
  static determineIntent(rawIntent: string): WorkflowIntent {
    const lower = rawIntent.toLowerCase();
    if (lower.includes('design') || lower.includes('architect')) return 'DESIGN';
    if (lower.includes('build') || lower.includes('implement')) return 'IMPLEMENT';
    if (lower.includes('bug') || lower.includes('fix')) return 'DEBUG';
    return 'ANALYZE';
  }

  static getBudget(intent: WorkflowIntent): ContextBudget {
    switch (intent) {
      case 'DESIGN': return { maxTokens: 4000, symbolLimit: 10, ephemeralFiles: [] };
      case 'IMPLEMENT': return { maxTokens: 8000, symbolLimit: 50, ephemeralFiles: ['*spec*'] };
      case 'DEBUG': return { maxTokens: 12000, symbolLimit: 200, ephemeralFiles: ['*log*', '*test*'] };
      default: return { maxTokens: 2000, symbolLimit: 5, ephemeralFiles: [] };
    }
  }
}
