import { parseCron, humanize, getNextDate, getNextDates } from './index';
import type { CronExpression } from './index';

describe('public API integration', () => {
  it('exports parseCron and returns a valid CronExpression', () => {
    const cron: CronExpression = parseCron('0 9 * * 1-5');
    expect(cron.raw).toBe('0 9 * * 1-5');
    expect(cron.minute).toEqual([0]);
    expect(cron.hour).toEqual([9]);
    expect(cron.dayOfWeek).toEqual([1, 2, 3, 4, 5]);
  });

  it('exports humanize and returns a non-empty string', () => {
    const description = humanize('0 9 * * 1-5');
    expect(typeof description).toBe('string');
    expect(description.length).toBeGreaterThan(0);
  });

  it('exports getNextDate and returns a future Date', () => {
    const from = new Date();
    const next = getNextDate('* * * * *', from);
    expect(next.getTime()).toBeGreaterThan(from.getTime());
  });

  it('exports getNextDates and returns an array of Dates', () => {
    const from = new Date('2024-06-01T00:00:00Z');
    const dates = getNextDates('0 0 * * *', 3, from);
    expect(Array.isArray(dates)).toBe(true);
    expect(dates).toHaveLength(3);
    dates.forEach(d => expect(d).toBeInstanceOf(Date));
  });

  it('round-trips: next date matches parsed expression fields', () => {
    const expr = '30 14 * * *';
    const cron = parseCron(expr);
    const next = getNextDate(expr, new Date('2024-03-10T15:00:00Z'));
    expect(cron.minute).toContain(next.getMinutes());
    expect(cron.hour).toContain(next.getHours());
  });
});
