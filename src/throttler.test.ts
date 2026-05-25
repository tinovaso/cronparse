import { throttleCheck } from './throttler';

describe('throttleCheck', () => {
  it('allows expression within maxPerHour limit', () => {
    const result = throttleCheck('*/15 * * * *', { maxPerHour: 4 });
    expect(result.allowed).toBe(true);
  });

  it('blocks expression exceeding maxPerHour', () => {
    const result = throttleCheck('*/5 * * * *', { maxPerHour: 4 });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/times\/hour/);
    expect(result.suggestedExpression).toBeDefined();
  });

  it('allows expression within maxPerDay limit', () => {
    const result = throttleCheck('0 */6 * * *', { maxPerDay: 5 });
    expect(result.allowed).toBe(true);
  });

  it('blocks expression exceeding maxPerDay', () => {
    const result = throttleCheck('*/10 * * * *', { maxPerDay: 10 });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/times\/day/);
    expect(result.suggestedExpression).toBeDefined();
  });

  it('allows expression meeting minIntervalMinutes', () => {
    const result = throttleCheck('*/30 * * * *', { minIntervalMinutes: 30 });
    expect(result.allowed).toBe(true);
  });

  it('blocks expression violating minIntervalMinutes', () => {
    const result = throttleCheck('*/5 * * * *', { minIntervalMinutes: 10 });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/Minimum interval/);
    expect(result.suggestedExpression).toBe('*/10 * * * *');
  });

  it('allows hourly expression with combined limits', () => {
    const result = throttleCheck('0 * * * *', {
      maxPerHour: 1,
      maxPerDay: 24,
      minIntervalMinutes: 60,
    });
    expect(result.allowed).toBe(true);
  });

  it('returns suggestedExpression when blocking on maxPerHour', () => {
    const result = throttleCheck('* * * * *', { maxPerHour: 2 });
    expect(result.allowed).toBe(false);
    expect(result.suggestedExpression).toMatch(/^\*\//);
  });
});
