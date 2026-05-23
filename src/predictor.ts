import { parseCron } from './parser';
import { getNextDates } from './scheduler';
import { CronExpression } from './types';

export interface PredictionResult {
  expression: string;
  nextDates: Date[];
  intervalMs: number | null;
  isUniform: boolean;
}

/**
 * Calculates the median interval (in ms) between consecutive dates.
 */
export function medianInterval(dates: Date[]): number | null {
  if (dates.length < 2) return null;
  const intervals: number[] = [];
  for (let i = 1; i < dates.length; i++) {
    intervals.push(dates[i].getTime() - dates[i - 1].getTime());
  }
  intervals.sort((a, b) => a - b);
  const mid = Math.floor(intervals.length / 2);
  return intervals.length % 2 !== 0
    ? intervals[mid]
    : Math.round((intervals[mid - 1] + intervals[mid]) / 2);
}

/**
 * Determines whether all intervals between dates are equal.
 */
export function isUniformSchedule(dates: Date[]): boolean {
  if (dates.length < 2) return true;
  const first = dates[1].getTime() - dates[0].getTime();
  for (let i = 2; i < dates.length; i++) {
    if (dates[i].getTime() - dates[i - 1].getTime() !== first) return false;
  }
  return true;
}

/**
 * Predicts upcoming schedule information for a cron expression.
 *
 * @param expression - A valid cron expression string
 * @param count      - Number of future dates to compute (default: 5)
 * @param from       - Start date for prediction (default: now)
 */
export function predict(
  expression: string,
  count: number = 5,
  from: Date = new Date()
): PredictionResult {
  const parsed: CronExpression = parseCron(expression);
  if (!parsed) {
    throw new Error(`Invalid cron expression: "${expression}"`);
  }

  const nextDates = getNextDates(expression, count, from);
  const intervalMs = medianInterval(nextDates);
  const uniform = isUniformSchedule(nextDates);

  return {
    expression,
    nextDates,
    intervalMs,
    isUniform: uniform,
  };
}
