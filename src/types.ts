/**
 * Represents a fully parsed cron expression with expanded value sets.
 */
export interface CronExpression {
  /** Raw cron string, e.g. "0 9 * * 1-5" */
  raw: string;
  /** Expanded list of matching minutes (0–59) */
  minute: number[];
  /** Expanded list of matching hours (0–23) */
  hour: number[];
  /** Expanded list of matching days of month (1–31) */
  dayOfMonth: number[];
  /** Expanded list of matching months (1–12) */
  month: number[];
  /** Expanded list of matching days of week (0–6, 0=Sunday) */
  dayOfWeek: number[];
}

/**
 * Field range constraints used during parsing and validation.
 */
export interface FieldRange {
  min: number;
  max: number;
  name: string;
}

export const FIELD_RANGES: Record<keyof Omit<CronExpression, 'raw'>, FieldRange> = {
  minute:     { min: 0,  max: 59, name: 'minute' },
  hour:       { min: 0,  max: 23, name: 'hour' },
  dayOfMonth: { min: 1,  max: 31, name: 'day of month' },
  month:      { min: 1,  max: 12, name: 'month' },
  dayOfWeek:  { min: 0,  max: 6,  name: 'day of week' },
};
