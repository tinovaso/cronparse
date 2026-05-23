import { humanize } from './humanize';

describe('humanize', () => {
  it('describes a every-minute expression', () => {
    expect(humanize('* * * * *')).toBe('every minute');
  });

  it('describes a specific minute and hour', () => {
    expect(humanize('30 9 * * *')).toBe('at minute 30 past at hour 9');
  });

  it('describes midnight', () => {
    expect(humanize('0 0 * * *')).toBe('at minute 0 past at hour 0');
  });

  it('describes a step expression', () => {
    expect(humanize('*/15 * * * *')).toBe('every 15 minutes');
  });

  it('describes every minute of a specific hour', () => {
    expect(humanize('* 6 * * *')).toBe('every minute of at hour 6');
  });

  it('describes a specific day of month', () => {
    expect(humanize('0 12 15 * *')).toBe('at minute 0 past at hour 12, on at day of month 15');
  });

  it('describes a specific month by name', () => {
    expect(humanize('0 0 1 1 *')).toBe(
      'at minute 0 past at hour 0, on at day of month 1, in at month January'
    );
  });

  it('describes a specific weekday by name', () => {
    expect(humanize('0 9 * * 1')).toBe(
      'at minute 0 past at hour 9, on at weekday Monday'
    );
  });

  it('describes a range of weekdays', () => {
    expect(humanize('0 8 * * 1-5')).toBe(
      'at minute 0 past at hour 8, on from Monday to Friday'
    );
  });

  it('describes a comma-separated list of months', () => {
    expect(humanize('0 0 1 3,6,9,12 *')).toBe(
      'at minute 0 past at hour 0, on at day of month 1, in at month March, June, September and December'
    );
  });

  it('throws on invalid expression', () => {
    expect(() => humanize('invalid')).toThrow();
  });
});
