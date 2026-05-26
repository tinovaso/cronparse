import { parseCron } from './parser';
import { toCronString } from './formatter';
import { resolveAlias } from './alias';
import { CronExpression } from './types';

/**
 * Replaces step values that are equivalent to wildcards.
 * e.g. "0/1" -> "*", "0-59/1" -> "*"
 */
export function simplifySteps(field: string, max: number): string {
  const stepMatch = field.match(/^(?:\*|0(?:-\d+)?)\/(\d+)$/);
  if (stepMatch) {
    const step = parseInt(stepMatch[1], 10);
    if (step === 1) return '*';
    if (step >= max) return '0';
  }
  return field;
}

/**
 * Sorts comma-separated values in a cron field numerically.
 */
export function sortField(field: string): string {
  if (!field.includes(',')) return field;
  const parts = field.split(',');
  const sorted = parts.sort((a, b) => {
    const na = parseInt(a, 10);
    const nb = parseInt(b, 10);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return a.localeCompare(b);
  });
  return sorted.join(',');
}

/**
 * Removes duplicate values in a comma-separated cron field.
 */
export function deduplicateField(field: string): string {
  if (!field.includes(',')) return field;
  const parts = field.split(',');
  const unique = [...new Set(parts)];
  return unique.join(',');
}

/**
 * Normalizes a single cron field string:
 * resolves aliases, simplifies steps, deduplicates, and sorts.
 */
export function normalizeField(field: string, max: number): string {
  const resolved = resolveAlias(field);
  const simplified = simplifySteps(resolved, max);
  const deduped = deduplicateField(simplified);
  return sortField(deduped);
}

const FIELD_MAXES = [60, 24, 32, 13, 8];

/**
 * Normalizes a full cron expression string into a canonical form.
 * Resolves aliases, simplifies redundant steps, deduplicates and sorts list values.
 */
export function normalizeCron(expression: string): string {
  const parsed: CronExpression = parseCron(expression);
  const fields: (keyof CronExpression)[] = ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];
  const normalized: Record<string, string> = {};
  fields.forEach((f, i) => {
    normalized[f] = normalizeField(String(parsed[f]), FIELD_MAXES[i]);
  });
  return toCronString(normalized as unknown as CronExpression);
}

/**
 * Returns true if two cron expressions are identical after normalization.
 */
export function areNormalizedEqual(a: string, b: string): boolean {
  return normalizeCron(a) === normalizeCron(b);
}
