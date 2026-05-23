/**
 * analyzer.ts
 * Analyzes cron expressions to provide statistical and structural insights.
 * Useful for understanding schedule density, frequency, and patterns.
 */

import { ParsedCron } from './types';
import { expandCron } from './expander';
import { parseCron } from './parser';

export interface CronAnalysis {
  /** Total number of times the cron fires per day (approximate) */
  firesPerDay: number;
  /** Total number of times the cron fires per week (approximate) */
  firesPerWeek: number;
  /** Total number of times the cron fires per month (approximate) */
  firesPerMonth: number;
  /** Whether the schedule runs every minute */
  isEveryMinute: boolean;
  /** Whether the schedule runs every hour */
  isEveryHour: boolean;
  /** Whether the schedule is restricted to specific days of week */
  isDayRestricted: boolean;
  /** Whether the schedule is restricted to specific months */
  isMonthRestricted: boolean;
  /** The busiest hour(s) of day (most minute triggers) */
  busiestHours: number[];
  /** The least busy hour(s) of day */
  quietestHours: number[];
  /** Average minutes between firings within an active hour */
  avgMinuteInterval: number;
  /** Complexity score from 1 (simple) to 10 (complex) */
  complexityScore: number;
}

/**
 * Calculates a complexity score for a parsed cron expression.
 * Higher scores indicate more complex, harder-to-read expressions.
 */
function calcComplexity(parsed: ParsedCron): number {
  let score = 1;
  const fields = [parsed.minute, parsed.hour, parsed.dayOfMonth, parsed.month, parsed.dayOfWeek];
  for (const field of fields) {
    if (field === '*') continue;
    if (field.includes('/')) score += 1;
    if (field.includes(',')) score += field.split(',').length * 0.5;
    if (field.includes('-')) score += 1;
  }
  return Math.min(10, Math.round(score));
}

/**
 * Analyzes a cron expression string and returns detailed insights.
 *
 * @param expression - A valid cron expression (5-field standard format)
 * @returns CronAnalysis object with schedule statistics
 *
 * @example
 * const info = analyze('0 9-17 * * 1-5');
 * console.log(info.firesPerDay); // 9
 * console.log(info.isDayRestricted); // true
 */
export function analyze(expression: string): CronAnalysis {
  const parsed = parseCron(expression);
  const expanded = expandCron(expression);

  const minuteCount = expanded.minutes.length;
  const hourCount = expanded.hours.length;
  const dowCount = expanded.daysOfWeek.length;
  const monthCount = expanded.months.length;

  const firesPerDay = minuteCount * hourCount;
  const firesPerWeek = firesPerDay * dowCount;
  const firesPerMonth = Math.round(firesPerDay * (dowCount / 7) * 30);

  // Determine busiest/quietest hours by counting minute slots per hour
  // (for standard cron all hours have same minute pattern, but useful for step/range hours)
  const hourFireMap: Record<number, number> = {};
  for (const h of expanded.hours) {
    hourFireMap[h] = minuteCount;
  }

  const maxFires = Math.max(...Object.values(hourFireMap));
  const minFires = Math.min(...Object.values(hourFireMap));

  const busiestHours = Object.entries(hourFireMap)
    .filter(([, v]) => v === maxFires)
    .map(([k]) => Number(k));

  const quietestHours = Object.entries(hourFireMap)
    .filter(([, v]) => v === minFires)
    .map(([k]) => Number(k));

  const avgMinuteInterval = minuteCount > 1
    ? Math.round(60 / minuteCount)
    : 60;

  return {
    firesPerDay,
    firesPerWeek,
    firesPerMonth,
    isEveryMinute: minuteCount === 60 && hourCount === 24,
    isEveryHour: minuteCount === 1 && hourCount === 24,
    isDayRestricted: parsed.dayOfWeek !== '*',
    isMonthRestricted: parsed.month !== '*',
    busiestHours,
    quietestHours,
    avgMinuteInterval,
    complexityScore: calcComplexity(parsed),
  };
}
