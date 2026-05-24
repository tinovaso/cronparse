import { parseCron } from './parser';
import { expandCron } from './expander';
import { toCronString } from './formatter';
import { CronExpression } from './types';

/**
 * Attempts to simplify a cron field to its most compact representation.
 * e.g. "0,1,2,3,4,5" -> "0-5", "0-23" -> "*"
 */
export function optimizeField(
  values: number[],
  min: number,
  max: number
): string {
  if (values.length === 0) return '*';

  const sorted = [...new Set(values)].sort((a, b) => a - b);
  const total = max - min + 1;

  if (sorted.length === total) return '*';

  // Check for uniform step (*/n)
  if (sorted.length > 1) {
    const step = sorted[1] - sorted[0];
    if (step > 1) {
      const isUniform = sorted.every((v, i) => v === sorted[0] + i * step);
      const coversFromMin = sorted[0] === min;
      if (isUniform && coversFromMin) {
        return `*/${step}`;
      }
    }
  }

  // Check for contiguous range
  const isContiguous = sorted.every(
    (v, i) => i === 0 || v === sorted[i - 1] + 1
  );
  if (isContiguous && sorted.length > 2) {
    return `${sorted[0]}-${sorted[sorted.length - 1]}`;
  }

  return sorted.join(',');
}

/**
 * Returns an optimized (most compact) cron expression string
 * that is semantically equivalent to the input.
 */
export function optimizeCron(expression: string): string {
  const parsed = parseCron(expression);
  const expanded = expandCron(expression);

  const fieldRanges: [number, number][] = [
    [0, 59],  // minute
    [0, 23],  // hour
    [1, 31],  // day of month
    [1, 12],  // month
    [0, 6],   // day of week
  ];

  const fields = [parsed.minute, parsed.hour, parsed.dayOfMonth, parsed.month, parsed.dayOfWeek];
  const expandedFields = [
    expanded.minute,
    expanded.hour,
    expanded.dayOfMonth,
    expanded.month,
    expanded.dayOfWeek,
  ];

  const optimized = expandedFields.map((vals, i) => {
    const original = fields[i];
    if (original === '*') return '*';
    return optimizeField(vals, fieldRanges[i][0], fieldRanges[i][1]);
  });

  return optimized.join(' ');
}

/**
 * Returns true if the optimized form differs from the original (i.e., it was simplified).
 */
export function canBeOptimized(expression: string): boolean {
  try {
    const optimized = optimizeCron(expression);
    return optimized !== expression.trim();
  } catch {
    return false;
  }
}
