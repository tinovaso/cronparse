import {
  flattenExpression,
  countFiringsPerWeek,
  avgFiringsPerDay,
  flatSchedulesEqual,
  flatDifference,
  flatIntersection,
} from './flattener';

describe('flattenExpression', () => {
  it('returns correct count for every-minute expression', () => {
    const flat = flattenExpression('* * * * *');
    // 7 days * 24 hours * 60 minutes = 10080
    expect(flat.length).toBe(10080);
  });

  it('returns a single entry for a specific time on a specific day', () => {
    // Every Monday at 09:30
    const flat = flattenExpression('30 9 * * 1');
    expect(flat.length).toBe(1);
    // Monday = dow 1, 9*60+30 = 570 => 1*1440 + 570 = 2010
    expect(flat[0]).toBe(2010);
  });

  it('returns sorted values', () => {
    const flat = flattenExpression('0 0,12 * * *');
    for (let i = 1; i < flat.length; i++) {
      expect(flat[i]).toBeGreaterThan(flat[i - 1]);
    }
  });

  it('handles step expressions', () => {
    const flat = flattenExpression('*/30 * * * *');
    // 2 per hour * 24 * 7 = 336
    expect(flat.length).toBe(336);
  });
});

describe('countFiringsPerWeek', () => {
  it('counts daily midnight correctly', () => {
    expect(countFiringsPerWeek('0 0 * * *')).toBe(7);
  });

  it('counts hourly correctly', () => {
    expect(countFiringsPerWeek('0 * * * *')).toBe(168);
  });
});

describe('avgFiringsPerDay', () => {
  it('returns 1 for daily schedule', () => {
    expect(avgFiringsPerDay('0 0 * * *')).toBeCloseTo(1);
  });

  it('returns 24 for hourly schedule', () => {
    expect(avgFiringsPerDay('0 * * * *')).toBeCloseTo(24);
  });
});

describe('flatSchedulesEqual', () => {
  it('returns true for identical expressions', () => {
    const a = flattenExpression('0 9 * * 1-5');
    const b = flattenExpression('0 9 * * 1-5');
    expect(flatSchedulesEqual(a, b)).toBe(true);
  });

  it('returns false for different expressions', () => {
    const a = flattenExpression('0 9 * * 1');
    const b = flattenExpression('0 9 * * 2');
    expect(flatSchedulesEqual(a, b)).toBe(false);
  });
});

describe('flatDifference', () => {
  it('returns entries only in a', () => {
    const a = flattenExpression('0 9 * * 1,2');
    const b = flattenExpression('0 9 * * 1');
    const diff = flatDifference(a, b);
    expect(diff.length).toBe(1);
  });
});

describe('flatIntersection', () => {
  it('returns common entries', () => {
    const a = flattenExpression('0 9 * * 1,2');
    const b = flattenExpression('0 9 * * 2,3');
    const inter = flatIntersection(a, b);
    expect(inter.length).toBe(1);
  });
});
