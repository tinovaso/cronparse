import { CronExpression } from './types';

type FormatStyle = 'cron' | 'object' | 'json' | 'array';

/**
 * Converts a CronExpression object back into a cron string.
 */
export function toCronString(expr: CronExpression): string {
  return [
    expr.minute,
    expr.hour,
    expr.dayOfMonth,
    expr.month,
    expr.dayOfWeek,
  ].join(' ');
}

/**
 * Formats a CronExpression into the specified output style.
 */
export function formatExpression(expr: CronExpression, style: FormatStyle = 'cron'): string {
  switch (style) {
    case 'cron':
      return toCronString(expr);

    case 'object':
      return (
        `{ minute: '${expr.minute}', ` +
        `hour: '${expr.hour}', ` +
        `dayOfMonth: '${expr.dayOfMonth}', ` +
        `month: '${expr.month}', ` +
        `dayOfWeek: '${expr.dayOfWeek}' }`
      );

    case 'json':
      return JSON.stringify(
        {
          minute: expr.minute,
          hour: expr.hour,
          dayOfMonth: expr.dayOfMonth,
          month: expr.month,
          dayOfWeek: expr.dayOfWeek,
        },
        null,
        2
      );

    case 'array':
      return JSON.stringify([
        expr.minute,
        expr.hour,
        expr.dayOfMonth,
        expr.month,
        expr.dayOfWeek,
      ]);

    default:
      throw new Error(`Unknown format style: ${style}`);
  }
}

/**
 * Normalizes a cron string by parsing known aliases and whitespace.
 */
export function normalizeCronString(input: string): string {
  const aliases: Record<string, string> = {
    '@yearly':   '0 0 1 1 *',
    '@annually': '0 0 1 1 *',
    '@monthly':  '0 0 1 * *',
    '@weekly':   '0 0 * * 0',
    '@daily':    '0 0 * * *',
    '@midnight': '0 0 * * *',
    '@hourly':   '0 * * * *',
  };

  const trimmed = input.trim().toLowerCase();
  if (aliases[trimmed]) {
    return aliases[trimmed];
  }

  return input.trim().replace(/\s+/g, ' ');
}
