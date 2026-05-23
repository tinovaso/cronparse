import { compareCron, isSupersetOf, isSubsetOf } from './comparator';

describe('compareCron', () => {
  it('detects equal expressions', () => {
    const result = compareCron('0 * * * *', '0 * * * *');
    expect(result.isEqual).toBe(true);
    expect(result.overlapCount).toBeGreaterThan(0);
    expect(result.onlyInA).toHaveLength(0);
    expect(result.onlyInB).toHaveLength(0);
  });

  it('detects non-equal expressions', () => {
    const result = compareCron('0 * * * *', '30 * * * *');
    expect(result.isEqual).toBe(false);
    expect(result.overlapCount).toBe(0);
    expect(result.onlyInA.length).toBeGreaterThan(0);
    expect(result.onlyInB.length).toBeGreaterThan(0);
  });

  it('detects superset relationship', () => {
    // every 30 min is superset of every hour at :00
    const result = compareCron('0/30 * * * *', '0 * * * *');
    expect(result.isSuperset).toBe(true);
    expect(result.isSubset).toBe(false);
    expect(result.overlapCount).toBeGreaterThan(0);
  });

  it('detects subset relationship', () => {
    const result = compareCron('0 * * * *', '0/30 * * * *');
    expect(result.isSubset).toBe(true);
    expect(result.isSuperset).toBe(false);
  });

  it('returns overlap count for partially overlapping expressions', () => {
    const result = compareCron('0 0-11 * * *', '0 6-17 * * *');
    expect(result.overlapCount).toBeGreaterThan(0);
    expect(result.onlyInA.length).toBeGreaterThan(0);
    expect(result.onlyInB.length).toBeGreaterThan(0);
    expect(result.isEqual).toBe(false);
  });
});

describe('isSupersetOf', () => {
  it('returns true when a fires more often than b', () => {
    expect(isSupersetOf('* * * * *', '0 * * * *')).toBe(true);
  });

  it('returns true for equal expressions', () => {
    expect(isSupersetOf('0 * * * *', '0 * * * *')).toBe(true);
  });

  it('returns false when a fires less often', () => {
    expect(isSupersetOf('0 * * * *', '* * * * *')).toBe(false);
  });
});

describe('isSubsetOf', () => {
  it('returns true when a fires less often than b', () => {
    expect(isSubsetOf('0 * * * *', '* * * * *')).toBe(true);
  });

  it('returns true for equal expressions', () => {
    expect(isSubsetOf('0 * * * *', '0 * * * *')).toBe(true);
  });

  it('returns false when a fires more often', () => {
    expect(isSubsetOf('* * * * *', '0 * * * *')).toBe(false);
  });
});
