import { optimizeField, optimizeCron, canBeOptimized } from './optimizer';

describe('optimizeField', () => {
  it('returns * when all values in range are present', () => {
    const all = Array.from({ length: 60 }, (_, i) => i);
    expect(optimizeField(all, 0, 59)).toBe('*');
  });

  it('returns */n for uniform step starting at min', () => {
    expect(optimizeField([0, 15, 30, 45], 0, 59)).toBe('*/15');
    expect(optimizeField([0, 6, 12, 18], 0, 23)).toBe('*/6');
  });

  it('returns range for contiguous values', () => {
    expect(optimizeField([1, 2, 3, 4, 5], 0, 59)).toBe('1-5');
  });

  it('returns comma-separated for non-uniform values', () => {
    expect(optimizeField([1, 3, 7], 0, 59)).toBe('1,3,7');
  });

  it('returns * for empty values', () => {
    expect(optimizeField([], 0, 59)).toBe('*');
  });

  it('returns single value as-is', () => {
    expect(optimizeField([5], 0, 59)).toBe('5');
  });
});

describe('optimizeCron', () => {
  it('keeps * fields as *', () => {
    expect(optimizeCron('* * * * *')).toBe('* * * * *');
  });

  it('simplifies step expression', () => {
    const result = optimizeCron('0,15,30,45 * * * *');
    expect(result).toBe('*/15 * * * *');
  });

  it('simplifies range expression', () => {
    const result = optimizeCron('1,2,3,4,5 * * * *');
    expect(result).toBe('1-5 * * * *');
  });

  it('handles already optimized expressions', () => {
    expect(optimizeCron('0 9 * * 1-5')).toBe('0 9 * * 1-5');
  });

  it('optimizes multiple fields', () => {
    const result = optimizeCron('0,30 0,6,12,18 * * *');
    expect(result).toBe('0,30 */6 * * *');
  });
});

describe('canBeOptimized', () => {
  it('returns true when expression can be simplified', () => {
    expect(canBeOptimized('0,15,30,45 * * * *')).toBe(true);
  });

  it('returns false when expression is already optimal', () => {
    expect(canBeOptimized('*/15 * * * *')).toBe(false);
  });

  it('returns false for wildcard-only expression', () => {
    expect(canBeOptimized('* * * * *')).toBe(false);
  });

  it('returns false for invalid expression gracefully', () => {
    expect(canBeOptimized('invalid expression')).toBe(false);
  });
});
