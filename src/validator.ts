import { CronField, CronExpression } from './types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const FIELD_RANGES: Record<CronField, { min: number; max: number; name: string }> = {
  minute:     { min: 0, max: 59, name: 'Minute' },
  hour:       { min: 0, max: 23, name: 'Hour' },
  dayOfMonth: { min: 1, max: 31, name: 'Day of month' },
  month:      { min: 1, max: 12, name: 'Month' },
  dayOfWeek:  { min: 0, max: 7,  name: 'Day of week' },
};

const MONTH_ALIASES: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

const DOW_ALIASES: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
};

function resolveAlias(value: string, field: CronField): string {
  const lower = value.toLowerCase();
  if (field === 'month' && MONTH_ALIASES[lower] !== undefined) {
    return String(MONTH_ALIASES[lower]);
  }
  if (field === 'dayOfWeek' && DOW_ALIASES[lower] !== undefined) {
    return String(DOW_ALIASES[lower]);
  }
  return value;
}

function validateSingleValue(raw: string, field: CronField): string | null {
  const value = resolveAlias(raw, field);
  const num = Number(value);
  const { min, max, name } = FIELD_RANGES[field];
  if (!Number.isInteger(num)) return `${name}: '${raw}' is not a valid integer`;
  if (num < min || num > max) return `${name}: ${num} out of range [${min}-${max}]`;
  return null;
}

function validateSegment(segment: string, field: CronField): string | null {
  if (segment === '*') return null;

  // Step values: */n or range/n
  if (segment.includes('/')) {
    const [base, step] = segment.split('/');
    const stepNum = Number(step);
    if (!Number.isInteger(stepNum) || stepNum < 1) {
      return `${FIELD_RANGES[field].name}: invalid step '${step}'`;
    }
    if (base !== '*') {
      const rangeErr = validateSegment(base, field);
      if (rangeErr) return rangeErr;
    }
    return null;
  }

  // Range: a-b
  if (segment.includes('-')) {
    const [start, end] = segment.split('-');
    const startErr = validateSingleValue(start, field);
    if (startErr) return startErr;
    const endErr = validateSingleValue(end, field);
    if (endErr) return endErr;
    const s = Number(resolveAlias(start, field));
    const e = Number(resolveAlias(end, field));
    if (s >= e) return `${FIELD_RANGES[field].name}: range start ${s} must be less than end ${e}`;
    return null;
  }

  return validateSingleValue(segment, field);
}

export function validateExpression(expression: string): ValidationResult {
  const errors: string[] = [];
  const parts = expression.trim().split(/\s+/);

  if (parts.length !== 5) {
    return {
      valid: false,
      errors: [`Expected 5 fields, got ${parts.length}`],
    };
  }

  const fields: CronField[] = ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];

  parts.forEach((part, i) => {
    const field = fields[i];
    const segments = part.split(',');
    segments.forEach((seg) => {
      const err = validateSegment(seg, field);
      if (err) errors.push(err);
    });
  });

  return { valid: errors.length === 0, errors };
}
