import { parseCron } from './parser';
import { toCronString } from './formatter';
import { CronExpression } from './types';

export interface CronTemplate {
  name: string;
  description: string;
  expression: string;
  variables: Record<string, string>;
}

const VARIABLE_PATTERN = /\{\{(\w+)\}\}/g;

export function extractVariables(template: string): string[] {
  const matches = [...template.matchAll(VARIABLE_PATTERN)];
  return [...new Set(matches.map((m) => m[1]))];
}

export function renderTemplate(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(VARIABLE_PATTERN, (_, key) => {
    if (!(key in variables)) {
      throw new Error(`Missing variable: ${key}`);
    }
    return variables[key];
  });
}

export function createTemplate(
  name: string,
  description: string,
  expression: string
): CronTemplate {
  const variables = extractVariables(expression);
  const defaults: Record<string, string> = {};
  variables.forEach((v) => (defaults[v] = '*'));
  return { name, description, expression, variables: defaults };
}

export function applyTemplate(
  template: CronTemplate,
  variables: Record<string, string>
): CronExpression {
  const rendered = renderTemplate(template.expression, variables);
  return parseCron(rendered);
}

export function templateFromExpression(
  name: string,
  description: string,
  parsed: CronExpression,
  fieldMask: Partial<Record<keyof CronExpression, string>>
): CronTemplate {
  const base = toCronString(parsed);
  const parts = base.split(' ');
  const keys: (keyof CronExpression)[] = [
    'minute',
    'hour',
    'dayOfMonth',
    'month',
    'dayOfWeek',
  ];
  keys.forEach((key, i) => {
    if (fieldMask[key]) {
      parts[i] = `{{${fieldMask[key]}}}`;
    }
  });
  const expression = parts.join(' ');
  return createTemplate(name, description, expression);
}
