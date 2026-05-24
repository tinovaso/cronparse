import { parseCron } from './parser';
import { describeField } from './humanize';
import { CronExpression } from './types';

export interface FieldAnnotation {
  field: string;
  raw: string;
  description: string;
  isWildcard: boolean;
  isStep: boolean;
  isRange: boolean;
  isList: boolean;
}

export interface CronAnnotation {
  expression: string;
  fields: FieldAnnotation[];
  summary: string;
  warnings: string[];
}

const FIELD_NAMES = ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];

export function annotateField(name: string, raw: string): FieldAnnotation {
  return {
    field: name,
    raw,
    description: describeField(name as keyof CronExpression, raw),
    isWildcard: raw === '*',
    isStep: raw.includes('/'),
    isRange: raw.includes('-') && !raw.includes('/'),
    isList: raw.includes(','),
  };
}

export function annotate(expression: string): CronAnnotation {
  const parsed = parseCron(expression);
  const parts = expression.trim().split(/\s+/);
  const warnings: string[] = [];

  if (parsed.dayOfMonth !== '*' && parsed.dayOfWeek !== '*') {
    warnings.push('Both day-of-month and day-of-week are specified; behavior may vary by system.');
  }

  const fields = FIELD_NAMES.map((name, i) =>
    annotateField(name, parts[i] ?? '*')
  );

  const summary = fields
    .filter(f => !f.isWildcard)
    .map(f => f.description)
    .join(', ') || 'Runs every minute';

  return { expression, fields, summary, warnings };
}
