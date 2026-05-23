import { CronField, ParsedCron } from './types';

/**
 * Expands a single cron field into an array of matching numeric values.
 */
export function expandField(field: CronField, min: number, max: number): number[] {
  if (field.type === 'wildcard') {
    return range(min, max);
  }

  if (field.type === 'value') {
    return [field.value as number];
  }

  if (field.type === 'range') {
    const [start, end] = field.value as [number, number];
    return range(start, end);
  }

  if (field.type === 'step') {
    const { base, step } = field.value as { base: number | '*'; step: number };
    const start = base === '*' ? min : (base as number);
    const result: number[] = [];
    for (let i = start; i <= max; i += step) {
      result.push(i);
    }
    return result;
  }

  if (field.type === 'list') {
    const values = field.value as CronField[];
    const expanded = values.flatMap((v) => expandField(v, min, max));
    return [...new Set(expanded)].sort((a, b) => a - b);
  }

  return [];
}

function range(start: number, end: number): number[] {
  const result: number[] = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
}

export interface ExpandedCron {
  minutes: number[];
  hours: number[];
  daysOfMonth: number[];
  months: number[];
  daysOfWeek: number[];
}

/**
 * Expands all fields of a parsed cron expression into arrays of matching values.
 */
export function expandCron(parsed: ParsedCron): ExpandedCron {
  return {
    minutes: expandField(parsed.minute, 0, 59),
    hours: expandField(parsed.hour, 0, 23),
    daysOfMonth: expandField(parsed.dayOfMonth, 1, 31),
    months: expandField(parsed.month, 1, 12),
    daysOfWeek: expandField(parsed.dayOfWeek, 0, 6),
  };
}
