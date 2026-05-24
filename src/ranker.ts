import { parseCron } from './parser';
import { expandCron } from './expander';
import { analyze } from './analyzer';

export interface RankResult {
  expression: string;
  score: number;
  reasons: string[];
}

/**
 * Scores a cron expression by readability and simplicity.
 * Higher score = more human-friendly.
 */
export function scoreCron(expression: string): RankResult {
  const parsed = parseCron(expression);
  const analysis = analyze(expression);
  const expanded = expandCron(expression);

  const reasons: string[] = [];
  let score = 100;

  // Penalize complexity
  if (analysis.complexity > 5) {
    const penalty = (analysis.complexity - 5) * 8;
    score -= penalty;
    reasons.push(`High complexity (${analysis.complexity}): -${penalty}`);
  }

  // Reward wildcards
  const fields = [parsed.minute, parsed.hour, parsed.dayOfMonth, parsed.month, parsed.dayOfWeek];
  const wildcardCount = fields.filter(f => f === '*').length;
  if (wildcardCount >= 3) {
    score += wildcardCount * 3;
    reasons.push(`${wildcardCount} wildcard fields: +${wildcardCount * 3}`);
  }

  // Penalize large minute sets
  if (expanded.minute.length > 30) {
    score -= 20;
    reasons.push('Many minute values: -20');
  }

  // Reward step syntax
  const stepCount = expression.split('/').length - 1;
  if (stepCount > 0) {
    score += stepCount * 5;
    reasons.push(`Step syntax used (${stepCount}): +${stepCount * 5}`);
  }

  // Penalize lists with many items
  const listCount = expression.split(',').length - 1;
  if (listCount > 4) {
    score -= listCount * 2;
    reasons.push(`Long list (${listCount} commas): -${listCount * 2}`);
  }

  return {
    expression,
    score: Math.max(0, Math.min(100, score)),
    reasons,
  };
}

/**
 * Ranks multiple cron expressions from most to least readable.
 */
export function rankCrons(expressions: string[]): RankResult[] {
  return expressions
    .map(expr => scoreCron(expr))
    .sort((a, b) => b.score - a.score);
}

/**
 * Returns the most readable expression from a list.
 */
export function bestCron(expressions: string[]): string {
  if (expressions.length === 0) throw new Error('No expressions provided');
  return rankCrons(expressions)[0].expression;
}
