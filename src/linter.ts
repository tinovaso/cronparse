import { parseCron } from './parser';
import { annotate } from './annotator';

export type LintSeverity = 'error' | 'warning' | 'info';

export interface LintIssue {
  severity: LintSeverity;
  field?: string;
  message: string;
}

export interface LintResult {
  valid: boolean;
  issues: LintIssue[];
}

export function lint(expression: string): LintResult {
  const issues: LintIssue[] = [];

  try {
    parseCron(expression);
  } catch (e: any) {
    return { valid: false, issues: [{ severity: 'error', message: e.message }] };
  }

  const annotation = annotate(expression);

  for (const warning of annotation.warnings) {
    issues.push({ severity: 'warning', message: warning });
  }

  const parts = expression.trim().split(/\s+/);
  const [minute, , dom, , dow] = parts;

  if (minute !== '*' && !minute.includes('/') && !minute.includes(',') && !minute.includes('-')) {
    const val = parseInt(minute, 10);
    if (!isNaN(val) && val > 59) {
      issues.push({ severity: 'error', field: 'minute', message: 'Minute value exceeds 59.' });
    }
  }

  if (dom === '*' && dow === '*') {
    issues.push({ severity: 'info', message: 'Expression runs every day; consider restricting the schedule.' });
  }

  const stepMatch = expression.match(/\*\/(\d+)/);
  if (stepMatch) {
    const step = parseInt(stepMatch[1], 10);
    if (step === 1) {
      issues.push({ severity: 'info', message: 'Step of 1 is equivalent to a wildcard (*); consider simplifying.' });
    }
  }

  return { valid: true, issues };
}
