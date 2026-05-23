import { CronExpression } from './types';
import { parseCron } from './parser';
import { expandCron } from './expander';
import { areEquivalent } from './differ';
import { toCronString } from './formatter';

/**
 * Attempts to merge two cron expressions into a single expression
 * that covers all times from both. Returns null if a clean merge
 * is not possible.
 */
export function mergeCron(
  a: string | CronExpression,
  b: string | CronExpression
): string | null {
  const exprA = typeof a === 'string' ? parseCron(a) : a;
  const exprB = typeof b === 'string' ? parseCron(b) : b;

  if (areEquivalent(exprA, exprB)) {
    return toCronString(exprA);
  }

  const fields: (keyof CronExpression)[] = ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];
  const diffFields = fields.filter(f => exprA[f] !== exprB[f]);

  // Only attempt merge if exactly one field differs
  if (diffFields.length !== 1) {
    return null;
  }

  const diffField = diffFields[0];
  const valA = exprA[diffField];
  const valB = exprB[diffField];

  // If either is wildcard, merged result is wildcard
  if (valA === '*' || valB === '*') {
    return toCronString({ ...exprA, [diffField]: '*' });
  }

  const merged: CronExpression = {
    ...exprA,
    [diffField]: `${valA},${valB}`,
  };

  return toCronString(merged);
}

/**
 * Merges multiple cron expressions into as few expressions as possible.
 * Returns an array of merged cron strings.
 */
export function mergeAll(expressions: string[]): string[] {
  if (expressions.length === 0) return [];
  if (expressions.length === 1) return [expressions[0]];

  const results: string[] = [expressions[0]];

  for (let i = 1; i < expressions.length; i++) {
    let merged = false;
    for (let j = 0; j < results.length; j++) {
      const attempt = mergeCron(results[j], expressions[i]);
      if (attempt !== null) {
        results[j] = attempt;
        merged = true;
        break;
      }
    }
    if (!merged) {
      results.push(expressions[i]);
    }
  }

  return results;
}

/**
 * Returns the set of minutes (as numbers) covered by both expressions combined.
 */
export function unionMinutes(a: string, b: string): number[] {
  const expandedA = expandCron(a);
  const expandedB = expandCron(b);
  const combined = new Set([...expandedA.minute, ...expandedB.minute]);
  return Array.from(combined).sort((x, y) => x - y);
}
