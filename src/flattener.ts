import { parseCron } from './parser';
import { expandCron } from './expander';
import { CronExpression } from './types';

/**
 * Represents a flattened cron schedule as a sorted list of
 * [minuteOfWeek] values (0 = Sunday 00:00, ..., 10079 = Saturday 23:59).
 */
export type FlatSchedule = number[];

/** Convert a parsed cron expression to a sorted array of minute-of-week values. */
export function flattenCron(expr: CronExpression): FlatSchedule {
  const expanded = expandCron(expr);
  const result = new Set<number>();

  for (const dow of expanded.dayOfWeek) {
    for (const hour of expanded.hour) {
      for (const minute of expanded.minute) {
        result.add(dow * 1440 + hour * 60 + minute);
      }
    }
  }

  return Array.from(result).sort((a, b) => a - b);
}

/** Parse a cron string and return its flat schedule. */
export function flattenExpression(expression: string): FlatSchedule {
  const parsed = parseCron(expression);
  return flattenCron(parsed);
}

/** Return the number of unique fire times per week for a cron expression. */
export function countFiringsPerWeek(expression: string): number {
  return flattenExpression(expression).length;
}

/** Return the number of unique fire times per day (averaged over the week). */
export function avgFiringsPerDay(expression: string): number {
  return countFiringsPerWeek(expression) / 7;
}

/** Check whether two flat schedules are identical. */
export function flatSchedulesEqual(a: FlatSchedule, b: FlatSchedule): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

/** Return entries present in `a` but not in `b`. */
export function flatDifference(a: FlatSchedule, b: FlatSchedule): FlatSchedule {
  const setB = new Set(b);
  return a.filter(v => !setB.has(v));
}

/** Return entries present in both `a` and `b`. */
export function flatIntersection(a: FlatSchedule, b: FlatSchedule): FlatSchedule {
  const setB = new Set(b);
  return a.filter(v => setB.has(v));
}
