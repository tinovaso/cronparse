import { validateExpression } from './validator';

describe('validateExpression', () => {
  describe('valid expressions', () => {
    it('accepts a fully wildcarded expression', () => {
      expect(validateExpression('* * * * *').valid).toBe(true);
    });

    it('accepts a typical cron expression', () => {
      expect(validateExpression('0 9 * * 1').valid).toBe(true);
    });

    it('accepts step values', () => {
      expect(validateExpression('*/15 * * * *').valid).toBe(true);
    });

    it('accepts range values', () => {
      expect(validateExpression('0 9-17 * * 1-5').valid).toBe(true);
    });

    it('accepts comma-separated lists', () => {
      expect(validateExpression('0 8,12,18 * * *').valid).toBe(true);
    });

    it('accepts month name aliases', () => {
      expect(validateExpression('0 0 1 jan *').valid).toBe(true);
    });

    it('accepts day-of-week name aliases', () => {
      expect(validateExpression('0 9 * * mon').valid).toBe(true);
    });

    it('accepts range with step', () => {
      expect(validateExpression('0 0 1-15/2 * *').valid).toBe(true);
    });
  });

  describe('invalid expressions', () => {
    it('rejects expressions with wrong number of fields', () => {
      const result = validateExpression('* * * *');
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toMatch(/Expected 5 fields/);
    });

    it('rejects out-of-range minute', () => {
      const result = validateExpression('60 * * * *');
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toMatch(/Minute/);
    });

    it('rejects out-of-range hour', () => {
      const result = validateExpression('0 24 * * *');
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toMatch(/Hour/);
    });

    it('rejects invalid step value', () => {
      const result = validateExpression('*/0 * * * *');
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toMatch(/step/);
    });

    it('rejects inverted range', () => {
      const result = validateExpression('0 18-9 * * *');
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toMatch(/range start/);
    });

    it('rejects non-numeric values without alias', () => {
      const result = validateExpression('abc * * * *');
      expect(result.valid).toBe(false);
    });

    it('collects multiple errors', () => {
      const result = validateExpression('99 99 * * *');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    });
  });
});
