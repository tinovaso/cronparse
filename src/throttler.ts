import { parseCron } from './parser';
import { getNextDates } from './scheduler';

export interface ThrottleOptions {
  maxPerHour?: number;
  maxPerDay?: number;
  minIntervalMinutes?: number;
}

export interface ThrottleResult {
  allowed: boolean;
  reason?: string;
  suggestedExpression?: string;
}

/**
 * Checks if a cron expression exceeds given throttle limits.
 */
export function throttleCheck(
  expression: string,
  options: ThrottleOptions
): ThrottleResult {
  const parsed = parseCron(expression);
  const now = new Date('2024-01-01T00:00:00Z');
  const next24h = getNextDates(expression, 24 * 60, now);

  if (options.maxPerDay !== undefined && next24h.length > options.maxPerDay) {
    return {
      allowed: false,
      reason: `Expression fires ${next24h.length} times/day, exceeds limit of ${options.maxPerDay}`,
      suggestedExpression: throttleToDaily(parsed.minute, options.maxPerDay),
    };
  }

  const next60min = getNextDates(expression, 60, now);
  if (options.maxPerHour !== undefined && next60min.length > options.maxPerHour) {
    return {
      allowed: false,
      reason: `Expression fires ${next60min.length} times/hour, exceeds limit of ${options.maxPerHour}`,
      suggestedExpression: throttleToHourly(options.maxPerHour),
    };
  }

  if (options.minIntervalMinutes !== undefined) {
    const intervals = computeIntervals(next24h);
    const minFound = Math.min(...intervals);
    if (minFound < options.minIntervalMinutes) {
      return {
        allowed: false,
        reason: `Minimum interval is ${minFound} min, required at least ${options.minIntervalMinutes} min`,
        suggestedExpression: `*/${options.minIntervalMinutes} * * * *`,
      };
    }
  }

  return { allowed: true };
}

function computeIntervals(dates: Date[]): number[] {
  const intervals: number[] = [];
  for (let i = 1; i < dates.length; i++) {
    intervals.push((dates[i].getTime() - dates[i - 1].getTime()) / 60000);
  }
  return intervals.length ? intervals : [Infinity];
}

function throttleToDaily(minuteField: string, maxPerDay: number): string {
  const step = Math.ceil(1440 / maxPerDay);
  const hours = Math.floor(step / 60);
  const mins = step % 60;
  if (hours >= 1) return `${mins === 0 ? '0' : mins} */${hours} * * *`;
  return `*/${step} * * * *`;
}

function throttleToHourly(maxPerHour: number): string {
  const step = Math.ceil(60 / maxPerHour);
  return `*/${step} * * * *`;
}
