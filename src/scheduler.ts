import { parseCron } from './parser';
import { CronExpression } from './types';

/**
 * Returns the next Date after `from` that matches the cron expression.
 */
export function getNextDate(expression: string, from: Date = new Date()): Date {
  const cron = parseCron(expression);
  const result = new Date(from);
  result.setSeconds(0, 0);
  result.setMinutes(result.getMinutes() + 1);

  const MAX_ITERATIONS = 366 * 24 * 60;
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    if (matchesCron(cron, result)) {
      return result;
    }
    result.setMinutes(result.getMinutes() + 1);
  }

  throw new Error(`No matching date found within one year for expression: ${expression}`);
}

/**
 * Returns the next N dates matching the cron expression.
 */
export function getNextDates(expression: string, count: number, from: Date = new Date()): Date[] {
  const dates: Date[] = [];
  let cursor = from;
  for (let i = 0; i < count; i++) {
    const next = getNextDate(expression, cursor);
    dates.push(next);
    cursor = next;
  }
  return dates;
}

function matchesCron(cron: CronExpression, date: Date): boolean {
  const minute = date.getMinutes();
  const hour = date.getHours();
  const dom = date.getDate();
  const month = date.getMonth() + 1;
  const dow = date.getDay();

  return (
    fieldMatches(cron.minute, minute) &&
    fieldMatches(cron.hour, hour) &&
    fieldMatches(cron.dayOfMonth, dom) &&
    fieldMatches(cron.month, month) &&
    fieldMatches(cron.dayOfWeek, dow)
  );
}

function fieldMatches(values: number[], value: number): boolean {
  return values.includes(value);
}
