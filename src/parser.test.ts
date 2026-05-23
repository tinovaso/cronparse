import { parseCron } from './parser';

describe('parseCron', () => {
  describe('valid expressions', () => {
    it('parses a standard cron expression', () => {
      const result = parseCron('0 12 * * 1');
      expect(result.valid).toBe(true);
      expect(result.fields).toEqual({
        minute: '0',
        hour: '12',
        day: '*',
        month: '*',
        weekday: '1',
      });
    });

    it('accepts wildcard for all fields', () => {
      const result = parseCron('* * * * *');
      expect(result.valid).toBe(true);
    });

    it('accepts step values', () => {
      expect(parseCron('*/5 * * * *').valid).toBe(true);
      expect(parseCron('0 */2 * * *').valid).toBe(true);
    });

    it('accepts range values', () => {
      expect(parseCron('0 9-17 * * 1-5').valid).toBe(true);
    });

    it('accepts list values', () => {
      expect(parseCron('0 8,12,18 * * *').valid).toBe(true);
    });

    it('accepts range with step', () => {
      expect(parseCron('0 1-23/2 * * *').valid).toBe(true);
    });
  });

  describe('invalid expressions', () => {
    it('rejects empty string', () => {
      const result = parseCron('');
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/non-empty string/);
    });

    it('rejects wrong number of fields', () => {
      const result = parseCron('* * * *');
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/Expected 5 fields/);
    });

    it('rejects out-of-range minute', () => {
      const result = parseCron('60 * * * *');
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/minute/);
    });

    it('rejects out-of-range hour', () => {
      expect(parseCron('0 24 * * *').valid).toBe(false);
    });

    it('rejects invalid range (low > high)', () => {
      expect(parseCron('0 17-9 * * *').valid).toBe(false);
    });

    it('rejects step of zero', () => {
      expect(parseCron('*/0 * * * *').valid).toBe(false);
    });

    it('rejects non-numeric value', () => {
      expect(parseCron('abc * * * *').valid).toBe(false);
    });
  });
});
