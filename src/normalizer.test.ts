import { simplifySteps, sortField, deduplicateField, normalizeField, normalizeCron, areNormalizedEqual } from './normalizer';

describe('simplifySteps', () => {
  it('converts */1 to *', () => {
    expect(simplifySteps('*/1', 60)).toBe('*');
  });

  it('converts 0/1 to *', () => {
    expect(simplifySteps('0/1', 60)).toBe('*');
  });

  it('leaves */5 unchanged', () => {
    expect(simplifySteps('*/5', 60)).toBe('*/5');
  });

  it('converts step >= max to single 0', () => {
    expect(simplifySteps('*/60', 60)).toBe('0');
  });

  it('leaves plain values unchanged', () => {
    expect(simplifySteps('15', 60)).toBe('15');
  });
});

describe('sortField', () => {
  it('sorts numeric values', () => {
    expect(sortField('30,5,15')).toBe('5,15,30');
  });

  it('returns unchanged if no comma', () => {
    expect(sortField('*')).toBe('*');
  });

  it('handles single value list', () => {
    expect(sortField('10')).toBe('10');
  });
});

describe('deduplicateField', () => {
  it('removes duplicate values', () => {
    expect(deduplicateField('5,10,5,10')).toBe('5,10');
  });

  it('returns unchanged if no duplicates', () => {
    expect(deduplicateField('1,2,3')).toBe('1,2,3');
  });

  it('returns unchanged if no comma', () => {
    expect(deduplicateField('*')).toBe('*');
  });
});

describe('normalizeField', () => {
  it('normalizes a field with step, duplicates, and unsorted values', () => {
    const result = normalizeField('30,5,30,15', 60);
    expect(result).toBe('5,15,30');
  });

  it('simplifies */1 to *', () => {
    expect(normalizeField('*/1', 60)).toBe('*');
  });
});

describe('normalizeCron', () => {
  it('normalizes a simple expression', () => {
    expect(normalizeCron('0 0 * * *')).toBe('0 0 * * *');
  });

  it('normalizes */1 steps to wildcards', () => {
    expect(normalizeCron('*/1 */1 * * *')).toBe('* * * * *');
  });

  it('sorts list values in fields', () => {
    const result = normalizeCron('30,0,15 * * * *');
    expect(result).toBe('0,15,30 * * * *');
  });
});

describe('areNormalizedEqual', () => {
  it('returns true for equivalent expressions', () => {
    expect(areNormalizedEqual('*/1 0 * * *', '* 0 * * *')).toBe(true);
  });

  it('returns false for different expressions', () => {
    expect(areNormalizedEqual('0 0 * * *', '0 1 * * *')).toBe(false);
  });

  it('returns true for same unsorted and sorted lists', () => {
    expect(areNormalizedEqual('30,0 * * * *', '0,30 * * * *')).toBe(true);
  });
});
