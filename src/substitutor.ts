import { parseCron } from './parser';
import { toCronString } from './formatter';
import { CronExpression } from './types';

export type SubstitutionMap = {
  minute?: string;
  hour?: string;
  dayOfMonth?: string;
  month?: string;
  dayOfWeek?: string;
};

/**
 * Substitutes one or more fields in a cron expression with new values.
 * Returns the modified cron expression string.
 */
export function substituteFields(
  expression: string,
  substitutions: SubstitutionMap
): string {
  const parsed = parseCron(expression);
  if (!parsed) {
    throw new Error(`Invalid cron expression: "${expression}"`);
  }

  const updated: CronExpression = {
    minute: substitutions.minute ?? parsed.minute,
    hour: substitutions.hour ?? parsed.hour,
    dayOfMonth: substitutions.dayOfMonth ?? parsed.dayOfMonth,
    month: substitutions.month ?? parsed.month,
    dayOfWeek: substitutions.dayOfWeek ?? parsed.dayOfWeek,
  };

  return toCronString(updated);
}

/**
 * Replaces the minute field of a cron expression.
 */
export function substituteMinute(expression: string, minute: string): string {
  return substituteFields(expression, { minute });
}

/**
 * Replaces the hour field of a cron expression.
 */
export function substituteHour(expression: string, hour: string): string {
  return substituteFields(expression, { hour });
}

/**
 * Applies a list of substitutions in sequence, each on the result of the previous.
 */
export function substituteChain(
  expression: string,
  steps: SubstitutionMap[]
): string {
  return steps.reduce(
    (expr, substitution) => substituteFields(expr, substitution),
    expression
  );
}
