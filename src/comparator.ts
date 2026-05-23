import { parseCron } from './parser';
import { expandCron } from './expander';
import { CronExpression } from './types';

export interface CompareResult {
  isEqual: boolean;
  isSubset: boolean;
  isSuperset: boolean;
  overlapCount: number;
  onlyInA: number[];
  onlyInB: number[];
}

/**
 * Returns the set of minutes-in-week (0..10079) that a cron fires.
 */
function toMinuteSet(expanded: ReturnType<typeof expandCron>): Set<number> {
  const set = new Set<number>();
  for (const dow of expanded.dayOfWeek) {
    for (const h of expanded.hours) {
      for (const m of expanded.minutes) {
        set.add(dow * 1440 + h * 60 + m);
      }
    }
  }
  return set;
}

/**
 * Compares two cron expressions and returns a detailed comparison result.
 */
export function compareCron(a: string, b: string): CompareResult {
  const expandedA = expandCron(parseCron(a));
  const expandedB = expandCron(parseCron(b));

  const setA = toMinuteSet(expandedA);
  const setB = toMinuteSet(expandedB);

  const onlyInA: number[] = [];
  const onlyInB: number[] = [];
  let overlapCount = 0;

  for (const v of setA) {
    if (setB.has(v)) overlapCount++;
    else onlyInA.push(v);
  }
  for (const v of setB) {
    if (!setA.has(v)) onlyInB.push(v);
  }

  return {
    isEqual: onlyInA.length === 0 && onlyInB.length === 0,
    isSubset: onlyInA.length === 0 && overlapCount > 0,
    isSuperset: onlyInB.length === 0 && overlapCount > 0,
    overlapCount,
    onlyInA,
    onlyInB,
  };
}

/**
 * Returns true if expression A fires on every occasion that expression B fires.
 */
export function isSupersetOf(a: string, b: string): boolean {
  const result = compareCron(a, b);
  return result.isSuperset || result.isEqual;
}

/**
 * Returns true if expression A fires only on occasions that expression B also fires.
 */
export function isSubsetOf(a: string, b: string): boolean {
  const result = compareCron(a, b);
  return result.isSubset || result.isEqual;
}
