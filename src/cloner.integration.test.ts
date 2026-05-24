import { cloneCron, cloneMany, cloneExpression } from './cloner';
import { parseCron } from './parser';
import { toCronString } from './formatter';
import { expandCron } from './expander';

describe('cloner integration', () => {
  it('cloned expression expands identically to original', () => {
    const original = '*/15 9-17 * * 1-5';
    const cloned = cloneCron(original);
    expect(expandCron(cloned)).toEqual(expandCron(original));
  });

  it('cloneMany produces independently parseable expressions', () => {
    const clones = cloneMany('0 6,12,18 * * *', 3);
    for (const c of clones) {
      expect(() => parseCron(c)).not.toThrow();
    }
  });

  it('cloneExpression round-trips through toCronString', () => {
    const expr = parseCron('30 8 1 1 *');
    const clone = cloneExpression(expr);
    expect(toCronString(clone)).toBe(toCronString(expr));
  });

  it('cloned expression does not share references with original', () => {
    const expr = parseCron('0 0 * * 0');
    const clone = cloneExpression(expr);
    const originalStr = toCronString(expr);
    (clone.dayOfWeek as any).raw = '6';
    expect(toCronString(expr)).toBe(originalStr);
  });

  it('cloneMany with count 1 returns single-element array', () => {
    const result = cloneMany('* * * * *', 1);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('* * * * *');
  });
});
