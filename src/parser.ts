/**
 * Parses a cron expression string into its component fields.
 * Supports standard 5-field cron format: minute hour day month weekday
 */

export interface CronFields {
  minute: string;
  hour: string;
  day: string;
  month: string;
  weekday: string;
}

export interface ParseResult {
  valid: boolean;
  fields?: CronFields;
  error?: string;
}

const FIELD_RANGES: Record<keyof CronFields, { min: number; max: number }> = {
  minute:  { min: 0, max: 59 },
  hour:    { min: 0, max: 23 },
  day:     { min: 1, max: 31 },
  month:   { min: 1, max: 12 },
  weekday: { min: 0, max:  7 },
};

function validateField(value: string, min: number, max: number): boolean {
  if (value === '*') return true;

  // Step values: */2 or 1-5/2
  const stepMatch = value.match(/^([^/]+)\/([0-9]+)$/);
  if (stepMatch) {
    const step = parseInt(stepMatch[2], 10);
    if (isNaN(step) || step < 1) return false;
    return stepMatch[1] === '*' || validateField(stepMatch[1], min, max);
  }

  // Range: 1-5
  const rangeMatch = value.match(/^([0-9]+)-([0-9]+)$/);
  if (rangeMatch) {
    const lo = parseInt(rangeMatch[1], 10);
    const hi = parseInt(rangeMatch[2], 10);
    return lo >= min && hi <= max && lo <= hi;
  }

  // List: 1,2,3
  if (value.includes(',')) {
    return value.split(',').every((v) => validateField(v.trim(), min, max));
  }

  // Single number
  const num = parseInt(value, 10);
  return !isNaN(num) && num >= min && num <= max;
}

export function parseCron(expression: string): ParseResult {
  if (!expression || typeof expression !== 'string') {
    return { valid: false, error: 'Expression must be a non-empty string.' };
  }

  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) {
    return { valid: false, error: `Expected 5 fields, got ${parts.length}.` };
  }

  const keys = Object.keys(FIELD_RANGES) as (keyof CronFields)[];
  const fields = {} as CronFields;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const { min, max } = FIELD_RANGES[key];
    if (!validateField(parts[i], min, max)) {
      return { valid: false, error: `Invalid value "${parts[i]}" for field "${key}".` };
    }
    fields[key] = parts[i];
  }

  return { valid: true, fields };
}
