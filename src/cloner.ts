import { parseCron } from './parser';
import { toCronString } from './formatter';
import { CronExpression } from './types';

/**
 * Deep clone a parsed CronExpression object.
 */
export function cloneExpression(expr: CronExpression): CronExpression {
  return {
    minute: { ...expr.minute },
    hour: { ...expr.hour },
    dayOfMonth: { ...expr.dayOfMonth },
    month: { ...expr.month },
    dayOfWeek: { ...expr.dayOfWeek },
  };
}

/**
 * Clone a cron string by parsing and re-serializing it.
 * Optionally apply field overrides to the cloned expression.
 */
export function cloneCron(
  expression: string,
  overrides?: Partial<CronExpression>
): string {
  const parsed = parseCron(expression);
  const cloned = cloneExpression(parsed);
  const merged: CronExpression = { ...cloned, ...overrides };
  return toCronString(merged);
}

/**
 * Produce N independent clones of a cron string.
 */
export function cloneMany(expression: string, count: number): string[] {
  if (count < 1) return [];
  return Array.from({ length: count }, () => cloneCron(expression));
}

/**
 * Clone and patch a specific field of a cron expression.
 */
export function cloneWithField(
  expression: string,
  field: keyof CronExpression,
  value: string
): string {
  const parsed = parseCron(expression);
  const cloned = cloneExpression(parsed);
  const patched = parseCron(
    field === 'minute' ? `${value} ${toCronString(cloned).split(' ').slice(1).join(' ')}` :
    field === 'hour' ? `${cloned.minute.raw ?? '*'} ${value} ${toCronString(cloned).split(' ').slice(2).join(' ')}` :
    toCronString(cloned)
  );
  (patched as any)[field] = { raw: value };
  return toCronString({ ...cloned, [field]: { raw: value } });
}
