import { ParsedCron } from './types';
import { expandCron } from './expander';
import { parseCron } from './parser';

/**
 * Returns the set of minutes (0-based within a week) that two cron expressions share.
 */
export function intersectMinuteSets(a: Set<number>, b: Set<number>): Set<number> {
  const result = new Set<number>();
  for (const val of a) {
    if (b.has(val)) result.add(val);
  }
  return result;
}

/**
 * Builds a minute-of-week set from a ParsedCron.
 * Encodes each combination as: dayOfWeek * 1440 + hour * 60 + minute
 */
export function toMinuteOfWeekSet(parsed: ParsedCron): Set<number> {
  const expanded = expandCron(parsed);
  const set = new Set<number>();
  for (const dow of expanded.dayOfWeek) {
    for (const hour of expanded.hours) {
      for (const minute of expanded.minutes) {
        set.add(dow * 1440 + hour * 60 + minute);
      }
    }
  }
  return set;
}

/**
 * Returns true if two cron expressions share at least one execution time per week.
 */
export function hasIntersection(exprA: string, exprB: string): boolean {
  const parsedA = parseCron(exprA);
  const parsedB = parseCron(exprB);
  if (!parsedA || !parsedB) return false;
  const setA = toMinuteOfWeekSet(parsedA);
  const setB = toMinuteOfWeekSet(parsedB);
  for (const val of setA) {
    if (setB.has(val)) return true;
  }
  return false;
}

/**
 * Returns a description of the intersection between two cron expressions.
 */
export function intersectCron(
  exprA: string,
  exprB: string
): { overlapping: boolean; sharedCount: number; sample: number[] } {
  const parsedA = parseCron(exprA);
  const parsedB = parseCron(exprB);
  if (!parsedA || !parsedB) {
    return { overlapping: false, sharedCount: 0, sample: [] };
  }
  const setA = toMinuteOfWeekSet(parsedA);
  const setB = toMinuteOfWeekSet(parsedB);
  const shared = intersectMinuteSets(setA, setB);
  const sample = Array.from(shared).slice(0, 5);
  return {
    overlapping: shared.size > 0,
    sharedCount: shared.size,
    sample,
  };
}
