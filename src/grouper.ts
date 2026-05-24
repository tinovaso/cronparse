import { parseCron } from './parser';
import { expandCron } from './expander';
import { CronExpression } from './types';

export interface CronGroup {
  label: string;
  expressions: string[];
}

/**
 * Groups cron expressions by their minute field pattern.
 */
export function groupByMinute(expressions: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const expr of expressions) {
    const parsed = parseCron(expr);
    const key = parsed.minute;
    if (!groups[key]) groups[key] = [];
    groups[key].push(expr);
  }
  return groups;
}

/**
 * Groups cron expressions by their hour field pattern.
 */
export function groupByHour(expressions: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const expr of expressions) {
    const parsed = parseCron(expr);
    const key = parsed.hour;
    if (!groups[key]) groups[key] = [];
    groups[key].push(expr);
  }
  return groups;
}

/**
 * Groups cron expressions by their day-of-week field pattern.
 */
export function groupByDayOfWeek(expressions: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const expr of expressions) {
    const parsed = parseCron(expr);
    const key = parsed.dayOfWeek;
    if (!groups[key]) groups[key] = [];
    groups[key].push(expr);
  }
  return groups;
}

/**
 * Groups cron expressions by the number of distinct minutes they fire per day.
 */
export function groupByFrequency(expressions: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const expr of expressions) {
    const expanded = expandCron(expr);
    const minutesPerDay = expanded.minutes.length * expanded.hours.length;
    const bucket = minutesPerDay === 1 ? 'once' :
                   minutesPerDay <= 6 ? 'few' :
                   minutesPerDay <= 24 ? 'hourly' : 'frequent';
    if (!groups[bucket]) groups[bucket] = [];
    groups[bucket].push(expr);
  }
  return groups;
}

/**
 * Returns labeled groups from a custom classifier function.
 */
export function groupBy(
  expressions: string[],
  classifier: (expr: string, parsed: CronExpression) => string
): CronGroup[] {
  const map: Record<string, string[]> = {};
  for (const expr of expressions) {
    const parsed = parseCron(expr);
    const label = classifier(expr, parsed);
    if (!map[label]) map[label] = [];
    map[label].push(expr);
  }
  return Object.entries(map).map(([label, exprs]) => ({ label, expressions: exprs }));
}
