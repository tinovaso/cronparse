import { getNextDate, getNextDates } from './scheduler';

describe('getNextDate', () => {
  it('returns the next matching minute for a simple expression', () => {
    // Every minute
    const from = new Date('2024-01-15T10:30:00Z');
    const next = getNextDate('* * * * *', from);
    expect(next.getMinutes()).toBe(31);
    expect(next.getHours()).toBe(10);
  });

  it('matches a specific hour and minute', () => {
    const from = new Date('2024-01-15T08:00:00Z');
    const next = getNextDate('0 9 * * *', from);
    expect(next.getHours()).toBe(9);
    expect(next.getMinutes()).toBe(0);
  });

  it('advances to the next day when time has passed', () => {
    const from = new Date('2024-01-15T09:01:00Z');
    const next = getNextDate('0 9 * * *', from);
    expect(next.getDate()).toBe(16);
    expect(next.getHours()).toBe(9);
  });

  it('respects day-of-week constraint', () => {
    // 0 = Sunday; find next Sunday 9:00
    const from = new Date('2024-01-15T10:00:00Z'); // Monday
    const next = getNextDate('0 9 * * 0', from);
    expect(next.getDay()).toBe(0);
    expect(next.getHours()).toBe(9);
  });

  it('throws for an expression with no match within a year', () => {
    // Feb 30 does not exist
    expect(() => getNextDate('0 0 30 2 *', new Date())).toThrow();
  });
});

describe('getNextDates', () => {
  it('returns the correct number of dates', () => {
    const from = new Date('2024-01-15T00:00:00Z');
    const dates = getNextDates('0 * * * *', 5, from);
    expect(dates).toHaveLength(5);
  });

  it('returns strictly increasing dates', () => {
    const from = new Date('2024-01-15T00:00:00Z');
    const dates = getNextDates('*/15 * * * *', 4, from);
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i].getTime()).toBeGreaterThan(dates[i - 1].getTime());
    }
  });
});
