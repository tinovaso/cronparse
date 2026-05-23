import { expandField, expandCron } from './expander';
import { CronField, ParsedCron } from './types';

describe('expandField', () => {
  it('expands wildcard to full range', () => {
    const field: CronField = { type: 'wildcard', value: '*' };
    expect(expandField(field, 0, 5)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('expands a single value', () => {
    const field: CronField = { type: 'value', value: 3 };
    expect(expandField(field, 0, 59)).toEqual([3]);
  });

  it('expands a range', () => {
    const field: CronField = { type: 'range', value: [2, 5] };
    expect(expandField(field, 0, 59)).toEqual([2, 3, 4, 5]);
  });

  it('expands a step with wildcard base', () => {
    const field: CronField = { type: 'step', value: { base: '*', step: 15 } };
    expect(expandField(field, 0, 59)).toEqual([0, 15, 30, 45]);
  });

  it('expands a step with numeric base', () => {
    const field: CronField = { type: 'step', value: { base: 10, step: 10 } };
    expect(expandField(field, 0, 59)).toEqual([10, 20, 30, 40, 50]);
  });

  it('expands a list of values', () => {
    const field: CronField = {
      type: 'list',
      value: [
        { type: 'value', value: 1 },
        { type: 'value', value: 3 },
        { type: 'value', value: 5 },
      ] as CronField[],
    };
    expect(expandField(field, 0, 59)).toEqual([1, 3, 5]);
  });

  it('deduplicates overlapping list values', () => {
    const field: CronField = {
      type: 'list',
      value: [
        { type: 'value', value: 2 },
        { type: 'range', value: [1, 3] },
      ] as CronField[],
    };
    expect(expandField(field, 0, 59)).toEqual([1, 2, 3]);
  });
});

describe('expandCron', () => {
  it('expands all fields of a parsed cron', () => {
    const parsed: ParsedCron = {
      minute: { type: 'value', value: 30 },
      hour: { type: 'value', value: 9 },
      dayOfMonth: { type: 'wildcard', value: '*' },
      month: { type: 'wildcard', value: '*' },
      dayOfWeek: { type: 'value', value: 1 },
    };
    const result = expandCron(parsed);
    expect(result.minutes).toEqual([30]);
    expect(result.hours).toEqual([9]);
    expect(result.daysOfMonth).toHaveLength(31);
    expect(result.months).toHaveLength(12);
    expect(result.daysOfWeek).toEqual([1]);
  });
});
