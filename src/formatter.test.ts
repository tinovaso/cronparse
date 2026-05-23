import { toCronString, formatExpression, normalizeCronString } from './formatter';
import { CronExpression } from './types';

const sampleExpr: CronExpression = {
  minute: '*/5',
  hour: '9-17',
  dayOfMonth: '*',
  month: '1,6',
  dayOfWeek: '1-5',
};

describe('toCronString', () => {
  it('should reconstruct the cron string from an expression object', () => {
    expect(toCronString(sampleExpr)).toBe('*/5 9-17 * 1,6 1-5');
  });

  it('should handle wildcard-only expressions', () => {
    const expr: CronExpression = {
      minute: '*',
      hour: '*',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '*',
    };
    expect(toCronString(expr)).toBe('* * * * *');
  });
});

describe('formatExpression', () => {
  it('should default to cron style', () => {
    expect(formatExpression(sampleExpr)).toBe('*/5 9-17 * 1,6 1-5');
  });

  it('should format as array', () => {
    const result = formatExpression(sampleExpr, 'array');
    expect(JSON.parse(result)).toEqual(['*/5', '9-17', '*', '1,6', '1-5']);
  });

  it('should format as json', () => {
    const result = formatExpression(sampleExpr, 'json');
    const parsed = JSON.parse(result);
    expect(parsed.minute).toBe('*/5');
    expect(parsed.dayOfWeek).toBe('1-5');
  });

  it('should format as object string', () => {
    const result = formatExpression(sampleExpr, 'object');
    expect(result).toContain("minute: '*/5'");
    expect(result).toContain("dayOfWeek: '1-5'");
  });

  it('should throw on unknown style', () => {
    expect(() => formatExpression(sampleExpr, 'xml' as any)).toThrow('Unknown format style');
  });
});

describe('normalizeCronString', () => {
  it('should expand @daily alias', () => {
    expect(normalizeCronString('@daily')).toBe('0 0 * * *');
  });

  it('should expand @hourly alias', () => {
    expect(normalizeCronString('@hourly')).toBe('0 * * * *');
  });

  it('should expand @yearly and @annually to the same value', () => {
    expect(normalizeCronString('@yearly')).toBe(normalizeCronString('@annually'));
  });

  it('should collapse extra whitespace', () => {
    expect(normalizeCronString('  */5   *   *   *   * ')).toBe('*/5 * * * *');
  });

  it('should be case-insensitive for aliases', () => {
    expect(normalizeCronString('@Daily')).toBe('0 0 * * *');
  });
});
