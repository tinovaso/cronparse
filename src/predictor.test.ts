import { predict, medianInterval, isUniformSchedule } from './predictor';

describe('medianInterval', () => {
  it('returns null for fewer than 2 dates', () => {
    expect(medianInterval([])).toBeNull();
    expect(medianInterval([new Date()])).toBeNull();
  });

  it('returns correct interval for evenly spaced dates', () => {
    const base = new Date('2024-01-01T00:00:00Z').getTime();
    const dates = [0, 1, 2, 3].map(i => new Date(base + i * 60_000));
    expect(medianInterval(dates)).toBe(60_000);
  });

  it('returns median for unevenly spaced dates', () => {
    const base = new Date('2024-01-01T00:00:00Z').getTime();
    const offsets = [0, 60_000, 180_000, 240_000];
    const dates = offsets.map(o => new Date(base + o));
    // intervals: 60000, 120000, 60000 -> sorted: 60000, 60000, 120000 -> median: 60000
    expect(medianInterval(dates)).toBe(60_000);
  });
});

describe('isUniformSchedule', () => {
  it('returns true for 0 or 1 dates', () => {
    expect(isUniformSchedule([])).toBe(true);
    expect(isUniformSchedule([new Date()])).toBe(true);
  });

  it('returns true for uniformly spaced dates', () => {
    const base = new Date('2024-01-01T00:00:00Z').getTime();
    const dates = [0, 1, 2, 3].map(i => new Date(base + i * 3600_000));
    expect(isUniformSchedule(dates)).toBe(true);
  });

  it('returns false for non-uniform dates', () => {
    const base = new Date('2024-01-01T00:00:00Z').getTime();
    const dates = [0, 60_000, 180_000].map(o => new Date(base + o));
    expect(isUniformSchedule(dates)).toBe(false);
  });
});

describe('predict', () => {
  it('throws for an invalid cron expression', () => {
    expect(() => predict('not-a-cron')).toThrow();
  });

  it('returns the correct number of next dates', () => {
    const result = predict('*/5 * * * *', 3, new Date('2024-06-01T00:00:00Z'));
    expect(result.nextDates).toHaveLength(3);
  });

  it('marks a uniform schedule correctly', () => {
    const result = predict('0 * * * *', 4, new Date('2024-06-01T00:00:00Z'));
    expect(result.isUniform).toBe(true);
    expect(result.intervalMs).toBe(3600_000);
  });

  it('includes the original expression in the result', () => {
    const expr = '0 9 * * 1';
    const result = predict(expr, 2, new Date('2024-06-01T00:00:00Z'));
    expect(result.expression).toBe(expr);
  });
});
