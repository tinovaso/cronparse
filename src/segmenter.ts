import { ParsedCron } from './types';
import { parseCron } from './parser';
import { expandField } from './expander';

export interface CronSegment {
  field: 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek';
  raw: string;
  values: number[];
  isWildcard: boolean;
  isStep: boolean;
  isRange: boolean;
  isList: boolean;
}

export interface SegmentedCron {
  expression: string;
  segments: CronSegment[];
}

const FIELD_RANGES: Record<CronSegment['field'], [number, number]> = {
  minute: [0, 59],
  hour: [0, 23],
  dayOfMonth: [1, 31],
  month: [1, 12],
  dayOfWeek: [0, 6],
};

const FIELD_ORDER: CronSegment['field'][] = [
  'minute',
  'hour',
  'dayOfMonth',
  'month',
  'dayOfWeek',
];

function classifySegment(raw: string): Pick<CronSegment, 'isWildcard' | 'isStep' | 'isRange' | 'isList'> {
  return {
    isWildcard: raw === '*',
    isStep: raw.includes('/'),
    isRange: raw.includes('-') && !raw.includes('/'),
    isList: raw.includes(','),
  };
}

export function segmentCron(expression: string): SegmentedCron {
  const parsed: ParsedCron = parseCron(expression);
  const parts = expression.trim().split(/\s+/);

  const segments: CronSegment[] = FIELD_ORDER.map((field, i) => {
    const raw = parts[i];
    const [min, max] = FIELD_RANGES[field];
    const values = expandField(raw, min, max);
    const classification = classifySegment(raw);

    return {
      field,
      raw,
      values,
      ...classification,
    };
  });

  return { expression, segments };
}

export function getSegment(expression: string, field: CronSegment['field']): CronSegment {
  const { segments } = segmentCron(expression);
  const segment = segments.find((s) => s.field === field);
  if (!segment) {
    throw new Error(`Field "${field}" not found in expression`);
  }
  return segment;
}

export function hasWildcardField(expression: string, field: CronSegment['field']): boolean {
  return getSegment(expression, field).isWildcard;
}
