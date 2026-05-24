import { intersectMinuteSets, toMinuteOfWeekSet, hasIntersection, intersectCron } from './intersector';
import { parseCron } from './parser';

describe('intersectMinuteSets', () => {
  it('returns common elements', () => {
    const a = new Set([1, 2, 3, 4]);
    const b = new Set([3, 4, 5, 6]);
    const result = intersectMinuteSets(a, b);
    expect(result).toEqual(new Set([3, 4]));
  });

  it('returns empty set when no overlap', () => {
    const a = new Set([1, 2]);
    const b = new Set([3, 4]);
    expect(intersectMinuteSets(a, b).size).toBe(0);
  });
});

describe('toMinuteOfWeekSet', () => {
  it('generates correct minute-of-week values for a simple expression', () => {
    const parsed = parseCron('0 9 * * 1')!;
    const set = toMinuteOfWeekSet(parsed);
    // Monday (1) * 1440 + 9 * 60 + 0 = 1440 + 540 = 1980
    expect(set.has(1980)).toBe(true);
  });

  it('includes all combinations for wildcards', () => {
    const parsed = parseCron('0 * * * *')!;
    const set = toMinuteOfWeekSet(parsed);
    // Should have 7 days * 24 hours = 168 entries
    expect(set.size).toBe(168);
  });
});

describe('hasIntersection', () => {
  it('returns true for identical expressions', () => {
    expect(hasIntersection('0 9 * * 1', '0 9 * * 1')).toBe(true);
  });

  it('returns true when schedules overlap', () => {
    // Every hour vs every day at 9am — they share 9:00 every day
    expect(hasIntersection('0 * * * *', '0 9 * * *')).toBe(true);
  });

  it('returns false for non-overlapping schedules', () => {
    // Monday at 9 vs Tuesday at 9
    expect(hasIntersection('0 9 * * 1', '0 9 * * 2')).toBe(false);
  });
});

describe('intersectCron', () => {
  it('returns overlapping true and correct count for matching expressions', () => {
    const result = intersectCron('0 9 * * *', '0 9 * * 1');
    expect(result.overlapping).toBe(true);
    expect(result.sharedCount).toBe(1);
  });

  it('returns overlapping false for disjoint expressions', () => {
    const result = intersectCron('0 9 * * 1', '0 10 * * 1');
    expect(result.overlapping).toBe(false);
    expect(result.sharedCount).toBe(0);
    expect(result.sample).toHaveLength(0);
  });

  it('sample contains at most 5 entries', () => {
    const result = intersectCron('0 * * * *', '0 * * * *');
    expect(result.sample.length).toBeLessThanOrEqual(5);
    expect(result.sharedCount).toBe(168);
  });
});
